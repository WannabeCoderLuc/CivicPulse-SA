import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { updateReportStatus, deleteReport } from "@/services/api";
import { emitStatusUpdated } from "@/services/socket";
import { CATEGORIES, STATUSES } from "@/mock/constants";
import { getCategoryIcon, formatDate, timeAgo } from "@/utils/helpers";
import { toastSuccess, toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import ReportTimeline from "@/components/features/ReportTimeline";

export default function ReportsList() {
  console.log("ENTER: ReportsList render");

  const { state, dispatch, loadKpi } = useAppContext();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = state.reports.filter((r) => {
    const catMatch = filterCategory === "all" || r.category === filterCategory;
    const statusMatch = filterStatus === "all" || r.status === filterStatus;
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
      await updateReportStatus(id, status);
      dispatch({ type: "UPDATE_REPORT_STATUS", payload: { id, status } });
      console.log(`STATE_CHANGE: report ${id} status updated to ${status}`);
      emitStatusUpdated(id, status);
      await loadKpi();
      toastSuccess(`Report #${id} updated to "${status}".`);
      console.log(`SUCCESS: handleStatusUpdate id=${id}`);
    } catch (err) {
      console.error(`ERR-LIST-001: handleStatusUpdate failed. ${err.message}`);
      toastError("ERR-LIST-001", `Failed to update status for report #${id}.`);
    } finally {
      setUpdatingId(null);
    }
  }, [dispatch, loadKpi]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    console.log(`ENTER: ReportsList.confirmDelete id=${deleteTarget}`);
    setIsDeleting(true);
    try {
      await deleteReport(deleteTarget);
      dispatch({ type: "REMOVE_REPORT", payload: deleteTarget });
      console.log(`STATE_CHANGE: report ${deleteTarget} removed from state`);
      await loadKpi();
      toastSuccess(`Report #${deleteTarget} has been permanently deleted.`);
      console.log(`SUCCESS: confirmDelete id=${deleteTarget}`);
    } catch (err) {
      console.error(`ERR-LIST-002: confirmDelete failed. ${err.message}`);
      toastError("ERR-LIST-002", `Failed to delete report #${deleteTarget}.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, dispatch, loadKpi]);

  return (
    <>
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report #{deleteTarget}?</DialogTitle>
            <DialogDescription>
              This will permanently remove the report and its entire audit trail from the database.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" disabled={isDeleting} onClick={confirmDelete}>
              {isDeleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => {
                console.log(`STATE_CHANGE: ReportsList.search="${e.target.value}"`);
                setSearch(e.target.value);
              }}
              placeholder="Search reports, wards, citizens…"
              className="form-input pl-9 max-w-xs text-sm py-2"
            />
          </div>

          <Select value={filterCategory} onValueChange={(v) => { console.log(`STATE_CHANGE: ReportsList.filterCategory=${v}`); setFilterCategory(v); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{getCategoryIcon(c)} {c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => { console.log(`STATE_CHANGE: ReportsList.filterStatus=${v}`); setFilterStatus(v); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

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
              <motion.div key={report.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="card">
                <div className="flex items-start gap-4 cursor-pointer" onClick={() => { console.log(`STATE_CHANGE: ReportsList.expandedId=${expandedId === report.id ? null : report.id}`); setExpandedId((prev) => prev === report.id ? null : report.id); }}>
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">{getCategoryIcon(report.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white text-sm">{report.title}</p>
                      <Badge variant="outline" className="text-gray-600 text-xs border-gray-700">#{report.id}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{report.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-gray-500">?? {report.ward}</span>
                      <span className="text-xs text-gray-600">?? {report.reportedBy}</span>
                      <span className="text-xs text-gray-600">?? {timeAgo(report.createdAt)}</span>
                    </div>
                  </div>
                  <span className="text-gray-600 mt-1">{expandedId === report.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                </div>

                <AnimatePresence>
                  {expandedId === report.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
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
                              <Button key={s} size="sm" variant={report.status === s ? "default" : "outline"} disabled={updatingId === report.id || report.status === s} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(report.id, s); }}>
                                {updatingId === report.id ? "Updating…" : s}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audit Trail</p>
                          <ReportTimeline reportId={report.id} />
                        </div>

                        <div className="flex justify-end">
                          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); console.log(`STATE_CHANGE: ReportsList.deleteTarget=${report.id}`); setDeleteTarget(report.id); }}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete Report
                          </Button>
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
    </>
  );
}
