// import React, { useState } from 'react';
// import { auth } from '../lib/api.js';
// import s from './ProfileModal.module.css';

// export default function ProfileModal({ session, onClose, onLogout }) {
//   const [newPass, setNewPass] = useState('');
//   const [msg, setMsg] = useState({ text:'', ok:false });
//   const [busy, setBusy] = useState(false);

//   const save = async () => {
//     if (!newPass) { onClose(); return; }
//     if (newPass.length < 8) { setMsg({ text:'Password must be 8+ characters', ok:false }); return; }
//     setBusy(true);
//     const res = await auth.updatePassword({ email: session.email, newPassword: newPass });
//     setBusy(false);
//     if (res.success) {
//       setMsg({ text:'✓ Password updated', ok:true });
//       setTimeout(onClose, 1200);
//     } else {
//       setMsg({ text: res.error || 'Update failed', ok:false });
//     }
//   };

//   return (
//     <div className={s.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
//       <div className={s.modal}>
//         <div className={s.header}>
//           <h3>My Profile</h3>
//           <button className={s.close} onClick={onClose}>✕</button>
//         </div>
//         <div className={s.body}>
//           {/* Avatar + name */}
//           <div className={s.avatarRow}>
//             <div className={s.avatar}>{(session?.name||'U')[0].toUpperCase()}</div>
//             <div>
//               <div className={s.name}>{session?.name}</div>
//               <div className={s.email}>{session?.email}</div>
//             </div>
//           </div>
//           {/* Info */}
//           <div className={s.field}><label>Username</label><input readOnly value={session?.username||''}/></div>
//           <div className={s.field}><label>Member since</label><input readOnly value="IIIT Allahabad"/></div>
//           {/* Change password */}
//           <div className={s.divider}/>
//           <div className={s.field}>
//             <label>New Password</label>
//             <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Leave blank to keep current"/>
//           </div>
//           {msg.text && <div className={s.msg} style={{color:msg.ok?'var(--emerald)':'var(--rose)'}}>{msg.text}</div>}
//         </div>
//         <div className={s.footer}>
//           <button className={s.logoutBtn} onClick={onLogout}>Log out</button>
//           <button className={s.saveBtn}   onClick={save} disabled={busy}>{busy?'Saving…':'Save Changes'}</button>
//         </div>
//       </div>
//     </div>
//   );
// }



import React from 'react';
import s from './ProfileModal.module.css';

// With login removed, this becomes a simple About/Settings panel
export default function ProfileModal({ onClose }) {
  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.header}>
          <h3>About Synonym</h3>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>
          {/* Logo */}
          <div className={s.aboutLogo}>
            <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
              <defs>
                <radialGradient id="acg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#4DD8E0"/><stop offset="100%" stopColor="#1565C0"/></radialGradient>
                <radialGradient id="ang" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#26C6DA"/><stop offset="100%" stopColor="#0D47A1"/></radialGradient>
              </defs>
              {[[50,50,50,18],[50,50,78,28],[50,50,82,58],[50,50,60,82],[50,50,24,78],[50,50,18,48],[50,50,28,22]].map(([x1,y1,x2,y2],i)=>(
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1E88E5" strokeWidth="2" strokeOpacity="0.7"/>
              ))}
              <circle cx="50" cy="50" r="10" fill="url(#acg)"/>
              {[[50,18],[78,28],[82,58],[60,82],[24,78],[18,48],[28,22]].map(([cx,cy],i)=>(
                <circle key={i} cx={cx} cy={cy} r="5.5" fill="url(#ang)"/>
              ))}
            </svg>
            <div>
              <div className={s.aboutName}>SYNONYM</div>
              <div className={s.aboutSub}>Human Centric File Explorer</div>
            </div>
          </div>

          <div className={s.infoRow}><span>Version</span><span>2.0.0</span></div>
          <div className={s.infoRow}><span>Built by</span><span>IIIT Allahabad</span></div>
          <div className={s.infoRow}><span>Team</span><span>Kshitij · Paarth · Sarthak · Utkarsh</span></div>
          <div className={s.infoRow}><span>Course</span><span>Software Engineering — 3rd Semester</span></div>

          <div className={s.divider}/>

          <p className={s.desc}>
            Synonym replaces the folder-file hierarchy with an AI-driven semantic explorer.
            Files are analyzed, classified by genre, and clustered by similarity —
            making discovery natural rather than structural.
          </p>
        </div>
        <div className={s.footer}>
          <button className={s.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}