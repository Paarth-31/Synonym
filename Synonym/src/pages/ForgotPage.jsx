import React, { useState } from 'react';
import { auth } from '../lib/api.js';
import s from './Auth.module.css';

export default function ForgotPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [pass2, setPass2] = useState('');
  const [msg,   setMsg]   = useState({ text: '', ok: false });
  const [busy,  setBusy]  = useState(false);

  const submit = async () => {
    if (!email || !pass)   { setMsg({ text: 'All fields required', ok: false }); return; }
    if (pass !== pass2)    { setMsg({ text: 'Passwords do not match', ok: false }); return; }
    if (pass.length < 8)   { setMsg({ text: 'Password must be 8+ characters', ok: false }); return; }
    setBusy(true);
    const res = await auth.updatePassword({ email, newPassword: pass });
    setBusy(false);
    if (res.success) { setMsg({ text: '✓ Password updated!', ok: true }); setTimeout(onBack, 1500); }
    else setMsg({ text: res.error || 'Update failed', ok: false });
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>SYN<span>◆</span>NYM</div>
        <div className={s.tagline}>// reset your password</div>
        <h2 className={s.title}>Reset password</h2>
        {msg.text && <div className={s.err} style={{ color: msg.ok ? 'var(--emerald)' : 'var(--rose)' }}>{msg.text}</div>}
        <label className={s.label}>Email</label>
        <input className={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Account email"/>
        <label className={s.label}>New Password</label>
        <input className={s.input} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="New password"/>
        <label className={s.label}>Confirm New Password</label>
        <input className={s.input} type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Repeat new password"/>
        <button className={s.btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Updating…' : 'Reset Password'}</button>
        <button className={s.btnGhost}  onClick={onBack}>← Back to login</button>
      </div>
    </div>
  );
}