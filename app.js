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
	''			: { 'name': '共有ボード', 'default': '共有ボード', 'now': 0, 'max': 50},
	'red'		: { 'name': '赤',	'default': '赤', 	'now': 0, 'max': 999},
	'waterblue'	: { 'name': '薄青', 'default': '薄青',	'now': 0, 'max': 999},
	'green'		: { 'name': '緑',	'default': '緑',	'now': 0, 'max': 999},
	'purple'	: { 'name': '紫',	'default': '紫',	'now': 0, 'max': 999},
	'yellow'	: { 'name': '黄',	'default': '黄',	'now': 0, 'max': 999},
	'blue'		: { 'name': '青',	'default': '青',	'now': 0, 'max': 999},
	};

var system_user_data = {
	'socket_id': "system_dummy_socket_id",
	'user_name': '',
	'joined_room': {'room1': 'share', 'room2': ''},
	'joined_time': null,
	'resent_chat': null,
	'usr_status' : 'stable',
	'in_msg'	 : 'さんが入室しました',
	'out_msg'	 : 'さんが退室しました',
	'msg_count'	 : 0,
	'icon'		 : '',
	'font_size'  : 7,
	'font_color' : "#000000",
	'be_bordear' : false,
	'be_italic'  : false,
	'be_underl'  : false
}

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
				io.sockets.in(join_room).emit('message', system_user_data, user_name + ' ' + in_msg);
				io.to(user_data.socket_id).emit('result', true);
			}
			console.log(join_room);
		}else{
			console.log("Capacity is too max. send to " + user_data.socket_id + ":" + user_data.user_name);
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
		socket.broadcast.to(leave_room).emit('message', system_user_data, user_name + ' ' + out_msg);

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
		});

		//Recent chat time update.
		now_user_list[recived_id].recent_chat = recent_chat;

		//Send message in room members.
		io.sockets.in(room).emit('message', now_user_list[recived_id], msg);

		if(now_user_list[recived_id].usr_status = 'rom'){
			now_user_list[recived_id].usr_status = null;
			io.sockets.emit('update_list_st', now_user_list, member_count);
		}
	});

	socket.on('disconnect', function(e) {
		console.log('%s leave.', now_user_list[socket.id]);
		if(now_user_list[socket.id]){
			leave_room = now_user_list[socket.id].joined_room['room2'];
			member_count[leave_room].now -= 1;
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

				if(command_val=== null || command_val===''){
					member_count[this_room].name = member_count[this_room].default
				}else{
					member_count[this_room].name = command_val;
				}

				io.sockets.emit('update_list_st', now_user_list, member_count);
				break;
			case '/member':
				const reg = /^\s*[0-9]*$/
				if(command_val.match(reg) && command_val <= 20 && command_val >=2){
					member_count[this_room].max = command_val;
					io.sockets.emit('update_list_st', now_user_list, member_count);
				}else if(command_val === '0' || command_val ==='' || command_val===null){
					member_count[this_room].max = 999;
					io.sockets.emit('update_list_st', now_user_list, member_count);
				}else{
					io.sockets.in(this_room).emit('message', system_user_data, '部屋人数は2～20までの間で設定してください。');
				}
				break;
			
			case '/rom':
				now_user_list[recived_id].usr_status = 'rom';
				io.sockets.emit('update_list_st', now_user_list, member_count);

				break;
		}
	});
	
	socket.on('change_form_item', function(recived_id, changed_item_id, changed_item_val){
		console.log(changed_item_id);

		switch(changed_item_id){
		
			case 'icon_select':
				now_user_list[recived_id].icon = changed_item_val;
				io.sockets.emit('update_list_st', now_user_list, member_count);
				break;
			case 'font_color_picker':
				now_user_list[recived_id].font_color = changed_item_val;
				break;
			case 'font_size_select':
				now_user_list[recived_id].font_size = changed_item_val;
				break;
		}
			

	});


});
// --------------------------------


http.listen(PORT, function(){
	console.log('server started on %d', PORT);
});


module.exports = app;
