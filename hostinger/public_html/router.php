<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path === '/api/catalog') { require __DIR__ . '/api/catalog.php'; return true; }
if ($path === '/api/uploads') { require __DIR__ . '/api/uploads.php'; return true; }
return false;
