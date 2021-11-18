module.exports = async function(request, response, db2) {
  var code = request.query.code;
  db2.run('update credentials set verified = ? where verificationcode = ?', [true, code])
  response.redirect('/')


}