<?php
// Configuration de la base de données MySQL OVH

// Charger les variables d'environnement depuis le fichier .env
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        // Erreur critique : fichier .env manquant
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'Configuration serveur manquante',
            'details' => 'Le fichier .env est introuvable dans /api/config/. Veuillez le créer à partir de .env.example',
            'path' => $filePath
        ]);
        exit();
    }
    
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorer les commentaires
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parser la ligne KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Stocker dans $_ENV et définir comme constante
            $_ENV[$key] = $value;
            if (!defined($key)) {
                define($key, $value);
            }
        }
    }
}

// Charger le fichier .env
loadEnv(__DIR__ . '/.env');

// Définir les constantes de base de données si pas déjà définies par .env (rétrocompatibilité)
if (!defined('DB_HOST')) define('DB_HOST', $_ENV['DB_HOST'] ?? '');
if (!defined('DB_NAME')) define('DB_NAME', $_ENV['DB_NAME'] ?? '');
if (!defined('DB_USER')) define('DB_USER', $_ENV['DB_USER'] ?? '');
if (!defined('DB_PASS')) define('DB_PASS', $_ENV['DB_PASS'] ?? '');
if (!defined('ADMIN_PASSWORD')) define('ADMIN_PASSWORD', $_ENV['ADMIN_PASSWORD'] ?? '');

// Configuration CORS pour permettre les requêtes depuis votre frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Connexion à la base de données
function getDB() {
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de connexion à la base de données. Vérifiez votre fichier .env']);
        exit();
    }
}
?>
