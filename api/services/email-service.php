<?php
/**
 * Service d'envoi d'emails pour les confirmations d'inscription
 */

/**
 * Envoyer un email de confirmation d'inscription
 * 
 * @param string $email Email du destinataire
 * @param int $inscription_id ID de l'inscription
 * @param array $data Données de l'inscription
 * @param float $montant_total Montant total payé
 * @return bool Succès de l'envoi
 */
function envoyerEmailConfirmation($email, $inscription_id, $data, $montant_total) {
    $billetsDetails = $data['billetsDetails'] ?? [];
    $commentaire = $data['commentaire'] ?? '';
    $paymentMethod = $data['paymentMethod'] ?? 'manual';
    
    // Générer le contenu HTML de l'email
    $sujet = "Confirmation d'inscription - Alambik Festival 2026";
    $htmlContent = genererEmailHTML($inscription_id, $email, $billetsDetails, $montant_total, $paymentMethod, $commentaire);
    
    // Headers pour HTML
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Alambik Festival <noreply@alambikfestival.fr>',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Envoyer l'email
    $success = mail($email, $sujet, $htmlContent, implode("\r\n", $headers));
    
    if ($success) {
        error_log("Email de confirmation envoyé à $email pour l'inscription #$inscription_id");
    } else {
        error_log("Erreur lors de l'envoi de l'email à $email pour l'inscription #$inscription_id");
    }
    
    return $success;
}

/**
 * Générer le contenu HTML de l'email de confirmation
 */
function genererEmailHTML($inscription_id, $email, $billetsDetails, $montant_total, $paymentMethod, $commentaire) {
    // Labels des repas
    $repasLabels = [
        0 => 'Samedi soir',
        1 => 'Dimanche midi',
        2 => 'Dimanche soir',
        3 => 'Lundi midi',
        4 => 'Lundi soir',
        5 => 'Mardi midi'
    ];
    
    // Types de billets
    $typesLabels = [
        '0' => 'Enfant (gratuit)',
        '30' => 'XL - 30€',
        '35' => 'XXL - 35€',
        '40' => 'XXXL - 40€'
    ];
    
    // Générer la liste des participants (format simple)
    $participantsHTML = '';
    foreach ($billetsDetails as $billet) {
        $nom = htmlspecialchars(($billet['prenom'] ?? '') . ' ' . ($billet['nom'] ?? ''));
        $typeBillet = $typesLabels[$billet['type']] ?? $billet['type'] . '€';
        
        $nbCartes = intval($billet['carteConso'] ?? 0);
        
        // Repas
        $repasInfo = '';
        if ($billet['sansRepas']) {
            $repasInfo = 'Sans repas';
        } else {
            $debut = intval($billet['repasDebut'] ?? 0);
            $fin = intval($billet['repasFin'] ?? 5);
            $nbRepas = $fin - $debut + 1;
            $repasInfo = $nbRepas . ' repas (' . $repasLabels[$debut] . ' au ' . $repasLabels[$fin] . ')';
        }
        
        $cartesInfo = $nbCartes > 0 ? $nbCartes . ' carte' . ($nbCartes > 1 ? 's' : '') . ' conso' : 'Pas de carte conso';
        
        $participantsHTML .= '
        <li style="margin-bottom: 15px;">
            <strong style="color: #93441A;">' . $nom . '</strong><br>
            &nbsp;&nbsp;&nbsp;• Billet : ' . $typeBillet . '<br>
            &nbsp;&nbsp;&nbsp;• Repas : ' . $repasInfo . '<br>
            &nbsp;&nbsp;&nbsp;• Cartes conso : ' . $cartesInfo . '
        </li>';
        
        $participantsHTML .= '</div>';
    }
    
    // Message de paiement si nécessaire
    $paiementHTML = '';
    if ($paymentMethod !== 'card') {
        $paiementHTML = '
        <div style="background: #fff3cd; padding: 20px; margin: 25px 0; border-left: 4px solid #DAAB3A; border-radius: 5px;">
            <p style="margin: 0 0 15px 0; color: #856404; line-height: 1.6;">
                <strong style="font-size: 18px;">Paiement à effectuer : ' . number_format($montant_total, 2, ',', ' ') . ' €</strong><br><br>
                Si le paiement n\'est pas déjà fait, merci de le faire rapidement. Entre les artistes et la location du matériel, 
                on a des frais à avancer et avoir les sous nous aide vraiment !
            </p>
            <p style="margin: 15px 0 5px 0; color: #856404;"><strong>Options de paiement :</strong></p>
            <ul style="margin: 5px 0; color: #856404; line-height: 1.8;">
                <li><strong>Par RIB :</strong> FR76 3000 4031 6600 0021 9532 628</li>
                <li><strong>Par WERO :</strong> 06.03.36.63.30</li>
            </ul>
        </div>';
    }
    
    // Template HTML simple
    $html = '
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation - Alambik Festival 2026</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #DAAB3A 0%, #B67332 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 26px;">Alambik Festival 2026</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Merci pour ton inscription à l\'Alambik festival ! On a hâte de te retrouver cet été pour s\'ambiancer sur ce week-end de folie. 
                            </p>
                            
                            <h3 style="color: #93441A; margin: 25px 0 15px 0; font-size: 18px;">Pour rappel, ton inscription comprend :</h3>
                            
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                ' . $participantsHTML . '
                            </ul>
                            
                            ' . $paiementHTML . '
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                                    À très vite ! <br>
                                    L\'équipe de l\'Alambik Festival
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';
    
    return $html;
}
?>
