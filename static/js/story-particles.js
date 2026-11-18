/* Lightweight WebGL2 sculpture: the same particles change shape in seven scenes. */
(function(){
"use strict";
function start(){
  const root=document.querySelector("[data-vx-story]");
  if(!root||!window.WebGL2RenderingContext)return;
  const canvas=root.querySelector("[data-vx-particles]"), journey=root.querySelector(".vx-journey");
  if(!canvas||!journey||window.matchMedia("(max-width:760px), (prefers-reduced-motion: reduce)").matches)return;
  let gl;
  try{gl=canvas.getContext("webgl2",{alpha:true,premultipliedAlpha:false,antialias:true,depth:false,powerPreference:"low-power"});}catch(e){return;}
  if(!gl)return;
  const vert=[
    "#version 300 es","precision highp float;",
    "layout(location=0) in vec3 a0; layout(location=1) in vec3 a1;layout(location=2) in float tone;",
    "uniform float morph,time,scale,yaw,pitch,ratio,dpr;uniform vec2 pointer;",
    "uniform vec3 colA,colB;out vec3 vColor;out float vTone;",
    "void main(){",
      "float t=morph*morph*(3.0-2.0*morph); vec3 p=mix(a0,a1,t);",
      "float id=float(gl_VertexID);p+=.012*vec3(sin(id*1.7+time),cos(id*1.9+time*.7),sin(id*.8+time*.6));",
      "float cy=cos(yaw),sy=sin(yaw),cx=cos(pitch),sx=sin(pitch);",
      "p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);",
      "float z=max(2.5,5.4-p.z); vec2 xy=p.xy*vec2(ratio,1.)*2.9*scale/z+pointer*vec2(.04,.03);",
      "gl_Position=vec4(xy,.05,1.);",
      "gl_PointSize=clamp(dpr*19.5/z*mix(.68,1.6,tone),1.5,11.);",
      "vColor=mix(colA,colB,tone);vTone=tone;",
    "}"
  ].join("\n");
  const frag=[
    "#version 300 es","precision highp float;in vec3 vColor;in float vTone;out vec4 color;",
    "void main(){ vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;",
    "float a=pow(max(0.,1.-r),.58);color=vec4(vColor*(1.+.19*a),a*mix(.5,.96,vTone)); }"
  ].join("\n");
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
  const v=shader(gl.VERTEX_SHADER,vert),f=shader(gl.FRAGMENT_SHADER,frag);if(!v||!f)return;
  const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){gl.deleteProgram(p);return;}
  gl.useProgram(p);
  const count=1800, fract=x=>x-Math.floor(x),rnd=(i,s)=>fract(Math.sin((i+1)*(12.9898+s*.1461)+s*78.233)*43758.5453);
  const sphere=(x,y,z,rx,ry,rz,u,v)=>{let a=6.283185*u,e=Math.acos(2*v-1);return [x+rx*Math.sin(e)*Math.cos(a),y+ry*Math.sin(e)*Math.sin(a),z+rz*Math.cos(e)];};
  const tri=(a,b,c,u,v)=>{let s=Math.sqrt(u),i=1-s,j=s*(1-v),k=s*v;return [a[0]*i+b[0]*j+c[0]*k,a[1]*i+b[1]*j+c[1]*k,a[2]*i+b[2]*j+c[2]*k];};
  const line=(a,b,u,v,w)=>[a[0]+(b[0]-a[0])*u+(v-.5)*w,a[1]+(b[1]-a[1])*u+(v-.5)*w,a[2]+(b[2]-a[2])*u+(v-.5)*w];
  function cube(x,y,z,w,h,d,u,v,n){let face=n%6,xx=(u-.5)*w,yy=(v-.5)*h,zz=(v-.5)*d;
    if(face===0)return[x+w/2,y+yy,z+zz];if(face===1)return[x-w/2,y+yy,z+zz];if(face===2)return[x+xx,y+h/2,z+zz];
    if(face===3)return[x+xx,y-h/2,z+zz];if(face===4)return[x+xx,y+yy,z+d/2];return[x+xx,y+yy,z-d/2];}
  function shape(s,i){let u=rnd(i,11),v=rnd(i,23),w=rnd(i,37);
    if(s===0){if(i<count*.38)return sphere(.08,-.13,0,.82,.38,.40,u,v);
      if(i<count*.62)return tri([-.38,.04,.17],[-1.2,1.68,.08],[.47,.1,.43],u,v);
      if(i<count*.76)return tri([-.4,.02,-.18],[-.64,1.4,-.63],[.56,.03,-.43],u,v);
      if(i<count*.86)return sphere(.93,.11,0,.26,.26,.30,u,v);
      if(i<count*.94)return tri([-.72,-.16,0],[-1.76,.16,.16],[-1.43,-.56,-.18],u,v);
      if(i<count*.97)return tri([1.08,.1,0],[1.48,-.01,0],[1.09,-.13,.16],u,v);
      return cube(.03,-.77,.04,.39,.31,.06,u,v,i);}
    if(s===1){let x=(u-.5)*2.6,y=(v-.5)*2.7;return[x,y,.28*Math.cos(x*1.8)+.12*Math.sin(y*2)+(w-.5)*.05];}
    if(s===2)return cube(0,-1.25+Math.floor(i/(count/4))*.84,0,2.5,.38,.72,u,v,i);
    if(s===3){let j=i%100;if(j<27)return line([0,-1.58,0],[0,1.24,0],u,v,.07);
      if(j<43)return line([-1.75,.75,0],[1.75,.75,0],u,v,.06);
      if(j<57)return line([-1.12,.76,0],[-1.12,-.6,0],u,v,.04);
      if(j<71)return line([1.12,.76,0],[1.12,-.46,0],u,v,.04);
      let side=j<86?-1:1,a=6.28318*u;return[side*1.12+Math.cos(a)*v*.59,side<0?-.6+v*v*.15:-.46+v*v*.15,Math.sin(a)*v*.47];}
    if(s===4){let n=i%9,row=Math.floor(n/3),col=n%3;return sphere((col-1)*1.08,(1-row)*.95,0,.23,.23,.23,u,v);}
    if(s===5){let j=i%3,y=1-j,back=j===1;return line(back?[1.55,y,.12]:[-1.55,y,.12],back?[-1.55,y-.3,-.15]:[1.55,y-.3,-.15],u,v,.08);}
    let phase=i%6;
    if(phase<3)return sphere((phase-1)*1.52,Math.sin(phase*2.1)*.43,0,.40,.40,.40,u,v);
    let a=phase%2;return line([-1.52+a*1.52,Math.sin(a*2.1)*.43,0],[a*1.52,Math.sin((a+1)*2.1)*.43,0],u,v,.055);
  }
  const poses=Array.from({length:7},(_,s)=>{let a=new Float32Array(count*3);for(let i=0;i<count;i++){let q=shape(s,i);a.set(q,i*3);}return a;});
  let tone=new Float32Array(count);for(let i=0;i<count;i++)tone[i]=.16+.84*rnd(i,51);
  const buffers=[gl.createBuffer(),gl.createBuffer(),gl.createBuffer()];
  function bind(k,array,size){gl.bindBuffer(gl.ARRAY_BUFFER,buffers[k]);gl.bufferData(gl.ARRAY_BUFFER,array,k===2?gl.STATIC_DRAW:gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(k);gl.vertexAttribPointer(k,size,gl.FLOAT,false,0,0);}
  let scene=Math.max(0,Math.min(6,+root.dataset.active||0)),prev=scene,changed=performance.now();
  bind(0,poses[scene],3);bind(1,poses[scene],3);bind(2,tone,1);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const uniforms={};["morph","time","scale","yaw","pitch","ratio","dpr","pointer","colA","colB"].forEach(x=>uniforms[x]=gl.getUniformLocation(p,x));
  const palette=[
    [[.98,.79,.42],[.88,.97,1]],[[.08,.23,.32],[.55,.35,.15]],[[.5,.91,.94],[.98,.8,.37]],
    [[.08,.24,.32],[.44,.28,.1]],[[.49,.98,.63],[.96,.8,.36]],[[.77,.64,.99],[.95,.89,.59]],[[.09,.36,.38],[.54,.36,.14]]
  ];
  const scales=[1.2,1.2,.95,.94,1.08,1,1.08],yaw=[-.4,.3,-.35,.12,.55,-.1,.26],pitch=[.15,-.12,.1,-.16,.1,.08,-.1];
  let yawNow=yaw[scene],pitchNow=pitch[scene],scaleNow=scales[scene],pointX=0,pointY=0,mouseX=0,mouseY=0,frame=0,visible=false,active=true,cw=0,ch=0,dpr=1;
  function resize(){let r=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,1.5);
    let w=Math.max(1,Math.floor(r.width*dpr)),h=Math.max(1,Math.floor(r.height*dpr));if(w!==cw||h!==ch){cw=w;ch=h;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}}
  function request(){if(!frame&&active&&visible)frame=requestAnimationFrame(render);}
  function onScene(){let n=Math.max(0,Math.min(6,+root.dataset.active||0));if(n===scene)return;prev=scene;scene=n;changed=performance.now();bind(0,poses[prev],3);bind(1,poses[scene],3);request();}
  function render(t){frame=0;if(!visible||!active||document.hidden)return;resize();let blend=Math.max(0,Math.min(1,(t-changed)/1120));
    scaleNow+=(scales[scene]-scaleNow)*.06;yawNow+=(yaw[scene]-yawNow)*.06;pitchNow+=(pitch[scene]-pitchNow)*.06;
    mouseX+=(pointX-mouseX)*.04;mouseY+=(pointY-mouseY)*.04;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(p);
    gl.uniform1f(uniforms.morph,blend);gl.uniform1f(uniforms.time,t/1000);gl.uniform1f(uniforms.scale,scaleNow);gl.uniform1f(uniforms.yaw,yawNow+mouseX*.18);
    gl.uniform1f(uniforms.pitch,pitchNow+mouseY*.11);gl.uniform1f(uniforms.ratio,Math.min(1.25,ch/Math.max(1,cw)));
    gl.uniform1f(uniforms.dpr,dpr);gl.uniform2f(uniforms.pointer,mouseX,mouseY);
    let c=palette[scene];gl.uniform3fv(uniforms.colA,c[0]);gl.uniform3fv(uniforms.colB,c[1]);gl.drawArrays(gl.POINTS,0,count);request();}
  new MutationObserver(onScene).observe(root,{attributes:true,attributeFilter:["data-active"]});
  if("IntersectionObserver" in window)new IntersectionObserver(es=>{visible=es.some(x=>x.isIntersecting);if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}request();},{rootMargin:"180px"}).observe(journey);
  else visible=true;
  journey.addEventListener("pointermove",e=>{let r=journey.getBoundingClientRect();pointX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));pointY=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));},{passive:true});
  journey.addEventListener("pointerleave",()=>{pointX=0;pointY=0;});
  window.addEventListener("resize",()=>{resize();request();},{passive:true});
  document.addEventListener("visibilitychange",()=>{active=!document.hidden;request();});
  canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();active=false;root.classList.remove("vx-webgl-active");if(frame)cancelAnimationFrame(frame);frame=0;});
  root.classList.add("vx-webgl-active");request();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();