//calls the extra components the server needs to run properly
var http = require('http');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

//variables to do with user currently accessing the database
var loggedIn = false;
var role = '';
var username = '';

//creates the connection for the person to connect to
const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8081 });
var ws = require('ws');
//sends the role of the user to the person so that the pages
//can hide buttons in the nav bar
wss.on('connection', (function(wsN) {
  ws = wsN;
  ws.send('role,' + role);
  ws.send('role$' + role);

}));

//creates a connection for the database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root"
});

//attemps to connect to the database
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected! Testing Database");
  //checks if the schema is created, if not one is created
  con.query("CREATE DATABASE IF NOT EXISTS mydb", function (e, r) {
    if (e) throw e;
    console.log("Database Is Available!");

    //creates a connection to the schema
    con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "mydb"
    });

    //attemps to connect to the schema
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected With Database!");
      //checks if a user table exists, if not one is created
      con.query("CREATE TABLE IF NOT EXISTS usertable (username VARCHAR(20) PRIMARY KEY, password VARCHAR(20), role VARCHAR(20), firstname VARCHAR(20), lastname VARCHAR(20))", function (err, result) {
        if (err) throw err;
        console.log("User Table Available!");
        //checks if an admin account is available
        con.query("SELECT * FROM usertable WHERE username = 'admin' AND password = 'admin' AND role = 'admin'", function (err, result) {
          if (err) throw err;
          if (result.length == 0) {
            console.log("Admin User Does Not Exist. Creating Admin Now...");
            //inserts an admin account into the user table
            //only run if the admin does not already exist
            con.query("INSERT INTO usertable (username, password, role, firstname, lastname) VALUES ('admin', 'admin', 'admin', 'admin', 'admin')", function (e, r) {
              if (e) throw e;
              console.log("Admin User Created!");
            });
          }
          else {
            console.log("Admin Available!");
          }
        });
      });

    

      //checks if a use case table exists, if not one is created
      con.query("CREATE TABLE IF NOT EXISTS usecasetable (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(30), killchain VARCHAR(50), impact VARCHAR(200), " +
                "queries VARCHAR(500), clienttracking VARCHAR(200), actionsrequired VARCHAR(200), tags VARCHAR(100), version VARCHAR(20), username VARCHAR(20))", function (err, result) {
        if (err) throw err;
        console.log("Item Table Available!");
      });

      //checks if a use case history table exists, if not one is created
      con.query("CREATE TABLE IF NOT EXISTS usecasetablehistory (idh INT PRIMARY KEY AUTO_INCREMENT, id INT, title VARCHAR(30), killchain VARCHAR(50), impact VARCHAR(200), " +
                "queries VARCHAR(500), clienttracking VARCHAR(200), actionsrequired VARCHAR(200), tags VARCHAR(100), version VARCHAR(20), username VARCHAR(20))", function (err, result) {
        if (err) throw err;
        console.log("Item Table Available!");
      });
    });
  });
});

//creates the server connection for the web pages
http.createServer(function (request, response) {
  if (request.method == 'GET') {
    ReadPage('.' + request.url, response);
  }
  else if (request.method == 'POST') {
    request.on('data', function(chunk) {
      var data = chunk.toString().split(',');
      if (data.length == 0)
        return;
      //determines what type of data the is sent and what to do with the database
      //here is also some security for the different roles that send the data
      switch (data[0]) {
        case 'login':
          if (data.length < 3)
            break;
          LoginUser(data[1], data[2])
          break;
        case 'adduser':
          if (data.length < 6)
            break;
          if (role != 'admin')
            break;
          AddUser(data[1], data[2], data[3].toLowerCase(), data[4], data[5]);
          break;
        case 'searchuser':
          SearchUser(chunk.toString());
          break;
        case 'edituser':
          if (role != 'admin')
            break;
          EditUser(data[1]);
          break;
        case 'saveuser':
          if (role != 'admin')
            break;
          SaveUser(data[1], data[2], data[3], data[4], data[5]);
          break;
        case 'deleteuser':
          if (role != 'admin')
            break;
          DeleteUser(data[1]);
          break;
  
        case 'addusecase':
          if (role == 'trainee')
            break;
          if (data.length < 8) {
            ws.send("failed, not enough values");
            break;
          }
          AddUsecase(data[1], data[2], data[3], data[4], data[5], data[6], data[7], "1." + GetDate());
          break;
        case 'searchusecase':
          SearchUseCase(chunk.toString());
          break;
        case 'editusecase':
          EditUseCase(data[1]);
          break;
        case 'saveusecase':
          if (role == 'trainee')
            break;
          SaveUseCase(chunk.toString());
          break;
        case 'deleteusecase':
          if (role == 'trainee')
            break;
          DeleteUseCase(data[1]);
          break;
        case 'rollbackusecase':
          if (role == 'trainee')
            break;
          RollbackUseCase(data[1], data[2]);
          break;
        case 'logout':
          loggedIn = false;
          role = '';
          console.log("Logout Successful!");
          break;
        default:
          return;
      }
    });
  }
}).listen(8080);

