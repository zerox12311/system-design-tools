const slider = document.getElementById('bitrate');
const scene = document.getElementById('scene');
const ctx = scene.getContext('2d');
const source = document.createElement('canvas');
source.width = 960;
source.height = 540;
const brush = source.getContext('2d');
// A fixed reference scene: only the pixel sampling changes with bitrate.
brush.fillStyle = '#77a9dc';
brush.fillRect(0, 0, 960, 540);
brush.fillStyle = '#ffd338';
brush.beginPath(); brush.arc(745, 138, 68, 0, Math.PI * 2); brush.fill();
function hill(points, color) {
  brush.fillStyle = color; brush.beginPath();
  points.forEach(([x, y], i) => i ? brush.lineTo(x, y) : brush.moveTo(x, y));
  brush.closePath(); brush.fill();
}
hill([[0, 330], [305, 205], [580, 330]], '#2f8350');
hill([[400, 330], [710, 196], [960, 330]], '#286e43');
brush.fillStyle = '#50616e'; brush.fillRect(0, 330, 960, 210);
brush.fillStyle = '#93a2ab'; brush.fillRect(114, 366, 101, 106); brush.fillRect(480, 378, 121, 84);
brush.fillStyle = '#e4edf3'; brush.fillRect(122, 374, 85, 90); brush.fillRect(488, 386, 105, 68);
const sampled = document.createElement('canvas');
const sampler = sampled.getContext('2d');

function usageFor(rate) {
  if (rate < 0.8) return '240p／低速行動網路';
  if (rate < 1.5) return '480p／3G';
  if (rate < 3) return '720p／4G';
  if (rate < 5) return '1080p／寬頻網路';
  return '4K／光纖網路';
}

function render() {
  const rate = Number(slider.value);
  document.getElementById('rate').textContent = `${rate.toFixed(1)} Mbps`;
  document.getElementById('size').textContent = `${Math.round(rate * 75)} MB`;
  document.getElementById('usage').textContent = usageFor(rate);
  slider.setAttribute('aria-valuetext', `${rate.toFixed(1)} Mbps`);
  const fraction = (rate - 0.2) / 7.8;
  sampled.width = Math.round(18 + Math.pow(fraction, 1.15) * 942);
  sampled.height = Math.max(10, Math.round(sampled.width * 9 / 16));
  sampler.drawImage(source, 0, 0, sampled.width, sampled.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sampled, 0, 0, scene.width, scene.height);
}
slider.addEventListener('input', render);
render();
