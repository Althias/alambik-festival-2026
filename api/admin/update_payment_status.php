<?php
// API pour mettre à jour le statut de paiement d'une inscription
// POST /api/admin/update_payment_status.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/config.php';

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

// Récupérer les données JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Protection basique par mot de passe
if (!isset($data['password']) || $data['password'] !== ADMIN_PASSWORD) {
    http_response_code(403);
    echo json_encode(['error' => 'Accès interdit']);
    exit();
}

// Validation des données
if (!isset($data['inscription_id']) || !is_numeric($data['inscription_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID d\'inscription invalide']);
    exit();
}

if (!isset($data['payment_status']) || !in_array($data['payment_status'], ['pending', 'paid'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Statut de paiement invalide']);
    exit();
}

try {
    $pdo = getDB();
    
    // Mettre à jour le statut de paiement
    $stmt = $pdo->prepare("
        UPDATE inscriptions 
        SET payment_status = :payment_status
        WHERE id = :id
    ");
    
    $stmt->execute([
        ':payment_status' => $data['payment_status'],
        ':id' => $data['inscription_id']
    ]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Inscription non trouvée']);
        exit();
    }
    
    // Réponse succès
    echo json_encode([
        'success' => true,
        'message' => 'Statut mis à jour',
        'payment_status' => $data['payment_status']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la mise à jour : ' . $e->getMessage()
    ]);
}
