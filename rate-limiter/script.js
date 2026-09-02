let algorithm = "fixed";
let timer = null;
let time = 0;
let allowed = 0;
let denied = 0;
let requestAccumulator = 0;

const limitInput = document.getElementById("limit");
const windowInput = document.getElementById("window");
const rateInput = document.getElementById("rate");
const metricLabel = document.getElementById("metricLabel");
const progressBar = document.getElementById("progressBar");
const playButton = document.getElementById("playButton");

let fixedCount = 0;
let fixedWindowIndex = 0;
let slidingCurrentCount = 0;
let slidingPreviousCount = 0;
let slidingWindowIndex = 0;
let slidingLog = [];
let tokens = 0;
let lastTokenUpdate = 0;
let leakyLevel = 0;
let lastLeakUpdate = 0;

limitInput.addEventListener("input", () => { updateControls(); resetAlgorithmState(); updateMetric(); });
windowInput.addEventListener("input", () => { updateControls(); resetAlgorithmState(); updateMetric(); });
rateInput.addEventListener("input", updateControls);

function updateControls() {
  document.getElementById("limitValue").textContent = limitInput.value;
  document.getElementById("windowValue").textContent = windowInput.value + "s";
  document.getElementById("rateValue").textContent = rateInput.value + "/s";
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    algorithm = button.dataset.algorithm;
    reset();
  });
});

playButton.addEventListener("click", play);
document.getElementById("resetButton").addEventListener("click", reset);

function play() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    playButton.innerHTML = "▷&nbsp; Play";
    return;
  }
  const stream = document.getElementById("stream");
  if (stream.querySelector(".placeholder")) stream.innerHTML = "";
  timer = setInterval(tick, 100);
  playButton.innerHTML = "■&nbsp; Stop";
}

function reset() {
  clearInterval(timer);
  timer = null;
  playButton.innerHTML = "▷&nbsp; Play";
  time = 0;
  allowed = 0;
  denied = 0;
  requestAccumulator = 0;
  resetAlgorithmState();
  document.getElementById("allowed").textContent = "0";
  document.getElementById("denied").textContent = "0";
  document.getElementById("time").textContent = "0.0";
  document.getElementById("stream").innerHTML = '<span class="placeholder">press play...</span>';
  updateMetric();
}

function resetAlgorithmState() {
  const limit = Number(limitInput.value);
  fixedCount = 0;
  fixedWindowIndex = 0;
  slidingCurrentCount = 0;
  slidingPreviousCount = 0;
  slidingWindowIndex = 0;
  slidingLog = [];
  tokens = limit;
  lastTokenUpdate = time;
  leakyLevel = 0;
  lastLeakUpdate = time;
}

function tick() {
  const dt = 0.1;
  time += dt;
  const arrivalRate = Number(rateInput.value);
  requestAccumulator += arrivalRate * dt;
  while (requestAccumulator >= 1) {
    requestAccumulator -= 1;
    const ok = processRequest();
    ok ? allowed++ : denied++;
    addRequestDot(ok);
  }
  document.getElementById("allowed").textContent = allowed;
  document.getElementById("denied").textContent = denied;
  document.getElementById("time").textContent = time.toFixed(1);
  updateMetric();
}

function processRequest() {
  if (algorithm === "fixed") return fixedWindowRequest();
  if (algorithm === "sliding") return slidingCounterRequest();
  if (algorithm === "log") return slidingLogRequest();
  if (algorithm === "token") return tokenBucketRequest();
  if (algorithm === "leaky") return leakyBucketRequest();
  return true;
}

function fixedWindowRequest() {
  const limit = Number(limitInput.value);
  const windowLength = Number(windowInput.value);
  const currentIndex = Math.floor(time / windowLength);
  if (currentIndex !== fixedWindowIndex) {
    fixedWindowIndex = currentIndex;
    fixedCount = 0;
  }
  if (fixedCount < limit) {
    fixedCount++;
    return true;
  }
  return false;
}

