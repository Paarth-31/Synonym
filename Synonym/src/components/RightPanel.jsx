import React, { useMemo } from 'react';
import s from './RightPanel.module.css';

export default function RightPanel({ files, detail, selected }) {
  const stats = useMemo(() => {
    const nonDirs = files.filter(f => !f.isDir);
    return {
      total:    nonDirs.length,
      analyzed: nonDirs.filter(f => f.genre).length,
      genres:   new Set(nonDirs.filter(f => f.genre).map(f => f.genre)).size,
    };
  }, [files]);

  return (
    <aside className={s.panel}>
      <div className={s.header}>File Intelligence</div>

      {/* Stats */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Statistics</div>
        <Stat label="Files shown"   value={stats.total}    />
        <Stat label="Analyzed"      value={stats.analyzed} />
        <Stat label="Genres found"  value={stats.genres}   />
      </div>

      {/* Detail */}
      {detail ? (
        <div className={s.section} style={{flex:1,overflowY:'auto'}}>
          <div className={s.sectionTitle} style={{marginBottom:12}}>
            {detail.name.length > 22 ? detail.name.slice(0,20)+'…' : detail.name}
          </div>

          {/* Genre bars */}
          <div className={s.subTitle}>Genres</div>
          {(detail.allGenres?.length ? detail.allGenres : [{genre:detail.topGenre,score:detail.genreScore}]).map(g => (
            <div key={g.genre} className={s.barRow}>
              <div className={s.barLabel}>
                <span className={s.barName}>{g.genre}</span>
                <span className={s.barPct}>{(g.score*100).toFixed(0)}%</span>
              </div>
              <div className={s.barTrack}><div className={s.barFill} style={{width:g.score*100+'%'}}/></div>
            </div>
          ))}

          {/* Keywords */}
          {detail.keywords && (
            <>
              <div className={s.subTitle} style={{marginTop:14}}>Keywords</div>
              <div className={s.kwWrap}>
                {detail.keywords.split(',').map(k=>k.trim()).filter(Boolean).slice(0,12).map(k=>(
                  <span key={k} className={s.kw}>{k}</span>
                ))}
              </div>
            </>
          )}

          {/* Summary */}
          {detail.summary && (
            <>
              <div className={s.subTitle} style={{marginTop:14}}>Summary</div>
              <div className={s.summary}>
                {detail.summary.length > 300 ? detail.summary.slice(0,300)+'…' : detail.summary}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={s.section}>
          <p className={s.hint}>
            Click a file to see its AI analysis.<br/><br/>
            Select files and click <strong>Analyze</strong> to run the ML pipeline.
          </p>
        </div>
      )}
    </aside>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <span style={{fontSize:12,color:'var(--text2)'}}>{label}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:14,fontWeight:500,color:'var(--text0)'}}>{value}</span>
    </div>
  );
}