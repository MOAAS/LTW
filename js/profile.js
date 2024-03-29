let csrfToken = document.getElementById('csrfToken').textContent;

let messageHistory = document.querySelector('#messageHistory ul');
let conversations = document.querySelector('#conversations');
let conversationList = document.querySelector('#conversations ul');
let currentConversation = null;
let username = document.getElementById('userProfileName').textContent;
let urlHash = decodeURIComponent(window.location.hash.substr(1));

// Profile

function hideAllTabs() {
    document.querySelectorAll('#profile .profileTab').forEach(tab => {
        tab.style.display = "none";
    });
}

function selectTabItem(tabItemName) {
    if (tabItemName == "")
        tabItemName = "Profile";
    window.location.hash = tabItemName;
    if (tabItemName.startsWith('Conversation'))
        tabItemName = "Messages";
    document.querySelectorAll('#profile nav li').forEach(tabItem => {
        if (tabItem.textContent == tabItemName)
            tabItem.classList.add('selectedTab')
        else tabItem.classList.remove('selectedTab')
    });
    updateTabs();
}

function updateTabs() {
    let selected = decodeURIComponent(window.location.hash);
    hideAllTabs();
    switch (selected) {
        case '#Profile': document.getElementById('editProfile').style.display = ""; break;
        case '#Your places': document.getElementById('yourPlaces').style.display = ""; break;
        case '#Add place': document.getElementById('manageHouse').style.display = ""; break;
        case '#Future guests': document.getElementById('comingReservations').style.display = ""; break;
        case '#Your reservations': document.getElementById('goingReservations').style.display = ""; break;
        case '#Messages': document.getElementById('conversations').style.display = ""; break;
        default: 
            if (selected.startsWith("#Conversation "))
                toConversation(selected.split(' ')[1]); 
            else console.log("lmao");
            break;
    }
}

let tabItems = document.querySelectorAll('#profile nav li');
tabItems.forEach(tabItem => {
    tabItem.addEventListener('click', _ => selectTabItem(tabItem.textContent));        
});
if (urlHash == "Conversation " + username)
    selectTabItem('Messages');
else selectTabItem(urlHash);

// Your places
function onHouseDeleted(house, response) {
    if (response == null) {
        house.style.transform = "scale(0)";
        setTimeout(() => {
            house.remove();
            if (document.querySelectorAll('#houses ul li').length != 0)
                return;
            let yourPlaces = document.getElementById('yourPlaces')
            yourPlaces.classList.add('noContent');
            yourPlaces.innerHTML =
                '<h2>Your Places</h2>' + 
                '<p>Looks like you dont have any place yet!</p>' +
                '<button id="addHouseButton" type="button">Add a Place</button>';      
            document.getElementById('addHouseButton').addEventListener('click', () => selectTabItem('Add place'))    
        }, 300);
    }
    else selectTabItem('Future guests');
}

document.querySelectorAll('#houses li').forEach((place) => {
    let deleteButton = place.querySelector('.deleteButton');
    let editButton = place.querySelector('.editButton');
    let houseID = place.querySelector('.houseID').textContent;
    deleteButton.addEventListener('click', event => {
        if (deleteButton.innerHTML == '<i class="fas fa-trash"></i>')
            addButtonAnimation(deleteButton, "green", '<i class="fas fa-check"></i>', '<i class="fas fa-trash"></i>')
        else sendPostRequest('../actions/action_deleteHouse.php', {houseID: houseID, csrf: csrfToken}, function() { onHouseDeleted(place, JSON.parse(this.responseText)) }) 
    });
    editButton.addEventListener('click', _ => window.location.href = "edit_house.php?id=" + houseID)
});

// Reservations

function updateReservations() {
    if (reservationGoing.querySelectorAll('.reservation').length == 0) {
        reservationGoing.classList.add('noContent');
        reservationGoing.innerHTML = 
            '<h2>Future Guests</h2>' + 
            '<p>You haven\'t booked any reservations yet!</p>' +
            '<button type="button"><a href="../pages/main.php">Search for houses</a></button>'   
    }
    if (reservationComing.querySelectorAll('.reservation').length == 0) {
        reservationComing.classList.add('noContent');
        reservationComing.innerHTML = 
            '<h2>Future Guests</h2>' + 
            '<p>You haven\'t received any reservations yet!</p>' + 
            '<button id="checkPlacesButton" type="button">Check your places</button>';    
        document.getElementById('checkPlacesButton').addEventListener('click', () => selectTabItem('Your places'));           
    }
}

function removeReservation(reservation, button) {
    if (button.textContent == "Cancel Reservation")
        addButtonAnimation(button, "red", '<i class="fas fa-trash"></i> Confirm action', "Cancel Reservation");
    else {
        reservation.style.transform = "scale(0)";
        setTimeout(() => {
            sendPostRequest('../actions/action_cancelReservation.php', {reservationID: reservation.querySelector('.reservationID').textContent, csrf: csrfToken });
            reservation.remove(); 
            updateReservations(); 
        }, 300);
    }
}

