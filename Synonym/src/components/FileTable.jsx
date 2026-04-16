import React from 'react';
import { fs } from '../lib/api.js';
import s from './FileTable.module.css';

function fileIcon(entry) {
  if (entry.isDir) return <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
  const ext = entry.name.split('.').pop().toLowerCase();
  const c = { pdf:'#f43f5e', txt:'#94a3b8', docx:'#3b82f6', doc:'#3b82f6', py:'#f59e0b', js:'#eab308', ts:'#3b82f6', md:'#8b5cf6', rs:'#f97316' }[ext] || '#475569';
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}

function fmtSize(b) {
  if (!b) return '—';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

export default function FileTable({ files, selected, onSelect, onNavigate, onFileClick }) {
  if (!files) return null;

  const handleClick = (e, file) => {
    if (file.isDir) return;
    if (e.ctrlKey || e.metaKey) {
      const next = new Set(selected);
      next.has(file.path) ? next.delete(file.path) : next.add(file.path);
      onSelect(next);
    } else {
      onSelect(new Set([file.path]));
    }
    onFileClick(file);
  };

  const handleDblClick = async (file) => {
    if (file.isDir) onNavigate(file.path);
    else await fs.openFile(file.path);
  };

  return (
    <div className={s.wrap}>
      {files.length === 0
        ? <div className={s.empty}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <p>This folder is empty</p>
          </div>
        : <table className={s.table}>
            <thead><tr>
              <th style={{width:'40%'}}>Name</th>
              <th style={{width:'18%'}}>Genre</th>
              <th style={{width:'14%'}}>Size</th>
              <th style={{width:'28%'}}>Date Modified</th>
            </tr></thead>
            <tbody>
              {files.map((f, i) => (
                <tr key={f.path+i} className={selected.has(f.path)?s.sel:''}
                  onClick={e=>handleClick(e,f)} onDoubleClick={()=>handleDblClick(f)}>
                  <td>
                    <span className={s.nameCell}>
                      {fileIcon(f)}<span>{f.name}</span>
                    </span>
                  </td>
                  <td>
                    {f.genre
                      ? <span className={s.chip}>{f.genre}</span>
                      : <span className={`${s.chip} ${s.unknown}`}>—</span>}
                  </td>
                  <td><span className={s.mono}>{f.isDir ? '—' : fmtSize(f.size)}</span></td>
                  <td><span className={s.mono}>{f.modified}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
      }
    </div>
  );
}