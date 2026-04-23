<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

if ($uri === '/api/health') {
    echo json_encode(['status' => 'UP', 'service' => 'nearbuy-php', 'version' => '1.0.0']);
    exit;
}

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