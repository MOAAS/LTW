<?php
    include_once('../includes/session.php');
    include_once('../includes/htmlcleaner2000.php');
    include_once('../database/db_reservations.php');
    include_once('../database/db_notifications.php');

    if ($_SESSION['csrf'] !== $_POST['csrf']) {
        echo json_encode('Illegitimate request!' . $_SESSION['csrf'] . '   ' . $_POST['csrf']);
        return;
    }

    function validDate($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }


    $placeID = $_POST['placeID'];
    $userID = getUserID($_SESSION['username']);
    $checkIn = $_POST['checkIn'];
    $checkOut = $_POST['checkOut'];

   // sleep(1);
    $place = getHouseById($placeID);

    if ($userID == false)
        echo json_encode('User does not exist');
    else if ($place == false)
        echo json_encode('Place does not exist');
    else if (!validDate($checkIn))
        echo json_encode('Invalid Check In Date');
    else if (!validDate($checkOut))
        echo json_encode('Invalid Check Out Date');
    else if ($checkIn >= $checkOut || $checkIn < date('Y-m-d'))
        echo json_encode('Invalid date Range');
    else if (reservationOverlaps($placeID, $checkIn, $checkOut))
        echo json_encode('Overlapping reservation');
    else { 
        if ($place->ownerUsername != $_SESSION['username']) {
            sendNotification(
                $place->ownerUsername, 
                $_SESSION['username'] . " just made a reservation for " . dateString(DateTime::createFromFormat('Y-m-d', $checkIn)) . " (" . $place->title . ")", 
                "../pages/profile.php#Future%20guests");
        }
        addReservation($place->pricePerDay, $checkIn, $checkOut, $userID, $placeID);
        echo json_encode(null);
    }
?>