let reservations = document.querySelectorAll('.reservationList .reservation');
let reservationGoing = document.querySelector('#goingReservations');
let reservationComing = document.querySelector('#comingReservations');

reservations.forEach(reservation => {
    if (reservation.id == 'comingReservations')
        reservation.querySelector('.reservationGuest h3').addEventListener('click', () => selectTabItem('Conversation ' + guest.textContent));

    let reviewReservationBtn = reservation.querySelector('.reviewReservation');
    let cancelReservationBtn = reservation.querySelector('.cancelReservation');
    if (cancelReservationBtn != null) {
        cancelReservationBtn.addEventListener('click', (event) => removeReservation(reservation, event.target));
    }
    if (reviewReservationBtn != null) {
        let otherCells = reservation.querySelectorAll('td:not(:last-child)')
        let reviewForm = reservation.querySelector('.reviewForm');
        let closeFormBtn = reviewForm.querySelector('.closeForm');
        let sendReviewBtn = reviewForm.querySelector('button');

        let toggleForm = () => {
            reviewForm.classList.toggle('hidden');
            otherCells.forEach(cell => cell.classList.toggle('hidden'));
        }

        closeFormBtn.addEventListener('click', toggleForm)
        reviewReservationBtn.addEventListener('click' , toggleForm)
        reviewForm.addEventListener('submit', event => {
            event.preventDefault();
            let reviewContent = reviewForm.querySelector('textarea');
            let reviewRating = reviewForm.querySelector('.rating input:checked');
            if (reviewRating == null)
                return addButtonAnimation(sendReviewBtn, "red", "Must pick a rating", "Review")
            else if (reviewContent.value == "")
                return addButtonAnimation(sendReviewBtn, "red", "Can't be empty", "Review")
            else if (sendReviewBtn.textContent == "Review")
                return addButtonAnimation(sendReviewBtn, "green", "Confirm review", "Review")
            sendPostRequest("../actions/action_addRating.php", {
                reservationID: reservation.querySelector('.reservationID').textContent,
                content: reviewContent.value,
                numStars: parseInt(reviewRating.id.substr(0, 1))
            })
            reviewReservationBtn.outerHTML = '<button type="button" disabled>Reservation reviewed</button>'
            toggleForm();     
        })
    }
});

let reservationGuests = document.querySelectorAll('#comingReservations .reservationGuest h3');
reservationGuests.forEach(guest => {
    if (guest.textContent != username)
        guest.addEventListener('click', () => selectTabItem('Conversation ' + guest.textContent));
});

// Conversations

function scrollConversationToBottom() {
    let scrollable = document.querySelector('#messageHistory');
    scrollable.scrollTop = scrollable.scrollHeight;
}

function appendMessage(content, wasSent, sendTime) {
    let message = document.createElement('li');
    message.classList.add('message');
    if (wasSent == true)
        message.classList.add('sentMessage');
    else message.classList.add('receivedMessage');

    message.innerHTML += "<p>" + htmlEntities(content) + "</p>"
    message.innerHTML += '<small class="messageDate">' + htmlEntities(sendTime)  + '</small>'        
    messageHistory.appendChild(message);
}

function updateConversation(conversation, content) {
    let date = timeToString(new Date());
    conversation.querySelector('p').innerHTML = htmlEntities(content);
    conversation.querySelector('.messageDate').innerHTML = htmlEntities(date);
    conversation.remove();
    conversationList.insertBefore(conversation, conversationList.firstChild);
    return date;
}

function onConversationLoad() {
    let messages = JSON.parse(this.responseText);
    if (messages == null) {
        currentConversation.remove();
        backToConversations();
        return;
    }

    for (let i = 0; i < messages.length; i++) {
        appendMessage(messages[i].content, messages[i].wasSent, messages[i].sendTime);
    }
    scrollConversationToBottom();
}

function findConversation(username) {
    let allConversations = document.querySelectorAll("#conversations .conversation");
    for (let i = 0; i < allConversations.length; i++) {
        if (allConversations[i].querySelector('h3').textContent == username)
            return allConversations[i];
    }
    let newConversation = document.createElement('li');
    newConversation.classList.add('conversation');
    newConversation.innerHTML = 
        '<img src="../database/profileImages/defaultPic/default.png" alt="UserPhoto"></img>' +
        '<h3>' + username + '</h3>' +
        '<p></p>' + 
        '<small class="messageDate"></small>'
    if (conversationList == null) {
        conversationList = document.createElement('ul');
        conversations.querySelector('p').remove();
        conversations.classList.remove('noContent');
        conversations.classList.add('reducedWidth');
        conversations.appendChild(conversationList);
    }
    conversationList.insertBefore(newConversation, conversationList.firstChild);
    return newConversation
}

