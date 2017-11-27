var socket = io();

$(function(){
	$('form').submit(function(){

		var msg = $('#msg').val()

		if(msg ==='') return false;

		socket.emit('message', msg);

		$('#msg').val('').focus();
		return false;
	});

	socket.on('message', function(msg, id){
		$('#message').append($('<li>').text(id + " : " + msg));

	});
});

