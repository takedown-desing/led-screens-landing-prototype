/* Вариант 4 · Сцена. Первый экран: видео на весь экран при прокрутке «садится» LED-панелью
   на стену зала. Идея и композиция из макета дизайнера (led.addu.fun): Three.js-зал с потолочными
   панелями и светом от экрана, HTML-экран поверх проекции панели, текст уменьшается вместе с экраном.
   Своё: отражение видео в полу, сетка кабинетов на время «монтажа», факты под экраном после установки.
   Без WebGL или при «уменьшить движение» первый экран остаётся статичным видео на весь экран. */
(function () {
  'use strict';

  var html = document.documentElement;
  function clamp(v, a, b) { return Math.min(b == null ? 1 : b, Math.max(a || 0, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, p) { var t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  /* ---------- Зал ---------- */
  function Room(box, video, narrow) {
    var THREE = window.THREE;
    var BG = 0x040a17;
    var world = new THREE.Scene();
    world.background = new THREE.Color(BG);
    world.fog = new THREE.FogExp2(BG, 0.024);
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    camera.position.set(0, 2.65, 9); camera.lookAt(0, 2.65, -3);
    var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    box.appendChild(renderer.domElement);

    /* Панель: в зале только рама, само изображение рисует HTML-экран поверх проекции */
    var frameMat = new THREE.MeshStandardMaterial({ color: 0x010306, roughness: 0.5, metalness: 0.65 });
    var frame = new THREE.Mesh(new THREE.BoxGeometry(11.48, 4.58, 0.14), frameMat);
    frame.position.set(0, 2.65, -3.09); world.add(frame);

    var wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), new THREE.MeshStandardMaterial({ color: 0x0a1020, roughness: 0.82, metalness: 0.2 }));
    wall.position.set(0, 4.6, -3.18); world.add(wall);

    /* Потолок: кессоны, балки, круглые светильники */
    var ceilMat = new THREE.MeshStandardMaterial({ color: 0x111a2b, roughness: 0.78, metalness: 0.35 });
    var beamMat = new THREE.MeshStandardMaterial({ color: 0x070c15, roughness: 0.46, metalness: 0.7 });
    var panelGeo = new THREE.BoxGeometry(2.74, 0.1, 2.74);
    var x, z;
    for (x = -8.7; x <= 8.71; x += 2.9) { var b1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 17.5), beamMat); b1.position.set(x, 5.25, 4.6); world.add(b1); }
    for (z = -3; z <= 12.1; z += 2.9) { var b2 = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.18, 0.12), beamMat); b2.position.set(0, 5.25, z); world.add(b2); }
    [-7.25, -4.35, -1.45, 1.45, 4.35, 7.25].forEach(function (cx) {
      [-1.55, 1.35, 4.25, 7.15, 10.05].forEach(function (cz) { var p = new THREE.Mesh(panelGeo, ceilMat); p.position.set(cx, 5.22, cz); world.add(p); });
    });
    var bulbMat = new THREE.MeshBasicMaterial({ color: 0x8aa6cc });
    var rimMat = new THREE.MeshStandardMaterial({ color: 0x090f19, roughness: 0.5, metalness: 0.75 });
    [-4.35, -1.45, 1.45, 4.35].forEach(function (bx) {
      [-1.55, 4.25].forEach(function (bz) {
        var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 24), rimMat); rim.position.set(bx, 5.11, bz); world.add(rim);
        var bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.018, 24), bulbMat); bulb.position.set(bx, 5.048, bz); world.add(bulb);
      });
    });

    /* Свет: цвет и сила берутся из текущего кадра видео */
    world.add(new THREE.HemisphereLight(0x46638e, 0x02050a, 0.2));
    var fill = new THREE.DirectionalLight(0x5089cd, 0.3); fill.position.set(0, 5, 5); world.add(fill);
    var key = new THREE.SpotLight(0x498aff, 3.4, 32, Math.PI * 0.4, 0.7, 1.4);
    key.position.set(0, 3, -2.6); key.target.position.set(0, 0, 4); world.add(key, key.target);
    var rim2 = new THREE.DirectionalLight(0x3284ff, 1.6); rim2.position.set(0, 3, -3); world.add(rim2);

    /* Отражение: перевёрнутая копия видео под полом, пол полупрозрачный и шершавый */
    var tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    var mirror = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 4.5), new THREE.ShaderMaterial({
      uniforms: { map: { value: tex } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform sampler2D map;varying vec2 vUv;void main(){vec3 c=texture2D(map,vec2(vUv.x,1.-vUv.y)).rgb;float f=smoothstep(0.,1.,vUv.y);gl_FragColor=vec4(c*f*f*.8,1.);}'
    }));
    mirror.position.set(0, -2.65, -3); world.add(mirror);

    var floorMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: true,
      uniforms: { ledTint: { value: new THREE.Vector3(0.034, 0.094, 0.19) }, panelWidth: { value: 11.4 } },
      vertexShader: 'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: [
        'uniform float panelWidth;uniform vec3 ledTint;varying vec3 vWorld;',
        'float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
        'void main(){',
        ' float travel=max(vWorld.z+3.,0.);',
        ' float breadth=panelWidth*.54+travel*.58;',
        ' float pool=exp(-pow(vWorld.x/breadth,2.)*2.4)*exp(-travel*.16);',
        ' vec3 base=vec3(.012,.022,.042)+ledTint*pool*1.4;',
        ' vec2 tile=fract(vWorld.xz*.55);',
        ' float seam=min(min(tile.x,1.-tile.x),min(tile.y,1.-tile.y));',
        ' float grain=(noise(vWorld.xz*340.)-.5)*.004;',
        ' vec3 rgb=(base+grain)*mix(.8,1.,smoothstep(.003,.012,seam));',
        ' float far=1.-exp(-max(vWorld.z-3.,0.)*.14);',
        ' float a=mix(.74,1.,far)*mix(.86,1.,1.-smoothstep(.003,.012,seam));',
        ' gl_FragColor=vec4(mix(rgb,vec3(.008,.016,.03),far),a);',
        '}'
      ].join('\n')
    });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 40), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.005, 6); world.add(floor);

    var sample = document.createElement('canvas'); sample.width = 16; sample.height = 9;
    var sctx = sample.getContext('2d', { willReadFrequently: true });
    var lastSample = 0, width = 1440, height = 900, rect = null;

    function project(v) { var p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * width, y: (-0.5 * p.y + 0.5) * height }; }

    function resize(w, h) {
      width = w; height = h; camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow.matches ? 1.15 : 1.5));
      renderer.setSize(w, h, false);
      var frustum = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 12;
      var pw = Math.min(11.4, frustum * w / h * 0.88);
      var ph = narrow.matches ? Math.max(4.5, frustum * 400 / h) : 4.5;
      var py = Math.max(2.65, ph / 2 + 0.35);
      floorMat.uniforms.panelWidth.value = pw;
      frame.geometry.dispose(); frame.geometry = new THREE.BoxGeometry(pw + 0.08, ph + 0.08, 0.14); frame.position.y = py;
      mirror.geometry.dispose(); mirror.geometry = new THREE.PlaneGeometry(pw, ph); mirror.position.y = -py;
      camera.updateMatrixWorld();
      var tl = project(new THREE.Vector3(-pw / 2, py + ph / 2, -3)), br = project(new THREE.Vector3(pw / 2, py - ph / 2, -3));
      rect = { x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y };
      return rect;
    }

    function render(now) {
      if (video.readyState >= 2 && now - lastSample > 250) {
        try {
          sctx.drawImage(video, 0, 0, 16, 9);
          var px = sctx.getImageData(0, 0, 16, 9).data, r = 0, g = 0, b = 0;
          for (var i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
          var div = px.length / 4 * 255; r /= div; g /= div; b /= div;
          var peak = Math.max(r, g, b, 0.03), lum = r * 0.2126 + g * 0.7152 + b * 0.0722;
          key.color.setRGB(r / peak, g / peak, b / peak); key.intensity = 2.2 + lum * 8;
          rim2.color.copy(key.color); rim2.intensity = 1 + lum * 3;
          floorMat.uniforms.ledTint.value.set(0.018 + r * 0.32, 0.05 + g * 0.45, 0.1 + b * 0.5);
        } catch (e) { /* кадр из другого домена: свет остаётся синим */ }
        lastSample = now;
      }
      renderer.render(world, camera);
    }

    renderer.domElement.addEventListener('webglcontextlost', function () { html.classList.add('scene-off'); });
    return { resize: resize, render: render };
  }

  /* ---------- Прокрутка ---------- */
  function init(track) {
    var stage = track.querySelector('.scene__stage');
    var screen = track.querySelector('[data-screen]');
    var video = screen.querySelector('video');
    var roomBox = track.querySelector('.scene__room');
    var seams = track.querySelector('.screen__seams');
    var facts = track.querySelector('.scene__facts');
    var hint = track.querySelector('.scene__hint');
    var narrow = matchMedia('(max-width: 700px)');
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var room = null, dest = null, w = 0, h = 0, raf = 0, visible = true, dirty = true, lastP = -1;

    if (video) { video.muted = true; play(video); }
    if (!reduced && window.THREE && roomBox) {
      try { room = Room(roomBox, video, narrow); } catch (e) { room = null; if (window.console) console.warn('LED room', e); }
    }
    if (!room) { html.classList.add('scene-off'); return; }
    html.classList.add('scene-on');

    function progress() {
      var span = Math.max(1, track.offsetHeight - stage.offsetHeight);
      return clamp(-track.getBoundingClientRect().top / span);
    }

    function paint(p) {
      var zoom = smooth(0.02, 0.78, p);
      screen.style.left = lerp(0, dest.x, zoom) + 'px';
      screen.style.top = lerp(0, dest.y, zoom) + 'px';
      screen.style.width = lerp(w, dest.width, zoom) + 'px';
      screen.style.height = lerp(h, dest.height, zoom) + 'px';
      screen.style.setProperty('--type-scale', String(lerp(1, narrow.matches ? 0.64 : 0.6, zoom)));
      screen.style.setProperty('--copy-large', String(1 - zoom));
      screen.style.setProperty('--title-y', lerp(19, 12, zoom) + '%');
      /* «Монтаж»: пока экран едет к стене, проступают стыки кабинетов, после установки гаснут */
      if (seams) seams.style.opacity = String(smooth(0.18, 0.5, p) * (1 - smooth(0.8, 0.94, p)));
      roomBox.style.opacity = String(zoom);
      if (facts) { var f = smooth(0.84, 0.97, p); facts.style.opacity = String(f); facts.style.transform = 'translateY(' + lerp(18, 0, f) + 'px)'; facts.style.visibility = f > 0.01 ? 'visible' : 'hidden'; }
      if (hint) hint.style.opacity = String(1 - smooth(0, 0.08, p));
      track.setAttribute('data-progress', p.toFixed(3));
    }

    function tick(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      var p = progress();
      if (dirty || p !== lastP) { paint(p); lastP = p; dirty = false; }
      if (p > 0) { room.render(now); raf = requestAnimationFrame(tick); }
    }
    function request() { dirty = true; if (!raf) raf = requestAnimationFrame(tick); }
    function resize() { w = stage.clientWidth; h = stage.clientHeight; dest = room.resize(w, h); request(); }

    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (document.hidden) video.pause(); else { play(video); request(); } });
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) { play(video); request(); } else { video.pause(); if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    }, { threshold: 0 }).observe(track);
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(request);
  }

  window.V4Scene = { init: init };
})();
