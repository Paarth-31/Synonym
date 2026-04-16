import React, { useEffect, useRef, useState } from 'react';
import s from './Visualizer.module.css';

export default function Visualizer({ files, onBack }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const stateRef  = useRef({ rotX: 0.3, rotY: 0, scale: 1, drag: { active:false, x:0, y:0 }, autoRot: true });
  const nodesRef  = useRef([]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    nodesRef.current = buildNodes(files);
    startLoop();
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [files]);

  function buildNodes(files) {
    const groups = {};
    files.forEach(f => {
      const g = f.topGenre || f.genre || 'Unknown';
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    const palette = ['#7c5cfc','#10b981','#f59e0b','#f43f5e','#3b82f6','#a855f7','#14b8a6','#fb923c'];
    const keys    = Object.keys(groups);
    const nodes   = [];
    keys.forEach((genre, gi) => {
      const color = palette[gi % palette.length];
      const cx = Math.cos(gi / keys.length * Math.PI * 2) * 180;
      const cz = Math.sin(gi / keys.length * Math.PI * 2) * 180;
      const cy = (Math.random() - 0.5) * 80;
      nodes.push({ x:cx, y:cy, z:cz, r:26+groups[genre].length*4, color, genre, isCenter:true, name:genre, keywords:'', fileCount:groups[genre].length });
      groups[genre].forEach((f, fi) => {
        const angle  = (fi / groups[genre].length) * Math.PI * 2;
        const spread = 60 + groups[genre].length * 5;
        nodes.push({ x:cx+Math.cos(angle)*spread, y:cy+(Math.random()-.5)*40, z:cz+Math.sin(angle)*spread,
          r:7, color, genre, isCenter:false, name:f.name||f.filename,
          keywords:(f.keywords||'').split(',').slice(0,4).join(', '), fileCount:0 });
      });
    });
    return nodes;
  }

  function project(n, w, h) {
    const st = stateRef.current;
    const cosY=Math.cos(st.rotY), sinY=Math.sin(st.rotY);
    const rx = n.x*cosY + n.z*sinY, rz = -n.x*sinY + n.z*cosY;
    const cosX=Math.cos(st.rotX), sinX=Math.sin(st.rotX);
    const ry = n.y*cosX - rz*sinX, rz2 = n.y*sinX + rz*cosX;
    const fov = 600, sc = (fov/(fov+rz2+400))*st.scale;
    return { px:w/2+rx*sc, py:h/2+ry*sc, scale:sc, z:rz2 };
  }

  function startLoop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width=canvas.clientWidth; canvas.height=canvas.clientHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onDown = e => { const st=stateRef.current; st.drag.active=true; st.drag.x=e.clientX; st.drag.y=e.clientY; st.autoRot=false; };
    const onMove = e => {
      const st=stateRef.current;
      if (st.drag.active) { st.rotY+=(e.clientX-st.drag.x)*.005; st.rotX+=(e.clientY-st.drag.y)*.005; st.drag.x=e.clientX; st.drag.y=e.clientY; }
      // Tooltip
      const rect=canvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
      let hit=null;
      nodesRef.current.forEach(n => {
        const p=project(n,canvas.width,canvas.height);
        const dx=mx-p.px, dy=my-p.py;
        if (dx*dx+dy*dy<(n.r*p.scale)**2) hit={n,x:e.clientX,y:e.clientY};
      });
      setTooltip(hit?{name:hit.n.name,genre:hit.n.genre,keywords:hit.n.keywords,fileCount:hit.n.fileCount,x:hit.x,y:hit.y}:null);
    };
    const onUp   = () => { stateRef.current.drag.active=false; };
    const onWheel = e => { const st=stateRef.current; st.scale=Math.max(.4,Math.min(2.5,st.scale-e.deltaY*.001)); };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    canvas.addEventListener('wheel',     onWheel);

    function draw() {
      const st=stateRef.current;
      if (st.autoRot) st.rotY+=.003;
      const w=canvas.width, h=canvas.height;
      ctx.clearRect(0,0,w,h);
      const proj = nodesRef.current
        .map(n=>({...n, p:project(n,w,h)}))
        .sort((a,b)=>b.p.z-a.p.z);
      const centers = proj.filter(n=>n.isCenter);
      proj.filter(n=>!n.isCenter).forEach(n=>{
        const c=centers.find(c=>c.genre===n.genre);
        if(c){ ctx.beginPath(); ctx.moveTo(c.p.px,c.p.py); ctx.lineTo(n.p.px,n.p.py); ctx.strokeStyle=n.color+'22'; ctx.lineWidth=1; ctx.stroke(); }
      });
      proj.forEach(n=>{
        const {px,py,scale}=n.p, r=n.r*scale;
        ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2);
        if(n.isCenter){
          const g=ctx.createRadialGradient(px-r*.3,py-r*.3,0,px,py,r);
          g.addColorStop(0,n.color+'dd'); g.addColorStop(1,n.color+'55');
          ctx.fillStyle=g; ctx.shadowColor=n.color; ctx.shadowBlur=20*scale;
        }else{ ctx.fillStyle=n.color+'99'; ctx.shadowColor=n.color; ctx.shadowBlur=8*scale; }
        ctx.fill(); ctx.shadowBlur=0;
        if(n.isCenter&&r>8){
          ctx.fillStyle='#f1f5f9'; ctx.font=`${Math.min(13,Math.max(9,11*scale))}px Syne,sans-serif`;
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(n.name,px,py);
        }
      });
      rafRef.current=requestAnimationFrame(draw);
    }
    draw();
    return () => {
      canvas.removeEventListener('mousedown',onDown);
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
      canvas.removeEventListener('wheel',onWheel);
      window.removeEventListener('resize',resize);
    };
  }

  const reset = () => { const st=stateRef.current; st.rotX=0.3; st.rotY=0; st.scale=1; st.autoRot=true; };

  return (
    <div className={s.page}>
      <div className={s.topbar}>
        <div className={s.logo}>SYN<span>◆</span>NYM</div>
        <span className={s.vizTitle}>Cluster Visualizer</span>
        <span style={{flex:1}}/>
        <button className={s.btn} onClick={reset}>Reset View</button>
        <button className={`${s.btn} ${s.back}`} onClick={onBack}>← Back to Explorer</button>
      </div>
      <div className={s.hint}>Files grouped by semantic similarity · Drag to rotate · Scroll to zoom · {files.length} files</div>
      <canvas ref={canvasRef} className={s.canvas}/>
      {tooltip && (
        <div className={s.tooltip} style={{left:tooltip.x+14,top:tooltip.y-10}}>
          <div className={s.ttName}>{tooltip.name}</div>
          <div className={s.ttGenre}>{tooltip.genre}{tooltip.fileCount>0?` — ${tooltip.fileCount} files`:''}</div>
          {tooltip.keywords&&<div className={s.ttKw}>{tooltip.keywords}</div>}
        </div>
      )}
    </div>
  );
}