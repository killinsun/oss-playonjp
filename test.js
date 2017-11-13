var app = require('express').createServer()
  , io = require('socket.io').listen(app);
app.listen(8124);
 
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
 
io.sockets.on('connection', function (socket) {
 
    // クライアントからメッセージ受信
    socket.on('server send', function (msg) {
 
        // ブロードキャストで送信
        io.sockets.emit('send user', msg );
    });
 
    // 切断 
    socket.on('disconnect', function () {
        io.sockets.emit('user disconnected',count);
    });
});