//gets the current data in the dormat of ddmmyyyy
//used in the version number generation
function GetDate() {
  var date = new Date();
  var day = date.getDate();
  day = day < 10 ? '0' + day : day;
  var month = date.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  var year = date.getFullYear();
  return day.toString() + month.toString() + year.toString();
}


function ReadPage(filePath, response) {
  var filePathSplit = filePath.split('.');
  var fileType = 'html';
  if (filePathSplit.length == 3) {
    fileType = filePathSplit[2];
  }
  //If user tries to access a page without being logged in
  if (!loggedIn && filePath != './login.html' && fileType == 'html') {
    response.writeHead(302, { 'Location': 'http://localhost:8080/login.html' });
    response.end();
    return;
  }
  //If user tries to access login page with already being logged in
  if (loggedIn && filePath == './login.html' && fileType == 'html') {
    response.writeHead(302, { 'Location': 'http://localhost:8080/SeachItem.html' });
    response.end();
    return;
  }
  //If user not admin tries to access add user page
  if ((loggedIn && role != 'admin' && filePath == './addUser.html' && fileType == 'html') ||
      (loggedIn && role != 'admin' && filePath == './searchUser.html' && fileType == 'html') ||
      (loggedIn && role != 'admin' && filePath == './editUser.html' && fileType == 'html')) {
    response.writeHead(302, { 'Location': 'http://localhost:8080/SeachItem.html' }); //change these 3 to seaItem from SeachUseCase
    response.end();
    return;
  }

  //if user traniee and tries to access any of the add pages
  if ((loggedIn && role == 'trainee' && filePath == './addItem.html' && fileType == 'html') ||
      (loggedIn && role == 'trainee' && filePath == './addItem.html' && fileType == 'html')) {
    response.writeHead(302, { 'Location': 'http://localhost:8080/SeachItem.html' });
    response.end();
    return;
  }

  var extname = String(path.extname(filePath)).toLowerCase();
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml'
  };


  var contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function(error, content) {
    response.writeHead(200, { 'Content-Type': contentType });
    response.write(content);
    response.end();
  });
}


function LoginUser(user, password) {
  con.query("SELECT * FROM usertable WHERE username = '" + user + "'", function (err, result) {
    if (result.length > 0){
      if (password == result[0].password){
        console.log("Login Success");
        loggedIn = true;
        role = result[0].role;
        username = result[0].username;
      }
      else {
        console.log("Login Unsuccessful");
        
      }
    }
    else {
      console.log("Login Unsuccessful");
  
    }
  });
}

//attemps to add a new user to the user table with the supplied data
function AddUser(firstName, lastName, username, password, role) {
  if (firstName == '' || lastName == '' || username == '' || password == '' || role == '') {
    ws.send("failed,One of the fields is empty.");
    return;
  }

  con.query("SELECT * FROM usertable WHERE username = '" + username + "'", function (e, r) {
    if (e) throw e;
    if (r.length == 0) {
      console.log("User Does Not Exist. Creating User Now...")
      con.query("INSERT INTO usertable (username, password, role, firstname, lastname) VALUES ('" +
      username + "', '" + password + "', '" + role + "', '" + firstName + "', '" + lastName + "')", function (e, r) {
        if (e) throw e;
        ws.send("success,");
        console.log("User Created!");
      });
    }
    else {
      ws.send("failed,User already exists.");
      console.log("User Already Exists.");
    }
  });
}

//searchs the user table

