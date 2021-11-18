module.exports = async function(req, res, db2) { 
  if(req.session.name == undefined){
        res.redirect('/login')
                req.session.originalURL = '/chatrooms'
                                req.session.save()


return;
  }

  let obj = {}
  let html = []
  db2.all('SELECT * FROM chatroom where private is null or private = false or author = ? order by id asc', [req.session.name], async (err, result) => {
      db2.all('SELECT * FROM joinedRooms where person = ?', [req.session.name], async (err, results) => {

        res.render('chatrooms', { print: result, other: results, name1: req.session.name, loggedin: req.session.loggedin, name: req.session.name});


    });

  })
      db2.all('SELECT * FROM chatroom where private is not null order by id asc', async (err, result) => {
      })
  


}