import { getStatusBadgeClass, getStatusDot } from "@/utils/helpers";

export default function StatusBadge({ status }) {
  return (
    <span className={getStatusBadgeClass(status)}>
      {getStatusDot(status)} {status}
    </span>
  );
}
