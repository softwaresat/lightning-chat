module.exports = async function(request, response, db2) {
  db2.all('SELECT * FROM credentials where verificationcode = ?', [request.query.code], async (err, results) => {

    response.render('changepassword', { item: results});


  })


}