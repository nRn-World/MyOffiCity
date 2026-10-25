/* Flaggväljare: gör om språk-, valuta- och landsrullgardiner till listor med flaggor.
   Den riktiga <select> finns kvar (dold) och får ett change-event, så all befintlig logik i app.js fungerar oförändrad. */
(()=>{
  const LANGFLAG={en:'gb',sv:'se',tr:'tr',ar:'sa',es:'es',it:'it',fr:'fr',zh:'cn',ja:'jp'};
  const CURFLAG={USD:'us',EUR:'eu',GBP:'gb',SEK:'se',NOK:'no',DKK:'dk',TRY:'tr',AED:'ae',SAR:'sa',CAD:'ca',JPY:'jp',CNY:'cn',INR:'in',AUD:'au',BRL:'br',MXN:'mx',PLN:'pl',CHF:'ch'};
  const kindOf=s=>s.matches('[data-lang]')?'lang':s.matches('[data-obcur],[data-currency],#obCur')?'cur':s.matches('#obCountry,[data-country]')?'country':null;
  const flagOf=(k,v)=>k==='lang'?LANGFLAG[v]:k==='cur'?CURFLAG[v]:String(v).toLowerCase();
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // shortcut: flaggor hämtas från flagcdn.com och kräver internet; utan nät visas bara texten, upgrade: lägg SVG-filer lokalt
  const img=c=>c?`<img class="fl" alt="" src="https://flagcdn.com/w40/${c}.png" srcset="https://flagcdn.com/w80/${c}.png 2x" onerror="this.style.visibility='hidden'">`:'<span class="fl"></span>';
  function closeAll(except){document.querySelectorAll('.fsel.open').forEach(w=>{if(w!==except){w.classList.remove('open');w.querySelector('.fsel-btn').setAttribute('aria-expanded','false');}});}
  function build(sel){
    const k=kindOf(sel);if(!k||sel.dataset.fl)return;sel.dataset.fl='1';
    const opts=[...sel.options],label=sel.getAttribute('aria-label')||'';
    const wrap=document.createElement('div');wrap.className='fsel fsel-'+k;
    wrap.innerHTML=`<button type="button" class="fsel-btn" aria-haspopup="listbox" aria-expanded="false" ${label?`aria-label="${esc(label)}"`:''}></button>
      <div class="fsel-list" role="listbox" tabindex="-1">${opts.map(o=>`<div class="fsel-item${o.value===sel.value?' on':''}" role="option" tabindex="0" data-v="${esc(o.value)}" aria-selected="${o.value===sel.value}">${img(flagOf(k,o.value))}<span>${esc(o.textContent)}</span></div>`).join('')}</div>`;
    const btn=wrap.querySelector('.fsel-btn'),list=wrap.querySelector('.fsel-list');
    const paint=()=>{const o=sel.options[sel.selectedIndex];btn.innerHTML=img(flagOf(k,sel.value))+`<span class="fsel-txt">${esc(o?o.textContent:'')}</span><i class="fsel-car">▾</i>`;
      list.querySelectorAll('.fsel-item').forEach(it=>{const on=it.dataset.v===sel.value;it.classList.toggle('on',on);it.setAttribute('aria-selected',on);});};
    paint();
    btn.addEventListener('click',e=>{e.stopPropagation();const open=!wrap.classList.contains('open');closeAll(wrap);wrap.classList.toggle('open',open);btn.setAttribute('aria-expanded',open);
      if(open){const on=list.querySelector('.on');if(on)on.scrollIntoView({block:'nearest'});}});
    list.addEventListener('click',e=>{
      const it=e.target.closest('.fsel-item');if(!it)return;
      wrap.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus();
      if(sel.value!==it.dataset.v){sel.value=it.dataset.v;paint();sel.dispatchEvent(new Event('change',{bubbles:true}));}
    });
    list.addEventListener('keydown',e=>{
      const items=[...list.querySelectorAll('.fsel-item')],i=items.indexOf(document.activeElement);
      if(e.key==='ArrowDown'){e.preventDefault();(items[i+1]||items[0]).focus();}
      else if(e.key==='ArrowUp'){e.preventDefault();(items[i-1]||items[items.length-1]).focus();}
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();document.activeElement.click();}
    });
    wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){wrap.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus();}
      if(e.key==='ArrowDown'&&document.activeElement===btn){e.preventDefault();if(!wrap.classList.contains('open'))btn.click();(list.querySelector('.on')||list.firstElementChild).focus();}});
    sel.style.display='none';sel.after(wrap);
  }
  const scan=()=>document.querySelectorAll('select:not([data-fl])').forEach(build);
  document.addEventListener('click',e=>{if(!e.target.closest('.fsel'))closeAll();});
  let q=0;new MutationObserver(()=>{if(!q)q=requestAnimationFrame(()=>{q=0;scan();});}).observe(document.documentElement,{childList:true,subtree:true});
  scan();
})();
