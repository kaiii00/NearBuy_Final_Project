<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Health check
if ($uri === '/api/health') {
    echo json_encode(['status' => 'UP', 'service' => 'nearbuy-php', 'version' => '1.0.0']);
    exit;
}

// Route to handlers
if (str_starts_with($uri, '/api/chat')) {
    require_once __DIR__ . '/api/chat/index.php';
} elseif (str_starts_with($uri, '/api/feedback')) {
    require_once __DIR__ . '/api/feedback/index.php';
} elseif (str_starts_with($uri, '/api/ratings')) {
    require_once __DIR__ . '/api/ratings/index.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}