function random(max, min=0) {
  return (Math.random() * (max - min)) + min;
}

const HEIGHT = 20;
const WIDTH = 5;
const GUTTER = 2;

function animate(bar) {
  const timing = Math.floor(random(500, 100));
  const height = Math.floor(random(HEIGHT, 2));
  bar.animId = window.requestAnimationFrame(() => {
    bar.style.transitionDuration = `${timing}ms`;
    bar.style.height = `${height}px`;
    bar.cbid = window.setTimeout(animate, timing, bar);
  });
}

function stopAnimate(bar) {
  window.clearTimeout(bar.cbid);
  window.cancelAnimationFrame(bar.animId);
  bar.style.height = '2px';
}

class Bars extends HTMLElement {
  addBars(count) {
    this.bars = this.bars.concat([...(new Array(count))].map((_, n) => {
      const div = document.createElement('div');
      div.classList.add('bar');
      div.style.left = `${(n + this.bars.length) * (WIDTH + GUTTER)}px`;
      this.shadow.appendChild(div);
      if (this.playing) {
        animate(div);
      }
      return div;
    }));
  }

  removeBars(count) {
    this.bars.slice(count).forEach(bar => {
      stopAnimate(bar);
      this.shadow.removeChild(bar);
    });
    this.bars = this.bars.slice(0, count);
  }

  updateBars(oldCount, newCount) {
    if (!oldCount) {
      oldCount = this.bars.length;
    }
    if (!newCount) {
      newCount = 4;
    }
    const diff = newCount - oldCount;
    if (diff < 0) {
      this.removeBars(diff);
    } else {
      this.addBars(diff);
    }
    this.style.width = `${newCount * (WIDTH + GUTTER) - GUTTER}px`;
  }

  static get observedAttributes() { return ['count', 'playing']; }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'playing':
        if (newValue === null) {
          this.bars.forEach(stopAnimate);
          this.playing = false;
        } else if (!this.playing) {
          this.playing = true;
          this.bars.forEach(animate);
        }
        break;
      case 'count':
        this.updateBars(Number.parseInt(oldValue), Number.parseInt(newValue));
        break;
    }
  }

  constructor(...args) {
    super(...args);
    this.bars = [];
    this.shadow = this.attachShadow({ mode: 'closed' });
  }

  connectedCallback() {
    if (!this.css) {
      this.css = document.createElement('style');
      this.css.textContent = `
        :host {
          height: ${HEIGHT}px;
          position: relative;
          cursor: pointer;
        }
        .bar {
          background-color: var(--bar-color, #7a7b7d);
          width: ${WIDTH}px;
          height: 2px;
          position: absolute;
          bottom: 0;
          border-radius: 0.75px;
          transition-property: height;
          transition-timing-function: ease-in-out;
        }
      `;
      this.shadow.appendChild(this.css);
    }

    // The attribute changed callback won't fire for the default
    if (!this.hasAttribute('count')) {
      this.attributeChangedCallback('count');
    }

    // If this was removed and reinserted then it needs to restart
    // Normally attribute changed callback handles this
    if (this.hasAttribute('playing') && !this.playing) {
      this.playing = true;
      this.bars.forEach(animate);
    }

    this.addEventListener('click', this.clickEvent);
  }

  clickEvent() {
    if (this.playing) {
      this.removeAttribute('playing');
    } else {
      this.setAttribute('playing', '');
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.clickEvent);
    this.bars.forEach(stopAnimate);
    this.playing = false;
  }
}

customElements.define('equalizer-bars', Bars);
