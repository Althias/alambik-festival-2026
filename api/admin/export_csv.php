<?php
// Export des inscriptions en CSV
// ATTENTION : Protégez ce fichier par mot de passe !

require_once __DIR__ . '/../config/config.php';

// Protection basique par mot de passe
if (!isset($_GET['password']) || $_GET['password'] !== ADMIN_PASSWORD) {
    http_response_code(403);
    die('Accès interdit. Ajoutez ?password=VOTRE_MOT_DE_PASSE à l\'URL');
}

try {
    $pdo = getDB();
    
    // Récupérer toutes les inscriptions avec leurs billets
    $stmt = $pdo->query("
        SELECT 
            i.id as inscription_id,
            i.email,
            i.payment_method,
            i.montant_total,
            i.date_inscription,
            i.commentaire,
            b.nom,
            b.prenom,
            b.type_billet,
            b.repas_debut,
            b.repas_fin,
            b.sans_repas,
            b.carte_conso
        FROM inscriptions i
        LEFT JOIN billets_details b ON i.id = b.inscription_id
        ORDER BY i.date_inscription DESC, i.id
    ");
    
    $data = $stmt->fetchAll();
    
    // Définir les en-têtes pour le téléchargement CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=inscriptions_alambik_' . date('Y-m-d') . '.csv');
    
    // Créer le flux de sortie
    $output = fopen('php://output', 'w');
    
    // Ajouter le BOM UTF-8 pour Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // En-têtes du CSV
    fputcsv($output, [
        'ID Inscription',
        'Email',
        'Mode de paiement',
        'Montant total',
        'Date inscription',
        'Nom',
        'Prénom',
        'Type billet',
        'Repas début',
        'Repas fin',
        'Sans repas',
        'Nb cartes conso',
        'Commentaire'
    ], ';');
    
    // Données
    foreach ($data as $row) {
        $repas_labels = ['Sam. soir', 'Dim. midi', 'Dim. soir', 'Lun. midi', 'Lun. soir', 'Mar. midi'];
        
        fputcsv($output, [
            $row['inscription_id'],
            $row['email'],
            $row['payment_method'] === 'card' ? 'Carte' : 'Manuel',
            number_format($row['montant_total'], 2, ',', ''),
            date('d/m/Y H:i', strtotime($row['date_inscription'])),
            $row['nom'] ?? '',
            $row['prenom'] ?? '',
            $row['type_billet'] . '€',
            $row['repas_debut'] !== null ? $repas_labels[$row['repas_debut']] : '',
            $row['repas_fin'] !== null ? $repas_labels[$row['repas_fin']] : '',
            $row['sans_repas'] ? 'Oui' : 'Non',
            $row['carte_conso'] ?? 0,
            $row['commentaire'] ?? ''
        ], ';');
    }
    
    fclose($output);
    
} catch (PDOException $e) {
    http_response_code(500);
    die('Erreur : ' . $e->getMessage());
}
?>
