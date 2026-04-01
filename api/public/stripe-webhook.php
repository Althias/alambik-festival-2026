<?php
/**
 * Webhook Stripe - Reçoit les événements de paiement
 * POST /api/stripe-webhook.php
 * 
 * Stripe envoie un webhook quand un paiement est confirmé
 * On enregistre alors l'inscription en base de données
 */

// Ne pas utiliser config.php pour éviter les headers CORS/JSON qui interfèrent avec le webhook
// Au lieu de cela, charger uniquement ce dont on a besoin

// Charger les variables d'environnement
function loadEnvForWebhook($filePath) {
    if (file_exists($filePath)) {
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) {
                continue;
            }
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

loadEnvForWebhook(__DIR__ . '/../config/.env');

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../services/email-service.php';

// Fonction de connexion DB (sans headers)
function getDBForWebhook() {
    try {
        $pdo = new PDO(
            'mysql:host=' . ($_ENV['DB_HOST'] ?? '') . ';dbname=' . ($_ENV['DB_NAME'] ?? '') . ';charset=utf8mb4',
            $_ENV['DB_USER'] ?? '',
            $_ENV['DB_PASS'] ?? '',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log('Webhook - Erreur DB: ' . $e->getMessage());
        http_response_code(500);
        exit();
    }
}

// Configuration Stripe
$stripe_secret_key = $_ENV['STRIPE_SECRET_KEY'] ?? '';
\Stripe\Stripe::setApiKey($stripe_secret_key);

// Clé secrète du webhook (pour vérifier que la requête vient bien de Stripe)
$endpoint_secret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '';

// Récupérer le contenu brut de la requête
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

$event = null;

try {
    // Vérifier la signature du webhook (si configurée ET si ce n'est pas "we_" qui est invalide)
    if (!empty($endpoint_secret) && starts_with($endpoint_secret, 'whsec_') && !empty($sig_header)) {
        error_log('Webhook Stripe: Vérification de la signature');
        $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
    } else {
        // Mode développement : accepter sans vérification
        if (!empty($endpoint_secret) && !starts_with($endpoint_secret, 'whsec_')) {
            error_log('Webhook Stripe: SECRET INVALIDE (doit commencer par whsec_) - Mode développement activé');
        } else {
            error_log('Webhook Stripe: Mode développement - pas de vérification de signature');
        }
        $event = json_decode($payload, true);
    }
    
    error_log('Webhook Stripe: Event reçu - Type: ' . ($event['type'] ?? 'inconnu'));
    
} catch(\UnexpectedValueException $e) {
    // Payload invalide
    error_log('Webhook Stripe ERREUR: Payload invalide - ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload']);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    // Signature invalide
    error_log('Webhook Stripe ERREUR: Signature invalide - ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid signature']);
    exit();
}

// Petite fonction helper
function starts_with($string, $prefix) {
    return substr($string, 0, strlen($prefix)) === $prefix;
}

// Traiter l'événement
switch ($event['type']) {
    case 'checkout.session.completed':
        $session = $event['data']['object'];
        
        error_log('Webhook Stripe: Session ID: ' . ($session['id'] ?? 'inconnu'));
        error_log('Webhook Stripe: Payment status: ' . ($session['payment_status'] ?? 'inconnu'));
        
        // Vérifier que le paiement est bien réussi
        if ($session['payment_status'] === 'paid') {
            // Récupérer les données de la session complète avec les line_items
            try {
                error_log('Webhook Stripe: Récupération de la session complète...');
                $full_session = \Stripe\Checkout\Session::retrieve([
                    'id' => $session['id'],
                    'expand' => ['line_items']
                ]);
                
                error_log('Webhook Stripe: Enregistrement de l\'inscription...');
                // Enregistrer l'inscription en base de données
                enregistrerInscription($session, $full_session);
                
                error_log('Webhook Stripe: Inscription enregistrée avec succès !');
                
            } catch (Exception $e) {
                error_log('Webhook Stripe ERREUR: ' . $e->getMessage());
                error_log('Webhook Stripe ERREUR Stack: ' . $e->getTraceAsString());
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
                exit();
            }
        }
        break;
    
    case 'payment_intent.payment_failed':
        // Paiement échoué - on peut logger ou notifier
        $paymentIntent = $event['data']['object'];
        error_log('Paiement échoué: ' . $paymentIntent['id']);
        break;
    
    default:
        // Événement non géré
        error_log('Événement Stripe reçu: ' . $event['type']);
}

http_response_code(200);

/**
 * Enregistrer l'inscription dans la base de données
 */
function enregistrerInscription($session, $full_session) {
    $pdo = getDBForWebhook();
    
    // Données de base
    $stripe_session_id = $session['id'];
    $stripe_payment_intent = $session['payment_intent'] ?? '';
    
    // Récupérer l'ID de l'inscription depuis metadata
    $metadata = $session['metadata'] ?? [];
    $inscription_id = $metadata['inscription_id'] ?? null;
    
    if (!$inscription_id) {
        throw new Exception("ID d'inscription manquant dans les metadata");
    }
    
    try {
        $pdo->beginTransaction();
        
        // Mettre à jour l'inscription avec les infos Stripe et passer le statut à 'paid'
        $stmt = $pdo->prepare("
            UPDATE inscriptions 
            SET stripe_session_id = ?,
                stripe_payment_intent = ?,
                payment_status = 'paid'
            WHERE id = ?
        ");
        
        $stmt->execute([
            $stripe_session_id,
            $stripe_payment_intent,
            $inscription_id
        ]);
        
        // Vérifier que l'inscription existe
        if ($stmt->rowCount() === 0) {
            throw new Exception("Inscription ID $inscription_id introuvable");
        }
        
        // Récupérer les infos de l'inscription pour l'email
        $stmt = $pdo->prepare("SELECT * FROM inscriptions WHERE id = ?");
        $stmt->execute([$inscription_id]);
        $inscription = $stmt->fetch();
        
        $pdo->commit();
        
        // Logger le succès
        error_log("Inscription mise à jour avec succès: ID $inscription_id, Email: {$inscription['email']}, Montant: {$inscription['montant_total']}€");
        
        // Envoyer l'email de confirmation
        try {
            // Récupérer les billets pour l'email
            $stmt = $pdo->prepare("SELECT * FROM billets_details WHERE inscription_id = ?");
            $stmt->execute([$inscription_id]);
            $billets = $stmt->fetchAll();
            
            // Formater les données pour l'email
            $billetsDetails = [];
            foreach ($billets as $billet) {
                $billetsDetails[] = [
                    'type' => $billet['type_billet'],
                    'nom' => $billet['nom'],
                    'prenom' => $billet['prenom'],
                    'repasDebut' => $billet['repas_debut'],
                    'repasFin' => $billet['repas_fin'],
                    'sansRepas' => $billet['sans_repas'],
                    'carteConso' => $billet['carte_conso']
                ];
            }
            
            $inscription_data = [
                'billetsDetails' => $billetsDetails,
                'commentaire' => $inscription['commentaire']
            ];
            
            envoyerEmailConfirmation($inscription['email'], $inscription_id, $inscription_data, $inscription['montant_total']);
        } catch (Exception $e) {
            // Logger l'erreur mais ne pas faire échouer le webhook
            error_log('Webhook - Erreur envoi email: ' . $e->getMessage());
        }
        
        return $inscription_id;
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('Erreur lors de la mise à jour de l\'inscription: ' . $e->getMessage());
        throw $e;
    }
}
