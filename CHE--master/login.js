//stores html elements in variables
var usernameElement = document.getElementById("usernameElement");
var passwordElement = document.getElementById("passwordElement");

//called when the login button is clicked
//sends the username and password off to the Server
//for authentication
function LoginClick() {
  var user = "login," + usernameElement.value + "," + passwordElement.value;
  var request = XMLHttpRequest();
  request.open("POST", "", true);
  request.send(user);
  document.location.href = './login.html';
}
