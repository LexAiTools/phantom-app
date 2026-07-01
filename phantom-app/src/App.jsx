import React, { useState, useEffect, useRef } from "react";

// ─── STAŁE ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#0A0A0F", surface:"#12121A", surfaceHi:"#1A1A26",
  border:"#1E1E2E", green:"#00FF87", greenDim:"#00CC6A",
  greenFaint:"rgba(0,255,135,0.09)", text:"#C8C8D0", dim:"#6C6C7E",
  faint:"#2A2A3E", yellow:"#FFB800", red:"#FF4466",
  purple:"#9B6DFF", purpleFaint:"rgba(155,109,255,0.09)",
};
const F = "'JetBrains Mono','Fira Mono',monospace";

const shortOnion = (o="") => {
  if (!o) return "";
  const b = o.replace(".onion","");
  return b.length<=8 ? o : b.slice(0,4)+"…"+b.slice(-4)+".onion";
};

// ─── DANE DEMO ────────────────────────────────────────────────────────────────
const ALL_MEMBERS = {
  a1b2c3:{ id:"a1b2c3", name:"kontakt_7f3a", onion:"x7wqibd4zmbxojl5.onion", trust:"DIRECT",   online:true,  lastSeen:"teraz"  },
  d4e5f6:{ id:"d4e5f6", name:"kontakt_2c9b", onion:"p3kmnvq8rtz1yxs4.onion", trust:"ENDORSED", online:true,  lastSeen:"teraz"  },
  g7h8i9:{ id:"g7h8i9", name:"kontakt_a5d1", onion:"q9rlnwj2kpx6mhv7.onion", trust:"DIRECT",   online:false, lastSeen:"2h temu"},
  m1n2o3:{ id:"m1n2o3", name:"kontakt_f8e2", onion:"r2hbvnk5qwz9lpx3.onion", trust:"ENDORSED", online:true,  lastSeen:"teraz"  },
};
const INIT_CONTACTS = [
  {...ALL_MEMBERS.a1b2c3, unread:2},
  {...ALL_MEMBERS.d4e5f6, unread:0},
  {...ALL_MEMBERS.g7h8i9, unread:0},
];
const INIT_GROUPS = [
  {id:"grp_001", name:"grupa_projekt", memberIds:["a1b2c3","d4e5f6","g7h8i9","m1n2o3"], online:3, unread:1, epoch:3, visibility:"PRIVATE",  invitePolicy:"ADMINS_ONLY", forcedTTL:null, isFounder:true },
  {id:"grp_002", name:"grupa_alfa",    memberIds:["a1b2c3","d4e5f6"],                   online:2, unread:0, epoch:1, visibility:"HIDDEN",   invitePolicy:"FOUNDER_ONLY",forcedTTL:300,  isFounder:false},
];
const MSGS = {
  a1b2c3:[
    {id:1,from:"them",sid:"a1b2c3",text:"połączenie nawiązane",        ts:"14:21",eph:false},
    {id:2,from:"me",              text:"potwierdzam. klucze OK",        ts:"14:21",eph:false},
    {id:3,from:"them",sid:"a1b2c3",text:"ta wiadomość zniknie za 5min",ts:"14:22",eph:true,ttl:300,rem:287},
    {id:4,from:"them",sid:"a1b2c3",text:"forward secrecy aktywne",     ts:"14:23",eph:false},
  ],
  d4e5f6:[
    {id:1,from:"them",sid:"d4e5f6",text:"bootstrap przez węzeł B OK",ts:"13:10",eph:false},
    {id:2,from:"me",              text:"widzę 6 węzłów w sieci",      ts:"13:11",eph:false},
  ],
  g7h8i9:[], m1n2o3:[],
  grp_001:[
    {id:1,from:"kontakt_7f3a",sid:"a1b2c3",text:"klucz grupowy epoch=3 aktywny",    ts:"12:00",eph:false},
    {id:2,from:"me",                        text:"potwierdzam rotację",               ts:"12:01",eph:false},
    {id:3,from:"kontakt_2c9b",sid:"d4e5f6",text:"synchronizacja logu operacji OK",  ts:"12:02",eph:false},
    {id:4,from:"kontakt_a5d1",sid:"g7h8i9",text:"węzły zsynchronizowane",           ts:"12:03",eph:true,ttl:60,rem:42},
    {id:5,from:"kontakt_f8e2",sid:"m1n2o3",text:"widzę 4 aktywnych uczestników",    ts:"12:04",eph:false},
  ],
  grp_002:[
    {id:1,from:"kontakt_7f3a",sid:"a1b2c3",text:"sprawdzam połączenie",ts:"11:00",eph:false},
    {id:2,from:"me",                        text:"OK, jestem",          ts:"11:01",eph:false},
  ],
};

// ─── IKONY ────────────────────────────────────────────────────────────────────
const P = {
  lock:   "M12 17v-2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  send:   "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  qr:     "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z",
  users:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  plus:   "M12 5v14M5 12h14",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  clock:  "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  close:  "M18 6L6 18M6 6l12 12",
  check:  "M20 6L9 17l-5-5",
  wifi:   "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  key:    "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  alert:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  eyeoff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  user:   "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  back:   "M19 12H5M12 19l-7-7 7-7",
  camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  image:  "M21 15l-5-5L5 21M3 3h18v18H3zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  x:      "M18 6L6 18M6 6l12 12",
  trash:  "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  chevLeft:  "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
  chevDown:  "M6 9l6 6 6-6",
  chevUp:    "M18 15l-6-6-6 6",
  menu:      "M3 12h18M3 6h18M3 18h18",
  info:      "M12 16v-4M12 8h.01M12 22a10 10 0 100-20 10 10 0 000 20z",
};
function Ico({name,size=16,color=C.dim,style={}}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,display:"block",...style}}>
      <path d={P[name]}/>
    </svg>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({size=48}) {
  const c=size/2, r=size*0.19;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect x="1" y="1" width={size-2} height={size-2} rx={size*0.12} stroke={C.green} strokeWidth="1" opacity="0.3"/>
      <circle cx={c} cy={c} r={r*1.5} stroke={C.green} strokeWidth="1.5"/>
      <circle cx={c} cy={c} r={r*0.4} fill={C.green}/>
      <line x1={c} y1={c-r*1.5} x2={c} y2={size*0.1} stroke={C.green} strokeWidth="1" opacity="0.7"/>
      <line x1={c} y1={c+r*1.5} x2={c} y2={size*0.9} stroke={C.green} strokeWidth="1" opacity="0.7"/>
      <line x1={c-r*1.5} y1={c} x2={size*0.1} y2={c} stroke={C.green} strokeWidth="1" opacity="0.7"/>
      <line x1={c+r*1.5} y1={c} x2={size*0.9} y2={c} stroke={C.green} strokeWidth="1" opacity="0.7"/>
    </svg>
  );
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
function Boot({onDone}) {
  const [step,setStep]=useState(0);
  const steps=["inicjalizacja tora...","generowanie .onion...","wymiana kluczy x3dh...","weryfikacja tożsamości...","połączenie nawiązane"];
  useEffect(()=>{
    const t=setTimeout(()=>{ step<steps.length-1?setStep(s=>s+1):onDone(); },step<steps.length-1?550:700);
    return ()=>clearTimeout(t);
  },[step]);
  return (
    <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:F,zIndex:999}}>
      <Logo size={64}/>
      <div style={{marginTop:40,width:280}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",opacity:i<=step?1:0.18,transition:"opacity 0.3s"}}>
            <span style={{width:12,fontSize:11,color:C.green}}>{i<step?"✓":i===step?"›":"·"}</span>
            <span style={{fontSize:11,color:i<step?C.greenDim:i===step?C.green:C.faint,letterSpacing:0.4}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOR STATUS ───────────────────────────────────────────────────────────────
function TorDot({status="connected"}) {
  const col=status==="connected"?C.green:status==="connecting"?C.yellow:C.red;
  const lbl=status==="connected"?"TOR: aktywny":status==="connecting"?"TOR: łączenie...":"TOR: błąd";
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:col,boxShadow:`0 0 6px ${col}`}}/>
      <span style={{fontSize:10,color:col,fontFamily:F,letterSpacing:0.8}}>{lbl}</span>
    </div>
  );
}

// ─── TAG (E2E / TOR) ──────────────────────────────────────────────────────────
function Tag({icon,label,color,bg}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:4,background:bg,border:`1px solid ${color}22`,borderRadius:2,padding:"3px 7px"}}>
      <Ico name={icon} size={10} color={color}/>
      <span style={{fontSize:9,color,fontFamily:F,letterSpacing:0.8}}>{label}</span>
    </div>
  );
}

// ─── MODAL: QR ───────────────────────────────────────────────────────────────
function QRModal({onClose}) {
  const addr="ab3xk9p2mwq7nvs1.onion";
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:28,width:300,maxWidth:"calc(100vw - 32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontSize:12,color:C.green,letterSpacing:1}}>TWÓJ ADRES</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}><Ico name="close" color={C.dim}/></button>
        </div>
        <div style={{background:"#fff",padding:12,borderRadius:2,display:"grid",gridTemplateColumns:"repeat(17,1fr)",gap:2,marginBottom:18}}>
          {Array.from({length:289}).map((_,i)=>{
            const r=Math.floor(i/17),cc=i%17;
            const dark=(r<5&&cc<5)||(r<5&&cc>11)||(r>11&&cc<5)||((i*7+13)%3===0);
            return <div key={i} style={{width:7,height:7,background:dark?"#000":"#fff"}}/>;
          })}
        </div>
        <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:2,padding:"10px 12px",marginBottom:10}}>
          <div style={{fontSize:9,color:C.dim,marginBottom:4}}>twoja nazwa</div>
          <div style={{fontSize:13,color:C.text,fontFamily:F,marginBottom:6}}>mój_kontakt</div>
          <div style={{fontSize:9,color:C.dim,marginBottom:4}}>adres tor</div>
          <div style={{fontSize:10,color:C.green,wordBreak:"break-all",letterSpacing:0.4}}>{addr}</div>
        </div>
        <div style={{fontSize:9,color:C.dim,lineHeight:1.7}}>pokaż ten QR aby dodać cię jako kontakt. adres nie ujawnia twojej lokalizacji.</div>
      </div>
    </div>
  );
}

