var socket = io();

$(function(){

	//Room join
	$('#form_join').submit(function(){

		var user_name = $('#user_name').val()

		$('#join_view').hide();
		$('#room_view').show();
		
		socket.emit('room_join', {'socket_id': socket.id, 'user_name': user_name, 'joined_room': {'room': 'share'}:,"share");

		return false;
	});

	//Chat join
	$('.room_join_btn').click(function(){
		//Get pressed button's room name.
		var room = $(this).closest('.room').attr('id');
		
		$('#room_view').hide();
		$('#chat_view').show();
		socket.emit('room_join', {'socket_id': socket.id, 'user_name': user_name}, room);
		console.log(socket.id + ':' + room);

	
	});
	
	//Update user list
	socket.on('update_list_st',function(now_user_list,room){
		$('.one_line').remove();
		for(user in now_user_list){
			one_line = '<div class="one_line">';
			one_line+= '<div class="room_color">' + room + '</div>';
			one_line+= '<div class="user_name">' + now_user_list[user] + '</div>';
			one_line+= '<div class="date_time">2017/12/31 0:00:00 </div>';
			one_line+= '<div class="icon">a </div>';
			one_line+= '</div>';
			$('#list').append(one_line);
		}
	});
	
	//Send message and update message box
	if(user_name != ''){
		$('#btn_send').click(function(){

			var msg = $('#msg').val()
			if(msg ==='') return false;

			socket.emit('message', {'socket_id': socket.id, 'user_name': user_name}, room);
			console.log(room);

			$('#msg').val('').focus();
			return false;
		});


		socket.on('message', function(user_name,msg){
			$('#message').append($('<li>').text(user_name + " : " + msg));

		});
	};

	$('#btn_leave').click(function(){
		//Get pressed button's room name.
		$('#chat_view').hide();
		$('#room_view').show();
		socket.emit('room_join', {'socket_id': socket.id, 'user_name': user_name}, room);
		console.log(socket.id + ':' + room);

	
	});

});

