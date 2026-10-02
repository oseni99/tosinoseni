type Direction = 'up' | 'right' | 'down' | 'left';
type Point = { x: number; y: number };
type Technology = { name: string; short: string };

const SIZE = 18;
const technologies: Technology[] = [
  { name: 'React', short: 'Re' },
  { name: 'JavaScript', short: 'JS' },
  { name: 'TypeScript', short: 'TS' },
  { name: 'Python', short: 'Py' },
  { name: 'Go', short: 'Go' },
  { name: 'Redis', short: 'Rd' },
  { name: 'Postgres', short: 'Pg' },
  { name: 'Docker', short: 'Dk' },
];
const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 },
};
const opposite: Record<Direction, Direction> = { up: 'down', right: 'left', down: 'up', left: 'right' };
const keyDirections: Record<string, Direction> = {
  ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left',
  w: 'up', d: 'right', s: 'down', a: 'left',
};

const dialog = document.querySelector<HTMLDialogElement>('#stack-snake');
const openButton = document.querySelector<HTMLButtonElement>('#snake-open');
const closeButton = document.querySelector<HTMLButtonElement>('#snake-close');
const board = document.querySelector<HTMLElement>('#snake-board');
const overlay = document.querySelector<HTMLElement>('#snake-overlay');
const overlayTitle = document.querySelector<HTMLElement>('#snake-overlay-title');
const overlayDetail = document.querySelector<HTMLElement>('#snake-overlay-detail');
const action = document.querySelector<HTMLButtonElement>('#snake-action');
const projects = document.querySelector<HTMLAnchorElement>('#snake-projects');
const scoreLabel = document.querySelector<HTMLElement>('#snake-score');
const bestLabel = document.querySelector<HTMLElement>('#snake-best');
const pickupLabel = document.querySelector<HTMLElement>('#snake-pickup');
const collectedLabel = document.querySelector<HTMLElement>('#snake-collected');

if (dialog && closeButton && board && overlay && overlayTitle && overlayDetail && action && projects && scoreLabel && bestLabel && pickupLabel && collectedLabel) {
  if (openButton) openButton.hidden = false;
  const cells = Array.from({ length: SIZE * SIZE }, () => {
    const cell = document.createElement('span');
    cell.className = 'snake-cell';
    board.append(cell);
    return cell;
  });

  let snake: Point[] = [];
  let direction: Direction = 'right';
  let nextDirection: Direction = 'right';
  let turnedThisTick = false;
  let food: Point = { x: 0, y: 0 };
  let technology = technologies[0];
  let collected: string[] = [];
  let timer: number | undefined;
  let pickupTimer: number | undefined;
  let state: 'ready' | 'playing' | 'paused' | 'failed' = 'ready';
  let best = 0;
  try { best = Number(localStorage.getItem('stack-snake-best')) || 0; } catch { /* Storage may be unavailable. */ }
  bestLabel.textContent = String(best);

  const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
  const cellAt = (point: Point) => cells[point.y * SIZE + point.x];

  function render() {
    for (const cell of cells) { cell.className = 'snake-cell'; cell.textContent = ''; }
    snake.forEach((part, index) => cellAt(part).classList.add(index === 0 ? 'snake-head' : 'snake-body'));
    const foodCell = cellAt(food);
    foodCell.classList.add('snake-food');
    foodCell.textContent = technology.short;
    board!.setAttribute('aria-label', `Stack Snake game board. Stack size ${collected.length}. Current item: ${technology.name}.`);
  }

  function placeFood() {
    const empty: Point[] = [];
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      const point = { x, y };
      if (!snake.some(part => same(part, point))) empty.push(point);
    }
    if (empty.length === 0) { fail('You collected the whole stack.'); return; }
    food = empty[Math.floor(Math.random() * empty.length)];
    technology = technologies[Math.floor(Math.random() * technologies.length)];
  }

  function showOverlay(title: string, detail: string, button: string) {
    overlayTitle!.textContent = title;
    overlayDetail!.textContent = detail;
    action!.textContent = button;
    overlay!.hidden = false;
  }

  function stopTimer() { window.clearTimeout(timer); timer = undefined; }

  function reset() {
    stopTimer();
    window.clearTimeout(pickupTimer);
    snake = [{ x: 7, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 5 }];
    direction = nextDirection = 'right';
    turnedThisTick = false;
    collected = [];
    scoreLabel!.textContent = '0';
    pickupLabel!.textContent = '';
    collectedLabel!.textContent = 'Nothing yet';
    projects!.classList.add('hidden');
    state = 'ready';
    food = { x: 12, y: 5 };
    technology = technologies[0];
    render();
    showOverlay('Ready to build?', 'Collect technologies. Avoid walls and your tail.', 'Start game');
  }

  function schedule() {
    stopTimer();
    timer = window.setTimeout(tick, Math.max(85, 180 - collected.length * 5));
  }

  function play() {
    if (state === 'failed') reset();
    state = 'playing';
    overlay!.hidden = true;
    board!.focus({ preventScroll: true });
    schedule();
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    stopTimer();
    showOverlay('Paused.', 'Your stack will be here when you return.', 'Resume game');
  }

  function fail(detail = 'A collision ended this run.') {
    state = 'failed';
    stopTimer();
    projects!.classList.remove('hidden');
    showOverlay('BUILD FAILED', detail, 'Run Again');
  }

  function tick() {
    direction = nextDirection;
    turnedThisTick = false;
    const movement = vectors[direction];
    const head = { x: snake[0].x + movement.x, y: snake[0].y + movement.y };
    const eating = same(head, food);
    const occupied = eating ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE || occupied.some(part => same(part, head))) {
      fail();
      return;
    }
    snake.unshift(head);
    if (eating) {
      collected.push(technology.name);
      scoreLabel!.textContent = String(collected.length);
      collectedLabel!.textContent = collected.join(' · ');
      pickupLabel!.textContent = `+ ${technology.name}`;
      window.clearTimeout(pickupTimer);
      pickupTimer = window.setTimeout(() => { pickupLabel!.textContent = ''; }, 1400);
      if (collected.length > best) {
        best = collected.length;
        bestLabel!.textContent = String(best);
        try { localStorage.setItem('stack-snake-best', String(best)); } catch { /* Storage may be unavailable. */ }
      }
      placeFood();
      if (state === 'failed') return;
    } else snake.pop();
    render();
    schedule();
  }

  function turn(requested: Direction) {
    if (state !== 'playing' || turnedThisTick || requested === direction || requested === opposite[direction]) return;
    nextDirection = requested;
    turnedThisTick = true;
  }

  function openGame() { reset(); dialog!.showModal(); action!.focus(); }
  openButton?.addEventListener('click', openGame);
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { pause(); stopTimer(); openButton?.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  action.addEventListener('click', play);
  projects.addEventListener('click', () => dialog.close());
  dialog.querySelectorAll<HTMLButtonElement>('[data-snake-direction]').forEach(button => {
    button.addEventListener('click', () => turn(button.dataset.snakeDirection as Direction));
  });
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    const requested = keyDirections[event.key] ?? keyDirections[event.key.toLowerCase()];
    if (requested) { event.preventDefault(); turn(requested); }
    else if (event.code === 'Space') {
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      if (event.repeat) return;
      state === 'playing' ? pause() : state === 'paused' ? play() : undefined;
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  window.addEventListener('blur', pause);
  reset();
}
