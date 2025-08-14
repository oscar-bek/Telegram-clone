const io = require("socket.io")(5000, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});



let users = []; // {user, socketId}
let activeCalls = new Map(); // {callId: {caller, receiver, type, status}}

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

const generateCallId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  
  // Add user to online users list
  socket.on("addOnlineUser", (user) => {
    console.log("👤 Adding online user:", { userId: user._id, socketId: socket.id });
    addOnlineUser(user, socket.id);
    io.emit("getOnlineUsers", users);
    console.log("📊 Total online users:", users.length);
  });

  socket.on("addOnlineUser", (user) => {
    addOnlineUser(user, socket.id);
    io.emit("getOnlineUsers", users);
  });

  // Call functionality with WebRTC
  socket.on("callRequest", ({ caller, receiver, callType }) => {
    console.log("📞 Call request received:", { 
      callerId: caller._id, 
      receiverId: receiver._id, 
      callType,
      timestamp: new Date().toISOString()
    });
    
    const receiverSocketId = getSocketId(receiver._id);
    const callId = generateCallId();
    
    console.log("🔍 Receiver lookup:", { 
      receiverId: receiver._id, 
      receiverSocketId, 
      onlineUsers: users.map(u => ({ id: u.user._id, socketId: u.socketId }))
    });
    
    if (receiverSocketId) {
      // Store call information
      activeCalls.set(callId, {
        caller,
        receiver,
        type: callType, // 'audio' or 'video'
        status: 'ringing',
        startTime: new Date()
      });
      
      console.log("✅ Call stored:", { callId, callType, status: 'ringing' });
      
      // Send call request to receiver
      socket.to(receiverSocketId).emit("incomingCall", {
        callId,
        caller,
        callType,
        timestamp: new Date()
      });
      
      console.log("📤 Call request sent to receiver:", receiverSocketId);
      
      // Confirm call request sent to caller
      socket.emit("callRequestSent", { callId, receiver });
      
    } else {
      console.log("❌ Receiver offline:", receiver._id);
      // User is offline
      socket.emit("callFailed", { 
        message: "User is offline",
        receiver,
        callType
      });
    }
  });

  socket.on("callAccepted", ({ callId, receiver }) => {
    console.log("📞 Call accepted event received:", { callId, receiverId: receiver._id });
    
    const call = activeCalls.get(callId);
    if (call && call.receiver._id === receiver._id) {
      console.log("✅ Found call:", { 
        callId, 
        type: call.type, 
        status: call.status,
        callerId: call.caller._id,
        receiverId: call.receiver._id
      });
      
      const callerSocketId = getSocketId(call.caller._id);
      const receiverSocketId = getSocketId(call.receiver._id);
      
      console.log("🔌 Socket IDs:", { 
        callerSocketId: callerSocketId?.substring(0, 8) + "...", 
        receiverSocketId: receiverSocketId?.substring(0, 8) + "...", 
        currentSocket: socket.id.substring(0, 8) + "..."
      });
      
      if (callerSocketId && receiverSocketId) {
              // Update call status
      call.status = 'connected';
      call.acceptedAt = new Date();
        
        console.log("✅ Call status updated to connected");
        
        // Notify caller that call was accepted
        socket.to(callerSocketId).emit("callAccepted", { 
          callId, 
          receiver
        });
        console.log("📤 callAccepted sent to caller");
        
        // Send call started event to both parties
        socket.to(callerSocketId).emit("callStarted", { 
          callId, 
          call
        });
        socket.emit("callStarted", { 
          callId, 
          call
        });
        console.log("🚀 callStarted sent to both parties");
        
        // Now the caller should send their offer to the receiver (for WebRTC)
        // The receiver will create an answer and send it back
      } else {
        console.log("❌ Socket IDs not found:", { 
          callerSocketId: !!callerSocketId, 
          receiverSocketId: !!receiverSocketId 
        });
      }
    } else {
      console.log("❌ Call not found or receiver mismatch:", { 
        callId, 
        receiverId: receiver._id, 
        activeCalls: Array.from(activeCalls.keys()) 
      });
    }
  });

  socket.on("callRejected", ({ callId, receiver, reason }) => {
    console.log("Call rejected:", { callId, receiverId: receiver._id, reason });
    
    const call = activeCalls.get(callId);
    if (call && call.receiver._id === receiver._id) {
      const callerSocketId = getSocketId(call.caller._id);
      
      if (callerSocketId) {
        // Remove call from active calls
        activeCalls.delete(callId);
        
        // Notify caller that call was rejected
        socket.to(callerSocketId).emit("callRejected", { callId, receiver, reason });
        console.log("Call rejected notification sent to caller");
      }
    } else {
      console.log("Call not found for rejection:", { callId, receiverId: receiver._id });
    }
  });

  socket.on("callEnded", () => {
    console.log("📞 Call ended by user:", socket.id);
    
    // Find all calls involving this user
    for (const [callId, call] of activeCalls.entries()) {
      if (call.caller._id === socket.id || call.receiver._id === socket.id) {
        const otherUserId = call.caller._id === socket.id ? call.receiver._id : call.caller._id;
        const otherUserSocketId = getSocketId(otherUserId);
        
        if (otherUserSocketId) {
          socket.to(otherUserSocketId).emit("callEnded", { 
            callId, 
            reason: "Call ended by other user"
          });
        }
        
        activeCalls.delete(callId);
        break;
      }
    }
  });

  // WebRTC signaling
  socket.on("offer", ({ callId, offer, targetUserId }) => {
    console.log("📤 Offer received:", { callId, targetUserId, offerType: offer?.type });
    
    const targetSocketId = getSocketId(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("offer", { callId, offer, fromUserId: socket.id });
      console.log("✅ Offer forwarded to target user");
    } else {
      console.log("❌ Target user not found for offer");
    }
  });

  socket.on("answer", ({ callId, answer, targetUserId }) => {
    console.log("📤 Answer received:", { callId, targetUserId, answerType: answer?.type });
    
    const targetSocketId = getSocketId(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("answer", { callId, answer, fromUserId: socket.id });
      console.log("✅ Answer forwarded to target user");
    } else {
      console.log("❌ Target user not found for answer");
    }
  });

  socket.on("iceCandidate", ({ callId, candidate, targetUserId }) => {
    console.log("🧊 ICE candidate received:", { callId, targetUserId, candidateType: candidate?.type });
    
    const targetSocketId = getSocketId(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("iceCandidate", { callId, candidate, fromUserId: socket.id });
      console.log("✅ ICE candidate forwarded to target user");
    } else {
      console.log("❌ Target user not found for ICE candidate");
    }
  });

  // Send offer when call is accepted
  socket.on("sendOffer", ({ callId, offer, targetUserId }) => {
    console.log("📤 SendOffer event received:", { 
      callId, 
      targetUserId, 
      offerType: offer?.type,
      timestamp: new Date().toISOString()
    });
    
    const targetSocketId = getSocketId(targetUserId);
    console.log("🎯 Target socket ID:", targetSocketId?.substring(0, 8) + "...");
    
    if (targetSocketId) {
      socket.to(targetSocketId).emit("offer", { callId, offer, fromUserId: socket.id });
      console.log("✅ Offer sent to target user");
    } else {
      console.log("❌ Target user not found or offline:", targetUserId);
    }
  });



  // Call mute/unmute and video on/off
  socket.on("callStateChanged", ({ callId, userId, audioEnabled, videoEnabled }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const otherUserId = call.caller._id === userId ? call.caller._id : call.receiver._id;
      const otherUserSocketId = getSocketId(otherUserId);
      
      if (otherUserSocketId) {
        socket.to(otherUserSocketId).emit("callStateChanged", {
          callId,
          userId,
          audioEnabled,
          videoEnabled
        });
      }
    }
  });

  // Existing message functionality
 socket.on('createContact', ({ currentUser, receiver }) => {
		const receiverSocketId = getSocketId(receiver._id)
		if (receiverSocketId) {
			socket.to(receiverSocketId).emit('getCreatedUser', currentUser)
		}
	})

	socket.on('sendMessage', ({ newMessage, receiver, sender }) => {
		const receiverSocketId = getSocketId(receiver._id)
		if (receiverSocketId) {
			socket.to(receiverSocketId).emit('getNewMessage', { newMessage, sender, receiver })
		}
	})

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
    
    // Find the user who disconnected
    const disconnectedUser = users.find(u => u.socketId === socket.id);
    
    if (disconnectedUser) {
      console.log("Disconnected user:", disconnectedUser.user._id);
      
      // End any active calls for this user
      for (const [callId, call] of activeCalls.entries()) {
        if (call.caller._id === disconnectedUser.user._id || call.receiver._id === disconnectedUser.user._id) {
          console.log("Ending call due to user disconnect:", callId);
          

          
          const otherUserId = call.caller._id === disconnectedUser.user._id ? call.receiver._id : call.caller._id;
          const otherUserSocketId = getSocketId(otherUserId);
          
          if (otherUserSocketId) {
            socket.to(otherUserSocketId).emit("callEnded", { 
              callId, 
              userId: disconnectedUser.user._id,
              reason: "User disconnected"
            });
          }
          
          activeCalls.delete(callId);
        }
      }
    }
    
    users = users.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", users);
  });
});
