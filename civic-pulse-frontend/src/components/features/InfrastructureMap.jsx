import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { fetchReports } from "@/services/api";
import { CATEGORIES, MAP_CENTER, MAP_ZOOM } from "@/mock/constants";
import { createLeafletIcon, getCategoryIcon, formatDate } from "@/utils/helpers";
import { toastError } from "@/lib/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/shared/StatusBadge";

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, MAP_ZOOM);
  }, [center, map]);
  return null;
}

export default function InfrastructureMap() {
  console.log("ENTER: InfrastructureMap render");

  const { state } = useAppContext();
  const [filteredReports, setFilteredReports] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [localReports, setLocalReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadMapReports = useCallback(async () => {
    console.log("ENTER: InfrastructureMap.loadMapReports");
    setIsLoading(true);
    try {
      const data = await fetchReports();
      setLocalReports(data);
      console.log(`SUCCESS: InfrastructureMap loaded ${data.length} reports`);
    } catch (err) {
      console.error(`ERR-MAP-001: loadMapReports failed. ${err.message}`);
      toastError("ERR-MAP-001", "Failed to load map reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapReports();
  }, [loadMapReports]);

  useEffect(() => {
    console.log(`STATE_CHANGE: InfrastructureMap filter — category=${activeCategory} status=${activeStatus}`);
    try {
      let result = [...localReports];
      if (activeCategory !== "All") {
        result = result.filter((r) => r.category === activeCategory);
      }
      if (activeStatus !== "All") {
        result = result.filter((r) => r.status === activeStatus);
      }
      setFilteredReports(result);
      console.log(`SUCCESS: Filter applied — ${result.length} pins visible`);
    } catch (err) {
      console.error(`ERR-MAP-002: Filter failed. ${err.message}`);
    }
  }, [localReports, activeCategory, activeStatus]);

  useEffect(() => {
    if (state.liveReports.length > 0) {
      console.log("STATE_CHANGE: InfrastructureMap — merging live reports");
      const liveWithCoords = state.liveReports.filter((r) => r.latitude && r.longitude);
      setLocalReports((prev) => {
        const ids = new Set(prev.map((r) => r.id));
        const newOnes = liveWithCoords.filter((r) => !ids.has(r.id));
        return [...newOnes, ...prev];
      });
    }
  }, [state.liveReports]);

  const statuses = ["All", "Reported", "Verified", "Assigned", "Repair Started", "Completed", "Urgent"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log(`STATE_CHANGE: InfrastructureMap.activeCategory=${cat}`);
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-civic-blue text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {cat === "All" ? "??? All" : `${getCategoryIcon(cat)} ${cat}`}
            </motion.button>
          ))}
        </div>
        <div className="h-5 w-px bg-gray-700" />
        <Select value={activeStatus} onValueChange={(v) => { console.log(`STATE_CHANGE: InfrastructureMap.activeStatus=${v}`); setActiveStatus(v); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-500 ml-auto">
          {isLoading ? "Loading…" : `${filteredReports.length} incident${filteredReports.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="flex gap-3 text-xs text-gray-500">
        <span>?? Completed</span>
        <span>?? In Progress / Assigned</span>
        <span>?? Urgent</span>
        <span>?? Reported</span>
        <span>?? Verified</span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-gray-800" style={{ height: "520px" }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 rounded-2xl">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-civic-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading incident map…</p>
            </div>
          </div>
        )}

        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={MAP_CENTER} />

          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createLeafletIcon(report.status, L)}
              eventHandlers={{
                click: () => {
                  console.log(`MAP_PIN_CLICK: report id=${report.id}`);
                  setSelectedReport(report);
                },
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(report.category)}</span>
                    <span className="font-semibold text-white text-sm">{report.title}</span>
                  </div>
                  <StatusBadge status={report.status} />
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <p>?? {report.ward}</p>
                    <p>?? {report.reportedBy}</p>
                    <p>?? {formatDate(report.createdAt)}</p>
                    <p className="text-gray-300 mt-1">{report.description}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-civic-blue/30"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryIcon(selectedReport.category)}</span>
              <div>
                <p className="font-semibold text-white">{selectedReport.title}</p>
                <p className="text-xs text-gray-500">{selectedReport.ward} · ID #{selectedReport.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedReport.status} />
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-white ml-2"
              >?</button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">{selectedReport.description}</p>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span>Reported by: {selectedReport.reportedBy}</span>
            <span>Created: {formatDate(selectedReport.createdAt)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
