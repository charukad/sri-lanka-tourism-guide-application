import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { posts, comments } from "../../data/posts";

// In a real app, these would be API calls to your backend
export const fetchPosts = createAsyncThunk(
  "social/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return posts;
    } catch (error) {
      return rejectWithValue("Failed to fetch posts");
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "social/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const post = posts.find((p) => p.id === postId);

      if (!post) {
        throw new Error("Post not found");
      }

      return post;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCommentsByPostId = createAsyncThunk(
  "social/fetchCommentsByPostId",
  async (postId, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return comments.filter((c) => c.postId === postId);
    } catch (error) {
      return rejectWithValue("Failed to fetch comments");
    }
  }
);

// Slice for social feed management
const socialSlice = createSlice({
  name: "social",
  initialState: {
    posts: [],
    currentPost: null,
    comments: [],
    loading: false,
    error: null,
    userPosts: [], // Posts made by the current user
  },
  reducers: {
    likePost: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find((p) => p.id === postId);

      if (post) {
        post.likes += 1;
      }

      if (state.currentPost && state.currentPost.id === postId) {
        state.currentPost.likes += 1;
      }
    },
    unlikePost: (state, action) => {
      const { postId } = action.payload;
      const post = state.posts.find((p) => p.id === postId);

      if (post && post.likes > 0) {
        post.likes -= 1;
      }

      if (
        state.currentPost &&
        state.currentPost.id === postId &&
        state.currentPost.likes > 0
      ) {
        state.currentPost.likes -= 1;
      }
    },
    addComment: (state, action) => {
      const { postId, userId, userName, userAvatar, content } = action.payload;

      const newComment = {
        id: "c" + Date.now(),
        postId,
        userId,
        userName,
        userAvatar,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      state.comments.push(newComment);

      // Update comment count on the post
      const post = state.posts.find((p) => p.id === postId);
      if (post) {
        post.comments += 1;
      }

      if (state.currentPost && state.currentPost.id === postId) {
        state.currentPost.comments += 1;
      }
    },
    likeComment: (state, action) => {
      const { commentId } = action.payload;
      const comment = state.comments.find((c) => c.id === commentId);

      if (comment) {
        comment.likes += 1;
      }
    },
    createPost: (state, action) => {
      const { userId, userName, userAvatar, content, images, location, tags } =
        action.payload;

      const newPost = {
        id: "p" + Date.now(),
        userId,
        userName,
        userAvatar,
        content,
        images,
        location,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        tags,
      };

      state.posts.unshift(newPost); // Add to beginning of array
      state.userPosts.unshift(newPost);
    },
    deletePost: (state, action) => {
      const { postId } = action.payload;

      state.posts = state.posts.filter((p) => p.id !== postId);
      state.userPosts = state.userPosts.filter((p) => p.id !== postId);

      if (state.currentPost && state.currentPost.id === postId) {
        state.currentPost = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all posts
    builder.addCase(fetchPosts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload;
      // Simulate user posts (in a real app, this would come from the API)
      state.userPosts = action.payload.filter((p) => p.userId === "u1");
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch post by ID
    builder.addCase(fetchPostById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPostById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentPost = action.payload;
    });
    builder.addCase(fetchPostById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch comments by post ID
    builder.addCase(fetchCommentsByPostId.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = action.payload;
    });
    builder.addCase(fetchCommentsByPostId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const {
  likePost,
  unlikePost,
  addComment,
  likeComment,
  createPost,
  deletePost,
} = socialSlice.actions;

export default socialSlice.reducer;
