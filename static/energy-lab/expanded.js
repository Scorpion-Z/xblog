(function(){
"use strict";
const el=id=>document.getElementById(id);
const num=id=>Number(el(id)?.value||0);
const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("zh-CN",{maximumFractionDigits:d}):"—";
const txt=(id,s)=>{if(el(id))el(id).textContent=s;};
const bind=(ids,fn)=>ids.forEach(id=>el(id)?.addEventListener("input",fn));
function arbitrage(){
 const buy=num("arbBuy"),sell=num("arbSell"),input=num("arbIn"),eta=num("arbEta")/100;
 const out=input*eta,cost=input*buy,revenue=out*sell,gross=revenue-cost;
 txt("arbBuyOut",fmt(buy,2));txt("arbSellOut",fmt(sell,2));txt("arbInOut",fmt(input,0));txt("arbEtaOut",fmt(eta*100,0)+"%");
 txt("arbOut",fmt(out,2)+" kWh");txt("arbCost",fmt(cost,2)+" 元");txt("arbRevenue",fmt(revenue,2)+" 元");txt("arbGross",fmt(gross,2)+" 元");
 txt("arbWarning",(gross<0?"在这组假设下，单次充放电即出现毛亏损。":"仅表示本次充放电毛差额。")+" 未计建设投资、维护、衰减、更换、服务费、税费；不保证存在对应交易机制。");
}
bind(["arbBuy","arbSell","arbIn","arbEta"],arbitrage);
const devices=[{id:"deviceLamp",watts:60,hours:4},{id:"deviceFridge",watts:80,hours:8},{id:"deviceRouter",watts:15,hours:8}];
function sizing(){
 const hourMul=num("sizeHours"),dod=num("sizeDOD")/100,eff=num("sizeEff")/100;
 const enabled=devices.filter(d=>el(d.id)?.checked);
 const loadWh=enabled.reduce((s,d)=>s+d.watts*d.hours*hourMul,0);
 const peak=enabled.reduce((s,d)=>s+d.watts,0);
 const energy= dod*eff>0 ? loadWh/(dod*eff):0;
 txt("sizeHoursOut",fmt(hourMul,1)+" 倍");txt("sizeDODOut",fmt(dod*100,0)+"%");txt("sizeEffOut",fmt(eff*100,0)+"%");
 txt("sizeLoadE",fmt(loadWh/1000,2)+" kWh");txt("sizeBatteryE",fmt(energy/1000,2)+" kWh");
 txt("sizePeakP",fmt(peak,0)+" W");txt("sizeInverterP",fmt(peak,0)+" W");
}
bind(["sizeHours","sizeDOD","sizeEff"],sizing);
devices.forEach(d=>el(d.id)?.addEventListener("change",sizing));
const glossary=[
["储能 ESS","Energy Storage System。把能量先存起来，在其他时间释放的设备或系统，不限于电池。"],
["BESS","Battery Energy Storage System，电池储能系统，包括电池、控制、变流、安全和辅助设备。"],
["电压 V","电势差。可以简单类比为推动电荷流动的压力。"],
["电流 A","电荷流过某处的快慢，单位安培。"],
["功率 W","单位时间传输或消耗能量的速度。1000W=1kW。"],
["电能 Wh","一段时间内传递的能量。1kWh=1000Wh，也就是1度电。"],
["容量 Ah","安时，电荷容量。只有结合电压，才能估算储存了多少Wh。"],
["C倍率","放电或充电电流相对额定Ah容量的倍数。10Ah电芯的2C是20A。"],
["能量密度 Wh/kg","单位质量储存的电能，比较之前确认分母是材料、电芯、模组还是系统。"],
["功率密度 W/kg","单位质量在规定工况下能提供的功率，测试持续时间很重要。"],
["kW / MW","功率单位。1MW=1000kW。"],
["kWh / MWh","电能单位。1MWh=1000kWh。"],
["储能时长 E/P","标称能量（kWh）除以功率（kW），得到小时；真实时长受损耗和放电限制影响。"],
["SOC","State of Charge，荷电状态。一般表示当前剩余可用电荷占参考容量的比例。"],
["SOH","State of Health，健康状态。可基于容量、内阻等指标定义，不同算法口径不同。"],
["DOD","Depth of Discharge，放电深度。用于描述一次放电动用了多大比例的参考容量。"],
["BMS","Battery Management System，监测电芯状态、估算SOC、均衡并执行保护。"],
["EMS","Energy Management System，依据负荷、电价等调度储能充放电。"],
["PCS","Power Conversion System，双向变流器，负责直流与交流转换和功率控制。"],
["逆变器 Inverter","将直流转换为交流的电力电子设备。储能PCS通常包含双向能量变换能力。"],
["DC / AC","直流 / 交流。电池端通常为直流，家庭插座及电网一般为交流。"],
["串联","电芯首尾相接，组合电压升高，总Ah容量在理想一致电芯的串联系统中不叠加。"],
["并联","同电压电芯并接，可提高总Ah容量和总电流能力，须符合连接及保护要求。"],
["内阻 mΩ","电芯对电流的等效阻碍。高电流下会产生压降和发热，且内阻随工况变化。"],
["热失控","异常放热反应持续加速的过程，可能引发喷气、火灾和蔓延等风险。"],
["循环寿命","在规定充放电与温度条件下，性能下降到指定阈值之前的循环次数。"],
["日历寿命","即使不频繁循环，电池性能也随时间、温度和存储条件变化。"],
["往返效率 RTE","同一测量边界下，放电可取出的电能除以充电输入电能。"],
["转换效率","某一转换环节输出有效电能与输入电能的比值。"],
["PCS效率","变流器工作时的转换效率，随功率、环境和模式变化。"],
["峰谷套利","在较低电价时充电，在较高电价时放电使用或出售，需要算损耗与全部成本。"],
["削峰填谷","调整负荷曲线，减小某些时段的高峰用电需求。"],
["调频","电力系统频率偏离额定值时，通过有功功率响应帮助平衡供需。"],
["抽水蓄能","用电抽水到高水位，放水时利用重力势能驱动水轮发电机。"],
["压缩空气储能","在压力介质中保存能量，之后释放并驱动发电过程。"],
["飞轮储能","利用高速旋转物体的动能储能，常适用于快速响应。"],
["液流电池","将活性物质储存在电解液储罐中，通过电堆发生电化学充放电反应。"],
["锂离子电容器 LIC","结合电池型电极与电容型电极特征的混合储能器件。"],
["超级电容 EDLC","通过电极界面双电层等机制储能，通常功率较高、能量密度相对较低。"],
["磷酸铁锂 LFP","锂离子电池的一种正极化学体系，不等于一种独立于锂离子之外的电池。"],
["钠离子电池","采用钠离子在电极间迁移的可充电电池体系。"],
["固态电池","以固态电解质为重要特征的技术路线，不必然意味着完全无风险。"],
["氢储能","把输入电能转化为氢等化学能，再在需要时使用，电-氢-电有转换损耗。"],
["光伏自发自用","光伏电力优先就地消纳，配储能后还可把部分电能移至其他时段。"],
["孤岛运行","局部电网在与主电网断开后独立维持供电，需要相应控制、保护和合规配置。"],
["防孤岛保护","在某些电网失电或孤岛条件下检测并切离并网设备，保障人员和电网安全。"],
["LCOS","Levelized Cost of Storage，按一定财务假设将生命周期成本与交付电能进行平准比较。"],
["LCOE","Levelized Cost of Energy，发电平准化成本，不能直接等同于储能LCOS。"],
["热管理","控制电芯与系统温度及温差的工程措施，包括风冷、液冷等。"],
["放电截止电压","电芯放电时允许到达的电压下限，受制造商规定和测试工况约束。"],
["测试口径","实验中的对象、质量范围、电压、倍率、温度、截止条件及测量边界。"]
];
function renderGlossary(){
 const search=el("glossarySearch");
 if(!search)return;
 const q=search.value.trim().toLocaleLowerCase("zh-CN");
 const filtered=glossary.filter(([name,desc])=>(name+" "+desc).toLocaleLowerCase("zh-CN").includes(q));
 const host=el("glossaryItems");host.replaceChildren();
 filtered.forEach(([name,desc])=>{
 const detail=document.createElement("details"),summary=document.createElement("summary"),p=document.createElement("p");
 summary.textContent=name;p.textContent=desc;detail.append(summary,p);host.appendChild(detail);
 });
 txt("glossaryCount","共 "+glossary.length+" 个术语，匹配 "+filtered.length+" 个。"+(filtered.length===0?" 请换一个关键词。":""));
}
el("glossarySearch")?.addEventListener("input",renderGlossary);
arbitrage();sizing();renderGlossary();
})();