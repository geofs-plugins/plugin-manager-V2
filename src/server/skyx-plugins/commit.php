<?php

$payload = json_decode($_POST["payload"]);
$sha1 = $_SERVER["HTTP_X_HUB_SIGNATURE"];
$event = $_SERVER["HTTP_X_GITHUB_EVENT"];
echo $sha1 . ", " . $event;

?>