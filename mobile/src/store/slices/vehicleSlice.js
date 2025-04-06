import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vehicles } from "../../data/vehicles";

// In a real app, these would be API calls to your backend
export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return vehicles;
    } catch (error) {
      return rejectWithValue("Failed to fetch vehicles");
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  "vehicles/fetchVehicleById",
  async (vehicleId, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const vehicle = vehicles.find((v) => v.id === vehicleId);

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      return vehicle;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice for vehicle management
const vehicleSlice = createSlice({
  name: "vehicles",
  initialState: {
    vehicles: [],
    currentVehicle: null,
    filteredVehicles: [],
    loading: false,
    error: null,
    bookings: [], // User's vehicle bookings
  },
  reducers: {
    filterVehicles: (state, action) => {
      const { category, location, passengers } = action.payload;

      let filtered = state.vehicles;

      if (category && category !== "all") {
        filtered = filtered.filter((vehicle) => vehicle.category === category);
      }

      if (location && location !== "all") {
        filtered = filtered.filter((vehicle) => vehicle.location === location);
      }

      if (passengers && passengers > 0) {
        filtered = filtered.filter(
          (vehicle) => vehicle.specifications.passengers >= passengers
        );
      }

      state.filteredVehicles = filtered;
    },
    bookVehicle: (state, action) => {
      const {
        vehicleId,
        dates,
        pickupLocation,
        returnLocation,
        driverOption,
        totalPrice,
      } = action.payload;

      const vehicle = state.vehicles.find((v) => v.id === vehicleId);

      if (!vehicle) return;

      const newBooking = {
        id: Date.now().toString(),
        vehicleId,
        vehicleTitle: vehicle.title,
        vehicleImage: vehicle.images[0],
        ownerName: vehicle.ownerName,
        startDate: dates.startDate,
        endDate: dates.endDate,
        pickupLocation,
        returnLocation,
        driverOption,
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
    // Fetch all vehicles
    builder.addCase(fetchVehicles.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVehicles.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = action.payload;
      state.filteredVehicles = action.payload;
    });
    builder.addCase(fetchVehicles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch vehicle by ID
    builder.addCase(fetchVehicleById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVehicleById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentVehicle = action.payload;
    });
    builder.addCase(fetchVehicleById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const {
  filterVehicles,
  bookVehicle,
  updateBookingStatus,
  cancelBooking,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
