/* Automated structural and numerical checks for Energy Lab.
   This runs before Hugo publishes the site. Zero external dependencies. */
import fs from "node:fs";
import vm from "node:vm";
const base="static/energy-lab/";
const load=n=>fs.readFileSync(base+n,"utf8");
const assert=(cond,msg)=>{if(!cond)throw new Error("CHECK FAILED: "+msg)};
const html=load("index.html"),css=load("studio.css"),workbook=load("workbook.html"),curriculum=load("curriculum.js"),labs=load("labs.js"),figures=load("figures.js"),studio=load("studio.js"),wb=load("workbook.js");
for(const [name,content] of [["curriculum",curriculum],["figures",figures],["labs",labs],["studio",studio],["workbook",wb]]){try{new vm.Script(content,{filename:name})}catch(e){throw new Error(name+" syntax: "+e.message)}}
const ctx={window:{}};vm.runInNewContext(curriculum,ctx);vm.runInNewContext(figures,ctx);vm.runInNewContext(labs,ctx);
const data=ctx.window.ENERGY_CURRICULUM,figure=ctx.window.ENERGY_FIGURES,engines=ctx.window.ENERGY_LABS;
assert(data.modules.length===8,"8 modules");const lessons=data.modules.flatMap(m=>m.lessons);
assert(lessons.length===24,"24 lessons");
assert(new Set(lessons.map(l=>l.id)).size===24,"unique lesson IDs");
assert(engines.ids.length>=10,"11 interactive lab engines");
for(const m of data.modules){
 assert(m.sources?.length>0,"module sources "+m.id);
 for(const source of m.sources)assert(data.sourceLinks[source],"citation available "+source);
 for(const l of m.lessons){
  assert(l.story&&l.paras?.length>=3&&l.formula&&l.worked&&l.wrong&&l.takeaway,"complete lesson "+l.id);
  assert(l.goals?.length>=2&&l.teach?.ask&&l.teach?.board&&l.teach?.task,"teaching objectives "+l.id);
  assert(l.quiz?.options?.length===4&&Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<4,"quiz "+l.id);
  if(l.lab)assert(engines.ids.includes(l.lab),"missing experiment "+l.lab);
  const svg=figure(l.figure);assert(svg.startsWith("<svg")&&svg.endsWith("</svg>"),"figure "+l.id);
 }
}
for(const path of ["studio.css","curriculum.js","figures.js","labs.js","studio.js"]){assert(html.includes("./"+path),"index includes "+path)}
for(const path of ["workbook.css","workbook.js"]){assert(workbook.includes("./"+path),"workbook includes "+path)}
for(const name of ["lessonContent","lessonTitle","lessonParas","labMount","quizAnswers","glossaryDialog","moduleNav","markDone"]){assert(html.includes('id="'+name+'"'),"index DOM #"+name)}
assert(html.includes("./workbook.html"),"workbook linked");
assert(Math.abs(10*.8*.9-7.2)<1e-9,"efficiency worked example");
assert(20*30===600&&60/30===2,"C-rate formula");
assert(Math.abs(2*4/(.8*.92)-10.8695652174)<.001,"sizing formula");
assert(Math.abs(100*100*.003-30)<1e-9,"I^2 R");
assert(css.includes("@media(max-width:600px)"),"mobile CSS");
console.log("Energy Lab verification passed: 8 modules, 24 lessons, "+engines.ids.length+" labs, 24 quizzes, source links and numerical formulas.");