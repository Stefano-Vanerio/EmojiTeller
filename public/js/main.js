const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const overlay = document.querySelector("overlayText");


const { username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username}); 

// Get room and users
socket.on('roomUsers', ({ length }) => {
  outputUsers(length);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

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
  onOverlay();
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
  on(message.text);
  twemoji.parse(document.body);
}

// Add users to DOM
function outputUsers(length) {
  userList.innerHTML = '';
  document.getElementById('player-nb').innerHTML = length;
  console.log(length);

  /*users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });*/
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    socket.disconnect();
    window.location = '../index.html';
  } else {
  }
});

document.getElementById("audio").loop=true;

function onOverlay() {
  try {
    document.getElementById("wait-overlay").style.display = "block";
    //test overlay fix
    document.getElementById("emojis").parentElement.style.display = "none";
  } catch {};
}

function on(message) {
  try {
  document.getElementById("emoji-overlay").style.display = "block";
  document.getElementById("overlayText").textContent = message;
  } catch {};
}

function off() {
  try {
    document.getElementById("wait-overlay").style.display = "none";
    document.getElementById("emoji-overlay").style.display = "none"; 
    //test overlay fix
    document.getElementById("emojis").parentElement.style.display = "block";
  }
  catch {};
}
