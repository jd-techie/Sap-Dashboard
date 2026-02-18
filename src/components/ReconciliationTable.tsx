import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Save, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import StatusBadge from "./StatusBadge";
import { reconciliationRecords } from "@/constants/reconciliationData";
import { formatCurrency } from "@/utils/formatters";

const ReconciliationTable = () => {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    completed: true,
    pending: true,
    inProgress: true,
    rejected: true,
  });
  
  // Filter records based on checkbox selection (active/inactive) and status
  const filteredRecords = reconciliationRecords.filter((record) => {
    // Filter by checkbox selection (Active = checked, Inactive = unchecked)
    const isChecked = selectedRecords.includes(record.id);
    if (showActiveOnly && !isChecked) return false;
    if (showInactiveOnly && isChecked) return false;
    
    // Filter by status
    if (record.status === "Completed" && !statusFilters.completed) return false;
    if (record.status === "Pending" && !statusFilters.pending) return false;
    if (record.status === "In Progress" && !statusFilters.inProgress) return false;
    if (record.status === "Rejected" && !statusFilters.rejected) return false;
    
    return true;
  });
  
  const totalRecords = filteredRecords.length;
  const recordsPerPage = 6;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredRecords.map((r) => r.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, id]);
    } else {
      setSelectedRecords(selectedRecords.filter((recordId) => recordId !== id));
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">BRS Reconciliation</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select records to process
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="space-y-5">
              {/* Filter by Active/Inactive (based on checkbox selection) */}
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-3">Filter by Selection</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-active"
                      checked={showActiveOnly}
                      onCheckedChange={(checked) => {
                        setShowActiveOnly(checked as boolean);
                        if (checked) setShowInactiveOnly(false);
                      }}
                    />
                    <label
                      htmlFor="show-active"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Show Active Only (Checked)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-inactive"
                      checked={showInactiveOnly}
                      onCheckedChange={(checked) => {
                        setShowInactiveOnly(checked as boolean);
                        if (checked) setShowActiveOnly(false);
                      }}
                    />
                    <label
                      htmlFor="show-inactive"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Show Inactive Only (Unchecked)
                    </label>
                  </div>
                </div>
              </div>

              {/* Filter by Status */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-sm text-foreground mb-3">Filter by Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-completed"
                      checked={statusFilters.completed}
                      onCheckedChange={(checked) =>
                        setStatusFilters({ ...statusFilters, completed: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="status-completed"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Completed
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-pending"
                      checked={statusFilters.pending}
                      onCheckedChange={(checked) =>
                        setStatusFilters({ ...statusFilters, pending: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="status-pending"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Pending
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-inprogress"
                      checked={statusFilters.inProgress}
                      onCheckedChange={(checked) =>
                        setStatusFilters({ ...statusFilters, inProgress: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="status-inprogress"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      In Progress
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-rejected"
                      checked={statusFilters.rejected}
                      onCheckedChange={(checked) =>
                        setStatusFilters({ ...statusFilters, rejected: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="status-rejected"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Rejected
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={
                    selectedRecords.length === filteredRecords.length &&
                    filteredRecords.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ref. No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bank Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRecord(record.id, checked as boolean)
                    }
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {record.refNo}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {record.bankName}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {record.month}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{record.year}</td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {formatCurrency(record.amount)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{record.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-6 of {totalRecords} records
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "ghost"}
              size="icon"
              onClick={() => setCurrentPage(i + 1)}
              className="w-10 h-10"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-center gap-4">
        <Button variant="outline" className="gap-2 px-8">
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button className="gap-2 px-8">
          <Send className="w-4 h-4" />
          Submit
        </Button>
      </div>
    </div>
  );
};

export default ReconciliationTable;
