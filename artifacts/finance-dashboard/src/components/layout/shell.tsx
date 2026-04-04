import { Link, useLocation } from "wouter";
import { useRole } from "@/lib/role-context";
import { LayoutDashboard, ArrowRightLeft, Lightbulb, Activity, UserCog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const { role, setRole } = useRole();

  const navigation = [
    { name: "Terminal", href: "/", icon: LayoutDashboard },
    { name: "Ledger", href: "/transactions", icon: ArrowRightLeft },
    { name: "Alpha", href: "/insights", icon: Lightbulb },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground dark">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Activity className="w-5 h-5 text-primary mr-3" />
          <span className="font-mono font-bold tracking-tight text-lg text-primary uppercase">
            FN_CORE
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
          <div className="px-3 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Modules
          </div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2 px-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <UserCog className="w-3 h-3" />
            Access Level
          </div>
          <Select value={role} onValueChange={(val: any) => setRole(val)}>
            <SelectTrigger className="w-full bg-secondary/50 border-border focus:ring-primary">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Administrator</SelectItem>
              <SelectItem value="Viewer">Read-Only Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8 justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold tracking-tight">
              {navigation.find((n) => n.href === location)?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary uppercase">System Online</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
