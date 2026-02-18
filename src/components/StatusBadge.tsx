import { cn } from "@/lib/utils";
import { getStatusColor } from "@/utils/formatters";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors = getStatusColor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded text-xs font-medium",
        colors.bg,
        colors.text
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