// ─── MODAL: DODAJ KONTAKT ────────────────────────────────────────────────────
function AddContactModal({onAdd,onClose}) {
  const [step,setStep]=useState("form");
  const [onion,setOnion]=useState("");
  const [name,setName]=useState("");
  const [err,setErr]=useState("");
  const [dots,setDots]=useState(0);

  useEffect(()=>{
    if(step!=="verify") return;
    const ti=setInterval(()=>setDots(d=>(d+1)%4),400);
    const td=setTimeout(()=>setStep("done"),3000);
    return ()=>{ clearInterval(ti); clearTimeout(td); };
  },[step]);

  const validate=()=>{
    const t=onion.trim().toLowerCase();
    if(!t){ setErr("wpisz adres .onion"); return; }
    if(!t.endsWith(".onion")){ setErr("adres musi kończyć się na .onion"); return; }
    if(t.length<12){ setErr("adres jest za krótki"); return; }
    setErr(""); setStep("verify");
  };

  const finish=()=>{
    const displayName=name.trim()||"kontakt_"+onion.trim().slice(0,4);
    onAdd({
      id:   onion.trim().replace(".onion","").slice(-6),
      name: displayName,
      onion:onion.trim().toLowerCase(),
      trust:"DIRECT", online:true, lastSeen:"teraz", unread:0,
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:28,width:340,maxWidth:"calc(100vw - 32px)"}}>

        {/* Nagłówek */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:3,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico name="plus" size={16} color={C.green}/>
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>dodaj kontakt</div>
              <div style={{fontSize:9,color:C.dim,marginTop:2}}>
                {step==="form"?"wpisz adres .onion":step==="verify"?"weryfikacja przez tor...":"kontakt dodany"}
              </div>
            </div>
          </div>
          {step!=="verify" && (
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>
              <Ico name="close" color={C.dim}/>
            </button>
          )}
        </div>

        {/* FORMULARZ */}
        {step==="form" && (
          <div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:6}}>ADRES .ONION *</div>
              <input
                autoFocus
                value={onion}
                onChange={e=>{ setOnion(e.target.value); setErr(""); }}
                onKeyDown={e=>e.key==="Enter"&&validate()}
                placeholder="np. x7wqibd4zmbxojl5.onion"
                style={{width:"100%",background:C.bg,border:`1px solid ${err?C.red:C.border}`,borderRadius:3,padding:"10px 12px",color:C.green,fontSize:12,fontFamily:F,outline:"none",letterSpacing:0.4,boxSizing:"border-box"}}
              />
              {err && <div style={{fontSize:9,color:C.red,marginTop:5}}>⚠ {err}</div>}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:6}}>NAZWA KONTAKTU</div>
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&validate()}
                placeholder="np. Jan Kowalski"
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 12px",color:C.text,fontSize:12,fontFamily:F,outline:"none",boxSizing:"border-box"}}
              />
              <div style={{fontSize:9,color:C.dim,marginTop:4}}>jeśli pusta — użyjemy fragmentu adresu</div>
            </div>
            <div style={{background:"rgba(0,255,135,0.04)",border:"1px solid rgba(0,255,135,0.12)",borderRadius:3,padding:"10px 12px",marginBottom:20}}>
              <div style={{fontSize:9,color:C.green,letterSpacing:1,marginBottom:5}}>JAK UZYSKAĆ ADRES</div>
              <div style={{fontSize:9,color:C.dim,lineHeight:1.8}}>
                · poproś kontakt o pokazanie jego QR<br/>
                · zeskanuj QR lub przepisz adres ręcznie<br/>
                · adres .onion nigdy nie ujawnia lokalizacji
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F,letterSpacing:0.8}}>
                ANULUJ
              </button>
              <button onClick={validate} style={{flex:2,padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:11,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Ico name="key" size={12} color={C.green}/>
                POŁĄCZ PRZEZ TOR
              </button>
            </div>
          </div>
        )}

        {/* WERYFIKACJA */}
        {step==="verify" && (
          <div style={{padding:"8px 0"}}>
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 14px",marginBottom:16}}>
              <div style={{fontSize:9,color:C.dim,marginBottom:4}}>łączę z</div>
              <div style={{fontSize:11,color:C.green,fontFamily:F,wordBreak:"break-all",letterSpacing:0.4}}>{onion.trim()}</div>
            </div>
            {["nawiązywanie połączenia tor","wymiana kluczy x3dh","weryfikacja tożsamości węzła","inicjalizacja signal protocol"].map((label,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",opacity:dots>=i?1:0.2,transition:"opacity 0.4s"}}>
                <span style={{fontSize:11,color:C.green,width:14,flexShrink:0}}>{dots>i?"✓":dots===i?"›":"·"}</span>
                <span style={{fontSize:11,color:dots>=i?C.green:C.faint,fontFamily:F}}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* GOTOWE */}
        {step==="done" && (
          <div>
            <div style={{textAlign:"center",padding:"12px 0 20px"}}>
              <div style={{width:52,height:52,borderRadius:4,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <Ico name="check" size={24} color={C.green}/>
              </div>
              <div style={{fontSize:15,color:C.text,fontFamily:F,marginBottom:4}}>
                {name.trim()||"kontakt_"+onion.trim().slice(0,4)}
              </div>
              <div style={{fontSize:9,color:C.dim}}>kontakt dodany · połączenie aktywne</div>
            </div>
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 14px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:9,color:C.dim}}>adres tor</span>
                <span style={{fontSize:9,color:C.green,textAlign:"right",wordBreak:"break-all",maxWidth:"65%"}}>{shortOnion(onion.trim())}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:9,color:C.dim}}>zaufanie</span>
                <span style={{fontSize:9,color:C.green}}>bezpośrednie</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:9,color:C.dim}}>protokół</span>
                <span style={{fontSize:9,color:C.text}}>signal + tor</span>
              </div>
            </div>
            <button onClick={finish} style={{width:"100%",padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:11,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Ico name="send" size={12} color={C.green}/>
              PRZEJDŹ DO ROZMOWY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL: PRYWATNY CZAT ────────────────────────────────────────────────────
function PrivateModal({member,groupName,onConfirm,onCancel}) {
  return (
    <div onClick={onCancel} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:"1px solid #2A2A4A",borderRadius:6,padding:28,width:340,maxWidth:"calc(100vw - 32px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:4,background:C.purpleFaint,border:"1px solid rgba(155,109,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ico name="eyeoff" size={18} color={C.purple}/>
          </div>
          <div>
            <div style={{fontSize:13,color:C.text,fontFamily:F}}>prywatna rozmowa</div>
            <div style={{fontSize:9,color:C.dim,marginTop:3}}>kanał 1:1 poza grupą</div>
          </div>
        </div>
        <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"12px 14px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:C.dim}}>kontakt</span>
            <span style={{fontSize:12,color:C.text,fontFamily:F}}>{member.name}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:C.dim}}>adres tor</span>
            <span style={{fontSize:9,color:C.green,fontFamily:F}}>{shortOnion(member.onion)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:C.dim}}>zaufanie</span>
            <span style={{fontSize:9,color:member.trust==="DIRECT"?C.green:C.yellow}}>
              {member.trust==="DIRECT"?"bezpośrednie":"pośrednie"}
            </span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:9,color:C.dim}}>kontekst</span>
            <span style={{fontSize:9,color:C.dim}}>{groupName}</span>
          </div>
        </div>
        <div style={{background:"rgba(155,109,255,0.06)",border:"1px solid rgba(155,109,255,0.18)",borderRadius:4,padding:"10px 14px",marginBottom:20}}>
          <div style={{fontSize:9,color:C.purple,letterSpacing:1,marginBottom:6}}>CO TO ZNACZY</div>
          <div style={{fontSize:10,color:C.dim,lineHeight:1.9}}>
            · nowy kanał Tor bezpośrednio do {member.name}<br/>
            · reszta grupy nie widzi tej rozmowy<br/>
            · reszta grupy nie wie że rozmawiasz<br/>
            · osobne klucze Signal Protocol
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F,letterSpacing:0.8}}>
            ANULUJ
          </button>
          <button onClick={onConfirm} style={{flex:2,padding:"10px 0",background:C.purpleFaint,border:"1px solid rgba(155,109,255,0.35)",borderRadius:3,cursor:"pointer",color:C.purple,fontSize:11,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Ico name="lock" size={12} color={C.purple}/>
            OTWÓRZ PRYWATNY KANAŁ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NICK (klikalny w grupie) ────────────────────────────────────────────────
function Nick({senderId,name,members,onPrivate}) {
  const [hov,setHov]=useState(false);
  const m=members[senderId];
  if(!m) return <span style={{fontSize:9,color:C.dim,fontFamily:F}}>{name}</span>;
  return (
    <button
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onPrivate(m)}
      title="Prywatna rozmowa"
      style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"inline-flex",alignItems:"center",gap:4}}>
      <span style={{fontSize:9,fontFamily:F,color:hov?C.purple:C.dim,textDecoration:hov?"underline":"none",transition:"color 0.15s"}}>{name}</span>
      {hov && <Ico name="lock" size={9} color={C.purple}/>}
    </button>
  );
}

// ─── WIADOMOŚĆ ────────────────────────────────────────────────────────────────
function Msg({m,isGroup,members,onPrivate}) {
  const isMe=m.from==="me";
  const [rem,setRem]=useState(m.rem??m.ttl??0);
  useEffect(()=>{
    if(!m.eph) return;
    const t=setInterval(()=>setRem(r=>Math.max(0,r-1)),1000);
    return ()=>clearInterval(t);
  },[m.id]);
  const fmt=s=>s<=0?"usunięto":s<60?`${s}s`:s<3600?`${Math.floor(s/60)}m ${s%60}s`:`${Math.floor(s/3600)}h`;

  if(m.eph&&rem<=0) return (
    <div style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:8}}>
      <span style={{fontSize:10,color:C.faint,fontFamily:F,fontStyle:"italic"}}>[wiadomość usunięta]</span>
    </div>
  );

  // Wiadomość ze zdjęciem
  if(m.type==="photo") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",marginBottom:4}}>
      {isGroup&&!isMe&&(
        <div style={{marginBottom:3,paddingLeft:2}}>
          <Nick senderId={m.sid} name={m.from} members={members} onPrivate={onPrivate}/>
        </div>
      )}
      <PhotoMsg m={m} isMe={isMe}/>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",marginBottom:12}}>
      {isGroup&&!isMe&&(
        <div style={{marginBottom:3,paddingLeft:2}}>
          <Nick senderId={m.sid} name={m.from} members={members} onPrivate={onPrivate}/>
        </div>
      )}
      <div style={{maxWidth:"75%",background:isMe?C.greenFaint:C.surfaceHi,border:`1px solid ${isMe?"rgba(0,255,135,0.18)":C.border}`,borderRadius:3,padding:"8px 12px"}}>
        {m.eph&&(
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
            <Ico name="clock" size={10} color={C.yellow}/>
            <span style={{fontSize:9,color:C.yellow,fontFamily:F}}>efemeryczna · {fmt(rem)}</span>
          </div>
        )}
        <div style={{fontSize:13,color:C.text,fontFamily:F,lineHeight:1.55,opacity:m.eph&&rem<30?0.4:1,transition:"opacity 1s"}}>{m.text}</div>
        <div style={{fontSize:9,color:C.dim,marginTop:4,fontFamily:F,textAlign:isMe?"right":"left"}}>{m.ts}{isMe&&" · ✓"}</div>
      </div>
    </div>
  );
}

