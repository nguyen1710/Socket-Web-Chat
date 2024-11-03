const express = require('express')
const session = require('express-session')
const path = require('path');
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const dotenv = require('dotenv');
const connectToDB = require('./database/db.js');
dotenv.config()
const Room = require('./model/room.model.js')

const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.static('public'))
app.set("view engine", 'ejs')

app.use(session({
  secret: 'your-secret-key', // Một chuỗi bí mật để mã hóa session
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Đặt true nếu bạn đang sử dụng HTTPS
}));


app.set('views', path.join(__dirname, '../frontend'));  // Chỉ định thư mục chứa file EJS

// let id
//khi có người kết nối
io.on("connection", function(client){
  let session_username, id
  console.log(`Có người tham gia phòng`)
  //tham gia chat
  client.on("join", async function(data) { //join key của hàm
    const {roomId, username} = data
    console.log(`${username} đã tham gia phòng: ${roomId}`)
    client.join(roomId)

    id = roomId
    session_username = username

    let room = await Room.findOne({roomId : id})
    if (!room) {
      try {
        room = await Room.create({ roomId: roomId, users: [username], messages: [] });
        console.log("Tạo phòng mới:", room);
        client.emit("loadMessages", {messages: room.messages, users: room.users})
      } catch (err) {
        console.error("Lỗi khi tạo phòng:", err);
      }
    } else {
      client.emit("loadMessages", {messages: room.messages, users: room.users})
      if (!room.users.includes(username)) {
        room.users.push(username); // Thêm username vào danh sách người dùng
        await room.save(); // Lưu lại sự thay đổi
        console.log(`Thêm ${username} vào danh sách người dùng trong phòng ${roomId}`);
        io.to(roomId).emit("updateUserList", username);
      } else {
        console.log(`${username} đã ở trong phòng ${roomId}`);
      }

      room.messages.forEach(element => {
        console.log(element.username, element.content, element.time)
      })
    }
  })
  //khi gửi tin
  client.on("message", async function(data){ //data là dữ liệu hay tin nhắn
    //khi gửi tin nhắn thì sẽ chuyển lên server và server sẽ chuyển tới room
    const {username, content, roomId, time} = data
    console.log(`${username} : ${content} + ${roomId}`)

    let id = roomId
    let room = await Room.findOne({roomId : id})
    room.messages.push({username: username, content: content, time: time})
    await room.save();
    io.to(roomId).emit("thread", {username, content, time})
  })

  client.on("disconnect", async function(data) {
    //đăng nhập lưu vào session lấy ra xài
    let updatedRoom = await Room.findOne({ roomId: id });
    if (updatedRoom) {
      io.to(id).emit("removeUserList", session_username); // Cập nhật danh sách user
      updatedRoom.users = updatedRoom.users.filter(user => user !== session_username);

      if (updatedRoom.users.length === 0) {
        await Room.deleteOne({ roomId: id });
        console.log(`Room ${id} đã bị xóa vì không còn người dùng nào.`);
    } else {
        await updatedRoom.save(); // Lưu lại sự thay đổi
    }
    }
    else{
      console.log("không tồn tại phòng")
    }
  })
})


app.get("/", (req, res) => {
  req.session.username = req.body.username
  res.render("login.ejs")
})

app.get("/chat", (req, res) => {
  const userName = req.query.name
  const roomId = req.query.room
  console.log(req.session.username)
  // req.session.name = userName
  // name =  req.session.name
  res.render("chat.ejs", {userName, roomId})
})


connectToDB().then(() => {
  server.listen(port, () => {
    console.log('Server is running on http://localhost:' + port);
  });
});

