const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Đặt thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chatiend Bot';

// Chạy khi user kết nối
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Chào mừng user hiện tại
        socket.emit('message', formatMessage(botName, `Chào mừng ${user.username} đã đến với room ${user.room}`));

        // Thông báo khi có user kết nối
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName, `${user.username} đã tham gia phòng chat`)
            );

        // Gửi thông tin user và phòng chat
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Nhận chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Chạy khi user bỏ kết nối
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} đã rời phòng chat`)
            );

            // Gửi thông tin user và phòng chat
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server chạy ở port ${PORT}`));