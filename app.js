let express		= require('express');
let path		= require('path');
let favicon		= require('serve-favicon');
let logger		= require('morgan');
let cookieParser= require('cookie-parser');
let bodyParser	= require('body-parser');

let routes		= require('./routes/index');
let users		= require('./routes/users');
let chat		= require('./routes/chat');

let app			= express();
let http		= require('http').Server(app);
let io = require('socket.io')(http);
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
  console.log(err.message);
});





// ----------- Chat Program -------
// We will devide these code later.
//

let room_array = ["all","guest1","guest2","tennis","room1","room2","room3","room4","room5","room6","two","two2","denyroom"];
let all_user_list = {};

room_array.forEach(function(v){

	let now_user_list = {};
	let member_count = {
		'room_id'		: v,
		'share'		: { 'name': '共有ボード', 'default': '共有ボード', 'now': 0, 'max': 50},
		'red'		: { 'name': '赤',	'default': '赤', 	'now': 0, 'max': 999},
		'waterblue'	: { 'name': '薄青', 'default': '薄青',	'now': 0, 'max': 999},
		'green'		: { 'name': '緑',	'default': '緑',	'now': 0, 'max': 999},
		'purple'	: { 'name': '紫',	'default': '紫',	'now': 0, 'max': 999},
		'yellow'	: { 'name': '黄',	'default': '黄',	'now': 0, 'max': 999},
		'blue'		: { 'name': '青',	'default': '青',	'now': 0, 'max': 999},
		};

	let system_user_data = {
		'socket_id': "system_dummy_socket_id",
		'user_name': '',
		'room_id'	 : v,
		'joined_room': {'room1': 'share', 'room2': ''},
		'joined_time': null,
		'resent_chat': null,
		'usr_status' : 'stable',
		'in_msg'	 : 'さんが入室しました',
		'out_msg'	 : 'さんが退室しました',
		'msg_count'	 : 0,
		'icon'		 : '',
		'font_size'  : 'large',
		'font_color' : '#000000',
		'be_bolder'	 : false,
		'be_italic'  : false,
		'be_underl'  : false
	}

	let chatNS = io.of('/chat_'+ v);

	chatNS.on("connection", function(socket){
		let user_data = {
			'socket_id'  : socket.id,
			'user_name'  : '',
			'room_id'	 : v,
			'joined_room': {'room1': '', 'room2': ''},
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
		now_user_list[socket.id] = user_data;
		
		i = { 'socket_id': socket.id, 'room_id': v, 'user_name': null, 'chat': null }
		all_user_list[socket.id] = i; 

		chatNS.emit('update_list_st', now_user_list, member_count);

		socket.on('all_view_callback', function(){ chatNS.emit('get_all_users',all_user_list, room_array); });

		socket.on('room_join', function(recived_data){
			if(!now_user_list[socket.id]){
				now_user_list[socket.id] = user_data;
			}
			
			let join_room	= 'share';
			let recived_id  = socket.id;
			now_user_list[recived_id].user_name		= recived_data.user_name;
			now_user_list[recived_id].joined_time	= recived_data.joined_time;
			all_user_list[recived_id].user_name	= recived_data.user_name;

			if(member_count[join_room].max >= member_count[join_room].now + 1){
				now_user_list[recived_id].joined_room['room1'] = join_room;
				member_count[join_room].now += 1;
				socket.join(join_room);
				chatNS.emit('update_list_st', now_user_list, member_count);
				io.of('/chat_all').emit('update_data', all_user_list[recived_id]);
				
			}else{
				console.log("Capacity is too max. send to " + recived_id + ":" + recived_data.user_name);
				chatNS.to(recived_id).emit('result', false);

			}

			console.log(all_user_list[recived_id]);
		});
		
		socket.on('chat_join', function(recived_data){
			if(!now_user_list[socket.id]){
				now_user_list[socket.id] = user_data;
			}
			let recived_id	= socket.id	;
			let user_name	= now_user_list[recived_id].user_name;
			let in_msg		= now_user_list[recived_id].in_msg;
			let join_room	= recived_data.join_room

			if(member_count[join_room].max >= member_count[join_room].now + 1){

				all_user_list[recived_id].chat						= join_room;
				now_user_list[recived_id].joined_room['room2'] = join_room;

				member_count[join_room].now += 1;
				socket.join(join_room);
				chatNS.emit('update_list_st', now_user_list, member_count);
				io.of('/chat_all').emit('update_data', all_user_list[recived_id]);
				
				//Chat room in message.
				if(join_room!=''){
					chatNS.to(join_room).emit('message', system_user_data, user_name + ' ' + in_msg, false);
					chatNS.to(user_data.socket_id).emit('result', true);
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
			
			let user_name	= now_user_list[recived_id].user_name;
			let out_msg		= now_user_list[recived_id].out_msg;
			let leave_room = now_user_list[recived_id].joined_room['room2'];

			//Chat room out message.
			chatNS.to(leave_room).emit('message', system_user_data, user_name + ' ' + out_msg, false);

			socket.leave(leave_room);
			
			now_user_list[recived_id].joined_room['room2'] = '';
			all_user_list[recived_id].chat = '';
			member_count[leave_room].now -= 1;
			if(leave_room!=''){
				chatNS.emit('update_list_st', now_user_list, member_count);
				io.of('/chat_all').emit('update_data', all_user_list[recived_id]);
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
			chatNS.to(room).emit('message', now_user_list[recived_id], msg, false);

			if(now_user_list[recived_id].usr_status = 'rom'){
				now_user_list[recived_id].usr_status = null;
				chatNS.emit('update_list_st', now_user_list, member_count);
			}
		});

		socket.on('direct_message', function(recived_id, msg, recent_chat, to_id){

			//Recent chat time update.
			now_user_list[recived_id].recent_chat = recent_chat;

			//Send message in room members.
			chatNS.to(to_id).emit('message', now_user_list[recived_id], msg, true);

			//output from user's chat view.
			chatNS.to(recived_id).emit('message', now_user_list[recived_id], msg, true);

			if(now_user_list[recived_id].usr_status = 'rom'){
				now_user_list[recived_id].usr_status = null;
				chatNS.emit('update_list_st', now_user_list, member_count);
			}
		});

		socket.on('disconnect', function(e) {
			if(now_user_list[socket.id]){
				leave_room = now_user_list[socket.id].joined_room['room2'];
				if(leave_room != ''){
					member_count[leave_room].now -= 1;
				}

				if(now_user_list[socket.id].joined_room['room1'] != ''){
					member_count['share'].now -= 1;
				}
				if(member_count['share'] < 0){ member_count['share'] = 0; }


				delete now_user_list[socket.id];
				delete all_user_list[socket.id];
				chatNS.emit('update_list_st', now_user_list, member_count);
				chatNS.emit('get_all_users', all_user_list);
			}
		});

		socket.on('special_command', function(recived_id, command, command_val){
			let this_room = now_user_list[recived_id].joined_room['room2'];
			
			switch(command){
				case '/name':
					console.log('change user name');
					now_user_list[recived_id].user_name = command_val;
					chatNS.emit('update_list_st', now_user_list, member_count);
					break;
				case '/room':
					console.log('change room name');

					if(command_val=== null || command_val===''){
						member_count[this_room].name = member_count[this_room].default
					}else{
						member_count[this_room].name = command_val;
					}

					chatNS.emit('update_list_st', now_user_list, member_count);
					break;
				case '/member':
					const reg = /^\s*[0-9]*$/
					if(command_val.match(reg) && command_val <= 20 && command_val >=2){
						member_count[this_room].max = command_val;
						chatNS.emit('update_list_st', now_user_list, member_count);
					}else if(command_val === '0' || command_val ==='' || command_val===null){
						member_count[this_room].max = 999;
						chatNS.emit('update_list_st', now_user_list, member_count);
					}else{
						chatNS.to(recived_id).emit('message', system_user_data, '部屋人数は2～20までの間で設定してください。', true);
					}
					break;
				
				case '/rom':
					now_user_list[recived_id].usr_status = 'rom';
					chatNS.emit('update_list_st', now_user_list, member_count);

					break;
			}
		});
		
		socket.on('change_form_item', function(recived_id, changed_item_id, changed_item_val){
			console.log(now_user_list[recived_id].be_bolder);

			switch(changed_item_id){
			
				case 'icon_select':
					now_user_list[recived_id].icon = changed_item_val;
					chatNS.emit('update_list_st', now_user_list, member_count);
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
