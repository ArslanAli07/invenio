<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $res = app()->call('App\Http\Controllers\PublicController@store')->toResponse(request());
    $data = $res->getOriginalContent()->getData();
    echo "SUCCESS\n";
    file_put_contents('store_response.json', json_encode($data['page']['props'], JSON_PRETTY_PRINT));
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
