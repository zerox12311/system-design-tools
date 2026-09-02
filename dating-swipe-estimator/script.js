const dau = document.getElementById('dau');
const swipes = document.getElementById('swipes');
const peak = document.getElementById('peak');
const bytes = document.getElementById('bytes');

const fmtCompact = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 1 : 1) + 'B';
  if (n >= 1e6) {
    const v = n / 1e6;
    return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)) + 'M';
  }
  if (n >= 1e3) {
    const v = n / 1e3;
    if (v >= 1000) return (v / 1000).toFixed(1) + 'M';
    return Math.round(v) + 'K';
  }
  return Math.round(n).toString();
};

const fmtRate = (n) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M/s';
  if (n >= 1e3) return Math.round(n / 1e3) + 'K/s';
  return Math.round(n) + '/s';
};

function update() {
  const dauN = Number(dau.value);
  const swipesN = Number(swipes.value);
  const peakN = Number(peak.value);
  const bytesN = Number(bytes.value);

  const swipesPerDay = dauN * swipesN;
  const avgWrites = swipesPerDay / 86400;
  const peakWrites = avgWrites * peakN;
  const storageGB = (swipesPerDay * bytesN) / 1e9;

  document.getElementById('dauValue').textContent = fmtCompact(dauN);
  document.getElementById('swipesValue').textContent = swipesN;
  document.getElementById('peakValue').textContent = peakN + '×';
  document.getElementById('bytesValue').textContent = bytesN + 'B';

  document.getElementById('swipesPerDay').textContent = (swipesPerDay / 1e9).toFixed(1) + 'B';
  document.getElementById('swipesFormula').textContent = `${fmtCompact(dauN)} × ${swipesN}`;
  document.getElementById('avgWrites').textContent = fmtRate(avgWrites);
  document.getElementById('peakWrites').textContent = fmtRate(peakWrites);
  document.getElementById('peakFormula').textContent = `${peakN}× average`;
  document.getElementById('storage').textContent = `${Math.round(storageGB)} GB`;
  document.getElementById('storageFormula').textContent = `${(swipesPerDay / 1e9).toFixed(1)}B × ${bytesN}B`;

  document.getElementById('formula').textContent = `writes = ${fmtCompact(dauN)} × ${swipesN} ÷ 86,400s ≈ ${fmtRate(avgWrites)} average, ${fmtRate(peakWrites)} at peak`;

  const verdict = document.getElementById('verdict');
  const title = document.getElementById('verdictTitle');
  const text = document.getElementById('verdictText');

  verdict.classList.remove('verdict-single', 'verdict-sharded', 'verdict-extreme');

  if (peakWrites < 10000) {
    verdict.classList.add('verdict-single');
    title.textContent = 'Single Database Node';
    text.textContent = '寫入量可以由單一針對 Write 最佳化的 Database Instance 舒適承擔。';
  } else if (peakWrites <= 100000) {
    verdict.classList.add('verdict-sharded');
    title.textContent = 'Horizontal Database Sharding';
    text.textContent = '寫入負載已超過單一 Node 適合承擔的 Transactional Capacity。Swipe 必須水平分片（例如依 swiper_id）來分散寫入。';
  } else {
    verdict.classList.add('verdict-extreme');
    title.textContent = 'Extreme Scale Architecture';
    text.textContent = '尖峰寫入超過 100K/s。需要 Sharded Database、Append-only Log（Kafka）與 Precomputed Candidate Queue，以保護資料庫層。';
  }
}

[dau, swipes, peak, bytes].forEach(el => el.addEventListener('input', update));
update();
