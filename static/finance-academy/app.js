(function(){
"use strict";
const C=window.FINANCE_COURSE;
const CASES=window.FINANCE_CASES||[];
if(!C||!C.modules){document.getElementById("main").textContent="课程数据加载失败，请刷新页面。";return}
const KEY="xblog-finance-academy-v1";
const saved=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}})();
const state={done:new Set(Array.isArray(saved.done)?saved.done:[]),answers:saved.answers||{},dark:saved.dark===true};
const flat=C.modules.flatMap(m=>m.lessons);
const root=document.getElementById("main"),nav=document.getElementById("course-nav"),search=document.getElementById("search");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({done:[...state.done],answers:state.answers,dark:state.dark}))}catch{}};
const completed=()=>flat.filter(l=>state.done.has(l.id)).length;
const percent=()=>Math.round(completed()/flat.length*100);
let toastTimer;
function toast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("visible"),2500)}
function current(){let h=decodeURIComponent(location.hash.slice(1));if(!h||h==="home")return {page:"home"};let [page,...parts]=h.split("/");return {page,id:parts.join("/")}}
function go(page,id){const hash="#"+page+(id?"/"+id:"");if(location.hash===hash){render();return}location.hash=hash}
function renderSidebar(filter=""){
  const route=current(),q=filter.trim().toLocaleLowerCase();
  const groups=C.modules.map((m,mi)=>{
    const matches=m.lessons.filter(l=>!q||[l.title,l.summary,l.scenario,...l.concept,m.title].join(" ").toLocaleLowerCase().includes(q));
    if(!matches.length)return "";
    const open=!!q||route.id?.startsWith(m.id+"-")||route.id===m.id;
    return '<section class="nav-group"><button type="button" class="nav-module '+(open?'active':'')+'" data-go="module/'+m.id+'"><span class="nav-num">'+String(mi+1).padStart(2,"0")+'</span><span class="nav-module-name">'+esc(m.title)+'</span><span class="nav-amount">'+matches.filter(l=>state.done.has(l.id)).length+'/'+matches.length+'</span></button><div class="nav-items" '+(!open?'hidden':'')+'>'+matches.map(l=>'<button type="button" class="nav-lesson '+(route.id===l.id?'active ':'')+(state.done.has(l.id)?'done':'')+'" data-go="lesson/'+l.id+'"><span class="check">'+(state.done.has(l.id)?'✓':'○')+'</span><span>'+esc(l.title)+'</span></button>').join("")+'</div></section>';
  }).join("");
  nav.innerHTML=groups||'<p class="search-empty">没有找到匹配的课程。可以尝试“研发”“资本化”或“合并”等关键词。</p>';
  nav.innerHTML+='<div class="nav-group"><button type="button" class="nav-module" data-go="cases"><span class="nav-num">▤</span><span class="nav-module-name">连续业务案例库</span><span class="nav-amount">3套</span></button><button type="button" class="nav-module" data-go="workshop"><span class="nav-num">✎</span><span class="nav-module-name">综合案例演练</span><span class="nav-amount">实战</span></button><button type="button" class="nav-module" data-go="glossary"><span class="nav-num">Aa</span><span class="nav-module-name">核心术语词典</span><span class="nav-amount">'+C.glossary.length+'</span></button></div>';
}
function prog(){return '<div class="progress-wrap"><div class="progress-label"><strong>你的学习进度</strong><span>'+completed()+' / '+flat.length+' 节 · '+percent()+'%</span></div><div class="progress-bar" role="progressbar" aria-valuenow="'+percent()+'" aria-valuemin="0" aria-valuemax="100" aria-label="课程完成率"><div class="progress-fill" style="width:'+percent()+'%"></div></div></div>'}
function sources(){return '<div class="sources"><strong>准则与延伸阅读</strong><p>案例金额与背景均为教学模拟；企业实务应结合合同、会计准则及最新法规判断。</p>'+C.sources.map(s=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.name)+'</a>').join("")+'</div>'}
function home(){
const next=flat.find(l=>!state.done.has(l.id))||flat[0];
return '<div class="kicker">FINANCE LITERACY · ENTERPRISE PRACTICE</div><section class="hero"><h1>从一笔凭证开始，<br><em>读懂企业经营。</em></h1><p>一套专门面向非财务专业管理者的系统课程。围绕大型央企的实际业务，把会计科目、账套、三大报表、项目成本、科研资本化、集团合并与财务数字化真正串联起来。</p><div class="hero-actions"><button class="btn btn-primary" type="button" data-go="lesson/'+next.id+'">'+(completed()?'继续学习':'开始第一课')+' <span aria-hidden="true">→</span></button><button class="btn" type="button" data-go="workshop">进入综合案例演练</button></div></section>'+
'<div class="metrics"><div class="metric"><b>08</b><span>知识模块</span></div><div class="metric"><b>32</b><span>案例化课程</span></div><div class="metric"><b>32</b><span>即时理解测验</span></div><div class="metric"><b>04</b><span>综合业务案例</span></div></div>'+prog()+
'<div class="section-heading"><div><div class="kicker">CURRICULUM</div><h2>按知识依赖关系逐步学习</h2><p>从交易的经济实质，到集团层面的财务数据与经营判断。</p></div><span class="section-note">建议循序学习，也可按需跳转</span></div>'+
'<div class="module-grid">'+C.modules.map((m,i)=>'<button type="button" class="module-card" data-go="module/'+m.id+'"><div class="module-top"><span>MODULE '+String(i+1).padStart(2,"0")+'</span><span>'+m.lessons.filter(l=>state.done.has(l.id)).length+' / '+m.lessons.length+' 完成</span></div><h3>'+esc(m.title)+'</h3><p>'+esc(m.subtitle)+'</p><div class="module-bottom"><span>4节课程 · 案例与测验</span><span class="arrow" aria-hidden="true">↗</span></div></button>').join("")+'</div>'+
'<div class="section-heading"><div><div class="kicker">LEARNING METHOD</div><h2>学习方式</h2></div></div><div class="feature-band"><div class="feature"><div class="feature-mark">01</div><h3>沿着真实的业务链学习</h3><p>一张合同、一张发票、一笔薪酬、一台科研设备，逐步转化为会计分录、科目余额和财务报表。每节课都有实际业务场景和误区辨析。</p></div><div class="feature"><div class="feature-mark">02</div><h3>通过数字验算自己的理解</h3><p>每节课设即时测试，另有一个可交互的科技公司年度账务案例。练习数字与解题过程都可核对，学习记录保存在浏览器本地。</p></div></div>'+
'<div class="case-panel" style="margin-top:28px"><div class="panel-kicker">DEEP DIVE · 完整案例</div><h3 style="font-size:21px;line-height:1.5;margin:0 0 8px">三套连续业务案例，逐笔核算到报表</h3><p style="font-size:13px;color:var(--muted);margin-bottom:15px">自主研发与资本化、受托技术开发项目、母子公司内部交易和合并抵销。</p><button type="button" class="btn" data-go="cases">查看连续业务案例库 →</button></div><div class="case-large"><div class="kicker" style="color:#b8e7d0">FINAL PRACTICE</div><h2>把一家公司全年业务算清楚</h2><p>从股东增资、实验设备、研发费用，到技术服务收入、应收款和期末资产负债。完成一次从业务到报表的独立推演。</p><button type="button" class="btn" data-go="workshop">打开综合实战 →</button></div>'+sources();
}
function modulePage(id){
const m=C.modules.find(x=>x.id===id);if(!m)return home();
const num=C.modules.indexOf(m)+1;return '<div class="crumb"><a href="#home">课程首页</a><span>/</span><span>模块 '+num+'</span></div><div class="kicker">MODULE '+String(num).padStart(2,"0")+'</div><section class="lesson-head"><h1>'+esc(m.title)+'</h1><div class="intro">'+esc(m.subtitle)+'。本模块包含四节课程，每节均提供情境、会计示例和独立测验。</div><div class="lesson-bits"><span class="chip">'+m.lessons.length+' 节</span><span class="chip green">'+m.lessons.filter(l=>state.done.has(l.id)).length+' 节已完成</span></div></section><div class="section-heading"><div><div class="kicker">CHAPTERS</div><h2>本模块课程</h2></div></div><div class="module-grid">'+m.lessons.map((l,i)=>'<button type="button" class="module-card" data-go="lesson/'+l.id+'"><div class="module-top"><span>LESSON '+String(i+1).padStart(2,"0")+'</span><span>'+ (state.done.has(l.id)?'✓ 已学习':l.minutes+'分钟')+'</span></div><h3>'+esc(l.title)+'</h3><p>'+esc(l.summary)+'</p><div class="module-bottom"><span>原理 · 案例 · 分录 · 测验</span><span class="arrow">↗</span></div></button>').join("")+'</div><div style="margin-top:29px"><button class="btn" data-go="home">返回全部模块</button></div>'+sources();
}
function lessonPage(id){
const l=flat.find(x=>x.id===id);if(!l)return home();
const m=C.modules[l.moduleIndex],idx=flat.indexOf(l),next=flat[idx+1],prev=flat[idx-1],done=state.done.has(l.id);
let entries=l.entries?.length?'<table class="entry-table"><thead><tr><th>借贷方向</th><th>会计科目或工作底稿项目</th><th class="amount">金额（万元）</th></tr></thead><tbody>'+l.entries.map(e=>'<tr><td class="'+(e[0]==="借"?"debit":"credit")+'">'+esc(e[0])+'</td><td>'+esc(e[1])+'</td><td class="amount">'+esc(e[2])+'</td></tr>').join("")+'</tbody></table>':'';
let selected=state.answers[l.id];
let quiz='<section class="quiz" id="quiz"><div class="panel-kicker">KNOWLEDGE CHECK · 理解测试</div><h2>检验一下</h2><p>'+esc(l.quiz.q)+'</p>'+l.quiz.options.map((x,i)=>'<button class="quiz-option '+(selected===i?'selected ':'')+(selected!==undefined&&selected===i?(i===l.quiz.answer?'correct':'wrong'):'')+'" type="button" data-quiz="'+i+'" data-lesson="'+l.id+'"><span class="opt-label">'+String.fromCharCode(65+i)+'</span><span>'+esc(x)+'</span></button>').join("")+(selected!==undefined?'<div class="quiz-feedback"><strong>'+(selected===l.quiz.answer?'回答正确':'再想一想')+'</strong><div>'+esc(l.quiz.why)+'</div></div>':'')+'</section>';
return '<div class="crumb"><a href="#home">课程首页</a><span>/</span><a href="#module/'+m.id+'">'+esc(m.title)+'</a><span>/</span><span>第 '+(l.index+1)+' 课</span></div><div class="kicker">MODULE '+String(l.moduleIndex+1).padStart(2,"0")+' · LESSON '+String(l.index+1).padStart(2,"0")+'</div>'+
'<section class="lesson-head"><h1>'+esc(l.title)+'</h1><div class="intro">'+esc(l.summary)+'</div><div class="lesson-bits"><span class="chip">'+l.minutes+' 分钟</span><span class="chip">理论与案例</span><span class="chip green">'+(done?'✓ 已完成':'尚未完成')+'</span></div></section>'+
'<div class="lesson-body"><section class="reading-block"><h2>01 · 先掌握三个判断</h2><div class="concept-list">'+l.concept.map((c,i)=>'<div class="concept-item"><span class="num">'+String(i+1).padStart(2,"0")+'</span><p>'+esc(c)+'</p></div>').join("")+'</div></section>'+
'<section class="reading-block"><h2>02 · 放进实际业务里</h2><div class="case-panel"><div class="panel-kicker">SIMULATED CASE · 业务案例</div><p>'+esc(l.scenario)+'</p></div></section>'+
'<section class="reading-block"><h2>03 · 看会计如何记录</h2><p>以下为针对上述案例特定环节的简化会计处理示意，金额单位为万元，实际处理仍以适用准则及合同事实为依据。</p>'+entries+'<div class="insight"><strong>账务背后的逻辑</strong><div>'+esc(l.insight)+'</div></div></section>'+
'<section class="reading-block"><h2>04 · 常见理解误区</h2><div class="warning">'+esc(l.pitfall)+'</div></section>'+quiz+
'<div class="lesson-controls"><div style="display:flex;gap:9px;flex-wrap:wrap">'+(prev?'<button type="button" class="btn" data-go="lesson/'+prev.id+'">← 上一课</button>':'<button type="button" class="btn" data-go="home">← 课程首页</button>')+'<button type="button" class="btn '+(done?'':'btn-primary')+'" data-complete="'+l.id+'">'+(done?'✓ 已完成，点击可撤销':'标记本课已掌握')+'</button></div>'+(next?'<button type="button" class="btn" data-go="lesson/'+next.id+'">下一课 →</button>':'<button type="button" class="btn" data-go="workshop">进入综合实战 →</button>')+'</div>'+sources()+'</div>';
}

