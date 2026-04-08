<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$pdo = getDB();

// POST /api/feedback — submit feedback for an order
if ($method === 'POST' && $uri === '/api/feedback') {
    $user = getAuthUser();
    $userId = $user['user_id'];

    $body = json_decode(file_get_contents('php://input'), true);
    $orderId = $body['order_id'] ?? null;
    $comment = trim($body['comment'] ?? '');

    if (!$orderId || !$comment) {
        http_response_code(400);
        echo json_encode(['error' => 'order_id and comment are required']);
        exit;
    }

    // Check feedback doesn't already exist
    $check = $pdo->prepare('SELECT id FROM feedback WHERE order_id = ? AND user_id = ?');
    $check->execute([$orderId, $userId]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Feedback already submitted for this order']);
        exit;
    }

    $stmt = $pdo->prepare('
        INSERT INTO feedback (user_id, order_id, comment, created_at)
        VALUES (?, ?, ?, NOW())
        RETURNING id, user_id, order_id, comment, created_at
    ');
    $stmt->execute([$userId, $orderId, $comment]);
    $feedback = $stmt->fetch();

    http_response_code(201);
    echo json_encode($feedback);
    exit;
}

// GET /api/feedback/order/{order_id} — get feedback for a specific order
if ($method === 'GET' && preg_match('#^/api/feedback/order/(\d+)$#', $uri, $matches)) {
    $orderId = (int) $matches[1];

    $stmt = $pdo->prepare('
        SELECT id, user_id, order_id, comment, created_at
        FROM feedback
        WHERE order_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$orderId]);
    echo json_encode($stmt->fetchAll());
    exit;
}

// GET /api/feedback/my — get all feedback by the auth user
if ($method === 'GET' && $uri === '/api/feedback/my') {
    $user = getAuthUser();
    $userId = $user['user_id'];

    $stmt = $pdo->prepare('
        SELECT id, user_id, order_id, comment, created_at
        FROM feedback
        WHERE user_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll());
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Feedback route not found']);