import { motion } from "framer-motion";
import ReportForm from "../components/features/ReportForm";

export default function ReportPage() {
  console.log("ENTER: ReportPage render");
  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Report a Municipal Issue
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Submit infrastructure concerns directly to the City of Cape Town Operations Centre.
          All reports are logged, verified, and assigned to qualified technicians.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
