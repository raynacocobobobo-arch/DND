import { HeraldicIcon } from "./HeraldicIcon";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "./HeraldicArt";

const links = [
  { to: "/", label: "清单", end: true, glyph: "grid" },
  { to: "/inbox", label: "收集箱", end: true, glyph: "inbox" },
  { to: "/ai", label: "AI", end: false, glyph: "star" }
] satisfies Array<{ to: string; label: string; end: boolean; glyph: string }>;

export function AppShell() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  return (
    <div className="app-shell" style={{
      "--art-skyline": `url("${import.meta.env.BASE_URL}art/gothic-architecture.avif")`,
      "--art-figure": `url("${import.meta.env.BASE_URL}art/standard-bearer-foreground.webp")`
    } as React.CSSProperties}>
      {import.meta.env.VITE_STATIC_PREVIEW === "true" ? (
        <aside className="preview-banner" role="status">
          <FleurDeLis size={14}/> 演示模式 · 任务仅保存在本浏览器
        </aside>
      ) : null}
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <aside className="hermes-sidebar">
        <Link to="/" className="hermes-brand" aria-label="HermesTodo · 返回清单首页">
          <FleurDeLis className="brand-fleur" size={38}/>
          <span className="brand-name"><span>HERMES</span><span>TODO</span></span>
          <span className="brand-subtitle">THE DAILY CHRONICLE</span>
        </Link>
        <HeraldicDivider className="sidebar-divider"/>
        <span className="sidebar-nav-caption">目录 / INDEX</span>
        <nav className="main-navigation floating-tab-bar" aria-label="主导航">
          {links.map((link) => {
            const active = link.to === "/"
              ? pathname === "/" || pathname === "/contexts" || pathname.startsWith("/contexts/")
              : pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                aria-current={active ? "page" : undefined}
                className={`nav-link${active ? " nav-link-active" : ""}`}>
                <HeraldicIcon name={link.glyph} size={24}/>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-art" aria-hidden="true"><span className="sidebar-art-sigil">FORTITUDO</span></div>
        <div className="sidebar-motto"><HeraldicDivider/><p>每一个微小行动，都值得被记下。</p><span>AD ASTRA · 走向星辰</span></div>
      </aside>
      <div className="hermes-main-frame">
        <div className="mobile-brand"><FleurDeLis size={22}/><span>HermesTodo</span></div>
        <main className="app-content" id="main-content" tabIndex={-1}>
          <div className="app-utility-row">
            <span className="app-edition"><span className="edition-dot"/> MANUSCRIPT EDITION <span className="edition-separator">/</span> 一册属于你的行动手稿</span>
            <button type="button" className="logout-button" aria-label="退出登录" title="退出登录"
              onClick={() => void logout()}><HeraldicIcon name="logout" size={19}/></button>
          </div>
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
