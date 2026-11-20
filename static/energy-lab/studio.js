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
 html+='</ul>';
 const manualMap={
 why:"why",units:"electricity",acdc:"electricity",whah:"density",crate:"density",efficiency:"economics",
 structure:"physics",ion:"physics",families:"types",resistance:"engineering",curves:"engineering",aging:"safety",
 series:"systems",systemParts:"systems",safetySite:"safety",solarDispatch:"solar",frequency:"grid",services:"scenarios",
 tariff:"economics",lcos:"economics",selection:"forms",sizing:"design",verification:"audit",capstone:"audit"
 };
 const section=manualMap[l.id]||"why";
 html+='<div class="course-resource-links"><h4>进一步学习</h4><a href="./handbook.html#'+section+'">知识手册：详细解释与资料 →</a>'+
  (l.lab?'<a href="./labs.html#'+l.lab+'">虚拟实验室：单独操作本实验 →</a>':'')+
  '<a href="./workbook.html">计算训练：独立完成习题 →</a></div>';
 trust("lessonSources",html);
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
// 术语与详细知识统一由 handbook.html 提供，避免维护两份不一致的词典。
teacherUI();

const initial=decodeURIComponent(location.hash.slice(1)),lesson=lookup.has(initial)?initial:(lookup.has(state.last)?state.last:all[0].id);
render(lookup.get(lesson),false);
})();