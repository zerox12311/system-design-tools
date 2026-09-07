const frames = document.getElementById('frames');
const play = document.getElementById('play');
let mode = 'delta';
let step = 0;
let timer = null;
function costs() { return Array.from({length: 6}, (_, i) => mode === 'full' || i === 0 ? 10 : 2); }
function stop() { clearInterval(timer); timer = null; play.textContent = '▶ 播放示範'; }
function render(animate = false) {
  frames.replaceChildren();
  costs().forEach((cost, i) => {
    const delta = mode === 'delta' && i > 0;
    const cell = document.createElement('article');
    cell.className = `cell ${delta ? 'delta' : 'key'} ${i === step ? 'active' : ''} ${animate ? 'animate' : ''}`;
    cell.style.setProperty('--position', i / 5);
    cell.style.setProperty('--previous', Math.max(0, i - 1) / 5);
    cell.style.setProperty('--cost', cost);
    cell.innerHTML = `<div class="frame"><div class="picture" aria-hidden="true"><span class="change"></span><span class="ball"></span></div><div class="label">${i + 1} · ${delta ? '差異影格' : mode === 'full' ? '完整影格' : 'I-frame'}</div></div><div class="bar-area" aria-label="資料量 ${cost} 單位"><span>${cost}</span><div class="bar"></div></div>`;
    frames.append(cell);
  });
  const total = costs().reduce((a, b) => a + b, 0);
  document.getElementById('total').textContent = `六格總資料量：${total} 單位`;
  document.getElementById('saving').textContent = mode === 'delta' ? '比全部存完整畫面減少約 67%（示意）' : '每一格都是 10 單位';
  document.getElementById('stepTitle').textContent = `第 ${step + 1} 格：${mode === 'full' || step === 0 ? '儲存完整畫面' : '利用前一格重建畫面'}`;
  document.getElementById('caption').textContent = mode === 'full'
    ? '即使只有圓點的位置改變，這個模式仍為每一格儲存完整畫面，因此每格都需要 10 單位。'
    : step === 0 ? '先儲存一張完整的關鍵影格（I-frame），作為後續影格的參考：10 單位。'
    : '圓點向右移動，橘框標出原位置與新位置之間的變化範圍。利用前一格加上變化資訊重建這一格，示意資料量只需 2 單位。';
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
}
function next() { if (step === 5) { stop(); step = 0; } else step++; render(true); if (step === 5) stop(); }
play.addEventListener('click', () => {
  if (timer) { stop(); return; }
  if (step === 5) { step = 0; render(); }
  play.textContent = 'Ⅱ 暫停'; timer = setInterval(next, 1600);
});
document.getElementById('next').addEventListener('click', () => { stop(); next(); });
document.getElementById('reset').addEventListener('click', () => { stop(); step = 0; render(); });
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { stop(); mode = button.dataset.mode; render(); }));
render();
