//e.g,,, /member: 12 -> set room member max capacity.
const special_command =/^\/[a-z]*:(.*)$/;
let room_id = $('#get_data').data('string');

let websocket_url = '/chat_' + room_id;
let socket = io.connect(websocket_url);

function dispatcher (path, func) {
    dispatcher.path_func = dispatcher.path_func || []
    if (func) return dispatcher.path_func.push([path, func]);
    for(var i = 0, l = dispatcher.path_func.length; i < l; ++i) { // >
        var func = dispatcher.path_func[i];
        var match = path.match(func[0]);
        match && func[1](match);
    };
};

dispatcher('^/$', function(){
	console.log(socket);
	$(function(){

		socket.emit('all_view_callback');
		let client_side_all_user = {}

		socket.on('get_all_users',function(all_user_list, room_array){
			client_side_all_user = all_user_list;
			
			//update room member name
			for(r in room_array){
				let member_string = '';
				for(a in client_side_all_user){
					let user = client_side_all_user[a];

					if(user.room_id == room_array[r]){
						if(user.user_name != null){
							member_string += user.user_name +', ';
						}

						$('#'+ room_array[r] ).find('.member_list').find('p').text(member_string);
					}
				}
				$('#'+ room_array[r] ).find('.member_list').find('p').text(member_string);
			}

		});

		socket.on('update_data', function(recived_data){

			let recived_id					 = recived_data.socket_id;
			client_side_all_user[recived_id] = recived_data;

			let member_string = '';
			for(a in client_side_all_user){
				if(client_side_all_user[a].room_id == recived_data.room_id){
					if(client_side_all_user[a].user_name != null){
						member_string += client_side_all_user[a].user_name + ',';
					}
					
				}
			}

			$('#' + recived_data.room_id).find('.member_list').find('p').text(member_string);
		});

	});

});


dispatcher('^/chat$', function(){
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
			let send_data = {};
			send_data.user_name		= $('#user_name').val()
			send_data.joined_time	= formatDate(new Date(),'YYYY/MM/DD hh:mm:ss');

			$('#join_view').hide();
			$('#room_view').show();
			$('#current_user_name').text(send_data.user_name);
			
			socket.emit('room_join', send_data);
			return false;
		});

		//chat join
		$('.room_join_btn').click(function(){
			//get pressed button's room name.
			let room = $(this).closest('.room').attr('id');
			let send_data = {};

			$('#chatted_msg_area div').remove();

			send_data.join_room = room;

			socket.emit('chat_join', send_data );

			socket.on('result', function(result){
				if(result){
					$('#room_view').hide();
					$('#chat_view').show();
				}else{
					console.log("入れませんでした");
				}
			});

		
		});
		
		//update user list status
		socket.on('update_list_st',function(now_user_list, user_count){
			let my_socketid = socket.id;

			//If user already joined chatroom, get own chatroom info.
			if(now_user_list[my_socketid].joined_chat['chat2'] != ''){
				let my_room		= now_user_list[my_socketid].joined_chat['chat2'];
				let my_room_name = user_count[my_room].name;

				//update chat room info
				$('#chat_room_title').text(my_room_name);
				$('#chat_room_count').text('現在　' + user_count[my_room].now + ' 人');

				if(user_count[my_room].max === 999){
					$('#chat_room_limit').text('定員　なし');
				} else{
					$('#chat_room_limit').text('定員　' + user_count[my_room].max);
				}

			} else{
			}

			$('#chat_room_uname').text(now_user_list[my_socketid].user_name);

			//update member list
			$('.one_line').remove();
			$('#room_dm_to option').remove();
			$('#room_dm_to').append($('<option>', {class:'form-control',text: '共有ボード', value: 'share'}));

			$('#chat_dm_to option').remove();
			$('#chat_dm_to').append($('<option>', {class:'form-control',text: '部屋', value: 'this_room'}));
			$('#chat_dm_to').append($('<option>', {class:'form-control',text: '共有ボード', value: 'share'}));

			for(user in now_user_list){
				is_room_join = now_user_list[user].joined_chat['chat1']
				if(is_room_join === '' || is_room_join === null){

				}else{
					let socket_id = now_user_list[user].socket_id;
					let user_name = now_user_list[user].user_name;
					let room_name = now_user_list[user].joined_chat['chat2'];
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

					//dm_to(in room)
					$('#room_dm_to').append($('<option>', {class:'form-control',text: user_name, value: socket_id}));

					//dm_to(in chat)
					$('#chat_dm_to').append($('<option>', {class:'form-control',text: user_name, value: socket_id}));
				}
			}
			//update room member count and title name;
			for(r in user_count){
				if(r==='share'){
					
				}else{

					if(user_count[r].max === 999){
						$('#room_list').find('#'+r).find('.number').text(user_count[r].now);
					}else{
						$('#room_list').find('#'+r).find('.number').text(
								user_count[r].now + "/" + user_count[r].max
						);
					}
					
					$('#room_list').find('#'+r).find('.room_name').text(
						user_count[r].name
					);
				}
			}
		});
		
		//send message and update message box
		$('#form_chat').submit(function(){
			let msg			= $('#input_box').val();
			let recent_chat = formatDate(new Date(),'YYYY/MM/MM hh:mm:ss');
			let to_id		= $('#chat_dm_to').val();

			if(to_id==='this_room'){
			//Open message

				//use special command
				if(msg.match(special_command)){
					spl_str= msg.split(":");	
					command = spl_str[0];
					command_val = spl_str[1];

					socket.emit('special_command', socket.id, command, command_val);
					$('#input_box').val('').focus();
					return false;
				}else if(msg.match(/^\/rom\s*$/)){
					socket.emit('special_command', socket.id, msg, null);
					$('#input_box').val('').focus();
					return false;
				}

			socket.emit('message', socket.id, msg, recent_chat);

			}else{
			// Direct message
				socket.emit('direct_message', socket.id, msg, recent_chat, to_id);
			}

			if(msg ==='') return false;

			$('#input_box').val('').focus();

			return false;

		});


		socket.on('message', function(recived_user_data, msg, is_direct){
			let user_name	= recived_user_data.user_name;
			let msg_icon	= recived_user_data.icon;
			let font_size	= recived_user_data.font_size;
			let font_color	= recived_user_data.font_color;
			let is_bolder	= recived_user_data.be_bolder;
			let is_italic	= recived_user_data.be_italic;
			let	is_underl	= recived_user_data.be_underl;

			let one_line = $('<div>',  { class:'msg_line row'});
			one_line.append($('<div>', { class:'msg_icon col-md-1', text: msg_icon}));
			one_line.append($('<div>', { class:'chat_user col-md-2', text: user_name}));
			one_line.append($('<div>', { class:'msg col-md-9 ', text: msg}));
			one_line.css({'font-size': font_size, 'color': font_color});

			if(is_bolder){ one_line.children('.msg').addClass('be_bolder'); }
			if(is_italic){ one_line.children('.msg').addClass('be_italic'); }
			if(is_underl){ one_line.children('.msg').addClass('be_underl'); }

			if(is_direct){
				$('#dm_msg_area').prepend(one_line);
			}else{
				$('#chatted_msg_area').prepend(one_line);
			}

		});

		$('#btn_leave').click(function(){
			$('#chat_view').hide();

			$('#input_box').val('');
			$('#room_view').show();
			socket.emit('chat_leave', socket.id);
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

		$('.event_target').click(function(){
			let changed_item_id = $(this).attr("id");
			let changed_item_val = $(this).val();
			socket.emit('change_form_item', socket.id, changed_item_id, changed_item_val);
		});

});


});
dispatcher(location.pathname);
