const ip_message = document.getElementById('message')
const btn_send = document.getElementById('btn-send')
const ul_message = document.getElementById('ul-message')
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('name');
const roomId = urlParams.get('room');
let socket = io.connect()

socket.on("connect", function(data) {
  socket.emit("join", { roomId, username });
})


ip_message.addEventListener("keydown", () => {
  
  if (event.key === "Enter") {
    const content = ip_message.value
    const now = new Date();
    const time = formatTime(now);
    if(message) {
      socket.emit("message", {username, content, roomId, time})       
      ip_message.value = ''
    }
    else {
      console.log("tin nhắn trống")
    }
  }
})

function createSentMessage(data) {
  // Tạo phần tử div với class 'col-message-sent'
  const colMessageSent = document.createElement('div');
  colMessageSent.classList.add('col-message-sent');
  
  // Tạo phần tử div với class 'message-sent'
  const messageSent = document.createElement('div');
  messageSent.classList.add('message-sent');
  
  // Tạo phần tử p và thêm nội dung văn bản
  const messageText = document.createElement('p');
  messageText.textContent = data.content;
  
  // Thêm phần tử p vào trong 'message-sent'
  messageSent.appendChild(messageText);
  
  // Thêm 'message-sent' vào trong 'col-message-sent'
  colMessageSent.appendChild(messageSent);
  
  // Thêm phần tử 'col-message-sent' vào một phần tử cha hiện có trong DOM (ví dụ '.grid-message')
  document.querySelector('.grid-message').appendChild(colMessageSent);
  
  // Sau khi thêm vào DOM, tính toán và đặt chiều cao của 'col-message-sent'
  const messageSentHeight = messageSent.offsetHeight;  // Lấy chiều cao của 'message-sent'
  colMessageSent.style.height = (messageSentHeight + 5) + 'px';  // Thêm 10px và đặt chiều cao
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Chuyển đổi giờ 24 sang giờ 12
  hours = hours % 12; 
  hours = hours ? hours : 12; // Nếu hours là 0 thì hiển thị là 12

  // Định dạng phút
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
}

function createReceivedMessage(data) {
// Tạo phần tử div với class 'col-message-received'
const colMessageReceived = document.createElement('div');
colMessageReceived.classList.add('col-message-received');

// Lấy thời gian hiện tại
const now = new Date();
const formattedTime = formatTime(now);

// Tạo phần tử p cho tên người gửi và thời gian
const senderTime = document.createElement('p');
senderTime.textContent = `${data.username} ${data.time}`; // Thay data.senderName bằng tên người gửi

// Tạo phần tử div với class 'message-received'
const messageReceived = document.createElement('div');
messageReceived.classList.add('message-received');

// Tạo phần tử p và thêm nội dung văn bản
const messageText = document.createElement('p');
messageText.textContent = data.content;

// Thêm phần tử p cho tên và thời gian vào 'col-message-received'
colMessageReceived.appendChild(senderTime);
// Thêm phần tử p vào trong 'message-received'
messageReceived.appendChild(messageText);

// Thêm 'message-received' vào trong 'col-message-received'
colMessageReceived.appendChild(messageReceived);

// Thêm phần tử 'col-message-received' vào một phần tử cha hiện có trong DOM (ví dụ '.grid-message')
document.querySelector('.grid-message').appendChild(colMessageReceived);

// Sau khi thêm vào DOM, tính toán và đặt chiều cao của 'col-message-received'
const messageReceivedHeight = messageReceived.offsetHeight;  // Lấy chiều cao của 'message-received'
colMessageReceived.style.height = (messageReceivedHeight + 25) + 'px';  // Thêm 10px và đặt chiều cao
}

socket.on("thread", function(data){
  if(data.username === username) {
    createSentMessage(data)
  }
  else {
    createReceivedMessage(data)
  }
})

socket.on("loadMessages", function(data) {
  const {messages, users} = data
  messages.forEach((element) => {
    if (element.username === username) {
      createSentMessage(element); // Hàm để hiển thị tin nhắn gửi đi
    } else {
      createReceivedMessage(element); // Hàm để hiển thị tin nhắn nhận
    }
  });
  
  users.forEach((element) => {
    createListUsersInRoom(element)
  })
})

socket.on("updateUserList", function(data) {
  createListUsersInRoom(data)
})

socket.on("removeUserList", function(data) {
  removeUserFromList(data)
})


// Hàm để hiển thị tin nhắn
function createMessage(username, content, time) {
  // const messageElement = document.createElement("div");
  // messageElement.classList.add("message");

  // const timeString = new Date(timestamp).toLocaleTimeString(); // Chuyển đổi timestamp sang thời gian
  // messageElement.innerHTML = `<strong>${username}:</strong> ${content} <span class="time">${timeString}</span>`;
  
  // document.getElementById("messages").appendChild(messageElement); // Thêm vào danh sách tin nhắn
    console.log(username, content, time)

}

function removeUserFromList(username) {
  const userElement = document.getElementById(username);
  if (userElement) {
      userElement.remove(); // Xóa phần tử nếu nó tồn tại
  }
}


function createListUsersInRoom(data) {
    // Tạo một phần tử li
  const li = document.createElement('li');
  li.setAttribute('id', data); // Đặt id duy nhất cho li (ví dụ: "user-username")

  // Tạo phần tử div cho avatar
  const avatarDiv = document.createElement('div');
  avatarDiv.classList.add('avatar');

  // Tạo phần tử div cho hình ảnh avatar
  const avatarImageDiv = document.createElement('div');
  avatarImageDiv.classList.add('avatar-image');

  // Tạo phần tử div cho trạng thái
  const statusDiv = document.createElement('div');
  statusDiv.classList.add('status', 'online');

  // Tạo phần tử img cho avatar
  const avatarImg = document.createElement('img');
  avatarImg.src = `./img/avatar-${Math.floor(Math.random() * 5) + 1}.png`; // Đường dẫn tới ảnh avatar

  // Thêm phần tử trạng thái và ảnh vào avatarImageDiv
  avatarImageDiv.appendChild(statusDiv);
  avatarImageDiv.appendChild(avatarImg);

  // Thêm avatarImageDiv vào avatarDiv
  avatarDiv.appendChild(avatarImageDiv);

  // Tạo phần tử h3 cho tên
  const h3 = document.createElement('h3');
  h3.textContent = data; // Tên người dùng

  // Tạo phần tử p cho trạng thái
  const p = document.createElement('p');
  p.textContent = 'Đang Online'; // Trạng thái người dùng

  // Thêm tất cả các phần tử vào li
  li.appendChild(avatarDiv);
  li.appendChild(h3);
  li.appendChild(p);

  // Giả sử bạn muốn thêm li vào một ul có id là 'userList'
  const userList = document.getElementById('userList');
  userList.appendChild(li);
}