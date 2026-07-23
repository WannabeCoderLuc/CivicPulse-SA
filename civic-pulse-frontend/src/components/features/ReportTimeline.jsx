import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchTimeline } from "@/services/api";
import { TIMELINE_STAGES } from "@/mock/constants";
import { formatDate } from "@/utils/helpers";
import { toastError } from "@/lib/toast";

const STAGE_ICONS = {
  Reported: "??",
  Verified: "??",
  Assigned: "??",
  "Repair Started": "??",
  Completed: "?",
};

export default function ReportTimeline({ reportId }) {
  console.log(`ENTER: ReportTimeline render reportId=${reportId}`);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;
    console.log(`ENTER: ReportTimeline.loadTimeline reportId=${reportId}`);
    setIsLoading(true);
    fetchTimeline(reportId)
      .then((data) => {
        setEvents(data);
        console.log(`SUCCESS: ReportTimeline loaded ${data.length} events`);
      })
      .catch((err) => {
        console.error(`ERR-TIMELINE-001: loadTimeline failed. ${err.message}`);
        toastError("ERR-TIMELINE-001", `Failed to load audit trail for report #${reportId}.`);
      })
      .finally(() => setIsLoading(false));
  }, [reportId]);

  const completedStages = new Set(events.map((e) => e.stage));

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6">
        <div className="w-4 h-4 border-2 border-civic-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Loading audit trail…</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {TIMELINE_STAGES.map((stage, idx) => {
        const event = events.find((e) => e.stage === stage);
        const isDone = completedStages.has(stage);
        const isNext = !isDone && TIMELINE_STAGES.slice(0, idx).every((s) => completedStages.has(s));

        return (
          <div key={stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 border-2 transition-all ${
                  isDone
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : isNext
                    ? "bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse"
                    : "bg-gray-800 border-gray-700 text-gray-600"
                }`}
              >
                {STAGE_ICONS[stage] || "•"}
              </motion.div>
              {idx < TIMELINE_STAGES.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1 mb-1 min-h-[24px] rounded ${
                    isDone ? "bg-green-500/40" : "bg-gray-800"
                  }`}
                />
              )}
            </div>

            <div className={`pb-4 pt-1.5 min-w-0 flex-1 ${!isDone ? "opacity-40" : ""}`}>
              <p className={`text-sm font-semibold ${isDone ? "text-white" : "text-gray-500"}`}>
                {stage}
              </p>
              {event && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-gray-400">{event.note}</p>
                  <div className="flex gap-3 text-xs text-gray-600">
                    <span>?? {event.performedBy}</span>
                    <span>?? {formatDate(event.timestamp)}</span>
                  </div>
                </div>
              )}
              {!isDone && isNext && (
                <p className="text-xs text-amber-600 mt-1">Awaiting progression…</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
