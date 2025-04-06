import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Load itineraries from storage
export const loadItineraries = createAsyncThunk(
  "itinerary/loadItineraries",
  async (_, { rejectWithValue }) => {
    try {
      const storedItineraries = await AsyncStorage.getItem("itineraries");
      return storedItineraries ? JSON.parse(storedItineraries) : [];
    } catch (error) {
      return rejectWithValue("Failed to load itineraries");
    }
  }
);

// Save itineraries to storage
export const saveItineraries = createAsyncThunk(
  "itinerary/saveItineraries",
  async (itineraries, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem("itineraries", JSON.stringify(itineraries));
      return itineraries;
    } catch (error) {
      return rejectWithValue("Failed to save itineraries");
    }
  }
);

const initialState = {
  itineraries: [],
  currentItinerary: null,
  loading: false,
  error: null,
};

const itinerarySlice = createSlice({
  name: "itinerary",
  initialState,
  reducers: {
    createItinerary: (state, action) => {
      const newItinerary = {
        id: Date.now().toString(),
        title: action.payload.title,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
        days: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Generate empty days based on start and end date
      const start = new Date(action.payload.startDate);
      const end = new Date(action.payload.endDate);
      const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < dayCount; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);

        newItinerary.days.push({
          dayNumber: i + 1,
          date: date.toISOString().split("T")[0],
          destinations: [],
        });
      }

      state.itineraries.push(newItinerary);
      state.currentItinerary = newItinerary;
    },

    updateItinerary: (state, action) => {
      const { id, title, startDate, endDate } = action.payload;
      const index = state.itineraries.findIndex((item) => item.id === id);

      if (index !== -1) {
        state.itineraries[index].title = title;
        state.itineraries[index].startDate = startDate;
        state.itineraries[index].endDate = endDate;
        state.itineraries[index].updatedAt = new Date().toISOString();

        if (state.currentItinerary?.id === id) {
          state.currentItinerary = state.itineraries[index];
        }
      }
    },

    deleteItinerary: (state, action) => {
      const id = action.payload;
      state.itineraries = state.itineraries.filter((item) => item.id !== id);

      if (state.currentItinerary?.id === id) {
        state.currentItinerary = null;
      }
    },

    setCurrentItinerary: (state, action) => {
      const id = action.payload;
      state.currentItinerary =
        state.itineraries.find((item) => item.id === id) || null;
    },

    addDestinationToDay: (state, action) => {
      const { itineraryId, dayNumber, destination } = action.payload;
      const itineraryIndex = state.itineraries.findIndex(
        (item) => item.id === itineraryId
      );

      if (itineraryIndex !== -1) {
        const dayIndex = state.itineraries[itineraryIndex].days.findIndex(
          (day) => day.dayNumber === dayNumber
        );

        if (dayIndex !== -1) {
          // Check if destination already exists in this day
          const existingIndex = state.itineraries[itineraryIndex].days[
            dayIndex
          ].destinations.findIndex((dest) => dest.id === destination.id);

          if (existingIndex === -1) {
            state.itineraries[itineraryIndex].days[dayIndex].destinations.push({
              id: destination.id,
              name: destination.name,
              category: destination.category,
              latitude: destination.latitude,
              longitude: destination.longitude,
              image: destination.image,
              timeAdded: new Date().toISOString(),
            });
          }

          state.itineraries[itineraryIndex].updatedAt =
            new Date().toISOString();

          if (state.currentItinerary?.id === itineraryId) {
            state.currentItinerary = state.itineraries[itineraryIndex];
          }
        }
      }
    },

    removeDestinationFromDay: (state, action) => {
      const { itineraryId, dayNumber, destinationId } = action.payload;
      const itineraryIndex = state.itineraries.findIndex(
        (item) => item.id === itineraryId
      );

      if (itineraryIndex !== -1) {
        const dayIndex = state.itineraries[itineraryIndex].days.findIndex(
          (day) => day.dayNumber === dayNumber
        );

        if (dayIndex !== -1) {
          state.itineraries[itineraryIndex].days[dayIndex].destinations =
            state.itineraries[itineraryIndex].days[
              dayIndex
            ].destinations.filter((dest) => dest.id !== destinationId);

          state.itineraries[itineraryIndex].updatedAt =
            new Date().toISOString();

          if (state.currentItinerary?.id === itineraryId) {
            state.currentItinerary = state.itineraries[itineraryIndex];
          }
        }
      }
    },

    moveDestination: (state, action) => {
      const { itineraryId, fromDay, toDay, destinationId } = action.payload;
      const itineraryIndex = state.itineraries.findIndex(
        (item) => item.id === itineraryId
      );

      if (itineraryIndex !== -1) {
        const fromDayIndex = state.itineraries[itineraryIndex].days.findIndex(
          (day) => day.dayNumber === fromDay
        );

        const toDayIndex = state.itineraries[itineraryIndex].days.findIndex(
          (day) => day.dayNumber === toDay
        );

        if (fromDayIndex !== -1 && toDayIndex !== -1) {
          // Find the destination
          const destIndex = state.itineraries[itineraryIndex].days[
            fromDayIndex
          ].destinations.findIndex((dest) => dest.id === destinationId);

          if (destIndex !== -1) {
            // Remove from original day and add to new day
            const destination =
              state.itineraries[itineraryIndex].days[fromDayIndex].destinations[
                destIndex
              ];
            state.itineraries[itineraryIndex].days[
              fromDayIndex
            ].destinations.splice(destIndex, 1);
            state.itineraries[itineraryIndex].days[
              toDayIndex
            ].destinations.push(destination);

            state.itineraries[itineraryIndex].updatedAt =
              new Date().toISOString();

            if (state.currentItinerary?.id === itineraryId) {
              state.currentItinerary = state.itineraries[itineraryIndex];
            }
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Load itineraries
    builder.addCase(loadItineraries.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadItineraries.fulfilled, (state, action) => {
      state.loading = false;
      state.itineraries = action.payload;
    });
    builder.addCase(loadItineraries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Save itineraries
    builder.addCase(saveItineraries.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(saveItineraries.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(saveItineraries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const {
  createItinerary,
  updateItinerary,
  deleteItinerary,
  setCurrentItinerary,
  addDestinationToDay,
  removeDestinationFromDay,
  moveDestination,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
