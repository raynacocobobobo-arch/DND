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
              <li>已为你连接项目 <strong>arnrlepjuqdmvbipswci</strong> 并初始化数据表，项目地址和公开密钥已预填。</li>
              <li>直接点击 <strong>保存云端连接</strong>，刷新后使用邮箱注册或登录。</li>
              <li>云端账户的数据与原演示数据彼此独立，原浏览器数据不会自动上传或删除。</li>
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
