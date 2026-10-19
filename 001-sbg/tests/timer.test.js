import test from "node:test";
import assert from "node:assert/strict";

import { GameTimer } from "../scripts/timer.js";

function createScheduler() {
  let nextId = 1;
  const callbacks = new Map();
  const clearedIds = [];

  return {
    callbacks,
    clearedIds,
    setInterval(callback, delay) {
      const id = nextId++;
      callbacks.set(id, { callback, delay });
      return id;
    },
    clearInterval(id) {
      clearedIds.push(id);
      callbacks.delete(id);
    },
  };
}

test("timer reaches zero without going negative and expires exactly once", () => {
  const scheduler = createScheduler();
  const ticks = [];
  let expireCount = 0;
  const timer = new GameTimer({
    duration: 3,
    onTick: (remaining) => ticks.push(remaining),
    onExpire: () => { expireCount += 1; },
    scheduler,
  });

  timer.start();
  const [{ callback }] = scheduler.callbacks.values();

  callback();
  callback();
  callback();
  callback();

  assert.deepEqual(ticks, [3, 2, 1, 0]);
  assert.equal(timer.remaining, 0);
  assert.equal(timer.isRunning, false);
  assert.equal(expireCount, 1);
  assert.equal(scheduler.clearedIds.length, 1);
});

test("a zero-duration timer reports zero and expires without scheduling work", () => {
  const scheduler = createScheduler();
  const ticks = [];
  let expireCount = 0;
  const timer = new GameTimer({
    duration: 0,
    onTick: (remaining) => ticks.push(remaining),
    onExpire: () => { expireCount += 1; },
    scheduler,
  });

  timer.start();

  assert.deepEqual(ticks, [0]);
  assert.equal(expireCount, 1);
  assert.equal(scheduler.callbacks.size, 0);
  assert.equal(timer.isRunning, false);
});
