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
io.on('connection', function(socket){
	console.log('%s joined.', socket.id);

	socket.on('room_join', function(user_data){
		console.log(user_data);
		console.log(now_user_list);
		if(!now_user_list[user_data.socket_id]){
			now_user_list[user_data.socket_id] = user_data;
			console.log("add now_user_list " + now_user_list[user_data.socket_id]);
		}
		console.log(now_user_list);
		now_user_list[user_data.socket_id].joined_room['room2'] = user_data.joined_room['room2'];
		
		join_room = now_user_list[user_data.socket_id].joined_room['room2'];

		console.log(
			now_user_list[user_data.socket_id].socket_id +
			' Joined to ' + 
			join_room
		);

		socket.join(join_room);
		io.sockets.emit('update_list_st', now_user_list);
	});

	socket.on('room_leave', function(recived_id){
		if(!now_user_list[recived_id]){
			console.log('socket error');
		}
		leave_room = now_user_list[recived_id].joined_room['room2'];
		console.log(now_user_list[recived_id].user_name + 
			' leave from ' + 
			leave_room);
		socket.leave(leave_room);
		now_user_list[recived_id].joined_room['room2'] = '';
		io.sockets.emit('update_list_st', now_user_list);
	});

	socket.on('message', function(user_data) {
		io.sockets.in(room).emit('message', msg, now_user_list[socket.id]);
	});

	socket.on('disconnect', function(e) {
		console.log('%s leave.', now_user_list[socket.id]);
		delete now_user_list[socket.id];
		io.sockets.emit('update_list_st', now_user_list);
	});

});
// --------------------------------


http.listen(PORT, function(){
	console.log('server started on %d', PORT);
});


module.exports = app;
