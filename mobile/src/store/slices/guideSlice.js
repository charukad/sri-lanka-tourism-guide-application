import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { guides } from "../../data/guides";

// In a real app, these would be API calls to your backend
export const fetchGuides = createAsyncThunk(
  "guides/fetchGuides",
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return guides;
    } catch (error) {
      return rejectWithValue("Failed to fetch guides");
    }
  }
);

export const fetchGuideById = createAsyncThunk(
  "guides/fetchGuideById",
  async (guideId, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const guide = guides.find((g) => g.id === guideId);

      if (!guide) {
        throw new Error("Guide not found");
      }

      return guide;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice for guide booking management
const guideSlice = createSlice({
  name: "guides",
  initialState: {
    guides: [],
    currentGuide: null,
    filteredGuides: [],
    loading: false,
    error: null,
    bookings: [], // User's guide bookings
  },
  reducers: {
    filterGuides: (state, action) => {
      const { expertise, area, language } = action.payload;

      let filtered = state.guides;

      if (expertise && expertise !== "all") {
        filtered = filtered.filter((guide) =>
          guide.expertise.includes(expertise)
        );
      }

      if (area && area !== "all") {
        filtered = filtered.filter((guide) => guide.areas.includes(area));
      }

      if (language && language !== "all") {
        filtered = filtered.filter((guide) =>
          guide.languages.includes(language)
        );
      }

      state.filteredGuides = filtered;
    },
    bookGuide: (state, action) => {
      const { guideId, dates, requestDetails, totalPrice } = action.payload;

      const guide = state.guides.find((g) => g.id === guideId);

      if (!guide) return;

      const newBooking = {
        id: Date.now().toString(),
        guideId,
        guideName: guide.name,
        guideAvatar: guide.avatar,
        startDate: dates.startDate,
        endDate: dates.endDate,
        requestDetails,
        totalPrice,
        status: "pending", // pending, confirmed, completed, cancelled
        createdAt: new Date().toISOString(),
      };

      state.bookings.push(newBooking);
    },
    updateBookingStatus: (state, action) => {
      const { bookingId, status } = action.payload;

      const bookingIndex = state.bookings.findIndex(
        (booking) => booking.id === bookingId
      );

      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = status;
      }
    },
    cancelBooking: (state, action) => {
      const bookingId = action.payload;

      const bookingIndex = state.bookings.findIndex(
        (booking) => booking.id === bookingId
      );

      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = "cancelled";
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all guides
    builder.addCase(fetchGuides.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGuides.fulfilled, (state, action) => {
      state.loading = false;
      state.guides = action.payload;
      state.filteredGuides = action.payload;
    });
    builder.addCase(fetchGuides.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch guide by ID
    builder.addCase(fetchGuideById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGuideById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentGuide = action.payload;
    });
    builder.addCase(fetchGuideById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { filterGuides, bookGuide, updateBookingStatus, cancelBooking } =
  guideSlice.actions;

export default guideSlice.reducer;
