(()=>{
"use strict";
const $=id=>document.getElementById(id),num=id=>Number($(id).value),show=(id,v)=>{if($(id))$(id).textContent=v},fmt=(x,n=1)=>Number.isFinite(x)?x.toLocaleString("zh-CN",{maximumFractionDigits:n}):"—";
const pressed=(sel,key,val)=>document.querySelectorAll(sel).forEach(b=>b.setAttribute("aria-pressed",String(b.dataset[key]===String(val))));
const bind=(ids,fn)=>ids.forEach(id=>$(id).addEventListener("input",fn));
const time=h=>h<1?fmt(h*60,1)+"分钟":fmt(h,2)+"小时";
// A 24-hour teaching scenario: kW power held constant within each hour, battery kWh.
const pv=[0,0,0,0,0,0,.1,.45,1.2,2.35,3.5,4.35,4.8,4.75,4.15,3.2,1.9,.75,.1,0,0,0,0,0];
const load=[.55,.48,.42,.4,.42,.5,.9,1.22,1.05,.85,.76,.91,1.12,1.04,.93,1,1.29,1.95,2.38,2.24,1.73,1.35,1.02,.78];
let mode="battery",hour=12,dayTimer=null;
function rows(){
 let soc=2;const rows=[];
 for(let h=0;h<24;h++){
 const solar=mode==="grid"?0:pv[h],L=load[h],net=solar-L;
 let charge=0,discharge=0,grid=Math.max(0,-net),exported=Math.max(0,net);
 if(mode==="battery"){
 if(net>0){charge=Math.max(0,Math.min(net,3,(8-soc)/.95));soc+=charge*.95;grid=0;exported=Math.max(0,net-charge);}
 else{discharge=Math.max(0,Math.min(-net,3,soc*.95));soc-=discharge/.95;grid=Math.max(0,-net-discharge);exported=0;}
 }
 rows.push({solar,L,charge,discharge,grid,exported,soc:Math.max(0,Math.min(8,soc))});
 }
 return rows;
}
function drawChart(){
 const points=arr=>arr.map((v,i)=>(30+i*25.35)+","+(148-Math.max(0,Math.min(6,v))*22.5)).join(" ");
 $("pvLine").setAttribute("points",points(mode==="grid"?pv.map(()=>0):pv));$("loadLine").setAttribute("points",points(load));
 const g=$("dayGrid");if(!g.childNodes.length){for(let k=0;k<4;k++){const line=document.createElementNS("http://www.w3.org/2000/svg","line");line.setAttribute("x1","30");line.setAttribute("x2","615");line.setAttribute("y1",String(148-k*45));line.setAttribute("y2",String(148-k*45));line.setAttribute("class","chart-track");g.append(line);}}
}
function updateDay(){
 const a=rows(),v=a[hour],night=hour<7||hour>=19;drawChart();
 $("dayHour").value=hour;show("dayTime",String(hour).padStart(2,"0")+":00");$("dayVisual").dataset.night=night;show("sunIcon",night?"☾":"☀");
 show("pvNow",mode==="grid"?"未安装光伏":fmt(v.solar,2)+"kW");show("loadNow",fmt(v.L,2)+"kW");
 show("socNow",mode==="battery"?"SOC "+fmt(v.soc/8*100,0)+"%":"未安装电池");
 show("pvVal",fmt(v.solar,2)+"kW");show("gridVal",fmt(v.grid,2)+"kW");
 show("battVal",mode!=="battery"?"未配置":v.charge>.001?"充电 "+fmt(v.charge,2)+"kW":v.discharge>.001?"放电 "+fmt(v.discharge,2)+"kW":"待机");
 const x=30+hour*25.35;$("dayCursor").setAttribute("x1",x);$("dayCursor").setAttribute("x2",x);
 const imported=a.reduce((s,z)=>s+z.grid,0),exported=a.reduce((s,z)=>s+z.exported,0);
 let explain=mode==="grid"?"全部负荷从电网取电。":mode==="solar"?"光伏优先直供家庭，多余电按模型直接送出。":v.charge>.001?"光伏有富余，电池充电。":v.discharge>.001?"光伏不足，电池正在放电。":"电池当前待机。";
 show("dayInsight",explain+" 按该一天的示例，从电网取电约"+fmt(imported,1)+"kWh，向电网送出约"+fmt(exported,1)+"kWh。未计电价或交易条件。");
}
function stopDay(){if(dayTimer!==null){clearInterval(dayTimer);dayTimer=null;}show("dayPlay","▶ 播放一天");}
document.querySelectorAll("[data-daymode]").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.daymode;pressed("[data-daymode]","daymode",mode);updateDay();}));
$("dayHour").addEventListener("input",()=>{hour=num("dayHour");updateDay()});
$("dayPlay").addEventListener("click",()=>{if(dayTimer!==null){stopDay();return;}show("dayPlay","Ⅱ 暂停");dayTimer=setInterval(()=>{hour=(hour+1)%24;updateDay();if(hour===23)stopDay()},650);});
$("dayReset").addEventListener("click",()=>{stopDay();hour=12;mode="battery";pressed("[data-daymode]","daymode",mode);updateDay()});
// power and energy, 1 real second = 1 simulated hour
const appliances={lamp:.1,heater:1.5,large:6},labels={lamp:"照明",heater:"电暖器",large:"大负载"};
let appliance="heater",elapsed=0,running=false,raf=0,last=0;
const data=()=>({e:num("capacityInput"),max:num("powerInput"),p:appliances[appliance]});
const fraction=()=>{const a=data();return a.p>a.max?1:Math.max(0,1-elapsed/(a.e*.9/a.p*3600));};
function renderTank(){
 const a=data(),f=fraction(),ok=a.p<=a.max;$("tankFill").style.height=fmt(f*100,3)+"%";
 show("tankPercent",fmt(f*100,0)+"%");show("drainTime","已模拟"+time(elapsed/3600));show("usableE",fmt(a.e*.9,2)+"kWh");
 show("applianceP",fmt(a.p,2)+"kW");show("runtime",ok?time(a.e*.9/a.p):"功率超限");
 show("capMetric",fmt(a.e,0)+"kWh");show("powMetric",fmt(a.max,1)+"kW");show("powerState",ok?"可供电":"超限");
 show("overload",ok?"":"电器功率超出设备最大持续输出功率，本模型无法供电。");
 show("capacityInsight",ok?labels[appliance]+"消耗功率"+fmt(a.p,2)+"kW。在90%可用比例的教学假设下，理想可运行"+time(a.e*.9/a.p)+"。":"输出功率不足。尝试提高最大功率，或改用小负载。");
}
function stopDrain(){running=false;cancelAnimationFrame(raf);last=0;show("drainToggle","▶ 模拟放电");}
function resetDrain(){stopDrain();elapsed=0;renderTank();}
function tick(t){if(!running)return;if(last)elapsed+=Math.min((t-last)/1000,.1)*3600;last=t;renderTank();if(fraction()<=0){stopDrain();show("drainToggle","▶ 重播");return;}raf=requestAnimationFrame(tick);}
document.querySelectorAll("[data-appliance]").forEach(b=>b.addEventListener("click",()=>{appliance=b.dataset.appliance;pressed("[data-appliance]","appliance",appliance);resetDrain();}));
bind(["capacityInput","powerInput"],()=>{show("capacityOut",fmt(num("capacityInput"),0)+"kWh");show("powerOut",fmt(num("powerInput"),1)+"kW");resetDrain();});
$("drainToggle").addEventListener("click",()=>{if(data().p>data().max){show("overload","请先选择设备能够支持的负载。");return;}if(running){stopDrain();show("drainToggle","▶ 继续");return;}if(fraction()<=0)elapsed=0;running=true;last=0;show("drainToggle","Ⅱ 暂停");raf=requestAnimationFrame(tick);});
$("drainReset").addEventListener("click",resetDrain);
// C rates: 10Ah nominal charge capacity, ignoring rate-induced usable capacity changes
function setRate(r){pressed("[data-rate]","rate",r);show("rC",r+"C");show("rI",(r*10)+"A");show("rT",fmt(60/r,2)+"分钟");
 show("rateInsight",r===1?"1C表示10Ah容量对应10A电流，理论恒流放电时间为1小时。":r===30?"30C对应300A电流，理想恒流时间2分钟。真实高倍率能放出多少Wh需要另外测试。":r+"C对应"+(r*10)+"A电流，理想时间60÷"+r+"="+fmt(60/r,1)+"分钟。");
 document.querySelectorAll("[data-rail]").forEach(e=>e.classList.toggle("hot",Number(e.dataset.rail)===r));}
