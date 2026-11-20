/* 储能原理实验室 · 教学工作台 */
(()=>{
"use strict";
const data=window.ENERGY_CURRICULUM,LABS=window.ENERGY_LABS,FIG=window.ENERGY_FIGURES;
const byId=id=>document.getElementById(id);
if(!data||!LABS||!FIG){byId("lessonContent").textContent="课程加载失败，请刷新页面。";return;}
const all=data.modules.flatMap((m,mIndex)=>m.lessons.map((l,lIndex)=>({...l,module:m,moduleIndex:mIndex,lessonIndex:lIndex})));
const lookup=new Map(all.map((l,i)=>[l.id,i]));const storageKey="energy-lab-university-v1";
let state={done:[],quizzes:{},last:all[0].id,teacher:false};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");if(saved&&typeof saved==="object"){state={done:Array.isArray(saved.done)?saved.done.filter(id=>lookup.has(id)):[],quizzes:(saved.quizzes&&typeof saved.quizzes==="object")?saved.quizzes:{},last:lookup.has(saved.last)?saved.last:all[0].id,teacher:!!saved.teacher};}}catch(e){}
const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch(e){}};
const set=(id,t)=>{const x=byId(id);if(x)x.textContent=t;};
const trust=(id,html)=>{const x=byId(id);if(x)x.innerHTML=html;};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let current=0,teacher=state.teacher,menuOpen=false;
const predictions={
electric:{q:"如果电压、电流不变，只把使用时间加倍，瞬时功率会怎样？",o:["增加一倍","不变","减少一半"],a:1,why:"功率P=UI，与工作时间无关；改变的是总电能E=P×t。"},
crate:{q:"额定容量不变，放电倍率从5C升到10C，理论恒流放电时间会怎样？",o:["增加一倍","不变","减半"],a:2,why:"理论时间t=60/C，倍率翻倍，理想时间减半；实际高倍率放电有额外限制。"},
ions:{q:"对常见石墨负极锂电池，放电时Li+主要从哪极向哪极迁移？",o:["正极→负极","负极→正极","不移动"],a:1,why:"放电时石墨负极脱嵌锂，Li+经电解液向正极迁移。"},
families:{q:"为什么不能只按Wh/kg给所有储能技术排名？",o:["因为还要考虑功率、时间与寿命","因为Wh/kg没有任何用","因为所有储能技术完全一样"],a:0,why:"技术选型是多目标权衡，尤其要匹配应用持续时间和生命周期约束。"},
heat:{q:"等效内阻不变时，电流翻倍，I²R发热功率如何变化？",o:["增加一倍","增加四倍","不变"],a:1,why:"功率与电流平方成正比，(2I)²R=4I²R。"},
pack:{q:"16块相同3.2V、100Ah电芯串联，组合Ah容量会变成1600Ah吗？",o:["会","不会","必须看频率"],a:1,why:"串联增加电压，Ah容量理想情况下仍为100Ah。"},
system:{q:"想把电池直流电输送到交流电网，哪一部分主要负责电能变换？",o:["PCS","EMS","电芯隔膜"],a:0,why:"PCS承担电力电子能量转换，EMS负责调度，BMS负责电芯监测保护。"},
dispatch:{q:"如果午后光伏不足，电池SOC已经到下限，晚间仍能按计划放电吗？",o:["能，SOC无关","不能，须考虑SOC约束","只要光伏装机大就能"],a:1,why:"储存的电能受SOC与功率约束，不可能透支。"},
frequency:{q:"频率低于50Hz时，在本课程比例调频模型中，储能通常做什么？",o:["放电输出有功","充电吸收有功","不管怎样都必须停机"],a:0,why:"此处约定频率偏低，控制器发出正向放电指令，实际运行受并网标准和功率边界约束。"},
economics:{q:"同样输入10度电，往返效率从100%下降到80%，高峰可交付电能如何变化？",o:["变为8度","变为12度","不变"],a:0,why:"RTE=E输出/E输入，10×0.8=8kWh。"},
sizing:{q:"在不改变负荷和时间的前提下，可用SOC比例减小，所需名义电池容量怎样变化？",o:["变小","不变","变大"],a:2,why:"E名义=E交付/(可用比例×效率)，分母减小，容量需要增大。"}
};
function moduleNav(){
 const container=byId("moduleNav");container.replaceChildren();
 data.modules.forEach((m,mi)=>{
  const wrap=document.createElement("div");wrap.className="module-entry";
  const button=document.createElement("button");button.type="button";button.className="module-button";button.dataset.module=mi;
  const finished=m.lessons.filter(l=>state.done.includes(l.id)).length;
  button.innerHTML='<span class="module-icon">'+String(mi+1).padStart(2,"0")+'</span><span><b>'+escape(m.title)+'</b><small>'+escape(m.subtitle)+' · '+finished+'/'+m.lessons.length+'</small></span>';
  button.setAttribute("aria-current",String(all[current].moduleIndex===mi));button.addEventListener("click",()=>go(m.lessons[0].id,true));
  wrap.appendChild(button);
  if(all[current].moduleIndex===mi){
   const sub=document.createElement("div");sub.className="lesson-subnav";
   m.lessons.forEach((l,li)=>{
    const b=document.createElement("button");b.type="button";b.className="lesson-link"+(all[current].id===l.id?" selected":"");b.textContent=(state.done.includes(l.id)?"✓ ":"")+(li+1)+". "+l.title;b.addEventListener("click",()=>go(l.id,true));sub.appendChild(b);
   });wrap.appendChild(sub);
  }
  container.appendChild(wrap);
 });
}
function setProgress(){
 const count=state.done.length,pct=Math.round(count/all.length*100);
 set("progressCount",count+"/"+all.length+"节已完成");set("progressPercent",pct+"%");
 byId("moduleProgressFill").style.width=pct+"%";
 byId("moduleProgress").setAttribute("aria-valuenow",String(pct));
 byId("topProgress").style.width=pct+"%";
}
function teacherUI(){
 byId("teachSidebar").hidden=!teacher;
 document.querySelector(".read-grid").classList.toggle("no-teach",!teacher);
 byId("teacherToggle").setAttribute("aria-pressed",String(teacher));
 byId("teacherToggle").textContent=teacher?"关闭授课提示":"授课提示";
}
function question(l){
 set("quizQuestion",l.quiz.q);
 const host=byId("quizAnswers");host.replaceChildren();
 const previous=Number.isInteger(state.quizzes[l.id])?state.quizzes[l.id]:null;
 l.quiz.options.forEach((option,i)=>{
  const b=document.createElement("button");b.type="button";b.textContent=String.fromCharCode(65+i)+" · "+option;
  if(previous!==null&&i===previous){b.classList.add("chosen",i===l.quiz.answer?"correct":"wrong");}
  b.addEventListener("click",()=>{
   state.quizzes[l.id]=i;persist();
   host.querySelectorAll("button").forEach(b=>b.classList.remove("chosen","wrong","correct"));
   b.classList.add("chosen",i===l.quiz.answer?"correct":"wrong");
   set("quizFeedback",(i===l.quiz.answer?"答对了。":"还不对，可再选一次。正确思路是：")+l.quiz.why);
   byId("markDone").disabled=i!==l.quiz.answer&&!state.done.includes(l.id);
   if(i===l.quiz.answer){byId("markDone").disabled=false;}
  });
  host.appendChild(b);
 });
 set("quizFeedback",previous===null?"选一个答案，查看解析。":(previous===l.quiz.answer?"上次已答对。":"上次答错，可以重新选择。")+" "+l.quiz.why);
 byId("markDone").disabled=previous!==l.quiz.answer&&!state.done.includes(l.id);
}
function prediction(l){
 const box=byId("predictionBlock"),d=predictions[l.lab];
 if(!d){box.hidden=true;return;}
 box.hidden=false;set("predictQuestion",d.q);set("predictionResult","在实验前作出预测，然后调整参数验证。");
 const opts=byId("predictOptions");opts.replaceChildren();
 d.o.forEach((o,i)=>{
  const b=document.createElement("button");b.type="button";b.textContent=o;b.addEventListener("click",()=>{
   opts.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
   set("predictionResult",(i===d.a?"预测符合简化模型。":"可以继续通过实验验证。")+" "+d.why);
  });opts.appendChild(b);
 });
}
function sources(l){
 let html='<h4>阅读与参考资料</h4><p>实验中的数值均为教学假设。需要使用产品规格时，请核对实际样品、测试条件、计量边界和适用标准。</p><ul>';
 l.module.sources.forEach(key=>{const url=data.sourceLinks[key];if(url)html+='<li><a href="'+escape(url)+'" target="_blank" rel="noopener noreferrer">'+escape(key)+'</a></li>'});
 html+='</ul>';trust("lessonSources",html);
}
function render(index,scroll){
 current=index;const l=all[index],m=l.module;
 set("chapterTag","模块 "+(l.moduleIndex+1)+"/"+data.modules.length);
 set("levelTag",l.level);
 set("readingTime","阅读约"+l.time);
 set("lessonCrumb",m.title+" / 第"+(l.lessonIndex+1)+"节");
 set("lessonTitle",l.title);set("lessonLead",l.lead);
 trust("lessonObjectives",l.goals.map(g=>'<span>学习目标 · '+escape(g)+'</span>').join(""));
 set("lessonStory",l.story);trust("lessonFigure",FIG(l.figure));
 set("figureCaption","原创教学示意 · 本图仅用于说明原理和趋势，不代表实测性能；正式工程分析需使用原始测量数据。");
 trust("lessonParas",l.paras.map(p=>'<p>'+escape(p)+'</p>').join(""));
 trust("lessonFormula",'<span>'+escape(l.formula)+'</span><small>'+escape(l.formulaNote)+'</small>');
 set("lessonWorked",l.worked);set("lessonWrong",l.wrong);set("lessonTakeaway",l.takeaway);
 prediction(l);const labMount=byId("labMount");labMount.replaceChildren();
 if(l.lab){try{LABS.render(l.lab,labMount)}catch(e){labMount.textContent="实验加载异常，请刷新页面或继续阅读公式和例题。";}}
 question(l);sources(l);
 set("teacherPlan",m.hours+"。建议按问题→图解→推导→预测→实验→测验推进。");
 set("teacherAsk",l.teach.ask);set("teacherBoard",l.teach.board);set("teacherTask",l.teach.task);
 byId("markDone").textContent=state.done.includes(l.id)?"已完成本课 ✓":"标记本课已学完 ✓";
 set("lessonDoneState",state.done.includes(l.id)?"已保存到本地学习记录":"先答对课堂小测，再标记完成");
 byId("prevLesson").disabled=index===0;byId("nextLesson").disabled=index===all.length-1;
 byId("nextLesson").textContent=index===all.length-1?"最后一节":"下一节 →";
 moduleNav();setProgress();state.last=l.id;persist();
 // URL fragments make each lesson directly linkable; no reload or network.
 history.replaceState(null,"","#"+l.id);
 if(scroll){const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 byId("lessonContent").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
 closeMenu();}
}
function go(id,scroll){const i=lookup.get(id);if(Number.isInteger(i))render(i,scroll);}
function closeMenu(){menuOpen=false;byId("courseMenu").classList.remove("open");byId("openMenu").setAttribute("aria-expanded","false");}
function firstIncomplete(){return all.find(x=>!state.done.includes(x.id))?.id||state.last||all[0].id;}
byId("startCourse").addEventListener("click",()=>go(all[0].id,true));
byId("resumeCourse").addEventListener("click",()=>go(firstIncomplete(),true));
byId("markDone").addEventListener("click",()=>{
 const l=all[current];if(state.quizzes[l.id]!==l.quiz.answer)return;
 if(!state.done.includes(l.id))state.done.push(l.id);
 persist();setProgress();moduleNav();set("lessonDoneState","本节已完成，学习记录保存在此浏览器。");
 byId("markDone").textContent="已完成本课 ✓";
});
byId("prevLesson").addEventListener("click",()=>{if(current>0)render(current-1,true)});
byId("nextLesson").addEventListener("click",()=>{if(current<all.length-1)render(current+1,true)});
byId("teacherToggle").addEventListener("click",()=>{teacher=!teacher;state.teacher=teacher;persist();teacherUI()});
byId("openMenu").addEventListener("click",()=>{menuOpen=!menuOpen;byId("courseMenu").classList.toggle("open",menuOpen);byId("openMenu").setAttribute("aria-expanded",String(menuOpen))});
document.addEventListener("click",e=>{if(menuOpen&&!byId("courseMenu").contains(e.target)&&!byId("openMenu").contains(e.target))closeMenu()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});
window.addEventListener("hashchange",()=>{const id=decodeURIComponent(location.hash.slice(1));if(lookup.has(id)&&all[current].id!==id)go(id,false)});
byId("shareLesson").addEventListener("click",async()=>{
 const link=location.href;try{await navigator.clipboard.writeText(link);set("shareLesson","本节链接已复制 ✓");}catch(e){set("shareLesson",link)}
});
const glossary=[
["储能","将能量暂时保存在化学、机械、热或其他形式中，之后再释放。"],
["kW（千瓦）","功率单位，描述能量转移速度。1MW=1000kW。"],
["kWh（千瓦时）","电能单位，1kWh就是日常说的1度电。1MWh=1000kWh。"],
["电压 V","电势差，影响电能传递。"],
["电流 A","电荷通过导体的速率。"],
["功率 W","每秒能量传递速率，直流有P=UI。"],
["容量 Ah","安时，用于表示电荷容量。乘标称电压可以近似估算Wh。"],
["C倍率","电流相对额定Ah容量的倍率，理想恒流时间t=1/C小时。"],
["比能量 Wh/kg","单位质量储存的电能，必须说明质量分母。"],
["比功率 W/kg","单位质量可以提供的功率，必须说明持续时间及工况。"],
["SOC","荷电状态，剩余电荷相对于参考容量的比例。"],
["SOH","健康状态，可基于容量和内阻等定义。"],
["DOD","放电深度，一次放电动用了多少参考容量。"],
["内阻","电芯等效电阻，增加放电压降与部分发热。"],
["电压截止","设备规定的停止放电或充电的电压边界。"],
["RTE","往返效率，同一计量边界下输出电能/输入电能。"],
["BMS","电池管理系统，负责监测、估算状态、均衡与保护。"],
["PCS","储能变流器，负责交流与直流的双向电能变换。"],
["EMS","能量管理系统，执行储能调度策略。"],
["LFP","磷酸铁锂，一种锂离子电池正极材料路线。"],
["NMC","含镍锰钴的三元锂正极材料体系。"],
["LIC","锂离子电容器，组合电池型和电容型电极机制。"],
["EDLC","双电层超级电容，主要利用电极界面电荷储能。"],
["液流电池","把活性物质储存在电解液罐中，经电堆充放电。"],
["抽水蓄能","把水抽到高处存储重力势能，放水发电。"],
["飞轮储能","利用高速旋转转子的动能储能。"],
["调频","用有功功率响应支持电力系统频率调节。"],
["削峰填谷","调整不同时间的用电或供电功率。"],
["LCOS","平准化储能成本，按财务边界比较生命周期费用与交付电能。"],
["热失控","某些电池异常内部放热反应自加速现象，可能造成安全风险。"],
["并网","符合规定的电能接入与运行。"],
["防孤岛保护","电网异常时防止非预期独立供电的保护机制。"]
];
const dialog=byId("glossaryDialog"),search=byId("glossarySearch");
function filterGlossary(){
 const q=search.value.trim().toLowerCase(),out=glossary.filter(([name,desc])=>(name+" "+desc).toLowerCase().includes(q));
 const node=byId("glossaryResults");node.replaceChildren();
 out.forEach(([name,desc])=>{const box=document.createElement("div");box.className="gloss-item";const b=document.createElement("b");b.textContent=name;const p=document.createElement("p");p.textContent=desc;box.append(b,p);node.appendChild(box)});
 if(!out.length){const p=document.createElement("p");p.textContent="没有找到匹配的术语，请换个词。";node.appendChild(p)}
}
byId("glossaryOpen").addEventListener("click",()=>{filterGlossary();if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");search.focus()});
byId("glossaryClose").addEventListener("click",()=>dialog.close?dialog.close():dialog.removeAttribute("open"));
search.addEventListener("input",filterGlossary);
teacherUI();filterGlossary();
const initial=decodeURIComponent(location.hash.slice(1)),lesson=lookup.has(initial)?initial:(lookup.has(state.last)?state.last:all[0].id);
render(lookup.get(lesson),false);
})();