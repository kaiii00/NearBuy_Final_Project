<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

// Health check
if ($method === 'GET' && $uri === '/api/health') {
    echo json_encode(['status' => 'PHP content API is running.']);
    exit;
}

// Feedback (kept from original)
if (str_starts_with($uri, '/api/feedback')) {
    require_once __DIR__ . '/api/feedback/index.php';
    exit;
}

// Ratings (kept from original)
if (str_starts_with($uri, '/api/ratings')) {
    require_once __DIR__ . '/api/ratings/index.php';
    exit;
}

// 404
http_response_code(404);
echo json_encode(['error' => 'Route not found.']);