import { Grid2X2, House, LogOut, Sparkles, type LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "./HeraldicArt";

const links = [
  { to: "/", label: "首页", end: true, icon: House },
  { to: "/contexts", label: "情境", end: false, icon: Grid2X2 },
  { to: "/ai", label: "AI", end: false, icon: Sparkles }
] satisfies Array<{ to: string; label: string; end: boolean; icon: LucideIcon }>;

export function AppShell() {
  const { logout } = useAuth();
  return (
    <div className="app-shell">
      {import.meta.env.VITE_STATIC_PREVIEW === "true" ? (
        <aside className="preview-banner" role="status">
          <FleurDeLis size={14}/> 独立预览 · 演示任务仅保存在本浏览器
        </aside>
      ) : null}
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <aside className="hermes-sidebar">
        <Link to="/" className="hermes-brand" aria-label="HermesTodo · 返回首页">
          <FleurDeLis className="brand-fleur" size={38}/>
          <span className="brand-name">HermesTodo</span>
          <span className="brand-subtitle">PERSONAL COMMAND DESK</span>
        </Link>
        <HeraldicDivider className="sidebar-divider"/>
        <span className="sidebar-nav-caption">工作台 / WORKSPACE</span>
        <nav className="main-navigation floating-tab-bar" aria-label="主导航">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
              <link.icon aria-hidden="true" size={19} strokeWidth={1.85}/>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-art" aria-hidden="true"><span className="sidebar-art-sigil">FORTITUDO</span></div>
        <div className="sidebar-motto"><HeraldicDivider/><p>井然有序，方能从容前行。</p><span>AD MAIORA · 向更高之处</span></div>
      </aside>
      <div className="hermes-main-frame">
        <div className="mobile-brand"><FleurDeLis size={22}/><span>HermesTodo</span></div>
        <main className="app-content" id="main-content" tabIndex={-1}>
          <div className="app-utility-row">
            <span className="app-edition"><span className="edition-dot"/> HERALDIC EDITION <span className="edition-separator">/</span> 你的个人任务空间</span>
            <button type="button" className="logout-button" aria-label="退出登录" title="退出登录"
              onClick={() => void logout()}><LogOut aria-hidden="true" size={17}/></button>
          </div>
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
