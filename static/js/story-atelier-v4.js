/*
 * Story atelier v4 - a continuous seven-scene point sculpture.
 * No third-party libraries or textures. All forms are procedurally built.
 * If WebGL2 is unavailable the illustrated HTML narrative stays readable.
 */
(function () {
  "use strict";
  function start() {
    var root = document.querySelector("[data-vx-story]");
    if (!root || !window.WebGL2RenderingContext) return;
    var canvas = root.querySelector("[data-vx-particles]");
    var journey = root.querySelector(".vx-journey");
    if (!canvas || !journey) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var small = window.matchMedia("(max-width: 760px)");
    if (reduced.matches || small.matches) return;
    var gl;
    try {
      gl = canvas.getContext("webgl2", {alpha:true, antialias:true, depth:false,
        premultipliedAlpha:false, powerPreference:"high-performance"});
    } catch (e) { return; }
    if (!gl) return;
    var vertex = [
      "#version 300 es",
      "precision highp float;",
      "layout(location=0) in vec3 aFrom;",
      "layout(location=1) in vec3 aTo;",
      "layout(location=2) in vec3 aNormal;",
      "layout(location=3) in float aMaterial;",
      "layout(location=4) in float aSeed;",
      "uniform float uMorph,uTime,uZoom,uYaw,uPitch,uDpr,uAspect,uAccent;",
      "uniform vec2 uPointer;",
      "out vec3 vColor;",
      "out float vGlow;",
      "vec3 materialColor(float m){",
        "if(m<.5)return vec3(.83,.91,.94);", // porcelain body
        "if(m<1.5)return vec3(.53,.76,.89);", // wing/secondary layer
        "if(m<2.5)return vec3(.96,.71,.35);", // paper/beak/gold
        "if(m<3.5)return vec3(.12,.34,.46);", // dark details
        "if(m<4.5)return vec3(.96,.94,.78);", // luminous point
        "return vec3(.49,.72,.77);",
      "}",
      "void main(){",
        "float t=clamp(uMorph,0.,1.); t=t*t*(3.-2.*t);",
        "float delay=aSeed*.20;",
        "float local=clamp((t-delay)/(1.-delay),0.,1.);local=local*local*(3.-2.*local);",
        "vec3 p=mix(aFrom,aTo,local);",
        "float breathing=sin(uTime*.78+aSeed*17.)*.012;",
        "p+=normalize(p+vec3(.001))*breathing;",
        "float cy=cos(uYaw), sy=sin(uYaw), cx=cos(uPitch), sx=sin(uPitch);",
        "p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);",
        "p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);",
        "vec3 n=normalize(aNormal+vec3(.001));",
        "n=vec3(n.x*cy+n.z*sy,n.y,-n.x*sy+n.z*cy);",
        "float lit=.48+.50*max(0.,dot(n,normalize(vec3(-.45,.86,1.2))));",
        "float rim=pow(1.-abs(n.z),2.)*.35;",
        "float z=max(1.9,5.35-p.z);",
        "vec2 xy=p.xy*vec2(uAspect,1.)*(3.3*uZoom/z);",
        "xy+=uPointer*vec2(.036,.026);",
        "gl_Position=vec4(xy,0.,1.);",
        "float size=clamp(uDpr*(16.+aSeed*8.)/z,1.5,7.5);",
        "gl_PointSize=size;",
        "vec3 base=materialColor(aMaterial);",
        "vColor=base*(lit+rim)+vec3(uAccent*.06,uAccent*.023,0.);",
        "vGlow=mix(.62,1.,aSeed);",
      "}"
    ].join("\n");
    var fragment = [
      "#version 300 es",
      "precision highp float;",
      "in vec3 vColor; in float vGlow; out vec4 o;",
      "void main(){",
        "vec2 uv=gl_PointCoord*2.-1.;",
        "float d=dot(uv,uv);if(d>1.)discard;",
        "float a=pow(max(0.,1.-d),.58)*vGlow;",
        "o=vec4(vColor*(1.+.35*(1.-d)),a);",
      "}"
    ].join("\n");
    function shader(type, source) {
      var s=gl.createShader(type);
      gl.shaderSource(s,source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s,gl.COMPILE_STATUS)) {gl.deleteShader(s);return null;}
      return s;
    }
    var vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
    if(!vs||!fs)return;
    var program=gl.createProgram();
    gl.attachShader(program,vs);gl.attachShader(program,fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return;}
    gl.useProgram(program);
    var COUNT=8400;
    function fract(n){return n-Math.floor(n);}
    function rand(i,s){return fract(Math.sin((i+1)* (11.913+s*.1463)+s*79.333)*45813.295);}
    function norm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}
    function part(x,y,z,nx,ny,nz,m){return {p:[x,y,z],n:norm([nx,ny,nz]),m:m};}
    function ellipse(x,y,z,rx,ry,rz,u,v,m){
      var a=u*Math.PI*2,cz=v*2-1,r=Math.sqrt(Math.max(0,1-cz*cz));
      var px=r*Math.cos(a),py=r*Math.sin(a),pz=cz;
      return part(x+rx*px,y+ry*py,z+rz*pz,px/rx,py/ry,pz/rz,m);
    }
    function facet(a,b,c,u,v,m){
      var s=Math.sqrt(u),w0=1-s,w1=s*(1-v),w2=s*v;
      var x=a[0]*w0+b[0]*w1+c[0]*w2;
      var y=a[1]*w0+b[1]*w1+c[1]*w2;
      var z=a[2]*w0+b[2]*w1+c[2]*w2;
      var ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2];
      var fx=c[0]-a[0],fy=c[1]-a[1],fz=c[2]-a[2];
      return part(x,y,z,ey*fz-ez*fy,ez*fx-ex*fz,ex*fy-ey*fx,m);
    }
    function capsule(a,b,r,u,v,m){
      var axis=norm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);
      var other=norm([axis[1]+.024,-axis[0]+.13,.5]);
      var bit=norm([axis[1]*other[2]-axis[2]*other[1],axis[2]*other[0]-axis[0]*other[2],axis[0]*other[1]-axis[1]*other[0]]);
      var angle=2*Math.PI*v,normal=[other[0]*Math.cos(angle)+bit[0]*Math.sin(angle),other[1]*Math.cos(angle)+bit[1]*Math.sin(angle),other[2]*Math.cos(angle)+bit[2]*Math.sin(angle)];
      return part(a[0]+(b[0]-a[0])*u+normal[0]*r,a[1]+(b[1]-a[1])*u+normal[1]*r,a[2]+(b[2]-a[2])*u+normal[2]*r,normal[0],normal[1],normal[2],m);
    }
    function cuboid(x,y,z,w,h,d,u,v,k,m){
      var a=2*u-1,b=2*v-1,face=k%6;
      if(face===0)return part(x+w/2,y+a*h/2,z+b*d/2,1,0,0,m);
      if(face===1)return part(x-w/2,y+a*h/2,z+b*d/2,-1,0,0,m);
      if(face===2)return part(x+a*w/2,y+h/2,z+b*d/2,0,1,0,m);
      if(face===3)return part(x+a*w/2,y-h/2,z+b*d/2,0,-1,0,m);
      if(face===4)return part(x+a*w/2,y+b*h/2,z+d/2,0,0,1,m);
      return part(x+a*w/2,y+b*h/2,z-d/2,0,0,-1,m);
    }
    function birdWing(side,u,v,r){
      var x=-.26-.76*u+.53*v;
      var y=.22+1.46*u-.40*v;
      var z=side*(.27+.23*u*Math.sin(v*Math.PI)+.11*u);
      var scallop=Math.pow(u,1.3)*(.052*Math.sin(v*19*Math.PI));
      return part(x,y+scallop,z,-.10,.61,side*.82,r<.1?4:1);
    }
    function bird(i){
      var u=rand(i,7),v=rand(i,23),w=rand(i,37);
      var group=i/COUNT;
      if(group<.29)return ellipse(-.13,-.20,0,.83,.43,.47,u,v,0);
      if(group<.39)return ellipse(.56,.07,0,.36,.43,.32,u,v,0);
      if(group<.48)return ellipse(.95,.34,0,.29,.31,.30,u,v,0);
      if(group<.63)return birdWing(1,u,v,w);
      if(group<.78)return birdWing(-1,u,v,w);
      if(group<.865){
        var feather=Math.floor(w*7),t=feather/6-.5;
        return facet([-.78,-.27,t*.12],[-1.93,.24+t*.36,t*.68],[-1.48,-.55,t*.7],u,v,1);
      }
      if(group<.899) return facet([1.11,.3,-.02],[1.48,.18,.0],[1.10,.16,.20],u,v,2);
      if(group<.915)return ellipse(1.115,.418,.292,.035,.032,.018,u,v,3);
      if(group<.942)return capsule([-.13,-.60,w<.5?-.22:.22],[.13,-1.04,w<.5?-.23:.23],.025,u,v,2);
      if(group<.975)return cuboid(.08,-1.08,.30,.55,.39,.07,u,v,i,2);
      return capsule([-.12,-1.06,.34],[.26,-1.12,.34],.008,u,v,4);
    }
    function shape(scene,i){
      if(scene===0)return bird(i);
      var u=rand(i,7),v=rand(i,23),w=rand(i,37),g=i/COUNT;
      if(scene===1){
        if(g<.81){
          var x=(u-.5)*2.60,y=(v-.5)*2.70;
          var curl=.2*Math.cos(x*1.8)+.12*Math.sin(y*2.5);
          return part(x,y,curl,x*.1,.04,1,g<.7?4:1);
        }
        if(g<.89)return capsule([-1.3,0,.25],[1.3,0,.25],.017,u,v,2);
        if(g<.95)return capsule([-.8,-1.4,.28],[-.8,1.37,.28],.011,u,v,3);
        return cuboid(.74,.77,.29,.63,.39,.025,u,v,i,2);
      }
      if(scene===2){
        var layer=Math.min(3,Math.floor(g*4));
        if((i%13)<2)return capsule([-.95,-1.24+layer*.82,-.5],[.98,-1.24+layer*.82,.54],.012,u,v,2);
        return cuboid(0,-1.23+layer*.82,0,2.72,.43,.87,u,v,i,layer===0?2:layer===3?4:1);
      }
      if(scene===3){
        var j=i%110;
        if(j<16)return capsule([0,-1.74,0],[0,1.18,0],.055,u,v,3);
        if(j<31)return capsule([-1.68,.74,0],[1.68,.74,0],.041,u,v,3);
        if(j<43)return capsule([-1.13,.76,0],[-1.13,-.44,0],.016,u,v,2);
        if(j<55)return capsule([1.13,.76,0],[1.13,-.62,0],.016,u,v,2);
        if(j<69)return cuboid(0,-1.77,0,.95,.17,.85,u,v,i,3);
        var side=j<89?-1:1,a=u*Math.PI*2,r=Math.sqrt(v)*.6;
        return part(side*1.13+Math.cos(a)*r,side<0?-.43+Math.sqrt(v)*.10:-.61+Math.sqrt(v)*.10,Math.sin(a)*r,0,1,0,side<0?2:1);
      }
      if(scene===4){
        var t=i%9,col=t%3,row=Math.floor(t/3),success=[1,1,1,0,1,0,0,0,0][t];
        if(g<.83)return ellipse((col-1)*1.04,(1-row)*.88,0,.20,.20,.20,u,v,success?2:3);
        return capsule([-.98,-1.5,0],[1.0,-1.5,0],.016,u,v,4);
      }
      if(scene===5){
        var item=i%6,stage=item%3;
        if(item<2)return ellipse(item?1.6:-1.6,0,0,.20,1.62,.17,u,v,item?1:2);
        var from=stage===1?[1.56,.52,0]:[-1.56,1.11-stage*.87,0];
        var to=stage===1?[-1.56,-.22,0]:[1.56,.50-stage*.85,0];
        return capsule(from,to,.025,u,v,stage===1?4:2);
      }
      if(g<.74){
        var a=Math.floor(g*3/.74),angle=v*Math.PI*2;
        return ellipse((a-1)*1.52,Math.sin(a*2.1)*.37,0,.40,.40,.38,u,v,a===1?2:0);
      }
      var link=Math.floor(w*2),start=[-1.52+link*1.52,Math.sin(link*2.1)*.37,0],end=[link*1.52,Math.sin((link+1)*2.1)*.37,0];
      return capsule(start,end,.023,u,v,4);
    }
    var positions=[], normals=[], material=[], seeds=new Float32Array(COUNT);
    for(var sceneId=0;sceneId<7;sceneId++){
      var coords=new Float32Array(COUNT*3),normal=new Float32Array(COUNT*3),mat=new Float32Array(COUNT);
      for(var i=0;i<COUNT;i++){
        var q=shape(sceneId,i);
        coords.set(q.p,i*3);normal.set(q.n,i*3);mat[i]=q.m;
        if(sceneId===0)seeds[i]=rand(i,51);
      }
      positions.push(coords);normals.push(normal);material.push(mat);
    }
    var fromPositions=new Float32Array(positions[0]);
    var fromNormal=new Float32Array(normals[0]);
    var fromMaterial=new Float32Array(material[0]);
    var buffers=Array.from({length:5},function(){return gl.createBuffer();});
    function bind(location,arr,components,usage){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffers[location]);
      gl.bufferData(gl.ARRAY_BUFFER,arr,usage||gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location,components,gl.FLOAT,false,0,0);
    }
    var scene=Math.max(0,Math.min(6,parseInt(root.dataset.active||"0",10)||0));
    var morph=1,changeAt=performance.now(),duration=1280;
    bind(0,positions[scene],3,gl.DYNAMIC_DRAW);
    bind(1,positions[scene],3,gl.DYNAMIC_DRAW);
    bind(2,normals[scene],3,gl.DYNAMIC_DRAW);
    bind(3,material[scene],1,gl.DYNAMIC_DRAW);
    bind(4,seeds,1);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    var uniforms={};
    ["uMorph","uTime","uZoom","uYaw","uPitch","uDpr","uAspect","uPointer","uAccent"].forEach(function(k){uniforms[k]=gl.getUniformLocation(program,k);});
    var zoom=[1.18,1.08,.93,.91,.98,.93,1.03];
    var yaw=[-.20,.26,-.36,.12,-.18,.08,.20];
    var pitch=[.12,-.13,.20,-.08,.05,.10,-.12];
    var zoomNow=zoom[scene],yawNow=yaw[scene],pitchNow=pitch[scene];
    var pointer=[0,0],mouse=[0,0],w=0,h=0,dpr=1,frame=0,lastDraw=0;
    var visible=false,active=true;
    function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
    function resize(){
      var rect=canvas.getBoundingClientRect();
      dpr=Math.min(window.devicePixelRatio||1,1.55);
      var nw=Math.max(1,Math.floor(rect.width*dpr)),nh=Math.max(1,Math.floor(rect.height*dpr));
      if(nw!==w||nh!==h){w=nw;h=nh;canvas.width=nw;canvas.height=nh;gl.viewport(0,0,nw,nh);}
    }
    function schedule(){if(!frame&&visible&&active)frame=window.requestAnimationFrame(draw);}
    function updateScene(){
      var next=clamp(parseInt(root.dataset.active||"0",10)||0,0,6);
      if(next===scene)return;
      var t=clamp((performance.now()-changeAt)/duration,0,1);
      t=t*t*(3-2*t);
      // Capture the current in-between geometry, so interrupted transitions never jump.
      var p=positions[scene];
      for(var i=0;i<fromPositions.length;i++)fromPositions[i]=fromPositions[i]*(1-t)+p[i]*t;
      bind(0,fromPositions,3,gl.DYNAMIC_DRAW);
      scene=next;changeAt=performance.now();morph=0;
      bind(1,positions[scene],3,gl.DYNAMIC_DRAW);
      bind(2,normals[scene],3,gl.DYNAMIC_DRAW);
      bind(3,material[scene],1,gl.DYNAMIC_DRAW);
      schedule();
    }
    function draw(now){
      frame=0;
      if(!active||!visible||document.hidden)return;
      if(now-lastDraw<19){schedule();return;}
      lastDraw=now;
      resize();
      morph=clamp((performance.now()-changeAt)/duration,0,1);
      zoomNow+=(zoom[scene]-zoomNow)*.055;
      yawNow+=(yaw[scene]-yawNow)*.052;
      pitchNow+=(pitch[scene]-pitchNow)*.055;
      mouse[0]+=(pointer[0]-mouse[0])*.055;mouse[1]+=(pointer[1]-mouse[1])*.055;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
      gl.uniform1f(uniforms.uMorph,morph);gl.uniform1f(uniforms.uTime,now*.001);
      gl.uniform1f(uniforms.uZoom,zoomNow);
      gl.uniform1f(uniforms.uYaw,yawNow+mouse[0]*.16);
      gl.uniform1f(uniforms.uPitch,pitchNow+mouse[1]*.09);
      gl.uniform1f(uniforms.uDpr,dpr);
      gl.uniform1f(uniforms.uAspect,Math.min(1.2,h/Math.max(1,w)));
      gl.uniform1f(uniforms.uAccent,scene===1||scene===3?.9:.35);
      gl.uniform2f(uniforms.uPointer,mouse[0],mouse[1]);
      gl.drawArrays(gl.POINTS,0,COUNT);
      schedule();
    }
    var mutation=new MutationObserver(updateScene);
    mutation.observe(root,{attributes:true,attributeFilter:["data-active"]});
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        visible=entries.some(function(entry){return entry.isIntersecting;});
        if(!visible&&frame){window.cancelAnimationFrame(frame);frame=0;}
        schedule();
      },{rootMargin:"140px"}).observe(journey);
    } else visible=true;
    journey.addEventListener("pointermove",function(event){
      var r=journey.getBoundingClientRect();
      pointer[0]=clamp((event.clientX-r.left)/Math.max(1,r.width)*2-1,-1,1);
      pointer[1]=clamp((event.clientY-r.top)/Math.max(1,r.height)*2-1,-1,1);
    },{passive:true});
    journey.addEventListener("pointerleave",function(){pointer=[0,0];});
    window.addEventListener("resize",function(){resize();schedule();},{passive:true});
    document.addEventListener("visibilitychange",function(){active=!document.hidden;schedule();});
    canvas.addEventListener("webglcontextlost",function(event){
      event.preventDefault();active=false;root.classList.remove("vx-webgl-active");
      if(frame)window.cancelAnimationFrame(frame);frame=0;
    });
    root.classList.add("vx-webgl-active");
    resize();schedule();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);
  else start();
})();
