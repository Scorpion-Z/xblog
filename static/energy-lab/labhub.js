(()=>{"use strict";
const LABS=window.ENERGY_LABS;
const experiments=[
{id:"electric",title:"电压、电流与电能",category:"电学基础",desc:"通过U、I和时间，理解W与Wh的区别。",lesson:"units",question:"只增加电器工作时间，瞬时功率会变化吗？"},
{id:"crate",title:"C倍率与放电曲线",category:"储能参数",desc:"从额定Ah推导电流和时间，观察简化压降。",lesson:"crate",question:"30C理论2分钟，为什么真实高倍率可能提前截止？"},
{id:"ions",title:"锂离子与电子迁移",category:"电芯原理",desc:"切换充放电，观察电芯内外不同的载流路径。",lesson:"ion",question:"锂离子为什么需要走电解液，而电子需要经过外部电路？"},
{id:"families",title:"储能技术家族",category:"技术分类",desc:"比较磷酸铁锂、液流、超级电容、抽水蓄能等路线。",lesson:"families",question:"为什么秒级功率任务和小时级储能任务的技术选型不同？"},
{id:"heat",title:"内阻与发热",category:"电芯性能",desc:"提高电流，观察IR压降与I²R变化。",lesson:"resistance",question:"电流加倍，为什么简化内阻热功率可能变为四倍？"},
{id:"pack",title:"电芯串并联",category:"系统工程",desc:"改变串数和并数，计算组合电压与容量。",lesson:"series",question:"为什么电芯串联后，安时容量没有按串数叠加？"},
{id:"system",title:"BMS、PCS与EMS",category:"系统工程",desc:"理解站级组成与电能转换效率。",lesson:"systemParts",question:"如果BMS限制输出，EMS原来的充放电计划还有效吗？"},
{id:"dispatch",title:"24小时光储调度",category:"电力应用",desc:"模拟光伏、负荷与电池SOC随时间的变化。",lesson:"solarDispatch",question:"为什么初始SOC不同，可能让同一天的购电量不同？"},
{id:"frequency",title:"电网调频响应",category:"电力应用",desc:"从频率偏差推导调节功率和所需电能。",lesson:"frequency",question:"一项调频指令要求持续更久，对电池能量有何影响？"},
{id:"economics",title:"峰谷电价与损耗",category:"经济性",desc:"计算充放电毛差额，辨认哪些成本尚未计入。",lesson:"tariff",question:"价格差为正时，为什么充放电仍可能出现亏损？"},
{id:"sizing",title:"储能容量选型",category:"工程案例",desc:"根据功率、时长、效率和可用比例估算容量。",lesson:"sizing",question:"为什么最低计算值不能直接作为采购容量？"}
];
const nav=document.getElementById("labNav"),mount=document.getElementById("labMount"),lookup=new Map(experiments.map(e=>[e.id,e]));
if(!LABS||LABS.ids.length!==experiments.length){mount.textContent="实验组件加载异常，请刷新页面重试。";return;}
function show(id,scroll=false){
 const exp=lookup.get(id)||experiments[0];
 document.getElementById("labCategory").textContent=exp.category;
 document.getElementById("labTitle").textContent=exp.title;
 document.getElementById("labObjective").textContent=exp.desc;
 document.getElementById("labReflection").textContent=exp.question;
 document.getElementById("labLessonLink").href="./#"+exp.lesson;
 nav.querySelectorAll("button").forEach(b=>{const selected=b.dataset.lab===exp.id;b.classList.toggle("selected",selected);b.setAttribute("aria-pressed",String(selected))});
 mount.replaceChildren();
 try{LABS.render(exp.id,mount)}catch(err){mount.textContent="这一实验暂时无法启动，请刷新或通过主课程阅读原理。";}
 history.replaceState(null,"","#"+exp.id);
 if(scroll){const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;document.getElementById("hubLab").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})}
}
experiments.forEach((exp,i)=>{
 const button=document.createElement("button");button.type="button";button.dataset.lab=exp.id;
 const strong=document.createElement("strong");strong.textContent=String(i+1).padStart(2,"0")+" · "+exp.title;
 const small=document.createElement("small");small.textContent=exp.desc;
 button.append(strong,small);button.addEventListener("click",()=>show(exp.id,true));nav.appendChild(button);
});
window.addEventListener("hashchange",()=>{const id=decodeURIComponent(location.hash.slice(1));if(lookup.has(id))show(id,false)});
const initial=decodeURIComponent(location.hash.slice(1));show(lookup.has(initial)?initial:"electric");
})();