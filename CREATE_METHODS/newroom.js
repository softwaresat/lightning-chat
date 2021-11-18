module.exports = async function(request, response, db2) { 
  var link;
  var name = await request.body.name;
      var private;
  var filter;
  var reset;
  if(request.body.private == 'private'){
    var random = require('random-string-alphanumeric-generator');

link = random.randomAlphanumeric(10, "lowercase")
    private = true;

  }
  else{
    private = false;
  }
if(request.body.filter == 'filter'){
   
    filter = true;

  }
  else{
    filter = false;
  }
  if(request.body.reset == 'reset'){
   
    reset = true;

  }
  else{
    reset = false;
  }
    var author = request.session.name;
    await db2.run('select * from chatroom where name = ?', [name], async function(error, results, fields) {
    
if(results == undefined){
   await db2.run('insert into chatroom(name, author, private, link, filter, reset) values(?,?,?,?,?, ?)', [name, author,private, link, filter, reset])
         db2.run('insert into messages(user, text, chatroom) values(?,?, ?)', ['ADMIN', 'Welcome to '+name+'!', name])

  if(private = true){
     response.redirect('/roomdetails?name='+encodeURIComponent(name))


  }
  else{      
     response.redirect('/chatrooms')


  }

}
else{
         response.send('That name is already taken!')

}
    })

}