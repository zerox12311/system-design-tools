const scenarios = {
  sequential: [
    {
      title: 't0 - 還沒有事情發生',
      shardA: 'A:（尚無 Row）',
      shardB: 'B → A: like（已存在）',
      active: [],
      result: '尚未形成 Match',
      caption: 'Bob 先前已經 Like Alice，這筆 Row 正在 shard(B) 等待被查到。'
    },
    {
      title: 't1 - Alice 對 Bob 按 Like',
      shardA: 'A → B: like（written）',
      shardB: 'B → A: like（已存在）',
      active: ['A', 'B'],
      result: '尚未形成 Match',
      caption: '這次寫入落在 shard(A)，Key 是 (swiper=A, swipee=B)。這是一個便宜的 local append。'
    },
    {
      title: 't2 - Reverse lookup 讀取',
      shardA: 'A → B: like（written）',
      shardB: 'B → A: like - read: HIT',
      active: ['A', 'B'],
      result: '尚未形成 Match',
      caption: 'Alice 的 Swipe Service 對 shard(B) 做一次 point read，查詢 (swiper=B, swipee=A)，並命中。'
    },
    {
      title: 't3 - Match 被建立',
      shardA: 'A → B: like（written）',
      shardB: 'B → A: like（written）',
      active: ['A', 'B'],
      result: '建立 1 筆 Match Row',
      success: true,
      caption: 'match_id = hash(min(A,B), max(A,B))。insert-if-absent 只會建立剛好一筆 Match Row，然後通知雙方。'
    }
  ],
  simultaneous: [
    {
      title: 't0 - 還沒有事情發生',
      shardA: 'A:（尚無 Row）',
      shardB: 'B:（尚無 Row）',
      active: [],
      result: '尚未形成 Match',
      caption: '雙方都還沒有 Like 對方。'
    },
    {
      title: 't1 - 雙方在同一瞬間 Like',
      shardA: 'A → B: like（written）',
      shardB: 'B → A: like（written）',
      active: ['A', 'B'],
      result: '尚未形成 Match',
      caption: 'Alice Like Bob、Bob Like Alice 發生在同一個時間窗。每次寫入會先落在自己的 shard。'
    },
    {
      title: 't2 - 雙方都執行 Reverse lookup',
      shardA: 'A → B: like - read: HIT',
      shardB: 'B → A: like - read: HIT',
      active: ['A', 'B'],
      result: '尚未形成 Match',
      caption: 'Alice 讀 shard(B) 命中；Bob 讀 shard(A) 也命中。兩邊現在都認為自己找到了 Mutual Like。'
    },
    {
      title: 't3 - 雙方都嘗試建立 Match',
      shardA: 'insert-if-absent(match_id)',
      shardB: 'insert-if-absent(match_id)',
      active: ['A', 'B'],
      result: '建立 1 筆 Match Row - 一次 insert 成功，另一次 no-op',
      success: true,
      caption: '雙方計算出相同的 deterministic match_id = hash(min(A,B), max(A,B))。同一個 Key 只允許一次 insert；另一邊會變成 no-op。'
    }
  ]
};

let scenarioName = 'sequential';
let step = 0;
let timer = null;

const tabs = [...document.querySelectorAll('.tab')];
const dots = [...document.querySelectorAll('.dot')];
const playButton = document.getElementById('play');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const stepButton = document.getElementById('step');
const resetButton = document.getElementById('reset');
const progress = document.getElementById('progress');
const stepTitle = document.getElementById('stepTitle');
const shardA = document.getElementById('shardA');
const shardB = document.getElementById('shardB');
const result = document.getElementById('result');
const caption = document.getElementById('caption');

function stopPlayback() {
  window.clearInterval(timer);
  timer = null;
  playIcon.textContent = '▶';
  playText.textContent = '播放';
}

function render() {
  const states = scenarios[scenarioName];
  const state = states[step];
  const percent = (step / (states.length - 1)) * 100;

  stepTitle.textContent = state.title;
  shardA.querySelector('pre').textContent = state.shardA;
  shardB.querySelector('pre').textContent = state.shardB;
  caption.textContent = state.caption;
  result.querySelector('strong').textContent = state.result;

  shardA.classList.toggle('active', state.active.includes('A'));
  shardB.classList.toggle('active', state.active.includes('B'));
  result.classList.toggle('success', Boolean(state.success));
  result.classList.toggle('neutral', !state.success);
  progress.style.width = `${percent}%`;
  progress.classList.toggle('complete', Boolean(state.success));

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === step);
    dot.classList.toggle('done', index < step);
    dot.classList.toggle('complete', state.success && index === step);
  });
}

function goTo(nextStep) {
  step = Math.max(0, Math.min(nextStep, scenarios[scenarioName].length - 1));
  render();
}

function next() {
  if (step >= scenarios[scenarioName].length - 1) {
    stopPlayback();
    return;
  }
  goTo(step + 1);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    stopPlayback();
    scenarioName = tab.dataset.scenario;
    step = 0;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    render();
  });
});

playButton.addEventListener('click', () => {
  if (timer) {
    stopPlayback();
    return;
  }

  if (step === scenarios[scenarioName].length - 1) {
    step = 0;
    render();
  }

  playIcon.textContent = 'Ⅱ';
  playText.textContent = '暫停';
  timer = window.setInterval(next, 900);
  next();
});

stepButton.addEventListener('click', () => {
  stopPlayback();
  next();
});

resetButton.addEventListener('click', () => {
  stopPlayback();
  goTo(0);
});

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    stopPlayback();
    goTo(Number(dot.dataset.step));
  });
});

render();
