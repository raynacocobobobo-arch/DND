import { Grid2X2, House, LogOut, Sparkles, type LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

const links = [
  { to: "/", label: "首页", end: true, icon: House },
  { to: "/contexts", label: "情境", end: false, icon: Grid2X2 },
  { to: "/ai", label: "AI", end: false, icon: Sparkles }
] satisfies Array<{ to: string; label: string; end: boolean; icon: LucideIcon }>;

export function AppShell() {
  const { logout } = useAuth();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <main className="app-content" id="main-content" tabIndex={-1}>
        <div className="app-utility-row">
          <button type="button" className="logout-button" aria-label="退出登录" onClick={() => void logout()}>
            <LogOut aria-hidden="true" size={18} />
          </button>
        </div>
        <Outlet />
      </main>
      <nav className="main-navigation floating-tab-bar" aria-label="主导航">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}
            >
              <link.icon aria-hidden="true" size={20} strokeWidth={2.2} />
              <span>{link.label}</span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
