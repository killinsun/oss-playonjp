const express = require('express');
const router = express.Router();
const os = require('os')
const hostname = os.hostname();
const passport		= require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'OSS-PLAYON.JP', hostname: hostname });
});

module.exports = router;
