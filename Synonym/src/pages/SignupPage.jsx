import React, { useState } from 'react';
import { auth } from '../lib/api.js';
import s from './Auth.module.css';

export default function SignupPage({ onLogin, onBack }) {
  const [f, setF] = useState({ name:'', email:'', username:'', pass:'', pass2:'' });
  const [err, setErr]       = useState('');
  const [strength, setStr]  = useState(0);
  const [busy, setBusy]     = useState(false);

  const update = k => e => {
    setF(p => ({ ...p, [k]: e.target.value }));
    if (k === 'pass') calcStrength(e.target.value);
  };

  const calcStrength = v => {
    let n = 0;
    if (v.length >= 8)           n++;
    if (/[A-Z]/.test(v))         n++;
    if (/[0-9]/.test(v))         n++;
    if (/[^a-zA-Z0-9]/.test(v)) n++;
    setStr(n);
  };

  const strColors = ['', '#ef4444', '#f97316', '#eab308', '#10b981'];
  const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const submit = async () => {
    setErr('');
    if (!f.name || !f.email || !f.username || !f.pass) { setErr('All fields required'); return; }
    if (!f.email.includes('@'))                          { setErr('Enter a valid email'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(f.username))       { setErr('Username: 3–20 alphanumeric chars'); return; }
    if (f.pass !== f.pass2)                              { setErr('Passwords do not match'); return; }
    if (f.pass.length < 8)                               { setErr('Password must be 8+ characters'); return; }
    setBusy(true);
    const res = await auth.register({ name: f.name, email: f.email, username: f.username, password: f.pass });
    if (!res.success) { setErr(res.error || 'Registration failed'); setBusy(false); return; }
    // Auto-login
    const lr = await auth.login({ emailOrUsername: f.username, password: f.pass });
    setBusy(false);
    if (lr.success) onLogin(lr.data); else onBack();
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>SYN<span>◆</span>NYM</div>
        <div className={s.tagline}>// create your account</div>
        <h2 className={s.title}>Get started</h2>
        {err && <div className={s.err}>{err}</div>}
        {['name','email','username'].map(k => (
          <React.Fragment key={k}>
            <label className={s.label}>{k === 'name' ? 'Full Name' : k.charAt(0).toUpperCase()+k.slice(1)}</label>
            <input className={s.input} value={f[k]} onChange={update(k)} placeholder={k === 'username' ? '3–20 alphanumeric characters' : ''}/>
          </React.Fragment>
        ))}
        <label className={s.label}>Password</label>
        <input className={s.input} type="password" value={f.pass} onChange={update('pass')} placeholder="8+ chars, mixed case, number"/>
        <div className={s.strengthWrap}>
          <div className={s.strengthBar} style={{ width: strength*25+'%', background: strColors[strength] }}/>
        </div>
        {strength > 0 && <div className={s.strengthLabel} style={{ color: strColors[strength] }}>{strLabels[strength]}</div>}
        <label className={s.label}>Confirm Password</label>
        <input className={s.input} type="password" value={f.pass2} onChange={update('pass2')} placeholder="Repeat password"/>
        <button className={s.btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Creating…' : 'Create Account'}</button>
        <button className={s.btnGhost}  onClick={onBack}>← Back to login</button>
      </div>
    </div>
  );
}