// ─── MODAL: PODGLĄD ZDJĘCIA PRZED WYSYŁKĄ ────────────────────────────────────
function PhotoPreviewModal({dataUrl, onSend, onCancel}) {
  const [stage, setStage] = useState("preview"); // preview | processing | ready
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([
    {label:"usuwanie metadanych GPS",    done:false, active:false},
    {label:"usuwanie danych urządzenia", done:false, active:false},
    {label:"re-kompresja obrazu",        done:false, active:false},
    {label:"szyfrowanie Signal",         done:false, active:false},
  ]);

  const runProcessing = () => {
    setStage("processing");
    let i = 0;
    const run = () => {
      if (i >= steps.length) { setStage("ready"); setProgress(100); return; }
      setSteps(s => s.map((x,idx) => idx===i ? {...x,active:true} : x));
      setProgress(Math.round((i/steps.length)*100));
      setTimeout(()=>{
        setSteps(s => s.map((x,idx) => idx===i ? {...x,done:true,active:false} : x));
        i++; run();
      }, 500 + Math.random()*300);
    };
    run();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.94)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:300,fontFamily:F}}>
      <div style={{width:340,maxWidth:"calc(100vw - 24px)",display:"flex",flexDirection:"column",gap:0}}>

        {/* Nagłówek */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Ico name="camera" size={16} color={C.green}/>
            <span style={{fontSize:12,color:C.green,letterSpacing:1}}>
              {stage==="preview"?"PODGLĄD":stage==="processing"?"SANITYZACJA...":"GOTOWE DO WYSYŁKI"}
            </span>
          </div>
          {stage==="preview"&&(
            <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>
              <Ico name="x" size={18} color={C.dim}/>
            </button>
          )}
        </div>

        {/* Zdjęcie */}
        <div style={{position:"relative",borderRadius:4,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:12}}>
          <img src={dataUrl} alt="" style={{width:"100%",display:"block",maxHeight:280,objectFit:"cover",
            filter: stage==="processing"?"blur(3px) brightness(0.6)":"none",
            transition:"filter 0.3s"
          }}/>

          {/* Overlay processing */}
          {stage==="processing"&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
              <div style={{fontSize:11,color:C.green,fontFamily:F,letterSpacing:1}}>SANITYZACJA</div>
              {/* Animowany scan-line */}
              <div style={{width:"80%",height:2,background:C.green,boxShadow:`0 0 8px ${C.green}`,animation:"scanline 1s linear infinite"}}/>
            </div>
          )}

          {/* Overlay ready */}
          {stage==="ready"&&(
            <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.75)",borderRadius:3,padding:"4px 8px",display:"flex",alignItems:"center",gap:5}}>
              <Ico name="check" size={11} color={C.green}/>
              <span style={{fontSize:9,color:C.green,fontFamily:F}}>EXIF usunięty</span>
            </div>
          )}
        </div>

        {/* Pasek postępu */}
        {(stage==="processing"||stage==="ready")&&(
          <div style={{marginBottom:12}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 12px"}}>
              {steps.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",opacity:s.done||s.active?1:0.25,transition:"opacity 0.3s"}}>
                  <span style={{width:12,fontSize:10,color:C.green,flexShrink:0}}>
                    {s.done?"✓":s.active?"›":"·"}
                  </span>
                  <span style={{fontSize:10,color:s.done?C.greenDim:s.active?C.green:C.faint,fontFamily:F,flex:1}}>{s.label}</span>
                  {s.active&&<div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse 0.8s infinite"}}/>}
                </div>
              ))}
              {/* Pasek */}
              <div style={{marginTop:10,height:2,background:C.faint,borderRadius:1}}>
                <div style={{height:"100%",width:`${progress}%`,background:C.green,borderRadius:1,boxShadow:`0 0 6px ${C.green}`,transition:"width 0.4s"}}/>
              </div>
            </div>
          </div>
        )}

        {/* Info o prywatności — tylko w preview */}
        {stage==="preview"&&(
          <div style={{background:"rgba(0,255,135,0.04)",border:"1px solid rgba(0,255,135,0.12)",borderRadius:3,padding:"10px 12px",marginBottom:12}}>
            <div style={{fontSize:9,color:C.green,letterSpacing:1,marginBottom:5}}>PRZED WYSYŁKĄ ZOSTANIE USUNIĘTE</div>
            <div style={{fontSize:9,color:C.dim,lineHeight:1.8}}>
              · GPS i lokalizacja z EXIF<br/>
              · model i numer seryjny aparatu<br/>
              · data i godzina wykonania zdjęcia<br/>
              · miniatura i inne metadane
            </div>
          </div>
        )}

        {/* Przyciski */}
        {stage==="preview"&&(
          <div style={{display:"flex",gap:8}}>
            <button onClick={onCancel} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Ico name="trash" size={12} color={C.dim}/>ANULUJ
            </button>
            <button onClick={runProcessing} style={{flex:2,padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:11,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Ico name="lock" size={12} color={C.green}/>SANITYZUJ I WYŚLIJ
            </button>
          </div>
        )}

        {stage==="ready"&&(
          <button onClick={()=>onSend(dataUrl)} style={{width:"100%",padding:"11px 0",background:C.green,border:"none",borderRadius:3,cursor:"pointer",color:C.bg,fontSize:12,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:500}}>
            <Ico name="send" size={14} color={C.bg}/>WYŚLIJ ZASZYFROWANE
          </button>
        )}
      </div>

      <style>{`@keyframes scanline{0%{transform:translateY(-60px)}100%{transform:translateY(60px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ─── WIADOMOŚĆ ZE ZDJĘCIEM ────────────────────────────────────────────────────
function PhotoMsg({m, isMe}) {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <>
      <div style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",marginBottom:12}}>
        <div style={{maxWidth:"72%",borderRadius:3,overflow:"hidden",border:`1px solid ${isMe?"rgba(0,255,135,0.18)":C.border}`,cursor:"pointer",position:"relative"}} onClick={()=>setFullscreen(true)}>
          <img src={m.photoUrl} alt="" style={{width:"100%",display:"block",maxHeight:220,objectFit:"cover"}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 8px",background:"linear-gradient(transparent,rgba(0,0,0,0.7))",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <Ico name="lock" size={9} color={C.green}/>
              <span style={{fontSize:8,color:C.green,fontFamily:F}}>e2e · exif usunięty</span>
            </div>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.5)",fontFamily:F}}>{m.ts}{isMe&&" · ✓"}</span>
          </div>
        </div>
      </div>
      {fullscreen&&(
        <div onClick={()=>setFullscreen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400}}>
          <img src={m.photoUrl} alt="" style={{maxWidth:"95vw",maxHeight:"90vh",objectFit:"contain",borderRadius:3}}/>
          <button onClick={()=>setFullscreen(false)} style={{position:"absolute",top:16,right:16,background:"rgba(0,0,0,0.6)",border:`1px solid ${C.border}`,borderRadius:3,padding:8,cursor:"pointer",display:"flex"}}>
            <Ico name="x" size={18} color={C.text}/>
          </button>
          <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.75)",borderRadius:3,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
            <Ico name="lock" size={11} color={C.green}/>
            <span style={{fontSize:10,color:C.green,fontFamily:F}}>zaszyfrowane · metadane usunięte</span>
          </div>
        </div>
      )}
    </>
  );
}

// ─── HELPER: generuj deterministyczny fingerprint z nazwy ────────────────────
const makeFingerprint = (seed="") => {
  const chars="0123456789ABCDEF";
  let h=5381;
  for(let i=0;i<seed.length;i++) h=((h<<5)+h)+seed.charCodeAt(i);
  let out="";
  for(let i=0;i<40;i++){
    h=((h<<5)+h)^((h>>3)+i*7+31);
    out+=chars[Math.abs(h)%16];
    if(i%4===3&&i<39) out+=" ";
  }
  return out;
};

const TOR_NODES = [
  {role:"Entry Guard",   country:"🇩🇪", city:"Frankfurt",  ip:"185.220.xxx.xxx", latency:"12ms",  color:C.green},
  {role:"Middle Relay",  country:"🇳🇱", city:"Amsterdam",  ip:"194.165.xxx.xxx", latency:"28ms",  color:C.green},
  {role:"Exit Relay",    country:"🇸🇪", city:"Stockholm",  ip:"192.42.xxx.xxx",  latency:"41ms",  color:C.green},
];

// ─── MODAL: E2E STATUS ────────────────────────────────────────────────────────
function E2EModal({chat, onClose}) {
  const [verified, setVerified] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const fp = makeFingerprint((chat?.onion||"")+(chat?.name||""));
  const myFp = makeFingerprint("my_phantom_node_key");

  const copyFp = () => {
    navigator.clipboard?.writeText(fp).catch(()=>{});
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:24,width:380,maxWidth:"calc(100vw - 24px)",maxHeight:"90vh",overflowY:"auto"}}>

        {/* Nagłówek */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:3,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico name="lock" size={18} color={C.green}/>
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>szyfrowanie end-to-end</div>
              <div style={{fontSize:9,color:C.dim,marginTop:2}}>signal protocol · double ratchet</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}><Ico name="x" size={18} color={C.dim}/></button>
        </div>

        {/* Status weryfikacji */}
        <div style={{background:verified?"rgba(0,255,135,0.06)":"rgba(255,180,0,0.06)",border:`1px solid ${verified?"rgba(0,255,135,0.2)":"rgba(255,180,0,0.2)"}`,borderRadius:4,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <Ico name={verified?"check":"alert"} size={18} color={verified?C.green:C.yellow}/>
          <div>
            <div style={{fontSize:11,color:verified?C.green:C.yellow,fontFamily:F,marginBottom:2}}>
              {verified?"klucz zweryfikowany osobiście":"klucz niezweryfikowany"}
            </div>
            <div style={{fontSize:9,color:C.dim,lineHeight:1.6}}>
              {verified
                ?"rozmowa jest bezpieczna. nikt nie jest pośrodku."
                :"porównaj fingerprint z rozmówcą osobiście lub przez inny kanał."
              }
            </div>
          </div>
        </div>

        {/* Fingerprint kontaktu */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>FINGERPRINT — {(chat?.name||"kontakt").toUpperCase()}</div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"12px 14px",marginBottom:6}}>
            <div style={{fontSize:13,color:C.green,fontFamily:F,letterSpacing:2,lineHeight:2,wordBreak:"break-all",textAlign:"center"}}>
              {fp.split(" ").map((chunk,i)=>(
                <span key={i} style={{display:"inline-block",margin:"0 4px 4px",background:"rgba(0,255,135,0.07)",borderRadius:2,padding:"2px 6px"}}>{chunk}</span>
              ))}
            </div>
          </div>
          <button onClick={copyFp} style={{width:"100%",padding:"7px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:copied?C.green:C.dim,fontSize:10,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"color 0.2s"}}>
            <Ico name="check" size={11} color={copied?C.green:C.dim}/>
            {copied?"skopiowano!":"kopiuj fingerprint"}
          </button>
        </div>

        {/* Fingerprint własny */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>TWÓJ FINGERPRINT</div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 14px"}}>
            <div style={{fontSize:11,color:C.dim,fontFamily:F,letterSpacing:1.5,lineHeight:1.8,wordBreak:"break-all",textAlign:"center"}}>
              {myFp.split(" ").map((chunk,i)=>(
                <span key={i} style={{display:"inline-block",margin:"0 3px 3px"}}>{chunk}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Jak weryfikować */}
        <div style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 14px",marginBottom:16}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:6}}>JAK WERYFIKOWAĆ</div>
          <div style={{fontSize:9,color:C.dim,lineHeight:1.9}}>
            1. poproś {chat?.name||"kontakt"} aby odczytał swój fingerprint<br/>
            2. porównaj z tym co widzisz powyżej<br/>
            3. jeśli identyczne — potwierdź poniżej<br/>
            4. jeśli różne — ktoś może być pośrodku
          </div>
        </div>

        {/* Szyfrowanie info */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
          {[
            ["protokół",    "Signal Protocol"],
            ["wymiana kluczy","X3DH + Curve25519"],
            ["szyfr",       "AES-256-GCM"],
            ["forward secrecy","Double Ratchet"],
          ].map(([l,v])=>(
            <div key={l} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"8px 10px"}}>
              <div style={{fontSize:8,color:C.dim,letterSpacing:1,marginBottom:3}}>{l.toUpperCase()}</div>
              <div style={{fontSize:9,color:C.text,fontFamily:F}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Przyciski */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F}}>ZAMKNIJ</button>
          <button onClick={()=>setVerified(v=>!v)} style={{flex:2,padding:"10px 0",background:verified?"rgba(255,180,0,0.08)":C.greenFaint,border:`1px solid ${verified?"rgba(255,180,0,0.3)":"rgba(0,255,135,0.3)"}`,borderRadius:3,cursor:"pointer",color:verified?C.yellow:C.green,fontSize:11,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Ico name={verified?"alert":"check"} size={12} color={verified?C.yellow:C.green}/>
            {verified?"COFNIJ WERYFIKACJĘ":"POTWIERDZAM — KLUCZ ZGODNY"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: TOR STATUS ────────────────────────────────────────────────────────
function TorModal({chat, onClose}) {
  const [refreshing, setRefreshing] = useState(false);
  const [nodes,      setNodes]      = useState(TOR_NODES);
  const [totalLatency, setTotal]    = useState(81);
  const circuitId = makeFingerprint((chat?.onion||"tor")+"circuit").slice(0,19).replace(/ /g,"");

  const refresh = () => {
    setRefreshing(true);
    setTimeout(()=>{
      const newLatencies = [
        8+Math.floor(Math.random()*20),
        20+Math.floor(Math.random()*30),
        35+Math.floor(Math.random()*25),
      ];
      setNodes(TOR_NODES.map((n,i)=>({...n,latency:newLatencies[i]+"ms"})));
      setTotal(newLatencies.reduce((a,b)=>a+b,0));
      setRefreshing(false);
    },1500);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:24,width:380,maxWidth:"calc(100vw - 24px)",maxHeight:"90vh",overflowY:"auto"}}>

        {/* Nagłówek */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:3,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico name="wifi" size={18} color={C.green}/>
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>status sieci tor</div>
              <div style={{fontSize:9,color:C.dim,marginTop:2}}>3-węzłowy obwód · onion routing</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}><Ico name="x" size={18} color={C.dim}/></button>
        </div>

        {/* Status globalny */}
        <div style={{background:"rgba(0,255,135,0.05)",border:"1px solid rgba(0,255,135,0.18)",borderRadius:4,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.green,boxShadow:`0 0 6px ${C.green}`}}/>
            <span style={{fontSize:11,color:C.green,fontFamily:F}}>TOR AKTYWNY</span>
          </div>
          <div style={{fontSize:9,color:C.dim}}>łączna latencja: <span style={{color:C.text}}>{refreshing?"...":totalLatency+"ms"}</span></div>
        </div>

        {/* Circuit ID */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:6}}>ID OBWODU (CIRCUIT)</div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"8px 12px",fontSize:10,color:C.green,fontFamily:F,letterSpacing:1,wordBreak:"break-all"}}>
            {circuitId}
          </div>
        </div>

        {/* Węzły */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>WĘZŁY OBWODU</div>

          {/* Wizualizacja trasy */}
          <div style={{display:"flex",alignItems:"center",marginBottom:12,gap:0}}>
            <div style={{fontSize:9,color:C.dim,fontFamily:F,padding:"4px 8px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:3}}>TY</div>
            {nodes.map((n,i)=>(
              <React.Fragment key={i}>
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.green}44,${C.green})`,position:"relative"}}>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:7,color:C.green,background:C.bg,padding:"0 3px"}}>{n.latency}</div>
                </div>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.green,boxShadow:`0 0 4px ${C.green}`,flexShrink:0}}/>
              </React.Fragment>
            ))}
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.green},${C.green}44)`}}/>
            <div style={{fontSize:9,color:C.dim,fontFamily:F,padding:"4px 8px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{chat?.name||"cel"}</div>
          </div>

          {/* Tabela węzłów */}
          {nodes.map((n,i)=>(
            <div key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:`${C.green}15`,border:`1px solid ${C.green}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:9,color:C.green,fontFamily:F,fontWeight:700}}>{i+1}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:10,color:C.text,fontFamily:F}}>{n.role}</span>
                  <span style={{fontSize:9,color:C.dim}}>{n.country} {n.city}</span>
                </div>
                <div style={{fontSize:9,color:C.dim,fontFamily:F}}>{n.ip}</div>
              </div>
              <div style={{fontSize:10,color:refreshing?"#555":C.green,fontFamily:F,flexShrink:0}}>
                {refreshing?"···":n.latency}
              </div>
            </div>
          ))}
        </div>

        {/* Co widzi każdy węzeł */}
        <div style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 14px",marginBottom:16}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>CO WIDZI KAŻDY WĘZEŁ</div>
          {[
            ["węzeł 1 (entry)", "zna twój IP,  NIE zna odbiorcy ani treści"],
            ["węzeł 2 (middle)","NIE zna ani nadawcy, ani odbiorcy"],
            ["węzeł 3 (exit)",  "zna odbiorcę (.onion),  NIE zna twojego IP"],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:8,marginBottom:5}}>
              <span style={{fontSize:9,color:C.green,flexShrink:0,minWidth:110}}>{l}</span>
              <span style={{fontSize:9,color:C.dim,lineHeight:1.5}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Cel połączenia */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:6}}>CEL POŁĄCZENIA</div>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:9,color:C.dim}}>adres hidden service</span>
            <span style={{fontSize:9,color:C.green,fontFamily:F}}>{shortOnion(chat?.onion)||"n/d"}</span>
          </div>
        </div>

        {/* Przyciski */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F}}>ZAMKNIJ</button>
          <button onClick={refresh} disabled={refreshing} style={{flex:2,padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:refreshing?"default":"pointer",color:C.green,fontSize:11,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:refreshing?0.6:1}}>
            <Ico name="wifi" size={12} color={C.green}/>
            {refreshing?"budowanie nowego obwodu...":"NOWY OBWÓD TOR"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL CZATU ──────────────────────────────────────────────────────────────
function ChatPanel({chat, onPrivate, onBack, onToggleRight, onInfoOpen, rightOpen}) {
  const [input,setInput]=useState("");
  const [ttl,setTTL]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [photoPreview,setPhotoPreview]=useState(null);
  const [showE2E, setShowE2E]=useState(false);
  const [showTor, setShowTor]=useState(false);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);
  const fileInputRef=useRef(null);

  useEffect(()=>{
    setMsgs(chat?(MSGS[chat.id]||[]).map(x=>({...x})):[]);
    setInput(""); setTTL(null);
  },[chat?.id,chat?.fromGroup]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send=()=>{
    if(!input.trim()) return;
    setMsgs(ms=>[...ms,{id:Date.now(),from:"me",text:input,ts:new Date().toLocaleTimeString("pl",{hour:"2-digit",minute:"2-digit"}),eph:ttl!==null,ttl,rem:ttl}]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleFileChange=(e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    // Wyczyść input żeby można było wybrać ten sam plik ponownie
    e.target.value="";
  };

  const handleSendPhoto=(dataUrl)=>{
    setPhotoPreview(null);
    setMsgs(ms=>[...ms,{
      id:Date.now(), from:"me", type:"photo", photoUrl:dataUrl,
      ts:new Date().toLocaleTimeString("pl",{hour:"2-digit",minute:"2-digit"}),
      eph:ttl!==null, ttl, rem:ttl,
    }]);
  };

  const grpMembers=chat?.type==="group"
    ? Object.fromEntries((chat.memberIds||[]).map(id=>[id,ALL_MEMBERS[id]]).filter(([,v])=>v))
    : {};

  if(!chat) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:F}}>
      <Logo size={56}/>
      <div style={{marginTop:20,fontSize:13,color:C.dim}}>wybierz kontakt lub grupę</div>
      <div style={{marginTop:6,fontSize:10,color:C.faint}}>wszystkie połączenia przez tor</div>
    </div>
  );

  const isGroup=chat.type==="group";
  const isPriv=!!chat.fromGroup;
  const accent=isPriv?C.purple:C.green;
  const accentFt=isPriv?C.purpleFaint:C.greenFaint;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden"}}>

      {/* HEADER */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
          {onBack&&(
            <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexShrink:0}}>
              <Ico name="back" size={18} color={C.green}/>
            </button>
          )}
          <div style={{width:36,height:36,borderRadius:3,background:accentFt,border:`1px solid ${accent}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico name={isGroup?"users":isPriv?"eyeoff":"shield"} size={16} color={accent}/>
          </div>
          <div style={{minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,color:C.text,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{chat.name}</span>
              {isPriv&&<span style={{fontSize:9,color:C.purple,background:C.purpleFaint,border:"1px solid rgba(155,109,255,0.25)",borderRadius:2,padding:"1px 6px",letterSpacing:1,flexShrink:0}}>PRYWATNY</span>}
            </div>
            <div style={{fontSize:9,color:C.dim,fontFamily:F,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {isGroup
                ? `${chat.memberIds?.length||0} członków · epoch=${chat.epoch}`
                : isPriv
                  ? `prywatny kanał · ${shortOnion(chat.onion)}`
                  : shortOnion(chat.onion)
              }
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          {/* E2E — klikalny */}
          <button onClick={()=>setShowE2E(true)} title="Status szyfrowania E2E" style={{display:"flex",alignItems:"center",gap:4,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.25)",borderRadius:2,padding:"3px 7px",cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,135,0.16)"}
            onMouseLeave={e=>e.currentTarget.style.background=C.greenFaint}>
            <Ico name="lock" size={10} color={C.green}/>
            <span style={{fontSize:9,color:C.green,fontFamily:F,letterSpacing:0.8}}>E2E</span>
          </button>
          {/* TOR — klikalny */}
          <button onClick={()=>setShowTor(true)} title="Status sieci Tor" style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:2,padding:"3px 7px",cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
            <Ico name="wifi" size={10} color={C.dim}/>
            <span style={{fontSize:9,color:C.dim,fontFamily:F,letterSpacing:0.8}}>TOR</span>
          </button>
          {/* Przycisk info / toggle prawego panelu */}
          {onInfoOpen && (
            <button onClick={onInfoOpen} title="Szczegóły" style={{background:"none",border:`1px solid ${C.border}`,borderRadius:2,padding:"3px 6px",cursor:"pointer",display:"flex",alignItems:"center"}}>
              <Ico name="info" size={13} color={C.dim}/>
            </button>
          )}
          {onToggleRight && (
            <button onClick={onToggleRight} title={rightOpen?"Zamknij panel":"Otwórz panel"} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:2,padding:"3px 6px",cursor:"pointer",display:"flex",alignItems:"center"}}>
              <Ico name={rightOpen?"chevRight":"info"} size={13} color={C.dim}/>
            </button>
          )}
        </div>
      </div>

      {/* BANER PRYWATNY */}
      {isPriv&&(
        <div style={{padding:"7px 16px",background:"rgba(155,109,255,0.06)",borderBottom:"1px solid rgba(155,109,255,0.14)",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <Ico name="eyeoff" size={11} color={C.purple}/>
          <span style={{fontSize:10,color:C.purple,fontFamily:F}}>niewidoczna dla pozostałych członków · {chat.fromGroup}</span>
        </div>
      )}

      {/* WIADOMOŚCI */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column"}}>
        {msgs.length===0&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,opacity:0.4}}>
            <Ico name={isPriv?"eyeoff":"lock"} size={28} color={C.faint}/>
            <span style={{fontSize:11,color:C.faint,fontFamily:F}}>{isPriv?"zacznij prywatną rozmowę":"brak wiadomości"}</span>
          </div>
        )}
        {msgs.map(m=><Msg key={m.id} m={m} isGroup={isGroup} members={grpMembers} onPrivate={onPrivate}/>)}
        <div ref={bottomRef}/>
      </div>

      {/* TTL */}
      <div style={{padding:"6px 16px 0",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <Ico name="clock" size={11} color={C.faint}/>
        <span style={{fontSize:9,color:C.faint,fontFamily:F}}>czas życia:</span>
        {[null,30,300,3600].map(t=>(
          <button key={String(t)} onClick={()=>setTTL(t)} style={{padding:"2px 8px",borderRadius:2,background:ttl===t?accentFt:"none",border:`1px solid ${ttl===t?accent+"55":C.border}`,cursor:"pointer",fontSize:9,color:ttl===t?accent:C.dim,fontFamily:F}}>
            {t===null?"∞":t===30?"30s":t===300?"5m":"1h"}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div style={{padding:"10px 16px 16px",display:"flex",gap:8,flexShrink:0}}>
        {/* Ukryty input na plik/zdjęcie */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{display:"none"}}
        />
        {/* Przycisk aparatu */}
        <button
          onClick={()=>fileInputRef.current?.click()}
          style={{width:40,height:40,background:C.surface,border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"border-color 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.green}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
          title="Wyślij zdjęcie (EXIF zostanie usunięty)"
        >
          <Ico name="camera" size={16} color={C.dim}/>
        </button>

        <div style={{flex:1,background:C.surface,border:`1px solid ${isPriv?"rgba(155,109,255,0.22)":C.border}`,borderRadius:3,display:"flex",alignItems:"center",padding:"0 12px"}}>
          {ttl!==null&&<Ico name="clock" size={12} color={C.yellow} style={{marginRight:8}}/>}
          <input
            ref={inputRef} value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder={isPriv?"wiadomość prywatna...":ttl!==null?"wiadomość efemeryczna...":"wiadomość..."}
            style={{flex:1,background:"none",border:"none",outline:"none",color:C.text,fontSize:13,fontFamily:F,padding:"10px 0"}}
          />
        </div>
        <button onClick={send} style={{width:40,height:40,background:input.trim()?accent:accentFt,border:`1px solid ${input.trim()?accent:accent+"33"}`,borderRadius:3,cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ico name="send" size={14} color={input.trim()?C.bg:C.dim}/>
        </button>
      </div>

      {/* MODAL PODGLĄDU ZDJĘCIA */}
      {photoPreview&&(
        <PhotoPreviewModal
          dataUrl={photoPreview}
          onSend={handleSendPhoto}
          onCancel={()=>setPhotoPreview(null)}
        />
      )}

      {/* MODAL E2E */}
      {showE2E && <E2EModal chat={chat} onClose={()=>setShowE2E(false)}/>}

      {/* MODAL TOR */}
      {showTor  && <TorModal chat={chat} onClose={()=>setShowTor(false)}/>}
    </div>
  );
}

// ─── HELPERS: ETYKIETY ───────────────────────────────────────────────────────
const VISIBILITY_OPTS = [
  { val:"HIDDEN",  label:"Ukryta",    desc:"Niewidoczna w sieci. Tylko zaproszeni wiedzą że istnieje.", icon:"eyeoff", color:"#9B6DFF" },
  { val:"PRIVATE", label:"Prywatna",  desc:"Istnienie widoczne w sieci, treść i członkowie zaszyfrowane.", icon:"lock",   color:"#FFB800" },
  { val:"PUBLIC",  label:"Publiczna", desc:"Każdy węzeł w sieci może ją znaleźć i poprosić o dołączenie.", icon:"wifi",   color:"#00FF87" },
];
const INVITE_OPTS = [
  { val:"FOUNDER_ONLY", label:"Tylko założyciel", desc:"Jedyna osoba mogąca zapraszać nowych członków." },
  { val:"ADMINS_ONLY",  label:"Adminowie",        desc:"Wszyscy adminowie grupy mogą zapraszać." },
  { val:"ANY_MEMBER",   label:"Każdy członek",    desc:"Każdy uczestnik może zapraszać znajomych." },
];
const TTL_OPTS = [
  { val:null,    label:"Wyłączone",  desc:"Wiadomości nie znikają automatycznie." },
  { val:60,      label:"1 minuta",   desc:"Wszystkie wiadomości znikają po 1 min." },
  { val:300,     label:"5 minut",    desc:"Wszystkie wiadomości znikają po 5 min." },
  { val:3600,    label:"1 godzina",  desc:"Wszystkie wiadomości znikają po 1h." },
  { val:86400,   label:"24 godziny", desc:"Wszystkie wiadomości znikają po 24h." },
];
const visIcon  = v => VISIBILITY_OPTS.find(o=>o.val===v)?.icon  || "lock";
const visColor = v => VISIBILITY_OPTS.find(o=>o.val===v)?.color || C.green;
const visLabel = v => VISIBILITY_OPTS.find(o=>o.val===v)?.label || v;
const invLabel = v => INVITE_OPTS.find(o=>o.val===v)?.label     || v;
const ttlLabel = v => TTL_OPTS.find(o=>String(o.val)===String(v))?.label || "Wyłączone";

// ─── RADIO OPTION ────────────────────────────────────────────────────────────
function RadioOpt({opt, selected, onSelect, accent=C.green}) {
  const isSel = selected===opt.val;
  return (
    <button onClick={()=>onSelect(opt.val)} style={{width:"100%",textAlign:"left",padding:"9px 12px",background:isSel?`${accent}11`:"none",border:`1px solid ${isSel?accent:C.border}`,borderRadius:3,cursor:"pointer",marginBottom:6,display:"flex",alignItems:"flex-start",gap:10,transition:"all 0.15s"}}>
      <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${isSel?accent:C.dim}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
        {isSel&&<div style={{width:6,height:6,borderRadius:"50%",background:accent}}/>}
      </div>
      <div>
        <div style={{fontSize:11,color:isSel?accent:C.text,fontFamily:F,marginBottom:2}}>{opt.label}</div>
        <div style={{fontSize:9,color:C.dim,lineHeight:1.6}}>{opt.desc}</div>
      </div>
    </button>
  );
}

// ─── MODAL: TWORZENIE GRUPY ──────────────────────────────────────────────────
function CreateGroupModal({contacts, onCreateGroup, onClose}) {
  const [step,       setStep]      = useState(1); // 1=nazwa, 2=ustawienia, 3=członkowie
  const [name,       setName]      = useState("");
  const [visibility, setVis]       = useState("HIDDEN");
  const [invPol,     setInvPol]    = useState("FOUNDER_ONLY");
  const [forcedTTL,  setForcedTTL] = useState(null);
  const [selected,   setSelected]  = useState([]);
  const [nameErr,    setNameErr]   = useState("");

  const toggleMember = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const goStep2 = () => {
    if (!name.trim()) { setNameErr("podaj nazwę grupy"); return; }
    setNameErr(""); setStep(2);
  };

  const create = () => {
    const id = "grp_"+Math.random().toString(36).slice(2,8);
    onCreateGroup({
      id, name:name.trim(), memberIds:selected,
      online:selected.length, unread:0, epoch:1,
      visibility, invitePolicy:invPol, forcedTTL, isFounder:true,
    });
    onClose();
  };

  const accentCol = visColor(visibility);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:24,width:380,maxWidth:"calc(100vw - 24px)",maxHeight:"90vh",overflowY:"auto"}}>

        {/* NAGŁÓWEK */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:3,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico name="users" size={16} color={C.green}/>
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>nowa grupa</div>
              <div style={{fontSize:9,color:C.dim,marginTop:2}}>krok {step} z 3</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}><Ico name="x" size={18} color={C.dim}/></button>
        </div>

        {/* PASEK KROKÓW */}
        <div style={{display:"flex",gap:4,marginBottom:22}}>
          {[1,2,3].map(n=>(
            <div key={n} style={{flex:1,height:2,borderRadius:1,background:n<=step?C.green:C.faint,transition:"background 0.3s"}}/>
          ))}
        </div>

        {/* KROK 1 — NAZWA */}
        {step===1&&(
          <div>
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>NAZWA GRUPY</div>
            <input
              autoFocus value={name}
              onChange={e=>{setName(e.target.value);setNameErr("");}}
              onKeyDown={e=>e.key==="Enter"&&goStep2()}
              placeholder="np. projekt_alfa"
              style={{width:"100%",background:C.bg,border:`1px solid ${nameErr?C.red:C.border}`,borderRadius:3,padding:"10px 12px",color:C.green,fontSize:14,fontFamily:F,outline:"none",letterSpacing:0.5,boxSizing:"border-box"}}
            />
            {nameErr&&<div style={{fontSize:9,color:C.red,marginTop:5}}>⚠ {nameErr}</div>}
            <div style={{fontSize:9,color:C.dim,marginTop:6,lineHeight:1.6}}>nazwa widoczna tylko dla członków grupy</div>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F}}>ANULUJ</button>
              <button onClick={goStep2} style={{flex:2,padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:11,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                DALEJ →
              </button>
            </div>
          </div>
        )}

        {/* KROK 2 — USTAWIENIA */}
        {step===2&&(
          <div>
            {/* Widoczność */}
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>WIDOCZNOŚĆ GRUPY</div>
            {VISIBILITY_OPTS.map(o=><RadioOpt key={o.val} opt={o} selected={visibility} onSelect={setVis} accent={o.color}/>)}

            <div style={{height:1,background:C.border,margin:"16px 0"}}/>

            {/* Polityka zaproszeń */}
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>KTO MOŻE ZAPRASZAĆ</div>
            {INVITE_OPTS.map(o=><RadioOpt key={o.val} opt={o} selected={invPol} onSelect={setInvPol} accent={accentCol}/>)}

            <div style={{height:1,background:C.border,margin:"16px 0"}}/>

            {/* Wymuszone TTL */}
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>WYMUSZONE ZNIKANIE WIADOMOŚCI</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
              {TTL_OPTS.map(o=>{
                const isSel=String(forcedTTL)===String(o.val);
                return (
                  <button key={String(o.val)} onClick={()=>setForcedTTL(o.val)} style={{padding:"5px 10px",borderRadius:2,background:isSel?C.greenFaint:"none",border:`1px solid ${isSel?"rgba(0,255,135,0.4)":C.border}`,cursor:"pointer",fontSize:9,color:isSel?C.green:C.dim,fontFamily:F}}>
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:9,color:C.dim,lineHeight:1.6,marginBottom:20}}>
              {TTL_OPTS.find(o=>String(o.val)===String(forcedTTL))?.desc}
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F}}>← WRÓĆ</button>
              <button onClick={()=>setStep(3)} style={{flex:2,padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:11,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                DALEJ →
              </button>
            </div>
          </div>
        )}

        {/* KROK 3 — CZŁONKOWIE */}
        {step===3&&(
          <div>
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>
              WYBIERZ CZŁONKÓW <span style={{color:C.green}}>({selected.length} wybranych)</span>
            </div>
            <div style={{marginBottom:16}}>
              {contacts.map(c=>{
                const isSel=selected.includes(c.id);
                return (
                  <button key={c.id} onClick={()=>toggleMember(c.id)} style={{width:"100%",textAlign:"left",padding:"9px 12px",background:isSel?C.greenFaint:"none",border:`1px solid ${isSel?"rgba(0,255,135,0.25)":C.border}`,borderRadius:3,cursor:"pointer",marginBottom:6,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
                    <div style={{width:28,height:28,borderRadius:3,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:10,color:isSel?C.green:C.dim,fontFamily:F,fontWeight:500}}>{c.name.slice(0,2).toUpperCase()}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:isSel?C.green:C.text,fontFamily:F}}>{c.name}</div>
                      <div style={{fontSize:9,color:C.dim,marginTop:1}}>{shortOnion(c.onion)}</div>
                    </div>
                    <div style={{width:16,height:16,borderRadius:2,border:`1px solid ${isSel?C.green:C.border}`,background:isSel?C.green:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {isSel&&<Ico name="check" size={10} color={C.bg}/>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Podsumowanie */}
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"10px 12px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:9,color:C.dim}}>nazwa</span>
                <span style={{fontSize:9,color:C.text}}>{name}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:9,color:C.dim}}>widoczność</span>
                <span style={{fontSize:9,color:visColor(visibility)}}>{visLabel(visibility)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:9,color:C.dim}}>zaproszenia</span>
                <span style={{fontSize:9,color:C.text}}>{invLabel(invPol)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:9,color:C.dim}}>znikanie</span>
                <span style={{fontSize:9,color:C.text}}>{ttlLabel(forcedTTL)}</span>
              </div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(2)} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F}}>← WRÓĆ</button>
              <button onClick={create} disabled={selected.length===0} style={{flex:2,padding:"10px 0",background:selected.length>0?C.greenFaint:"none",border:`1px solid ${selected.length>0?"rgba(0,255,135,0.3)":C.border}`,borderRadius:3,cursor:selected.length>0?"pointer":"not-allowed",color:selected.length>0?C.green:C.dim,fontSize:11,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <Ico name="users" size={12} color={selected.length>0?C.green:C.dim}/>
                UTWÓRZ GRUPĘ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL: EDYCJA GRUPY ─────────────────────────────────────────────────────
function EditGroupModal({group, onSave, onClose}) {
  const [name,       setName]      = useState(group.name);
  const [visibility, setVis]       = useState(group.visibility||"PRIVATE");
  const [invPol,     setInvPol]    = useState(group.invitePolicy||"ADMINS_ONLY");
  const [forcedTTL,  setForcedTTL] = useState(group.forcedTTL??null);
  const [nameErr,    setNameErr]   = useState("");
  const accentCol = visColor(visibility);

  const save = () => {
    if (!name.trim()) { setNameErr("podaj nazwę grupy"); return; }
    onSave({...group, name:name.trim(), visibility, invitePolicy:invPol, forcedTTL});
    onClose();
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:24,width:380,maxWidth:"calc(100vw - 24px)",maxHeight:"90vh",overflowY:"auto"}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:3,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico name="settings" size={16} color={C.green}/>
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>ustawienia grupy</div>
              <div style={{fontSize:9,color:C.dim,marginTop:2}}>{group.name} · tylko ty to widzisz</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}><Ico name="x" size={18} color={C.dim}/></button>
        </div>

        {/* Nazwa */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>NAZWA GRUPY</div>
          <input
            value={name} onChange={e=>{setName(e.target.value);setNameErr("");}}
            style={{width:"100%",background:C.bg,border:`1px solid ${nameErr?C.red:C.border}`,borderRadius:3,padding:"10px 12px",color:C.green,fontSize:14,fontFamily:F,outline:"none",letterSpacing:0.5,boxSizing:"border-box"}}
          />
          {nameErr&&<div style={{fontSize:9,color:C.red,marginTop:4}}>⚠ {nameErr}</div>}
        </div>

        <div style={{height:1,background:C.border,margin:"0 0 16px"}}/>

        {/* Widoczność */}
        <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>WIDOCZNOŚĆ GRUPY</div>
        {VISIBILITY_OPTS.map(o=><RadioOpt key={o.val} opt={o} selected={visibility} onSelect={setVis} accent={o.color}/>)}

        <div style={{height:1,background:C.border,margin:"16px 0"}}/>

        {/* Polityka zaproszeń */}
        <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>KTO MOŻE ZAPRASZAĆ</div>
        {INVITE_OPTS.map(o=><RadioOpt key={o.val} opt={o} selected={invPol} onSelect={setInvPol} accent={accentCol}/>)}

        <div style={{height:1,background:C.border,margin:"16px 0"}}/>

        {/* TTL */}
        <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>WYMUSZONE ZNIKANIE WIADOMOŚCI</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
          {TTL_OPTS.map(o=>{
            const isSel=String(forcedTTL)===String(o.val);
            return (
              <button key={String(o.val)} onClick={()=>setForcedTTL(o.val)} style={{padding:"5px 10px",borderRadius:2,background:isSel?C.greenFaint:"none",border:`1px solid ${isSel?"rgba(0,255,135,0.4)":C.border}`,cursor:"pointer",fontSize:9,color:isSel?C.green:C.dim,fontFamily:F}}>
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Ostrzeżenie o zmianie widoczności */}
        <div style={{background:"rgba(255,180,0,0.05)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:3,padding:"9px 12px",marginBottom:16}}>
          <div style={{display:"flex",gap:6,marginBottom:4}}><Ico name="alert" size={11} color={C.yellow}/><span style={{fontSize:9,color:C.yellow,letterSpacing:1}}>PAMIĘTAJ</span></div>
          <div style={{fontSize:9,color:C.dim,lineHeight:1.7}}>zmiana widoczności nie usuwa informacji którą już zobaczyli inni węzły w sieci. ukrycie grupy działa w pełni tylko gdy zastosowane od początku.</div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",background:"none",border:`1px solid ${C.border}`,borderRadius:3,cursor:"pointer",color:C.dim,fontSize:11,fontFamily:F}}>ANULUJ</button>
          <button onClick={save} style={{flex:2,padding:"10px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.3)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:11,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <Ico name="check" size={12} color={C.green}/>ZAPISZ USTAWIENIA
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR (full / mini) ───────────────────────────────────────────────────
function Sidebar({contacts, groups, active, onSelect, onShowQR, onAddContact, onCreateGroup, mode, onToggle}) {
  const [tab, setTab] = useState("contacts");
  const isMini = mode === "mini";

  // W trybie mini — tylko ikony awatarów
  if (isMini) return (
    <div style={{width:52,flexShrink:0,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%",alignItems:"center",overflow:"hidden"}}>
      {/* Toggle button */}
      <button onClick={onToggle} title="Rozwiń panel" style={{width:"100%",padding:"14px 0",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer",display:"flex",justifyContent:"center"}}>
        <Ico name="chevRight" size={16} color={C.green}/>
      </button>

      {/* TOR dot */}
      <div style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`,width:"100%",display:"flex",justifyContent:"center"}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 5px ${C.green}`}}/>
      </div>

      {/* Tab icons */}
      <div style={{width:"100%",display:"flex",flexDirection:"column",borderBottom:`1px solid ${C.border}`}}>
        {[["contacts","shield"],["groups","users"]].map(([id,ico])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 0",background:tab===id?C.greenFaint:"none",border:"none",borderLeft:tab===id?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",display:"flex",justifyContent:"center"}}>
            <Ico name={ico} size={14} color={tab===id?C.green:C.dim}/>
          </button>
        ))}
      </div>

      {/* Avatary */}
      <div style={{flex:1,overflowY:"auto",width:"100%",padding:"6px 0"}}>
        {tab==="contacts" && contacts.map(c=>{
          const sel=active?.id===c.id&&active?.type==="contact"&&!active?.fromGroup;
          return (
            <button key={c.id} onClick={()=>onSelect({...c,type:"contact"})} title={c.name} style={{width:"100%",padding:"6px 0",background:sel?C.greenFaint:"none",border:"none",borderLeft:sel?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",display:"flex",justifyContent:"center",position:"relative"}}>
              <div style={{position:"relative"}}>
                <div style={{width:32,height:32,borderRadius:3,background:C.bg,border:`1px solid ${sel?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:10,color:sel?C.green:C.dim,fontFamily:F,fontWeight:500}}>{c.name.slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{position:"absolute",bottom:-2,right:-2,width:7,height:7,borderRadius:"50%",background:c.online?C.green:C.faint,border:`1px solid ${C.surface}`}}/>
                {c.unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:14,height:14,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,color:C.bg,fontFamily:F,fontWeight:700}}>{c.unread}</span></div>}
              </div>
            </button>
          );
        })}
        {tab==="groups" && groups.map(g=>{
          const sel=active?.id===g.id;
          const vcol=visColor(g.visibility||"PRIVATE");
          return (
            <button key={g.id} onClick={()=>onSelect({...g,type:"group"})} title={g.name} style={{width:"100%",padding:"6px 0",background:sel?C.greenFaint:"none",border:"none",borderLeft:sel?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",display:"flex",justifyContent:"center"}}>
              <div style={{position:"relative"}}>
                <div style={{width:32,height:32,borderRadius:3,background:C.bg,border:`1px solid ${sel?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico name="users" size={13} color={sel?C.green:C.dim}/>
                </div>
                <div style={{position:"absolute",bottom:-3,right:-3,width:12,height:12,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico name={visIcon(g.visibility||"PRIVATE")} size={6} color={vcol}/>
                </div>
                {g.unread>0&&<div style={{position:"absolute",top:-4,right:-4,width:14,height:14,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,color:C.bg,fontFamily:F,fontWeight:700}}>{g.unread}</span></div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Akcje dole */}
      <div style={{width:"100%",borderTop:`1px solid ${C.border}`,padding:"6px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <button onClick={onShowQR}    title="Twój QR"        style={miniBtn}><Ico name="qr"    size={14} color={C.green}/></button>
        <button onClick={onAddContact} title="Dodaj kontakt" style={miniBtn}><Ico name="plus"  size={14} color={C.green}/></button>
        <button onClick={onCreateGroup} title="Utwórz grupę" style={miniBtn}><Ico name="users" size={14} color={C.purple}/></button>
      </div>
    </div>
  );

  // TRYB PEŁNY
  return (
    <div style={{width:250,flexShrink:0,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"12px 12px 10px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Logo size={34}/>
            <div>
              <div style={{fontSize:12,color:C.green,fontFamily:F,letterSpacing:1}}>PHANTOM</div>
              <div style={{fontSize:9,color:C.dim,fontFamily:F}}>p2p · tor · e2e</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={onShowQR} title="Twój QR" style={{background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",borderRadius:3,padding:"4px 5px",cursor:"pointer",display:"flex"}}>
              <Ico name="qr" size={13} color={C.green}/>
            </button>
            {/* Button zwijania */}
            <button onClick={onToggle} title="Zwiń panel" style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,padding:"4px 5px",cursor:"pointer",display:"flex"}}>
              <Ico name="chevLeft" size={13} color={C.dim}/>
            </button>
          </div>
        </div>
        <TorDot/>
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`}}>
        {[["contacts","shield","KONTAKTY"],["groups","users","GRUPY"]].map(([id,ico,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 0",background:"none",border:"none",borderBottom:tab===id?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",color:tab===id?C.green:C.dim,fontSize:9,fontFamily:F,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <Ico name={ico} size={11} color={tab===id?C.green:C.dim}/>{lbl}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="contacts"&&contacts.map(c=>{
          const sel=active?.id===c.id&&active?.type==="contact"&&!active?.fromGroup;
          return (
            <button key={c.id} onClick={()=>onSelect({...c,type:"contact"})} style={{width:"100%",textAlign:"left",padding:"10px 12px",background:sel?C.greenFaint:"none",border:"none",borderLeft:sel?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:32,height:32,borderRadius:3,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:11,color:C.green,fontFamily:F,fontWeight:500}}>{c.name.slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{position:"absolute",bottom:-2,right:-2,width:8,height:8,borderRadius:"50%",background:c.online?C.green:C.faint,border:`1px solid ${C.surface}`}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.text,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
                  {c.unread>0&&<span style={{background:C.green,color:C.bg,fontSize:9,fontFamily:F,padding:"1px 5px",borderRadius:2,flexShrink:0}}>{c.unread}</span>}
                </div>
                <div style={{fontSize:9,color:C.dim,fontFamily:F,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {shortOnion(c.onion)} · {c.lastSeen}
                </div>
              </div>
            </button>
          );
        })}
        {tab==="groups"&&groups.map(g=>{
          const sel=active?.id===g.id;
          const vcol=visColor(g.visibility||"PRIVATE");
          return (
            <button key={g.id} onClick={()=>onSelect({...g,type:"group"})} style={{width:"100%",textAlign:"left",padding:"10px 12px",background:sel?C.greenFaint:"none",border:"none",borderLeft:sel?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <div style={{position:"relative",width:32,height:32,flexShrink:0}}>
                <div style={{width:32,height:32,borderRadius:3,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico name="users" size={13} color={C.green}/>
                </div>
                <div style={{position:"absolute",bottom:-3,right:-3,width:13,height:13,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico name={visIcon(g.visibility||"PRIVATE")} size={7} color={vcol}/>
                </div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.text,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</span>
                  {g.unread>0&&<span style={{background:C.green,color:C.bg,fontSize:9,fontFamily:F,padding:"1px 5px",borderRadius:2,flexShrink:0}}>{g.unread}</span>}
                </div>
                <div style={{fontSize:9,color:C.dim,fontFamily:F,marginTop:2,display:"flex",alignItems:"center",gap:4}}>
                  <span style={{color:vcol}}>{visLabel(g.visibility||"PRIVATE")}</span>
                  <span>·</span><span>{g.memberIds.length} os.</span>
                  {g.isFounder&&<span style={{color:C.green}}>· założyciel</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{padding:8,borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:5}}>
        <button onClick={onAddContact} style={{width:"100%",padding:"7px 0",background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",borderRadius:3,cursor:"pointer",color:C.green,fontSize:10,fontFamily:F,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Ico name="plus" size={12} color={C.green}/>DODAJ KONTAKT
        </button>
        <button onClick={onCreateGroup} style={{width:"100%",padding:"7px 0",background:"rgba(155,109,255,0.08)",border:"1px solid rgba(155,109,255,0.2)",borderRadius:3,cursor:"pointer",color:C.purple,fontSize:10,fontFamily:F,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Ico name="users" size={12} color={C.purple}/>UTWÓRZ GRUPĘ
        </button>
      </div>
    </div>
  );
}
const miniBtn = {width:"100%",padding:"7px 0",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"center"};

// ─── PANEL PRAWY ─────────────────────────────────────────────────────────────
function InfoPanel({chat, onPrivate, onEditGroup, onClose}) {
  const isGroup = chat?.type==="group";
  const isPriv  = !!chat?.fromGroup;
  const members = isGroup ? (chat.memberIds||[]).map(id=>ALL_MEMBERS[id]).filter(Boolean) : [];

  return (
    <div style={{width:200,flexShrink:0,background:C.surface,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100%",fontFamily:F}}>
      <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${C.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:9,color:C.dim,letterSpacing:1}}>{isGroup?"CZŁONKOWIE":"SZCZEGÓŁY"}</div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {isGroup&&chat.isFounder&&(
            <button onClick={()=>onEditGroup(chat)} title="Ustawienia grupy" style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:2}}>
              <Ico name="settings" size={13} color={C.dim}/>
            </button>
          )}
          {onClose&&(
            <button onClick={onClose} title="Zamknij panel" style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:2}}>
              <Ico name="x" size={14} color={C.dim}/>
            </button>
          )}
        </div>
      </div>

      {/* Placeholder gdy brak wybranego czatu */}
      {!chat && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,opacity:0.3}}>
          <Ico name="info" size={24} color={C.dim}/>
          <span style={{fontSize:10,color:C.dim,textAlign:"center",lineHeight:1.5}}>wybierz kontakt<br/>lub grupę</span>
        </div>
      )}

      {/* Zawartość gdy czat wybrany */}
      {chat && isGroup&&(
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {/* Ustawienia grupy — widoczne dla wszystkich */}
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <Ico name={visIcon(chat.visibility||"PRIVATE")} size={11} color={visColor(chat.visibility||"PRIVATE")}/>
              <span style={{fontSize:10,color:visColor(chat.visibility||"PRIVATE"),fontFamily:F}}>{visLabel(chat.visibility||"PRIVATE")}</span>
            </div>
            <div style={{fontSize:9,color:C.dim,lineHeight:1.7}}>
              <div>zaproszenia: {invLabel(chat.invitePolicy||"ADMINS_ONLY")}</div>
              {chat.forcedTTL&&<div style={{color:C.yellow}}>znikanie: {ttlLabel(chat.forcedTTL)}</div>}
              <div>epoch={chat.epoch} · {chat.memberIds?.length||0} os.</div>
            </div>
            {chat.isFounder&&(
              <button onClick={()=>onEditGroup(chat)} style={{marginTop:8,width:"100%",padding:"5px 0",background:C.purpleFaint,border:"1px solid rgba(155,109,255,0.2)",borderRadius:2,cursor:"pointer",color:C.purple,fontSize:9,fontFamily:F,letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                <Ico name="settings" size={10} color={C.purple}/>EDYTUJ USTAWIENIA
              </button>
            )}
          </div>

          <div style={{padding:"4px 0",flex:1}}>
            {members.map(m=><MemberBtn key={m.id} m={m} onPrivate={onPrivate}/>)}
          </div>
          <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.faint,lineHeight:1.8}}>kliknij członka lub jego nick aby otworzyć prywatną rozmowę</div>
          </div>
        </div>
      )}

      {chat && !isGroup&&(
        <div style={{flex:1,padding:14,overflowY:"auto"}}>
          {isPriv&&(
            <div style={{background:"rgba(155,109,255,0.07)",border:"1px solid rgba(155,109,255,0.18)",borderRadius:3,padding:"10px 12px",marginBottom:14}}>
              <div style={{fontSize:9,color:C.purple,letterSpacing:1,marginBottom:4}}>KANAŁ PRYWATNY</div>
              <div style={{fontSize:9,color:C.dim,lineHeight:1.7}}>niewidoczny dla grupy<br/><span style={{color:C.purple}}>{chat.fromGroup}</span></div>
            </div>
          )}
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"16px 12px",marginBottom:16,textAlign:"center"}}>
            <div style={{width:48,height:48,borderRadius:4,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
              <span style={{fontSize:18,color:C.green,fontFamily:F,fontWeight:500}}>{(chat.name||"?").slice(0,2).toUpperCase()}</span>
            </div>
            <div style={{fontSize:14,color:C.text,fontFamily:F,marginBottom:6}}>{chat.name}</div>
            <div style={{fontSize:9,color:chat.trust==="DIRECT"?C.green:C.yellow,letterSpacing:0.8}}>
              {chat.trust==="DIRECT"?"● zaufany bezpośrednio":"◐ zaufany pośrednio"}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:5}}>STATUS</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:chat.online?C.green:C.faint}}/>
              <span style={{fontSize:10,color:C.text}}>{chat.online?"online":`ostatnio ${chat.lastSeen}`}</span>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:5}}>SZYFROWANIE</div>
            <div style={{fontSize:9,color:C.text,lineHeight:1.9}}>
              <div>· signal protocol</div><div>· double ratchet</div>
              <div>· forward secrecy</div><div>· tor hidden service</div>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:5}}>ADRES TOR</div>
            <div style={{fontSize:9,color:C.green,wordBreak:"break-all",lineHeight:1.6,letterSpacing:0.3}}>{chat.onion}</div>
          </div>
        </div>
      )}

      <div style={{padding:12,borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{background:"rgba(255,180,0,0.05)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:3,padding:"9px 11px"}}>
          <div style={{display:"flex",gap:5,marginBottom:4}}><Ico name="alert" size={11} color={C.yellow}/><span style={{fontSize:9,color:C.yellow,letterSpacing:1}}>PAMIĘTAJ</span></div>
          <div style={{fontSize:9,color:C.dim,lineHeight:1.7}}>szyfrowanie chroni treść. bezpieczeństwo urządzenia zależy od ciebie.</div>
        </div>
      </div>
    </div>
  );
}

function MemberBtn({m,onPrivate}) {
  const [hov,setHov]=useState(false);
  return (
    <button
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onPrivate(m)}
      title="Otwórz prywatną rozmowę"
      style={{width:"100%",textAlign:"left",padding:"9px 14px",background:hov?C.purpleFaint:"none",border:"none",borderLeft:hov?`2px solid ${C.purple}`:"2px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:9,transition:"all 0.15s"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <div style={{width:30,height:30,borderRadius:3,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:11,color:m.trust==="DIRECT"?C.green:C.yellow,fontFamily:F,fontWeight:500}}>{m.name.slice(0,2).toUpperCase()}</span>
        </div>
        <div style={{position:"absolute",bottom:-2,right:-2,width:7,height:7,borderRadius:"50%",background:m.online?C.green:C.faint,border:`1px solid ${C.surface}`}}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:11,color:hov?C.purple:C.text,fontFamily:F,transition:"color 0.15s",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
        <div style={{fontSize:9,color:C.dim,fontFamily:F,marginTop:1}}>{m.online?"online":m.lastSeen}</div>
      </div>
      {hov&&<Ico name="lock" size={11} color={C.purple}/>}
    </button>
  );
}

// ─── MOBILE BOTTOM NAV ───────────────────────────────────────────────────────
function BottomNav({tab, onTab, onAddContact, onCreateGroup, onShowQR}) {
  const items = [
    {id:"contacts", icon:"shield", label:"Kontakty"},
    {id:"groups",   icon:"users",  label:"Grupy"},
    {id:"add",      icon:"plus",   label:"Dodaj",   action:onAddContact},
    {id:"create",   icon:"users",  label:"Nowa gr.", action:onCreateGroup, color:C.purple},
    {id:"qr",       icon:"qr",     label:"QR",      action:onShowQR},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:50,height:56}}>
      {items.map(it=>{
        const isSel = tab===it.id && !it.action;
        const col = it.color || (isSel ? C.green : C.dim);
        return (
          <button key={it.id} onClick={it.action||(()=>onTab(it.id))} style={{flex:1,background:"none",border:"none",borderTop:isSel?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,paddingBottom:2}}>
            <Ico name={it.icon} size={18} color={col}/>
            <span style={{fontSize:8,color:col,fontFamily:F,letterSpacing:0.5}}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── MOBILE INFO DRAWER ──────────────────────────────────────────────────────
function InfoDrawer({chat, onPrivate, onEditGroup, onClose}) {
  if (!chat) return null;
  const isGroup = chat.type==="group";
  const isPriv  = !!chat.fromGroup;
  const members = isGroup ? (chat.memberIds||[]).map(id=>ALL_MEMBERS[id]).filter(Boolean) : [];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:60}}/>
      {/* Drawer od dołu */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,borderRadius:"12px 12px 0 0",zIndex:61,maxHeight:"70vh",display:"flex",flexDirection:"column",fontFamily:F}}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}>
          <div style={{width:36,height:3,borderRadius:2,background:C.border}}/>
        </div>

        {/* Header */}
        <div style={{padding:"4px 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:3,background:C.greenFaint,border:"1px solid rgba(0,255,135,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {isGroup
                ? <Ico name="users" size={16} color={C.green}/>
                : <span style={{fontSize:14,color:C.green,fontFamily:F,fontWeight:500}}>{(chat.name||"?").slice(0,2).toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>{chat.name}</div>
              <div style={{fontSize:9,color:C.dim,marginTop:2}}>
                {isGroup ? `${chat.memberIds?.length||0} członków · epoch=${chat.epoch}` : shortOnion(chat.onion)}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>
            <Ico name="x" size={18} color={C.dim}/>
          </button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
          {/* Ustawienia grupy */}
          {isGroup && (
            <>
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:"10px 12px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <Ico name={visIcon(chat.visibility||"PRIVATE")} size={11} color={visColor(chat.visibility||"PRIVATE")}/>
                  <span style={{fontSize:10,color:visColor(chat.visibility||"PRIVATE")}}>{visLabel(chat.visibility||"PRIVATE")}</span>
                </div>
                <div style={{fontSize:9,color:C.dim,lineHeight:1.8}}>
                  <div>zaproszenia: {invLabel(chat.invitePolicy||"ADMINS_ONLY")}</div>
                  {chat.forcedTTL&&<div style={{color:C.yellow}}>znikanie: {ttlLabel(chat.forcedTTL)}</div>}
                </div>
                {chat.isFounder&&(
                  <button onClick={()=>{onEditGroup(chat);onClose();}} style={{marginTop:8,width:"100%",padding:"6px 0",background:C.purpleFaint,border:"1px solid rgba(155,109,255,0.2)",borderRadius:2,cursor:"pointer",color:C.purple,fontSize:10,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                    <Ico name="settings" size={11} color={C.purple}/>EDYTUJ USTAWIENIA
                  </button>
                )}
              </div>
              <div style={{fontSize:9,color:C.dim,letterSpacing:1,marginBottom:8}}>CZŁONKOWIE</div>
              {members.map(m=><MemberBtn key={m.id} m={m} onPrivate={(member)=>{onPrivate(member);onClose();}}/>)}
              <div style={{fontSize:9,color:C.faint,lineHeight:1.8,marginTop:8,paddingBottom:16}}>dotknij członka aby otworzyć prywatną rozmowę</div>
            </>
          )}

          {/* Szczegóły kontaktu */}
          {!isGroup && (
            <>
              {isPriv&&<div style={{background:"rgba(155,109,255,0.07)",border:"1px solid rgba(155,109,255,0.18)",borderRadius:3,padding:"10px 12px",marginBottom:12}}>
                <div style={{fontSize:9,color:C.purple,letterSpacing:1,marginBottom:3}}>KANAŁ PRYWATNY</div>
                <div style={{fontSize:9,color:C.dim}}>niewidoczny dla grupy <span style={{color:C.purple}}>{chat.fromGroup}</span></div>
              </div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[
                  ["status",    chat.online?"online":`ostat. ${chat.lastSeen}`, chat.online?C.green:C.dim],
                  ["zaufanie",  chat.trust==="DIRECT"?"bezpośrednie":"pośrednie", chat.trust==="DIRECT"?C.green:C.yellow],
                ].map(([l,v,col])=>(
                  <div key={l} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"8px 10px"}}>
                    <div style={{fontSize:8,color:C.dim,letterSpacing:1,marginBottom:3}}>{l.toUpperCase()}</div>
                    <div style={{fontSize:10,color:col}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"8px 10px",marginBottom:12}}>
                <div style={{fontSize:8,color:C.dim,letterSpacing:1,marginBottom:4}}>ADRES TOR</div>
                <div style={{fontSize:9,color:C.green,wordBreak:"break-all",lineHeight:1.6}}>{chat.onion}</div>
              </div>
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:3,padding:"8px 10px",paddingBottom:16}}>
                <div style={{fontSize:8,color:C.dim,letterSpacing:1,marginBottom:4}}>SZYFROWANIE</div>
                {["signal protocol","double ratchet","forward secrecy","tor hidden service"].map(t=><div key={t} style={{fontSize:9,color:C.text,lineHeight:1.9}}>· {t}</div>)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── GŁÓWNA APLIKACJA ─────────────────────────────────────────────────────────
export default function App() {
  const [booting,     setBooting]    = useState(true);
  const [chat,        setChat]       = useState(null);
  const [showQR,      setShowQR]     = useState(false);
  const [showAdd,     setShowAdd]    = useState(false);
  const [showCreate,  setShowCreate] = useState(false);
  const [editGroup,   setEditGroup]  = useState(null);
  const [privReq,     setPrivReq]    = useState(null);
  const [mobile,      setMobile]     = useState(window.innerWidth < 640);
  const [contacts,    setContacts]   = useState(INIT_CONTACTS);
  const [groups,      setGroups]     = useState(INIT_GROUPS);

  // Desktop panel states
  const [leftMode,  setLeftMode]  = useState("full");   // "full" | "mini"
  const [rightOpen, setRightOpen] = useState(true);

  // Mobile states
  const [mobileTab,  setMobileTab]  = useState("contacts"); // "contacts"|"groups"
  const [mobileView, setMobileView] = useState("list");     // "list"|"chat"
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(()=>{
    const fn=()=>setMobile(window.innerWidth<640);
    window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  useEffect(()=>{
    let m=document.querySelector("meta[name=viewport]");
    if(!m){m=document.createElement("meta");m.name="viewport";document.head.appendChild(m);}
    m.content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    return ()=>{m.content="width=device-width, initial-scale=1";};
  },[]);

  const askPrivate   = (member)=>setPrivReq(member);
  const confirmPrivate = ()=>{
    const fromGroup=chat?.name, m=privReq;
    setPrivReq(null);
    setChat({...m,type:"contact",fromGroup});
    if(mobile) setMobileView("chat");
  };

  const selectChat = (c)=>{
    setChat(c);
    if(mobile) setMobileView("chat");
    setShowDrawer(false);
  };

  const handleAddContact = (nc)=>{
    setContacts(prev=>prev.find(c=>c.id===nc.id)?prev:[...prev,nc]);
    setChat({...nc,type:"contact"});
    if(mobile) setMobileView("chat");
  };

  const handleCreateGroup = (ng)=>{
    setGroups(prev=>[...prev,ng]);
    setChat({...ng,type:"group"});
    if(mobile) setMobileView("chat");
  };

  const handleEditGroup = (updated)=>{
    setGroups(prev=>prev.map(g=>g.id===updated.id?updated:g));
    if(chat?.id===updated.id) setChat({...updated,type:"group"});
  };

  const toggleLeft  = ()=>setLeftMode(m=>m==="full"?"mini":"full");
  const toggleRight = ()=>setRightOpen(o=>!o);

  if(booting) return <Boot onDone={()=>setBooting(false)}/>;

  const sidebarProps = {
    contacts, groups, active:chat,
    onSelect:selectChat,
    onShowQR:()=>setShowQR(true),
    onAddContact:()=>setShowAdd(true),
    onCreateGroup:()=>setShowCreate(true),
  };

  // Mobile — filtruj kontakty/grupy wg aktywnej zakładki
  const mobileItems = mobileTab==="contacts"
    ? contacts.map(c=>({...c,type:"contact"}))
    : groups.map(g=>({...g,type:"group"}));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg};overflow:hidden}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        input,textarea,select{font-size:16px !important;touch-action:manipulation}
        input::placeholder{color:${C.faint}}
        button:focus{outline:none}
      `}</style>

      {/* ── DESKTOP ── */}
      {!mobile && (
        <div style={{height:"100vh",display:"flex",background:C.bg,overflow:"hidden"}}>
          <Sidebar {...sidebarProps} mode={leftMode} onToggle={toggleLeft}/>
          <ChatPanel
            chat={chat} onPrivate={askPrivate} onBack={null}
            rightOpen={rightOpen} onToggleRight={toggleRight}
          />
          {rightOpen && (
            <InfoPanel chat={chat} onPrivate={askPrivate} onEditGroup={(g)=>setEditGroup(g)} onClose={toggleRight}/>
          )}
        </div>
      )}

      {/* ── MOBILE ── */}
      {mobile && (
        <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden"}}>
          {mobileView==="list" && (
            <div style={{flex:1,overflowY:"auto",paddingBottom:56}}>
              {/* Header */}
              <div style={{padding:"12px 16px 10px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Logo size={28}/>
                  <div style={{fontSize:11,color:C.green,fontFamily:F,letterSpacing:1}}>PHANTOM</div>
                </div>
                <TorDot/>
              </div>

              {/* Lista */}
              {mobileItems.map(item=>{
                const isGrp = item.type==="group";
                const sel   = chat?.id===item.id;
                const vcol  = isGrp ? visColor(item.visibility||"PRIVATE") : null;
                return (
                  <button key={item.id} onClick={()=>selectChat(item)} style={{width:"100%",textAlign:"left",padding:"12px 16px",background:sel?C.greenFaint:"none",border:"none",borderLeft:sel?`3px solid ${C.green}`:"3px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${C.border}`}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <div style={{width:44,height:44,borderRadius:4,background:C.surfaceHi,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {isGrp
                          ? <Ico name="users" size={18} color={C.green}/>
                          : <span style={{fontSize:15,color:C.green,fontFamily:F,fontWeight:500}}>{item.name.slice(0,2).toUpperCase()}</span>
                        }
                      </div>
                      {!isGrp && <div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:item.online?C.green:C.faint,border:`2px solid ${C.bg}`}}/>}
                      {isGrp && <div style={{position:"absolute",bottom:-3,right:-3,width:14,height:14,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico name={visIcon(item.visibility||"PRIVATE")} size={7} color={vcol}/></div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <span style={{fontSize:14,color:C.text,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</span>
                        {(item.unread>0)&&<span style={{background:C.green,color:C.bg,fontSize:10,fontFamily:F,padding:"1px 6px",borderRadius:10,flexShrink:0,marginLeft:6}}>{item.unread}</span>}
                      </div>
                      <div style={{fontSize:10,color:C.dim,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {isGrp
                          ? <><span style={{color:vcol}}>{visLabel(item.visibility||"PRIVATE")}</span> · {item.memberIds.length} os.{item.isFounder?" · założyciel":""}</>
                          : <>{shortOnion(item.onion)} · {item.lastSeen}</>
                        }
                      </div>
                    </div>
                    <Ico name="chevRight" size={14} color={C.faint}/>
                  </button>
                );
              })}
            </div>
          )}

          {mobileView==="chat" && (
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",paddingBottom:56}}>
              <ChatPanel
                chat={chat} onPrivate={askPrivate}
                onBack={()=>setMobileView("list")}
                onInfoOpen={()=>setShowDrawer(true)}
                rightOpen={false}
              />
            </div>
          )}

          {/* Bottom Nav */}
          <BottomNav
            tab={mobileTab}
            onTab={(t)=>{ setMobileTab(t); setMobileView("list"); }}
            onAddContact={()=>setShowAdd(true)}
            onCreateGroup={()=>setShowCreate(true)}
            onShowQR={()=>setShowQR(true)}
          />
        </div>
      )}

      {/* Modals */}
      {showQR     && <QRModal onClose={()=>setShowQR(false)}/>}
      {showAdd    && <AddContactModal onAdd={handleAddContact} onClose={()=>setShowAdd(false)}/>}
      {showCreate && <CreateGroupModal contacts={contacts} onCreateGroup={handleCreateGroup} onClose={()=>setShowCreate(false)}/>}
      {editGroup  && <EditGroupModal group={editGroup} onSave={handleEditGroup} onClose={()=>setEditGroup(null)}/>}
      {privReq    && <PrivateModal member={privReq} groupName={chat?.name} onConfirm={confirmPrivate} onCancel={()=>setPrivReq(null)}/>}

      {/* Mobile info drawer */}
      {mobile && showDrawer && (
        <InfoDrawer
          chat={chat}
          onPrivate={askPrivate}
          onEditGroup={(g)=>setEditGroup(g)}
          onClose={()=>setShowDrawer(false)}
        />
      )}
    </>
  );
}
