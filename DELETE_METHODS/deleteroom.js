module.exports = async function(request, response, db2) {
  var name = await request.query.name;
  var username = request.session.name;
  db2.all('SELECT * FROM chatroom where name = ?', [name], async (err, results) => {

    if (results[0].author == username) {
      await db2.run('delete from chatroom where name = ? and author = ?', [name, username], function(error, results, fields) {
      });
      await db2.run('delete from joinedRooms where name = ?', [name], function(error, results, fields) {
      });
      response.redirect('/chatrooms')

    }
    else {

      response.send('404 Not Found')
    }

  })




}