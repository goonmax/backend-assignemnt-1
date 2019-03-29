//stores html elements in variables
var idInput = document.getElementById("idAdd");
var idWrong = document.getElementById("idWrong");
var titleInput = document.getElementById("titleAdd");
var titleWrong = document.getElementById("titleWrong");
var killchainInput = document.getElementById("killchainAdd");
var killchainWrong = document.getElementById("killchainAdd");
var prereqInput = document.getElementById("prereqAdd");
var impactInput = document.getElementById("impactAdd");
var impactWrong = document.getElementById("impactWrong");
var queryInput = document.getElementById("queryAdd");
var queryWrong = document.getElementById("queryWrong");
var clientInput = document.getElementById("clientAdd");
var clientWrong = document.getElementById("clientWrong");
var actionInput = document.getElementById("actionAdd");
var actionWrong = document.getElementById("actionWrong");
var tagInput = document.getElementById("tagAdd");
var tagWrong = document.getElementById("tagWrong");
var version = document.getElementById("versionlbl");
var username = document.getElementById("usernamelbl");
var addUNav = document.getElementById("addUNav");
var searchUNav = document.getElementById("searchUNav");
var addCNav = document.getElementById("addCNav");
var addUCNav = document.getElementById("addUCNav");
var sButton = document.getElementById("sButton");
var dButton = document.getElementById("dButton");

var role = "";
//opens a connection with the server for communication
var ws = new WebSocket("ws://localhost:8081");
ws.onopen = function (event) {
  console.log('Connection is open ...');
};
ws.onerror = function (err) {
  console.log('err: ', err);
};
//messages are received here and are in the format of
//dollar signs seperating the information.
//the data before the dollar sign is the type of informaiton
//being sent. Use of dollar sign here because  tracking
//uses commas for its seperation
ws.onmessage = function (event) {
  var message = event.data.toString();
  var type = message.substring(0, message.indexOf("$"));
  var content = message.substring(message.indexOf("$") + 1);
  if (type == "details") {
    var values = content.split("$");
    if (values.length > 1) {
      idInput.value = values[0];
      titleInput.value = values[1];
      killchainInput.value = values[2];
      prereqInput.value = values[3];
      impactInput.value = values[4];
      queryInput.value = values[5];
      clientInput.value = values[6];
      actionInput.value = values[7];
      tagInput.value = values[8];
      version.innerHTML = values[9];
      username.innerHTML = values[10];
    }
  } else if (type == 'versions') {
    var rows = content.split(";");
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
                   "<td>" + values[9] + "</td>";
        if (role == "trainee") {
          html += "</tr>";
        } else {
          html += "<td><button class='editButton' onClick='SelectClick(\"" + values[0] + "\"" + "," + "\"" + values[8] + "\")'>Select</button></td></tr>";
        }
        tBody.innerHTML += html;
      }
    }
  } else if (type == "update") {
    if (content != "") {
      if (content == "0") {
        alert("Could not update , try again...");
      } else {
        alert("details updated successfully");
        document.location.href = './SeachItem.html';
      }
    }
  } else if (type == "delete") {
    if (content != "") {
      if (content == "0") {
        alert("Could not delete Use Case, try again...");
      } else {
        alert(" deleted successfully");
        document.location.href = './SeachItem.html';
      }
    }
  } else if (type == "role") {
    role = content;
    if (content == "standard") {
      addUNav.style.display = "none";
      searchUNav.style.display = "none";
    } else if (content == "trainee") {
      addUNav.style.display = "none";
      searchUNav.style.display = "none";
      addCNav.style.display = "none";
      addUCNav.style.display = "none";
      titleInput.disabled = true;
      killchainInput.disabled = true;
      impactInput.disabled = true;
      queryInput.disabled = true;
      clientInput.disabled = true;
      actionInput.disabled = true;
      tagInput.disabled = true;
      sButton.style.display = "none";
      dButton.style.display = "none";
    }
  }
};
ws.onclose = function() {
  console.log("Connection is closed...");
}

//gets the use case id from local storage and sends
//it off the server to get the information for that
//use case
var usecaseID = localStorage.getItem("usecase");
if (usecaseID != "") {
  var usecase = "editusecase," + usecaseID;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(usecase);
}

//called when the Save button is clicked
//checks if all the fields are not empty
//sends off the new changes to the server
function SaveClick() {
  var formIncomplete = false;
  if (idInput.value == "") {
    idWrong.style.display = "block";
    formIncomplete = true;
  }
  if (titleInput.value == "") {
    titleWrong.style.display = "block";
    formIncomplete = true;
  }
  if (killchainInput.value == "") {
    killchainWrong.style.display = "block";
    formIncomplete = true;
  }
  if (impactInput.value == "") {
    impactWrong.style.display = "block";
    formIncomplete = true;
  }
  if (queryInput.value == "") {
    queryWrong.style.display = "block";
    formIncomplete = true;
  }
  if (clientInput.value == "") {
    clientWrong.style.display = "block";
    formIncomplete = true;
  }
  if (actionInput.value == "") {
    actionWrong.style.display = "block";
    formIncomplete = true;
  }
  if (tagInput.value == "") {
    tagWrong.style.display = "block";
    formIncomplete = true;
  }

  if (formIncomplete)
    return;

  var usecase = "saveusecase," + usecaseID + "$" + titleInput.value + "$" + killchainInput.value +
                "$" + impactInput.value + "$" + queryInput.value + "$" + clientInput.value + "$" + actionInput.value +
                "$" + tagInput.value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(usecase);
}

//called when the delete button is clicked
//tells the server to delete the use case
function DeleteClick() {
  var usecase = "deleteusecase," + usecaseID;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(usecase);
}

//called when the Select button is clicked in the
//previous version rows. tells the server to rollback
//to the selected version
function SelectClick(id, version) {
  var usecase = "rollbackusecase," + id + "," + version;
  console.log(usecase);
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
