import { LogOut } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";

function getUserInitials(name: string) {
  const segments = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!segments.length) {
    return "U";
  }

  return segments.map((part) => part[0].toUpperCase()).join("");
}

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">SAP Automation</h1>
      </div>

      <div className="flex items-center gap-4">
        <ChangePasswordDialog />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {getUserInitials(user?.name || "User")}
          </div>
        </div>

        <button
          className="p-2 hover:bg-muted rounded-lg transition-colors border-l border-border pl-4 ml-4"
          onClick={() => void logout()}
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
