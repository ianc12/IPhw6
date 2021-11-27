// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express modules
var express = require("express");

// create an express application
var app = express();
const url = require('url');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// include the mysql module
var mysql = require("mysql");

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// A possible library helps reading uploaded file.
//var formidable = require('formidable')


const dbCon = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131F21U20",
    password: "430",
    database: "C4131F21U20",
    port: 3306
});



// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}
));


function getAll(req, res) {
   //Replace with query to DB
   fs.readFile('schedule.json', (err, json) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'application.json');
    res.write(json);
    res.end();
  });
}

function getSchedule(req, res, query) {
    //Replace with query to DB
   fs.readFile('schedule.json', (err, json) => {
    if (err) {
      throw err;
    }
    var scheduleObj = JSON.parse(json);
    let arr = scheduleObj[query.day.toLowerCase()];
    res.statusCode = 200;
    res.setHeader('Content-type', 'application.json');
    res.write(JSON.stringify(arr));
    res.end();
  });
}

function addEventData(query) {
    let newJson;
    const data = fs.readFileSync('schedule.json');
    schedule = JSON.parse(data);
    arr = schedule[query.day.toLowerCase()];
    let i = 0;
    for (; i < arr.length; i++) {
        let e = arr[i];
        if (query.start < e.start) break;
    }
    arr.splice(i, 0, query);
    let newjson = JSON.stringify(schedule);
    //console.log(newjson);
    fs.writeFileSync('schedule.json', newjson);

}

function addEventData(body) {
    let newJson;
    const data = fs.readFileSync('schedule.json');
    schedule = JSON.parse(data);
    arr = schedule[query.day.toLowerCase()];
    let i = 0;
    for (; i < arr.length; i++) {
        let e = arr[i];
        if (query.start < e.start) break;
    }
    arr.splice(i, 0, query);
    let newjson = JSON.stringify(schedule);
    //console.log(newjson);
    fs.writeFileSync('schedule.json', newjson);
}



// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));


// function to return the welcome page
app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/welcome.html');
});

// function to return the welcome page
app.get('/home', function(req, res) {
  res.sendFile(__dirname + '/client/welcome.html');
});

app.get('/stylesheet', function(req, res) {
    res.sendFile(__dirname + '/client/stylesheet.css');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/client/login.html');
});

app.get('/loginAttempt', function(req, res) {
    console.log(`loginattempt with ${req.query.username}, ${req.query.password}`);
    valid = {
        auth: true
    };
    invalid = {
        auth: false
    };
    req.session.auth = true;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(valid));
});

app.get('/allEvents', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else
    res.sendFile(__dirname + '/client/allEvents.html');
});

app.get('/schedule', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else
    res.sendFile(__dirname + '/client/schedule.html');
});

app.get('/addEvent', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else
    res.sendFile(__dirname + '/client/addEvent.html');
});

app.get('/getSchedule', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else
    getSchedule(req, res, req.query);
});

app.get('/getAll', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else
    getAll(req, res);
});


app.post('/postEventEntry', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else {
        console.log(req.body);
        res.redirect("/allEvents");
    }

});


app.get('/logout', function(req, res) {
    // Kill express session and redirect
    req.session.auth = false;
    res.redirect("/login");
});



// // middle ware to serve static files
// app.use('/client', express.static(__dirname + '/client'));

// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});
