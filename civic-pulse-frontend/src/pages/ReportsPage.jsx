import { motion } from "framer-motion";
import ReportsList from "@/components/features/ReportsList";

export default function ReportsPage() {
  console.log("ENTER: ReportsPage render");
  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          All Reports
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete list of submitted infrastructure issues — filter, update status, and inspect audit trails
        </p>
      </div>
      <ReportsList />
    </div>
  );
}
