<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// プレフライトリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw);

if (isset($data->url)) {
    $url = $data->url;
    $html = file_get_contents($url);
    if ($html === false) {
        http_response_code(500);
        echo json_encode(['error' => 'URLの取得に失敗しました。']);
        exit;
    }

    echo json_encode(['html' => $html]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'URLが提供されていません。']);
}
