import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import KpiCard from "../../components/shared/KpiCard";
import LiveFeed from "../../components/shared/LiveFeed";

export default function DashboardPage() {
  console.log("ENTER: DashboardPage render");
  const { state } = useAppContext();
  const { kpi } = state;

  const kpiCards = [
    { label: "Total Reports", value: kpi?.totalReports, icon: "??", color: "#3B82F6", subtitle: "All time municipal issues" },
    { label: "Resolved", value: kpi?.resolved, icon: "?", color: "#10B981", subtitle: "Successfully completed" },
    { label: "Pending", value: kpi?.pending, icon: "?", color: "#F59E0B", subtitle: "Awaiting assessment" },
    { label: "In Progress", value: kpi?.inProgress, icon: "??", color: "#8B5CF6", subtitle: "Active repair work" },
    { label: "Urgent", value: kpi?.urgent, icon: "??", color: "#EF4444", subtitle: "Requires immediate action" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Municipality Dashboard
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">City of Cape Town — Infrastructure Management Operations Centre</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <KpiCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveFeed />

        <div className="card">
          <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {state.reports.slice(0, 6).map((report) => (
              <div key={report.id} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-civic-blue flex-shrink-0" />
                <span className="text-gray-300 truncate flex-1">{report.title}</span>
                <span className="text-gray-600 text-xs flex-shrink-0">{report.ward}</span>
              </div>
            ))}
            {state.reports.length === 0 && (
              <p className="text-gray-600 text-sm">No reports loaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
