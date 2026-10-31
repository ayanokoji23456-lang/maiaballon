<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$dataFile = dirname(__DIR__) . '/data/catalog.json';
$seedFile = dirname(__DIR__) . '/data/default-products.json';
$productsFile = dirname(__DIR__) . '/products.js';
$configFile = dirname(__DIR__) . '/config.js';

$defaults = [
    'whatsapp' => '5511952909882',
    'announcement' => 'Feito com carinho para transformar momentos em memórias ✦ Pedidos com 2 dias de antecedência',
    'heroText' => 'Balões personalizados, cestas e surpresas pensadas para celebrar quem você ama — com um toque especial em cada detalhe.'
];

function readCatalog($dataFile, $seedFile, $defaults) {
    if (is_file($dataFile)) {
        $saved = json_decode(file_get_contents($dataFile), true);
        if (is_array($saved)) {
            return [
                'products' => array_values($saved['products'] ?? []),
                'settings' => array_merge($defaults, $saved['settings'] ?? [])
            ];
        }
    }
    $products = json_decode(file_get_contents($seedFile), true);
    return ['products' => is_array($products) ? array_values($products) : [], 'settings' => $defaults];
}

function writeGeneratedFiles($products, $settings, $productsFile, $configFile) {
    $jsonOptions = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT;
    file_put_contents($productsFile, "window.PRODUCTS = " . json_encode($products, $jsonOptions) . ";\n", LOCK_EX);
    file_put_contents($configFile, "window.SITE_CONFIG = " . json_encode($settings, $jsonOptions) . ";\n", LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(readCatalog($dataFile, $seedFile, $defaults), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['products']) || !is_array($input['products'])) {
        throw new RuntimeException('Lista de produtos inválida.');
    }

    $categories = ['baloes', 'cafe', 'cestas', 'casal', 'kids'];
    $products = [];
    $ids = [];
    foreach ($input['products'] as $index => $raw) {
        $name = trim((string)($raw['name'] ?? ''));
        if ($name === '') throw new RuntimeException('O produto na posição ' . ($index + 1) . ' está sem nome.');
        $id = trim((string)($raw['id'] ?? '')) ?: 'produto-' . time() . '-' . $index;
        if (isset($ids[$id])) throw new RuntimeException('Existem produtos com o mesmo identificador.');
        $ids[$id] = true;
        $price = is_numeric($raw['price'] ?? null) ? (float)$raw['price'] : 0;
        $cat = in_array($raw['cat'] ?? '', $categories, true) ? $raw['cat'] : $categories[0];
        $products[] = [
            'id' => $id,
            'cat' => $cat,
            'name' => $name,
            'price' => round(max(0, $price), 2),
            'image' => trim((string)($raw['image'] ?? '')),
            'desc' => trim((string)($raw['desc'] ?? '')),
            'best' => (bool)($raw['best'] ?? false)
        ];
    }

    $settings = [];
    foreach ($defaults as $key => $value) {
        $settings[$key] = trim((string)($input['settings'][$key] ?? $value));
    }

    if (!is_dir(dirname($dataFile))) mkdir(dirname($dataFile), 0755, true);
    $saved = json_encode(['products' => $products, 'settings' => $settings], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (file_put_contents($dataFile, $saved . "\n", LOCK_EX) === false) {
        throw new RuntimeException('Não foi possível gravar catalog.json. Verifique as permissões da pasta data/.');
    }
    writeGeneratedFiles($products, $settings, $productsFile, $configFile);
    echo json_encode(['products' => $products, 'settings' => $settings], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
}
