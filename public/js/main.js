const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

/*usernameForm.addEventListener('submit', (e) =>
{
  username = document.getElementById('username').value;
  avatar =  document.getElementById('avatar').value;
  console.log(username+avatar);
});*/
/*
const { username, avatar} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});*/

/*
// Get username and room from URL
const { room, version, username, avatar} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});*/



const { username, room, avatar } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room, avatar}); //, avatar, version });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

/*
usernameForm.addEventListener('submit', (e) =>
{
  username = document.getElementById('username').value;
  avatar =  document.getElementById('avatar').value;
  console.log(username+avatar);
});*/

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
  on();
  off();
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.avatar+" "+user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

function on() {
  try {
  document.getElementById("overlay").style.display = "block";
  } catch {};
}

function off() {
  try {
  //document.getElementById("overlay").style.display = "none"; 
  }
  catch {};
}
/*
					function getParams(){
					var idx = document.URL.indexOf('?');
					var params = new Array();
					if (idx != -1) {
					var pairs = document.URL.substring(idx+1, document.URL.length).split('&');
					for (var i=0; i<pairs.length; i++){
					nameVal = pairs[i].split('=');
					params[nameVal[0]] = nameVal[1];
					}
					}
					return params;
					}
					params = getParams();
					firstname = unescape(params["username"]);
					lastname = unescape(params["avatar"]);
*/

/*
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});*/
