<?php
// API pour lister les inscriptions (format JSON)
// GET /api/admin/list_inscriptions.php?password=VOTRE_MOT_DE_PASSE

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/config.php';

// Protection basique par mot de passe
if (!isset($_GET['password']) || $_GET['password'] !== ADMIN_PASSWORD) {
    http_response_code(403);
    echo json_encode(['error' => 'Accès interdit. Ajoutez ?password=VOTRE_MOT_DE_PASSE à l\'URL']);
    exit();
}

try {
    $pdo = getDB();
    
    // Récupérer toutes les inscriptions avec leurs billets en une seule requête
    $stmt = $pdo->query("
        SELECT 
            i.id,
            i.email,
            i.payment_method,
            i.payment_status,
            i.commentaire,
            i.montant_total,
            i.date_inscription,
            i.stripe_session_id,
            i.stripe_payment_intent,
            b.id as billet_id,
            b.nom,
            b.prenom,
            b.type_billet,
            b.repas_debut,
            b.repas_fin,
            b.sans_repas,
            b.carte_conso
        FROM inscriptions i
        LEFT JOIN billets_details b ON i.id = b.inscription_id
        ORDER BY i.date_inscription DESC, b.id ASC
    ");
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Regrouper les billets par inscription
    $inscriptions_by_id = [];
    $total_billets = 0;
    
    foreach ($results as $row) {
        $inscription_id = $row['id'];
        
        // Créer l'inscription si elle n'existe pas encore
        if (!isset($inscriptions_by_id[$inscription_id])) {
            $inscriptions_by_id[$inscription_id] = [
                'id' => $row['id'],
                'email' => $row['email'],
                'payment_method' => $row['payment_method'],
                'payment_status' => $row['payment_status'],
                'commentaire' => $row['commentaire'],
                'montant_total' => $row['montant_total'],
                'date_inscription' => $row['date_inscription'],
                'stripe_session_id' => $row['stripe_session_id'],
                'stripe_payment_intent' => $row['stripe_payment_intent'],
                'billets' => [],
                'nb_billets' => 0
            ];
        }
        
        // Ajouter le billet s'il existe
        if ($row['billet_id'] !== null) {
            $inscriptions_by_id[$inscription_id]['billets'][] = [
                'id' => $row['billet_id'],
                'inscription_id' => $inscription_id,
                'nom' => $row['nom'],
                'prenom' => $row['prenom'],
                'type_billet' => $row['type_billet'],
                'repas_debut' => $row['repas_debut'],
                'repas_fin' => $row['repas_fin'],
                'sans_repas' => $row['sans_repas'],
                'carte_conso' => $row['carte_conso']
            ];
            $inscriptions_by_id[$inscription_id]['nb_billets']++;
            $total_billets++;
        }
    }
    
    // Convertir en tableau indexé pour le JSON
    $inscriptions = array_values($inscriptions_by_id);
    
    // Calculer les statistiques
    $total_inscriptions = count($inscriptions);
    $total_montant = array_sum(array_column($inscriptions, 'montant_total'));
    $total_paye = 0;
    $total_en_attente = 0;
    
    foreach ($inscriptions as $inscription) {
        if ($inscription['payment_status'] === 'paid') {
            $total_paye += $inscription['montant_total'];
        } else {
            $total_en_attente += $inscription['montant_total'];
        }
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de base de données : ' . $e->getMessage()]);
    exit();
}

// Retourner les données en JSON
echo json_encode([
    'success' => true,
    'stats' => [
        'total_inscriptions' => $total_inscriptions,
        'total_billets' => $total_billets,
        'total_montant' => $total_montant,
        'total_paye' => $total_paye,
        'total_en_attente' => $total_en_attente
    ],
    'inscriptions' => $inscriptions
]);