<?php 
  include_once('../includes/session.php');
  include_once('../templates/tpl_common.php');
  include_once('../templates/tpl_houses.php');
  include_once('../database/db_houses.php');
  
  if (!isset($_SESSION['username']))
    die(header('Location: login.php'));

  $id = $_GET['id'];

  draw_header($_SESSION['username'], "../js/house.js");
  $house = getHouseByID($id);
  if($house->title==null) {
    $_SESSION['messages'][] = array('type' => 'error', 'content' => 'The house you searched for is no longer available.');
    die(header('Location: search_houses.php'));
  }
  $pictures = getHousePhotoPathsByID($id);
  draw_house($house, $pictures);
  draw_footer();
?>