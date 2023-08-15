const socketio = require("socket.io");

const create_socket = async (server) => {
  const io = socketio(server, {
    cors: {
      origin: "*",
    },
  });
  global.io = io;

  io.on("connection", (socket) => {
    let handshake = socket.handshake;
    console.log(socket.connected + "connected");

    if (!!handshake.query.user_id) {
      console.log("user_id typeof", typeof handshake.query.user_id);
      var joined = socket.join(handshake.query.user_id);
      console.log("joined", joined);
      console.log(
        socket.handshake.headers.origin +
          "   " +
          handshake.query.user_id +
          "   user_id   connected  Role: " +
          handshake.query.role
      );

      if (handshake.query.role == "admin") {
        console.log("admin connected");

        // vcreate  a room for admin
        socket.join("admin_room");
      }
    }
  });
};

module.exports = {
  create_socket,
};
