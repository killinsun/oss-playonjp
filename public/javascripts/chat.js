//e.g,,, /member: 12 -> set room member max capacity.
const special_command =/^\/[a-z]*:(.*)$/;
var user_data= {};
var socket = io();
$(function(){

	//Room join
	$('#form_join').submit(function(){

		var user_name = $('#user_name').val()

		$('#join_view').hide();
		$('#room_view').show();
		$('#current_user_name').text(user_name);

		user_data = {
			'socket_id': socket.id, 
			'user_name': user_name, 
			'joined_room': {'room1': 'share', 'room2': ''},
			'resent_chat': null,
			'usr_status'	 : 'stable',
			'in_msg'	 : 'さんが入室しました',
			'out_msg'	 : 'さんが退室しました',
			'msg_count'	 : 0
		}
		
		socket.emit('room_join', user_data);

		return false;
	});

	//Chat join
	$('.room_join_btn').click(function(){
		//Get pressed button's room name.
		var room = $(this).closest('.room').attr('id');

		user_data.joined_room['room2'] = room;

		socket.emit('room_join', user_data );

		socket.on('result', function(result){
			if(result){
				$('#room_view').hide();
				$('#chat_view').show();
			}else{
				console.log("入れませんでした");
			}
		});

	
	});
	
	//Update user list
	socket.on('update_list_st',function(now_user_list, member_count){
		//Update Member list
		$('.one_line').remove();
		for(user in now_user_list){
			var socket_id = now_user_list[user].socket_id;
			var user_name = now_user_list[user].user_name;
			var room_name = now_user_list[user].joined_room['room2'];
			var usr_status	  = now_user_list[user].usr_status;
			console.log('room:' + room_name);
			one_line = '<div class="one_line row">';
			one_line+= '<div class="room_color ' + room_name + ' col-sm-1"></div>';
			if(usr_status ==='rom'){
				one_line+= '<div class="user_name col-sm-4 rom_user">' + user_name + '</div>';
			}else{
				one_line+= '<div class="user_name col-sm-4">' + user_name + '</div>';
			}
			one_line+= '<div class="date_time col-sm-6">2017/12/31 0:00:00 </div>';
			one_line+= '<div class="icon col-sm-1">a </div>';
			one_line+= '</div>';
			$('#list').append(one_line);
		}
		//Update room member number and title name;
		for(r in member_count){
			if(r===''){
				
			}else{
				$('#room_list').find('#'+r).find('.number').text(
					member_count[r].now + "/" + member_count[r].max
				);

				$('#room_list').find('#'+r).find('.room_name').text(
					member_count[r].name
				);
			}
		}

	});
	
	//Send message and update message box
	$('#form_chat').submit(function(){
		var msg = $('#msg').val()
		if(msg.match(special_command)){
			console.log(msg);
			spl_str= msg.split(":");	
			command = spl_str[0];
			command_val = spl_str[1];

			socket.emit('special_command', socket.id, command, command_val);
			$('#msg').val('').focus();
			return false;
		}else if(msg.match(/^\/rom\s*$/)){
			console.log(msg);
			socket.emit('special_command', socket.id, msg, null);
			$('#msg').val('').focus();
			return false;
		}
		if(msg ==='') return false;
		socket.emit('message', socket.id, msg);

		$('#msg').val('').focus();
		return false;
	});


	socket.on('message', function(user_name,msg){
		$('#message').append($('<li>').text(user_name + " : " + msg));

	});

	$('#btn_leave').click(function(){
		$('#chat_view').hide();
		$('#room_view').show();
		socket.emit('room_leave', socket.id);

	});

});

