(() => {
  'use strict';

  const SUPABASE_URL = 'https://arnrlepjuqdmvbipswci.supabase.co';
  const PUBLIC_KEY = 'sb_publishable_KIqNFyXWtQe8umuikfP6lQ_3MQrQzdt';
  const SESSION_KEY = 'hermestodo-supabase-session-v1';
  const EXPECTED_EMAIL = 'raynacocobobobo@gmail.com';

  const status = document.getElementById('status');
  const account = document.getElementById('account');
  const form = document.getElementById('password-form');
  const password = document.getElementById('new-password');
  const confirmation = document.getElementById('confirm-password');
  const submit = document.getElementById('submit-password');
  const nonceArea = document.getElementById('nonce-area');
  const nonce = document.getElementById('nonce');
  const sendNonce = document.getElementById('send-nonce');

  function message(text, error = false) {
    status.textContent = text;
    status.dataset.kind = error ? 'error' : 'info';
  }

  function getSession() {
    let session;
    try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
    if (!session || session.project_url !== SUPABASE_URL ||
        !session.access_token || !session.refresh_token ||
        !session.user_id || !Number.isFinite(Number(session.expires_at))) return null;
    return session;
  }

  async function authRequest(route, method = 'GET', token = '', body) {
    const response = await fetch(SUPABASE_URL + '/auth/v1/' + route, {
      method,
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      headers: {
        apikey: PUBLIC_KEY,
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const text = String(data.msg || data.message || data.error_description ||
                          data.error || '请求失败（HTTP ' + response.status + '）');
      const error = new Error(text);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function currentSession() {
    let session = getSession();
    if (!session) throw new Error('请先返回 Hermes To Do，通过邮件链接登录原账户。');
    if (Number(session.expires_at) > Date.now() / 1000 + 75) return session;
    try {
      const data = await authRequest('token?grant_type=refresh_token', 'POST', '', {
        refresh_token: session.refresh_token
      });
      if (!data.access_token || !data.refresh_token) throw new Error('刷新登录状态失败');
      session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
        user_id: data.user?.id || session.user_id,
        project_url: SUPABASE_URL
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      throw new Error('登录已经过期。请返回 Hermes To Do，再通过邮件链接登录一次。');
    }
  }

  async function checkedSession() {
    const session = await currentSession();
    const user = await authRequest('user', 'GET', session.access_token);
    if (!user.id || user.id !== session.user_id ||
        String(user.email || '').toLowerCase() !== EXPECTED_EMAIL) {
      throw new Error('当前登录身份与 Hermes To Do 账户不符，已停止修改。');
    }
    return { session, user };
  }

  async function initialize() {
    try {
      const { user } = await checkedSession();
      account.textContent = user.email;
      form.hidden = false;
      message('身份验证成功。请在下方设置新密码。');
    } catch (error) {
      form.hidden = true;
      message(error.message || '无法验证登录状态，请重新登录。', true);
    }
  }

  sendNonce.addEventListener('click', async () => {
    sendNonce.disabled = true;
    message('正在向绑定邮箱发送安全验证码…');
    try {
      const { session } = await checkedSession();
      await authRequest('reauthenticate', 'POST', session.access_token, {});
      message('验证码已发送至绑定邮箱。填写验证码后再提交新密码。');
      nonce.focus();
    } catch (error) {
      message('发送验证码失败：' + error.message, true);
    } finally {
      sendNonce.disabled = false;
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const next = password.value;
    if (next.length < 12 || next.length > 128) {
      message('新密码建议使用 12–128 个字符。', true);
      password.focus();
      return;
    }
    if (next !== confirmation.value) {
      message('两次输入的密码不一致。', true);
      confirmation.focus();
      return;
    }
    submit.disabled = true;
    message('正在验证账户并更新密码…');
    try {
      const { session } = await checkedSession();
      const payload = { password: next };
      if (nonce.value.trim()) payload.nonce = nonce.value.trim();
      await authRequest('user', 'PUT', session.access_token, payload);
      form.reset();
      form.hidden = true;
      message('新密码已设置成功。现在可以返回 Hermes To Do，今后使用新密码登录。');
      account.textContent = EXPECTED_EMAIL + ' · 已完成修改';
    } catch (error) {
      const explanation = error.message || '未知错误';
      if (/reauth|nonce|security|recent|mfa/i.test(explanation)) {
        nonceArea.hidden = false;
        message('系统要求额外的安全验证。请发送邮箱验证码并填写后重试：' + explanation, true);
      } else {
        message('密码尚未修改：' + explanation, true);
      }
    } finally {
      submit.disabled = false;
    }
  });

  initialize();
})();