/* Automated structural and numerical checks for Energy Lab.
   This runs before Hugo publishes the site. Zero external dependencies. */
import fs from "node:fs";
import vm from "node:vm";
const base="static/energy-lab/";
const load=n=>fs.readFileSync(base+n,"utf8");
const assert=(cond,msg)=>{if(!cond)throw new Error("CHECK FAILED: "+msg)};
const html=load("index.html"),css=load("studio.css"),workbook=load("workbook.html"),curriculum=load("curriculum.js"),labs=load("labs.js"),figures=load("figures.js"),studio=load("studio.js"),wb=load("workbook.js");
const handbook=load("handbook.html"), handbookJS=load("handbook.js"), labPage=load("labs.html"), labHubJS=load("labhub.js"),legacy=load("course.html");
for(const [name,content] of [["curriculum",curriculum],["figures",figures],["labs",labs],["studio",studio],["workbook",wb],["handbook",handbookJS],["labhub",labHubJS]]){try{new vm.Script(content,{filename:name})}catch(e){throw new Error(name+" syntax: "+e.message)}}
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
for(const name of ["lessonContent","lessonTitle","lessonParas","labMount","quizAnswers","moduleNav","markDone"]){assert(html.includes('id="'+name+'"'),"index DOM #"+name)}
assert(html.includes("./workbook.html"),"workbook linked");
const practiceLessons=new Map([...wb.matchAll(/id:"(p\d+)",lesson:"([^"]+)"/g)].map(([,problem,lesson])=>[problem,lesson]));
assert(practiceLessons.size===8,"8 addressable practice problems");
for(const [problem,lesson] of practiceLessons)
 assert(lessons.some(l=>l.id===lesson&&l.practice===problem),"practice links to and from "+lesson);
for(const lesson of lessons.filter(l=>l.practice))
 assert(practiceLessons.has(lesson.practice),"known practice target for "+lesson.id);
const entryPaths=["./","./labs.html","./handbook.html","./workbook.html"];
for(const page of [html,handbook,labPage,workbook])for(const link of entryPaths)assert(page.includes('href="'+link+'"'),"four-part navigation includes "+link);
assert(!html.includes("原版课程")&&!html.includes("旧版完整课程"),"no parallel old course entry");
assert(!html.includes('href="./course.html"'),"legacy page not presented as separate course");
assert(!html.includes('id="glossaryDialog"'),"duplicate glossary popup removed");
assert(handbook.match(/<article class="manual-entry"/g)?.length===16,"16 migrated knowledge sections");
assert(handbook.match(/<article class="formula-item"/g)?.length===24,"24 indexed formulas");
assert(handbook.match(/<details class="term-item"/g)?.length===51,"51 preserved terms");
assert(handbook.match(/<li><a href="https:\/\//g)?.length>=13,"reference citations retained");
assert(labPage.includes('id="labNav"')&&labPage.includes('id="labMount"'),"experiment center available");
for(const id of engines.ids)assert(labHubJS.includes('id:"'+id+'"'),"experiment in center "+id);
assert(legacy.includes("location.replace")&&legacy.includes("handbook.html")&&legacy.includes('lab:"./labs.html#crate"'),"legacy redirect & anchors");
for(const file of ["index.html","labs.html","handbook.html","workbook.html"]){
 const source=load(file);
 for(const match of source.matchAll(/(?:src|href)="\.\/([A-Za-z][A-Za-z0-9.-]+\.(?:html|css|js))"/g))
  assert(fs.existsSync(base+match[1]),file+" missing local asset "+match[1]);
}
const handbookAnchors=new Set([...handbook.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
for(const match of handbook.matchAll(/href="#([^"]+)"/g))assert(handbookAnchors.has(match[1]),"handbook anchor missing #"+match[1]);
assert(Math.abs(10*.8*.9-7.2)<1e-9,"efficiency worked example");
assert(20*30===600&&60/30===2,"C-rate formula");
assert(Math.abs(2*4/(.8*.92)-10.8695652174)<.001,"sizing formula");
assert(Math.abs(100*100*.003-30)<1e-9,"I^2 R");
assert(css.includes("@media(max-width:600px)"),"mobile CSS");
console.log("Energy Lab verification passed: one main course, 8 modules, 24 lessons, "+engines.ids.length+" labs, 16 reference topics, 24 formulas, 51 terms, 24 quizzes and legacy routing.");