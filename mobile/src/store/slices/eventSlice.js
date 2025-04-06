import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import eventService from "../../services/eventService";

// Async thunk for fetching events with filters
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await eventService.getEvents(filters);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);

// Async thunk for fetching a single event
export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventById(eventId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch event"
      );
    }
  }
);

// Async thunk for fetching monthly events
export const fetchEventsByMonth = createAsyncThunk(
  "events/fetchEventsByMonth",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventsByMonth(year, month);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch monthly events"
      );
    }
  }
);

// Async thunk for fetching featured events
export const fetchFeaturedEvents = createAsyncThunk(
  "events/fetchFeaturedEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getFeaturedEvents();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured events"
      );
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    currentEvent: null,
    featuredEvents: [],
    monthlyEvents: [],
    filteredEvents: [],
    loading: false,
    error: null,
  },
  reducers: {
    filterEvents: (state, action) => {
      const { category, date } = action.payload;

      let filtered = [...state.events];

      if (category && category !== "all") {
        filtered = filtered.filter((event) => event.category === category);
      }

      if (date) {
        const filterDate = new Date(date);
        filtered = filtered.filter((event) => {
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          return filterDate >= startDate && filterDate <= endDate;
        });
      }

      state.filteredEvents = filtered;
    },
  },
  extraReducers: (builder) => {
    // Fetch all events
    builder.addCase(fetchEvents.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
      state.filteredEvents = action.payload;
      state.error = null;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch event by ID
    builder.addCase(fetchEventById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchEventById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEvent = action.payload;
      state.error = null;
    });
    builder.addCase(fetchEventById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch events by month
    builder.addCase(fetchEventsByMonth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchEventsByMonth.fulfilled, (state, action) => {
      state.loading = false;
      state.monthlyEvents = action.payload;
      state.error = null;
    });
    builder.addCase(fetchEventsByMonth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch featured events
    builder.addCase(fetchFeaturedEvents.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFeaturedEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.featuredEvents = action.payload;
      state.error = null;
    });
    builder.addCase(fetchFeaturedEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { filterEvents } = eventSlice.actions;
export default eventSlice.reducer;
