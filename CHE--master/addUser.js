//stores html elements in variables
var firstNameElement = document.getElementById("fNameAdd");
var fNameWrong = document.getElementById("fNameWrong");
var lastNameElement = document.getElementById("lNameAdd");
var lNameWrong = document.getElementById("lNameWrong");
var usernameElement = document.getElementById("usernameAdd");
var usernameWrong = document.getElementById("usernameWrong");
var passwordElement = document.getElementById("passwordAdd");
var passwordWrong = document.getElementById("passwordWrong");
var privilege = document.getElementById("selectPrivilege")

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
  var error = message.split(",")[1];
  if (result == "success") {
    window.alert("User Successfully Created");
    document.location.href = './addUser.html';
  } else if (result == "failed") {
    window.alert("User could not be created. Reason: " + error);
  }
};
ws.onclose = function() {
  console.log("Connection is closed...");
}

//Called when the Add button is clicked
//Checks if all fields are not empty
//sends off data to the server
function AddUserClick() {
  var formIncomplete = false;
  if (fNameAdd.value == "") {
    fNameWrong.style.display = "block";
    formIncomplete = true;
  }
  if (lNameAdd.value == "") {
    lNameWrong.style.display = "block";
    formIncomplete = true;
  }
  if (usernameAdd.value == "") {
    usernameWrong.style.display = "block";
    formIncomplete = true;
  }
  if (passwordAdd.value == "") {
    passwordWrong.style.display = "block";
    formIncomplete = true;
  }

  if (formIncomplete)
    return;

  var user = "adduser," + firstNameElement.value + "," + lastNameElement.value + "," + usernameElement.value + "," +
             passwordElement.value + "," + privilege.options[privilege.selectedIndex].value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(user);
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
