// notificationSystem.js
const Server = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const io = Server();
const users = {};

var Socket = {
  emit: function (event, data, userId) {
    // console.log(event, data);
    // io.sockets.emit(event, data);
    const id = getSocketIdByUser({ user: userId });
    // console.log(data)
    io.to(id).emit(event, data);
  },
  broadcastDoctors: function (event, data) {
    const doctors = getDoctorsFromMap();
    const ids = doctors.map((object) => object.socketId);
    // console.log(ids);
    io.to(ids).emit(event, data);
  },
  broadcastAdmins: function (event, data) {
    const admins = getAdminsFromMap();
    const ids = admins.map((object) => object.socketId);
    // console.log(ids);
    io.to(ids).emit(event, data);
  },
};
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      console.log("No token found in cookies");
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    users[socket.id] = {
      user: decoded.id,
      socketId: socket.id,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    next(new Error("Authentication failed"));
  }
});
io.on("connection", function (socket) {
  console.log("a user " + JSON.stringify(users[socket.id]) + " connected");
  socket.on("disconnect", async () => {
    console.log("user with socket id " + socket.id + " disconnected");
    // remove saved socket from users object
    delete users[socket.id];
  });
});

function getSocketIdByUser(value) {
  const socketIds = Object.values(users)
    .filter((user) => user.user === value.user.toString())
    .map((e) => e.socketId);

  return socketIds;
}

const SocketEvents = {
  TICKET_OPENED: "TICKET_OPENED",
  TICKET_CLOSED: "TICKET_CLOSED",
  TICKET_ACTIVATED: "TICKET_ACTIVATED",
  NEW_MESSAGE: "NEW_MESSAGE",
  DOCTOR_ONLINE: "DOCTOR_ONLINE",
  REACTIVATED_TICKET: "REACTIVATED_TICKET",
  TICKET_FORWARDED: "TICKET_FORWARDED",
};

module.exports = {
  io,
  Socket,
  SocketEvents,
};
