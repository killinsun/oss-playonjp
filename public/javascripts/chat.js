$(function(io, $) {
  var socket = io.connect('http://localhost/chat'),
    $html = $('html,body'),
    page1 = $('#page1'),
    page2 = $('#page2').hide(),
    leaveBtn = $('#leave').hide(),
    roomBox = $('#room'),
    nameBox = $('#name'),
    joinBtn = $('#join'),
    msgBox = $('#message'),
    msgList = $('#view');

  socket.on('connected', function() {
    console.log('[System]Welcome to simple chat!');
  });

  joinBtn.on('click', function() {
    var r = roomBox.val();
    var n = nameBox.val();
    chat(r, n);
  });

  function chat(room, name) {
    socket.json.emit('init', {
      'room': room,
      'name': name
    });
  }

  socket.on('initialized', function() {
    page1.hide();
    page2.show();
    leaveBtn.show();
  });

  leaveBtn.on('click', function() {
    socket.emit('leave');
    page2.hide();
    leaveBtn.hide();
    page1.show();
    msgList.empty();
  });

  function send() {
    var data = msgBox.val();
    socket.json.send(data);
    msgBox.val('');
  }

  msgBox.focus(function() {
    page2.bind('keypress', sendByTypeEnter);
  });
  msgBox.blur(function() {
    page2.unbind('keypress', sendByTypeEnter);
  });

  var sendByTypeEnter = function(e) {
    if (e.keyCode === 13) {
      send();
    }
  };

  function update(data, systemFlag) {
    var list = $('<li>').html(data);
    if (systemFlag) {
      list.css('color', '#aaa');
    }
    msgList.append(list);
    $html.animate({
      scrollTop: list.offset().top
    }, 'fast');
  }

  socket.on('message', function(data) {
    if (data) {
      update(data);
    }
  });
  socket.on('System', function(data) {
    var systemFlag = true;
    if (data) {
      update(data, systemFlag);
    }
  });

}(io, jQuery));
