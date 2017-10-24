<?php

require_once("fs");


$payload = json_decode($_POST["payload"]);
$sha1 = $_SERVER["HTTP_X_HUB_SIGNATURE"];
$event = $_SERVER["HTTP_X_GITHUB_EVENT"];

if ($sha1 != file_get_contents($fs . "/sha1.txt")) {
    die("unauthorised");
}

if ($event != "push") {
    die("not push");
}

if ($payload->ref != "refs/heads/release") {
    die("not release");
}

$url = "https://raw.githubusercontent.com/" . $payload->repository->full_name . "/release/src/client/core.user.js";
$target = file_get_contents($url);

$v_matches = 0;
preg_match('/var CORE\_VERSION \= \"(.+?)\"\;/', $target, $v_matches, 0);
if (count($v_matches) < 2) {
    die("no version line");
}

$version = $v_matches[1];

file_put_contents($fs . "/files/skyx_version.txt", $version);
file_put_contents($fs . "/files/skyx_core.user.js", $target);

echo $version;
echo " ok";
    
?>