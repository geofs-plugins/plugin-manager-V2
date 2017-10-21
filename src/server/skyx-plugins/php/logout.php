<?
session_start();
$_SESSION["login"] = "";
session_destroy();
session_write_close();
header("Location: /");
?>