function casesPage(){
return '<div class="crumb"><a href="#home">课程首页</a><span>/</span><span>连续业务案例库</span></div><div class="kicker">CASE LIBRARY</div><section class="lesson-head"><h1>三套业务，三种会计视角</h1><p class="intro">每套案例沿着完整的经济活动逐笔记录，并在最后核对现金、资产、利润和权益。所有数据均为教学模拟，附有简化假设。</p></section><div class="section-heading"><div><h2>选择要推演的案例</h2></div></div><div class="module-grid">'+CASES.map(c=>'<button type="button" class="module-card" data-go="case/'+c.id+'"><div class="module-top"><span>'+esc(c.tag)+'</span><span>'+c.steps.length+' 个环节</span></div><h3>'+esc(c.title)+'</h3><p>'+esc(c.subtitle)+'</p><div class="module-bottom"><span>逐笔分录 · 期末核对</span><span class="arrow">↗</span></div></button>').join("")+'</div>'+sources()
}
function casePage(id){
const c=CASES.find(x=>x.id===id);if(!c)return casesPage();
const steps=c.steps.map((s,i)=>'<div class="case-panel"><div class="panel-kicker">STEP '+String(i+1).padStart(2,"0")+' · '+esc(s.time)+'</div><h3 style="font-size:17px;line-height:1.5;margin:0 0 13px">'+esc(s.title)+'</h3><p>'+esc(s.text)+'</p>'+(s.rows.length?'<table class="entry-table"><thead><tr><th>方向</th><th>科目 / 合并调整</th><th class="amount">金额（万元）</th></tr></thead><tbody>'+s.rows.map(x=>'<tr><td class="'+(x[0]==="借"?"debit":"credit")+'">'+esc(x[0])+'</td><td>'+esc(x[1])+'</td><td class="amount">'+esc(x[2])+'</td></tr>').join("")+'</tbody></table>':'<div class="chip" style="margin-top:15px">此环节无需立即确认会计收入</div>')+'<div class="insight"><strong>为什么这样处理</strong><div>'+esc(s.why)+'</div></div></div>').join("");
return '<div class="crumb"><a href="#home">课程首页</a><span>/</span><a href="#cases">案例库</a><span>/</span><span>'+esc(c.tag)+'</span></div><div class="kicker">WORKED CASE · '+esc(c.tag)+'</div><section class="lesson-head"><h1>'+esc(c.title)+'</h1><p class="intro">'+esc(c.intro)+'</p><div class="lesson-bits"><span class="chip green">连续案例</span><span class="chip">'+c.steps.length+' 个业务环节</span><span class="chip">金额单位：万元</span></div></section><div class="lesson-body"><section class="reading-block"><h2>01 · 本案例重点理解</h2><div class="concept-list">'+c.focus.map((x,i)=>'<div class="concept-item"><span class="num">'+String(i+1).padStart(2,"0")+'</span><p>'+esc(x)+'</p></div>').join("")+'</div></section><section class="reading-block"><h2>02 · 全过程逐笔处理</h2><p>下列分录仅覆盖题设业务，并按照各步骤说明的会计主体或合并工作底稿进行记录。</p>'+steps+'</section><section class="reading-block"><h2>03 · 年末核对结果</h2><div class="case-panel"><div class="panel-kicker">YEAR-END RECONCILIATION</div><table class="entry-table"><tbody>'+c.summary.map(x=>'<tr><td>'+esc(x[0])+'</td><td class="amount"><strong>'+esc(x[1])+'</strong> 万元</td></tr>').join("")+'</tbody></table></div><div class="insight"><strong>逐项验算</strong><div>'+esc(c.formula)+'</div></div><div class="warning"><strong>案例边界</strong><div>'+esc(c.warning)+'</div></div></section><div class="lesson-controls"><button type="button" class="btn" data-go="cases">← 返回案例库</button><button type="button" class="btn btn-primary" data-go="workshop">动手计算下一套案例 →</button></div>'+sources()+'</div>';
}
function glossary(){
return '<div class="crumb"><a href="#home">课程首页</a><span>/</span><span>术语词典</span></div><div class="kicker">GLOSSARY</div><section class="lesson-head"><h1>把复杂术语说清楚</h1><p class="intro">将常见的财务概念固定为可查询的定义。学习时遇到名词，可以回到这里快速查阅。</p></section><div class="section-heading"><div><h2>'+C.glossary.length+'个核心概念</h2></div></div><div class="glossary">'+C.glossary.map(g=>'<div class="glossary-card"><strong>'+esc(g[0])+'</strong><p>'+esc(g[1])+'</p></div>').join("")+'</div>'+sources()
}
function workshop(){
const w=C.capstone;
return '<div class="crumb"><a href="#home">课程首页</a><span>/</span><span>综合演练</span></div><div class="kicker">CAPSTONE · HANDS ON</div><section class="lesson-head"><h1>'+esc(w.title)+'</h1><div class="intro">'+esc(w.brief)+'</div><div class="lesson-bits"><span class="chip green">一家公司 · 一个年度</span><span class="chip">无需计算器</span><span class="chip">提交后核对答案</span></div></section>'+
'<section class="reading-block"><h2>01 · 已知业务数据</h2><div class="case-panel"><div class="panel-kicker">TRANSACTION FACTS · 单位：万元</div><table class="entry-table"><tbody>'+w.facts.map(x=>'<tr><td>'+esc(x[0])+'</td><td class="amount">'+esc(x[1])+'</td></tr>').join("")+'</tbody></table></div></section>'+
'<section class="reading-block"><h2>02 · 自己完成期末测算</h2><p>尝试计算银行存款、应收账款、资产总额、净利润和所有者权益。所有输入均为万元。</p><div class="workbench"><h3>年度财务推演</h3><p>输入你的答案，再点击核对。这里不收集或上传数据。</p><div class="workbench-rows">'+[["cash","期末银行存款"],["receivable","期末应收账款"],["asset","期末资产总额"],["profit","全年净利润"],["equity","期末所有者权益"]].map(([k,v])=>'<div><label for="w-'+k+'">'+v+'（万元）</label><input id="w-'+k+'" type="number" inputmode="decimal" step="any" placeholder="输入金额"></div>').join("")+'</div><div class="hero-actions"><button class="btn btn-primary" id="verify-workbench" type="button">核对五项结果</button><button class="btn" id="show-solution" type="button">查看完整解题过程</button></div><div class="workbench-output" id="workbench-output" aria-live="polite">尚未提交。建议先独立完成后再看答案。</div></div></section><section class="reading-block"><h2>03 · 完成后检查五个问题</h2><div class="concept-list">'+["股东增资是否计入营业收入？","设备购买是资产增加还是全部计入当期费用？","费用化研发支出如何影响净利润？","确认收入但没有收到款项时，会形成什么？","期末资产为什么仍应等于负债加所有者权益？"].map((x,i)=>'<div class="concept-item"><span class="num">'+(i+1)+'</span><p>'+esc(x)+'</p></div>').join("")+'</div></section>'+sources();
}
function render(){
const route=current();let html;
switch(route.page){case"module":html=modulePage(route.id);break;case"cases":html=casesPage();break;case"case":html=casePage(route.id);break;case"lesson":html=lessonPage(route.id);break;case"workshop":html=workshop();break;case"glossary":html=glossary();break;default:html=home()}
root.innerHTML=html;renderSidebar(search.value);document.title=(route.page==="lesson"?(flat.find(l=>l.id===route.id)?.title||"课程")+" | ":route.page==="home"?"":route.page==="workshop"?"综合案例演练 | ":route.page==="glossary"?"术语词典 | ":route.page==="cases"?"连续业务案例库 | ":route.page==="case"?(CASES.find(c=>c.id===route.id)?.title||"连续案例")+" | ":"课程模块 | ")+"企业财务研习室 · 超能日志";document.getElementById("sidebar").classList.remove("open");document.getElementById("mobile-menu").setAttribute("aria-expanded","false");window.scrollTo({top:0,behavior:"auto"});
}
function verify(){
const w=C.capstone,labels={cash:"银行存款",receivable:"应收账款",asset:"资产总额",profit:"净利润",equity:"所有者权益"};let n=0;const out=[];
for(const [key,label] of Object.entries(labels)){const el=document.getElementById("w-"+key);if(!el)return;const val=el.value.trim();if(val!==""&&Number.isFinite(Number(val))&&Math.abs(Number(val)-w.answers[key])<0.0001){out.push("✓ "+label+"：正确");n++}else out.push("× "+label+"：请检查计算")}
document.getElementById("workbench-output").innerHTML="<strong>核对结果："+n+"/5 正确</strong><div>"+out.map(esc).join(" · ")+"</div>"+(n===5?"<div>五项全部正确，可以回顾三张财务报表之间的关系。</div>":"<div>可重复修改并核对，也可查看解题过程。</div>");
if(n===5)toast("综合演练全部正确");
}
document.addEventListener("click",ev=>{
const target=ev.target.closest("[data-go],[data-quiz],[data-complete],#verify-workbench,#show-solution,#theme-toggle,#mobile-menu,#nav-home");
if(!target)return;
if(target.dataset.go){go(...target.dataset.go.split("/"));return}
if(target.id==="nav-home"){go("home");return}
if(target.id==="theme-toggle"){state.dark=!state.dark;document.body.classList.toggle("dark",state.dark);save();return}
if(target.id==="mobile-menu"){const side=document.getElementById("sidebar");const opened=side.classList.toggle("open");target.setAttribute("aria-expanded",String(opened));return}
if(target.dataset.complete){const id=target.dataset.complete;state.done.has(id)?state.done.delete(id):state.done.add(id);save();render();toast(state.done.has(id)?"本课已记录为完成":"已撤销完成状态");return}
if(target.dataset.quiz!==undefined){state.answers[target.dataset.lesson]=Number(target.dataset.quiz);save();const top=window.scrollY;render();window.scrollTo({top:top,behavior:"auto"});return}
if(target.id==="verify-workbench"){verify();return}
if(target.id==="show-solution"){document.getElementById("workbench-output").innerHTML="<strong>参考答案与计算依据</strong><div>"+esc(C.capstone.explanation)+"</div>";return}
});
search.addEventListener("input",()=>renderSidebar(search.value));
window.addEventListener("hashchange",render);
document.body.classList.toggle("dark",state.dark);
render();
})();