const express = require('express');
const router = express.Router();
const os = require('os')
const hostname = os.hostname();
const passport		= require('passport');

router.get('/', function(req, res, next) {
	console.log(req.query);
	let room_id = '';
	if(req.query.room_id){
		room_id = req.query.room_id;
	}
	res.render('chat', { title: 'OSS-PLAYON.JP', room_id: room_id });
});


module.exports = router;
