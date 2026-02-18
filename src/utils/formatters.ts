export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const getStatusColor = (
  status: string
): { bg: string; text: string } => {
  switch (status) {
    case "Completed":
      return { bg: "bg-status-completed-bg", text: "text-status-completed" };
    case "Pending":
      return { bg: "bg-status-pending-bg", text: "text-status-pending" };
    case "In Progress":
      return { bg: "bg-status-inprogress-bg", text: "text-status-inprogress" };
    case "Rejected":
      return { bg: "bg-status-rejected-bg", text: "text-status-rejected" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground" };
  }
};
