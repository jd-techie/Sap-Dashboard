export interface ReconciliationRecord {
  id: string;
  refNo: string;
  bankName: string;
  month: string;
  year: number;
  amount: number;
  status: "Completed" | "Pending" | "In Progress" | "Rejected";
  date: string;
}

export const reconciliationRecords: ReconciliationRecord[] = [
  {
    id: "1",
    refNo: "REF-2024-001",
    bankName: "HDFC Bank",
    month: "January",
    year: 2024,
    amount: 125000,
    status: "Completed",
    date: "15 Jan 2024",
  },
  {
    id: "2",
    refNo: "REF-2024-002",
    bankName: "ICICI Bank",
    month: "February",
    year: 2024,
    amount: 245500,
    status: "Pending",
    date: "20 Feb 2024",
  },
  {
    id: "3",
    refNo: "REF-2024-003",
    bankName: "SBI Bank",
    month: "March",
    year: 2024,
    amount: 375200,
    status: "In Progress",
    date: "10 Mar 2024",
  },
  {
    id: "4",
    refNo: "REF-2024-004",
    bankName: "Axis Bank",
    month: "April",
    year: 2024,
    amount: 195800,
    status: "Completed",
    date: "25 Apr 2024",
  },
  {
    id: "5",
    refNo: "REF-2024-005",
    bankName: "Kotak Bank",
    month: "May",
    year: 2024,
    amount: 420000,
    status: "Rejected",
    date: "05 May 2024",
  },
  {
    id: "6",
    refNo: "REF-2024-006",
    bankName: "Punjab National Bank",
    month: "June",
    year: 2024,
    amount: 285600,
    status: "In Progress",
    date: "12 Jun 2024",
  },
];
