// // import React, { useEffect, useState } from 'react';
// // import { fs } from '../lib/api.js';
// // import s from './Sidebar.module.css';

// // export default function Sidebar({ currentPath, bookmarks, onNavigate, onAddBookmark, onDiscovery, onAllAnalyzed }) {
// //   const [paths, setPaths] = useState({ home:'', desktop:'', docs:'', downloads:'' });

// //   useEffect(() => {
// //     fs.homeDir().then(home => {
// //       const sep = home.includes('\\') ? '\\' : '/';
// //       setPaths({ home, desktop: home+sep+'Desktop', docs: home+sep+'Documents', downloads: home+sep+'Downloads' });
// //     });
// //   }, []);

// //   const NavItem = ({ id, label, icon, targetPath }) => (
// //     <div className={`${s.item} ${currentPath===targetPath?s.active:''}`} onClick={()=>onNavigate(targetPath)}>
// //       {icon}<span>{label}</span>
// //     </div>
// //   );

// //   return (
// //     <aside className={s.sidebar}>
// //       <div className={s.section}>
// //         <div className={s.sectionLabel}>Quick Access</div>
// //         <NavItem label="Home"      targetPath={paths.home}      icon={<HomeIcon/>}/>
// //         <NavItem label="Desktop"   targetPath={paths.desktop}   icon={<DesktopIcon/>}/>
// //         <NavItem label="Documents" targetPath={paths.docs}      icon={<DocIcon/>}/>
// //         <NavItem label="Downloads" targetPath={paths.downloads} icon={<DownloadIcon/>}/>
// //       </div>

// //       <div className={s.divider}/>

// //       <div className={s.section}>
// //         <div className={s.sectionLabel}>AI Features</div>
// //         <div className={s.aiBtn} onClick={onDiscovery}>
// //           <div className={s.aiDot}/> Discovery Mode
// //         </div>
// //         <div className={s.aiBtn} onClick={onAllAnalyzed}>
// //           <div className={s.aiDot}/> All Analyzed Files
// //         </div>
// //       </div>

// //       <div className={s.divider}/>

// //       <div className={s.section}>
// //         <div className={s.sectionLabel}>Bookmarks</div>
// //         {bookmarks.map((b, i) => {
// //           const label = b.split('/').pop() || b.split('\\').pop() || b;
// //           return (
// //             <div key={i} className={s.bookmark} onClick={()=>onNavigate(b)} title={b}>
// //               <BookmarkIcon/> <span>{label}</span>
// //             </div>
// //           );
// //         })}
// //         <button className={s.addBookmark} onClick={onAddBookmark}>
// //           <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
// //           Bookmark this folder
// //         </button>
// //       </div>
// //     </aside>
// //   );
// // }

// // const HomeIcon     = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
// // const DesktopIcon  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
// // const DocIcon      = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
// // const DownloadIcon = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
// // const BookmarkIcon = () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;




// import React, { useEffect, useState } from 'react';
// import { fs } from '../lib/api.js';
// import s from './Sidebar.module.css';

// export default function Sidebar({ currentPath, bookmarks, onNavigate, onAddBookmark, onDiscovery, onAllAnalyzed }) {
//   const [quickPaths, setQuickPaths] = useState([]);
//   const [drives, setDrives]         = useState([]);
//   const [drivesOpen, setDrivesOpen] = useState(false);

//   useEffect(() => {
//     // Load home dir quick links
//     fs.homeDir().then(home => {
//       const sep = home.includes('\\') ? '\\' : '/';
//       setQuickPaths([
//         { label: 'Home',      path: home,                      icon: <HomeIcon/> },
//         { label: 'Desktop',   path: home + sep + 'Desktop',    icon: <DesktopIcon/> },
//         { label: 'Documents', path: home + sep + 'Documents',  icon: <DocIcon/> },
//         { label: 'Downloads', path: home + sep + 'Downloads',  icon: <DownloadIcon/> },
//       ]);
//     });

