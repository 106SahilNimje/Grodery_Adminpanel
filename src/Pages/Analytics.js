import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  CircularProgress
} from "@mui/material";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalyticsData
} from "../Store/AnalyticsSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ReportsAnalytics() {
  const dispatch = useDispatch();
  const { topSelling, categoryPerformance, dailySales, stockReport, loading } = useSelector(
    (state) => state.analytics
  );

  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    dispatch(fetchAnalyticsData());
  }, [dispatch]);

  
  const topSellingChart = useMemo(() => {
    return {
      labels: topSelling.map((p) => p.name),
      datasets: [
        {
          label: "Units Sold",
          data: topSelling.map((p) => p.totalSold),
          backgroundColor: "#22C55E",
          borderRadius: 4
        }
      ]
    };
  }, [topSelling]);

  const categoryChart = useMemo(() => {
    return {
      labels: categoryPerformance.map((c) => c._id),
      datasets: [
        {
          data: categoryPerformance.map((c) => c.totalSales),
          backgroundColor: ["#22C55E", "#3B82F6", "#FACC15", "#F97316", "#A855F7", "#EC4899"],
          borderWidth: 0
        }
      ]
    };
  }, [categoryPerformance]);

  const salesTrendChart = useMemo(() => {
    return {
      labels: dailySales.map((d) => d._id), 
      datasets: [
        {
          label: "Revenue",
          data: dailySales.map((d) => d.totalRevenue),
          borderColor: "#16A34A",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [dailySales]);

  const summaryStats = useMemo(() => {
   
    const today = new Date().toLocaleDateString('en-CA'); 
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

    const todayData = dailySales.find((d) => d._id === today) || { totalRevenue: 0, orderCount: 0 };
    const yesterdayData = dailySales.find((d) => d._id === yesterday) || { totalRevenue: 0, orderCount: 0 };
    
    const totalWeekRevenue = dailySales.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const totalWeekOrders = dailySales.reduce((acc, curr) => acc + curr.orderCount, 0);

    return [
      ["Today", todayData.orderCount, `₹${todayData.totalRevenue}`, `₹${todayData.orderCount ? Math.round(todayData.totalRevenue / todayData.orderCount) : 0}`, "-"],
      ["Yesterday", yesterdayData.orderCount, `₹${yesterdayData.totalRevenue}`, `₹${yesterdayData.orderCount ? Math.round(yesterdayData.totalRevenue / yesterdayData.orderCount) : 0}`, "-"],
      ["Last 7 Days", totalWeekOrders, `₹${totalWeekRevenue}`, `₹${totalWeekOrders ? Math.round(totalWeekRevenue / totalWeekOrders) : 0}`, "-"]
    ];
  }, [dailySales]);

  const handleExport = () => {
    const csvRows = [];
    
    csvRows.push(["Report Type", "Metric", "Value"]);
    
    topSelling.forEach(p => csvRows.push(["Top Selling", p.name, p.totalSold]));
    
    categoryPerformance.forEach(c => csvRows.push(["Category Sales", c._id, c.totalSales]));
    
    dailySales.forEach(d => csvRows.push(["Daily Sales", d._id, d.totalRevenue]));
    
    stockReport.lowStock.forEach(s => csvRows.push(["Low Stock", `${s.name} (${s.variant})`, s.stock]));
    stockReport.outOfStock.forEach(s => csvRows.push(["Out of Stock", `${s.name} (${s.variant})`, 0]));

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={24} fontWeight={700}>
            Reports & Analytics
          </Typography>
          <Typography color="text.secondary">
            View detailed sales and inventory reports
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Select size="small" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
          </Select>

          <Button
            variant="contained"
            onClick={handleExport}
            sx={{
              bgcolor: "#16A34A",
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              "&:hover": { bgcolor: "#15803d" }
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns={{ lg: "1fr 1fr" }} gap={3} mb={3}>
        <Paper sx={card}>
          <Typography fontWeight={700} mb={2}>
            Top Selling Products
          </Typography>
          <Box height={300}>
             {topSelling.length > 0 ? (
               <Bar
                 data={topSellingChart}
                 options={{ 
                   responsive: true, 
                   maintainAspectRatio: false,
                   plugins: { legend: { display: false } } 
                 }}
               />
             ) : (
               <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                 <Typography color="text.secondary">No sales data available</Typography>
               </Box>
             )}
          </Box>
        </Paper>

        <Paper sx={card}>
          <Typography fontWeight={700} mb={2}>
            Sales by Category
          </Typography>
          <Box height={300} width={400}display="flex" justifyContent="center">
            {categoryPerformance.length > 0 ? (
              <Doughnut
                data={categoryChart}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right' } } 
                }}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                 <Typography color="text.secondary">No category data available</Typography>
               </Box>
            )}
          </Box>
        </Paper>
      </Box>

    
      <Box display="grid" gridTemplateColumns={{ lg: "1fr 1fr" }} gap={3} mb={3}>
        <Paper sx={card}>
          <Typography fontWeight={700} mb={2}>
            Daily Sales Trend
          </Typography>
          <Box height={300}>
            {dailySales.length > 0 ? (
              <Line
                data={salesTrendChart}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                 <Typography color="text.secondary">No trend data available</Typography>
               </Box>
            )}
          </Box>
        </Paper>

        <Paper sx={card}>
          <Typography fontWeight={700} mb={2}>
            Low Stock & Out of Stock Alerts
          </Typography>

          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {stockReport.outOfStock.map((item, i) => (
              <Box
                key={`out-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={1.5}
                mb={1}
                borderRadius={2}
                bgcolor="#FEE2E2"
              >
                <Box display="flex" gap={1.5} alignItems="center">
                  <Avatar variant="rounded" sx={{ bgcolor: "#EF4444" }}>!</Avatar>
                  <Box>
                    <Typography fontWeight={600}>{item.name}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {item.variant} • {item.category}
                    </Typography>
                  </Box>
                </Box>
                <Typography fontWeight={700} color="#DC2626">
                  Out of Stock
                </Typography>
              </Box>
            ))}

            {stockReport.lowStock.map((item, i) => (
              <Box
                key={`low-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={1.5}
                mb={1}
                borderRadius={2}
                bgcolor="#FEF9C3"
              >
                <Box display="flex" gap={1.5} alignItems="center">
                  <Avatar variant="rounded" sx={{ bgcolor: "#EAB308" }}>L</Avatar>
                  <Box>
                    <Typography fontWeight={600}>{item.name}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {item.variant} • {item.category}
                    </Typography>
                  </Box>
                </Box>
                <Typography fontWeight={700} color="#CA8A04">
                  {item.stock} left
                </Typography>
              </Box>
            ))}

            {stockReport.outOfStock.length === 0 && stockReport.lowStock.length === 0 && (
              <Typography color="text.secondary" align="center" mt={4}>
                Inventory is healthy! No alerts.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ ...card, mt: 3 }}>
        <Typography fontWeight={700} mb={2}>
          Sales Summary (Snapshot)
        </Typography>

        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              {["Period", "Orders", "Revenue", "Avg Order Value", "Status"].map(
                h => (
                  <TableCell key={h} sx={{ fontSize: 12, fontWeight: 700 }}>
                    {h}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {summaryStats.map((r, i) => (
              <TableRow key={i} hover>
                <TableCell fontWeight={600}>{r[0]}</TableCell>
                <TableCell>{r[1]}</TableCell>
                <TableCell fontWeight={600}>{r[2]}</TableCell>
                <TableCell>{r[3]}</TableCell>
                <TableCell sx={{ color: "#16A34A", fontWeight: 600 }}>
                  Active
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

const card = {
  p: 3,
  borderRadius: 3,
  border: "1px solid #eee",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"

};