function toConversation(username) {
    messageHistory.innerHTML = "";
    sendGetRequest('../api/get_conversation.php',
    {
        otherUser: username
    }, onConversationLoad);

    window.location.hash = "Conversation " + username;

    currentConversation = findConversation(username);
    currentConversation.classList.add('seenMessage');

    hideAllTabs();
    document.querySelector('#sendMessageInput textarea').value = "";
    document.querySelector('#messages header img').src = currentConversation.querySelector('img').src;
    document.getElementById('conversations').style.display = "none";
    document.querySelector('#messages header h2').textContent = username;
    document.getElementById('messages').style.display = "";
}

function backToConversations() {
    currentConversation = null;
    document.getElementById('conversations').style.display = "";
    document.getElementById('messages').style.display = "none";
    window.location.hash = "Messages"
}

// Messages

let sendMsgForm = document.querySelector('#messages #sendMessageInput form');
let sendMsgInput = sendMsgForm.querySelector('#sentMessage');
sendMsgForm.addEventListener('submit', (event) => sendMessage(event));

function sendMessage(event) {
    event.preventDefault();
    let content = sendMsgInput.value
    if (content == "")
        return;
    sendPostRequest('../actions/action_sendMessage.php',
    {
        receiverUsername: document.querySelector('#messages header h2').textContent,
        content: content
    });
    let timeStamp = updateConversation(currentConversation, content);
    currentConversation.classList.add('sentMessage');
    currentConversation.classList.remove('receivedMessage');
    appendMessage(content, true, timeStamp);
    sendMsgInput.value = "";
    scrollConversationToBottom();
}

document.querySelectorAll('#conversations .conversation').forEach(conversation => {
    conversation.addEventListener('click', (_) => toConversation(conversation.querySelector('h3').textContent));
});

document.querySelector('#messages #messageBack').addEventListener('click', backToConversations);

// coisas do doni

let profilePicInput = document.getElementById("profilePic");
profilePicInput.addEventListener("change",()=>{
    previewImages(event,"preview");
});

let filesInput = document.getElementById("files");
filesInput.addEventListener("change",()=>{
    previewImages(event,"result");
});

const addHouseButton = document.getElementById('addHouseButton');
if (addHouseButton != null)
    addHouseButton.addEventListener('click', () => selectTabItem('Add place'));

const checkPlacesButton = document.getElementById('checkPlacesButton');
if (checkPlacesButton != null)
    checkPlacesButton.addEventListener('click', () => selectTabItem('Your places'));

const searchPlacesButton = document.getElementById('searchPlacesButton');
if (searchPlacesButton != null)
    searchPlacesButton.addEventListener('click', () => window.location.href =  "../pages/main.php");

const firstswitch = document.getElementById('one');
const secondswitch = document.getElementById('two');
if (currentTheme == 'dark') 
   secondswitch.checked = true;
const thirdswitch = document.getElementById('three');
if (currentTheme == 'xmas') 
    thirdswitch.checked = true;

firstswitch.addEventListener('change', ()=>{
    changeTheme('light');
});
secondswitch.addEventListener('change', ()=>{
    changeTheme('dark');
});
thirdswitch.addEventListener('change', ()=>{
    changeTheme('xmas');
});


let menuprofilebutton = document.getElementById('menuprofilebutton');
menuprofilebutton.addEventListener("click",()=>{
    window.location.href ="../pages/profile.php#Profile";
    window.location.reload(false);
});
let menuyourplacesbutton = document.getElementById('menuyourplacesbutton');
menuyourplacesbutton.addEventListener("click",()=>{
    window.location.href ="../pages/profile.php#Your places";
    window.location.reload(false);
});
let menuaddplacebutton = document.getElementById('menuaddplacebutton');
menuaddplacebutton.addEventListener("click",()=>{
    window.location.href ="../pages/profile.php#Add place";
    window.location.reload(false);
});
let menufutureguestsbutton = document.getElementById('menufutureguestsbutton');
menufutureguestsbutton.addEventListener("click",()=>{
    window.location.href ="../pages/profile.php#Future guests";
    window.location.reload(false);
});
let menuyourreservationsbutton = document.getElementById('menuyourreservationsbutton');
menuyourreservationsbutton.addEventListener("click",()=>{
    window.location.href ="../pages/profile.php#Your reservations";
    window.location.reload(false);
});
let menumessagesbutton = document.getElementById('menumessagesbutton');
menumessagesbutton.addEventListener("click",()=>{
    window.location.href ="../pages/profile.php#Messages";
    window.location.reload(false);
});
