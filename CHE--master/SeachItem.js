 //stores html elements in variables
var searchBar = document.getElementById("searchBar");
var idCheckbox = document.getElementById("idCheckbox");
var titleCheckbox = document.getElementById("titleCheckbox");
var killchainCheckbox = document.getElementById("killchainCheckbox");
var prereqCheckbox = document.getElementById("prereqCheckbox");
var impactCheckbox = document.getElementById("impactCheckbox");
var queryCheckbox = document.getElementById("queryCheckbox");
var clientCheckbox = document.getElementById("clientCheckbox");
var actionCheckbox = document.getElementById("actionCheckbox");
var tagCheckbox = document.getElementById("tagCheckbox");
var tBody = document.getElementById("tBody");
var addUNav = document.getElementById("addUNav");
var searchUNav = document.getElementById("searchUNav");
var addCNav = document.getElementById("addCNav");
var addUCNav = document.getElementById("addUCNav");

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
  if (message.startsWith("role")) {
    var role = message.split(",")[1];
    if (role == "standard") {
      addUNav.style.display = "none";
      searchUNav.style.display = "none";
    } else if (role == "trainee") {
      addUNav.style.display = "none";
      searchUNav.style.display = "none";
      addCNav.style.display = "none";
      addUCNav.style.display = "none";
    }
  } else {
    var rows = message.split(";");
    tBody.innerHTML = "";
    if (rows[0] != "") {
      for (var i = 0; i < rows.length; i++) {
        var values = rows[i].split("$");
        var html = "<tr><td>" + values[0] + "</td>" +
                   "<td>" + values[1] + "</td>" +
                   "<td>" + values[2] + "</td>" +
                   "<td>" + values[3] + "</td>" +
                   "<td>" + values[4] + "</td>" +
                   "<td>" + values[5] + "</td>" +
                   "<td>" + values[6] + "</td>" +
                   "<td>" + values[7] + "</td>" +
                   "<td>" + values[8] + "</td>" +
                   "<td><button class='editButton' onClick='EditClick(\"" + values[0] + "\")'>Edit</button></td></tr>";
        tBody.innerHTML += html;
      }
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

  if (idCheckbox.checked)
    filters += "1";
  else
    filters += "0";

  if (titleCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (killchainCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (prereqCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (impactCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (queryCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (clientCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (actionCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  if (tagCheckbox.checked)
    filters += ",1";
  else
    filters += ",0";

  var search = "searchusecase," + filters + "," + searchBar.value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(search);
}

//called when the edit button is clicked
//saves the use csae id to storage for when the edit page loads
function EditClick(id) {
  localStorage.setItem("usecase", id);
  document.location.href = './EditItem.html';
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
