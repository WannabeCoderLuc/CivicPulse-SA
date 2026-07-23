import toast from "react-hot-toast";

export function toastSuccess(message) {
  console.log(`TOAST_SUCCESS: ${message}`);
  toast.success(message, {
    style: {
      background: "#111827",
      color: "#D1FAE5",
      border: "1px solid #065F46",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
    },
    iconTheme: { primary: "#10B981", secondary: "#111827" },
    duration: 4000,
  });
}

export function toastError(errorCode, message) {
  console.error(`TOAST_ERROR: ${errorCode} — ${message}`);
  toast.error(`${errorCode}: ${message}`, {
    style: {
      background: "#111827",
      color: "#FEE2E2",
      border: "1px solid #7F1D1D",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
    },
    iconTheme: { primary: "#EF4444", secondary: "#111827" },
    duration: 6000,
  });
}

export function toastInfo(message) {
  console.log(`TOAST_INFO: ${message}`);
  toast(message, {
    style: {
      background: "#111827",
      color: "#BFDBFE",
      border: "1px solid #1E3A5F",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
    },
    icon: "??",
    duration: 4000,
  });
}