function slidingCounterRequest() {
  const limit = Number(limitInput.value);
  const windowLength = Number(windowInput.value);
  const currentIndex = Math.floor(time / windowLength);
  if (currentIndex !== slidingWindowIndex) {
    const jump = currentIndex - slidingWindowIndex;
    slidingPreviousCount = jump === 1 ? slidingCurrentCount : 0;
    slidingCurrentCount = 0;
    slidingWindowIndex = currentIndex;
  }
  const elapsed = time % windowLength;
  const previousWeight = 1 - elapsed / windowLength;
  const estimatedCount = slidingPreviousCount * previousWeight + slidingCurrentCount;
  if (estimatedCount < limit) {
    slidingCurrentCount++;
    return true;
  }
  return false;
}

function slidingLogRequest() {
  const limit = Number(limitInput.value);
  const windowLength = Number(windowInput.value);
  const cutoff = time - windowLength;
  while (slidingLog.length && slidingLog[0] <= cutoff) slidingLog.shift();
  if (slidingLog.length < limit) {
    slidingLog.push(time);
    return true;
  }
  return false;
}

function tokenBucketRequest() {
  const capacity = Number(limitInput.value);
  const windowLength = Number(windowInput.value);
  const refillRate = capacity / windowLength;
  refillTokens(capacity, refillRate);
  if (tokens >= 1) {
    tokens -= 1;
    return true;
  }
  return false;
}

function refillTokens(capacity, refillRate) {
  const elapsed = time - lastTokenUpdate;
  tokens = Math.min(capacity, tokens + elapsed * refillRate);
  lastTokenUpdate = time;
}

function leakyBucketRequest() {
  const capacity = Number(limitInput.value);
  const windowLength = Number(windowInput.value);
  const leakRate = capacity / windowLength;
  leakBucket(leakRate);
  if (leakyLevel + 1 <= capacity) {
    leakyLevel += 1;
    return true;
  }
  return false;
}

function leakBucket(leakRate) {
  const elapsed = time - lastLeakUpdate;
  leakyLevel = Math.max(0, leakyLevel - elapsed * leakRate);
  lastLeakUpdate = time;
}

function addRequestDot(ok) {
  const stream = document.getElementById("stream");
  const dot = document.createElement("span");
  dot.className = "request-dot " + (ok ? "allowed" : "denied");
  stream.appendChild(dot);
  while (stream.children.length > 80) stream.removeChild(stream.firstChild);
}

function updateMetric() {
  const limit = Number(limitInput.value);
  if (algorithm === "fixed") {
    showProgress(fixedCount, limit, `window count ${fixedCount} / ${limit}`);
  } else if (algorithm === "sliding") {
    const windowLength = Number(windowInput.value);
    const elapsed = time % windowLength;
    const previousWeight = 1 - elapsed / windowLength;
    const estimate = slidingPreviousCount * previousWeight + slidingCurrentCount;
    showProgress(estimate, limit, `estimated count ${estimate.toFixed(1)} / ${limit}`);
  } else if (algorithm === "log") {
    const cutoff = time - Number(windowInput.value);
    while (slidingLog.length && slidingLog[0] <= cutoff) slidingLog.shift();
    showProgress(slidingLog.length, limit, `requests in window ${slidingLog.length} / ${limit}`);
  } else if (algorithm === "token") {
    const refillRate = limit / Number(windowInput.value);
    refillTokens(limit, refillRate);
    showProgress(tokens, limit, `tokens available ${tokens.toFixed(1)} / ${limit}`, true);
  } else if (algorithm === "leaky") {
    const leakRate = limit / Number(windowInput.value);
    leakBucket(leakRate);
    showProgress(leakyLevel, limit, `bucket level ${leakyLevel.toFixed(1)} / ${limit}`);
  }
}

function showProgress(value, max, label, reverse = false) {
  metricLabel.textContent = label;
  let percent = max === 0 ? 0 : (value / max) * 100;
  percent = Math.max(0, Math.min(100, percent));
  progressBar.style.width = percent + "%";
  progressBar.classList.toggle("full", reverse ? value < 1 : value >= max);
}

updateControls();
reset();
