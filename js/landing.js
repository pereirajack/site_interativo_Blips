/* HTML estático; biblioteca e GLB carregados somente mediante interação. */
(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const config = window.CUT120_CONFIG;
  const viewer = q('#product-viewer');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const views = {perspectiva:'25deg 78deg 110%',frente:'0deg 82deg 110%',traseira:'180deg 78deg 110%',lateral:'-90deg 78deg 110%'};
  const details = {
    painel:{title:'Painel touch superior',text:'Ajuste os comandos e a calibração da máquina pelo painel. Ele também permite regular a câmera e acessar as configurações do equipamento.',target:'0.515m 1.073m 0.025m',orbit:'15deg 48deg 0.65m'},
    cabecote:{title:'Cabeçote e câmera CCD',text:'A câmera lê referências impressas na mídia para orientar o corte de contorno. O porta-lâmina faz parte do conjunto de recorte.',target:'0.49m 0.96m 0.052m',orbit:'5deg 75deg 0.55m'},
    tracao:{title:'Tração e condução da mídia',text:'Pinçadores, roldanas e trilhos trabalham na movimentação da mídia. A largura máxima de alimentação é de 135 cm, com corte e contorno de até 120 cm.',target:'-0.10m 0.95m 0m',orbit:'0deg 65deg 1.3m'},
    conexoes:{title:'Conexões para o seu fluxo',text:'O equipamento oferece USB, serial e U Disk. Confirme com o especialista o software e a configuração adequados ao seu trabalho.',target:'-0.75m 0.86m 0m',orbit:'-85deg 75deg 0.7m'},
    cesto:{title:'Pedestal e cesto de mídia',text:'O pedestal sustenta a máquina. O cesto organiza a mídia na passagem pelo equipamento; planeje também espaço livre ao redor para operação.',target:'0m 0.43m 0.1m',orbit:'20deg 80deg 1.65m'},
    rolos:{title:'Suporte de rolos',text:'Na parte traseira, o suporte acomoda a mídia em rolo. Veja a disposição dos braços, eixos e pontos de apoio.',target:'0m 0.68m -0.19m',orbit:'175deg 65deg 1.5m'}
  };
  let state = 'idle', selectedDetail = null, libraryPromise = null, loadTimer = null;
  let attempt = 0, active = false, rotationPreference = false, libraryAttempt = 0;
  let hotspotFrame = null;

  all('[data-commercial-link]').forEach(link => link.href = config.commercialUrl);
  all('[data-contact-note]').forEach(note => note.textContent = config.contactNote);
  function announce(message) {q('#viewer-status').textContent = message;}
  function setState(next) {
    state = next;
    q('#viewer-stage').dataset.state = next;
    q('#viewer-stage').setAttribute('aria-busy', String(next === 'loading'));
    q('#viewer-poster').hidden = next === 'ready' || next === 'loading';
    q('#viewer-loading').hidden = next !== 'loading';
    q('#viewer-error').hidden = next !== 'error';
    viewer.hidden = next !== 'ready';
    q('#viewer-tools').hidden = next !== 'ready';
    q('#model-caption').hidden = next !== 'ready';
    if (next === 'loading') announce('Carregando a vista 3D.');
    if (next === 'ready') announce('Vista 3D disponível. Arraste para girar ou use os controles.');
    if (next === 'error') announce('Não foi possível abrir a vista 3D. Tente novamente ou veja a foto.');
  }
  function setRotationPreference(enabled) {
    rotationPreference = enabled;
    q('#auto-rotate').setAttribute('aria-pressed', String(enabled));
    viewer.autoRotate = enabled && active && !document.hidden;
  }
  function camera(target, orbit) {
    viewer.cameraTarget = target;
    viewer.cameraOrbit = orbit;
    viewer.resetTurntableRotation();
    if (reduceMotion.matches) viewer.jumpCameraToGoal();
  }
  function selectDetail(id, move = true) {
    const detail = details[id];
    if (!detail) return;
    selectedDetail = id;
    all('[data-detail]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.detail === id)));
    q('#detail-title').textContent = detail.title;
    q('#detail-text').textContent = detail.text;
    if (state === 'ready' && move) {
      setRotationPreference(false);
      all('[data-view]').forEach(button => button.setAttribute('aria-pressed', 'false'));
      camera(detail.target, detail.orbit);
    }
    updateHotspots();
  }
  function resetView(view = 'perspectiva') {
    selectedDetail = null;
    all('[data-detail]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    q('#detail-title').textContent = 'Uma máquina, vários ângulos.';
    q('#detail-text').textContent = 'Escolha um detalhe para saber como ele participa da sua produção.';
    setRotationPreference(false);
    all('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    camera('0m 0.55m 0m', views[view]);
    announce('Vista ' + (view === 'perspectiva' ? 'em perspectiva' : view) + ' selecionada.');
  }
  function ensureLibrary() {
    if (customElements.get('model-viewer')) return Promise.resolve();
    if (!libraryPromise) {
      const moduleUrl = new URL(config.viewerModule, document.baseURI);
      if (libraryAttempt) moduleUrl.searchParams.set('retry', String(libraryAttempt));
      libraryPromise = import(moduleUrl.href).then(() => customElements.whenDefined('model-viewer')).catch(error => {libraryPromise = null;++libraryAttempt;throw error;});
    }
    return libraryPromise;
  }
  function failLoad() {
    clearTimeout(loadTimer);
    setRotationPreference(false);
    setState('error');
  }
  async function loadModel() {
    if (state === 'ready' || state === 'loading') return;
    if (state === 'error') viewer.removeAttribute('src');
    const currentAttempt = ++attempt;
    const currentDetail = selectedDetail;
    setState('loading');
    q('#viewer-progress').removeAttribute('value');
    loadTimer = setTimeout(failLoad, 45000);
    try {
      await ensureLibrary();
      if (currentAttempt !== attempt) return;
      // Exibir o canvas sob o estado de carregamento mantém o tamanho do WebGL válido.
      viewer.hidden = false;
      const modelUrl = new URL(config.modelUrl, document.baseURI);
      // Uma falha pode ficar no cache de promessas da biblioteca; a nova URL evita reutilizá-la.
      if (currentAttempt > 1) modelUrl.searchParams.set('retry', String(currentAttempt - 1));
      viewer.src = modelUrl.href;
      if (viewer.loaded) handleLoaded(currentDetail);
    } catch { if (currentAttempt === attempt) failLoad(); }
  }
  function handleLoaded(detail = selectedDetail) {
    if (state !== 'loading') return;
    clearTimeout(loadTimer);
    setState('ready');
    viewer.interpolationDecay = reduceMotion.matches ? 0 : 100;
    if (detail) selectDetail(detail);
    else resetView();
    q('#reset-view').focus({preventScroll:true});
  }
  viewer.addEventListener('load', () => handleLoaded());
  viewer.addEventListener('error', () => {if (state === 'loading' || state === 'ready') failLoad();});
  viewer.addEventListener('progress', event => {
    const value = event.detail.totalProgress;
    if (Number.isFinite(value)) q('#viewer-progress').value = value;
  });
  viewer.addEventListener('camera-change', event => {
    updateHotspots();
    if (event.detail.source === 'user-interaction') {
      all('[data-view]').forEach(button => button.setAttribute('aria-pressed','false'));
      setRotationPreference(false);
    }
  });
  function updateHotspots() {
    if (hotspotFrame !== null) return;
    hotspotFrame = requestAnimationFrame(() => {
      hotspotFrame = null;
      if (state !== 'ready') return;
      const frame = viewer.getBoundingClientRect();
      const kept = [];
      const buttons = all('.cut-hotspot').sort((a,b) => Number(b.dataset.detail === selectedDetail) - Number(a.dataset.detail === selectedDetail));
      buttons.forEach(button => {
        const box = button.getBoundingClientRect();
        const center = {x:box.x+box.width/2,y:box.y+box.height/2};
        const outside = box.left < frame.left+8 || box.right > frame.right-8 || box.top < frame.top+8 || box.bottom > frame.bottom-8;
        const overlaps = kept.some(point => Math.hypot(point.x-center.x,point.y-center.y) < 50);
        const visible = !button.hidden && button.hasAttribute('data-visible') && !outside && !overlaps;
        button.dataset.cull = String(!visible);
        button.tabIndex = visible ? 0 : -1;
        if (visible) kept.push(center);
      });
    });
  }
  all('.cut-hotspot').forEach(button => button.addEventListener('hotspot-visibility', updateHotspots));
  new ResizeObserver(updateHotspots).observe(viewer);
  q('#load-model').addEventListener('click', loadModel);
  q('#retry-model').addEventListener('click', loadModel);
  q('#show-photo').addEventListener('click', () => {++attempt;clearTimeout(loadTimer);setState('idle');q('#load-model').focus({preventScroll:true});});
  all('[data-detail]').forEach(button => button.addEventListener('click', () => selectDetail(button.dataset.detail)));
  all('[data-view]').forEach(button => button.addEventListener('click', () => resetView(button.dataset.view)));
  q('#reset-view').addEventListener('click', () => resetView());
  q('#auto-rotate').addEventListener('click', () => setRotationPreference(!rotationPreference));
  q('#toggle-hotspots').addEventListener('click', event => {
    const button = event.currentTarget;
    const visible = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(visible));
    all('.cut-hotspot').forEach(point => point.hidden = !visible);
    updateHotspots();
  });
  function zoom(factor) {
    setRotationPreference(false);
    const orbit = viewer.getCameraOrbit();
    viewer.cameraOrbit = orbit.theta + 'rad ' + orbit.phi + 'rad ' + Math.min(8,Math.max(.4,orbit.radius * factor)) + 'm';
    if (reduceMotion.matches) viewer.jumpCameraToGoal();
    announce(factor < 1 ? 'Vista aproximada.' : 'Vista afastada.');
  }
  q('#zoom-in').addEventListener('click', () => zoom(.82));
  q('#zoom-out').addEventListener('click', () => zoom(1.22));
  reduceMotion.addEventListener('change', () => {
    if (state === 'ready') viewer.interpolationDecay = reduceMotion.matches ? 0 : 100;
    if (reduceMotion.matches) setRotationPreference(false);
  });
  document.addEventListener('visibilitychange', () => viewer.autoRotate = rotationPreference && active && !document.hidden);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {active = entries[0].isIntersecting;viewer.autoRotate = rotationPreference && active && !document.hidden;}, {threshold:.1}).observe(q('#viewer-stage'));
    const sticky = q('.cut-mobile-contact');
    let heroVisible = true, contactVisible = false;
    function updateSticky() {
      const visible = !heroVisible && !contactVisible;
      sticky.classList.toggle('is-visible',visible);
      sticky.inert = !visible;
    }
    sticky.inert = true;
    new IntersectionObserver(entries => {heroVisible = entries[0].isIntersecting;updateSticky();}, {threshold:.1}).observe(q('#inicio'));
    new IntersectionObserver(entries => {contactVisible = entries[0].isIntersecting;updateSticky();}, {threshold:.1}).observe(q('#contato'));
  } else {active = true;q('.cut-mobile-contact').inert = true;}
})();
