import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function KpiCard({ label, value, icon, color = "#3b82f6", subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-all duration-200 shadow-md">
        <CardContent className="flex items-start gap-4 p-5">
          {/* Icon Badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner"
            style={{
              backgroundColor: `${color}1A`,
              borderColor: `${color}33`,
              borderWidth: "1px",
              color: color,
            }}
          >
            {icon}
          </div>

          {/* Metric Details */}
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {label}
            </p>

            <p
              className="text-3xl font-extrabold mt-1 tracking-tight"
              style={{ color }}
            >
              {value ?? "-"}
            </p>

            {subtitle && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}