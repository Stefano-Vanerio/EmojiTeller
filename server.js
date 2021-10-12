const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

var numberOfPlayers= 0; //for each room TODO
var numberOfMessages = 0;
var messageList = [];
var socketList = [];
var playerList = [];

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

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room, avatar, color}) => {
    const user = userJoin(socket.id, username, room, avatar, color);
    console.log(username);
    playerList.push(user.username);
    socket.join(user.room);

    // Welcome current user
    //socket.emit('message', formatMessage(botName, 'Welcome to ChatCord! '+username));
    numberOfPlayers++;

    console.log(user.username+" has joined the channel");

    console.log(numberOfPlayers);

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    console.log(user.username+": " + msg);
    
    if (!socketList.includes(socket.id) ) {
    messageList.push(msg);
    socketList.push(socket.id);
    console.log("entered");
    numberOfMessages++;
      if (numberOfMessages == numberOfPlayers) {
        //io.to(user.room).emit('message', formatMessage(user.username, "The next storyteller is: "+randomStoryteller(playerList)));
        console.log(messageList);
        messageList = shuffle(messageList);
        console.log(messageList);
        console.log(numberOfPlayers);
        for (let i=0; i<numberOfPlayers; i++) {
          console.log("debug");
          //io.to(user.room).emit('message', formatMessage(user.username, msg));
          io.to(socketList[i]).emit("message", formatMessage(user.username, messageList[i]));
          //console.log(socketList[i]+" "+messageList[i]);
          
        }
        playerList= [];
        numberOfMessages = 0;
        messageList = [];
        socketList=[];
        
    }
  }
    //wait untill the number of messagges is equal to the number of players and there is a message for each player
     //io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
   /* playerList = playerList.filter(function(value, index, arr){ 
      return value != user.user;
    });*/
    //TO DO RIMUOVERE MESSAGGIO DI PLAYER SE SI DISCONNETTE
    numberOfPlayers--;
    if (numberOfPlayers<0) {numberOfPlayers=0;}
    console.log(numberOfPlayers);

    if (user) {
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

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
  }

  function randomStoryteller(array) {
    shuffle(array);
    return array[1];
  }