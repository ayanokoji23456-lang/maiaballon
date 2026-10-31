<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhuma imagem enviada.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$file = $_FILES['file'];
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'A imagem deve ter no máximo 5 MB.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$mime = mime_content_type($file['tmp_name']);
$extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
if (!isset($extensions[$mime])) {
    http_response_code(400);
    echo json_encode(['error' => 'Use imagens JPG, PNG, WEBP ou GIF.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$directory = dirname(__DIR__) . '/uploads';
if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível criar a pasta uploads/.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $extensions[$mime];
if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) {
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível salvar a imagem.'], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(201);
echo json_encode(['image' => 'uploads/' . $name], JSON_UNESCAPED_UNICODE);
