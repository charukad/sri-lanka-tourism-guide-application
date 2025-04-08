import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import authReducer, {
  initialState,
  login,
  register,
  logout,
  checkAuthStatus,
} from "../../../src/store/slices/authSlice";

// Set up mock store and axios
const mockStore = configureMockStore([thunk]);
const mockAxios = new MockAdapter(axios);

describe("Auth Slice", () => {
  let store;

  beforeEach(() => {
    store = mockStore({ auth: initialState });
    mockAxios.reset();

    // Mock AsyncStorage
    jest.mock("@react-native-async-storage/async-storage", () => ({
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }));
  });

  describe("Reducer", () => {
    it("should return the initial state", () => {
      expect(authReducer(undefined, {})).toEqual(initialState);
    });

    it("should handle pending state", () => {
      const action = { type: login.pending.type };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it("should handle login.fulfilled", () => {
      const payload = {
        token: "test-token",
        user: { id: "1", username: "testuser" },
      };
      const action = { type: login.fulfilled.type, payload };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe("test-token");
      expect(state.user).toEqual({ id: "1", username: "testuser" });
    });

    it("should handle login.rejected", () => {
      const action = {
        type: login.rejected.type,
        error: { message: "Authentication failed" },
      };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe("Authentication failed");
    });

    it("should handle logout", () => {
      const initialStateWithAuth = {
        ...initialState,
        isAuthenticated: true,
        token: "test-token",
        user: { id: "1", username: "testuser" },
      };

      const state = authReducer(initialStateWithAuth, logout());

      expect(state).toEqual(initialState);
    });
  });

  describe("Actions", () => {
    it("should dispatch login.fulfilled on successful login", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };
      const response = {
        token: "test-token",
        user: { id: "1", username: "testuser", email: "test@example.com" },
      };

      mockAxios.onPost("/api/auth/login").reply(200, response);

      await store.dispatch(login(credentials));

      const actions = store.getActions();
      expect(actions[0].type).toBe(login.pending.type);
      expect(actions[1].type).toBe(login.fulfilled.type);
      expect(actions[1].payload).toEqual(response);
    });

    it("should dispatch login.rejected on failed login", async () => {
      const credentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      mockAxios
        .onPost("/api/auth/login")
        .reply(401, { message: "Invalid credentials" });

      await store.dispatch(login(credentials));

      const actions = store.getActions();
      expect(actions[0].type).toBe(login.pending.type);
      expect(actions[1].type).toBe(login.rejected.type);
      expect(actions[1].error).toBeTruthy();
    });

    it("should dispatch register.fulfilled on successful registration", async () => {
      const userData = {
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        user_type: "tourist",
      };

      const response = {
        token: "test-token",
        user: { id: "1", username: "newuser", email: "new@example.com" },
      };

      mockAxios.onPost("/api/auth/register").reply(201, response);

      await store.dispatch(register(userData));

      const actions = store.getActions();
      expect(actions[0].type).toBe(register.pending.type);
      expect(actions[1].type).toBe(register.fulfilled.type);
      expect(actions[1].payload).toEqual(response);
    });
  });
});
