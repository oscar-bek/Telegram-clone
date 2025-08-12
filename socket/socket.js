const io = require("socket.io")(5000, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let users = []; // {user, socketId}

const addOnlineUser = (user, socketId) => {
  const checkUser = users.find((u) => u.user._id === user._id);
  if (!checkUser) {
    users.push({ user, socketId });
    // Qo'shilganidan keyin tekshirish
    const justAdded = users.find((u) => u.user._id === user._id);
  } else {
    // Socket ID ni yangilash (agar user reconnect qilsa)
    checkUser.socketId = socketId;
  }

  users.forEach((u, index) => {
    console.log(`${index + 1}.`, {
      id: u.user._id,
      email: u.user.email || "email yo'q",
      socketId: u.socketId.substring(0, 8) + "...",
    });
  });
};

const getSocketId = (userId) => {
  const user1 = users.find((u) => u.user._id === userId);
  const user2 = users.find((u) => String(u.user._id) === String(userId));
  const user3 = users.find((u) => u.user._id.toString() === userId.toString());

  const foundUser = user1 || user2 || user3;
  return foundUser ? foundUser.socketId : null;
};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("addOnlineUser", (user) => {
    addOnlineUser(user, socket.id);
    io.emit("getOnlineUsers", users);
  });

  socket.on("createContact", ({ currentUser, receiver }) => {
    const receiverSocketId = getSocketId(receiver._id);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("getCreatedUser", currentUser);
    }
  });

  socket.on("sendMessage", ({ newMessage, receiver, sender }) => {
    const receiverSocketId = getSocketId(receiver._id);
    if (receiverSocketId) {
      socket
        .to(receiverSocketId)
        .emit("getNewMessage", { newMessage, sender, receiver });
    }
  });

  socket.on("readMessages", ({ receiver, messages }) => {
    console.log("=== readMessages socket keldi ===");
    console.log("Receiver (aslida sender):", receiver._id);
    console.log("Messages soni:", messages.length);

    const receiverSocketId = getSocketId(receiver._id);
    console.log("Receiver socket ID:", receiverSocketId);

    if (receiverSocketId) {
      console.log("Socket orqali getReadMessages yuborish...");
      socket.to(receiverSocketId).emit("getReadMessages", messages);
      console.log("getReadMessages yuborildi!");
    } else {
      console.log("Receiver offline");
    }
  });

  socket.on("updateMessage", ({ updatedMessage, receiver, sender }) => {
    const receiverSocketId = getSocketId(receiver._id);
    if (receiverSocketId) {
      socket
        .to(receiverSocketId)
        .emit("getUpdatedMessage", { updatedMessage, sender, receiver });
    }
  });

  socket.on(
    "deleteMessage",
    ({ deletedMessage, filteredMessages, sender, receiver }) => {
      const receiverSocketId = getSocketId(receiver._id);
      if (receiverSocketId) {
        socket
          .to(receiverSocketId)
          .emit("getDeletedMessage", {
            deletedMessage,
            sender,
            filteredMessages,
          });
      }
    }
  );

  socket.on('typing', ({ receiver, sender, message }) => {
		const receiverSocketId = getSocketId(receiver._id)
		if (receiverSocketId) {
			socket.to(receiverSocketId).emit('getTyping', { sender, message })
		}
	})

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    users = users.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", users);
  });
});
