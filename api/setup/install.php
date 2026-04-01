<?php
// Script à exécuter UNE SEULE FOIS pour créer la table des inscriptions
// Accédez à ce fichier via votre navigateur : https://votre-domaine.com/api/setup/install.php

require_once __DIR__ . '/../config/config.php';

try {
    $pdo = getDB();
    
    // Création de la table inscriptions
    $sql = "CREATE TABLE IF NOT EXISTS inscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        commentaire TEXT,
        montant_total DECIMAL(10,2) NOT NULL,
        date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_date (date_inscription)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    
    // Création de la table billets_details
    $sql = "CREATE TABLE IF NOT EXISTS billets_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inscription_id INT NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        type_billet VARCHAR(10) NOT NULL,
        repas_debut INT NOT NULL,
        repas_fin INT NOT NULL,
        sans_repas BOOLEAN DEFAULT FALSE,
        carte_conso INT NOT NULL DEFAULT 0,
        FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true,
        'message' => '✅ Tables créées avec succès ! Vous pouvez maintenant supprimer ce fichier install.php par sécurité.'
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la création des tables : ' . $e->getMessage()
    ]);
}
?>
