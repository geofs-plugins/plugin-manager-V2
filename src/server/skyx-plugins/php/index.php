<?php
require_once("fs");
session_start();

if (isset($_SESSION["login"]) && $_SESSION["login"] == file_get_contents($fs . "/login_hash.txt")) {
    header("Location: panel.php");
    die();
}

?>
<html>
<head>
    <title>SkyX admin login</title>
    <script>
    <?php require_once("../js/jquery.js"); ?>
    </script>
    <script>
        $(document).ready(function() {
            $("#btn_login").click(function() {
                $.ajax({
                    url: "login_back.php",
                    type: "POST",
                    data: {
                        login: $("#txt_pass").val()
                    },
                    success: function(e) {
                        if (e == "login ok") {
                            alert("login ok");
                            location.href = "panel.php";
                        }
                    }
                });
            });
        });
    </script>
</head>
<body>
    <h1>Verify your identity</h1>
    Please enter the SkyX admin password:
    <input type="password" id="txt_pass" />
    <br/>
    <button id="btn_login">Login</button>
</body>
</html>