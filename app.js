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
var now_user_num  = {
	'': 0,
	'red': 0,
	'waterblue': 0,
	'green': 0,
	'purple': 0,
	'yellow': 0,
	'blue': 0
	};

var max_user_num  = {
	'': 20,
	'red': 20,
	'waterblue': 20,
	'green': 20,
	'purple': 20,
	'yellow': 20,
	'blue': 20
	};
io.on('connection', function(socket){
	console.log('%s joined.', socket.id);

	socket.on('room_join', function(user_data){
		if(!now_user_list[user_data.socket_id]){
			now_user_list[user_data.socket_id] = user_data;
			console.log("add now_user_list " + now_user_list[user_data.socket_id].user_name);
		}
	
		join_room = user_data.joined_room['room2'];	

		if(max_user_num[join_room] >= now_user_num[join_room] + 1){
			now_user_list[user_data.socket_id].joined_room['room2'] = join_room;
			now_user_num[join_room] += 1;
			socket.join(join_room);
			io.sockets.emit('update_list_st', now_user_list, now_user_num);
			io.to(user_data.socket_id).emit('result', true);
		}else{
			console.log("Capacity is max. send to " + user_data.socket_id + ":" + user_data.user_name);
			io.to(user_data.socket_id).emit('result', false);

		}
	});

	socket.on('room_leave', function(recived_id){
		if(!now_user_list[recived_id]){
			console.log('socket error');
		}

		leave_room = now_user_list[recived_id].joined_room['room2'];

		socket.leave(leave_room);
		now_user_list[recived_id].joined_room['room2'] = '';
		now_user_num[leave_room] -= 1;
		io.sockets.emit('update_list_st', now_user_list, now_user_num);
	});


	socket.on('message', function(recived_id, msg) {
		if(!now_user_list[recived_id]){
			console.log('socket error');
		}
		socket_id	= recived_id;
		user_name	= now_user_list[recived_id].user_name;
		room		= now_user_list[recived_id].joined_room['room2'];

		io.sockets.in(room).emit('message', user_name, msg);
	});

	socket.on('disconnect', function(e) {
		console.log('%s leave.', now_user_list[socket.id]);
		if(now_user_list[socket.id]){
			leave_room = now_user_list[socket.id].joined_room['room2'];
			now_user_num[join_room] -= 1;
			now_user_num[''] -= 1;
			delete now_user_list[socket.id];
			io.sockets.emit('update_list_st', now_user_list, now_user_num);
		}
	});

	socket.on('special_command', function(recived_id, command, command_val){
		this_room = now_user_list[recived_id].joined_room['room2'];
		
		switch(command){
			case '/name':
				console.log('change user name');
				now_user_list[recived_id].user_name = command_val;
				io.sockets.emit('update_list_st', now_user_list, now_user_num);
				break;
			case '/room':
				console.log('change room name');
				break;
			case '/member':
				const reg = /^\s*[0-9]*$/
				if(command_val.match(reg) && command_val <= 20 && command_val >=2){
					max_user_num[this_room] = command_val;
				}else{
					io.sockets.in(this_room).emit('message', '', '部屋人数は2～20までの間で設定してください。'+ command_val);

				}
				break;
		}
	});


});
// --------------------------------


http.listen(PORT, function(){
	console.log('server started on %d', PORT);
});


module.exports = app;
