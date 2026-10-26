import { useState, type FormEvent } from "react";
import { clearCloudConfig, isCloudMode, readCloudConfig, saveCloudConfig } from "./config";

/** Runtime setup: works without GitHub Secrets or exposing database admin credentials. */
export function CloudSettings({ onLogin = false }: { onLogin?: boolean }) {
  const current = readCloudConfig();
  const [open, setOpen] = useState(false);
  // Public project configuration: publishable key is intended for browser use.
  // Never place secret/service_role credentials here.
  const defaultUrl = "https://arnrlepjuqdmvbipswci.supabase.co";
  const defaultKey = "sb_publishable_KIqNFyXWtQe8umuikfP6lQ_3MQrQzdt";
  const [url, setUrl] = useState(current?.url ?? defaultUrl);
  const [key, setKey] = useState(current?.publishableKey ?? defaultKey);
  const [error, setError] = useState("");
  if (import.meta.env.VITE_STATIC_PREVIEW !== "true") return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      saveCloudConfig(url, key);
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "云端配置无效");
    }
  }
  function demoMode() {
    clearCloudConfig();
    window.location.reload();
  }
  return (
    <>
      <button type="button" className={onLogin ? "cloud-login-settings" : "cloud-settings-trigger"}
        onClick={() => { setError(""); setOpen(true); }}>
        {isCloudMode() ? "云端设置" : "连接云端"}
      </button>
      {open ? (
        <div className="dialog-backdrop cloud-setup-overlay">
          <section className="form-dialog cloud-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="cloud-setup-title">
            <div className="dialog-heading">
              <h2 id="cloud-setup-title">Supabase 云端保存</h2>
              <button type="button" aria-label="关闭云端设置" onClick={() => setOpen(false)}>×</button>
            </div>
            <p>网站仍在 GitHub Pages，清单和任务由 Supabase 存储。连接后可使用邮箱账户跨设备同步。</p>
            <ol className="cloud-setup-steps">
              <li>在 <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase</a> 创建一个项目。</li>
              <li>在项目的 SQL Editor 中执行 <a href="https://github.com/raynacocobobobo-arch/DND/blob/feature/hermestodo-dashboard-subtasks-20261025/HermesTodo/supabase/schema.sql" target="_blank" rel="noreferrer">HermesTodo 初始化 SQL</a>，为每个账户开启数据隔离。</li>
              <li>从项目的 API 设置复制 <strong>Project URL</strong> 和 <strong>publishable key</strong>（旧项目也可使用 anon key）。</li>
            </ol>
            <form className="stacked-form" onSubmit={submit}>
              <label>Supabase Project URL
                <input type="url" autoComplete="off" placeholder="https://xxxxxxxx.supabase.co"
                  value={url} onChange={event => setUrl(event.target.value)} required />
              </label>
              <label>Publishable 公钥（禁止填写 secret / service_role）
                <input type="text" autoComplete="off" spellCheck={false} placeholder="sb_publishable_..."
                  value={key} onChange={event => setKey(event.target.value)} required />
              </label>
              {error ? <p role="alert" className="form-error">{error}</p> : null}
              <div className="dialog-actions">
                <button type="button" className="secondary-button" onClick={() => setOpen(false)}>取消</button>
                <button type="submit" className="primary-button">保存云端连接</button>
              </div>
            </form>
            <p className="cloud-setup-warning">当前浏览器的演示数据不会被删除，也不会未经确认自动上传。切回演示模式后仍可查看本地清单。</p>
            {isCloudMode() ? (
              <button type="button" className="cloud-reset-button" onClick={demoMode}>返回浏览器演示模式</button>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
