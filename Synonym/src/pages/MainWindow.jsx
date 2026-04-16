// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { fs, analysis, db } from '../lib/api.js';
// import Sidebar      from '../components/Sidebar.jsx';
// import FileTable    from '../components/FileTable.jsx';
// import RightPanel   from '../components/RightPanel.jsx';
// import ProfileModal from '../components/ProfileModal.jsx';
// import ProgressOverlay from '../components/ProgressOverlay.jsx';
// import s from './MainWindow.module.css';

// const SCRIPT_PATH = 'python/firstrun.py';
// const MODEL_PATH  = 'python/genre_classifier.pkl';

// export default function MainWindow({ session, onLogout, onOpenViz }) {
//   const [path, setPath]         = useState('');
//   const [files, setFiles]       = useState([]);
//   const [selected, setSelected] = useState(new Set());
//   const [history, setHistory]   = useState([]);
//   const [histIdx, setHistIdx]   = useState(-1);
//   const [bookmarks, setBookmarks] = useState(() =>
//     JSON.parse(localStorage.getItem('synonym_bookmarks') || '[]'));
//   const [search, setSearch]     = useState('');
//   const [searchResults, setSearchResults] = useState(null);
//   const [detail, setDetail]     = useState(null);
//   const [status, setStatus]     = useState({ msg: 'Ready', type: 'ok' });
//   const [analyzing, setAnalyzing] = useState(false);
//   const [analyzeMsg, setAnalyzeMsg] = useState('');
//   const [showProfile, setShowProfile] = useState(false);
//   const searchTimer = useRef(null);

//   // ── Boot ──────────────────────────────────────────────
//   useEffect(() => {
//     fs.homeDir().then(home => navigate(home));
//   }, []);

//   // ── Navigation ────────────────────────────────────────
//   const navigate = useCallback(async (newPath) => {
//     if (!newPath) return;
//     setHistory(h => {
//       const trimmed = h.slice(0, histIdx + 1);
//       const next    = [...trimmed, newPath];
//       setHistIdx(next.length - 1);
//       return next;
//     });
//     await loadDir(newPath);
//   }, [histIdx]);

//   const loadDir = async (dirPath) => {
//     setStatus({ msg: 'Loading…', type: 'processing' });
//     setPath(dirPath);
//     setSelected(new Set());
//     setDetail(null);
//     setSearch('');
//     setSearchResults(null);
//     const res = await fs.listDir(dirPath);
//     if (res.success) {
//       setFiles(res.data);
//       setStatus({ msg: dirPath, type: 'ok' });
//     } else {
//       setStatus({ msg: 'Error: ' + res.error, type: 'error' });
//     }
//   };

//   const goBack = () => {
//     if (histIdx <= 0) return;
//     const newIdx = histIdx - 1;
//     setHistIdx(newIdx);
//     loadDir(history[newIdx]);
//   };

//   const goForward = () => {
//     if (histIdx >= history.length - 1) return;
//     const newIdx = histIdx + 1;
//     setHistIdx(newIdx);
//     loadDir(history[newIdx]);
//   };

//   const goUp = () => {
//     if (!path) return;
//     const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
//     if (parts.length > 1) { parts.pop(); navigate('/' + parts.join('/')); }
//   };

//   // ── Search ────────────────────────────────────────────
//   const handleSearch = (q) => {
//     setSearch(q);
//     clearTimeout(searchTimer.current);
//     if (!q) { setSearchResults(null); return; }
//     searchTimer.current = setTimeout(async () => {
//       setStatus({ msg: 'Searching…', type: 'processing' });
//       const res = await db.search(q);
//       if (res.success) {
//         setSearchResults(res.data);
//         setStatus({ msg: `${res.data.length} result(s) for "${q}"`, type: 'ok' });
//       }
//     }, 300);
//   };

