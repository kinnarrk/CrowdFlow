module.exports = {
    ensureAuthenticated: function(req, res, next) {
      console.log("REQ="+req.isAuthenticated());
      if (req.isAuthenticated()) {
        console.log("USER="+req.user);
        return next();
      }
      //req.flash('error_msg', 'Please log in to view that resource');
      res.locals.user = undefined;
      next();
    }
  };