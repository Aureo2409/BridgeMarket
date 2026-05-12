import { useState } from "react";
import { DESTS } from "../../lib/constants.js";

export function Calculator({ appliedRate, rate, onSubmit, loading, user, kycStep }) {
  const applied  = parseFloat(appliedRate) || 1165;
  const [usd, setUsd]     = useState("100");
  const [aoa, setAoa]     = useState(() => Math.round(100*applied).toLocaleString("pt-AO"));
  const [field, setField] = useState("usd");
  const [dest, setDest]   = useState("redotpay");
  const [account, setAcc] = useState("");

  const destInfo = DESTS.find(d=>d.id===dest);
  const usdNum   = parseFloat(usd)||0;

  function onUsd(v){ setUsd(v); setField("usd"); const n=parseFloat(v)||0; setAoa(n>0?Math.round(n*applied).toLocaleString("pt-AO"):""); }
  function onAoa(v){ setAoa(v); setField("aoa"); const n=parseFloat(v.replace(/\s/g,"").replace(/\./g,"").replace(",","."))||0; setUsd(n>0?(n/applied).toFixed(2):""); }
  function swap(){
    if(field==="usd"){ setField("aoa"); const n=parseFloat((aoa+"").replace(/\s/g,"").replace(/\./g,"").replace(",","."))||0; if(n>0)setUsd((n/applied).toFixed(2)); }
    else{ setField("usd"); const n=parseFloat(usd)||0; if(n>0)setAoa(Math.round(n*applied).toLocaleString("pt-AO")); }
  }
  function submit(){ onSubmit({usd:usdNum,aoa:Math.round(usdNum*applied),dest,account,appliedRate:applied}); }

  return(
    <>
      <div className="hero">
        <div style={{fontSize:10,fontWeight:700,opacity:.7,textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>Taxa de hoje</div>
        <div style={{fontSize:34,fontWeight:900,letterSpacing:-2}}>{applied.toLocaleString("pt-AO")} Kz</div>
        <div style={{fontSize:11,opacity:.7,fontWeight:600}}>por 1 USD · base {parseFloat(rate.base_rate).toLocaleString("pt-AO")} + margem {parseFloat(rate.margin)} Kz</div>
      </div>

      <div className="card">
        <div className={`calc-box${field==="usd"?" active":""}`} onClick={()=>setField("usd")}>
          <div className="calc-flag">🇺🇸 USD — Dólar americano</div>
          <input className="calc-num" type="number" placeholder="0.00" value={usd}
            onChange={e=>onUsd(e.target.value)} onFocus={()=>setField("usd")}/>
          <div className="calc-hint">Digita o valor em dólares</div>
        </div>
        <div className="swap-row">
          <div className="swap-line"/>
          <button className="swap-btn" onClick={swap}>⇅</button>
          <div className="swap-line"/>
        </div>
        <div className={`calc-box${field==="aoa"?" active":""}`} onClick={()=>setField("aoa")}>
          <div className="calc-flag">🇦🇴 AOA — Kwanza angolano</div>
          <input className="calc-num" type="text" placeholder="0" value={aoa}
            onChange={e=>onAoa(e.target.value)} onFocus={()=>setField("aoa")}/>
          <div className="calc-hint">Ou digita o valor em Kwanzas</div>
        </div>
        <div className="rate-note">
          <span style={{fontSize:11,color:"#6b7280",fontWeight:600}}>Taxa aplicada</span>
          <span className="rate-val">📊 1 USD = {applied.toLocaleString("pt-AO")} Kz</span>
        </div>
      </div>

      <div className="card">
        <span className="slbl">Para onde vai o dólar?</span>
        <div className="dest-grid">
          {DESTS.map(d=>(
            <div key={d.id} className={`dest-card${dest===d.id?" sel":""}`}
              style={dest===d.id?{borderColor:d.color,background:d.bg}:{}}
              onClick={()=>{setDest(d.id);setAcc("");}}>
              <div className="dest-logo" dangerouslySetInnerHTML={{__html:d.svg}}/>
              <div>
                <div className="d-name" style={dest===d.id?{color:d.color}:{}}>{d.label}</div>
                <div className="d-desc">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <label className="lbl" style={{marginTop:6}}>{destInfo?.hint??"Conta de destino"}</label>
        <input className="inp" type="text" placeholder={destInfo?.hint} value={account} onChange={e=>setAcc(e.target.value)}/>
      </div>

      {!user&&<div className="warn">👤 Faz login para criar um pedido.</div>}
      {user&&kycStep<3&&(
        <div className="warn">⚠️ A tua identidade ainda não foi verificada ({kycStep}/3 passos KYC). O pedido ficará em espera.</div>
      )}

      <button className="btn btn-p" onClick={submit} disabled={!user||usdNum<=0||!account.trim()||loading}>
        {loading?`A criar pedido...`:`Comprar $${usd||"0"} → ${destInfo?.label}`}
      </button>
      <div style={{textAlign:"center",marginTop:7,fontSize:10,color:"#9ca3af",fontWeight:600}}>
        O administrador é notificado instantaneamente
      </div>
    </>
  );
}
