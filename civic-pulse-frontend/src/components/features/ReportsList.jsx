import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import { updateReportStatus, deleteReport } from "../../services/api";
import { emitStatusUpdated } from "../../services/socket";
import { CATEGORIES, STATUSES } from "../../mock/constants";
import { getCategoryIcon, formatDate, timeAgo } from "../../utils/helpers";
import StatusBadge from "../shared/StatusBadge";
import ReportTimeline from "./ReportTimeline";

export default function ReportsList() {
  console.log("ENTER: ReportsList render");

  const { state, dispatch, loadKpi } = useAppContext();
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = state.reports.filter((r) => {
    const catMatch = filterCategory === "All" || r.category === filterCategory;
    const statusMatch = filterStatus === "All" || r.status === filterStatus;
    const searchMatch =
      search === "" ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ward.toLowerCase().includes(search.toLowerCase()) ||
      r.reportedBy?.toLowerCase().includes(search.toLowerCase());
    return catMatch && statusMatch && searchMatch;
  });

  const handleStatusUpdate = useCallback(async (id, status) => {
    console.log(`ENTER: ReportsList.handleStatusUpdate id=${id} status=${status}`);
    setUpdatingId(id);
    try {
      const updated = await updateReportStatus(id, status);
      dispatch({ type: "UPDATE_REPORT_STATUS", payload: { id, status } });
      console.log(`STATE_CHANGE: report ${id} status updated to ${status}`);
      emitStatusUpdated(id, status);
      await loadKpi();
      console.log(`SUCCESS: handleStatusUpdate id=${id}`);
    } catch (err) {
      console.error(`ERR-LIST-001: handleStatusUpdate failed. ${err.message}`);
      window.alert(`ERR-LIST-001: Failed to update status.\n${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }, [dispatch, loadKpi]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(`Delete report #${id}? This action cannot be undone.`)) return;
    console.log(`ENTER: ReportsList.handleDelete id=${id}`);
    setDeletingId(id);
    try {
      await deleteReport(id);
      dispatch({ type: "REMOVE_REPORT", payload: id });
      console.log(`STATE_CHANGE: report ${id} removed from state`);
      await loadKpi();
      console.log(`SUCCESS: handleDelete id=${id}`);
    } catch (err) {
      console.error(`ERR-LIST-002: handleDelete failed. ${err.message}`);
      window.alert(`ERR-LIST-002: Failed to delete report.\n${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }, [dispatch, loadKpi]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => {
            console.log(`STATE_CHANGE: ReportsList.search="${e.target.value}"`);
            setSearch(e.target.value);
          }}
          placeholder="Search reports, wards, citizens…"
          className="form-input max-w-xs text-sm py-2"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-civic-blue"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-civic-blue"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {state.isLoading && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-8 h-8 border-2 border-civic-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading reports from database…
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((report) => (
            <motion.div
              key={report.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => {
                  console.log(`STATE_CHANGE: ReportsList.expandedId=${expandedId === report.id ? null : report.id}`);
                  setExpandedId((prev) => prev === report.id ? null : report.id);
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(report.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{report.title}</p>
                    <span className="text-gray-600 text-xs">#{report.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-gray-500">?? {report.ward}</span>
                    <span className="text-xs text-gray-600">?? {report.reportedBy}</span>
                    <span className="text-xs text-gray-600">?? {timeAgo(report.createdAt)}</span>
                  </div>
                </div>
                <span className="text-gray-600 text-sm">{expandedId === report.id ? "?" : "?"}</span>
              </div>

              <AnimatePresence>
                {expandedId === report.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-800 mt-4 pt-4 space-y-5">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div><span className="text-gray-600">Category:</span> {report.category}</div>
                        <div><span className="text-gray-600">Ward:</span> {report.ward}</div>
                        <div><span className="text-gray-600">Created:</span> {formatDate(report.createdAt)}</div>
                        <div><span className="text-gray-600">Updated:</span> {formatDate(report.updatedAt)}</div>
                        <div><span className="text-gray-600">Coords:</span> {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {["Verified", "Assigned", "Repair Started", "Completed", "Urgent"].map((s) => (
                            <button
                              key={s}
                              disabled={updatingId === report.id || report.status === s}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(report.id, s);
                              }}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                report.status === s
                                  ? "bg-civic-blue/20 border-civic-blue text-blue-300"
                                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                              }`}
                            >
                              {updatingId === report.id ? "Updating…" : s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audit Trail</p>
                        <ReportTimeline reportId={report.id} />
                      </div>

                      <div className="flex justify-end">
                        <button
                          disabled={deletingId === report.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(report.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-400 border border-red-900/50 hover:border-red-800 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-40"
                        >
                          {deletingId === report.id ? "Deleting…" : "??? Delete Report"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {!state.isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">??</p>
            <p className="text-sm">No reports match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
