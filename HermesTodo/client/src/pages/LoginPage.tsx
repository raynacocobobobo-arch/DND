import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";
import { CloudSettings } from "../cloud/CloudSettings";
import { isCloudMode } from "../cloud/config";

export function LoginPage() {
  const { login, signup, sendMagicLink, acceptMagicLink } = useAuth();
  const cloudMode = isCloudMode();
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("hermestodo-last-login-email") ?? ""; } catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"magic" | "password">("magic");
  const [registration, setRegistration] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [magicLink, setMagicLink] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const magicMode = cloudMode && loginMethod === "magic" && !registration;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (cloudMode) {
        try { localStorage.setItem("hermestodo-last-login-email", email.trim()); } catch { /* convenience only */ }
      }
      if (magicMode) {
        if (mailSent) {
          await acceptMagicLink(magicLink.trim());
        } else {
          await sendMagicLink(email.trim());
          setMailSent(true);
          setNotice("登录邮件已发送。请在邮件中复制 Sign in 链接地址，粘贴到下方输入框，然后点击登录。不要先点击链接，以免跳转到 localhost。");
        }
      } else if (cloudMode && registration) {
        const confirmationRequired = await signup(email.trim(), password);
        if (confirmationRequired) {
          setNotice("账户创建成功。请完成邮箱验证，然后返回这里使用免密码登录。");
          setRegistration(false);
          setLoginMethod("magic");
        } else {
          setNotice("账户已创建并登录。");
        }
      } else {
        await login(password, cloudMode ? email.trim() : undefined);
      }
      if (!magicMode) setPassword("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "登录失败，请重试";
      setError(message.includes("Invalid login credentials")
        ? "邮箱或密码不正确。建议切换邮箱免密码登录，无需重新注册。"
        : message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMethod() {
    setRegistration(false);
    setMailSent(false);
    setMagicLink("");
    setError("");
    setNotice("");
    setLoginMethod(value => value === "magic" ? "password" : "magic");
  }

  return (
    <main className="login-page">
      <picture className="login-art-picture">
        <source media="(max-width: 760px)" srcSet={String(import.meta.env.BASE_URL) + "art/hero-mobile.avif"} type="image/avif"/>
        <img className="login-scene" src={String(import.meta.env.BASE_URL) + "art/hero-desktop.avif"} alt="" decoding="async"/>
      </picture>
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true"><FleurDeLis size={37}/></div>
        <p className="eyebrow">{cloudMode ? "云端保存 · 登录一次，自动保持" : "你的个人任务空间"}</p>
        <h1 id="login-title">HermesTodo</h1>
        <HeraldicDivider className="login-divider"/>
        <p className="login-intro">{cloudMode ? "使用你的专属云端账户。首次登录后，后续会自动恢复登录状态。" : "在电脑和手机上，安静地把事情理清楚。"}</p>
        <form onSubmit={submit} className="login-form">
          {cloudMode ? (
            <label htmlFor="cloud-email">邮箱
              <input id="cloud-email" name="email" type="email" autoComplete="email" value={email}
                onChange={event => { setEmail(event.target.value); setMailSent(false); setMagicLink(""); }} required/>
            </label>
          ) : null}
          {magicMode ? (
            mailSent ? (
              <label htmlFor="cloud-magic-link">粘贴邮件中的原始登录链接
                <textarea id="cloud-magic-link" className="cloud-magic-link-input" autoComplete="off"
                  placeholder="https://arnrlepjuqdmvbipswci.supabase.co/auth/v1/verify?token=..."
                  value={magicLink} onChange={event => setMagicLink(event.target.value)} rows={3} required />
              </label>
            ) : (
              <p className="cloud-login-hint">不记得原来的密码也可以登录。登录邮件仅发送至此邮箱。</p>
            )
          ) : (
            <label htmlFor="password">{cloudMode ? "账户密码" : "个人密码"}
              <input id="password" name="password" type="password"
                autoComplete={registration ? "new-password" : "current-password"}
                minLength={cloudMode ? 6 : undefined}
                value={password} onChange={event => setPassword(event.target.value)} required/>
            </label>
          )}
          {error ? <p role="alert" className="form-error">{error}</p> : null}
          {notice ? <p role="status" className="cloud-notice">{notice}</p> : null}
          <button type="submit" className="primary-button"
            disabled={submitting || (cloudMode && !email.trim()) || (magicMode ? mailSent && !magicLink.trim() : !password)}>
            {submitting ? "正在处理…" : magicMode ? (mailSent ? "验证邮件链接并登录" : "发送免密码登录邮件")
              : cloudMode ? (registration ? "创建云端账户" : "登录云端账户") : "登录"}
          </button>
        </form>
        {cloudMode ? (
          <div className="cloud-login-methods">
            <button type="button" className="cloud-mode-switch" onClick={switchMethod}>
              {magicMode ? "使用密码登录" : "邮箱免密码登录"}
            </button>
            {!magicMode ? (
              <button type="button" className="cloud-mode-switch"
                onClick={() => { setRegistration(value => !value); setLoginMethod("password"); setError(""); setNotice(""); }}>
                {registration ? "已有账户？返回登录" : "首次使用？创建账户"}
              </button>
            ) : null}
            {magicMode && mailSent ? (
              <button type="button" className="cloud-mode-switch"
                onClick={() => { setMailSent(false); setMagicLink(""); setError(""); setNotice(""); }}>
                重新发送登录邮件
              </button>
            ) : null}
          </div>
        ) : null}
        <CloudSettings onLogin/>
        {cloudMode ? <p className="cloud-login-note">登录后清单保存在 Supabase 云数据库；同一浏览器自动保持登录。请勿将邮件验证链接发送给任何人。</p> : null}
      </section>
    </main>
  );
}
