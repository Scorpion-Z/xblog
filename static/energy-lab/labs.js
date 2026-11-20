/* 储能原理实验室 · 可交互教学模型。所有模型均为演示，非实测性能预测。 */
window.ENERGY_LABS=(()=>{
const $=(id,root=document)=>root.querySelector("#"+id);
const fmt=(n,d=2)=>Number.isFinite(n)?n.toLocaleString("zh-CN",{maximumFractionDigits:d}):"—";
const clip=(n,min,max)=>Math.max(min,Math.min(max,n));
const slider=(id,label,min,max,step,v,unit)=>'<div class="control"><label for="'+id+'">'+label+'<output id="'+id+'O">'+v+unit+'</output></label><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+v+'"><small><span>'+min+unit+'</span><span>'+max+unit+'</span></small></div>';
const number=(root,id)=>Number($(id,root).value);
const text=(root,id,v)=>{let x=$(id,root);if(x)x.textContent=v;};
const group=(rows)=>'<div class="lab-values">'+rows.map(([name,id])=>'<div class="value"><small>'+name+'</small><strong id="'+id+'">—</strong></div>').join("")+'</div>';
const lab=(mount,title,description,controls,values,note)=>{
 mount.innerHTML='<section class="lab"><div class="lab-head"><span>VIRTUAL LAB / 虚拟实验</span><h3>'+title+'</h3><p>'+description+'</p></div><div class="lab-body"><div class="lab-controls">'+controls+'</div><div class="lab-canvas"><div id="labGraphic"></div>'+group(values)+'<div class="lab-feedback" id="labFeedback">调整参数，观察结果。</div></div></div><div class="lab-warning">'+note+'</div></section>';
};
const watch=(mount,ids,fn)=>{ids.forEach(id=>$(id,mount).addEventListener("input",fn));fn()};
const sampleChart=(ref,cur,max=4.5,min=2.5)=>{const path=points=>points.map((v,i)=>(i===0?"M":"L")+(45+i*440/(points.length-1)).toFixed(1)+","+(220-(v-min)/(max-min)*182).toFixed(1)).join(" ");return '<svg class="lab-svg" viewBox="0 0 525 259" role="img" aria-label="参考倍率与当前倍率下的教学放电电压示意曲线"><path d="M45 30V220H497" stroke="#8fae98" stroke-width="2" fill="none"/>'+[0,1,2,3].map(i=>'<path d="M45 '+(45+i*51)+'H492" stroke="#dae7dd" fill="none"/>').join("")+'<path d="'+path(ref)+'" stroke="#78ac9b" stroke-width="4" fill="none"/><path d="'+path(cur)+'" stroke="#dfab70" stroke-width="4" fill="none"/><text x="52" y="18" font-size="13" fill="#638473">端电压 V</text><text x="310" y="249" font-size="13" fill="#638473">放电进度 →</text><text x="320" y="33" font-size="12" fill="#548b72">绿色：1C参考</text><text x="320" y="49" font-size="12" fill="#b58553">金色：当前倍率</text></svg>';};
const symbolDiagram=(title,value,note)=>'<svg class="lab-svg" viewBox="0 0 500 205" role="img" aria-label="'+title+'"><rect x="20" y="25" width="460" height="151" rx="18" fill="#dbeae0"/><rect x="30" y="35" width="440" height="130" rx="12" fill="#eff6ee"/><text x="250" y="80" font-size="21" font-weight="700" fill="#315e44" text-anchor="middle">'+title+'</text><text x="250" y="122" font-size="35" font-weight="800" fill="#1e774f" text-anchor="middle">'+value+'</text><text x="250" y="152" font-size="13" fill="#668572" text-anchor="middle">'+note+'</text></svg>';
const buttonOptions=(pairs,active)=>'<div class="lab-buttons">'+pairs.map(([id,name])=>'<button type="button" class="btn '+(id===active?'dark':'outline')+'" data-opt="'+id+'" aria-pressed="'+(id===active)+'">'+name+'</button>').join("")+'</div>';
function engineElectric(root){
 lab(root,"V、A、W、Wh的关系","观察一台恒功率直流负载。把U、I、运行时间分别调大，想想哪一个影响瞬时功率，哪一个影响总电能。",slider("v","电压",3,48,1,12,"V")+slider("i","电流",.5,10,.5,2,"A")+slider("h","工作时间",.5,12,.5,3,"h"),[["瞬时功率","valueP"],["消耗电能","valueE"],["折合度电","valueK"],["焦耳","valueJ"]],"直流恒定电压电流模型。真实交流设备可能有功率因数，真实电器功率也可能随时间变化。");
 watch(root,["v","i","h"],()=>{const U=number(root,"v"),I=number(root,"i"),t=number(root,"h"),P=U*I,E=P*t;
  [["vO",U+"V"],["iO",I+"A"],["hO",t+"h"],["valueP",fmt(P)+"W"],["valueE",fmt(E)+"Wh"],["valueK",fmt(E/1000,3)+"kWh"],["valueJ",fmt(E*3600,0)+"J"]].forEach(([k,v])=>text(root,k,v));
  $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 520 190" role="img" aria-label="电源、电路和电器的概念线路图"><rect x="25" y="55" width="130" height="90" rx="13" fill="#b9dec5"/><text x="90" y="95" text-anchor="middle" fill="#20563e" font-size="21" font-weight="700">'+U+' V</text><text x="90" y="119" text-anchor="middle" fill="#42745b" font-size="13">直流电源</text><path d="M155 100H350" fill="none" stroke="#3f9770" stroke-width="'+clip(I/2,2,10)+'"/><path d="M340 92L355 100L340 108" fill="none" stroke="#3f9770" stroke-width="3"/><rect x="355" y="55" width="130" height="90" rx="13" fill="#f8e3bb"/><text x="420" y="95" text-anchor="middle" fill="#8d5f33" font-size="22" font-weight="700">'+fmt(P)+' W</text><text x="420" y="119" text-anchor="middle" fill="#916e48" font-size="13">电器负载</text><text x="257" y="87" font-size="13" fill="#5b8468" text-anchor="middle">'+I+' A</text><text x="260" y="176" font-size="12" fill="#849589" text-anchor="middle">电能 = 功率 × 时间</text></svg>';
  text(root,"labFeedback","瞬时功率P="+U+"×"+I+"="+fmt(P)+"W。保持这种功率运行"+t+"小时，消耗"+fmt(E)+"Wh。只改变工作时长不会改变瞬时功率。");
 });
}
function engineCrate(root){
 lab(root,"C倍率、电压跌落和发热","改变倍率和电芯等效内阻。除了理想恒流时间，还要观察端电压能否维持在示例截止电压2.9V以上。",slider("q","额定安时容量",5,50,5,20,"Ah")+slider("rate","放电倍率",1,30,1,5,"C")+slider("r","固定等效内阻",.5,6,.5,2,"mΩ"),[["恒流电流","valueI"],["理论放完时间","valueT"],["示例初始端电压","valueV"],["电阻发热功率","valueHeat"]],"示意电路采用Uoc=3.05+1.1×SOC及恒定R，截止电压2.9V。不代表LFP或其他真实电芯曲线，不能用于电池选型、热设计与寿命预测。");
 watch(root,["q","rate","r"],()=>{const Q=number(root,"q"),C=number(root,"rate"),R=number(root,"r")/1000,I=Q*C,drop=I*R,heat=I*I*R,Vstart=4.15-drop;
 const n=55,ocv=Array.from({length:n},(_,i)=>3.05+1.1*(1-i/(n-1))),ref=ocv.map(v=>v-Q*R),cur=ocv.map(v=>v-drop);
 [["qO",Q+"Ah"],["rateO",C+"C"],["rO",fmt(R*1000,1)+"mΩ"],["valueI",fmt(I,0)+"A"],["valueT",fmt(60/C,2)+"分钟"],["valueV",fmt(Vstart,2)+"V"],["valueHeat",fmt(heat,1)+"W"]].forEach(([k,v])=>text(root,k,v));
 $("labGraphic",root).innerHTML=sampleChart(ref,cur);
 text(root,"labFeedback",Vstart<2.9?"这组假设下，初始端电压已低于2.9V示例截止线，不能按理想时间持续放电。":"电流为"+fmt(I,0)+"A，初始IR压降"+fmt(drop,2)+"V，电阻热功率"+fmt(heat,1)+"W。高倍率下曲线降低，可能更早截止。");
 });
}
function engineIons(root){
 let direction="discharge";
 lab(root,"看见锂离子和电子的两条路","选择充电或放电，观察Li+在电池内部迁移的方向，以及电子沿外部电路的净流向。以下使用石墨负极与典型锂金属氧化物正极的概念模型。",buttonOptions([["discharge","放电模式"],["charge","充电模式"]],"discharge")+slider("soc","负极中锂离子相对状态（示意）",10,90,10,70,"%"),[["内部Li+净迁移","valueLi"],["外电路电子净流向","valueElectron"],["电池工作状态","valueMode"],["负极示意锂量","valueSoc"]],"此图为极简概念模型，粒子数量不是实际锂离子个数，不描述电极界面反应细节。图中正极/负极按电池端子定义。");
 const update=()=>{const soc=number(root,"soc"),discharge=direction==="discharge";
  const from=discharge?"右→左":"左→右",electron=discharge?"右→左（经负载）":"左→右（经充电器）";
  text(root,"socO",soc+"%");text(root,"valueLi",from);text(root,"valueElectron",electron);text(root,"valueMode",discharge?"放电":"充电");text(root,"valueSoc",soc+"%");
  const negN=Math.round(soc/10),posN=10-negN;
  const circles=(x,n,color)=>Array.from({length:n},(_,i)=>'<circle cx="'+(x+(i%3)*25)+'" cy="'+(103+Math.floor(i/3)*24)+'" r="8" fill="'+color+'"/>').join("");
  $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 530 275" role="img" aria-label="锂离子电池离子与电子迁移路径示意"><rect x="18" y="76" width="165" height="144" rx="14" fill="#d8e7f0"/><rect x="347" y="76" width="165" height="144" rx="14" fill="#d9efe3"/><rect x="192" y="76" width="146" height="144" rx="9" fill="#f1f3e6"/>'+circles(55,posN,"#81b8d8")+circles(385,negN,"#6caf84")+'<path d="M265 81V216" stroke="#9ebbaa" stroke-width="5" stroke-dasharray="6 7"/><text x="100" y="57" text-anchor="middle" font-size="15" fill="#496a82">正极材料</text><text x="430" y="57" text-anchor="middle" font-size="15" fill="#386b4e">石墨负极</text><text x="265" y="237" text-anchor="middle" font-size="12" fill="#82958b">隔膜 / 电解液</text><path d="M'+(discharge?"389 149H141":"141 149H389")+'" stroke="#378c72" stroke-width="5" fill="none"/><path d="'+(discharge?"M153 140L139 149L153 158":"M377 140L391 149L377 158")+'" fill="none" stroke="#378c72" stroke-width="4"/><text x="265" y="135" text-anchor="middle" font-size="14" fill="#34775c">Li+</text><path d="M430 75V24H100V75" stroke="#c39b60" stroke-width="4" fill="none"/><text x="265" y="17" text-anchor="middle" font-size="12" fill="#a27b43">e− 经外部'+(discharge?"负载":"充电器")+'</text><text x="265" y="265" text-anchor="middle" font-size="12" fill="#8ca296">净迁移方向："+from+"；仅示意，不按真实比例</text></svg>';
  text(root,"labFeedback",discharge?"放电：负极脱嵌锂，Li+由负极向正极迁移；电子经外部负载由负极流向正极。":"充电：外部电源驱动反向过程，Li+从正极侧向石墨负极迁移；电子方向与放电相反。");
 };
 root.querySelectorAll("[data-opt]").forEach(b=>b.addEventListener("click",()=>{direction=b.dataset.opt;root.querySelectorAll("[data-opt]").forEach(x=>{x.className="btn "+(x===b?"dark":"outline");x.setAttribute("aria-pressed",x===b?"true":"false")});update()}));
 watch(root,["soc"],update);
}
function engineFamilies(root){
 const options={
lfp:["磷酸铁锂 LFP","锂离子电池正极路线，常用于固定储能。具体安全、寿命与成本依赖电芯设计和测试。","锂离子在电极间往返","系统需要热管理与保护"],
nmc:["三元锂 NMC","一些配方追求较高能量密度，需结合价格、热管理和具体电芯性能进行选择。","锂离子化学能","材料配比和寿命、安全边界需核实"],
flow:["液流电池","活性物质主要储存在电解液储罐，通过电堆进行电化学反应，许多系统可相对独立地配置功率与储量。","电解液化学能","泵、储罐、系统复杂性"],
edlc:["双电层超级电容","主要通过界面电荷储存能量，通常适合短时高功率和频繁循环，但储能量相对小。","界面电场","持续输出时长短"],
lic:["锂离子电容器 LIC","把电池型与电容型电极机制组合，在功率与能量之间求折中。比较时尤其注意测试质量口径。","混合机制","器件匹配、预嵌锂与制造一致性"],
pumped:["抽水蓄能","借电力把水提升到高处，再放水发电，属于机械储能，大型项目要求合适地理条件。","重力势能","地形、工程建设、生态约束"]
};
 let key="lfp";
 lab(root,"储能路线观察站","同一张技术宣传图无法告诉你所有信息。点选不同路线，看“存什么、适合什么、限制是什么”。",buttonOptions(Object.keys(options).map(k=>[k,k.toUpperCase()]),key),[["技术类型","familyName"],["储能机制","familyMechanism"],["关注点","familyLimit"],["定量排名","familyRank"]],"这些是经过概括的性能取向，不是产品规格、绝对排名或商业化成熟度结论。不同技术的数值必须在可比工况下查证。");
 const update=()=>{const a=options[key];text(root,"familyName",a[0]);text(root,"familyMechanism",a[2]);text(root,"familyLimit",a[3]);text(root,"familyRank","不做无依据排名");
 $("labGraphic",root).innerHTML=symbolDiagram(a[0],key.toUpperCase(),"选型须结合功率、时间、成本、寿命和场地");
 text(root,"labFeedback",a[1]);};
 root.querySelectorAll("[data-opt]").forEach(b=>b.addEventListener("click",()=>{key=b.dataset.opt;root.querySelectorAll("[data-opt]").forEach(x=>{x.className="btn "+(x===b?"dark":"outline");x.setAttribute("aria-pressed",x===b?"true":"false")});update()}));update();
}
function engineHeat(root){
 lab(root,"内阻、压降与I²R发热","电流增加后，端电压会下降，电阻发热按电流平方增长。此处不直接预测温度。",slider("current","放电电流",10,300,10,100,"A")+slider("resistance","固定等效电阻",1,15,1,3,"mΩ")+slider("ocv","开路电压",3,4.2,.1,3.7,"V"),[["端电压（简化）","valueV"],["电压跌落","valueDrop"],["发热功率","valueHeat"],["与100A同R热功率比","valueRatio"]],"欧姆电阻近似，不含电化学极化、散热、热容量或保护逻辑，不能当作温升或安全阈值计算。");
 watch(root,["current","resistance","ocv"],()=>{const I=number(root,"current"),R=number(root,"resistance")/1000,V=number(root,"ocv"),d=I*R,H=I*I*R,term=V-d;
 [["currentO",I+"A"],["resistanceO",fmt(R*1000,0)+"mΩ"],["ocvO",fmt(V,1)+"V"],["valueV",fmt(Math.max(0,term),2)+"V"],["valueDrop",fmt(d,2)+"V"],["valueHeat",fmt(H,1)+"W"],["valueRatio",fmt((I/100)**2,2)+"倍"]].forEach(([k,v])=>text(root,k,v));
 $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 500 225" role="img" aria-label="固定电阻下热功率随电流平方增加的曲线"><path d="M55 25V195H473" fill="none" stroke="#789883" stroke-width="2"/><path d="'+Array.from({length:31},(_,n)=>(n?"L":"M")+(55+n*13.5)+","+(195-160*(n/30)**2)).join(" ")+'" fill="none" stroke="#e2a96a" stroke-width="5"/><circle cx="'+(55+I/300*405)+'" cy="'+(195-160*(I/300)**2)+'" r="8" fill="#28784f" stroke="white" stroke-width="3"/><text x="250" y="215" font-size="12" text-anchor="middle" fill="#708777">电流增加 →</text><text x="66" y="18" font-size="12" fill="#708777">I²R发热</text></svg>';
 text(root,"labFeedback",term<=0?"这组等效模型会给出不合理的非正端电压；真实电池应受工作边界与保护限制。":"IR压降"+fmt(d,2)+"V，发热功率"+fmt(H,1)+"W。与100A相比，电流倍率的平方决定电阻热功率比例。");
 });
}
function enginePack(root){
 lab(root,"串并联计算台","用一块3.2V、100Ah电芯组成电池组。改变串联S和并联P数量，观察电压、安时容量和名义能量。",slider("ns","串联数量 S",1,32,1,16,"S")+slider("np","并联支路 P",1,8,1,2,"P")+slider("cellQ","单体容量",20,200,20,100,"Ah"),[["电池组名义电压","packV"],["电池组安时容量","packQ"],["电池组名义电能","packE"],["电芯总数量","packCount"]],"假定所有电芯一致、连接合规，使用标称电压近似计算。不包含SOC窗口、容量不一致、均衡、故障保护和封装重量。");
 watch(root,["ns","np","cellQ"],()=>{const ns=number(root,"ns"),np=number(root,"np"),q=number(root,"cellQ"),v=ns*3.2,ah=np*q,kwh=v*ah/1000;
 [["nsO",ns+"S"],["npO",np+"P"],["cellQO",q+"Ah"],["packV",fmt(v,1)+"V"],["packQ",fmt(ah,0)+"Ah"],["packE",fmt(kwh,2)+"kWh"],["packCount",ns*np+"块"]].forEach(([k,v])=>text(root,k,v));
 const nshow=Math.min(ns,10);
 $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 510 200" role="img" aria-label="串并联结构示意"><text x="253" y="22" font-size="15" fill="#417354" text-anchor="middle">'+ns+'串 × '+np+'并（示意，每排只画最多10个）</text>'+Array.from({length:Math.min(np,3)},(_,row)=>Array.from({length:nshow},(_,j)=>'<rect x="'+(18+j*47)+'" y="'+(43+row*44)+'" width="39" height="31" rx="5" fill="#b8d8c1" stroke="#5f9f7a"/><path d="M'+(23+j*47)+' '+(58+row*44)+'h29" stroke="#3f7753" stroke-width="2"/>').join("")).join("")+'<text x="255" y="191" text-anchor="middle" font-size="12" fill="#819788">实际电池组需BMS、连接和电气保护</text></svg>';
 text(root,"labFeedback",ns+"串得到"+fmt(v,1)+"V；"+np+"并使容量变为"+fmt(ah,0)+"Ah。串联不叠加Ah，并联不叠加电压。");
 });
}
function engineSystem(root){
 const d={cell:["电池模组","储存直流电能，串并联形成电池簇，必须受电压和温度等限制。"],bms:["BMS","监控单体状态，估算SOC/SOH并执行保护和均衡。"],pcs:["PCS双向变流器","负责直流与交流之间的双向转换和功率控制。"],ems:["EMS","参考用电、电价、电网指令制定充放电策略。"],safety:["保护和热管理","包括冷却、消防、电气保护、计量与运维。"]};let key="pcs";
 lab(root,"从电芯到电网","点击设备，观察储能系统分工。下面再计算一个简化的交流侧能量交付示例。",buttonOptions([["cell","电池"],["bms","BMS"],["pcs","PCS"],["ems","EMS"],["safety","安全"]],key)+slider("dcE","电池侧输出电能",20,200,10,100,"kWh")+slider("eta","变流效率",80,100,2,94,"%"),[["电池侧电能","dcVal"],["交流侧交付（近似）","acVal"],["转换损耗","lossVal"],["选中设备","componentVal"]],"只包含固定PCS效率，不含辅助设备耗电、SOC窗口、热量、线损、站内负荷和时间变化。");
 const update=()=>{const e=number(root,"dcE"),eta=number(root,"eta")/100;
 [["dcEO",e+"kWh"],["etaO",fmt(eta*100,0)+"%"],["dcVal",e+"kWh"],["acVal",fmt(e*eta,1)+"kWh"],["lossVal",fmt(e*(1-eta),1)+"kWh"],["componentVal",key.toUpperCase()]].forEach(([k,v])=>text(root,k,v));
 $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 525 185" role="img" aria-label="电池到PCS再到电网的能量流向"><rect x="13" y="51" width="147" height="87" rx="12" fill="#c4e6ce"/><rect x="187" y="51" width="147" height="87" rx="12" fill="#d4ebdf"/><rect x="361" y="51" width="147" height="87" rx="12" fill="#e2eaf2"/><text x="86" y="87" text-anchor="middle" font-size="18">电池</text><text x="86" y="112" text-anchor="middle" font-size="13">'+e+'kWh</text><text x="261" y="87" text-anchor="middle" font-size="18">PCS</text><text x="261" y="112" text-anchor="middle" font-size="13">'+fmt(eta*100,0)+'%</text><text x="434" y="87" text-anchor="middle" font-size="18">交流侧</text><text x="434" y="112" text-anchor="middle" font-size="13">'+fmt(e*eta,1)+'kWh</text><path d="M161 95H185M337 95H360" stroke="#5f9773" stroke-width="4"/><text x="262" y="168" text-anchor="middle" fill="#759080" font-size="13">BMS保护 · EMS调度 · 热管理与消防</text></svg>';
 text(root,"labFeedback",d[key][0]+"："+d[key][1]+" 在所示边界内，直流输出"+e+"kWh，固定效率"+fmt(eta*100,0)+"%时交流侧近似交付"+fmt(e*eta,1)+"kWh。");
 };
 root.querySelectorAll("[data-opt]").forEach(b=>b.addEventListener("click",()=>{key=b.dataset.opt;root.querySelectorAll("[data-opt]").forEach(x=>{x.className="btn "+(x===b?"dark":"outline");x.setAttribute("aria-pressed",x===b?"true":"false")});update()}));
 watch(root,["dcE","eta"],update);
}
function engineDispatch(root){
 const pv=[0,0,0,0,0,0,.1,.4,1.1,2.4,3.4,4.4,4.8,4.6,4.1,3,1.8,.7,.1,0,0,0,0,0];
 const load=[.6,.5,.45,.45,.5,.7,1.1,1.3,1.05,.9,.8,.9,1.2,1.1,.95,1,1.4,1.9,2.3,2.2,1.8,1.4,1,.8];
 lab(root,"一天24小时的光储调度","把光伏输出、电池容量和电池功率调大或调小。系统逐小时充放电，同时计入效率与SOC约束。",slider("pvScale","光伏出力倍率",0,2,.25,1,"倍")+slider("storage","电池名义储量",2,20,2,8,"kWh")+slider("maxP","电池充放电功率上限",.5,6,.5,3,"kW"),[["24小时电网购电","gridImport"],["24小时上网电量","gridExport"],["结束时SOC","finalSoc"],["减少购电的电能","savingK"]],"示例数据为人工设定的24小时功率曲线，每小时内功率恒定。单向效率95%，初始SOC取容量25%，结果不是任何实际家庭的运行数据。初始电池电量可能影响当天购电比较，不能直接视为完整周期节省量。");
 watch(root,["pvScale","storage","maxP"],()=>{
 const scale=number(root,"pvScale"),cap=number(root,"storage"),pmax=number(root,"maxP");let soc=cap*.25,grid=0,exported=0,base=0;const levels=[],grids=[];
 for(let i=0;i<24;i++){const sunlight=pv[i]*scale,net=sunlight-load[i];base+=Math.max(0,-net);let charged=0,discharged=0;
 if(net>=0){charged=Math.min(net,pmax,(cap-soc)/.95);soc+=charged*.95;exported+=net-charged;}
 else{discharged=Math.min(-net,pmax,soc*.95);soc-=discharged/.95;grid+=-net-discharged;}
 soc=clip(soc,0,cap);levels.push(soc/cap);grids.push(Math.max(0,-net-discharged));}
 [["pvScaleO",fmt(scale,2)+"倍"],["storageO",cap+"kWh"],["maxPO",fmt(pmax,1)+"kW"],["gridImport",fmt(grid,2)+"kWh"],["gridExport",fmt(exported,2)+"kWh"],["finalSoc",fmt(soc/cap*100,0)+"%"],["savingK",fmt(base-grid,2)+"kWh"]].forEach(([k,v])=>text(root,k,v));
 const poly=(arr,mx,color)=>'<polyline points="'+arr.map((v,i)=>(45+i*18.6).toFixed(1)+","+(182-Math.max(0,v)/mx*140).toFixed(1)).join(" ")+'" fill="none" stroke="'+color+'" stroke-width="3.7" stroke-linejoin="round"/>';
 $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 510 223" role="img" aria-label="一天光伏、用电和电池SOC的人工示意曲线"><path d="M45 28V184H487" stroke="#92a797" stroke-width="2" fill="none"/>'+[0,1,2].map(k=>'<path d="M45 '+(42+k*65)+'H487" stroke="#d9e7dc"/>').join("")+poly(pv.map(v=>v*scale),10,"#7bbf95")+poly(load,10,"#dea96b")+poly(levels,2,"#699fcb")+'<text x="250" y="210" text-anchor="middle" fill="#7e9483" font-size="12">绿：光伏　金：负荷　蓝：SOC相对值（另标度）</text></svg>';
 text(root,"labFeedback","初始SOC为25%。运行后SOC为"+fmt(soc/cap*100,0)+"%，与初始不一定相同。购电变化包含初始电量贡献，不能直接称为全年收益。");
 });
}
function engineFrequency(root){
 lab(root,"频率偏差和调频指令","拨动频率，看储能充放电方向、控制功率和持续时间所需电能。负号表示从电网吸收电能。",slider("freq","当前频率",49.8,50.2,.01,49.95,"Hz")+slider("gain","比例系数",20,200,10,100,"kW/Hz")+slider("limit","储能功率限幅",1,30,1,10,"kW")+slider("duration","指令持续时长",30,600,30,120,"s"),[["指令方向","frequencyDir"],["实际功率","frequencyPower"],["该时段电能","frequencyEnergy"],["受限状态","frequencyLimit"]],"以50Hz电网为假设。实际调频包含死区、SOC约束、一次调频/AGC控制、频率动态及并网规则，本模型只用于解释比例指令。");
 watch(root,["freq","gain","limit","duration"],()=>{const f=number(root,"freq"),k=number(root,"gain"),limit=number(root,"limit"),seconds=number(root,"duration"),request=k*(50-f),p=clip(request,-limit,limit);
 const dir=Math.abs(p)<1e-6?"待机":p>0?"放电":"充电";
 [["freqO",f.toFixed(2)+"Hz"],["gainO",k+"kW/Hz"],["limitO",limit+"kW"],["durationO",seconds+"s"],["frequencyDir",dir],["frequencyPower",fmt(Math.abs(p),2)+"kW"],["frequencyEnergy",fmt(Math.abs(p)*seconds/3600,3)+"kWh"],["frequencyLimit",Math.abs(request)>limit?"达到限幅":"未限幅"]].forEach(([id,v])=>text(root,id,v));
 $("labGraphic",root).innerHTML=symbolDiagram("电网频率 "+f.toFixed(2)+"Hz",fmt(Math.abs(p),2)+"kW",dir+" / 持续"+seconds+"秒");
 text(root,"labFeedback","比例指令P="+k+"×(50−"+f.toFixed(2)+")="+fmt(request,2)+"kW，输出受±"+limit+"kW限制。当前工作需"+fmt(Math.abs(p)*seconds/3600,3)+"kWh。");
 });
}
function engineEconomics(root){
 lab(root,"一次充放电的经济账","模拟单次充放电，观察电价差与效率怎样影响毛差额，再估算一年循环的理想毛差额。",slider("input","低谷充入电能",1,30,1,10,"kWh")+slider("buy","低谷购电价",.1,1.5,.05,.3,"元/kWh")+slider("sell","高峰可避免的购电价",.2,2,.05,1,"元/kWh")+slider("rte","往返效率",50,100,5,90,"%")+slider("cycles","一年可循环次数",0,365,5,250,"次"),[["可交付电能","delivered"],["一次购电成本","buyCost"],["单次毛差额","gross"],["全年理论毛差额","yearly"]],"“高峰价值”假设为避免高价购电，并非一定能够按此价格卖给电网。未计建设投资、运营、折旧、退化、更换、峰谷时段约束、交易规则及税费。");
 watch(root,["input","buy","sell","rte","cycles"],()=>{const input=number(root,"input"),buy=number(root,"buy"),sell=number(root,"sell"),rte=number(root,"rte")/100,cycles=number(root,"cycles"),output=input*rte,cost=input*buy,gross=output*sell-cost;
 [["inputO",input+"kWh"],["buyO",fmt(buy,2)+"元/kWh"],["sellO",fmt(sell,2)+"元/kWh"],["rteO",fmt(rte*100,0)+"%"],["cyclesO",cycles+"次"],["delivered",fmt(output,2)+"kWh"],["buyCost",fmt(cost,2)+"元"],["gross",fmt(gross,2)+"元"],["yearly",fmt(gross*cycles,0)+"元"]].forEach(([id,v])=>text(root,id,v));
 $("labGraphic",root).innerHTML='<svg class="lab-svg" viewBox="0 0 505 170" role="img" aria-label="充电支出与放电价值对比"><rect x="48" y="43" width="'+clip(cost/Math.max(cost,output*sell,1)*390,1,390)+'" height="33" fill="#dfa774" rx="5"/><rect x="48" y="106" width="'+clip(output*sell/Math.max(cost,output*sell,1)*390,1,390)+'" height="33" fill="#78bf94" rx="5"/><text x="50" y="29" font-size="13" fill="#836349">购电成本 '+fmt(cost,2)+'元</text><text x="50" y="98" font-size="13" fill="#4b8460">高峰价值 '+fmt(output*sell,2)+'元</text></svg>';
 text(root,"labFeedback",(gross<0?"即使暂不考虑投资和运维，单次已经出现毛亏损。":"这只是毛差额，不能直接视为利润。")+" 计入投资、设备寿命、维护等支出后才可以讨论实际经济性。");
 });
}
function engineSizing(root){
 lab(root,"完整容量与功率测算","输入需要服务的负载功率、持续时间、可用SOC比例及放电效率，计算理论最低名义电能。",slider("loadPower","负载连续功率",.5,50,.5,2,"kW")+slider("hours","所需连续时间",.5,10,.5,4,"h")+slider("usable","允许使用比例",50,100,5,80,"%")+slider("disEff","放电侧效率",70,100,2,92,"%"),[["交付给负载的电能","reqLoad"],["最低名义电池电能","reqBattery"],["PCS最小连续功率","reqPCS"],["名义持续时间","reqHours"]],"未计电机启动冲击、老化、极端温度、辅助功率、并网规范与工程裕度。计算结果不构成采购选型建议。");
 watch(root,["loadPower","hours","usable","disEff"],()=>{const p=number(root,"loadPower"),h=number(root,"hours"),u=number(root,"usable")/100,eta=number(root,"disEff")/100,delivered=p*h,nominal=delivered/u/eta;
 [["loadPowerO",fmt(p,1)+"kW"],["hoursO",fmt(h,1)+"h"],["usableO",fmt(u*100,0)+"%"],["disEffO",fmt(eta*100,0)+"%"],["reqLoad",fmt(delivered,2)+"kWh"],["reqBattery",fmt(nominal,2)+"kWh"],["reqPCS",fmt(p,1)+"kW"],["reqHours",fmt(nominal/p,2)+"h"]].forEach(([k,v])=>text(root,k,v));
 $("labGraphic",root).innerHTML=symbolDiagram("最低名义电池能量",fmt(nominal,2)+" kWh","外部需交付"+fmt(delivered,2)+"kWh");
 text(root,"labFeedback","负载功率"+fmt(p,1)+"kW，持续"+fmt(h,1)+"小时，需交付"+fmt(delivered,2)+"kWh。按可用比例和效率倒推，最低名义电池电量"+fmt(nominal,2)+"kWh。实际还要加裕度并做工程校核。");
 });
}
const engines={electric:engineElectric,crate:engineCrate,ions:engineIons,families:engineFamilies,heat:engineHeat,pack:enginePack,system:engineSystem,dispatch:engineDispatch,frequency:engineFrequency,economics:engineEconomics,sizing:engineSizing};
return{render:(name,mount)=>{if(!mount||!engines[name])return;engines[name](mount);},ids:Object.keys(engines)};
})();