//     // Load all available drives (WSL + Windows)
//     fs.getDrives().then(d => setDrives(d || []));
//   }, []);

//   return (
//     <aside className={s.sidebar}>

//       {/* Logo */}
//       <div className={s.logoArea}>
//         <LogoMark />
//         <div>
//           <div className={s.logoText}>SYNONYM</div>
//           <div className={s.logoSub}>Human Centric File Explorer</div>
//         </div>
//       </div>

//       {/* Quick Access */}
//       <div className={s.section}>
//         <div className={s.sectionLabel}>Quick Access</div>
//         {quickPaths.map(p => (
//           <div key={p.path}
//             className={`${s.item} ${currentPath === p.path ? s.active : ''}`}
//             onClick={() => onNavigate(p.path)}>
//             {p.icon}<span>{p.label}</span>
//           </div>
//         ))}
//       </div>

//       {/* Drives — WSL and Windows */}
//       {drives.length > 1 && (
//         <>
//           <div className={s.divider}/>
//           <div className={s.section}>
//             <div className={s.sectionLabel} style={{cursor:'pointer', userSelect:'none'}}
//               onClick={() => setDrivesOpen(o => !o)}>
//               Drives {drivesOpen ? '▾' : '▸'}
//             </div>
//             {drivesOpen && drives.map(d => (
//               <div key={d.path}
//                 className={`${s.item} ${currentPath === d.path ? s.active : ''}`}
//                 onClick={() => onNavigate(d.path)}>
//                 <DriveIcon/><span>{d.label}</span>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       <div className={s.divider}/>

//       {/* AI Features */}
//       <div className={s.section}>
//         <div className={s.sectionLabel}>AI Features</div>
//         <div className={s.aiBtn} onClick={onDiscovery}>
//           <div className={s.aiDot}/> Discovery Mode
//         </div>
//         <div className={s.aiBtn} onClick={onAllAnalyzed}>
//           <div className={s.aiDot}/> All Analyzed Files
//         </div>
//       </div>

//       <div className={s.divider}/>

//       {/* Bookmarks */}
//       <div className={s.section} style={{flex:1}}>
//         <div className={s.sectionLabel}>Bookmarks</div>
//         {bookmarks.length === 0 && (
//           <div className={s.emptyNote}>No bookmarks yet</div>
//         )}
//         {bookmarks.map((b, i) => {
//           const label = b.split('/').pop() || b.split('\\').pop() || b;
//           return (
//             <div key={i} className={s.bookmark} onClick={() => onNavigate(b)} title={b}>
//               <BookmarkIcon/><span>{label}</span>
//             </div>
//           );
//         })}
//         <button className={s.addBookmark} onClick={onAddBookmark}>
//           <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
//           Bookmark this folder
//         </button>
//       </div>

//     </aside>
//   );
// }

// // ── Logo SVG (molecule network matching the uploaded brand) ─
// function LogoMark() {
//   return (
//     <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <radialGradient id="cg" cx="50%" cy="50%" r="50%">
//           <stop offset="0%"   stopColor="#4DD8E0"/>
//           <stop offset="100%" stopColor="#1565C0"/>
//         </radialGradient>
//         <radialGradient id="ng" cx="50%" cy="50%" r="50%">
//           <stop offset="0%"   stopColor="#26C6DA"/>
//           <stop offset="100%" stopColor="#0D47A1"/>
//         </radialGradient>
//         <radialGradient id="gg" cx="50%" cy="50%" r="50%">
//           <stop offset="0%"   stopColor="#A5D6A7"/>
//           <stop offset="100%" stopColor="#2E7D32"/>
//         </radialGradient>
//       </defs>
//       {/* Edges */}
//       {[
//         [50,50,50,18],[50,50,78,28],[50,50,82,58],[50,50,60,82],
//         [50,50,24,78],[50,50,18,48],[50,50,28,22],
//         [50,18,78,28],[78,28,82,58],[82,58,60,82],[60,82,24,78],[24,78,18,48],[18,48,28,22],[28,22,50,18],
//       ].map(([x1,y1,x2,y2],i)=>(
//         <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1E88E5" strokeWidth="2" strokeOpacity="0.7"/>
//       ))}
//       {/* Centre */}
//       <circle cx="50" cy="50" r="10" fill="url(#cg)"/>
//       {/* Outer blue nodes */}
//       {[[50,18],[78,28],[82,58],[60,82],[24,78],[18,48],[28,22]].map(([cx,cy],i)=>(
//         <circle key={i} cx={cx} cy={cy} r={i===0||i===3?7:5.5} fill="url(#ng)"/>
//       ))}
//       {/* Green accent nodes */}
//       {[[68,16],[88,38]].map(([cx,cy],i)=>(
//         <circle key={i} cx={cx} cy={cy} r="4" fill="url(#gg)"/>
//       ))}
//       <line x1="78" y1="28" x2="68" y2="16" stroke="#388E3C" strokeWidth="1.5" strokeOpacity="0.7"/>
//       <line x1="78" y1="28" x2="88" y2="38" stroke="#388E3C" strokeWidth="1.5" strokeOpacity="0.7"/>
//     </svg>
//   );
// }

