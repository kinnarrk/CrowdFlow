module.exports = {
    ensureAuthenticated: (req, res, next) => {
      // console.log("REQa="+req.isAuthenticated());
      // console.log("USERa="+res.locals.user);
      req.session.returnTo = req.originalUrl;
      console.log("RETURN URL="+req.originalUrl);
      if (req.isAuthenticated()) {
        return next();
      }
      //req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/users/login');
    }
  };