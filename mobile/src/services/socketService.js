import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/api";

let socket = null;

/**
 * Initialize socket connection
 * @returns {Promise<Object>} - Socket instance
 */
const initializeSocket = async () => {
  try {
    if (socket && socket.connected) {
      return socket;
    }

    // Get authentication token
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    // Connect to socket server
    socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Handle connection events
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return socket;
  } catch (error) {
    console.error("Socket initialization error:", error.message);
    throw error;
  }
};

/**
 * Get current socket instance or initialize a new one
 * @returns {Promise<Object>} - Socket instance
 */
const getSocket = async () => {
  if (!socket || !socket.connected) {
    return await initializeSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected");
  }
};

/**
 * Send a message
 * @param {string} recipientId - Recipient user ID
 * @param {string} content - Message content
 * @returns {Promise<Object>} - Message response
 */
const sendMessage = async (recipientId, content) => {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = await getSocket();

      socket.emit("send-message", { recipientId, content }, (response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.message));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get conversations for current user
 * @returns {Promise<Array>} - List of conversations
 */
const getConversations = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = await getSocket();

      socket.emit("get-conversations", {}, (response) => {
        if (response.success) {
          resolve(response.conversations);
        } else {
          reject(new Error(response.message));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of messages per page
 * @returns {Promise<Object>} - Messages with pagination info
 */
const getMessages = async (conversationId, page = 1, limit = 20) => {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = await getSocket();

      socket.emit(
        "get-messages",
        { conversationId, page, limit },
        (response) => {
          if (response.success) {
            resolve({
              messages: response.messages,
              total: response.total,
              page: response.page,
              totalPages: response.totalPages,
            });
          } else {
            reject(new Error(response.message));
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Mark messages in a conversation as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} - Success status
 */
const markMessagesAsRead = async (conversationId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const socket = await getSocket();

      socket.emit("mark-as-read", { conversationId }, (response) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.message));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Set typing status
 * @param {string} recipientId - Recipient user ID
 * @param {boolean} isTyping - Whether user is typing
 */
const setTypingStatus = async (recipientId, isTyping) => {
  try {
    const socket = await getSocket();
    socket.emit("typing", { recipientId, isTyping });
  } catch (error) {
    console.error("Set typing status error:", error.message);
  }
};

/**
 * Register event listener
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 */
const on = async (event, callback) => {
  try {
    const socket = await getSocket();
    socket.on(event, callback);
  } catch (error) {
    console.error(`Register listener (${event}) error:`, error.message);
  }
};

/**
 * Remove event listener
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 */
const off = async (event, callback) => {
  try {
    const socket = await getSocket();
    socket.off(event, callback);
  } catch (error) {
    console.error(`Remove listener (${event}) error:`, error.message);
  }
};

const SocketService = {
  initializeSocket,
  getSocket,
  disconnectSocket,
  sendMessage,
  getConversations,
  getMessages,
  markMessagesAsRead,
  setTypingStatus,
  on,
  off,
};

export default SocketService;
