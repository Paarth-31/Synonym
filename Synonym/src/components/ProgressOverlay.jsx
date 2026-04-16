import React from 'react';
import s from './ProgressOverlay.module.css';

export default function ProgressOverlay({ message }) {
  return (
    <div className={s.overlay}>
      <div className={s.spinner}/>
      <div className={s.title}>Analyzing Files</div>
      <div className={s.sub}>{message || 'Running ML pipeline…'}</div>
      <div className={s.barWrap}><div className={s.barFill}/></div>
      <div className={s.sub}>This may take a minute per file</div>
    </div>
  );
}