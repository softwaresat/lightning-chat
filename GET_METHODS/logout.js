module.exports = async function(req, res, db2) { 
   req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                req.session = null;
                return res.redirect('/login');

            }
        });
}