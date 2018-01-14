const express = require('express');
const router = express.Router();

const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

/*
//データベースモック。
const db={
  users:{
    records:[{
      id:"1",
      username:"user",
      password:"password",
      name:"Hibohiboo"
    }],
    findById(id, cb) {
      process.nextTick(() => {
        const idx = id - 1;
        const record=this.records[idx];
        if (record) {
          cb(null, record);
        } else {
          cb(new Error('User ' + id + ' does not exist'));
        }
      });
    },
    findByUsername(username, cb){
      process.nextTick(()=> {
        for (let i = 0, len = this.records.length; i < len; i++) {
          let record = this.records[i];
          if (record.username === username) {
            return cb(null, record);
          }
        }
        return cb(null, null);
      });
    }
  }
}
//*/


passport.use(new LocalStrategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }
));

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
    res.render('login', { title: 'Login', user_name:req.user && req.user.name || ""  });
  }
);
module.exports = router;