// const HomeIcon     = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
// const DesktopIcon  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
// const DocIcon      = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
// const DownloadIcon = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
// const DriveIcon    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="5"/><path d="M2 12v4c0 2.76 4.48 5 10 5s10-2.24 10-5v-4"/></svg>;
// const BookmarkIcon = () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;






import React, { useEffect, useState } from 'react';
import { fs } from '../lib/api.js';
import s from './Sidebar.module.css';

export default function Sidebar({ currentPath, bookmarks, onNavigate, onAddBookmark, onDiscovery, onAllAnalyzed }) {
  const [drives, setDrives]     = useState([]);
  const [winHome, setWinHome]   = useState(null);
  const [wslMode, setWslMode]   = useState(false);

  useEffect(() => {
    // Load platform info and drives on mount
    fs.getDrives().then(d => setDrives(d || []));
    fs.windowsHome().then(p => { if (p) setWinHome(p); });
    // Check if in WSL to show extra Windows section
    if (window.api?.platform) {
      window.api.platform().then(p => setWslMode(p?.isWSL || false));
    }
  }, []);

  // Split drives into groups for display
  const homeDrives    = drives.filter(d => d.icon === 'home' || d.icon === 'win-home' || d.icon === 'folder');
  const storageDrives = drives.filter(d => d.icon === 'drive' || d.icon === 'root' || d.icon === 'cloud');

  const NavItem = ({ item }) => (
    <div
      className={`${s.item} ${currentPath === item.path ? s.active : ''}`}
      onClick={() => onNavigate(item.path)}
      title={item.path}
    >
      {iconFor(item.icon)}
      <span className={s.itemLabel}>{item.label}</span>
    </div>
  );

  return (
    <aside className={s.sidebar}>

      {/* Logo */}
      <div className={s.logoArea}>
        <LogoSVG />
        <div>
          <div className={s.logoText}>SYNONYM</div>
          <div className={s.logoSub}>Human Centric File Explorer</div>
        </div>
      </div>

      {/* Quick access — home, desktop, documents, downloads */}
      {homeDrives.length > 0 && (
        <div className={s.section}>
          <div className={s.sectionLabel}>Quick Access</div>
          {homeDrives.map(d => <NavItem key={d.path} item={d} />)}
        </div>
      )}

      {/* Storage — drives, volumes, roots */}
      {storageDrives.length > 0 && (
        <>
          <div className={s.divider}/>
          <div className={s.section}>
            <div className={s.sectionLabel}>
              {wslMode ? 'Windows Drives' : 'Storage'}
            </div>
            {storageDrives.map(d => <NavItem key={d.path} item={d} />)}
          </div>
        </>
      )}

      <div className={s.divider}/>

      {/* AI Features */}
      <div className={s.section}>
        <div className={s.sectionLabel}>AI Features</div>
        <div className={s.aiBtn} onClick={onDiscovery}>
          <div className={s.aiDot}/> Discovery Mode
        </div>
        <div className={s.aiBtn} onClick={onAllAnalyzed}>
          <div className={s.aiDot}/> All Analyzed Files
        </div>
      </div>

      <div className={s.divider}/>

      {/* Bookmarks */}
      <div className={s.section} style={{ flex: 1 }}>
        <div className={s.sectionLabel}>Bookmarks</div>
        {bookmarks.length === 0 && (
          <div className={s.emptyNote}>No bookmarks yet</div>
        )}
        {bookmarks.map((b, i) => {
          const label = b.split('/').pop() || b.split('\\').pop() || b;
          return (
            <div key={i} className={s.bookmark} onClick={() => onNavigate(b)} title={b}>
              <BookmarkIcon /><span>{label}</span>
            </div>
          );
        })}
        <button className={s.addBookmark} onClick={onAddBookmark}>
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Bookmark this folder
        </button>
      </div>

    </aside>
  );
}

