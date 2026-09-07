const $=id=>document.getElementById(id);const fields=['watch','bitrate','upload','storageBitrate'];
function fixed(n,digits=1){return n.toLocaleString('en-US',{maximumFractionDigits:digits,minimumFractionDigits:digits})}
function perDay(bytes,digits=1){return `${fixed(bytes/1e15,digits)} PB/天`}
function perMonth(bytes){const pb=bytes/1e15;return pb>=1000?`${fixed(pb/1000)} EB/月`:`${fixed(pb)} PB/月`}
function render(){const watch=Number($('watch').value)*1e9,bitrate=Number($('bitrate').value),upload=Number($('upload').value),storageBitrate=Number($('storageBitrate').value);$('watchOut').textContent=`${fixed(watch/1e9)}B 小時`;$('bitrateOut').textContent=`${fixed(bitrate)} Mbps`;$('uploadOut').textContent=`${fixed(upload,0)} 小時`;$('storageBitrateOut').textContent=`${fixed(storageBitrate,2)} Mbps`;
// Mbps × 1e6 ÷ 8 produces bytes/sec. Upload hours/min is converted to video seconds/sec.
const storedRate=upload*60*storageBitrate*1e6/8;const storedDay=storedRate*86400;const egressDay=watch*3600*bitrate*1e6/8;const ratio=egressDay/storedDay;$('storedRate').textContent=`${fixed(storedRate/1e9)} GB/秒`;$('storedDay').textContent=perDay(storedDay,2);$('egressDay').textContent=perDay(egressDay);$('egressMonth').textContent=perMonth(egressDay*30);$('formula').textContent=`每日傳出 = ${fixed(watch/1e9)}e9 觀看小時 × 3,600 秒 × ${fixed(bitrate)} Mbps ÷ 8 = ${perDay(egressDay)}`;$('conclusion').innerHTML=`每天的資料傳出量約是儲存新增量的 <strong>${fixed(ratio,0)}×</strong>，而且每次觀看都會再次發生。`}
fields.forEach(id=>$(id).addEventListener('input',render));render();
