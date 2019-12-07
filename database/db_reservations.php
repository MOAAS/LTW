<?php
    include_once('../includes/database.php');
    include_once('../includes/reservation.php');
    include_once('../database/db_users.php');
    include_once('../database/db_houses.php');

    function makeReservationArray($rows) {
        $reservations = array();
        foreach($rows as $row)
            array_push($reservations, new Reservation($row['id'], getHouseById($row['place']), $row['dateStart'], $row['dateEnd'], $row['username']));
        return $reservations;
    }

    function addReservation($from, $to, $username, $placeID) {
        $db = Database::instance()->db();

        $statement = $db->prepare('INSERT INTO Reservation VALUES (NULL, ?, ?, ?, ?)');

        $statement->execute(array($from, $to, getUserID($username), $placeID));
    }

    function getReservationByID($id) {
        $db = Database::instance()->db();
       
        $statement = $db->prepare(
            'SELECT Reservation.id, dateStart, dateEnd, place, username
            FROM Reservation JOIN User ON Reservation.user = User.id
            WHERE Reservation.id = ?'
        );

        $statement->execute(array($id));

        return makeReservationArray(array($statement->fetch()))[0];
    }

    function removeReservation($id) {
        $db = Database::instance()->db();
       
        $statement = $db->prepare(
            'DELETE FROM Reservation
            WHERE Reservation.id = ?'
        );

        $statement->execute(array($id));
    }

    
    function getGoingReservations($username) {
        $db = Database::instance()->db();
        
        $statement = $db->prepare(
            'SELECT Reservation.id, dateStart, dateEnd, place, username
            FROM Reservation JOIN User ON Reservation.user = User.id
            WHERE User.username = ?'
        );

        $statement->execute(array($username));

        return makeReservationArray($statement->fetchAll());
    }


    function getComingReservations($username) {
        $db = Database::instance()->db();
        
        $statement = $db->prepare(
            'SELECT Reservation.id, dateStart, dateEnd, place, username
            FROM Reservation JOIN User ON Reservation.user = User.id JOIN Place ON Reservation.place = Place.id 
            WHERE Place.owner = ?'
        );

        $statement->execute(array(getUserID($username)));

        return makeReservationArray($statement->fetchAll());
    }
?>