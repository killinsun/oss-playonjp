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

io.on('connection', function(socket){
	console.log('%s joined.', socket.id);

	var room = 'room-a';

	io.sockets.in(room).emit('message',socket.id + 'さんが入室しました', "");

	socket.join(room);

	socket.on('message', function(msg) {
		io.sockets.in(room).emit('message', msg, socket.id);
		console.log(msg);
	});

	socket.on('disconnect', function(e) {
		console.log('%s leave.', socket.id);
	});

});
// --------------------------------


http.listen(PORT, function(){
	console.log('server started on %d', PORT);
});


module.exports = app;
