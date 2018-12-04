
// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const { parse } = require('querystring');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

//init chat db
var fs = require('fs');
var cdbFile = './.data/chat.db'
var exists = fs.existsSync(cdbFile)
var sqlite3 = require('sqlite3').verbose()
var cdb = new sqlite3.Database(cdbFile)

//if ./.data/chat.db does not exist, create it, otherwise print records to console
cdb.serialize(function() {});

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    console.log('Database "Users" ready to go!');
    db.each('SELECT * from Users', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/blocked', function(req, res) {
  console.log('request for blocked.html');
  res.sendFile(__dirname + '/views/blocked.html');
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  if (!process.env.offline) {
    console.log('request for index.html')
  response.sendFile(__dirname + '/views/index.html');
  } else if (process.env.offline == "fake") {
    response.write('errror not found');
  } else {
    console.log('request for 503.html')
    response.sendFile(__dirname + '/views/503.html');
  }
});

app.get('/login', function(req, res) {
  if (!process.env.offline) {
  res.sendFile(__dirname + '/views/login.html');
    console.log('request for login.html')
  } else {
    res.sendFile(__dirname + '/views/503.html');
    console.log('request for 503.html')
  }
});

app.get('/chat/*', function(req, res) {
  console.log('request on /chat ')
  if (!process.env.offline) {
  var user = req.url.split("/")[2]
  console.log(user)
  var target = req.url.split("/")[3]
  console.log(target)
  if (!target) {
    res.write('<link rel="stylesheet" href="/style.css">');
    res.write('<script src="/contacts.js" defer></script>');
    res.write('<div class="side" id="contacts">');
    db.each('SELECT * FROM ' + user + 'contacts', function(err, row) {
      if (err) throw err;
      if (row) {
        res.write('<div class="contact" id="' + row.id + '" onclick="openChat(' + row.id + '">');
        res.write('<h5>' + row.Username + '</h5>');
        res.write('</div');
      }
    });
    res.write('</div>');
    res.write('<div class="friends" id="addfriends">')
    res.write('<button class="friends" id="addbutton" onclick="addfriend()"> SEND MESSAGE </button>')
    res.write('<div class="friends" id="frdialog">')
    res.write('<form id="frform" class="friends" method="GET" action="/addfriend"> <input placeholder="Username" type="text" name="username" maxlength="255"> </form>')
    res.write('</div>')
    res.write('</div>')
  }
  } else {
    console.log('request for 503.html')
    res.sendFile(__dirname + '/views/503.html');
  }
});

app.get('/addfriend', function(req, res) {
  if (!process.env.offline) {
    console.log('Endpoint Request To /addfriend With data: ' + req.query)
  var usr = req.query.current
  var target = req.query.username
  db.each('SELECT * FROM Users', function(err, row) {
    if (err) throw err;
    if (row) {
      if (row.Username == usr) {
        cdb.run('INSERT INTO ' + usr + ' (id, Username')
      }
    }
  });
  } else {
    res.sendFile(__dirname + '/views/503.html');
  }
});

app.get('/execute', function(req, res) {
  var query = req.query
  console.log('Endpoint Request To /execute with data: ' + query)
  if (!req.query.type) {
    res.send('BAD TYPE')
  }
  if (req.query.type == "js") {
    eval(query.code, function(err) {
      if (err) throw err;
    });
  } else {
    db.run(query.code, function(err) {
      if (err) throw err;
    });
  }
  console.log(query.type + " " + query.code);
  res.redirect('/mysql')
});

app.get('/mysql', function(req, res) {
  console.log('request for mysql.html')
  res.sendFile(__dirname + '/views/mysql.html');
});

app.get('/signup', function(req, res) {
  if (!process.env.offline) {
    console.log('request for signup.html')
  res.sendFile(__dirname + '/views/signup.html');
  } else {
    console.log('request for 503.html')
    res.sendFile(__dirname + '/views/503.html');
  }
});

app.get('/findaccount', function(req, res) {
  var usr = req.query.user
  var pass = req.query.pass
  console.log('Endpoint Request To /findaccount Data: ' + req.query)
  db.each('SELECT * FROM Users', function(err, row) {
    if (err) throw err;
    if (row) {
      console.log(row)
      console.log(usr)
      if (row.Username.toString() == usr) {
        console.log('found user')
        if (row.Password == pass) {
          console.log('pass correct')
          res.end('<div tag="USERID" id="' + row.id + '"></div> <script src="/login.js" defer></script>');
        } else { res.redirect('/login?err=1'); }
      }
    }
});
});

app.get('/nobl', function(req, res) {
  console.log('Removal Of Blocked Status Request Granted.')
  res.send('<script src="/nobl.js" defer></script>');
});

app.get('/newaccount', function(req, res) {
  console.log('Endpoint request to /newaccount data: ' + req.query)
  console.log(req.query)  
  var data = req.query
      console.log(data)
       var usr = data.user
        console.log(usr)
        var pass = data.pass
        console.log(pass)
        var birth = data.birth
        console.log(birth)
      if (!usr) {
        res.status(500).send('ERR_USERNAME_NOT_SPECIFIED');
      }
      if (!pass) {
        res.status(500).send('ERR_PASSWORD_NOT_SPEIFIED');
      }
      if (!birth) {
        res.status(500).send('ERR_BIRTHDAY_NOT_SPEIFIED');
      }
      if (usr && pass && birth){
        var date = new Date()
        console.log('ALL ARGUMENTS DEFINED')
        if (birth.substr(0, 4) == date.getFullYear+1) {
        db.each('SELECT * FROM Users', function(err, row) {
          if (err) throw err;
            console.log('row: ' + row)
          if (row.Username == usr) {
            console.log('username taken')
            res.redirect('/signup?err=1')
          } else {
            var date = new Date();
            var dbruncode = 'INSERT INTO Users ("Username", "Password") VALUES ("' + usr + '", ' + pass + '")'
            console.log(dbruncode)
            db.run(dbruncode);
            console.log('account created');
            res.redirect('/signup?err=2')
          }
        });
        } else {
          res.send('<script src="/blacklist.js" defer></script>')
        }
      }
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.get('/sendmsg', function(req, res) {
  var from = req.query.from
  var to = req.query.to
  var msg = req.query.msg
  
  if (from && to && msg) {
    cdb.run('INSERT INTO ' + to + 'chat' + from + '(msg) VALUES (' + msg + ')');
  }
});

app.get('/getContacts', function(req, res) {
  var user = req.query.code
  db.each('SELECT * FROM contact' + user, function(err, row) {
    if (err) res.write(err)
    if (row) res.write(row)
  });
});

app.get('/getUsers', function(req, res) {
  res.write('user database')
  db.all('SELECT * FROM Users', function(err, rows) {
    if (err) res.write(JSON.stringify(err))
    if (rows) res.write(JSON.stringify(rows))
  });
});

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/views/404.html')
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});