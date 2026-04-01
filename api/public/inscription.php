<?php
// API pour enregistrer une inscription
// POST /api/public/inscription.php

// Headers CORS et JSON en premier
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../services/email-service.php';

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
    $pdo = getDB();
    
    // Calculer le montant total
    $montantTotal = 0;
    
    foreach ($data['billetsDetails'] as $billet) {
        // Prix du billet
        $montantTotal += intval($billet['type']);
        
        // Repas
        if (!$billet['sansRepas']) {
            $debut = intval($billet['repasDebut']);
            $fin = intval($billet['repasFin']);
            $nbRepas = $fin - $debut + 1;
            $montantTotal += $nbRepas * 4;
        }
        
        // Cartes conso
        $montantTotal += intval($billet['carteConso']) * 10;
    }
    
    // Frais de paiement carte
    if (isset($data['paymentMethod']) && $data['paymentMethod'] === 'card') {
        $montantTotal += 1;
    }
    
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    // Insérer l'inscription principale
    $stmt = $pdo->prepare("
        INSERT INTO inscriptions (email, payment_method, payment_status, commentaire, montant_total)
        VALUES (:email, :payment_method, :payment_status, :commentaire, :montant_total)
    ");
    
    $stmt->execute([
        ':email' => $data['email'],
        ':payment_method' => $data['paymentMethod'] ?? 'manual',
        ':payment_status' => 'pending',
        ':commentaire' => $data['commentaire'] ?? '',
        ':montant_total' => $montantTotal
    ]);
    
    $inscriptionId = $pdo->lastInsertId();
    
    // Insérer les détails des billets
    $stmt = $pdo->prepare("
        INSERT INTO billets_details 
        (inscription_id, nom, prenom, type_billet, repas_debut, repas_fin, sans_repas, carte_conso)
        VALUES (:inscription_id, :nom, :prenom, :type_billet, :repas_debut, :repas_fin, :sans_repas, :carte_conso)
    ");
    
    foreach ($data['billetsDetails'] as $billet) {
        $stmt->execute([
            ':inscription_id' => $inscriptionId,
            ':nom' => trim($billet['nom']),
            ':prenom' => trim($billet['prenom']),
            ':type_billet' => $billet['type'],
            ':repas_debut' => intval($billet['repasDebut']),
            ':repas_fin' => intval($billet['repasFin']),
            ':sans_repas' => $billet['sansRepas'] ? 1 : 0,
            ':carte_conso' => intval($billet['carteConso'] ?? 0)
        ]);
    }
    
    // Valider la transaction
    $pdo->commit();
    
    // Envoyer l'email de confirmation
    try {
        envoyerEmailConfirmation($data['email'], $inscriptionId, $data, $montantTotal);
    } catch (Exception $e) {
        // Logger l'erreur mais ne pas faire échouer l'inscription
        error_log('Erreur envoi email: ' . $e->getMessage());
    }
    
    // Réponse succès
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Inscription enregistrée avec succès',
        'inscription_id' => $inscriptionId,
        'montant_total' => $montantTotal
    ]);
    
} catch (PDOException $e) {
    // Annuler la transaction en cas d'erreur
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de l\'enregistrement : ' . $e->getMessage()
    ]);
}
?>
