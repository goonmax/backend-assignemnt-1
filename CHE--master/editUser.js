//stores html elements in variables
var fNameInput = document.getElementById("fNameAdd");
var fNameWrong = document.getElementById("fNameWrong");
var lNameInput = document.getElementById("lNameAdd");
var lNameWrong = document.getElementById("lNameWrong");
var usernameInput = document.getElementById("usernameAdd");
var usernameWrong = document.getElementById("usernameWrong");
var passwordInput = document.getElementById("passwordAdd");
var passwordWrong = document.getElementById("passwordWrong");
var privilege = document.getElementById("selectPrivilege");

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
//the data before the comma is the type of informaiton
//being sent
ws.onmessage = function (event) {
  var message = event.data.toString();
  var values = message.split(",");
  if (values[0] == "details"){
    console.log(values);
    if (values.length > 1) {
      fNameInput.value = values[1];
      lNameInput.value = values[2];
      usernameInput.value = values[3];
      passwordInput.value = values[4];
      privilege.value = values[5];
    }
  } else if (values[0] == "update") {
    if (values.length > 1) {
      if (values[1] == "0") {
        alert("Could not update user, try again...");
      } else {
        alert("User details updated successfully");
        document.location.href = './searchUser.html';
      }
    }
  } else if (values[0] == "delete") {
    if (values.length > 1) {
      if (values[1] == "0") {
        alert("Could not delete user, try again...");
      } else {
        alert("User deleted successfully");
        document.location.href = './searchUser.html';
      }
    }
  }
};
ws.onclose = function() {
  console.log("Connection is closed...");
}

//gets the username from local storage and sends
//it off the server to get the information for that
//user
var username = localStorage.getItem("user");
console.log(username);
if (username != "") {
  var user = "edituser," + username;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(user);
}

//called when the Save button is clicked
//checks if all the fields are not empty
//sends off the new changes to the server
function SaveClick() {
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

  var user = "saveuser," + username + "," + passwordInput.value + "," + privilege.options[privilege.selectedIndex].value + "," +
             fNameInput.value + "," + lNameInput.value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(user);
}

//called when the delete button is clicked
//tells the server to delete the user
function DeleteClick() {
  var user = "deleteuser," + username;
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
