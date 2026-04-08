<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$pdo = getDB();

// POST /api/ratings — submit a rating for a store
if ($method === 'POST' && $uri === '/api/ratings') {
    $user = getAuthUser();
    $userId = $user['user_id'];

    $body = json_decode(file_get_contents('php://input'), true);
    $storeId = $body['store_id'] ?? null;
    $rating  = $body['rating'] ?? null;
    $comment = trim($body['comment'] ?? '');

    if (!$storeId || !$rating) {
        http_response_code(400);
        echo json_encode(['error' => 'store_id and rating are required']);
        exit;
    }

    if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'rating must be between 1 and 5']);
        exit;
    }

    // Upsert — update if already rated this store
    $stmt = $pdo->prepare('
        INSERT INTO ratings (user_id, store_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON CONFLICT (user_id, store_id)
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
        RETURNING id, user_id, store_id, rating, comment, created_at
    ');
    $stmt->execute([$userId, $storeId, (int)$rating, $comment ?: null]);
    $result = $stmt->fetch();

    http_response_code(201);
    echo json_encode($result);
    exit;
}

// GET /api/ratings/store/{store_id} — get all ratings for a store
if ($method === 'GET' && preg_match('#^/api/ratings/store/(\d+)$#', $uri, $matches)) {
    $storeId = (int) $matches[1];

    $stmt = $pdo->prepare('
        SELECT id, user_id, store_id, rating, comment, created_at
        FROM ratings
        WHERE store_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$storeId]);
    $ratings = $stmt->fetchAll();

    // Calculate average
    $avg = count($ratings) > 0
        ? round(array_sum(array_column($ratings, 'rating')) / count($ratings), 1)
        : null;

    echo json_encode([
        'store_id' => $storeId,
        'average_rating' => $avg,
        'total_ratings' => count($ratings),
        'ratings' => $ratings
    ]);
    exit;
}

// GET /api/ratings/my — get all ratings by the auth user
if ($method === 'GET' && $uri === '/api/ratings/my') {
    $user = getAuthUser();
    $userId = $user['user_id'];

    $stmt = $pdo->prepare('
        SELECT id, user_id, store_id, rating, comment, created_at
        FROM ratings
        WHERE user_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Ratings route not found']);