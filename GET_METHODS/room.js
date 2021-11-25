module.exports = async function(req, res, db2) {
  if (req.session.loggedin == undefined) {

    res.redirect('/login')
    req.session.originalURL = '/room?name=' + encodeURIComponent(req.query.name)
    req.session.save()

    return;
  }

  var name = req.query.name;
  var author = req.session.name;
  var public;
  db2.all("SELECT * FROM chatroom where name = ? order by id asc", [name], async (err, result) => {
      db2.all("SELECT * FROM chatroom where private = false", async (err, publicrooms) => {
    var finalResult = result;

    if (result[0] == undefined) {
      db2.all("SELECT * FROM chatroom where link = ? order by id asc", [name], async (err, result) => {
        public = result[0].private || 0;
        name = result[0].name;
        author = req.session.name
        finalResult = result;
        db2.all("SELECT * FROM messages where chatroom = ? order by id asc", [name], async (err, result) => {
          db2.all("SELECT * FROM chatroom where author = ?", [author], async (err, author1) => {

            db2.all("SELECT * FROM joinedRooms where name = ? and person = ?", [name, author], async (err, results) => {
              if (results[0] == undefined && finalResult[0].author != author && public == 1) {

                db2.run('insert into joinedRooms(name, person) values(?,?)', [name, author])
              }
              db2.all("SELECT * FROM joinedRooms where person = ?", [author], async (err, results) => {

                if (result[0] == undefined) {
                  db2.run('insert into messages(user, text, chatroom) values(?,?, ?)', ['ADMIN', 'Welcome to ' + name + '!', name])
                  db2.all("SELECT * FROM messages where chatroom = ? order by id asc", [name], async (err, result) => {
                    res.render('room', { author: author1, item: result, other: results, name1: req.session.name, loggedin: req.session.loggedin, name: req.session.name, roomname: name, publicrooms: publicrooms  });


                  })
                }
                else {
                  res.render('room', { author: author1, item: result, other: results, name1: req.session.name, loggedin: req.session.loggedin, name: req.session.name, roomname: name, publicrooms: publicrooms  });

                }
              })
            })
          });
        })
      })
    }
    else {
      public = finalResult[0].private

      db2.all("SELECT * FROM messages where chatroom = ? order by id asc", [name], async (err, result) => {
        db2.all("SELECT * FROM chatroom where author = ?", [author], async (err, author1) => {

          db2.all("SELECT * FROM joinedRooms where name = ? and person = ?", [name, author], async (err, results) => {
            if (results[0] == undefined && finalResult[0].author != author && public == 1) {
              db2.run('insert into joinedRooms(name, person) values(?,?)', [name, author])
            }
            db2.all("SELECT * FROM joinedRooms where person = ?", [author], async (err, results) => {

              if (result[0] == undefined) {
                db2.run('insert into messages(user, text, chatroom) values(?,?, ?)', ['ADMIN', 'Welcome to ' + name + '!', name])
                db2.all("SELECT * FROM messages where chatroom = ? order by id asc", [name], async (err, result) => {
                  res.render('room', { item: result, author: author1, other: results, name1: req.session.name, loggedin: req.session.loggedin, name: req.session.name, roomname: name, publicrooms: publicrooms });

                })
              }
              else {
                res.render('room', { author: author1, item: result, other: results, name1: req.session.name, loggedin: req.session.loggedin, name: req.session.name, roomname: name, publicrooms: publicrooms  });

              }
            })
          })
        })
      });
  
    }
      })
  })

  let obj = {}
  let html = []

}