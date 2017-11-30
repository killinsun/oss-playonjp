let mongoose = require('mongoose');
let db		 = mongoose.connect('mongodb://localhost/oss-playonjp');

let Chat = new mongoose.Schema({
	room_name:	String,
	date_time:	String,
	socket_id:	String,
	user_name:	String,
	msg		 :	String
});

exports.Chat = db.model('Chat', Chat);
