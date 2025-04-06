import api from "../api/axios";

const SocialService = {
  /**
   * Get social feed posts
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of posts per page
   * @returns {Promise} - API response
   */
  getFeedPosts: async (page = 1, limit = 10) => {
    return api.get(`/api/posts?page=${page}&limit=${limit}`);
  },

  /**
   * Get posts by user
   * @param {string} userId - User ID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of posts per page
   * @returns {Promise} - API response
   */
  getUserPosts: async (userId, page = 1, limit = 10) => {
    return api.get(`/api/posts/user/${userId}?page=${page}&limit=${limit}`);
  },

  /**
   * Get posts by location
   * @param {string} locationId - Location ID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of posts per page
   * @returns {Promise} - API response
   */
  getLocationPosts: async (locationId, page = 1, limit = 10) => {
    return api.get(
      `/api/posts/location/${locationId}?page=${page}&limit=${limit}`
    );
  },

  /**
   * Get post by ID
   * @param {string} postId - Post ID
   * @returns {Promise} - API response
   */
  getPostById: async (postId) => {
    return api.get(`/api/posts/${postId}`);
  },

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Promise} - API response
   */
  createPost: async (postData) => {
    return api.post("/api/posts", postData);
  },

  /**
   * Upload post images
   * @param {string} postId - Post ID
   * @param {FormData} formData - Form data with images
   * @returns {Promise} - API response
   */
  uploadPostImages: async (postId, formData) => {
    return api.post(`/api/posts/${postId}/photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {Promise} - API response
   */
  deletePost: async (postId) => {
    return api.delete(`/api/posts/${postId}`);
  },

  /**
   * Like a post
   * @param {string} postId - Post ID
   * @returns {Promise} - API response
   */
  likePost: async (postId) => {
    return api.post(`/api/posts/${postId}/like`);
  },

  /**
   * Unlike a post
   * @param {string} postId - Post ID
   * @returns {Promise} - API response
   */
  unlikePost: async (postId) => {
    return api.delete(`/api/posts/${postId}/like`);
  },

  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of comments per page
   * @returns {Promise} - API response
   */
  getPostComments: async (postId, page = 1, limit = 20) => {
    return api.get(`/api/posts/${postId}/comments?page=${page}&limit=${limit}`);
  },

  /**
   * Add a comment to a post
   * @param {string} postId - Post ID
   * @param {string} content - Comment content
   * @returns {Promise} - API response
   */
  addComment: async (postId, content) => {
    return api.post(`/api/posts/${postId}/comments`, { content });
  },

  /**
   * Delete a comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @returns {Promise} - API response
   */
  deleteComment: async (postId, commentId) => {
    return api.delete(`/api/posts/${postId}/comments/${commentId}`);
  },

  /**
   * Get trending posts
   * @param {number} limit - Number of posts to retrieve
   * @returns {Promise} - API response
   */
  getTrendingPosts: async (limit = 10) => {
    return api.get(`/api/posts/trending?limit=${limit}`);
  },

  /**
   * Get posts with a specific hashtag
   * @param {string} hashtag - Hashtag to search for
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of posts per page
   * @returns {Promise} - API response
   */
  getPostsByHashtag: async (hashtag, page = 1, limit = 10) => {
    return api.get(`/api/posts/hashtag/${hashtag}?page=${page}&limit=${limit}`);
  },
};

export default SocialService;
