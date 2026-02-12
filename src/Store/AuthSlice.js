import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../Api/axios";

export const adminLogin = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      const res = await api.put("/auth/profile", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    admin: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    loadToken: (state) => {
      const token = localStorage.getItem("token");
      if (token) {
        state.token = token;
      }
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns mixed data: Firebase response (idToken) + MongoDB user fields (_id, name, email)
        state.admin = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
        };
        state.token = action.payload.idToken;
        localStorage.setItem("token", action.payload.idToken);
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.admin = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, loadToken } = authSlice.actions;
export default authSlice.reducer;
