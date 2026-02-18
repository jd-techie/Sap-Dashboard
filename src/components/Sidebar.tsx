import { useState } from "react";
import { Settings, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Settings className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-semibold">SAP</h1>
            <p className="text-xs opacity-90">Automation</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground transition-colors">
          <FileText className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">BRS Reconciliation</span>}
        </button>
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 p-4 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
