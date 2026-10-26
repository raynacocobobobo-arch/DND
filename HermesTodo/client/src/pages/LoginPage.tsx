import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";
import { CloudSettings } from "../cloud/CloudSettings";
import { isCloudMode } from "../cloud/config";

export function LoginPage() {
  const { login, signup } = useAuth();
  const cloudMode = isCloudMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registration, setRegistration] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (cloudMode && registration) {
        const confirmationRequired = await signup(email.trim(), password);
        if (confirmationRequired) {
          setNotice("账户创建成功。请查收邮箱验证邮件，然后返回此页登录。");
          setRegistration(false);
        } else {
          setNotice("账户已创建并登录。");
        }
      } else {
        await login(password, cloudMode ? email.trim() : undefined);
      }
      setPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <picture className="login-art-picture">
        <source media="(max-width: 760px)" srcSet={String(import.meta.env.BASE_URL) + "art/hero-mobile.avif"} type="image/avif"/>
        <img className="login-scene" src={String(import.meta.env.BASE_URL) + "art/hero-desktop.avif"} alt="" decoding="async"/>
      </picture>
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true"><FleurDeLis size={37}/></div>
        <p className="eyebrow">{cloudMode ? "云端保存 · 跨设备同步" : "你的个人任务空间"}</p>
        <h1 id="login-title">HermesTodo</h1>
        <HeraldicDivider className="login-divider"/>
        <p className="login-intro">{cloudMode ? "使用邮箱账户登录。任务将保存在你的 Supabase 云数据库。" : "在电脑和手机上，安静地把事情理清楚。"}</p>
        <form onSubmit={submit} className="login-form">
          {cloudMode ? (
            <label htmlFor="cloud-email">邮箱
              <input id="cloud-email" name="email" type="email" autoComplete="email" value={email}
                onChange={event => setEmail(event.target.value)} required/>
            </label>
          ) : null}
          <label htmlFor="password">{cloudMode ? "账户密码" : "个人密码"}
            <input id="password" name="password" type="password"
              autoComplete={registration ? "new-password" : "current-password"}
              minLength={cloudMode ? 6 : undefined}
              value={password} onChange={event => setPassword(event.target.value)} required/>
          </label>
          {error ? <p role="alert" className="form-error">{error}</p> : null}
          {notice ? <p role="status" className="cloud-notice">{notice}</p> : null}
          <button type="submit" className="primary-button" disabled={submitting || !password || (cloudMode && !email.trim())}>
            {submitting ? "正在处理…" : cloudMode ? (registration ? "创建云端账户" : "登录云端账户") : "登录"}
          </button>
        </form>
        {cloudMode ? (
          <button type="button" className="cloud-mode-switch" onClick={() => { setRegistration(value => !value); setError(""); setNotice(""); }}>
            {registration ? "已有账户？返回登录" : "首次使用？创建账户"}
          </button>
        ) : null}
        <CloudSettings onLogin/>
        {cloudMode ? <p className="cloud-login-note">云端账户由 Supabase 管理。本地演示数据保留在当前浏览器，连接云端不会自动上传。</p> : null}
      </section>
    </main>
  );
}
