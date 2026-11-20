(()=>{"use strict";
const search=document.getElementById("manualSearch"),clear=document.getElementById("manualClear"),status=document.getElementById("manualStatus");
const buttons=Array.from(document.querySelectorAll("[data-filter]"));
const types=["topics","formulas","glossary"];
const entries=Object.fromEntries(types.map(type=>[type,Array.from(document.querySelectorAll('[data-kind="'+type+'"]'))]));
let active="all";
const norm=s=>String(s||"").normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/\s+/g," ").trim();
function update(){
 const q=norm(search.value);let matches=0;
 for(const type of types){let visible=0;
  for(const e of entries[type]){
   const found=(!q||norm(e.textContent+" "+(e.dataset.keywords||"")).includes(q))&&(active==="all"||active===type);
   e.hidden=!found;if(found){visible++;matches++}
  }
  const area=document.getElementById(type);
  if(area)area.hidden=visible===0;
 }
 const n=entries.topics.length+entries.formulas.length+entries.glossary.length;
 status.textContent=matches?"找到 "+matches+" 条内容（共 "+n+" 条）。点击主题或公式可进一步阅读。":"没有匹配内容，试试更短的关键词，例如“电压”“倍率”或“储能”。";
}
function select(type){active=type;buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.filter===type)));update()}
buttons.forEach(b=>b.addEventListener("click",()=>select(b.dataset.filter)));
search.addEventListener("input",update);
clear.addEventListener("click",()=>{search.value="";select("all");search.focus()});
document.querySelectorAll(".manual-toc a").forEach(a=>a.addEventListener("click",()=>{
 const id=a.getAttribute("href").slice(1);search.value="";
 select(id==="formulas"?"formulas":id==="glossary"?"glossary":"all");
}));
window.addEventListener("hashchange",()=>{
 const id=location.hash.slice(1);if(!id)return;
 if(document.getElementById(id)?.hidden){search.value="";select(id==="formulas"?"formulas":id==="glossary"?"glossary":"all")}
});
update();
})();