<?php
function validateJWT($token) {
    $secret = 'nearbuy_super_secret_jwt_key_2024_shared';

    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$headerB64, $payloadB64, $signatureB64] = $parts;

    $signature = base64_decode(strtr($signatureB64, '-_', '+/'));
    $expectedSig = hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true);

    if (!hash_equals($signature, $expectedSig)) return null;

    $payload = json_decode(base64_decode(strtr($payloadB64, '-_', '+/')), true);

    if (!$payload || (isset($payload['exp']) && $payload['exp'] < time())) return null;

    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!str_starts_with($auth, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Missing or invalid Authorization header']);
        exit;
    }

    $token = substr($auth, 7);
    $payload = validateJWT($token);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    return [
        'user_id'  => $payload['userId'],
        'username' => $payload['sub'],
        'role'     => $payload['role'] ?? null,
    ];
}