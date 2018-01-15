require('dotenv').config();
const mongoose = require('mongoose');
let db_uri;

if(process.env.NODE_DEV === "True"){
	db_uri	= 'mongodb://localhost/oss-playonjp';
}else{
	db_uri	= 'mongodb://heroku_mfqn1mx7:fmp0mooad0b0ii4p18hllsm9ef@ds139067.mlab.com:39067/heroku_mfqn1mx7/oss-playonjp';
}


const db	=	 mongoose.connect(db_uri);

console.log("MongoDB connect to " + db_uri );

let Chat = new mongoose.Schema({
	chat:		String,
	sc_id:		String,
	usr_id:		String,
	usr_name:	String,
	msg		 :	String,
	say_date:	String
});

let User = new mongoose.Schema({
	usr_id:		String,
	pwd:		String,
	usr_name:	String,
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
