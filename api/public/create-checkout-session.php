<?php
/**
 * API pour créer une session Stripe Checkout
 * POST /api/public/create-checkout-session.php
 * 
 * Reçoit les données d'inscription et crée une session de paiement Stripe
 */

require_once __DIR__ . '/../config/config.php';

// Charger la bibliothèque Stripe
// Installez-la avec: composer require stripe/stripe-php
require_once __DIR__ . '/../vendor/autoload.php';

// Configuration Stripe - Utiliser $_ENV car config.php charge le fichier .env
$stripe_secret_key = $_ENV['STRIPE_SECRET_KEY'] ?? '';

if (empty($stripe_secret_key) || $stripe_secret_key === 'sk_test_votre_cle_secrete_stripe') {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration Stripe manquante. Vérifiez que STRIPE_SECRET_KEY est définie dans api/.env']);
    exit();
}

\Stripe\Stripe::setApiKey($stripe_secret_key);

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

// Récupérer les données JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validation des données
if (!isset($data['email']) || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email requis']);
    exit();
}

if (!isset($data['billetsDetails']) || !is_array($data['billetsDetails']) || empty($data['billetsDetails'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Au moins un billet est requis']);
    exit();
}

// Validation de l'email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalide']);
    exit();
}

// Validation des champs obligatoires pour chaque billet
foreach ($data['billetsDetails'] as $index => $billet) {
    if (!isset($billet['nom']) || trim($billet['nom']) === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Le nom est obligatoire pour le festivalier ' . ($index + 1)]);
        exit();
    }
    if (!isset($billet['prenom']) || trim($billet['prenom']) === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Le prénom est obligatoire pour le festivalier ' . ($index + 1)]);
        exit();
    }
}

try {
    // Calculer le montant total
    $montantTotal = 0;
    
    foreach ($data['billetsDetails'] as $index => $billet) {
        // Prix du billet
        $prixBillet = intval($billet['type']);
        $montantTotal += $prixBillet;
        
        // Repas
        if (!$billet['sansRepas']) {
            $debut = intval($billet['repasDebut']);
            $fin = intval($billet['repasFin']);
            $nbRepas = $fin - $debut + 1;
            $prixRepas = $nbRepas * 4;
            $montantTotal += $prixRepas;
        }
        
        // Cartes conso
        $nbCartes = intval($billet['carteConso']);
        if ($nbCartes > 0) {
            $prixCartes = $nbCartes * 10;
            $montantTotal += $prixCartes;
        }
    }
    
    // Frais de paiement par carte (1€)
    if ($data['paymentMethod'] === 'card') {
        $montantTotal += 1;
    }
    
    // Si montant = 0 (tous billets enfants gratuits), pas besoin de Stripe
    if ($montantTotal <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Aucun montant à payer. Inscription gratuite.']);
        exit();
    }
    
    // Créer un seul line_item avec le montant total
    $line_items = [
        [
            'price_data' => [
                'currency' => 'eur',
                'product_data' => [
                    'name' => 'Alambik Festival',
                    'description' => 'Inscription au festival',
                ],
                'unit_amount' => $montantTotal * 100, // Stripe utilise les centimes
            ],
            'quantity' => 1,
        ]
    ];
    
    // === ENREGISTRER L'INSCRIPTION EN BASE AVANT STRIPE ===
    $pdo = getDB();
    $pdo->beginTransaction();
    
    try {
        // Insérer l'inscription (sans les infos Stripe pour l'instant)
        $stmt = $pdo->prepare("
            INSERT INTO inscriptions (
                email, 
                montant_total, 
                payment_method,
                commentaire
            ) VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['email'],
            $montantTotal,
            'card',
            $data['commentaire'] ?? ''
        ]);
        
        $inscription_id = $pdo->lastInsertId();
        
        // Insérer les détails de chaque billet
        $stmt_billet = $pdo->prepare("
            INSERT INTO billets_details (
                inscription_id,
                nom,
                prenom,
                type_billet,
                repas_debut,
                repas_fin,
                sans_repas,
                carte_conso
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($data['billetsDetails'] as $billet) {
            $stmt_billet->execute([
                $inscription_id,
                trim($billet['nom']),
                trim($billet['prenom']),
                intval($billet['type']),
                intval($billet['repasDebut'] ?? 0),
                intval($billet['repasFin'] ?? 5),
                $billet['sansRepas'] ? 1 : 0,
                intval($billet['carteConso'] ?? 0)
            ]);
        }
        
        $pdo->commit();
        
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('Erreur lors de l\'enregistrement de l\'inscription: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()]);
        exit();
    }
    
    // URL de base (à adapter selon votre environnement)
    $base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
    
    // Créer la session Stripe Checkout avec uniquement l'ID de l'inscription
    $checkout_session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => $line_items,
        'mode' => 'payment',
        'success_url' => $base_url . '/success',
        'cancel_url' => $base_url . '/cancel',
        'customer_email' => $data['email'],
        'metadata' => [
            'inscription_id' => (string)$inscription_id,
        ],
    ]);
    
    // Retourner l'URL de la session
    echo json_encode([
        'id' => $checkout_session->id,
        'url' => $checkout_session->url
    ]);
    
} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur Stripe: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
