'use strict';
const express		= require('express');
const path		= require('path');
const favicon		= require('serve-favicon');
const logger		= require('morgan');
const cookieParser= require('cookie-parser');
const bodyParser	= require('body-parser');

const routes		= require('./routes/index');
const users		= require('./routes/users');
const chat		= require('./routes/chat');

const app			= express();
const http		= require('http').Server(app);
const io = require('socket.io')(http);
const PORT		= 3000;

const model		= require('./model');
const Chat		= model.Chat;

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
  let err = new Error('Not Found');
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
  console.log(err.message);
});





// ----------- Chat Program -------
// We will devide these code later.
//

const room_array = ['all','guest1','guest2','tennis','room1','room2','room3','room4','room5','room6','two','two2','denyroom'];
const all_user_list = {};


room_array.forEach(function(v){

	let now_user_list = {};
	let user_count = {
		'room_id'		: v,
		'share'		: { 'name': '共有ボード', 'default': '共有ボード', 'now': 0, 'max': 50},
		'red'		: { 'name': '赤',	'default': '赤', 	'now': 0, 'max': 999},
		'waterblue'	: { 'name': '薄青', 'default': '薄青',	'now': 0, 'max': 999},
		'green'		: { 'name': '緑',	'default': '緑',	'now': 0, 'max': 999},
		'purple'	: { 'name': '紫',	'default': '紫',	'now': 0, 'max': 999},
		'yellow'	: { 'name': '黄',	'default': '黄',	'now': 0, 'max': 999},
		'blue'		: { 'name': '青',	'default': '青',	'now': 0, 'max': 999},
		};

	let chatNS = io.of('/chat_'+ v);

	chatNS.on("connection", function(socket){
		let user_data = {
			'socket_id'  : socket.id,
			'user_name'  : '',
			'room_id'	 : v,
			'joined_chat': {'chat1': '', 'chat2': ''},
			'joined_time': null,
			'resent_chat': null,
			'usr_status' : 'stable',
			'in_msg'	 : 'さんが入室しました',
			'out_msg'	 : 'さんが退室しました',
			'msg_count'	 : 0,
			'icon'		 : '',
			'font_size'  : 'large',
			'font_color' : '#000000',
			'font_color' : "#000000",
			'be_bolder'	 : false,
			'be_italic'  : false,
			'be_underl'  : false
		}

		// Set system user
		let system_user_data	   = user_data;
		system_user_data.socket_id = 'dummy';
		system_user_data.user_name = '';

		// Set user data for management tables
		now_user_list[socket.id] = user_data;
		i = { 'socket_id': socket.id, 'room_id': v, 'user_name': null, 'chat': null }
		all_user_list[socket.id] = i; 

		chatNS.emit('update_list_st', now_user_list, user_count);

		socket.on('all_view_callback', function(){ chatNS.emit('get_all_users',all_user_list, room_array); });

		socket.on('room_join', function(recived_data){
			const recived_id  = socket.id;
			const join_chat	= 'share';
			
			all_user_list[recived_id].user_name		= recived_data.user_name;
			now_user_list[recived_id].user_name		= recived_data.user_name;
			now_user_list[recived_id].joined_time	= recived_data.joined_time;

			//Check user count limit
			if(user_count[join_chat].max >= user_count[join_chat].now + 1){
				now_user_list[recived_id].joined_chat['chat1'] = join_chat;
				user_count[join_chat].now += 1;
				socket.join(join_chat);
				chatNS.emit('update_list_st', now_user_list, user_count);
				io.of('/chat_all').emit('update_data', all_user_list[recived_id]);
				
			}else{
				console.log("Capacity is too max. send to " + recived_id + ":" + recived_data.user_name);
				chatNS.to(recived_id).emit('result', false);

			}

			console.log(all_user_list[recived_id]);
		});
		
		socket.on('chat_join', function(recived_data){
			const recived_id	= socket.id	;
			const user_name		= now_user_list[recived_id].user_name;
			const in_msg		= now_user_list[recived_id].in_msg;
			const join_chat		= recived_data.join_chat
			console.log(recived_data);

			//Check user count limit
			if(user_count[join_chat].max >= user_count[join_chat].now + 1){

				all_user_list[recived_id].chat				   = join_chat;
				now_user_list[recived_id].joined_chat['chat2'] = join_chat;

				user_count[join_chat].now += 1;
				socket.join(join_chat);
				chatNS.emit('update_list_st', now_user_list, user_count);
				io.of('/chat_all').emit('update_data', all_user_list[recived_id]);
				
				//Chat in message.
				if(join_chat != ''){
					chatNS.to(join_chat).emit('message', system_user_data, user_name + ' ' + in_msg, false);
					chatNS.to(recived_id).emit('result', true);
					console.log("success");
				}
			}else{
				console.log("Capacity is too max. send to " + recived_id + ":" + user_name);
				chatNS.to(recived_id).emit('result', false);

			}
		});

		socket.on('chat_leave', function(recived_id){
			if(!now_user_list[recived_id]){
				console.log('socket error');
			}
			
			const user_name	= now_user_list[recived_id].user_name;
			const out_msg		= now_user_list[recived_id].out_msg;
			const leave_chat = now_user_list[recived_id].joined_chat['chat2'];

			//Chat out message.
			chatNS.to(leave_chat).emit('message', system_user_data, user_name + ' ' + out_msg, false);

			socket.leave(leave_chat);
			
			now_user_list[recived_id].joined_chat['chat2'] = '';
			all_user_list[recived_id].chat = '';
			user_count[leave_chat].now -= 1;
			if(leave_chat!=''){
				chatNS.emit('update_list_st', now_user_list, user_count);
				io.of('/chat_all').emit('update_data', all_user_list[recived_id]);
			}
		});


		socket.on('message', function(recived_id, msg, recent_chat) {
			if(!now_user_list[recived_id]){
				console.log('socket error');
			}

			const user_name	= now_user_list[recived_id].user_name;
			const chat		= now_user_list[recived_id].joined_chat['chat2'];

			var newChat = new Chat({
				chat	 :	chat,
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

			//Send message in chat members.
			chatNS.to(chat).emit('message', now_user_list[recived_id], msg, false);

			if(now_user_list[recived_id].usr_status = 'rom'){
				now_user_list[recived_id].usr_status = null;
				chatNS.emit('update_list_st', now_user_list, user_count);
			}
		});

		socket.on('direct_message', function(recived_id, msg, recent_chat, to_id){

			//Recent chat time update.
			now_user_list[recived_id].recent_chat = recent_chat;

			//Send message in chat members.
			chatNS.to(to_id).emit('message', now_user_list[recived_id], msg, true);

			//output from user's chat view.
			chatNS.to(recived_id).emit('message', now_user_list[recived_id], msg, true);

			if(now_user_list[recived_id].usr_status = 'rom'){
				now_user_list[recived_id].usr_status = null;
				chatNS.emit('update_list_st', now_user_list, user_count);
			}
		});

		socket.on('disconnect', function(e) {
			if(now_user_list[socket.id]){
				leave_chat = now_user_list[socket.id].joined_chat['chat2'];
				if(leave_chat != ''){
					user_count[leave_chat].now -= 1;
				}

				if(now_user_list[socket.id].joined_chat['chat1'] != ''){
					user_count['share'].now -= 1;
				}
				if(user_count['share'] < 0){ user_count['share'] = 0; }


				delete now_user_list[socket.id];
				delete all_user_list[socket.id];
				chatNS.emit('update_list_st', now_user_list, user_count);
				io.of('/chat_all').emit('get_all_users', all_user_list, room_array);
			}
		});

		socket.on('special_command', function(recived_id, command, command_val){
			const this_chat = now_user_list[recived_id].joined_chat['chat2'];
			
			switch(command){
				case '/name':
					console.log('change user name');
					now_user_list[recived_id].user_name = command_val;
					chatNS.emit('update_list_st', now_user_list, user_count);
					break;
				case '/room':
					console.log('change room name');

					if(command_val=== null || command_val===''){
						user_count[this_chat].name = user_count[this_chat].default
					}else{
						user_count[this_chat].name = command_val;
					}

					chatNS.emit('update_list_st', now_user_list, user_count);
					break;
				case '/member':
					const reg = /^\s*[0-9]*$/
					if(command_val.match(reg) && command_val <= 20 && command_val >=2){
						user_count[this_chat].max = command_val;
						chatNS.emit('update_list_st', now_user_list, user_count);
					}else if(command_val === '0' || command_val ==='' || command_val===null){
						user_count[this_chat].max = 999;
						chatNS.emit('update_list_st', now_user_list, user_count);
					}else{
						chatNS.to(recived_id).emit('message', system_user_data, '部屋人数は2～20までの間で設定してください。', true);
					}
					break;
				
				case '/rom':
					now_user_list[recived_id].usr_status = 'rom';
					chatNS.emit('update_list_st', now_user_list, user_count);

					break;
			}
		});
		
		socket.on('change_form_item', function(recived_id, changed_item_id, changed_item_val){
			console.log(now_user_list[recived_id].be_bolder);

			switch(changed_item_id){
			
				case 'icon_select':
					now_user_list[recived_id].icon = changed_item_val;
					chatNS.emit('update_list_st', now_user_list, user_count);
					break;
				case 'font_color_picker':
					now_user_list[recived_id].font_color = changed_item_val;
					break;
				case 'font_size_select':
					now_user_list[recived_id].font_size = changed_item_val;
					break;
				case 'bolder_sw':
					if(now_user_list[recived_id].be_bolder){
						now_user_list[recived_id].be_bolder = false;
					}else{
						now_user_list[recived_id].be_bolder = true;
					}
					break;
				case 'italic_sw':
					if(now_user_list[recived_id].be_italic){
						now_user_list[recived_id].be_italic = false;
					}else{
						now_user_list[recived_id].be_italic = true;
					}
					break;
				case 'underl_sw':
					if(now_user_list[recived_id].be_underl){
						now_user_list[recived_id].be_underl = false;
					}else{
						now_user_list[recived_id].be_underl = true;
					}
					break;
			}
		});

	});
	
});




http.listen(PORT, function(){
	console.log('server started on %d', PORT);
});


module.exports = app;
