const decisions = document.getElementById("decisions");
const checks = document.getElementById("checks");
const ceiling = document.getElementById("ceiling");
const instances = document.getElementById("instances");
const reqPerInstance = document.getElementById("reqPerInstance");
const syncInterval = document.getElementById("syncInterval");

function compact(value) {
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    return `${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const n = value / 1_000;
    return `${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)}K`;
  }
  return String(Math.round(value));
}

function update() {
  const decisionsPerSec = Number(decisions.value);
  const checksPerRequest = Number(checks.value);
  const perShardCeiling = Number(ceiling.value);
  const instanceCount = Number(instances.value);
  const perInstanceRate = Number(reqPerInstance.value);
  const syncMs = Number(syncInterval.value);

  document.getElementById("decisionsValue").textContent = compact(decisionsPerSec);
  document.getElementById("checksValue").textContent = checksPerRequest;
  document.getElementById("ceilingValue").textContent = `${compact(perShardCeiling)}/s`;
  document.getElementById("instancesValue").textContent = instanceCount;
  document.getElementById("reqPerInstanceValue").textContent = compact(perInstanceRate);
  document.getElementById("syncIntervalValue").textContent = `${syncMs}ms`;

  const totalCounterOps = decisionsPerSec * checksPerRequest;
  const shardCount = Math.ceil(totalCounterOps / perShardCeiling);
  const syncSeconds = syncMs / 1000;
  const overAllowance = instanceCount * perInstanceRate * syncSeconds;

  document.getElementById("shardCount").textContent = shardCount;
  document.getElementById("shardFormula").textContent = `${compact(totalCounterOps)} ops/s ÷ ${compact(perShardCeiling)}`;
  document.getElementById("overAllowance").textContent = compact(overAllowance);
  document.getElementById("formula").textContent = `over-allow = ${instanceCount} × ${compact(perInstanceRate)}/s × ${syncSeconds.toFixed(2)}s = ${compact(overAllowance)}`;
}

[decisions, checks, ceiling, instances, reqPerInstance, syncInterval].forEach(input => {
  input.addEventListener("input", update);
});

update();
