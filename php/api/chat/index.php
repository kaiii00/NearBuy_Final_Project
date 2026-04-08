<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$pdo = getDB();

// POST /api/chat — send a message
if ($method === 'POST' && $uri === '/api/chat') {
    $user = getAuthUser();
    $senderId = $user['user_id'];

    $body = json_decode(file_get_contents('php://input'), true);
    $receiverId = $body['receiver_id'] ?? null;
    $message = trim($body['message'] ?? '');

    if (!$receiverId || !$message) {
        http_response_code(400);
        echo json_encode(['error' => 'receiver_id and message are required']);
        exit;
    }

    $stmt = $pdo->prepare('
        INSERT INTO messages (sender_id, receiver_id, message, created_at)
        VALUES (?, ?, ?, NOW())
        RETURNING id, sender_id, receiver_id, message, created_at
    ');
    $stmt->execute([$senderId, $receiverId, $message]);
    $msg = $stmt->fetch();

    http_response_code(201);
    echo json_encode($msg);
    exit;
}

// GET /api/chat/{user_id} — get conversation between auth user and another user
if ($method === 'GET' && preg_match('#^/api/chat/(\d+)$#', $uri, $matches)) {
    $user = getAuthUser();
    $myId = $user['user_id'];
    $otherId = (int) $matches[1];

    $stmt = $pdo->prepare('
        SELECT id, sender_id, receiver_id, message, created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    ');
    $stmt->execute([$myId, $otherId, $otherId, $myId]);
    $messages = $stmt->fetchAll();

    echo json_encode($messages);
    exit;
}

// GET /api/chat — get all conversations for auth user (latest message per contact)
if ($method === 'GET' && $uri === '/api/chat') {
    $user = getAuthUser();
    $myId = $user['user_id'];

    $stmt = $pdo->prepare('
        SELECT DISTINCT ON (contact_id)
            contact_id,
            message,
            created_at,
            sender_id
        FROM (
            SELECT receiver_id AS contact_id, message, created_at, sender_id
            FROM messages WHERE sender_id = ?
            UNION ALL
            SELECT sender_id AS contact_id, message, created_at, sender_id
            FROM messages WHERE receiver_id = ?
        ) AS convos
        ORDER BY contact_id, created_at DESC
    ');
    $stmt->execute([$myId, $myId]);
    $convos = $stmt->fetchAll();

    echo json_encode($convos);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Chat route not found']);