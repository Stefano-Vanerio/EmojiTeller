const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

var messageList = [];
var playerMessageList = [];
var playerList = [];
var room = "place";

const {
  userJoin,
  getCurrentUser,
  userLeave,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username}) => {
    const user = userJoin(socket.id, username);
    playerList.push(user);
    
    socket.join(room);

    console.log(user.username+" has joined the channel");
    console.log(playerList.length);

    io.to("place").emit('roomUsers', {
      length: playerList.length,
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    if (user != undefined) {
    console.log(user.username+": " + msg);
    
    if (!playerMessageList.includes(user)) {
    messageList.push(msg);
    playerMessageList.push(user);
    console.log(user.username+" message sended");

      if (messageList.length == playerList.length && messageList.length>3) {
        messageList = shuffle(messageList);
        console.log(messageList);
        console.log(playerList.length);
        for (let i=0; i<playerList.length; i++) {
          io.to(playerMessageList[i].id).emit("message", formatMessage(user.username, messageList[i]));        
        }
        messageList = [];
        playerMessageList=[];
    }
  }}
  });

  // Runs when client disconnects
  socket.on('disconnect', (reason) => {
    const user = userLeave(socket.id);

    console.log("player list: "+playerList);
    console.log("message list: "+messageList);
    console.log("mess of player list: "+playerMessageList);

    var index = playerList.findIndex(user => user.id === socket.id);
  
    if (index !== -1) {
      playerList.splice(index, 1)[0];
    }

    var indexTwo = playerMessageList.findIndex(user => user.id === socket.id);
    if (indexTwo !== -1) {
      messageList.splice(indexTwo, 1)[0];
      playerMessageList.splice(indexTwo, 1)[0];
    }

    console.log("player list: "+playerList);
    console.log("message list: "+messageList);
    console.log("mess of player list: "+playerMessageList);

    if (user) {
      console.log(user.username+" has left the channel");
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
