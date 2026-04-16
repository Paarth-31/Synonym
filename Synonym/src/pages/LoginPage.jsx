import React, { useState } from 'react';
import { auth } from '../lib/api.js';
import s from './Auth.module.css';

export default function LoginPage({ onLogin, onSignup, onForgot }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !pass) { setErr('All fields required'); return; }
    setErr(''); setBusy(true);
    const res = await auth.login({ emailOrUsername: user, password: pass });
    setBusy(false);
    if (res.success) onLogin(res.data);
    else setErr(res.error || 'Login failed');
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>SYN<span>◆</span>NYM</div>
        <div className={s.tagline}>// intelligent file discovery</div>
        <h2 className={s.title}>Welcome back</h2>
        {err && <div className={s.err}>{err}</div>}
        <label className={s.label}>Username or Email</label>
        <input className={s.input} value={user} onChange={e=>setUser(e.target.value)} placeholder="Enter username or email" onKeyDown={e=>e.key==='Enter'&&submit()}/>
        <label className={s.label}>Password</label>
        <input className={s.input} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter password" onKeyDown={e=>e.key==='Enter'&&submit()}/>
        <button className={s.btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
        <button className={s.btnGhost}  onClick={onForgot}>Forgot password?</button>
        <p className={s.link}>No account? <button onClick={onSignup}>Create one →</button></p>
      </div>
    </div>
  );
}