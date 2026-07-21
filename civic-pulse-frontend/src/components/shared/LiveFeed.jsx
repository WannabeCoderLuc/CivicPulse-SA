import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import { getCategoryIcon, timeAgo } from "../../utils/helpers";
import StatusBadge from "./StatusBadge";

export default function LiveFeed() {
  const { state } = useAppContext();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Live Incident Feed</h3>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: state.socketConnected ? [1, 0.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-2 h-2 rounded-full ${state.socketConnected ? "bg-red-500" : "bg-gray-600"}`}
          />
          <span className="text-xs text-gray-500">LIVE</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {state.liveReports.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">
              {state.socketConnected ? "Awaiting incoming reports…" : "Socket server offline"}
            </p>
          ) : (
            state.liveReports.map((report) => (
              <motion.div
                key={`${report.id}-${report.createdAt}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700/50"
              >
                <span className="text-xl mt-0.5">{getCategoryIcon(report.category)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.ward} · {timeAgo(report.createdAt)}</p>
                </div>
                <StatusBadge status={report.status} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
