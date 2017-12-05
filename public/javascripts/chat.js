//e.g,,, /member: 12 -> set room member max capacity.
const special_command =/^\/[a-z]*:(.*)$/;
var user_data= {};
var socket = io();
$(function(){

	let formatDate = function (date, format) {
	  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
	  format = format.replace(/YYYY/g, date.getFullYear());
	  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
	  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
	  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
	  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
	  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
	  if (format.match(/S/g)) {
		var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
		var length = format.match(/S/g).length;
		for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
	  }
	  return format;
	};


	//room join
	$('#form_join').submit(function(){

		let user_name = $('#user_name').val()
		let joined_time = formatDate(new Date(),'YYYY/MM/DD hh:mm:ss');

		$('#join_view').hide();
		$('#room_view').show();
		$('#current_user_name').text(user_name);

		user_data = {
			'socket_id': socket.id, 
			'user_name': user_name, 
			'joined_room': {'room1': 'share', 'room2': ''},
			'joined_time': joined_time,
			'resent_chat': null,
			'usr_status' : 'stable',
			'in_msg'	 : 'さんが入室しました',
			'out_msg'	 : 'さんが退室しました',
			'msg_count'	 : 0,
			'icon'		 : '',
			'font_size'  : 'large',
			'font_color' : '#000000',
			'be_bordear' : false,
			'be_italic'  : false,
			'be_underl'  : false
		}
		
		socket.emit('room_join', user_data);

		return false;
	});

	//chat join
	$('.room_join_btn').click(function(){
		//get pressed button's room name.
		let room = $(this).closest('.room').attr('id');

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
	
	//update user list
	socket.on('update_list_st',function(now_user_list, member_count){
		let my_socketid = socket.id;
		let my_room		= now_user_list[my_socketid].joined_room['room2'];
		let my_room_name = member_count[my_room].name;

		//update member list
		$('.one_line').remove();
		for(user in now_user_list){
			let socket_id = now_user_list[user].socket_id;
			let user_name = now_user_list[user].user_name;
			let room_name = now_user_list[user].joined_room['room2'];
			let usr_status	  = now_user_list[user].usr_status;
			let joined_time	  = now_user_list[user].joined_time;
			let icon		  = now_user_list[user].icon;
			console.log('room:' + room_name);
			one_line = '<div class="one_line row">';
			one_line+= '<div class="room_color ' + room_name + ' col-sm-1"></div>';
			if(usr_status ==='rom'){
				one_line+= '<div class="user_name col-sm-4 rom_user">' + user_name + '</div>';
			}else{
				one_line+= '<div class="user_name col-sm-4">' + user_name + '</div>';
			}
			one_line+= '<div class="date_time col-sm-6">' + joined_time + '</div>';
			one_line+= '<div class="icon col-sm-1">'+ icon + ' </div>';
			one_line+= '</div>';
			$('#list').append(one_line);
		}
		//update room member number and title name;
		for(r in member_count){
			if(r===''){
				
			}else{

				if(member_count[r].max === 999){
					$('#room_list').find('#'+r).find('.number').text(member_count[r].now);
				}else{
					$('#room_list').find('#'+r).find('.number').text(
							member_count[r].now + "/" + member_count[r].max
					);
				}
				
				$('#room_list').find('#'+r).find('.room_name').text(
					member_count[r].name
				);
			}
		}

		//update chat room info
		$('#chat_room_title').text(my_room_name);
		$('#chat_room_count').text('現在　' + member_count[my_room].now + ' 人');

		if(member_count[my_room].max === 999){
			$('#chat_room_limit').text('定員　なし');
		} else{
			$('#chat_room_limit').text('定員　' + member_count[my_room].max);
		}

		$('#chat_room_uname').text(now_user_list[my_socketid].user_name);

	});
	
	//send message and update message box
	$('#form_chat').submit(function(){
		let msg			= $('#input_box').val()
		let recent_chat = formatDate(new Date(),'YYYY/MM/MM hh:mm:ss');

		if(msg.match(special_command)){
			console.log(msg);
			spl_str= msg.split(":");	
			command = spl_str[0];
			command_val = spl_str[1];

			socket.emit('special_command', socket.id, command, command_val);
			$('#input_box').val('').focus();
			return false;
		}else if(msg.match(/^\/rom\s*$/)){
			console.log(msg);
			socket.emit('special_command', socket.id, msg, null);
			$('#input_box').val('').focus();
			return false;
		}

		if(msg ==='') return false;

		socket.emit('message', socket.id, msg, recent_chat);
		$('#input_box').val('').focus();

		return false;

	});


	socket.on('message', function(recived_user_data,msg){
		let user_name	= recived_user_data.user_name;
		let msg_icon	= recived_user_data.icon;
		let font_size	= recived_user_data.font_size;
		let font_color	= recived_user_data.font_color;

		let one_line = '<div class="msg_line row">';
		one_line += '<div class="msg_icon col-md-1">' + msg_icon + '</div>';
		one_line += '<div class="chat_user col-md-2">' + user_name + '</div>';
		one_line += '<div class="msg col-md-9">';
		one_line += '<span width:100%; style="color:' + font_color + '; font-size:' + font_size  +';">';
		one_line += msg;
		one_line += '</span></div></div>';
		$('#chatted_msg_area').prepend(one_line);

	});

	$('#btn_leave').click(function(){
		$('#chat_view').hide();

		$('#input_box').val('');
		$('#room_view').show();
		socket.emit('room_leave', socket.id);
		$('#chatted_msg_area div').remove();

	});
	
	function judgeRomStatus(recent_chat){
		let now = new Date();

		let diff = (now.getTime() - recent_chat.getTime()) / ( 1000 * 60 * 60 * 24);
		console.log(diff);
	}

	$('.event_target').change(function(){
		let changed_item_id  = $(this).attr("id");
		let changed_item_val = $(this).val();
		socket.emit('change_form_item', socket.id, changed_item_id, changed_item_val);
		

	});


});


