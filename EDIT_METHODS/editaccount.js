module.exports = async function(request, response, db2) { 
var username = await request.body.username;
  var password = await request.body.password;
  db2.all('SELECT * FROM credentials where username = ?',[username], async (err, results) => {
     
                   if(results!= undefined){
                     response.redirect('/account')
                   }

   
    })


  if (username && password) {

    await db2.run('update credentials set username=? where username = ?', [username, request.session.name], function(error, results, fields) {
    });
    await db2.run('update credentials set password=? where username = ?', [password, username], function(error, results, fields) {
    });
    request.session.name = username;
    response.redirect('/')
  } else {
    response.send('Please enter the information!');
    response.end();
  }

}