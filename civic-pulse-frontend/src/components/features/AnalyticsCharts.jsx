import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { fetchByCategory, fetchWardPerformance } from "@/services/api";
import { CATEGORY_COLORS } from "@/mock/constants";
import { toastError } from "@/lib/toast";

const CHART_COLORS = ["#3B82F6", "#F59E0B", "#8B5CF6", "#10B981", "#EF4444", "#06B6D4", "#EC4899"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-gray-300 text-sm font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.fill || entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsCharts() {


  const [categoryData, setCategoryData] = useState([]);
  const [wardData, setWardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    setIsLoading(true);
    Promise.all([fetchByCategory(), fetchWardPerformance()])
      .then(([cats, wards]) => {
        setCategoryData(cats);
        setWardData(wards);
        console.log(`SUCCESS: AnalyticsCharts ${cats.length} categories, ${wards.length} wards loaded`);
      })
      .catch((err) => {
        console.error(`ERR-ANALYTICS-001: loadData failed. ${err.message}`);
        toastError("ERR-ANALYTICS-001", "Failed to load analytics data.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-civic-blue border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading analytics</span>
      </div>
    );
  }

  const pieData = categoryData.map((d) => ({
    name: d.category,
    value: d.count,
    fill: CATEGORY_COLORS[d.category] || "#6B7280",
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="font-semibold text-white mb-1">Reports by Category</h3>
          <p className="text-xs text-gray-500 mb-5">Distribution of all submitted municipal issues</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="category" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Reports" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[entry.category] || CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="font-semibold text-white mb-1">Category Breakdown</h3>
          <p className="text-xs text-gray-500 mb-5">Proportional split across infrastructure types</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="font-semibold text-white mb-1">Ward Performance</h3>
        <p className="text-xs text-gray-500 mb-5">Total reported vs. resolved issues by municipal ward</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={wardData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="ward" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
              iconType="square"
              iconSize={10}
            />
            <Bar dataKey="total" name="Total Reports" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
