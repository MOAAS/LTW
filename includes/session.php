<?php
  session_start();

  date_default_timezone_set('UTC');
  
  function generate_random_token() {
    return bin2hex(openssl_random_pseudo_bytes(32));
  }

  if (!isset($_SESSION['csrf'])) {
    $_SESSION['csrf'] = generate_random_token();
  }

  function verifyCSRF($onFail) {
    if ($_SESSION['csrf'] != $_GET['csrf']) {
      addErrorMessage('Invalid request!');
      die(header("Location: $onFail"));
    }  
    else addSuccessMessage('SUPER SAFE BOIS');
  }
?>