#!/usr/bin/env php
<?php
/**
 * Script de vérification de l'installation Stripe
 * Usage: php check-stripe-setup.php
 */

echo "🔍 Vérification de la configuration Stripe...\n\n";

$errors = [];
$warnings = [];
$success = [];

// 1. Vérifier que vendor existe
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    $errors[] = "❌ Le dossier vendor/ n'existe pas. Exécutez: composer require stripe/stripe-php";
} else {
    $success[] = "✅ Bibliothèque Stripe installée (vendor/autoload.php trouvé)";
    require_once __DIR__ . '/../vendor/autoload.php';
}

// 2. Vérifier que .env existe
if (!file_exists(__DIR__ . '/../config/.env')) {
    $errors[] = "❌ Le fichier .env n'existe pas. Copiez .env.example vers .env";
} else {
    $success[] = "✅ Fichier .env trouvé";
    
    // Charger les variables via la fonction loadEnv de config.php
    require_once __DIR__ . '/../config/config.php';
}

// 3. Vérifier les clés Stripe
$stripe_secret = $_ENV['STRIPE_SECRET_KEY'] ?? '';
$stripe_public = $_ENV['STRIPE_PUBLISHABLE_KEY'] ?? '';

if (empty($stripe_secret) || $stripe_secret === 'sk_test_votre_cle_secrete_stripe') {
    $errors[] = "❌ STRIPE_SECRET_KEY non configurée dans .env";
} else {
    if (strpos($stripe_secret, 'sk_test_') === 0) {
        $success[] = "✅ STRIPE_SECRET_KEY configurée (mode TEST)";
    } elseif (strpos($stripe_secret, 'sk_live_') === 0) {
        $warnings[] = "⚠️  STRIPE_SECRET_KEY configurée (mode PRODUCTION)";
    } else {
        $errors[] = "❌ STRIPE_SECRET_KEY invalide (doit commencer par sk_test_ ou sk_live_)";
    }
}

if (empty($stripe_public) || $stripe_public === 'pk_test_votre_cle_publique_stripe') {
    $errors[] = "❌ STRIPE_PUBLISHABLE_KEY non configurée dans .env";
} else {
    if (strpos($stripe_public, 'pk_test_') === 0) {
        $success[] = "✅ STRIPE_PUBLISHABLE_KEY configurée (mode TEST)";
    } elseif (strpos($stripe_public, 'pk_live_') === 0) {
        $warnings[] = "⚠️  STRIPE_PUBLISHABLE_KEY configurée (mode PRODUCTION)";
    } else {
        $errors[] = "❌ STRIPE_PUBLISHABLE_KEY invalide (doit commencer par pk_test_ ou pk_live_)";
    }
}

// 4. Tester la connexion Stripe (si les clés sont configurées)
if (!empty($stripe_secret) && strpos($stripe_secret, 'sk_') === 0) {
    try {
        \Stripe\Stripe::setApiKey($stripe_secret);
        $balance = \Stripe\Balance::retrieve();
        $success[] = "✅ Connexion à l'API Stripe réussie !";
        echo "\n💰 Solde disponible: " . ($balance->available[0]->amount / 100) . " " . strtoupper($balance->available[0]->currency) . "\n";
    } catch (\Stripe\Exception\AuthenticationException $e) {
        $errors[] = "❌ Clé Stripe invalide: " . $e->getMessage();
    } catch (\Exception $e) {
        $warnings[] = "⚠️  Impossible de se connecter à Stripe: " . $e->getMessage();
    }
}

// 5. Vérifier que les fichiers nécessaires existent
$required_files = [
    'create-checkout-session.php',
    'config.php',
];

foreach ($required_files as $file) {
    if (!file_exists(__DIR__ . '/' . $file)) {
        $errors[] = "❌ Fichier manquant: $file";
    } else {
        $success[] = "✅ Fichier trouvé: $file";
    }
}

// Afficher les résultats
echo "\n=== RÉSULTATS ===\n\n";

if (!empty($success)) {
    foreach ($success as $msg) {
        echo "$msg\n";
    }
}

if (!empty($warnings)) {
    echo "\n";
    foreach ($warnings as $msg) {
        echo "$msg\n";
    }
}

if (!empty($errors)) {
    echo "\n";
    foreach ($errors as $msg) {
        echo "$msg\n";
    }
    echo "\n❌ Configuration incomplète. Corrigez les erreurs ci-dessus.\n";
    exit(1);
}

echo "\n✅ ✅ ✅ Configuration Stripe complète et fonctionnelle ! ✅ ✅ ✅\n\n";
echo "📝 Prochaines étapes:\n";
echo "   1. Testez le paiement sur votre site\n";
echo "   2. Utilisez la carte test: 4242 4242 4242 4242\n";
echo "   3. Consultez le Dashboard Stripe pour voir les paiements\n\n";
exit(0);
