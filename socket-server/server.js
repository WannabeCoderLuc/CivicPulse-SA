const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const PORT = 3001;

const WARDS = ["Ward 7", "Ward 15", "Ward 28", "Ward 33", "Ward 64", "Ward 77", "Ward 90", "Ward 103"];
const CATEGORIES = ["Water", "Electricity", "Roads", "Waste", "Sewer"];
const STATUSES = ["Reported", "Verified", "Assigned", "Repair Started", "Completed", "Urgent"];
const ISSUE_TITLES = {
  Water: ["Burst Water Main", "Water Meter Theft", "Low Water Pressure", "Contaminated Water Supply"],
  Electricity: ["Street Light Outage", "Transformer Fault", "Power Surge Reported", "Exposed Live Wiring"],
  Roads: ["Pothole — Taxi Route", "Road Subsidence", "Storm Drain Blockage", "Traffic Light Failure"],
  Waste: ["Illegal Dumping Site", "Overflowing Skip Bins", "Missed Collection — Refuse", "Hazardous Waste Abandoned"],
  Sewer: ["Blocked Sewer Line", "Sewer Collapse", "Raw Sewage Overflow", "Manhole Cover Missing"],
};
const REPORTERS = [
  "Sipho Dlamini", "Zanele Mokoena", "Thabo Nkosi", "Lerato Sithole",
  "Nomsa Khumalo", "Andile Zulu", "Fatima Hendricks", "Precious Mahlangu",
  "Bongani Cele", "Piet van der Merwe", "Ayesha Adams", "Lungelo Buthelezi",
];

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let simulatedReportCounter = 1000;
let connectedClients = 0;

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCoords() {
  return {
    latitude: -33.9 + (Math.random() * 0.08 - 0.04),
    longitude: 18.41 + (Math.random() * 0.1 - 0.05),
  };
}

function generateLiveReport() {
  console.log("ENTER: generateLiveReport");
  try {
    const category = getRandomItem(CATEGORIES);
    const titles = ISSUE_TITLES[category];
    const coords = getRandomCoords();
    simulatedReportCounter++;

    const report = {
      id: simulatedReportCounter,
      title: getRandomItem(titles),
      description: `Citizen-reported incident in ${getRandomItem(WARDS)} requiring immediate municipal attention.`,
      category,
      status: getRandomItem(STATUSES),
      ward: getRandomItem(WARDS),
      latitude: coords.latitude,
      longitude: coords.longitude,
      reportedBy: getRandomItem(REPORTERS),
      imageUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSimulated: true,
    };

    console.log(`SUCCESS: generateLiveReport — id=${report.id} category=${category} ward=${report.ward}`);
    return report;
  } catch (err) {
    console.error(`ERR-SOCKET-001: generateLiveReport failed. ${err.message}`);
    return null;
  }
}

function generateStatusUpdate() {
  console.log("ENTER: generateStatusUpdate");
  try {
    const reportId = Math.floor(Math.random() * 10) + 1;
    const newStatus = getRandomItem(STATUSES);
    const stages = ["Reported", "Verified", "Assigned", "Repair Started", "Completed"];
    const stage = getRandomItem(stages);

    const update = {
      reportId,
      newStatus,
      timeline: {
        stage,
        note: `Status progressed to ${stage} by automated simulation`,
        performedBy: "System Simulation",
        timestamp: new Date().toISOString(),
      },
    };

    console.log(`SUCCESS: generateStatusUpdate — reportId=${reportId} newStatus=${newStatus}`);
    return update;
  } catch (err) {
    console.error(`ERR-SOCKET-002: generateStatusUpdate failed. ${err.message}`);
    return null;
  }
}

function generateKpiUpdate() {
  console.log("ENTER: generateKpiUpdate");
  try {
    const total = 10 + simulatedReportCounter - 1000;
    const resolved = Math.floor(total * (0.3 + Math.random() * 0.2));
    const inProgress = Math.floor(total * (0.2 + Math.random() * 0.15));
    const urgent = Math.floor(Math.random() * 4);
    const pending = total - resolved - inProgress - urgent;

    const kpi = {
      totalReports: total,
      resolved,
      pending: Math.max(0, pending),
      inProgress,
      urgent,
    };

    console.log(`SUCCESS: generateKpiUpdate — total=${total} resolved=${resolved}`);
    return kpi;
  } catch (err) {
    console.error(`ERR-SOCKET-003: generateKpiUpdate failed. ${err.message}`);
    return null;
  }
}

