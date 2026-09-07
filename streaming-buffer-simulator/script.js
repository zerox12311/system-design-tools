const TOTAL_SEGMENTS = 20;
const STARTUP_BUFFER = 2;
const MAX_BUFFER_AHEAD = 5;
const BEFORE_MANIFEST_MS = 300;
const MANIFEST_DELAY_MS = 700;
const PLAYBACK_RATE = 1.6;
// Scripted network conditions, measured in active download time.
const NETWORK_STAGES = [
  { until: 2, level: 'High', rate: 5, fill: 100 },
  { until: 6, level: 'Low', rate: 0.5, fill: 16 },
  { until: 7.2, level: 'Medium', rate: 2.2, fill: 50 },
  { until: Infinity, level: 'High', rate: 4.4, fill: 88 }
];

const elements = {
  playButton: document.getElementById('playButton'),
  playIcon: document.getElementById('playIcon'),
  playLabel: document.getElementById('playLabel'),
  restartButton: document.getElementById('restartButton'),
  status: document.getElementById('status'),
  manifest: document.getElementById('manifest'),
  manifestState: document.getElementById('manifestState'),
  segments: document.getElementById('segments'),
  playhead: document.getElementById('playhead'),
  bufferValue: document.getElementById('bufferValue'),
  networkSpeed: document.getElementById('networkSpeed')
};

const state = {
  phase: 'idle',
  manifestRead: false,
  position: 0,
  downloaded: 0,
  networkTime: 0,
  requestedPlayback: false,
  lastTime: null,
  frame: null,
  manifestTimer: null
};

for (let i = 0; i < TOTAL_SEGMENTS; i += 1) {
  const segment = document.createElement('span');
  segment.className = 'segment';
  segment.setAttribute('aria-hidden', 'true');
  elements.segments.append(segment);
}

const segmentElements = [...elements.segments.children];

function bufferAhead() {
  return Math.max(0, state.downloaded - state.position);
}

function networkStage() {
  return NETWORK_STAGES.find(stage => state.networkTime < stage.until);
}

function networkRate() {
  return networkStage().rate;
}

function setPhase(phase) {
  state.phase = phase;
  elements.status.textContent = {
    idle: 'Idle',
    reading: 'Reading Manifest',
    playing: 'Playing',
    buffering: 'Buffering…',
    paused: 'Paused',
    ended: 'Done'
  }[phase];
  elements.status.className = `status ${phase}`;
}

function updateControls() {
  const running = state.requestedPlayback && state.phase !== 'ended';
  elements.playLabel.textContent = running ? 'Pause' : 'Play';
  elements.playIcon.textContent = running ? 'Ⅱ' : '▷';
  elements.playButton.setAttribute('aria-pressed', String(running));
}

function render() {
  const buffer = bufferAhead();
  const percent = Math.min(100, (state.position / TOTAL_SEGMENTS) * 100);
  const network = networkStage();
  const fill = `${network.fill}%`;

  elements.manifest.classList.toggle('reading', state.phase === 'reading');
  elements.manifest.classList.toggle('done', state.manifestRead);
  elements.manifestState.textContent = state.phase === 'reading' ? 'reading…' : state.manifestRead ? 'read ✓' : '';
  elements.playhead.style.left = `${percent}%`;
  elements.bufferValue.value = `${buffer.toFixed(1)} segments`;
  elements.bufferValue.textContent = `${buffer.toFixed(1)} segments`;
  elements.bufferValue.classList.toggle('low', buffer < 1);
  elements.networkSpeed.style.setProperty('--fill', fill);
  elements.networkSpeed.classList.toggle('slow', networkRate() < PLAYBACK_RATE);
  elements.networkSpeed.setAttribute('aria-valuenow', String(network.fill));
  elements.networkSpeed.setAttribute('aria-valuetext', network.level);

  segmentElements.forEach((segment, index) => {
    const finalSegment = state.phase === 'ended' && index === TOTAL_SEGMENTS - 1;
    segment.classList.toggle('played', index < Math.floor(state.position) && !finalSegment);
    segment.classList.toggle('buffered', finalSegment || (index >= Math.floor(state.position) && index < Math.ceil(state.downloaded)));
  });

  updateControls();
}

function beginManifestRead() {
  state.requestedPlayback = true;
  setPhase('buffering');
  render();
  state.manifestTimer = window.setTimeout(() => {
    if (!state.requestedPlayback) return;
    setPhase('reading');
    render();
    state.manifestTimer = window.setTimeout(() => {
      if (!state.requestedPlayback) return;
      state.manifestRead = true;
      setPhase('buffering');
      state.lastTime = performance.now();
      state.frame = requestAnimationFrame(tick);
      render();
    }, MANIFEST_DELAY_MS);
  }, BEFORE_MANIFEST_MS);
}

function tick(time) {
  if (!state.requestedPlayback || !state.manifestRead) return;

  const elapsed = Math.min((time - state.lastTime) / 1000, 0.1);
  state.lastTime = time;
  const downloadLimit = Math.min(TOTAL_SEGMENTS, state.position + MAX_BUFFER_AHEAD);
  state.downloaded = Math.min(downloadLimit, state.downloaded + networkRate() * elapsed);
  state.networkTime += elapsed;

  if (state.phase === 'buffering' && bufferAhead() >= STARTUP_BUFFER) setPhase('playing');

  if (state.phase === 'playing') {
    const playable = Math.min(PLAYBACK_RATE * elapsed, bufferAhead());
    state.position = Math.min(TOTAL_SEGMENTS, state.position + playable);
    if (bufferAhead() <= 0.001 && state.downloaded < TOTAL_SEGMENTS) setPhase('buffering');
  }

  if (state.position >= TOTAL_SEGMENTS) {
    state.position = TOTAL_SEGMENTS;
    state.requestedPlayback = false;
    setPhase('ended');
    render();
    return;
  }

  render();
  state.frame = requestAnimationFrame(tick);
}

function pause() {
  state.requestedPlayback = false;
  window.clearTimeout(state.manifestTimer);
  cancelAnimationFrame(state.frame);
  state.lastTime = null;
  setPhase(state.manifestRead ? 'paused' : 'idle');
  render();
}

function restart() {
  window.clearTimeout(state.manifestTimer);
  cancelAnimationFrame(state.frame);
  Object.assign(state, {
    phase: 'idle',
    manifestRead: false,
    position: 0,
    downloaded: 0,
    networkTime: 0,
    requestedPlayback: false,
    lastTime: null,
    frame: null,
    manifestTimer: null
  });
  setPhase('idle');
  render();
}

elements.playButton.addEventListener('click', () => {
  if (state.requestedPlayback) {
    pause();
    return;
  }

  if (state.phase === 'ended') restart();
  if (!state.manifestRead) {
    beginManifestRead();
    return;
  }

  state.requestedPlayback = true;
  setPhase(bufferAhead() > 0 ? 'playing' : 'buffering');
  state.lastTime = performance.now();
  state.frame = requestAnimationFrame(tick);
  render();
});

elements.restartButton.addEventListener('click', restart);

render();
