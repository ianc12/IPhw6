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

function getJsonEvents() {
    jsonobj = {monday:[], tuesday:[], wednesday:[],
               thursday:[], friday:[], saturday:[], sunday:[]};
    dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
        const sql = 'SELECT * from tbl_events';

        console.log("Attempting to create table: tbl_accounts");
        dbCon.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            for (r of result) {
                jsonobj[r.event_day].push( {
                    event:r.event_event,
                    start:r.event_start,
                    end:r.event_end,
                    location:r.event_location,
                    phone:r.phone,
                    url:r.url,
                    info:r.info
                });
            }
        });

        dbCon.end();
    });
    return JSON.stringify(jsonobj);
}

function validateUser(user, pass) {
    let isValid = false;
    dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
        const sql = "SELECT acc_password from tbl_accounts where acc_login = " + `'${user}';`;
        dbCon.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            const saltRounds = 10;
            const myPlaintextPassword = pass;  // here is your password
            const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

            for (r of result) {
                if (r.acc_password == passwordHash) {
                    isValid = true;
                }
            }

        });

        dbCon.end();
    });
    return isValid;
}


function addEventData(body) {
    dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
        const sql = 'INSERT tbl_events SET ?';
        dbCon.query(sql, body, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Inserted event");
        });

        dbCon.end();
    });
}



function getAll(req, res, json) {
   //Replace with query to DB
    res.statusCode = 200;
    res.setHeader('Content-type', 'application.json');
    res.write(json);
    res.end();
}

function getSchedule(req, res, query, json) {
    //Replace with query to DB
    var scheduleObj = JSON.parse(json);
    let arr = scheduleObj[query.day.toLowerCase()];
    res.statusCode = 200;
    res.setHeader('Content-type', 'application.json');
    res.write(JSON.stringify(arr));
    res.end();
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
    valid = {
        auth: true
    };
    invalid = {
        auth: false
    };
    v = validateUser(req.query.username, req.query.password);
    if (v) {
        req.session.auth = true;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(valid));
    }
    else {
        req.session.auth = false;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(invalid));
    }
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
    getSchedule(req, res, req.query, getJsonEvents());
});

app.get('/getAll', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else
    getAll(req, res, getJsonEvents());
});


app.post('/postEventEntry', function(req, res) {
    if (req.session.auth != true) {
        res.redirect('/login');
    }
    else {
        addEventData(req.body);
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