//   // ── File detail ───────────────────────────────────────
//   const handleSelectFile = async (file) => {
//     if (!file.isDir) {
//       const res = await db.getFileDetail(file.name);
//       setDetail(res.success ? res.data : null);
//     }
//   };

//   // ── Add files ─────────────────────────────────────────
//   const handleAddFiles = async () => {
//     const paths = await fs.showOpenDialog({
//       properties: ['openFile', 'multiSelections'],
//       filters: [{ name: 'Documents', extensions: ['pdf','txt','docx','doc','md'] }],
//     });
//     if (!paths) return;
//     paths.forEach(p => setSelected(s => new Set([...s, p])));
//     setStatus({ msg: `${paths.length} file(s) added — click Analyze`, type: 'ok' });
//   };

//   // ── Analyze ───────────────────────────────────────────
//   const handleAnalyze = async () => {
//     const filePaths = [...selected].filter(p => !p.endsWith('/'));
//     if (!filePaths.length) { setStatus({ msg: 'Select files first', type: 'error' }); return; }
//     setAnalyzing(true);
//     setAnalyzeMsg(`Analyzing ${filePaths.length} file(s)…`);
//     const res = await analysis.run(filePaths, SCRIPT_PATH, MODEL_PATH);
//     setAnalyzing(false);
//     if (res.success) {
//       setStatus({ msg: `✓ ${res.data.length} file(s) analyzed`, type: 'ok' });
//       loadDir(path);
//     } else {
//       setStatus({ msg: 'Analysis failed: ' + res.error, type: 'error' });
//     }
//   };

//   // ── Bookmarks ─────────────────────────────────────────
//   const addBookmark = () => {
//     if (!path || bookmarks.includes(path)) return;
//     const next = [...bookmarks, path];
//     setBookmarks(next);
//     localStorage.setItem('synonym_bookmarks', JSON.stringify(next));
//     setStatus({ msg: 'Bookmarked: ' + path, type: 'ok' });
//   };

//   // ── Visualizer ────────────────────────────────────────
//   const handleOpenViz = async () => {
//     const res = await db.getAllAnalyzed();
//     if (!res.success || !res.data.length) {
//       setStatus({ msg: 'No analyzed files yet', type: 'error' }); return;
//     }
//     onOpenViz(res.data);
//   };

//   const handleShowAllAnalyzed = async () => {
//     const res = await db.getAllAnalyzed();
//     if (res.success) {
//       setSearchResults(res.data);
//       setStatus({ msg: `Showing ${res.data.length} analyzed files`, type: 'ok' });
//     }
//   };

//   const displayFiles = searchResults !== null
//     ? searchResults.map(d => ({ name: d.name, path: d.path, isDir: false, size: 0, modified: '', genre: d.topGenre, genreScore: d.genreScore }))
//     : files;

//   return (
//     <div className={s.shell}>
//       {/* TOPBAR */}
//       <header className={s.topbar}>
//         <div className={s.logo}>SYN<span>◆</span>NYM</div>
//         <button className={s.iconBtn} onClick={goBack}    disabled={histIdx <= 0} title="Back">
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
//         </button>
//         <button className={s.iconBtn} onClick={goForward} disabled={histIdx >= history.length-1} title="Forward">
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
//         </button>
//         <button className={s.iconBtn} onClick={goUp} title="Up">
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
//         </button>
//         <div className={s.pathBar}>
//           <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{color:'var(--text2)',flexShrink:0}}>
//             <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
//           </svg>
//           <input value={path} onChange={e=>setPath(e.target.value)}
//             onKeyDown={e=>e.key==='Enter'&&navigate(e.target.value.trim())}
//             placeholder="Type a path and press Enter…"/>
//         </div>
//         <button className={s.iconBtn} onClick={()=>loadDir(path)} title="Refresh">
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//             <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
//             <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
//           </svg>
//         </button>
//         <div className={s.topActions}>
//           <button className={`${s.actionBtn} ${s.secondary}`} onClick={handleAddFiles}>
//             <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
//             Add Files
//           </button>
//           <button className={`${s.actionBtn} ${s.primary}`} onClick={handleAnalyze}>
//             <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//               <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//             </svg>
//             Analyze
//           </button>
//         </div>
//         <div className={s.topRight}>
//           <button className={s.iconBtn} onClick={handleOpenViz} title="Cluster Visualizer">
//             <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//               <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
//               <circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/>
//               <line x1="6" y1="6" x2="10" y2="10"/><line x1="18" y1="6" x2="14" y2="10"/>
//               <line x1="6" y1="18" x2="10" y2="14"/><line x1="18" y1="18" x2="14" y2="14"/>
//             </svg>
//           </button>
//           <div className={s.avatar} onClick={()=>setShowProfile(true)} title="Profile">
//             {(session?.name||'U')[0].toUpperCase()}
//           </div>
//         </div>
//       </header>

