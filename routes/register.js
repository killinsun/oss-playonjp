const express		= require('express');
const router		= express.Router();

const model			= require('../model');
let User			= model.User;

router.get('/',
  function(req, res, next) {
  res.render('register', { title: 'register' });
});

router.post('/',
  function(req, res, next){
  
	let user = new User({
		usr_id		: req.body.user_id,
		usr_name	: req.body.user_name,
		pwd			: req.body.password
	});
	user.save(function(err){
		if(err){
			console.log(err);
		}
	});
    res.render('login', { title: 'Login' });
  }
);
module.exports = router;
