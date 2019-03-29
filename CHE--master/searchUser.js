//stores html elements in variables
var searchBar = document.getElementById("searchBar");
var fNameCheckbox = document.getElementById("fNameCheckbox");
var lNameCheckbox = document.getElementById("lNameCheckbox");
var usernameCheckbox = document.getElementById("usernameCheckbox");
var roleCheckbox = document.getElementById("roleCheckbox");
var tBody = document.getElementById("tBody");

//opens a connection with the server for communication
var ws = new WebSocket("ws://localhost:8080");
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
  var rows = message.split(";");
  tBody.innerHTML = "";
  if (rows[0] != "") {
    for (var i = 0; i < rows.length; i++) {
      var values = rows[i].split(",");
      var html = "<tr><td>" + values[0] + "</td>" +
                 "<td>" + values[1] + "</td>" +
                 "<td>" + values[2] + "</td>" +
                 "<td>" + values[3] + "</td>" +
                 "<td><button class='editButton' onClick='EditClick(\"" + values[2] + "\")'>Edit</button></td></tr>";
      tBody.innerHTML += html;
    }
  }
};
ws.onclose = function() {
  console.log("Connection is closed...");
}

SearchClick();

//this is called when the Search button is clicked
//checks which filters are enabled and then sends the
//information to the server
function SearchClick() {
  var filters = "";

  if (usernameCheckbox.checked)
    filters += "1";
  else
    filters += "0";

  if (roleCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (fNameCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (lNameCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  var search = "searchuser," + filters + "," + searchBar.value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(search);
}

//called when the edit button is clicked
//saves the user's username to storage for when the edit page loads
function EditClick(username) {
  localStorage.setItem("user", username);
  document.location.href = './editUser.html';
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
