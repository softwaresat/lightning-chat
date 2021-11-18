module.exports = async function(request, response, db2) {
  db2.all('SELECT * FROM credentials where username = ?', [request.session.name], async (err, results) => {

    response.render('account', { item: results, loggedin: request.session.loggedin, name1: request.session.name });


  })


}