// ── Icon resolver ─────────────────────────────────────────
function iconFor(type) {
  switch (type) {
    case 'home':     return <HomeIcon/>;
    case 'win-home': return <WinHomeIcon/>;
    case 'folder':   return <FolderIcon/>;
    case 'drive':    return <DriveIcon/>;
    case 'root':     return <RootIcon/>;
    case 'cloud':    return <CloudIcon/>;
    default:         return <FolderIcon/>;
  }
}

// ── Logo SVG (molecule network, matches brand image) ──────
function LogoSVG() {
  return (
    <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lg-c" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#4DD8E0"/><stop offset="100%" stopColor="#1565C0"/></radialGradient>
        <radialGradient id="lg-n" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#29B6F6"/><stop offset="100%" stopColor="#0D47A1"/></radialGradient>
        <radialGradient id="lg-g" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#A5D6A7"/><stop offset="100%" stopColor="#2E7D32"/></radialGradient>
      </defs>
      {/* Edges from centre */}
      {[[50,50,50,16],[50,50,80,26],[50,50,84,58],[50,50,62,84],[50,50,22,80],[50,50,16,48],[50,50,26,20]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1E88E5" strokeWidth="1.8" strokeOpacity="0.65"/>
      ))}
      {/* Outer ring edges */}
      {[[50,16,80,26],[80,26,84,58],[84,58,62,84],[62,84,22,80],[22,80,16,48],[16,48,26,20],[26,20,50,16]].map(([x1,y1,x2,y2],i)=>(
        <line key={`r${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1565C0" strokeWidth="1.2" strokeOpacity="0.45"/>
      ))}
      {/* Green accent edges */}
      <line x1="80" y1="26" x2="70" y2="12" stroke="#388E3C" strokeWidth="1.2" strokeOpacity="0.7"/>
      <line x1="80" y1="26" x2="92" y2="36" stroke="#388E3C" strokeWidth="1.2" strokeOpacity="0.7"/>
      {/* Centre node */}
      <circle cx="50" cy="50" r="10" fill="url(#lg-c)"/>
      {/* Outer blue nodes */}
      {[[50,16,7],[80,26,5.5],[84,58,5.5],[62,84,7],[22,80,5.5],[16,48,5.5],[26,20,5.5]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="url(#lg-n)"/>
      ))}
      {/* Green accent nodes */}
      <circle cx="70" cy="12" r="4" fill="url(#lg-g)"/>
      <circle cx="92" cy="36" r="4" fill="url(#lg-g)"/>
    </svg>
  );
}

const HomeIcon    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
const WinHomeIcon = () => <svg width="13" height="13" fill="none" stroke="#42A5F5" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const FolderIcon  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const DriveIcon   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="5"/><path d="M2 12v4c0 2.76 4.48 5 10 5s10-2.24 10-5v-4"/></svg>;
const RootIcon    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const CloudIcon   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>;
const BookmarkIcon= () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;