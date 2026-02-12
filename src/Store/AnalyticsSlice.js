
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../Api/axios";

export const fetchAnalyticsData = createAsyncThunk(
  "analytics/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const [topSelling, categoryPerformance, dailySales, stockReport] = await Promise.all([
        api.get("/analytics/top-selling"),
        api.get("/analytics/categories"),
        api.get("/analytics/daily-sales"),
        api.get("/analytics/stock")
      ]);

      return {
        topSelling: topSelling.data,
        categoryPerformance: categoryPerformance.data,
        dailySales: dailySales.data,
        stockReport: stockReport.data
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch analytics data");
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    topSelling: [],
    categoryPerformance: [],
    dailySales: [],
    stockReport: { lowStock: [], outOfStock: [] },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.loading = false;
        state.topSelling = action.payload.topSelling;
        state.categoryPerformance = action.payload.categoryPerformance;
        state.dailySales = action.payload.dailySales;
        state.stockReport = action.payload.stockReport;
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;