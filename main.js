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
socket.on('roomUsers', ({ users }) => {
  outputUsers(users);
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
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
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
    document.getElementById("nextButton").style.display = "none";
  document.getElementById("overlay").style.display = "block";
  document.getElementById("overlayText").style.writingMode = "horizontal-tb";
  document.getElementById("overlayText").textContent = "WAIT!";
  } catch {};
}

function on(message) {
  try {
  document.getElementById("overlayText").style.writingMode = "vertical-lr";
  document.getElementById("overlayText").textContent = message;
  document.getElementById("im").style.display="none"; 
  document.getElementById("overlay").style.display = "block";
  document.getElementById("nextButton").style.display = "block";
  } catch {};
}

function off() {
  try {
  document.getElementById("overlay").style.display = "none"; 
  }
  catch {};
}