document.querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>setRate(Number(b.dataset.rate))));
// Storage taxonomy
const tech={
battery:["电化学 / CHEMICAL","电池储能","充电时发生电化学过程储存能量，放电时再次输出电能。锂离子、钠离子、铅酸、液流等电池特性和成本不同。","化学能","家庭、工商业与多类电网储能场景","寿命、热管理、安全、成本与供应链","▤"],
pumped:["机械 / GRAVITY","抽水蓄能","电力富余时把水从低处抽到高处，需用电时让水流经过水轮机驱动发电机。","高处水的重力势能","具备合适地形、水资源的大规模电力系统","地形、水库、建设周期、生态条件","≋"],
air:["机械 / PRESSURE","压缩空气储能","用电驱动压缩机储存压缩空气，需要时让空气膨胀做功。不同技术路线还可储存压缩热。","压缩空气的压力势能","有适宜储气条件的中大型储能","储气条件、热过程、系统集成与效率","◎"],
flywheel:["机械 / KINETIC","飞轮储能","电机把转子加速至高速旋转，能量存为动能。需要时电机作为发电机工作。","转子旋转动能","快速响应、频繁短时功率变化","自放电、机械安全、可维持时间","◉"],
thermal:["热 / THERMAL","储热与储冷","用熔盐、热水、冰等介质保存热量或冷量，按需供热供冷；若重新发电还需更多转换环节。","热能、相变潜热","工业供热、建筑冷暖和部分电力系统","热损失、温度和再转换效率","≈"],
hydrogen:["化学 / FUEL","氢储能","电解水把电转成氢气，保存后在燃料电池或其他用途中使用；电到氢再到电有损耗。","氢气的化学能","较长期能源搬移和跨行业用途","储运设施、效率、安全和经济性","H₂"]
};
function chooseTech(key){const t=tech[key];pressed("[data-tech]","tech",key);["techTag","techName","techDescription","techStore","techUse","techLimit","techIcon"].forEach((id,i)=>show(id,t[i]));}
document.querySelectorAll("[data-tech]").forEach(b=>b.addEventListener("click",()=>chooseTech(b.dataset.tech)));
// Component explorer
const components={
cell:["电芯与电池包","电芯是储能基本单元，按照要求组成模组、PACK和电池簇。完整系统还需配套电控、散热、保护及电能变换设备。"],
bms:["BMS · 电池管理系统","采集电芯电压、电流、温度并估算SOC/SOH，负责均衡、限流及安全保护，不直接决定电价套利策略。"],
pcs:["PCS · 双向变流器","充电时可把交流电转换为电池所需的直流电，放电时把直流变成交流并控制并网功率。转换效率要计入。"],
ems:["EMS · 能量管理系统","结合负荷、天气、电价、电网指令和电池状态，安排充放电时机与功率。需服从电池和设备的安全边界。"],
cooling:["热管理","通过风冷或液冷等方式调节电芯温度与温差。过热、过冷和温差过大会影响性能、寿命或安全。"],
safety:["保护、消防与运维","需要电气保护、温度与气体监测、隔离、消防、运行维护与应急预案。单项测试或认证不等于零风险。"]
};
document.querySelectorAll("[data-comp]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.comp;pressed("[data-comp]","comp",id);show("compName",components[id][0]);show("compBody",components[id][1]);}));
// Frequency: P_req = (50-f)K, limited to +/- rated power
function updateFrequency(){
const f=num("freqInput"),K=num("gainInput"),limit=num("limitInput"),p=Math.max(-limit,Math.min(limit,(50-f)*K)),requested=(50-f)*K;
show("freqOut",f.toFixed(2)+"Hz");show("freqBig",f.toFixed(2));show("gainOut",fmt(K,0)+"kW/Hz");show("limitOut",fmt(limit,0)+"kW");show("freqPower",fmt(Math.abs(p),2)+"kW");
$("freqNeedle").style.transform="rotate("+(-90+(f-50)*210)+"deg)";
const inactive=Math.abs(p)<.00001,mode=inactive?"待机":p>0?"放电":"充电",desc=inactive?"频率正好50Hz，本模型不输出指令。":p>0?"频率偏低，储能向电网放电。":"频率偏高，储能从电网吸收电能。";
show("freqMode",mode);show("freqAction",desc);
show("freqInsight",desc+" 按比例计算的功率指令为"+fmt(Math.abs(requested),2)+"kW"+(Math.abs(requested)>limit?"，受功率上限约束为"+fmt(limit,0)+"kW。":"。"));
}
bind(["freqInput","gainInput","limitInput"],updateFrequency);
// Sizing: all internal values in kW, output kWh. Home input uses 0.1kW units, industry 1kW, grid 100kW.
const plans={home:{scale:.1,raw:20,h:4,usable:80,eff:92,tip:"校核电机启动浪涌、备电回路、离网切换和温度。"},factory:{scale:1,raw:100,h:2,usable:80,eff:90,tip:"核对负荷曲线、最大需量计费、当地电价以及并网规范。"},grid:{scale:100,raw:100,h:2,usable:85,eff:88,tip:"核对交流侧能量口径、调度要求、消防以及电网接入标准。"}};
let plan="home";
const displayPower=kw=>kw>=1000?fmt(kw/1000,2)+"MW":fmt(kw,2)+"kW";
const displayEnergy=kwh=>kwh>=1000?fmt(kwh/1000,2)+"MWh":fmt(kwh,2)+"kWh";
function updateSizing(){
const p=plans[plan],power=num("designPower")*p.scale,h=num("designTime"),usable=num("designUsable")/100,eta=num("designEff")/100,delivered=power*h;
show("designPowerOut",displayPower(power));show("designTimeOut",fmt(h,1)+"小时");show("designUsableOut",fmt(usable*100,0)+"%");show("designEffOut",fmt(eta*100,0)+"%");
show("designContinuous",displayPower(power));show("designDelivered",displayEnergy(delivered));show("designEnergy",displayEnergy(delivered/(usable*eta)));
show("designAdvice",p.tip+" 该结果仅为理想最低标称电能值，未计额外工程裕度与老化裕度。");
}
document.querySelectorAll("[data-scenario]").forEach(b=>b.addEventListener("click",()=>{
plan=b.dataset.scenario;pressed("[data-scenario]","scenario",plan);const p=plans[plan];$("designPower").value=p.raw;$("designTime").value=p.h;$("designUsable").value=p.usable;$("designEff").value=p.eff;updateSizing();
}));
bind(["designPower","designTime","designUsable","designEff"],updateSizing);
const feedback=["这不足以认定产品成熟。研发指标必须有明确的测试对象、方法和工况。","正确。首先核验质量口径、测试条件及同一完整电芯的联合性能。","能量密度不能单独证明循环寿命和安全性。","30C放电表示额定Ah容量对应的30倍电流；充电30C需要独立验证，2分钟只是理想换算。"];
document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{const i=Number(b.dataset.answer);pressed("[data-answer]","answer",i);show("challengeFeedback",feedback[i]);}));
// Scroll progress without hijacking the reader's scroll.
let ticking=false;function scrollProgress(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{const span=document.documentElement.scrollHeight-window.innerHeight;$("progress").style.width=(span>0?Math.min(100,window.scrollY/span*100):0)+"%";ticking=false;});}
window.addEventListener("scroll",scrollProgress,{passive:true});window.addEventListener("resize",scrollProgress);
document.addEventListener("visibilitychange",()=>{if(document.hidden){stopDay();stopDrain();}});
updateDay();renderTank();setRate(1);chooseTech("battery");updateFrequency();updateSizing();scrollProgress();
})();