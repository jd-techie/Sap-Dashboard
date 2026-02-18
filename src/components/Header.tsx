import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">SAP Automation</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            JD
          </div>
        </div>

        {/* Logout */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors border-l border-border pl-4 ml-4">
          <LogOut className="w-5 h-5 text-foreground" onClick={() => navigate("/login")} />
        </button>
      </div>
    </header>
  );
};

export default Header;
