const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

var numberOfPlayers= 0 ; 
//const loadingFrame = document.getElementById("loadingFrame");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Emoji Bot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    //socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
    numberOfPlayers++;

    // Broadcast when a user connects
    /*socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );*/
    console.log(user.username+" has joined the channel");

    console.log(numberOfPlayers);

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    if (numberOfPlayers>3) {
    const user = getCurrentUser(socket.id);
    console.log(user.username+": " + msg);
    //wait untill the number of messagges is equal to the number of players and there is a message for each player
    io.to(user.room).emit('message', formatMessage(user.username, msg));}
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    numberOfPlayers--;
    if (numberOfPlayers<0) {numberOfPlayers=0;}
    console.log(numberOfPlayers);

    if (user) {
      /*io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );*/
      console.log(user.username+" has left the channel");

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
