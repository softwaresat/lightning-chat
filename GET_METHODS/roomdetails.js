module.exports = async function(req, res, db2) {
  var name = req.query.name;
  if (req.session.loggedin == undefined) {

    res.redirect('/login')
    req.session.originalURL = '/roomdetails?name=' + encodeURIComponent(name)
    req.session.save()

    return;
  }

  let obj = {}
  let html = []

  db2.all("SELECT * FROM chatroom where name = ?", [name], async (err, result) => {
    res.render('roomdetails', { item: result, name1: req.session.name, loggedin: req.session.loggedin, name: req.session.name, roomname: name });
  })


}