const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Lấy username và room từ URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Vào chatroom
socket.emit('joinRoom', { username, room });

// Lấy room và users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Tin nhắn từ server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    // Cuộn xuống
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Gửi tin nhắn
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Nhận nội dung tin nhắn
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Gửi tin nhắn đến máy chủ
    socket.emit('chatMessage', msg);

    // Xóa đoạn chữ vừa ghi - input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Xuất tin nhắn ra DOM
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
}

// Thêm tên phòng vào DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Thêm những người dùng vào DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

//Nhắc người dùng trước khi rời khỏi phòng trò chuyện
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Bạn có chắc chắn muốn rời khỏi phòng trò chuyện không?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {}
});