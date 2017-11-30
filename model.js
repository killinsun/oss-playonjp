let mongoose = require('mongoose');
let db		 = mongoose.connect('mongodb://localhost/oss-playonjp');

let Chat = new mongoose.Schema({
	room:		String,
	sc_id:		String,
	usr_id:		String,
	usr_name:	String,
	msg		 :	String
	say_date:	String,
});

let User = new mongoose.Schema({
	usr_id:		String,
	pwd:		String,
	in_msg:		String,
	ot_msg:		String,
	font_size:	Number,
	font_color:	String,
	cr_date:	String
});

let IgnoreList = mongoose.Schema({
	usr_id:		String,
	ignore:		String
});


exports.Chat = db.model('Chat', Chat);
exports.User = db.model('User', User);
exports.IgnoreList = db.model('ignoreList', IgnoreList);
