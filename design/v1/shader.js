/* Фон первого экрана: собственный WebGL-шейдер.
   Слои: мягкий белый swirl → оранжевые «chroma flow» пятна → рифлёное стекло (полосы под 31°, преломление,
   хроматическая аберрация, блик) → film grain. Без WebGL остаётся CSS-градиент .hero__bg.
   prefers-reduced-motion: один статичный кадр. Вне вьюпорта рендер на паузе. */
(function () {
  'use strict';

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uT;uniform vec2 uM;uniform float uMI;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return v;}',
    'float blob(vec2 p,vec2 c,float k){vec2 d=p-c;return exp(-dot(d,d)*k);}',
    'vec3 field(vec2 p,vec2 R){',
    ' float t=uT;',
    /* swirl: вращение вокруг центра с затуханием по радиусу + доменная деформация шумом */
    ' vec2 c=.55*R;vec2 d=p-c;float r=length(d);',
    ' float a=1.7*exp(-r*1.3)*sin(t*.07)+.35;float cs=cos(a),sn=sin(a);',
    ' vec2 sp=c+mat2(cs,-sn,sn,cs)*d;',
    ' vec2 q=vec2(fbm(sp*1.7+vec2(0.,t*.05)),fbm(sp*1.7+vec2(5.2,1.3)-t*.04));',
    ' float s=fbm(sp*1.4+1.8*q+t*.02);',
    ' vec3 col=mix(vec3(1.),vec3(.918),smoothstep(.32,.78,s));',
    /* chroma flow: пятна дрейфуют, деформируются тем же шумом */
    ' vec2 w=(q-.5)*.45;',
    ' float b=0.;',
    ' b+=blob(p+w,R*vec2(.80+.06*sin(t*.21),.30+.08*cos(t*.17)),5.5);',
    ' b+=.85*blob(p+w,R*vec2(1.04+.04*cos(t*.13),.95+.05*sin(t*.19)),6.);',
    ' b+=.7*blob(p+w,R*vec2(.50+.10*sin(t*.11+1.),1.08+.04*sin(t*.23)),8.);',
    ' b+=.45*blob(p+w,R*vec2(.62+.06*cos(t*.15+2.),-.08+.04*sin(t*.2)),12.);',
    ' b+=uMI*.7*blob(p+w*.6,uM*R,9.);',
    ' float o=smoothstep(.18,1.,b)*.95;',
    ' vec3 orange=vec3(1.,.373,.012);',
    ' vec3 warm=mix(vec3(1.,.82,.66),orange,smoothstep(.35,1.,o));',
    ' col=mix(col,warm,o*.95);',
    ' return col;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 R=asp>=1.?vec2(asp,1.):vec2(1.,1./asp);vec2 p=uv*R;',
    /* рифлёное стекло: полосы под 31°, частота 8, скругленный профиль линзы */
    ' float ang=radians(31.);vec2 dir=vec2(cos(ang),sin(ang));',
    ' float s=dot(p,dir)*8.+uT*.15;float f=fract(s);float x=f*2.-1.;',
    ' float lens=x*sqrt(max(0.,1.-.55*x*x));',
    ' vec2 off=dir*lens*.05;',
    ' float ab=.012*lens;',
    ' vec3 col;',
    ' col.r=field(p+off*1.18+dir*ab,R).r;',
    ' col.g=field(p+off,R).g;',
    ' col.b=field(p+off*.82-dir*ab,R).b;',
    /* блик сверху (lightAngle -90) и мягкая тень на противоположной кромке */
    ' col+=.09*pow(smoothstep(.6,1.,f),3.);',
    ' col-=.04*pow(1.-f,12.);',
    /* film grain */
    ' col+=(h(gl_FragCoord.xy+fract(uT*7.)*91.)-.5)*.05;',
    ' gl_FragColor=vec4(clamp(col,0.,1.),1.);}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { var log = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error(log); }
    return s;
  }

  function init(canvas, host) {
    if (!canvas || canvas._shader) return;
    canvas._shader = true;
    var gl;
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' }) || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
    if (!gl) { canvas.style.display = 'none'; return; }
    var uRes, uT, uM, uMI, lost = false, W = 0, H = 0, raf = 0;
    function setup() {
      var prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(prog, 'uRes'); uT = gl.getUniformLocation(prog, 'uT');
      uM = gl.getUniformLocation(prog, 'uM'); uMI = gl.getUniformLocation(prog, 'uMI');
      W = H = 0;
    }
    try { setup(); } catch (e) { canvas.style.display = 'none'; return; }
    /* Потеря контекста (смена GPU, нехватка памяти): показываем CSS-фон и восстанавливаемся, когда браузер вернёт контекст */
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; canvas.classList.remove('is-on'); if (raf) cancelAnimationFrame(raf); raf = 0; });
    canvas.addEventListener('webglcontextrestored', function () { try { setup(); lost = false; canvas.classList.add('is-on'); start(); } catch (e) { canvas.style.display = 'none'; } });

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var visible = true, t0 = performance.now(), tOff = 18;
    var mouse = { x: 0.8, y: 0.5, tx: 0.8, ty: 0.5, i: 0, ti: 0 };

    function resize() {
      var r = canvas.getBoundingClientRect();
      var scale = Math.min(window.devicePixelRatio || 1, 2) * (r.width < 700 ? 0.5 : 0.55);
      var w = Math.max(2, Math.round(r.width * scale)), h = Math.max(2, Math.round(r.height * scale));
      if (w !== W || h !== H) { W = canvas.width = w; H = canvas.height = h; gl.viewport(0, 0, W, H); }
    }
    function draw(now) {
      if (lost) return;
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04; mouse.i += (mouse.ti - mouse.i) * 0.03;
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uT, reduce ? tOff : tOff + (now - t0) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.uniform1f(uMI, mouse.i);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      raf = 0;
      if (!visible || document.hidden || lost) return;
      draw(now);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (reduce) { draw(performance.now()); return; } if (!raf) raf = requestAnimationFrame(frame); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    window.addEventListener('resize', function () { if (reduce) draw(performance.now()); });
    if (host && !reduce) {
      host.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = 1 - (e.clientY - r.top) / r.height; mouse.ti = 1;
      }, { passive: true });
      host.addEventListener('pointerleave', function () { mouse.ti = 0; });
    }
    canvas.classList.add('is-on');
    start();
  }

  window.HeroShader = { init: init };
})();