function SearchUser(chunk) {
  var values = chunk.split(',');
  var filters = [ values[1], values[2], values[3], values[4] ];
  var searchValue = values[5];
  var query = '';
  var all = true;
  for (var i = 0; i < filters.length; i++) {
    if (filters[i] == '1') {
      all = false;
      break;
    }
  }
  if (searchValue != '') {
    if (all) {
        query = " WHERE username LIKE '%" + searchValue + "%' OR role LIKE '%" + searchValue + "%' OR " +
                "firstname LIKE '%" + searchValue + "%' OR lastname LIKE '%" + searchValue + "%'";
    } else {
      query = " WHERE ";
      var notFirst = false;
      if (filters[0] == '1') {
        query += "username LIKE '%" + searchValue + "%'";
        notFirst = true;
      }
      if (filters[1] == '1') {
        if (notFirst) {
          query += " AND role LIKE '%" + searchValue + "%'";
        }
        else {
          query += "role LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[2] == '1') {
        if (notFirst) {
          query += " AND firstname LIKE '%" + searchValue + "%'";
        }
        else {
          query += "firstname LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[3] == '1') {
        if (notFirst)
          query += " AND lastname LIKE '%" + searchValue + "%'";
        else
          query += "lastname LIKE '%" + searchValue + "%'";
      }
    }
  }
  con.query("SELECT * FROM usertable" + query, function (err, result, fields) {
    if (err) throw err;
    var content = "";
    for (var i = 0; i < result.length; i++) {
      if (i > 0)
        content += ';';
      content += result[i].firstname + ',' + result[i].lastname + ',' + result[i].username + ',' + result[i].role;
    }
    ws.send(content);
  });
}


function EditUser(username) {
  con.query("SELECT * FROM usertable WHERE username = '" + username + "'", function (err, result, fields) {
    if (err) throw err;
    var content = 'details,';
    if (result.length > 0) {
      content += result[0].firstname + ',' + result[0].lastname + ',' + result[0].username + ',' +
                result[0].password + ',' + result[0].role;
    }
    ws.send(content);
  });
}


function SaveUser(username, password, role, firstName, lastName) {
  con.query("UPDATE usertable SET password = '" + password + "', role = '" + role + "', firstname = '" +
            firstName + "', lastname = '" + lastName + "' WHERE username = '" + username + "'", function (err, result) {
    if (err) throw err;
    var content = "update," + result.affectedRows;
    ws.send(content);
  });
}


function DeleteUser(username) {
  con.query("DELETE FROM usertable WHERE username = '" + username + "'", function (err, result) {
    if (err) throw err;
    var content = "delete," + result.affectedRows;
    ws.send(content);
  });
}




function AddUsecase (title, killchain, impact, queries, clientTracking, actions, tags, version) {
  if (title == '' || killchain == '' || impact == '' || queries == '' || clientTracking == '' || actions == '' ||
      tags == '' || version == '') {
    ws.send("failed,One of the fields is empty.");
    return;
  }
  con.query("INSERT INTO usecasetable (id, title, killchain, impact, queries, clienttracking, actionsrequired, tags, version, username) " +
            "VALUES (NULL, '" + title + "', '" + killchain + "', '" + impact + "', '" + queries + "', '" + clientTracking + "', '" +
            actions + "', '" + tags + "', '" + version + "', '" + username + "')", function (e, r) {
    if (e) throw e;
    con.query("INSERT INTO usecasetablehistory (idh, id, title, killchain, impact, queries, clienttracking, actionsrequired, tags, version, username) VALUES (NULL, '" + r.insertId + "', '" +
              title + "', '" + killchain + "', '" + impact + "', '" + queries + "', '" + clientTracking + "', '" + actions +
              "', '" + tags + "', '" + version + "', '" + username + "')", function (e, r) {
      if (e) throw e;
    });
    ws.send("success,");
    console.log("Item Created!");
  });
}


function SearchUseCase(chunk) {
  var values = chunk.split(',');
  var filters = [ values[1], values[2], values[3], values[4], values[5], values[6], values[7], values[8], values[9] ];
  var searchValue = values[10];
  var query = '';
  var all = true;
  for (var i = 0; i < filters.length; i++) {
    if (filters[i] == '1') {
      all = false;
      break;
    }
  }
  if (searchValue != '') {
    if (all) {
        query = " WHERE id LIKE '%" + searchValue + "%' OR title LIKE '%" + searchValue + "%' OR " +
                "killchain LIKE '%" + searchValue + "%' OR impact LIKE '%" + searchValue + "%' OR " +
                "queries LIKE '%" + searchValue + "%' OR clienttracking LIKE '%" + searchValue + "%' OR " +
                "actionsrequired LIKE '%" + searchValue + "%' OR tags LIKE '%" + searchValue + "%'";
    } else {
      query = " WHERE ";
      var notFirst = false;
      if (filters[0] == '1') {
        query += "id LIKE '%" + searchValue + "%'";
        notFirst = true;
      }
      if (filters[1] == '1') {
        if (notFirst) {
          query += " AND title LIKE '%" + searchValue + "%'";
        }
        else {
          query += "title LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[2] == '1') {
        if (notFirst) {
          query += " AND killchain LIKE '%" + searchValue + "%'";
        }
        else {
          query += "killchain LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[4] == '1') {
        if (notFirst) {
          query += " AND impact LIKE '%" + searchValue + "%'";
        }
        else {
          query += "impact LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[5] == '1') {
        if (notFirst) {
          query += " AND queries LIKE '%" + searchValue + "%'";
        }
        else {
          query += "queries LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[6] == '1') {
        if (notFirst) {
          query += " AND clienttracking LIKE '%" + searchValue + "%'";
        }
        else {
          query += "clienttracking LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[7] == '1') {
        if (notFirst) {
          query += " AND actionsrequired LIKE '%" + searchValue + "%'";
        }
        else {
          query += "actionsrequired LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
      if (filters[8] == '1') {
        if (notFirst) {
          query += " AND tags LIKE '%" + searchValue + "%'";
        }
        else {
          query += "tags LIKE '%" + searchValue + "%'";
          notFirst = true;
        }
      }
    }
  }
  if (query == " WHERE ")
    query = "";
  var max = 0;
  var count = 0;
  var gResult;
  con.query("SELECT * FROM usecasetable" + query, function (err, result, fields) {
    if (err) throw err;
    gResult = result;
    max = result.length;
    var content = "";
    if (result.length == 0)
      ws.send(content);
    for (var i = 0; i < result.length; i++) {
      var clients = result[i].clienttracking.split(",");
      var cQuery = " WHERE (name = '" + clients[0] + "'";
      for (var j = 1; j < clients.length; j++) {
        cQuery += " OR name = '" + clients[j] + "'";
      }
      cQuery += ")";
      if (filters[3] == '1') {
        cQuery += " AND (capabilitysummary LIKE '%" + searchValue + "%')";
      }
      con.query("SELECT * FROM clienttable" + cQuery, function (e, r, f) {
        if (e) throw e;
        var index = count;
        var prereq = '';
        if (r.length > 0) {
          for (var j = 0; j < r.length; j++) {
            if (j > 0)
              prereq += "     ";
            prereq += r[j].capabilitysummary;
          }
          var addRow = false;
          if (all && searchValue != '') {
            if (gResult[index].id.toString().includes(searchValue))
              addRow = true;
            else if (gResult[index].title.toString().includes(searchValue))
              addRow = true;
            else if (gResult[index].killchain.toString().includes(searchValue))
              addRow = true;
            else if (prereq.includes(searchValue))
              addRow = true;
            else if (gResult[index].impact.toString().includes(searchValue))
              addRow = true;
            else if (gResult[index].queries.toString().includes(searchValue))
              addRow = true;
            else if (gResult[index].clienttracking.toString().includes(searchValue))
              addRow = true;
            else if (gResult[index].actionsrequired.toString().includes(searchValue))
              addRow = true;
            else if (gResult[index].tags.toString().includes(searchValue))
              addRow = true;
          } else
            addRow = true;
          if (addRow) {
            if (content != "")
              content += ';';
            content += gResult[index].id + '$' + gResult[index].title + '$' + gResult[index].killchain +
            '$' + prereq + '$' + gResult[index].impact + '$' + gResult[index].queries + '$' + gResult[index].clienttracking +
            '$' + gResult[index].actionsrequired + '$' + gResult[index].tags;
          }
        } else if (filters[3] != '1') {
          if (content != "")
            content += ';';
          content += gResult[index].id + '$' + gResult[index].title + '$' + gResult[index].killchain +
          '$' + prereq + '$' + gResult[index].impact + '$' + gResult[index].queries + '$' + gResult[index].clienttracking +
          '$' + gResult[index].actionsrequired + '$' + gResult[index].tags;
        }
        count++;
        if (count == max)
          ws.send(content);
      });
    }
  });
}

//finds the use case the Deigner wants to edit and sends the
//informaiton to the Deigner
function EditUseCase(id) {
  var currentVersion = "";
  var gResult;
  con.query("SELECT * FROM usecasetable WHERE id = '" + id + "'", function (err, result, fields) {
    if (err) throw err;
    gResult = result;
    currentVersion = result[0].version;
    var clients = result[0].clienttracking.split(',');
    var query = " WHERE name = '" + clients[0] + "'";
    for (var i = 1; i < clients.length; i++) {
      query += " OR name = '" + clients[i] + "'";
    }
    con.query("SELECT * FROM clienttable" + query, function (e, r, f) {
      if (e) throw e;
      var prereq = '';
      for (var i = 0; i < r.length; i++) {
        if (i > 0)
          prereq += "     ";
        prereq += r[i].capabilitysummary;
      }
      var content = 'details$';
      content += gResult[0].id + '$' + gResult[0].title + '$' + gResult[0].killchain + '$' +
                 prereq + '$' + gResult[0].impact + '$' + gResult[0].queries + '$' +
                 gResult[0].clienttracking + '$' + gResult[0].actionsrequired + '$' +
                 gResult[0].tags + '$' + gResult[0].version + '$' + gResult[0].username;
      ws.send(content);
    });
  });
  con.query("SELECT * FROM usecasetablehistory WHERE id = '" + id + "'", function (err, result, fields) {
    if (err) throw err;
    var content = 'versions$';
    if (result.length > 0) {
      for (var i = result.length - 1; i > -1; i--) {
        if (currentVersion == result[i].version)
          continue;
        if (i < result.length - 2)
          content += ';';
        content += result[i].idh + '$' + result[i].title + '$' + result[i].killchain + '$' +
                   result[i].impact + '$' + result[i].queries + '$' +
                   result[i].clienttracking + '$' + result[i].actionsrequired + '$' +
                   result[i].tags + '$' + result[i].version + '$' + result[i].username;
      }
    }
    ws.send(content);
  })
}

//attemps to save the changes the user has made to the use case
function SaveUseCase(chunk) {
  var type = chunk.substring(0, chunk.indexOf(","));
  var content = chunk.substring(chunk.indexOf(",") + 1);
  var values = content.split('$');
  var version = '';
  con.query("SELECT * FROM usecasetable WHERE id = '" + values[0] + "'", function (err, result, fields) {
    if (err) throw err;
    if (result.length > 0) {
      version = result[0].version;
    }

    version = version.split(".")[0];
    var ver = parseInt(version, 10);
    ver++;
    version = ver.toString() + "." + GetDate();

    con.query("UPDATE usecasetable SET title = '" + values[1] + "', killchain = '" + values[2] + "', impact = '" + values[3] + "', queries = '" + values[4] +
              "', clienttracking = '" + values[5] + "', actionsrequired = '" + values[6] + "', tags = '" + values[7] + "', version = '" +
              version + "', username = '" + username + "' WHERE id = '" + values[0] + "'", function (err, result) {
      if (err) throw err;
      var content = "update$" + result.affectedRows;
      ws.send(content);

    });
    con.query("INSERT INTO usecasetablehistory (idh, id, title, killchain, impact, queries, clienttracking, actionsrequired, tags, version, username) VALUES (NULL, '" + values[0] + "', '" +
              values[1] + "', '" + values[2] + "', '" + values[3] + "', '" + values[4] + "', '" + values[5] + "', '" + values[6] +
              "', '" + values[7] + "', '" + version + "', '" + username + "')", function (e, r) {
      if (e) throw e;
    });
  });
}


function DeleteUseCase(id) {
  con.query("DELETE FROM usecasetable WHERE id = '" + id + "'", function (err, result) {
    if (err) throw err;
    var content = "delete$" + result.affectedRows;
    ws.send(content);
  });
  con.query("DELETE FROM usecasetablehistory WHERE id = '" + id + "'", function (err, result) {
    if (err) throw err;
  });
}

//attemps to roll back to a previous of the specified use case
function RollbackUseCase(id, version) {
  con.query("SELECT * FROM usecasetablehistory WHERE idh = '" + id + "' AND version = '" + version + "'", function (err, result, fields) {
    if (err) throw err;
    if (result.length > 0){
      var chunk = 'saveusecase,' + result[0].id + '$' + result[0].title + '$' + result[0].killchain + '$' +
                 result[0].impact + '$' + result[0].queries + '$' +
                 result[0].clienttracking + '$' + result[0].actionsrequired + '$' +
                 result[0].tags;
      SaveUseCase(chunk);
    }
  });
}