//       {/* SEARCH */}
//       <div className={s.searchWrap}>
//         <div className={s.searchInner}>
//           <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{color:'var(--text2)',flexShrink:0}}>
//             <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//           </svg>
//           <input value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Search files, genres, keywords…"/>
//         </div>
//       </div>

//       {/* BODY */}
//       <div className={s.body}>
//         <Sidebar
//           currentPath={path}
//           bookmarks={bookmarks}
//           onNavigate={navigate}
//           onAddBookmark={addBookmark}
//           onDiscovery={handleOpenViz}
//           onAllAnalyzed={handleShowAllAnalyzed}
//         />
//         <FileTable
//           files={displayFiles}
//           selected={selected}
//           onSelect={setSelected}
//           onNavigate={navigate}
//           onFileClick={handleSelectFile}
//         />
//         <RightPanel files={displayFiles} detail={detail} selected={selected}/>
//       </div>

//       {/* STATUS */}
//       <footer className={s.statusbar}>
//         <div className={`${s.dot} ${status.type==='processing'?s.processing:status.type==='error'?s.error:''}`}/>
//         <span className={s.statusText}>{status.msg}</span>
//         <span style={{flex:1}}/>
//         <span className={s.statusText}>{selected.size > 0 ? `${selected.size} selected` : '0 selected'}</span>
//         <span className={s.statusText} style={{color:'var(--border2)'}}>|</span>
//         <span className={s.statusText}>Synonym v2.0</span>
//       </footer>

//       {showProfile && (
//         <ProfileModal session={session} onClose={()=>setShowProfile(false)} onLogout={onLogout}/>
//       )}
//       {analyzing && <ProgressOverlay message={analyzeMsg}/>}
//     </div>
//   );
// }




import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fs, analysis, db } from '../lib/api.js';
import Sidebar         from '../components/Sidebar.jsx';
import FileTable       from '../components/FileTable.jsx';
import RightPanel      from '../components/RightPanel.jsx';
import ProfileModal    from '../components/ProfileModal.jsx';
import ProgressOverlay from '../components/ProgressOverlay.jsx';
import s from './MainWindow.module.css';

