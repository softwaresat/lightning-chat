module.exports = async function(request, response, db2, nodemailer, transporter) { 
var username = await request.body.username;
  var email = await request.body.email;
      var random = require('random-string-alphanumeric-generator');

  db2.all('SELECT * FROM credentials where username = ? and email = ?',[username, email], async (err, results) => {
      let verificationcode = random.randomAlphanumeric(10, "lowercase")

     if(results[0] != undefined){
                if(results[0].email == null){
                  response.send("Your account has no attached email, please create a new account!")
                }
                else{
                  code =  `<p>Dear `+username+',</p>'+
'<p>Please use this link to reset your password</p>'+
  `<p><a href="https://www.lightningchat.live/changepassword?code=`+verificationcode+`">Link</a></p>`+
  `<p>Or</p>`+
    `<p><a href="https://chatapp.satvikagarwal.repl.co/changepassword?code=`+verificationcode+`">School Link</a></p>`

  +
`<p>Thanks,</p>
  <p>The Lightning Chat Team</p>
  `
 db2.run('update credentials set verificationcode = ? where username = ?', [verificationcode, username])
 mailOptions = {
  from: 'lightningchat5@gmail.com',
  to: email,
  subject: 'Password Reset Directions',
  html: code
};
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
       response.send("Please check your email to change your password!")

                }
     }
     else{
       response.send("Your username and/or email are incorrect!")
     }
   
    })


 
}