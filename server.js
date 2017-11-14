const express	= require('express');
const app		= express();
const http		= require('http').Server(app);
const PORT		= process.env.PORT || 8000;
const io		= require('socket.io')(http);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (s) => {
	s.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
});

http.listen(PORT, () => {
	console.log(`listening on *:${PORT}`);
});

