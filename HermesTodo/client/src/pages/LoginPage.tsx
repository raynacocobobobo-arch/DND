import { useState, type FormEvent } from "react";

import { useAuth } from "../auth/AuthProvider";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";

export function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(password);
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
        <source media="(max-width: 760px)" srcSet={`${import.meta.env.BASE_URL}art/hero-mobile.avif`} type="image/avif"/>
        <img className="login-scene" src={`${import.meta.env.BASE_URL}art/hero-desktop.avif`} alt="" decoding="async"/>
      </picture>
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true"><FleurDeLis size={37}/></div>
        <p className="eyebrow">你的个人任务空间</p>
        <h1 id="login-title">HermesTodo</h1>
        <HeraldicDivider className="login-divider"/>
        <p className="login-intro">在电脑和手机上，安静地把事情理清楚。</p>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="password">个人密码</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p role="alert" className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={submitting || !password}>
            {submitting ? "正在登录…" : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}
