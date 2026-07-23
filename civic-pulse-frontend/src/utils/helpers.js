import { STATUS_COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from "../mock/constants";

export function getStatusBadgeClass(status) {
  const map = {
    Urgent: "badge-urgent",
    "In Progress": "badge-in-progress",
    "Repair Started": "badge-in-progress",
    Completed: "badge-completed",
    Reported: "badge-reported",
    Verified: "badge-verified",
    Assigned: "badge-assigned",
  };
  return map[status] || "badge-reported";
}

export function getStatusDot(status) {
  const map = {
    Completed: "-",
    "In Progress": "-",
    "Repair Started": "-",
    Assigned: "-",
    Verified: "-",
    Urgent: "-",
    Reported: "-",
  };
  return map[status] || "-";
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || "#6B7280";
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || "#6B7280";
}

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || "";
}

export function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString) {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return dateString;
  }
}

export function createLeafletIcon(status, L) {
  const colorMap = {
    Completed: "#10B981",
    Urgent: "#EF4444",
    "Repair Started": "#F59E0B",
    Assigned: "#F59E0B",
    "In Progress": "#F59E0B",
    Verified: "#8B5CF6",
    Reported: "#3B82F6",
  };
  const color = colorMap[status] || "#6B7280";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:20px;height:20px;border-radius:50%;
        background:${color};border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
        cursor:pointer;transition:transform 0.15s;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}