const bandwidth = [5, 5, 4.8, 4.5, 3.2, 2, 1.1, 0.9, 1, 1.4, 2.2, 3, 3.8, 4.4, 4.7, 4.9];
const ns = 'http://www.w3.org/2000/svg';
const byId = id => document.getElementById(id);
const x = i => 55 + i * 67;
const y = value => 220 - value * 36;
let step = -1;
let timer = null;
function quality(value) { return value >= 4 ? 1080 : value >= 2.5 ? 720 : value >= 1.2 ? 480 : 240; }
function svgElement(tag, attrs, text) {
  const element = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  if (text !== undefined) element.textContent = text;
  byId('grid').append(element);
}
for (let n = 0; n <= 5; n++) {
  svgElement('line', {x1:55,x2:1060,y1:y(n),y2:y(n),stroke:n===0?'#9aa5b5':'#edf0f5'});
  svgElement('text', {x:39,y:y(n)+5,'text-anchor':'end'}, String(n));
}
svgElement('text', {x:55,y:20}, '可用頻寬（Mbps）');
svgElement('text', {x:1060,y:253,'text-anchor':'end'}, '片段順序 →');
byId('line').setAttribute('points', bandwidth.map((value, i) => `${x(i)},${y(value)}`).join(' '));
function stop() { clearInterval(timer); timer = null; byId('play').textContent = '▷ 播放'; }
function render() {
  byId('segments').replaceChildren();
  bandwidth.forEach((value, i) => {
    const cell = document.createElement('div');
    const q = quality(value);
    cell.className = `segment ${i<=step?`q${q}`:''} ${i===step?'active':''}`;
    cell.innerHTML = `<small>${i+1}</small><strong>${i<=step?`${q}p`:'待選擇'}</strong>`;
    byId('segments').append(cell);
  });
  ['cursor','dot'].forEach(id => byId(id).setAttribute('visibility', step < 0 ? 'hidden' : 'visible'));
  if (step < 0) {
    byId('status').textContent = '按下播放開始';
    byId('decision').textContent = '同一部影片，可以逐段選擇不同畫質。';
    byId('reason').textContent = '播放示範後，觀察頻寬下降時如何降低畫質，以及頻寬恢復後如何提高畫質。';
    return;
  }
  const q = quality(bandwidth[step]);
  byId('cursor').setAttribute('x1', x(step)); byId('cursor').setAttribute('x2', x(step));
  byId('dot').setAttribute('cx', x(step)); byId('dot').setAttribute('cy', y(bandwidth[step]));
  byId('status').textContent = `${step===15?'示範完成 · ':''}片段 ${step+1}：${bandwidth[step].toFixed(1)} Mbps → ${q}p`;
  const previous = step>0 ? quality(bandwidth[step-1]) : q;
  byId('decision').textContent = q<previous ? `降低畫質至 ${q}p` : q>previous ? `提高畫質至 ${q}p` : `選擇 ${q}p 片段`;
  byId('reason').textContent = q<previous ? '頻寬下降，下一個片段改用較低位元率的版本，減少下載負擔。先前已選擇的片段不會改變。' : q>previous ? '頻寬恢復，下一個片段可以改用較高畫質的版本。先前已選擇的片段不會改變。' : '依目前頻寬選擇對應版本；未跨過門檻時，維持相同畫質。';
}
function next() { if(step<15) step++; render(); if(step===15)stop(); }
byId('play').addEventListener('click', () => {
  if(timer){stop();return;}
  if(step===15)step=-1;
  if(step===-1)next();
  timer=setInterval(next,900);byId('play').textContent='Ⅱ 暫停';
});
byId('next').addEventListener('click',()=>{stop();next();});
byId('reset').addEventListener('click',()=>{stop();step=-1;render();});
render();
