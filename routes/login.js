const express		= require('express');
const router		= express.Router();

const passport		= require('passport')
  , LocalStrategy	= require('passport-local').Strategy;
  
const model			= require('../model');
let User			= model.User;
let Chat			= model.Chat;


passport.use(new LocalStrategy(function(username, password, cb) {
	User.find({usr_id: username}, function(err, docs){
		docs.forEach( function(user){
			if(user.pwd != password){ return cb(null, false);}
			return cb(null, user);
		});
	});
  }));


// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
	console.log('serializeUser : ' + user.usr_id);
	cb(null, user.usr_id);
});

passport.deserializeUser(function(usr_id, cb) {
	console.log('deserializeUser : ' + usr_id);
	cb(null, {name:usr_id, msg:'test'});
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
