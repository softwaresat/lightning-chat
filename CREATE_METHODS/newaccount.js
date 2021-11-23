module.exports = async function(request, response, db2, nodemailer, transporter) { 
  var username = await request.body.username;
  var password = await request.body.password;
  var crypto = require("crypto");
  var sha256 = crypto.createHash("sha256");
    var email = await request.body.email;
    var random = require('random-string-alphanumeric-generator');

  var code = await request.body.code;
const fetch = require('cross-fetch')

const params = {"secret":"6Lc8wvocAAAAAKzMLDmoQrLpcGMsvyqxEAfuqExs", "response": code}

const apicall = await fetch("https://www.google.com/recaptcha/api/siteverify", {
  method: "POST", 
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(Object.entries(params)).toString(),
})
const data = await apicall.json();
    await db2.all('select * from credentials where username = ?', [username], async function(error, results, fields) {
if(data.success == true && (results == undefined || results[0] == undefined)){
  let verificationcode = random.randomAlphanumeric(10, "lowercase")


   await db2.run('insert into credentials(email, username, password, type, verificationcode) values(?, ?,?,?, ?)', [email, username, password, 'User', verificationcode])

let code =  `<p>Dear `+username+',</p>'+
'<p>Please verify your email with this link</p>'+
  `<p><a href="https://www.lightningchat.live/verifyemail?code=`+verificationcode+`">Link</a></p>`+
  `<p>Or</p>`+
    `<p><a href="https://chatapp.satvikagarwal.repl.co/verifyemail?code=`+verificationcode+`">School Link</a></p>`

  +
`<p>Thanks,</p>
  <p>The Lightning Chat Team</p>
  `
   mailOptions = {
  from: 'lightningchat5@gmail.com',
  to: email,
  subject: 'Verify your email!',
  html: code
};
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  code =  `<p>Dear `+username+',</p>'+
  `
  <p>Thank you for registering on Lightning Chat. We wish to improve your communication and collaboration through our lightning-fast platform! Lightning Chat has unique features and a growing base. Users like you keep us going, and one day we hope to make Lightning Chat an amazing place! If you have any questions or concerns, don't hesitate to email us back. This isn't a no-reply email, so we will check our messages frequently. You can also contact us via our <a href="https://discord.gg/fdv4W7r9nm">Discord Server</a>!</p>
<br>
  <p>Here are some other projects we are working on:</p>
  <ul>
<li><a href="https://techdudesblog.serveblog.net/">TechDudes Blog</a></li>
<li><a href="https://top.gg/bot/760654790522568735">Softwaresat Bot</a></li>

  </ul>
  <br>
  <p>We hope you enjoy our web app!</p>
<br>
  <p>Thanks,</p>
  <p>The Lightning Chat Team</p>
  `
     var mailOptions = {
  from: process.env['email'],
  to: email,
  subject: 'Welcome to Lightning Chat!',
  html: code
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

       response.send("Please check your email to verify your account!")

}
else{
         response.send('That username is already taken!')

}
    })
}