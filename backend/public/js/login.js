const btn_join = document.getElementById('btn-join');

// // Kết nối socket.io
// let socket = io.connect();


// Bắt sự kiện khi nút Join được nhấn
btn_join.addEventListener("click", () => {
  // Lấy giá trị từ input sau khi người dùng nhập
  const name = document.getElementById('name').value;
  const room = document.getElementById('room').value;

  // Kiểm tra xem người dùng đã nhập đầy đủ thông tin hay chưa
  if (name.trim() && room.trim()) {
    // Gửi thông tin room và name lên server
    window.location.href = `chat?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}`;
    
    // Chuyển hướng đến trang chat với query string
  } else {
    alert("Vui lòng nhập tên và phòng!");
  }
});