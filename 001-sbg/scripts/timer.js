/**
 * Small, UI-independent countdown timer.
 * The scheduler dependency makes the timer straightforward to test without a browser.
 */
export class GameTimer {
  constructor({ duration = 30, onTick = () => {}, onExpire = () => {}, scheduler = globalThis } = {}) {
    const parsedDuration = Number(duration);
    this.duration = Number.isFinite(parsedDuration) ? Math.max(0, Math.floor(parsedDuration)) : 0;
    this.remaining = this.duration;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.scheduler = scheduler;
    this.intervalId = null;
    this.expired = false;
  }

  get isRunning() {
    return this.intervalId !== null;
  }

  start() {
    if (this.isRunning || this.expired) {
      return;
    }

    this.onTick(this.remaining);

    if (this.remaining === 0) {
      this.expire();
      return;
    }

    this.intervalId = this.scheduler.setInterval(() => this.tick(), 1000);
  }

  tick() {
    if (this.expired) {
      return;
    }

    this.remaining = Math.max(0, this.remaining - 1);
    this.onTick(this.remaining);

    if (this.remaining === 0) {
      this.expire();
    }
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.scheduler.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  expire() {
    if (this.expired) {
      return;
    }

    this.stop();
    this.expired = true;
    this.remaining = 0;
    this.onExpire();
  }
}
