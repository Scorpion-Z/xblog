(function(){
"use strict";
const $=id=>document.getElementById(id);
const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString("zh-CN",{maximumFractionDigits:d,minimumFractionDigits:0}):"—";
const number=id=>Number($(id).value);
const setText=(id,s)=>{const el=$(id);if(el)el.textContent=s};
const setWidth=(id,p)=>{const el=$(id);if(el)el.style.width=Math.max(0,Math.min(100,p))+"%"};
const bind=(ids,fn)=>ids.forEach(id=>$(id).addEventListener("input",fn));
const presets={base:[1,100,30,100,90,95],slow:[1,100,1,100,100,95],heavy:[10,100,30,1000,90,95]};
const labIds=["mass","densityInput","crate","load","retain","eff"];
let labData={energy:100,power:3000,usable:85.5,load:100,valid:true,runSeconds:3078},sim={elapsed:0,running:false,last:null,speed:60,frame:0};
function secondsLabel(s){if(s<60)return fmt(s,1)+" 秒";if(s<3600)return fmt(s/60,2)+" 分钟";return fmt(s/3600,2)+" 小时";}
function resetSimulation(stopOnly=false){sim.running=false;sim.last=null;cancelAnimationFrame(sim.frame);setText("simStart","▶ 开始");if(!stopOnly)sim.elapsed=0;renderSimulation();}
function updateLab(){
  const m=number("mass"),d=number("densityInput"),r=number("crate"),load=number("load"),retain=number("retain")/100,eff=number("eff")/100;
  const E=m*d,P=E*r,usable=E*retain*eff,valid=load<=P,sec=usable/load*3600;
  labData={energy:E,power:P,usable,load,valid,runSeconds:sec};
  setText("massLabel",fmt(m,1)+" kg");setText("densityLabel",fmt(d,0)+" Wh/kg");setText("crateLabel",r+" C");setText("loadLabel",fmt(load,0)+" W");
  setText("retainLabel",Math.round(retain*100)+"%");setText("effLabel",Math.round(eff*100)+"%");
  setText("outEnergy",fmt(E,1)+" Wh");setText("outPower",fmt(P,0)+" W");setText("outDuration",fmt(60/r,2)+" 分钟");setText("outUsable",fmt(usable,2)+" Wh");
  setText("outRuntime",valid?secondsLabel(sec):"超过功率上限");
  setText("runtimeExplain",valid?"以给定可用能量、恒功率负载估算":"该负载高于名义倍率功率上限，无法按此模型供电");
  setText("powerRatio",fmt(load/P*100,1)+"%");setWidth("powerFill",load/P*100);
  const fb=$("loadFeedback");fb.classList.toggle("bad",!valid);fb.textContent=valid?
     "当前 "+fmt(load,0)+"W 负载低于名义功率上限。放电时长由实际负载决定，不由最大C倍率直接决定。":
     "当前负载 "+fmt(load,0)+"W 超过名义上限 "+fmt(P,0)+"W。在此简化模型中不允许连续运行。";
  resetSimulation();
}
bind(labIds,()=>{document.querySelectorAll("[data-preset]").forEach(b=>b.classList.remove("selected"));updateLab()});
document.querySelectorAll("[data-preset]").forEach(btn=>btn.addEventListener("click",()=>{
  const arr=presets[btn.dataset.preset];labIds.forEach((id,i)=>$(id).value=arr[i]);
  document.querySelectorAll("[data-preset]").forEach(b=>b.classList.toggle("selected",b===btn));updateLab();
}));
$("resetLab").addEventListener("click",()=>document.querySelector('[data-preset="base"]').click());
function renderSimulation(){
 const fraction=labData.usable>0?Math.max(0,1-sim.elapsed/labData.runSeconds):0;
 const left=labData.usable*fraction;
 setText("socLabel",Math.round(fraction*100)+"%");
 setText("simElapsed",secondsLabel(sim.elapsed));
 setText("simRemaining",fmt(left,2)+" Wh");
 setText("simMessage",!labData.valid?"功率超限，请先降低外部负载。":fraction===0?"演示完成：在假设条件下，可用电能耗尽。":sim.running?"按设定速度模拟恒定负载工作。":"点击“开始”，观察可用电能变化。");
 setWidth("simProgress",fraction*100);$("batteryFill").style.height=Math.max(0,Math.min(100,fraction*100))+"%";
}
function tick(now){
 if(!sim.running)return;
 if(sim.last!==null)sim.elapsed+=Math.min((now-sim.last)/1000,0.15)*sim.speed;
 sim.last=now;
 if(sim.elapsed>=labData.runSeconds){sim.elapsed=labData.runSeconds;sim.running=false;sim.last=null;setText("simStart","▶ 重播");renderSimulation();return;}
 renderSimulation();sim.frame=requestAnimationFrame(tick);
}
$("simStart").addEventListener("click",()=>{
 if(!labData.valid){setText("simMessage","功率超限，降低负载后再运行。");return;}
 if(sim.running){resetSimulation(true);setText("simStart","▶ 继续");return;}
 if(sim.elapsed>=labData.runSeconds)sim.elapsed=0;
 sim.running=true;sim.last=null;setText("simStart","Ⅱ 暂停");sim.frame=requestAnimationFrame(tick);
});
$("simReset").addEventListener("click",()=>resetSimulation());
document.querySelectorAll("[data-speed]").forEach(btn=>btn.addEventListener("click",()=>{
 sim.speed=Number(btn.dataset.speed);document.querySelectorAll("[data-speed]").forEach(b=>b.classList.toggle("active",b===btn));
}));
document.addEventListener("visibilitychange",()=>{if(document.hidden&&sim.running){resetSimulation(true);setText("simStart","▶ 继续");}});
function updateCap(){
 const f=number("capF"),vmax=number("capMax"),vmin=number("capMin");
 const valid=vmax>vmin,E=valid ? 0.5*f*(vmax*vmax-vmin*vmin)/3600 : 0;
 setText("capFLabel",fmt(f,0)+" F");setText("capMaxLabel",fmt(vmax,1)+" V");setText("capMinLabel",fmt(vmin,1)+" V");
 setText("capEnergy",fmt(E,3)+" Wh");setText("capNote",valid?"理想恒电容计算；实际器件需按测量曲线积分。":"最高电压必须大于截止电压，请调整参数。");
}
bind(["capF","capMax","capMin"],updateCap);
function updateOhm(){
 const v=number("ohmV"),i=number("ohmI"),r=number("ohmR")/1000,drop=i*r,terminal=v-drop,heat=i*i*r;
 setText("ohmVLabel",fmt(v,1)+" V");setText("ohmILabel",fmt(i,0)+" A");setText("ohmRLabel",fmt(r*1000,0)+" mΩ");
 setText("ohmDrop",fmt(drop,2)+" V");setText("ohmTerminal",terminal>0?fmt(terminal,2)+" V":"≤0 V");
 setText("ohmHeat",fmt(heat,1)+" W");
 setWidth("ohmBar",terminal>0?terminal/v*100:0);
 setText("ohmNote",terminal<=0?"参数使简化模型出现非物理端电压，实际电芯会受保护、限流或提前截止。":terminal<2?"端电压已很低，真实电芯可能提前触及放电截止条件。":"固定内阻与开路电压的瞬时示例；不是实际产品参数。");
}
bind(["ohmV","ohmI","ohmR"],updateOhm);
function updateGrid(){
 const f=number("gridFreq"),k=number("gridK"),limit=number("gridLimit"),sec=number("gridSeconds"),E=number("gridEnergy");
 const delta=50-f;const signed=Math.max(-limit,Math.min(limit,delta*k));const p=Math.abs(signed),need=p*sec/3600;
 const action=Math.abs(delta)<.00001?"频率恰为 50Hz：本模型不发出充放电指令":signed>0?"频率偏低：储能向电网放电 "+fmt(p,2)+" kW":"频率偏高：储能从电网充电 "+fmt(p,2)+" kW";
 setText("gridFreqLabel",f.toFixed(2)+" Hz");setText("gridKLabel",fmt(k,0)+" kW/Hz");setText("gridLimitLabel",fmt(limit,0)+" kW");setText("gridSecondsLabel",fmt(sec,0)+" 秒");setText("gridEnergyLabel",fmt(E,1)+" kWh");
 setText("gridAction",action);setText("gridP",fmt(p,2)+" kW");setText("gridE",fmt(need,3)+" kWh");
 setText("gridTime",p?secondsLabel(E/p*3600):"暂无功率指令");
 $("freqNeedle").style.left=((f-49.8)/.4*100)+"%";
 setText("gridNote",need>E?"当前时长要求的电能超过可用放电电能或充电余量，在这个模型中无法全程执行。":"教学模型：比例系数×偏差得到功率指令，并受功率上限约束；不含SOC动态、死区、效率或真实并网策略。");
}
bind(["gridFreq","gridK","gridLimit","gridSeconds","gridEnergy"],updateGrid);
function updateAudit(){
 const checks=Array.from($("checklist").querySelectorAll('input[type="checkbox"]')),c=checks.filter(x=>x.checked).length;
 setText("auditCount",c+"/"+checks.length);
 let title="证据尚未补齐",body="尚有 "+(checks.length-c)+" 项待确认。清单用于检查证据是否齐全，不能取代专业测试或技术尽调。";
 if(c===checks.length){title="资料齐备，可进入技术复核";body="全部项目均已勾选。下一步仍须核对原始记录、实验一致性、可靠性和经济性，不能把清单完成等同于指标真实达标。";}
 else if(c>=5){title="已有部分评审依据";body="已有 "+c+" 项证据，但缺项可能直接改变结论。尤其不能省略质量口径、相同样品、倍率下实得能量。";}
 setText("auditVerdict",title);setText("auditText",body);
}
$("checklist").addEventListener("change",updateAudit);
$("auditReset").addEventListener("click",()=>{document.querySelectorAll('#checklist input').forEach(x=>x.checked=false);updateAudit()});
const questions=[
 {q:"功率单位 W 与电能单位 Wh，主要差别是什么？",a:["W 表示一段时间内的电能总量","W 表示能量传递的速率，Wh 表示电能总量","两者完全相同","Wh 只适用于交流电"],c:1,why:"W 是功率；Wh 是功率对时间的积分。100W 的灯工作 1 小时消耗 100Wh。"},
 {q:"日常说的“1度电”相当于多少 Wh？",a:["1 Wh","100 Wh","1000 Wh","3600 Wh"],c:2,why:"1 度电 = 1 kWh = 1000 Wh。1Wh 又等于 3600J。"},
 {q:"一块电芯重 2kg，能量密度为 100Wh/kg，其标称电能是？",a:["50 Wh","100 Wh","200 Wh","2000 Wh"],c:2,why:"电能 E = 质量 m × 能量密度 D = 2 ×100 =200Wh。"},
 {q:"为什么 30C 对应的理想恒流放电时间是 2 分钟？",a:["因为 30 乘以 2 等于 60","因为 1C 约一小时，60分钟除以30","因为电压恒为30V","因为每公斤只能放电2分钟"],c:1,why:"倍率 r 的理想时间是 1/r 小时，换算分钟才出现数字60。"},
 {q:"额定容量为 10Ah 的电芯，在 30C 下对应多大恒流放电电流？",a:["0.33 A","30 A","300 A","3000 A"],c:2,why:"I = 倍率×额定安时容量 = 30×10=300A。"},
 {q:"理论上有 100Wh 可用电能的电芯接 100W 负载，忽略损耗可运行多久？",a:["2分钟","6分钟","1小时","10小时"],c:2,why:"E/P =100Wh÷100W=1小时。最大支持30C并不意味着只能工作2分钟。"},
 {q:"一款电芯的标称能量密度为 100Wh/kg，最大放电倍率30C，能推出什么？",a:["30C时仍能释放完整100Wh/kg","每次充电必然只要2分钟","只能估算额定电压下名义功率，不能证明高倍率实得能量","已经具备量产能力"],c:2,why:"高倍率可能有压降、温升和提前截止；需实测该倍率下释放的Wh以及持续时间。"},
 {q:"在 R 不变的简化模型里，电流加倍，电阻发热功率会怎样？",a:["不变","加倍","变为4倍","减半"],c:2,why:"P_heat = I²R；I 变 2 倍，I²就变 4 倍。"},
 {q:"理想恒定电容在 Umax 到 Umin 放电，可释放的能量与什么有关？",a:["最高电压减最低电压","最高与最低电压的平方差","只看电容质量","只看30C倍率"],c:1,why:"E = ½F(Umax²−Umin²)，结果先是焦耳，换算Wh要除以3600。"},
 {q:"评审“100Wh/kg、30C”研发目标时，下列哪项证据最有价值？",a:["广告海报中的最高参数","材料级数据与另一种样品的功率参数","同一完整电芯、明确温度与电压窗口下的放电曲线、实得能量、寿命数据","项目名称与预算"],c:2,why:"需要统一对象、质量和测试条件，核验两个性能指标能否在同一产品上共同成立。"}
];
let quizGraded=false;
function buildQuiz(){
 const host=$("quizMount");host.innerHTML="";
 questions.forEach((q,idx)=>{
  const item=document.createElement("section");item.className="quiz-question";item.dataset.idx=idx;
  const title=document.createElement("h4");const num=document.createElement("small");num.textContent=String(idx+1).padStart(2,"0");title.append(num,document.createTextNode(q.q));item.appendChild(title);
  const options=document.createElement("div");options.className="quiz-options";
  q.a.forEach((text,j)=>{const label=document.createElement("label");const radio=document.createElement("input");radio.type="radio";radio.name="q"+idx;radio.value=String(j);radio.addEventListener("change",()=>{if(quizGraded)clearGrades();updateQuizCounter()});const span=document.createElement("span");span.textContent=String.fromCharCode(65+j)+". "+text;label.append(radio,span);options.appendChild(label)});
  item.appendChild(options);const exp=document.createElement("div");exp.className="quiz-explain";exp.dataset.explain=idx;item.appendChild(exp);host.appendChild(item);
 });
 updateQuizCounter();
}
function updateQuizCounter(){let n=questions.filter((_,i)=>document.querySelector('input[name="q'+i+'"]:checked')).length;setText("quizAnswered",n+"/"+questions.length)}
function clearGrades(){
 quizGraded=false;document.querySelectorAll(".quiz-question").forEach(el=>el.classList.remove("correct","wrong"));
 document.querySelectorAll(".quiz-explain").forEach(el=>{el.classList.remove("visible");el.textContent=""});
 setText("quizResult","");
}
$("submitQuiz").addEventListener("click",()=>{
 let score=0,answered=0;
 questions.forEach((q,idx)=>{
  const chosen=document.querySelector('input[name="q'+idx+'"]:checked'),item=document.querySelector('.quiz-question[data-idx="'+idx+'"]'),exp=document.querySelector('[data-explain="'+idx+'"]');
  item.classList.remove("correct","wrong");if(chosen){answered++;if(Number(chosen.value)===q.c){score++;item.classList.add("correct")}else item.classList.add("wrong")}else item.classList.add("wrong");
  exp.textContent=(chosen?(Number(chosen.value)===q.c?"答对。":"答错。"):"未作答。")+" 正确答案："+String.fromCharCode(65+q.c)+"。"+q.why;exp.classList.add("visible");
 });
 quizGraded=true;setText("quizResult",score+" / "+questions.length+" 正确"+(answered<questions.length?"（有 "+(questions.length-answered)+" 题未作答）":""));
});
$("resetQuiz").addEventListener("click",()=>{buildQuiz();setText("quizResult","");quizGraded=false;$("quiz").scrollIntoView({behavior:"smooth",block:"start"})});
const side=$("side"),menu=$("menuToggle");
menu.addEventListener("click",()=>{const open=side.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"关闭 ×":"目录 ☰"});
document.querySelectorAll(".side-nav a").forEach(a=>a.addEventListener("click",()=>{side.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="目录 ☰"}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&side.classList.contains("open")){side.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="目录 ☰"}});
document.addEventListener("pointerdown",e=>{if(side.classList.contains("open")&&!side.contains(e.target)&&!menu.contains(e.target)){side.classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="目录 ☰"}});
const navLinks=Array.from(document.querySelectorAll("[data-nav]"));const sections=Array.from(document.querySelectorAll("[data-section]"));
function handleScroll(){
 const max=document.documentElement.scrollHeight-window.innerHeight;
 setWidth("readingProgress",max>0?window.scrollY/max*100:0);
 let current=sections[0].id;
 for(const sec of sections)if(sec.getBoundingClientRect().top<180)current=sec.id;
 navLinks.forEach(a=>{const active=a.dataset.nav===current;a.classList.toggle("active",active);if(active)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")});
}
window.addEventListener("scroll",handleScroll,{passive:true});
window.addEventListener("resize",handleScroll);
updateLab();updateCap();updateOhm();updateGrid();updateAudit();buildQuiz();handleScroll();
})();
