const express = require('express')
const app = express()
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
const fs = require('fs')
const https = require('https')
const sqlite3 = require('sqlite3')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require("crypto");
var sha256 = crypto.createHash("sha256");
var showdown = require('showdown');
  const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (request, file, cb) {
      cb(null, './views/pfps')
    },
    filename: function (request, file, cb) {
      cb(null, request.body.username+'.'+file.originalname.substring(file.originalname.length-3))
    }
})
var upload = multer({ storage: storage })

var converter = new showdown.Converter({simplifiedAutoLink: 'true'});

const generateRandomAnimalName = require('random-animal-name-generator')

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env['email'],
    pass: process.env['password']
  }
});

var mailOptions = {
  from: process.env['email'],
  to: 'test@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

var db2 = new sqlite3.Database('chat.db');
app.use(session({
  secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
  proxy: true,
  resave: true,
  saveUninitialized: true,
}));
// SQLITE Table Creation

// db2.run(
// `
// -- chatroom definition

// CREATE TABLE chatroom(name varchar(100), author varchar(100), id int primary_key auto_increment, private bool, link varchar(200), filter bool, reset bool);


// -- credentials definition

// CREATE TABLE credentials(id int auto_increment, username varchar(100), password varchar(100), type varchar(50), email varchar(100), verificationcode varchar(100), verified bool, name VARCHAR, author VARCHAR, private BOOL, link VARCHAR, "filter" BOOL, reset BOOL);


// -- joinedRooms definition

// CREATE TABLE joinedRooms(name varchar(100), person varchar(100));


// -- messages definition

// CREATE TABLE messages(text text, user varchar(100), id auto_increment primary_key, chatroom varchar(100), timenumber varchar(1000));
// `
// )
db2.all("SELECT count(*) as num from credentials;", [undefined], async (err, result) => {
  console.log("There are currently " + result[0].num + " accounts!")

})

var bodyParser = require('body-parser')
setInterval(function() {
  db2.all("SELECT * FROM chatroom where reset = true", async (err, result) => {
    result.forEach(item => {
      db2.run('delete from messages where chatroom = ?;', [item.name])

    })
  })
  db2.run('delete from messages where chatroom is null;')
  db2.run('insert into messages(user, text) values(?,?)', ['ADMIN', 'Welcome to Lightning Chat!'])
  db2.run('insert into messages(user, text) values(?,?)', ['ADMIN', 'Messages are deleted every 30 minutes for privacy!'])

}, 1800000);
setInterval(function() {

  db2.all("SELECT * FROM messages where chatroom is null order by id asc", async (err, result) => {
    if (result[0] == undefined) {
      db2.run('insert into messages(user, text) values(?,?)', ['ADMIN', 'Welcome to Lightning Chat!'])


    }

  })
}, 15000);


app.use(express.static('views'))
app.use(express.static('views/pfps'))

app.use(express.static('.well-known'))

app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cookieParser());
app.set('trust proxy', true);
io.on('connection', (socket) => {
  socket.on('chat message', async function(msg, author, date) {
    var Filter = require('bad-words');
    var filter1 = new Filter();

    var messages;
    try {
      messages = {
        user: author,
        text: filter1.clean(msg),
        date: date
      }
      db2.run('insert into messages(user, text, timenumber) values(?,?,?)', [author, filter1.clean(msg), new Date().getTime().toString()])
    }
    catch (err) {
      messages = {
        user: author,
        text: msg,
        date: date
      }
      db2.run('insert into messages(user, text, timenumber) values(?,?,?)', [author, msg, new Date().getTime().toString()])
    }    //db2.run('insert into messages(user, text, timenumber) values(?,?,?)', [author, filter1.clean(msg), new Date().getTime().toString()])


    io.emit('message', messages);



  })

  socket.on('chatroom message', async function(msg, author, chatroom, date) {
    var text = msg.trim().split(' ');
    var profanityFilter = require('simple-profanity-filter');


    var Filter = require('bad-words');
    var filter1 = new Filter();
    var author = author;

    var messages = {
      user: author,
      //text: filter1.clean(msg),
      text: filter1.clean(msg),
      chatroom: chatroom,
      date: date
    }
    var hasCursed = false;
    var filter = true;
    db2.all("SELECT * FROM chatroom where name = ?", [chatroom], async (err, result) => {
      if (result[0].filter == 0) {
        filter = false;
        messages = {
          user: author,
          text: msg,
          chatroom: chatroom
        }
      }

      if (msg != ' ' && hasCursed == false) {
        if (result[0].filter == 0) {
          db2.run('insert into messages(user, text, chatroom, timenumber) values(?,?,?,?)', [author, msg, chatroom, new Date().getTime().toString()])
        } else {
          //db2.run('insert into messages(user, text, chatroom) values(?,?,?)', [author, filter1.clean(msg), chatroom])
          db2.run('insert into messages(user, text, chatroom,timenumber) values(?,?,?,?)', [author, filter1.clean(msg), chatroom, new Date().getTime().toString()])
        }
        io.emit('chatroommessage', messages);

      }

    })
  })
  socket.on('typing', (data) => {
    if (data.typing == true)
      io.emit('display', data)
    else
      io.emit('display', data)
  })
})

