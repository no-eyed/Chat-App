const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const http = require('http');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3002 || process.env.PORT;
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'L chatapp';
io.on('connection', socket => {
    console.log('New Connection ho gaya');
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome Welcome Welcome'));

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    
    socket.on('chatMessage', (msg) => {
        //console.log(msg);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () =>  {
        //const user = getCurrentUser(socket.id);
        const user = userLeave(socket.id);
        
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(PORT, () => 
    console.log(`Server chal raha h is port pr : ${PORT}`));

app.get('/', (req, res) => {
    res.send("Chala liye bhai, badiya");
})

