const express		= require('express');
const router		= express.Router();

const passport		= require('passport')
  , LocalStrategy	= require('passport-local').Strategy;
  
const model			= require('../model');
let User			= model.User;
let Chat			= model.Chat;


passport.use(new LocalStrategy(function(username, password, cb) {
	User.find({usr_id: username}, function(err, docs){
		docs.forEach( function(element){
			if(element.pwd != password){ return cb(null, false);}
			return cb(null, element);
		});
	});
  }));


// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


router.get('/',
  function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/',
  passport.authenticate('local', { 
                                   failureRedirect: '/',
                                   failureFlash: false}),
  function(req, res, next){
    res.render('login', { title: 'Login' });
  }
);
module.exports = router;
