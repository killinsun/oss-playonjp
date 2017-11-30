var express		= require('express');
var path		= require('path');
var favicon		= require('serve-favicon');
var logger		= require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser	= require('body-parser');

var routes		= require('./routes/index');
var users		= require('./routes/users');
var chat		= require('./routes/chat');

var app			= express();
var http		= require('http').Server(app);
var io = require('socket.io')(http);
const PORT		= 3000;

const model		= require('./model');
let	  Chat		= model.Chat;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/chat', chat);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});





// ----------- Chat Program -------
// We will devide these code later.
//
var now_user_list = {};
var member_count = {
	''			: { 'name' : '共有ボード', 'now': 0, 'max': 50},
	'red'		: { 'name' : '赤',		'now': 0, 'max': 20},
	'waterblue'	: { 'name' : '薄青',	'now': 0, 'max': 20},
	'green'		: { 'name' : '緑',		'now': 0, 'max': 20},
	'purple'	: { 'name' : '紫',		'now': 0, 'max': 20},
	'yellow'	: { 'name' : '黄',		'now': 0, 'max': 20},
	'blue'		: { 'name' : '青',		'now': 0, 'max': 20},
	};
io.on('connection', function(socket){
	console.log('%s joined.', socket.id);

	socket.on('room_join', function(user_data){
		if(!now_user_list[user_data.socket_id]){
			now_user_list[user_data.socket_id] = user_data;
			console.log("add now_user_list " + now_user_list[user_data.socket_id].user_name);
		}
	
		let user_name	= user_data.user_name;
		let in_msg		= user_data.in_msg;
		let join_room	= user_data.joined_room['room2'];

		if(member_count[join_room].max >= member_count[join_room].now + 1){
			now_user_list[user_data.socket_id].joined_room['room2'] = join_room;
			member_count[join_room].now += 1;
			socket.join(join_room);
			io.sockets.emit('update_list_st', now_user_list, member_count);
			
			//Chat room in message.
			if(join_room!=''){
				io.sockets.in(join_room).emit('message', '', user_name + ' ' + in_msg);
				io.to(user_data.socket_id).emit('result', true);
			}
			console.log(join_room);
		}else{
			console.log("Capacity is max. send to " + user_data.socket_id + ":" + user_data.user_name);
			io.to(user_data.socket_id).emit('result', false);

		}
	});

	socket.on('room_leave', function(recived_id){
		if(!now_user_list[recived_id]){
			console.log('socket error');
		}
		
		let user_name	= now_user_list[recived_id].user_name;
		let out_msg		= now_user_list[recived_id].out_msg;
		let leave_room = now_user_list[recived_id].joined_room['room2'];

		//Chat room out message.
		io.sockets.in(leave_room).emit('message', '', user_name + ' ' + out_msg);

		socket.leave(leave_room);
		now_user_list[recived_id].joined_room['room2'] = '';
		member_count[leave_room].now -= 1;
		if(leave_room!=''){
			io.sockets.emit('update_list_st', now_user_list, member_count);
		}
	});


	socket.on('message', function(recived_id, msg, recent_chat) {
		if(!now_user_list[recived_id]){
			console.log('socket error');
		}

		let user_name	= now_user_list[recived_id].user_name;
		let room		= now_user_list[recived_id].joined_room['room2'];

		var newChat = new Chat({
			room	 :	room,
			sc_id	 :	recent_chat,
			usr_id	 :	user_name,
			usr_name :	user_name,
			msg		 :	msg,
			say_date :	recent_chat
		});

		newChat.save(function(err){
			if(err){
				console.log(err);
			}
			console.log(newChat);
		});

		//Recent chat time update.
		now_user_list[recived_id].recent_chat = recent_chat;
		io.sockets.in(room).emit('message', user_name, msg);

		if(now_user_list[recived_id].usr_status = 'rom'){
			now_user_list[recived_id].usr_status = null;
			io.sockets.emit('update_list_st', now_user_list, member_count);
		}
	});

	socket.on('disconnect', function(e) {
		console.log('%s leave.', now_user_list[socket.id]);
		if(now_user_list[socket.id]){
			leave_room = now_user_list[socket.id].joined_room['room2'];
			member_count[join_room].now -= 1;
			member_count[''].now -= 1;
			delete now_user_list[socket.id];
			io.sockets.emit('update_list_st', now_user_list, member_count);
		}
	});

	socket.on('special_command', function(recived_id, command, command_val){
		let this_room = now_user_list[recived_id].joined_room['room2'];
		
		switch(command){
			case '/name':
				console.log('change user name');
				now_user_list[recived_id].user_name = command_val;
				io.sockets.emit('update_list_st', now_user_list, member_count);
				break;
			case '/room':
				console.log('change room name');
				member_count[this_room].name = command_val;
				io.sockets.emit('update_list_st', now_user_list, member_count);
				break;
			case '/member':
				const reg = /^\s*[0-9]*$/
				if(command_val.match(reg) && command_val <= 20 && command_val >=2){
					member_count[this_room].max = command_val;
					io.sockets.emit('update_list_st', now_user_list, member_count);
				}else{
					io.sockets.in(this_room).emit('message', '', '部屋人数は2～20までの間で設定してください。');

				}
				break;

			case '/rom':
				now_user_list[recived_id].usr_status = 'rom';
				io.sockets.emit('update_list_st', now_user_list, member_count);

				break;
		}
	});


});
// --------------------------------


http.listen(PORT, function(){
	console.log('server started on %d', PORT);
});


module.exports = app;
