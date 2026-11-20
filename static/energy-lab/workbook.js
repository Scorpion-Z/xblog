(()=>{
"use strict";
const problems=[
{id:"p1",title:"一台电器用了多少度电？",given:"额定功率1.2kW的电器，在功率不变时连续工作3.5小时，电价假设0.6元/kWh。",context:"从电费单入手，先分清kW和kWh，再计算费用。",fields:[["消耗电能","kWh",4.2,.01],["电费","元",2.52,.01]],solution:["E=P×t=1.2kW×3.5h=4.2kWh。","电费=4.2kWh×0.6元/kWh=2.52元。","功率表示使用速率，kWh才是需要累计的电能。"],hint:"电能=功率×时间。把kW与小时相乘，结果是什么单位？",link:"复习模块1：电压、电流、功率与电能。"},
{id:"p2",title:"Ah和Wh怎样换算？",given:"某电芯标称电压3.2V，额定容量100Ah，实测电芯质量2.5kg。用标称电压近似估算。",context:"容量与能量密度有两个分母：Ah涉及电荷容量，Wh/kg还要考虑电压与质量。",fields:[["标称电能","Wh",320,.01],["质量能量密度","Wh/kg",128,.1]],solution:["E≈U×Q=3.2×100=320Wh。","D=E/m=320/2.5=128Wh/kg。","这里质量分母是完整电芯2.5kg；如果只计活性材料，结果就不能直接比较。"],hint:"先算U×Q，再除以电芯质量。",link:"复习模块2：Ah、Wh与能量密度。"},
{id:"p3",title:"30C为什么是2分钟？",given:"电芯额定容量10Ah，按30C恒流放电。假设能完整放出额定Ah容量。",context:"理解倍率的定义比死记60/C更重要。",fields:[["恒流电流","A",300,.1],["理想放电时间","分钟",2,.01]],solution:["I=C×Q=30×10=300A。","t=Q/I=10Ah÷300A=1/30小时。","换成分钟：(1/30)×60=2分钟。高倍率真实可用能量需另行测试。"],hint:"30C表示额定容量对应的30倍电流。时间先用小时，再乘60。",link:"复习模块2：C倍率；模块4：放电曲线。"},
{id:"p4",title:"16串2并的电池组有多少电？",given:"每块电芯标称3.2V、100Ah，组成16串、2并的电池组。按电芯完全一致的理想条件计算。",context:"这道题检查串联与并联的三个不同指标。",fields:[["组合电压","V",51.2,.01],["组合容量","Ah",200,.01],["组合能量","kWh",10.24,.01]],solution:["串联16节，U=16×3.2=51.2V。","并联2组，Q=2×100=200Ah。","E≈51.2×200=10240Wh=10.24kWh。"],hint:"串联叠加电压，并联叠加Ah。能量最后用V×Ah计算。",link:"复习模块5：串并联与电池组。"},
{id:"p5",title:"电流加倍，发热增加多少？",given:"固定等效内阻3mΩ，先以100A放电，再以200A放电。使用I²R模型计算电阻发热功率。",context:"这道题让你直观看到倍率增加的工程代价。",fields:[["100A时热功率","W",30,.01],["200A时热功率","W",120,.01],["发热倍率","倍",4,.01]],solution:["3mΩ=0.003Ω。P1=100²×0.003=30W。","P2=200²×0.003=120W。","热功率增加至120/30=4倍。注意这不是温度直接增加4倍。"],hint:"把毫欧换成欧姆，I²R中的电流需要平方。",link:"复习模块4：内阻、热功率与安全。"},
{id:"p6",title:"一次调频需要多少电能？",given:"额定50Hz系统，实际频率49.96Hz，比例系数100kW/Hz。假设不发生功率限幅，指令持续180秒。",context:"把频率偏差变成调节功率，再把功率变成电能。",fields:[["放电功率","kW",4,.01],["所需电能","kWh",.2,.001]],solution:["频率偏差50−49.96=0.04Hz。P=100×0.04=4kW。","180秒=180/3600=0.05小时。","ΔE=4kW×0.05h=0.2kWh。实际调频还要看SOC和PCS。"],hint:"先算Hz差值，再乘kW/Hz，秒除以3600变成小时。",link:"复习模块6：储能参与频率调节。"},
{id:"p7",title:"峰谷套利毛差额是多少？",given:"低谷充入10kWh，低谷电价0.3元/kWh，往返效率90%。假定高峰能避免以0.9元/kWh购电。",context:"题目算的是单次毛差额，绝非真实项目利润。",fields:[["高峰可交付电能","kWh",9,.01],["单次毛差额","元",5.1,.01]],solution:["可输出电能=10×90%=9kWh。","高峰价值=9×0.9=8.1元。低谷购电成本=10×0.3=3元。","毛差额=8.1−3=5.1元。还未扣除投资、运维和电芯退化。"],hint:"要先用往返效率算输出电量，再计算高峰价值。",link:"复习模块7：往返效率与经济性。"},
{id:"p8",title:"从负荷倒推电池容量",given:"需要在停电时给5kW重要负载供电3小时，允许使用80%名义能量，电池到负载的放电效率为90%。",context:"先算外部交付电能，再按SOC窗口与损耗倒推。",fields:[["需要交付的电能","kWh",15,.01],["最低电池标称能量","kWh",20.833,.03],["PCS最低连续输出功率","kW",5,.01]],solution:["交付电能=5kW×3h=15kWh。","名义容量≥15/(0.8×0.9)=20.833kWh。","PCS至少持续输出5kW。实际还需校核瞬时功率、衰减、低温、备电切换和工程裕度。"],hint:"名义电量=交付电量÷可用比例÷放电效率。",link:"复习模块8：容量设计与技术论证。"}
];
const $=id=>document.getElementById(id),fmt=n=>Number(n).toLocaleString("zh-CN",{maximumFractionDigits:3});
let state={completed:[]},idx=0;try{const s=JSON.parse(localStorage.getItem("energy-lab-workbook-v1")||"{}");if(Array.isArray(s.completed))state.completed=s.completed.filter(id=>problems.some(p=>p.id===id));}catch(e){}
function save(){try{localStorage.setItem("energy-lab-workbook-v1",JSON.stringify(state))}catch(e){}}
function nav(){
 const node=$("practiceNav");node.replaceChildren();
 problems.forEach((p,i)=>{const b=document.createElement("button");b.type="button";b.textContent=String(i+1).padStart(2,"0")+" · "+p.title;b.className=(idx===i?"selected ":"")+(state.completed.includes(p.id)?"completed":"");b.addEventListener("click",()=>render(i));node.appendChild(b)});
 $("practiceProgress").textContent=state.completed.length+"/"+problems.length+"题完成";
}
function render(i){
 idx=i;const p=problems[i];
 $("practiceType").textContent="练习 "+String(i+1).padStart(2,"0")+" / "+problems.length;
 $("practiceTitle").textContent=p.title;$("practiceContext").textContent=p.context;$("practiceGiven").textContent="已知条件："+p.given;
 $("practiceConnection").textContent=p.link;
 $("practiceFeedback").textContent="答案可以保留小数。输入计算结果后点击“检查”。";
 $("practiceFeedback").classList.remove("bad");
 const mount=$("exerciseFields");mount.replaceChildren();
 p.fields.forEach(([label,unit],j)=>{const box=document.createElement("div");const l=document.createElement("label");l.htmlFor="result"+j;l.textContent=label+"（"+unit+"）";const input=document.createElement("input");input.id="result"+j;input.type="number";input.step="any";input.required=true;input.placeholder="请填写数值";const hint=document.createElement("small");hint.textContent="只输入数字，单位已标注";box.append(l,input,hint);mount.appendChild(box)});
 const steps=$("solutionSteps");steps.replaceChildren();p.solution.forEach(t=>{const x=document.createElement("p");x.textContent=t;steps.appendChild(x)});$("solution").open=false;nav();
}
$("answerForm").addEventListener("submit",e=>{
 e.preventDefault();const p=problems[idx];const feedback=[];
 const good=p.fields.every(([label,unit,target,tol],j)=>{
 const value=$("result"+j).value;
 if(value.trim()===""){feedback.push(label+"还没有填写");return false}
 const n=Number(value);const pass=Number.isFinite(n)&&Math.abs(n-target)<=tol;
 if(!pass)feedback.push(label+"：请核对计算与单位");return pass;
 });
 if(good){feedback.push("全部计算正确。请阅读推导，并检查假设条件。");if(!state.completed.includes(p.id))state.completed.push(p.id);save();nav();}
 else $("practiceFeedback").classList.add("bad");
 if(good)$("practiceFeedback").classList.remove("bad");
 $("practiceFeedback").textContent=feedback.join("；")+"。";
});
$("showHint").addEventListener("click",()=>{$("practiceFeedback").textContent="思路提示："+problems[idx].hint;$("practiceFeedback").classList.remove("bad")});
$("nextPractice").addEventListener("click",()=>{render((idx+1)%problems.length);$("practiceArea").scrollIntoView({behavior:"smooth",block:"start"})});
render(0);
})();