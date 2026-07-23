import { motion } from "framer-motion";
import AnalyticsCharts from "@/components/features/AnalyticsCharts";

export default function AnalyticsPage() {
  console.log("ENTER: AnalyticsPage render");
  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Performance Analytics
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Visual performance tracking — reports by category and ward-level service delivery metrics
        </p>
      </div>
      <AnalyticsCharts />
    </div>
  );
}
