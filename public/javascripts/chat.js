var socket = io();

$(function(){
	$('#form_join').submit(function(){

		var user_name = $('#user_name').val()

		$('#join_view').hide();
		$('#chat_view').show();

		return false;
	});

	socket.on('message', function(msg, id){
		$('#message').append($('<li>').text(id + " : " + msg));

	});

	$('#form_chat').submit(function(){

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

