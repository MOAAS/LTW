<?php
  include_once('../includes/session.php');
  include_once('../database/db_users.php');
  
  $username = $_POST['username'];
  $password = $_POST['password'];
  $confirmPassword = $_POST['confirmPassword'];
  $fullName = $_POST['fullName'];

  if ($password != $confirmPassword) {
    $_SESSION['messages'][] = array('type' => 'error', 'content' => 'Sign up failed! Passwords do not match!');
    header('Location: ../pages/signup.php');
  }
  else if (userExists($username)) {
    $_SESSION['messages'][] = array('type' => 'error', 'content' => 'Sign up failed! Username already exists!');
    header('Location: ../pages/signup.php');
  }
  else {
    addUser($username, $password, $fullName);
    $_SESSION['username'] = $username;
    $_SESSION['messages'][] = array('type' => 'success', 'content' => 'Successfully signed up!');
    header('Location: ../pages/search_houses.php');
  }
?>