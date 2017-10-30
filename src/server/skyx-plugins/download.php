<?php

require_once("fs");

header("Content-Type: text/plain;");
header("Access-Control-Allow-Origin: *");
echo file_get_contents($fs . "/files/skyx_core.user.js");