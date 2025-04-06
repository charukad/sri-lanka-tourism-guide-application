const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const mongoose = require("mongoose");

module.exports = (io, socket) => {
  /**
   * Handle new message
   */
  socket.on("send-message", async (data, callback) => {
    try {
      const { recipientId, content } = data;

      if (!recipientId || !content) {
        return callback({
          success: false,
          message: "Recipient ID and content are required",
        });
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: {
          $all: [
            mongoose.Types.ObjectId(socket.user.id),
            mongoose.Types.ObjectId(recipientId),
          ],
        },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [socket.user.id, recipientId],
          last_message: content,
          last_message_time: new Date(),
        });

        await conversation.save();
      } else {
        // Update last message
        conversation.last_message = content;
        conversation.last_message_time = new Date();
        await conversation.save();
      }

      // Create message
      const message = new Message({
        conversation: conversation._id,
        sender: socket.user.id,
        recipient: recipientId,
        content,
        timestamp: new Date(),
      });

      await message.save();

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username profile_pic")
        .populate("recipient", "username profile_pic");

      // Send to recipient if online
      io.to(`user-${recipientId}`).emit("receive-message", populatedMessage);

      // Send success response
      callback({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      console.error("Send message error:", error.message);
      callback({
        success: false,
        message: "Failed to send message",
      });
    }
  });

  /**
   * Handle message read status update
   */
  socket.on("mark-as-read", async (data, callback) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return callback({
          success: false,
          message: "Conversation ID is required",
        });
      }

      // Mark messages as read
      await Message.updateMany(
        {
          conversation: conversationId,
          recipient: socket.user.id,
          read: false,
        },
        {
          $set: { read: true, read_at: new Date() },
        }
      );

      // Notify the original sender that messages are read
      const conversation = await Conversation.findById(conversationId);
      const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== socket.user.id.toString()
      );

      io.to(`user-${otherParticipant}`).emit("messages-read", {
        conversationId,
        readBy: socket.user.id,
      });

      callback({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      console.error("Mark as read error:", error.message);
      callback({
        success: false,
        message: "Failed to mark messages as read",
      });
    }
  });

  /**
   * Handle typing status
   */
  socket.on("typing", (data) => {
    const { recipientId, isTyping } = data;

    if (!recipientId) {
      return;
    }

    // Emit typing status to recipient
    io.to(`user-${recipientId}`).emit("user-typing", {
      userId: socket.user.id,
      isTyping,
    });
  });

  /**
   * Get conversations for current user
   */
  socket.on("get-conversations", async (data, callback) => {
    try {
      const conversations = await Conversation.find({
        participants: socket.user.id,
      })
        .populate("participants", "username profile_pic")
        .sort({ last_message_time: -1 });

      // Count unread messages for each conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conversation) => {
          const unreadCount = await Message.countDocuments({
            conversation: conversation._id,
            recipient: socket.user.id,
            read: false,
          });

          return {
            ...conversation.toObject(),
            unread_count: unreadCount,
          };
        })
      );

      callback({
        success: true,
        conversations: conversationsWithUnread,
      });
    } catch (error) {
      console.error("Get conversations error:", error.message);
      callback({
        success: false,
        message: "Failed to get conversations",
      });
    }
  });

  /**
   * Get messages for a conversation
   */
  socket.on("get-messages", async (data, callback) => {
    try {
      const { conversationId, page = 1, limit = 20 } = data;

      if (!conversationId) {
        return callback({
          success: false,
          message: "Conversation ID is required",
        });
      }

      // Check if user is part of this conversation
      const conversation = await Conversation.findById(conversationId);

      if (
        !conversation ||
        !conversation.participants.includes(socket.user.id)
      ) {
        return callback({
          success: false,
          message: "Conversation not found or access denied",
        });
      }

      // Get messages with pagination
      const skip = (page - 1) * limit;

      const messages = await Message.find({ conversation: conversationId })
        .populate("sender", "username profile_pic")
        .populate("recipient", "username profile_pic")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const totalMessages = await Message.countDocuments({
        conversation: conversationId,
      });

      callback({
        success: true,
        messages: messages.reverse(),
        total: totalMessages,
        page,
        totalPages: Math.ceil(totalMessages / limit),
      });

      // Mark messages as read if the user is the recipient
      await Message.updateMany(
        {
          conversation: conversationId,
          recipient: socket.user.id,
          read: false,
        },
        {
          $set: { read: true, read_at: new Date() },
        }
      );

      // Notify the other participant that messages are read
      const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== socket.user.id.toString()
      );

      io.to(`user-${otherParticipant}`).emit("messages-read", {
        conversationId,
        readBy: socket.user.id,
      });
    } catch (error) {
      console.error("Get messages error:", error.message);
      callback({
        success: false,
        message: "Failed to get messages",
      });
    }
  });
};
