const searches = document.getElementById('searches');
const calls = document.getElementById('calls');
const queries = document.getElementById('queries');
const bytesPerNode = document.getElementById('bytesPerNode');

const searchesValue = document.getElementById('searchesValue');
const callsValue = document.getElementById('callsValue');
const queriesValue = document.getElementById('queriesValue');
const bytesPerNodeValue = document.getElementById('bytesPerNodeValue');
const suggestQps = document.getElementById('suggestQps');
const suggestFormula = document.getElementById('suggestFormula');
const ramSize = document.getElementById('ramSize');
const ramFormula = document.getElementById('ramFormula');
const formula = document.getElementById('formula');

function formatCompact(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K';
  return String(n);
}

function formatGB(bytes) {
  const gb = bytes / 1_000_000_000;
  return (gb >= 10 ? gb.toFixed(0) : gb.toFixed(1).replace(/\.0$/, '')) + ' GB';
}

function update() {
  const s = Number(searches.value);
  const c = Number(calls.value);
  const q = Number(queries.value);
  const b = Number(bytesPerNode.value);

  const qps = s * c;
  const ramBytes = q * b;

  searchesValue.textContent = formatCompact(s);
  callsValue.textContent = c;
  queriesValue.textContent = formatCompact(q);
  bytesPerNodeValue.textContent = b + 'B';

  suggestQps.textContent = formatCompact(qps) + '/s';
  suggestFormula.textContent = `${formatCompact(s)} searches × ${c} calls`;

  ramSize.textContent = formatGB(ramBytes);
  ramFormula.textContent = `${formatCompact(q)} nodes × ${b}B`;

  formula.textContent = `suggest QPS = ${formatCompact(s)} searches/s × ${c} debounced calls = ${formatCompact(qps)}/s`;
}

[searches, calls, queries, bytesPerNode].forEach(input => input.addEventListener('input', update));
update();
