<?php

require_once("fs");

$e = new stdClass();
$e->latest_version = file_get_contents($fs . "/files/skyx_version.txt");
$e->update_from = $url . "/download.php";

header("Content-Type: text/plain");
echo json_encode($e);

?>