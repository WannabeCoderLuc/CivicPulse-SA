import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { fetchReports, fetchKpi } from "../services/api";
import { getSocket } from "../services/socket";

const AppContext = createContext(null);

const initialState = {
  reports: [],
  kpi: null,
  liveReports: [],
  isLoading: false,
  error: null,
  socketConnected: false,
};

function reducer(state, action) {
  console.log(`STATE_CHANGE: action=${action.type}`);
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_REPORTS":
      return { ...state, reports: action.payload, isLoading: false };
    case "SET_KPI":
      return { ...state, kpi: action.payload };
    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] };
    case "ADD_LIVE_REPORT":
      return { ...state, liveReports: [action.payload, ...state.liveReports].slice(0, 10) };
    case "UPDATE_REPORT_STATUS": {
      const updated = state.reports.map((r) =>
        r.id === action.payload.id ? { ...r, status: action.payload.status } : r
      );
      return { ...state, reports: updated };
    }
    case "REMOVE_REPORT":
      return { ...state, reports: state.reports.filter((r) => r.id !== action.payload) };
    case "SET_SOCKET_CONNECTED":
      return { ...state, socketConnected: action.payload };
    case "SOCKET_KPI_UPDATE":
      return { ...state, kpi: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadReports = useCallback(async () => {
    console.log("ENTER: AppContext.loadReports");
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await fetchReports();
      dispatch({ type: "SET_REPORTS", payload: data });
      console.log("SUCCESS: AppContext.loadReports complete");
    } catch (err) {
      console.error(`ERR-CTX-001: loadReports failed. ${err.message}`);
      dispatch({ type: "SET_ERROR", payload: err.message });
      window.alert(`ERR-CTX-001: Failed to load reports. ${err.message}`);
    }
  }, []);

  const loadKpi = useCallback(async () => {
    console.log("ENTER: AppContext.loadKpi");
    try {
      const data = await fetchKpi();
      dispatch({ type: "SET_KPI", payload: data });
      console.log("SUCCESS: AppContext.loadKpi complete");
    } catch (err) {
      console.error(`ERR-CTX-002: loadKpi failed. ${err.message}`);
    }
  }, []);

  useEffect(() => {
    console.log("INIT: AppContext mounting — loading initial data");
    loadReports();
    loadKpi();

    const socket = getSocket();

    socket.on("connect", () => {
      dispatch({ type: "SET_SOCKET_CONNECTED", payload: true });
      console.log("STATE_CHANGE: socketConnected=true");
    });

    socket.on("disconnect", () => {
      dispatch({ type: "SET_SOCKET_CONNECTED", payload: false });
      console.log("STATE_CHANGE: socketConnected=false");
    });

    socket.on("server:newReport", (report) => {
      console.log(`SOCKET_RECEIVED: server:newReport id=${report.id}`);
      dispatch({ type: "ADD_LIVE_REPORT", payload: report });
    });

    socket.on("server:statusUpdate", (update) => {
      console.log(`SOCKET_RECEIVED: server:statusUpdate reportId=${update.reportId}`);
      dispatch({ type: "UPDATE_REPORT_STATUS", payload: { id: update.reportId, status: update.newStatus } });
    });

    socket.on("server:kpiUpdate", (kpi) => {
      console.log("SOCKET_RECEIVED: server:kpiUpdate", kpi);
      dispatch({ type: "SOCKET_KPI_UPDATE", payload: kpi });
    });

    return () => {
      console.log("CLEANUP: AppContext unmounting socket listeners");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("server:newReport");
      socket.off("server:statusUpdate");
      socket.off("server:kpiUpdate");
    };
  }, [loadReports, loadKpi]);

  return (
    <AppContext.Provider value={{ state, dispatch, loadReports, loadKpi }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