io.on("connection", (socket) => {
  connectedClients++;
  console.log(`SOCKET_CLIENT_CONNECTED: id=${socket.id} totalClients=${connectedClients}`);

  socket.emit("server:welcome", {
    message: "Connected to CivicPulse SA Live Feed",
    timestamp: new Date().toISOString(),
    socketId: socket.id,
  });

  socket.on("client:subscribe", (data) => {
    console.log(`SOCKET_SUBSCRIBE: client=${socket.id} data=${JSON.stringify(data)}`);
    socket.emit("server:subscribed", { status: "ok", subscribedTo: data });
  });

  socket.on("client:reportSubmitted", (report) => {
    console.log(`SOCKET_REPORT_SUBMITTED: Broadcasting new citizen report from client=${socket.id}`);
    try {
      socket.broadcast.emit("server:newReport", { ...report, broadcastedAt: new Date().toISOString() });
      console.log("SOCKET_BROADCAST_SENT: server:newReport broadcasted to all peers");
    } catch (err) {
      console.error(`ERR-SOCKET-004: client:reportSubmitted broadcast failed. ${err.message}`);
    }
  });

  socket.on("client:statusUpdated", (update) => {
    console.log(`SOCKET_STATUS_UPDATE: Broadcasting status update from client=${socket.id}`);
    try {
      socket.broadcast.emit("server:statusUpdate", { ...update, broadcastedAt: new Date().toISOString() });
      console.log("SOCKET_BROADCAST_SENT: server:statusUpdate broadcasted to all peers");
    } catch (err) {
      console.error(`ERR-SOCKET-005: client:statusUpdated broadcast failed. ${err.message}`);
    }
  });

  socket.on("disconnect", (reason) => {
    connectedClients = Math.max(0, connectedClients - 1);
    console.log(`SOCKET_CLIENT_DISCONNECTED: id=${socket.id} reason=${reason} totalClients=${connectedClients}`);
  });

  socket.on("error", (err) => {
    console.error(`ERR-SOCKET-006: Socket error on client=${socket.id}. ${err.message}`);
  });
});

let liveReportInterval = null;
let statusUpdateInterval = null;
let kpiInterval = null;

function startSimulation() {
  console.log("ENTER: startSimulation — initiating live data broadcast loops");

  liveReportInterval = setInterval(() => {
    if (connectedClients === 0) return;
    const report = generateLiveReport();
    if (report) {
      io.emit("server:newReport", report);
      console.log(`SOCKET_BROADCAST_SENT: server:newReport id=${report.id} to ${connectedClients} client(s)`);
    }
  }, 12000);

  statusUpdateInterval = setInterval(() => {
    if (connectedClients === 0) return;
    const update = generateStatusUpdate();
    if (update) {
      io.emit("server:statusUpdate", update);
      console.log(`SOCKET_BROADCAST_SENT: server:statusUpdate reportId=${update.reportId} to ${connectedClients} client(s)`);
    }
  }, 8000);

  kpiInterval = setInterval(() => {
    if (connectedClients === 0) return;
    const kpi = generateKpiUpdate();
    if (kpi) {
      io.emit("server:kpiUpdate", kpi);
      console.log(`SOCKET_BROADCAST_SENT: server:kpiUpdate totalReports=${kpi.totalReports} to ${connectedClients} client(s)`);
    }
  }, 5000);

  console.log("SUCCESS: Simulation intervals started (Reports:12s, Status:8s, KPI:5s)");
}

app.get("/health", (req, res) => {
  console.log("ENTER: GET /health");
  res.json({ status: "ok", service: "CivicPulse SA Socket Server", connectedClients, timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`SUCCESS: CivicPulse SA Socket Server running on http://localhost:${PORT}`);
  startSimulation();
});

process.on("uncaughtException", (err) => {
  console.error(`ERR-SOCKET-FATAL-001: Uncaught exception. ${err.message}`);
});

process.on("unhandledRejection", (reason) => {
  console.error(`ERR-SOCKET-FATAL-002: Unhandled promise rejection. ${reason}`);
});
