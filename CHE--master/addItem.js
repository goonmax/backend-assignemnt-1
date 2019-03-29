//stores html elements in variables
var titleElement = document.getElementById("titleAdd");
var titleWrong = document.getElementById("titleWrong");
var killchainElement = document.getElementById("killchainAdd");
var killchainWrong = document.getElementById("killchainWrong");
var impactElement = document.getElementById("impactAdd");
var impactWrong = document.getElementById("impactWrong");
var queryElement = document.getElementById("queriesAdd");
var queryWrong = document.getElementById("queriesWrong")
var clientElement = document.getElementById("clientAdd");
var clientWrong = document.getElementById("clientWrong");
var actionElement = document.getElementById("actionsAdd");
var actionWrong = document.getElementById("actionsWrong");
var tagElement = document.getElementById("tagsAdd");
var tagWrong = document.getElementById("tagsWrong");
var addUNav = document.getElementById("addUNav");
var searchUNav = document.getElementById("searchUNav");

//opens a connection with the server for communication
var ws = new WebSocket("ws://localhost:8081");
ws.onopen = function (event) {
  console.log('Connection is open ...');
};
ws.onerror = function (err) {
  console.log('err: ', err);
};
//messages are received here and are in the format of
//commas seperating the information.
ws.onmessage = function (event) {
  var message = event.data.toString();
  var result = message.split(",")[0];
  var detail = message.split(",")[1];
  if (result == "success") {
    window.alert(" Successfully Created");
    document.location.href = './addItem.html';
  } else if (result == "failed") {
    window.alert(" could not be created. Reason: " + detail);
  } else if (result == "role") {
    if (detail == "standard") {
      addUNav.style.display = "none";
      searchUNav.style.display = "none";
    }
  }
};
ws.onclose = function() {
  console.log("Connection is closed...");
}

//Called when the Add button is clicked
//Checks if all fields are not empty
//sends off data to the server
function AddUseCaseClick() {
  var formIncomplete = false;
  if (titleElement.value == "") {
    titleWrong.style.display = "block";
    formIncomplete = true;
  }
  if (killchainElement.value == "") {
    killchainWrong.style.display = "block";
    formIncomplete = true;
  }
  if (impactElement.value == "") {
    impactWrong.style.display = "block";
    formIncomplete = true;
  }
  if (queryElement.value == "") {
    queryWrong.style.display = "block";
    formIncomplete = true;
  }
  if (clientElement.value == "") {
    clientWrong.style.display = "block";
    formIncomplete = true;
  }
  if (actionElement.value == "") {
    actionWrong.style.display = "block";
    formIncomplete = true;
  }
  if (tagElement.value == "") {
    tagWrong.style.display = "block";
    formIncomplete = true;
  }

  if (formIncomplete)
    return;

  var usecase = "addusecase," + titleElement.value + "," + killchainElement.value + "," + impactElement.value + "," + queryElement.value +
                "," + clientElement.value + "," + actionElement.value + "," + tagElement.value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(usecase);
}

//Called when logout is clicked
//tells the server to log the user out and sends the user
//to the login page
function LogoutClick() {
  var user = "logout";
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(user);
  document.location.href = './login.html';
}
