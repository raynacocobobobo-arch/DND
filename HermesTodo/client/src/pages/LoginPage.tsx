import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";
import { isCloudMode } from "../cloud/config";

const PRIVATE_ACCOUNT_NAME = "rui";
const PRIVATE_ACCOUNT_EMAIL = "raynacocobobobo@gmail.com";

export function LoginPage() {
  const { login } = useAuth();
  const cloudMode = isCloudMode();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(password, cloudMode ? PRIVATE_ACCOUNT_EMAIL : undefined);
      setPassword("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "登录失败，请重试";
      setError(
        cloudMode && /Invalid login credentials|invalid.*credentials/i.test(message)
          ? "密码不正确，请重试"
          : message
      );
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
          <button type="submit" className="primary-button" disabled={submitting || !password}>
            {submitting ? "正在登录…" : cloudMode ? "进入 HermesTodo" : "登录"}
          </button>
        </form>
        {cloudMode ? (
          <p className="login-persist-note">
            除非主动退出此设备或清除浏览器站点数据，否则无需重复登录。
          </p>
        ) : null}
      </section>
    </main>
  );
}
