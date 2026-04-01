<?php
/**
 * Script de migration pour ajouter les colonnes Stripe
 * Exécutez ce fichier UNE FOIS via votre navigateur
 */

require_once __DIR__ . '/../config/config.php';

try {
    $pdo = getDB();
    
    // Vérifier si les colonnes existent déjà
    $result = $pdo->query("SHOW COLUMNS FROM inscriptions LIKE 'stripe_session_id'");
    $columnExists = $result->rowCount() > 0;
    
    if (!$columnExists) {
        // Ajouter les colonnes Stripe à la table inscriptions
        $pdo->exec("ALTER TABLE inscriptions 
                    ADD COLUMN stripe_session_id VARCHAR(255) NULL,
                    ADD COLUMN stripe_payment_intent VARCHAR(255) NULL");
        
        // Ajouter l'index
        $pdo->exec("ALTER TABLE inscriptions 
                    ADD INDEX idx_stripe_session (stripe_session_id)");
        
        echo json_encode([
            'success' => true,
            'message' => '✅ Colonnes Stripe ajoutées avec succès ! La table est maintenant à jour.'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => '✅ Les colonnes existent déjà, rien à faire.'
        ]);
    }
    
} catch (PDOException $e) {
    // Si les colonnes existent déjà, ce n'est pas grave
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo json_encode([
            'success' => true,
            'message' => '✅ Les colonnes existent déjà, rien à faire.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erreur lors de la mise à jour : ' . $e->getMessage()
        ]);
    }
}
?>
