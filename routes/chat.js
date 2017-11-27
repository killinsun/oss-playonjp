var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('chat_dev', { title: 'OSS-PLAYON.JP' });
});

module.exports = router;