app.get('/', function(req, res) {
  if (req.session.loggedin == undefined) {
    res.redirect('/login')
    req.session.originalURL = '/'
    req.session.save()

    return;
  }
  if (req.session.name == undefined) {
    req.session.name = 'Anonymous'

  }

  let obj = {}
  let html = []
  db2.all("SELECT * FROM messages where chatroom is null order by id asc", async (err, result) => {
    res.render('index', {
      item: result,
      name1: req.session.name,
      loggedin: req.session.loggedin,
      name: req.session.name
    });

  });

})

// Get Methods
app.get('/chatrooms', function(req, res) {
  require('./GET_METHODS/chatrooms.js')(req, res, db2);

})
app.get('/.well-known/brave-rewards-verification.txt', function(req, res) {

  res.sendFile('brave-rewards-verification.txt', {
    root: './well-known'
  });
})
app.get('/logout', function(req, res) {
  require('./GET_METHODS/logout.js')(req, res, db2);

})
app.get('/login', function(req, res) {
  res.sendFile('login.html', {
    root: './views'
  });

})
app.get('/signup', function(req, res) {
  res.sendFile('signup.html', {
    root: './views'
  });

})
app.get('/account', async function(request, response) {
  require('./GET_METHODS/account.js')(request, response, db2);

})
app.get('/forgotpassword', async function(request, response) {
  require('./GET_METHODS/forgotpassword.js')(request, response, db2);

})
app.post('/forgotpasswordemail', async function(request, response) {
  require('./EDIT_METHODS/forgotpassword.js')(request, response, db2, nodemailer, transporter);

})
app.post('/editpassword', async function(request, response) {
  require('./EDIT_METHODS/editpassword.js')(request, response, db2);

})
app.get('/changepassword', async function(request, response) {
  require('./GET_METHODS/changepassword.js')(request, response, db2);

})
app.get('/room', async function(req, res) {
  require('./GET_METHODS/room.js')(req, res, db2);

})
app.get('/roomdetails', async function(req, res) {
  require('./GET_METHODS/roomdetails.js')(req, res, db2);

})

// Create Methods
app.get('/newchatroom', function(req, res) {
  res.sendFile('newchatroom.html', {
    root: './views'
  });


})
app.post('/newaccount', async function(request, response) {
  require('./CREATE_METHODS/newaccount.js')(request, response, db2, nodemailer, transporter);

});

// Edit Methods
app.post('/editaccount', upload.single('image'), async function(request, response) {
  require('./EDIT_METHODS/editaccount.js')(request, response, db2);

});

// Delete Methods
app.get('/deleteroom', async function(request, response) {
  require('./DELETE_METHODS/deleteroom.js')(request, response, db2);
});
app.get('/verifyemail', async function(request, response) {
  require('./GET_METHODS/verifyemail.js')(request, response, db2);
});
app.post('/newroom', async function(request, response) {
  require('./CREATE_METHODS/newroom.js')(request, response, db2);

});

// Login Authentication
app.post('/auth', async function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  var finalResult;
  if (username && password) {

    db2.all('SELECT * FROM credentials', async (err, results) => {
      results.forEach(result => {

        if (result.username == username && result.password == password) {
          finalResult = result;
        }
      });
      if (finalResult == undefined) {
        response.send('Incorrect Username and/or Password!');
        response.end();
        console.log('Incorrect Username and/or Password!');
        return
      }
      else if (finalResult.verified == null) {
        response.send('Please verify your email! The verification email may take a couple minutes to arrive.')
        response.end();
        return
      }

      else {
        request.session.loggedin = true;
        request.session.username = username;

        request.session.name = username

        response.redirect(request.session.originalURL || '/');
        response.end();

        return
      }

    })
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});
http.listen(80, () => console.log('Server is live on port 80!'))