export default function MainWindow({ onOpenViz }) {
  const [path, setPath]           = useState('');
  const [files, setFiles]         = useState([]);
  const [selected, setSelected]   = useState(new Set());
  const [history, setHistory]     = useState([]);
  const [histIdx, setHistIdx]     = useState(-1);
  const [bookmarks, setBookmarks] = useState(() =>
    JSON.parse(localStorage.getItem('synonym_bookmarks') || '[]'));
  const [search, setSearch]       = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [detail, setDetail]       = useState(null);
  const [status, setStatus]       = useState({ msg: 'Ready', type: 'ok' });
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const searchTimer = useRef(null);

  // Boot — navigate to home on first load
  useEffect(() => {
    fs.homeDir().then(home => navigate(home));
  }, []);

  // ── Navigation ─────────────────────────────────────────
  const navigate = useCallback(async (newPath) => {
    if (!newPath) return;
    setHistory(prev => {
      const trimmed = prev.slice(0, histIdx + 1);
      const next    = [...trimmed, newPath];
      setHistIdx(next.length - 1);
      return next;
    });
    await loadDir(newPath);
  }, [histIdx]);

  const loadDir = async (dirPath) => {
    setStatus({ msg: 'Loading…', type: 'processing' });
    setPath(dirPath);
    setSelected(new Set());
    setDetail(null);
    setSearch('');
    setSearchResults(null);
    const res = await fs.listDir(dirPath);
    if (res.success) {
      setFiles(res.data);
      setStatus({ msg: dirPath, type: 'ok' });
    } else {
      setStatus({ msg: 'Error: ' + res.error, type: 'error' });
    }
  };

  const goBack = () => {
    if (histIdx <= 0) return;
    const idx = histIdx - 1;
    setHistIdx(idx); loadDir(history[idx]);
  };
  const goForward = () => {
    if (histIdx >= history.length - 1) return;
    const idx = histIdx + 1;
    setHistIdx(idx); loadDir(history[idx]);
  };
  const goUp = () => {
    if (!path) return;
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    if (parts.length > 1) { parts.pop(); navigate('/' + parts.join('/')); }
    else navigate('/');
  };

  // ── Search ─────────────────────────────────────────────
  const handleSearch = (q) => {
    setSearch(q);
    clearTimeout(searchTimer.current);
    if (!q) { setSearchResults(null); return; }
    searchTimer.current = setTimeout(async () => {
      setStatus({ msg: 'Searching…', type: 'processing' });
      const res = await db.search(q);
      if (res.success) {
        setSearchResults(res.data);
        setStatus({ msg: `${res.data.length} result(s) for "${q}"`, type: 'ok' });
      }
    }, 300);
  };

  // ── File detail ────────────────────────────────────────
  const handleSelectFile = async (file) => {
    if (!file.isDir) {
      const res = await db.getFileDetail(file.name);
      setDetail(res.success ? res.data : null);
    }
  };

  // ── Add files ──────────────────────────────────────────
  const handleAddFiles = async () => {
    const paths = await fs.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Documents', extensions: ['pdf','txt','docx','doc','md'] }],
    });
    if (!paths) return;
    paths.forEach(p => setSelected(prev => new Set([...prev, p])));
    setStatus({ msg: `${paths.length} file(s) added — click Analyze to process`, type: 'ok' });
  };

  // ── Analyze ────────────────────────────────────────────
  const handleAnalyze = async () => {
    const filePaths = [...selected].filter(p => !p.endsWith('/') && !p.endsWith('\\'));
    if (!filePaths.length) {
      setStatus({ msg: 'Select files first, then click Analyze', type: 'error' });
      return;
    }
    setAnalyzing(true);
    setAnalyzeMsg(`Analyzing ${filePaths.length} file(s)…`);

    // FIX: no longer passing scriptPath/modelPath — main.js resolves them
    const res = await analysis.run(filePaths);

    setAnalyzing(false);
    if (res.success) {
      const n = res.data?.length ?? 0;
      setStatus({ msg: `✓ ${n} file(s) analyzed and saved`, type: 'ok' });
      loadDir(path); // Refresh to show genre chips
    } else {
      setStatus({ msg: 'Analysis failed: ' + (res.error || 'unknown'), type: 'error' });
    }
  };

  // ── Bookmarks ──────────────────────────────────────────
  const addBookmark = () => {
    if (!path || bookmarks.includes(path)) return;
    const next = [...bookmarks, path];
    setBookmarks(next);
    localStorage.setItem('synonym_bookmarks', JSON.stringify(next));
    setStatus({ msg: 'Bookmarked: ' + path, type: 'ok' });
  };

  // ── Visualizer ─────────────────────────────────────────
  const handleOpenViz = async () => {
    const res = await db.getAllAnalyzed();
    if (!res.success || !res.data.length) {
      setStatus({ msg: 'No analyzed files yet — analyze some files first', type: 'error' });
      return;
    }
    onOpenViz(res.data);
  };

  const handleShowAllAnalyzed = async () => {
    const res = await db.getAllAnalyzed();
    if (res.success) {
      setSearchResults(res.data);
      setStatus({ msg: `Showing ${res.data.length} analyzed files`, type: 'ok' });
    }
  };

  const displayFiles = searchResults !== null
    ? searchResults.map(d => ({
        name: d.name, path: d.path, isDir: false,
        size: 0, modified: '', genre: d.topGenre, genreScore: d.genreScore,
      }))
    : files;

  return (
    <div className={s.shell}>

      {/* TOPBAR */}
      <header className={s.topbar}>
        {/* Nav controls */}
        <button className={s.iconBtn} onClick={goBack}    disabled={histIdx <= 0} title="Back">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className={s.iconBtn} onClick={goForward} disabled={histIdx >= history.length - 1} title="Forward">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button className={s.iconBtn} onClick={goUp} title="Up one level">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>

        {/* Path bar */}
        <div className={s.pathBar}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{color:'var(--text2)',flexShrink:0}}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <input
            value={path}
            onChange={e => setPath(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(e.target.value.trim())}
            placeholder="Type a path and press Enter…"
          />
        </div>

        <button className={s.iconBtn} onClick={() => loadDir(path)} title="Refresh">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        {/* Actions */}
        <div className={s.topActions}>
          <button className={`${s.actionBtn} ${s.secondary}`} onClick={handleAddFiles}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Add Files
          </button>
          <button className={`${s.actionBtn} ${s.primary}`} onClick={handleAnalyze}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
            Analyze
          </button>
        </div>

        <div className={s.topRight}>
          <button className={s.iconBtn} onClick={handleOpenViz} title="Cluster Visualizer">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
              <circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/>
              <line x1="6" y1="6" x2="10" y2="10"/><line x1="18" y1="6" x2="14" y2="10"/>
              <line x1="6" y1="18" x2="10" y2="14"/><line x1="18" y1="18" x2="14" y2="14"/>
            </svg>
          </button>
          <div className={s.avatar} onClick={() => setShowProfile(true)} title="Settings">⚙</div>
        </div>
      </header>

      {/* SEARCH */}
      <div className={s.searchWrap}>
        <div className={s.searchInner}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{color:'var(--text2)',flexShrink:0}}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search analyzed files by name, genre, keywords…"
          />
          {search && (
            <button onClick={() => handleSearch('')} style={{color:'var(--text2)',fontSize:14,lineHeight:1}}>✕</button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className={s.body}>
        <Sidebar
          currentPath={path}
          bookmarks={bookmarks}
          onNavigate={navigate}
          onAddBookmark={addBookmark}
          onDiscovery={handleOpenViz}
          onAllAnalyzed={handleShowAllAnalyzed}
        />
        <FileTable
          files={displayFiles}
          selected={selected}
          onSelect={setSelected}
          onNavigate={navigate}
          onFileClick={handleSelectFile}
        />
        <RightPanel files={displayFiles} detail={detail} selected={selected}/>
      </div>

      {/* STATUS BAR */}
      <footer className={s.statusbar}>
        <div className={`${s.dot} ${status.type==='processing'?s.processing:status.type==='error'?s.error:''}`}/>
        <span className={s.statusText}>{status.msg}</span>
        <span style={{flex:1}}/>
        <span className={s.statusText}>{selected.size > 0 ? `${selected.size} selected` : ''}</span>
        {selected.size > 0 && <span className={s.statusText} style={{color:'var(--border2)'}}>|</span>}
        <span className={s.statusText}>Synonym v2.0</span>
      </footer>

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
      {analyzing && <ProgressOverlay message={analyzeMsg}/>}
    </div>
  );
}