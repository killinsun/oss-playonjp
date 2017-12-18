$(function(){
	$('.room_join').click(function(){
		let room_id = $(this).closest('.roomarea').attr('id');
		window.location.href = '/chat?room_id=' + room_id;


	});

});

