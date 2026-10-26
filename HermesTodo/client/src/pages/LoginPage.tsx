import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";
import { isCloudMode } from "../cloud/config";

const PRIVATE_ACCOUNT_NAME = "rui";
const PRIVATE_ACCOUNT_EMAIL = "raynacocobobobo@gmail.com";

export function LoginPage() {
  const { login, sendMagicLink } = useAuth();
  const cloudMode = isCloudMode();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await login(password, cloudMode ? PRIVATE_ACCOUNT_EMAIL : undefined);
      setPassword("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "登录失败，请重试";
      setError(
        cloudMode && /Invalid login credentials|invalid.*credentials/i.test(message)
          ? "密码不正确。可以使用下方“邮件登录”进入一次，之后会自动保持登录。"
          : message
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function emailLogin() {
    setError("");
    setNotice("");
    setSendingLink(true);
    try {
      await sendMagicLink(PRIVATE_ACCOUNT_EMAIL);
      setNotice("登录邮件已发送。打开邮件并点一下登录链接即可；返回 HermesTodo 后会自动保持登录。");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登录邮件发送失败，请稍后重试");
    } finally {
      setSendingLink(false);
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
        <p className="eyebrow">{cloudMode ? "私人账户 · 一次登录，长期保持" : "你的个人任务空间"}</p>
        <h1 id="login-title">HermesTodo</h1>
        <HeraldicDivider className="login-divider"/>
        <p className="login-intro">
          {cloudMode ? "只保留最简单的登录。进入后会在这台设备上自动保持登录。" : "在电脑和手机上，安静地把事情理清楚。"}
        </p>
        <form onSubmit={submit} className="login-form">
          {cloudMode ? (
            <label htmlFor="username">用户名
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={PRIVATE_ACCOUNT_NAME}
                readOnly
              />
            </label>
          ) : null}
          <label htmlFor="password">{cloudMode ? "密码" : "个人密码"}
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus={cloudMode}
              required
            />
          </label>
          {error ? <p role="alert" className="form-error">{error}</p> : null}
          {notice ? <p role="status" className="cloud-notice">{notice}</p> : null}
          <button type="submit" className="primary-button" disabled={submitting || !password}>
            {submitting ? "正在登录…" : cloudMode ? "进入 HermesTodo" : "登录"}
          </button>
        </form>
        {cloudMode ? (
          <>
            <button
              type="button"
              className="login-recovery-link"
              disabled={sendingLink}
              onClick={() => void emailLogin()}
            >
              {sendingLink ? "正在发送…" : "首次登录 / 忘记密码？用邮件登录一次"}
            </button>
            <p className="login-persist-note">
              除非主动退出此设备或清除浏览器站点数据，否则无需重复登录。
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}
