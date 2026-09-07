const $=id=>document.getElementById(id);
const sequence=[
  {region:'NA',asset:'影片 A'}, {region:'EU',asset:'影片 A'}, {region:'APAC',asset:'影片 A'},
  {region:'NA',asset:'影片 A'}, {region:'EU',asset:'影片 A'}, {region:'APAC',asset:'影片 B'},
  {region:'NA',asset:'影片 B'}, {region:'EU',asset:'影片 B'}, {region:'APAC',asset:'影片 B'},
  {region:'NA',asset:'影片 A'}, {region:'EU',asset:'影片 A'}, {region:'APAC',asset:'影片 A'}
];
let timer=null,step=0,requests=0,originReads=0,hits=0;
const edgeCaches={NA:new Set(),EU:new Set(),APAC:new Set()},shieldCache=new Set();
function clearHighlights(){document.querySelectorAll('.active,.hit,.miss').forEach(node=>node.classList.remove('active','hit','miss'))}
function update(){for(const region of Object.keys(edgeCaches)){const node=document.querySelector(`[data-region="${region}"]`);node.querySelector('b').textContent=edgeCaches[region].size}$('shield').querySelector('span').textContent=`快取：${shieldCache.size}`;$('requests').textContent=requests;$('originReads').textContent=originReads;$('hitRate').textContent=`${requests?Math.round(hits/requests*100):0}%`;$('progressFill').style.width=`${step/sequence.length*100}%`}
function processRequest(){if(step>=sequence.length){stop('模擬完成：快取已逐步升溫。');return}clearHighlights();const item=sequence[step++],edge=document.querySelector(`[data-region="${item.region}"]`);requests++;edge.classList.add('active');if(edgeCaches[item.region].has(item.asset)){hits++;edge.classList.add('hit');edge.querySelector('p').textContent=`${item.asset}：Edge Cache 命中`;setStatus(`${item.region} 的請求由 Edge Cache 回應。`)}else if(shieldCache.has(item.asset)){hits++;shieldCache.add(item.asset);edgeCaches[item.region].add(item.asset);$('shield').classList.add('hit');edge.classList.add('hit');edge.querySelector('p').textContent=`${item.asset}：由 Origin Shield 填入`;setStatus(`${item.region} 未命中，但 Origin Shield 已有 ${item.asset}。`)}else{originReads++;shieldCache.add(item.asset);edgeCaches[item.region].add(item.asset);$('shield').classList.add('active');$('storage').classList.add('active');edge.classList.add('miss');edge.querySelector('p').textContent=`${item.asset}：回源並寫入快取`;setStatus(`${item.region} 與 Shield 都未命中，從 Origin Storage 讀取 ${item.asset}。`)}update()}
function setStatus(text){$('status').textContent=text}
function stop(text){clearInterval(timer);timer=null;$('play').innerHTML='<span class="play-icon">▷</span><span>播放</span>';setStatus(text)}
function play(){if(timer){stop('模擬已暫停。');return}$('play').innerHTML='<span class="play-icon">Ⅱ</span><span>暫停</span>';processRequest();timer=setInterval(processRequest,1250)}
function restart(){clearInterval(timer);timer=null;step=requests=originReads=hits=0;Object.values(edgeCaches).forEach(cache=>cache.clear());shieldCache.clear();clearHighlights();document.querySelectorAll('.edge p').forEach(node=>node.textContent='等待請求');$('play').innerHTML='<span class="play-icon">▷</span><span>播放</span>';setStatus('請按播放，所有快取目前都是空的。');update()}
$('play').addEventListener('click',play);$('restart').addEventListener('click',restart);update();
