(function securePage() {
  const defaultConfig = {
    redirectURL: 'https://www.pornhub.com',
    warningDuration: 3000,
    checkInterval: 1000,
    maxChecks: 3,
    devToolsThreshold: 160,
    performanceThreshold: 100,
    debug: false,
    styles: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#333',
      fontSize: '24px',
      fontFamily: 'system-ui, -apple-system, Arial, sans-serif'
    }
  };

  function validateConfig(config) {
    const required = ['warningDuration', 'checkInterval', 'maxChecks'];
    const missing = required.filter(key => !(key in config));
    if (missing.length > 0) {
      throw new Error(`Missing required config: ${missing.join(', ')}`);
    }

    const numbers = ['warningDuration', 'checkInterval', 'maxChecks', 'devToolsThreshold'];
    numbers.forEach(key => {
      if (typeof config[key] !== 'number' || config[key] <= 0) {
        throw new Error(`Invalid ${key}: must be a positive number`);
      }
    });
  }

  const logger = {
    _prefix: '[SecurePage]',
    debug: (msg) => config.debug && console.debug(`${logger._prefix} ${msg}`),
    warn: (msg) => config.debug && console.warn(`${logger._prefix} ${msg}`),
    error: (msg) => config.debug && console.error(`${logger._prefix} ${msg}`)
  };

  const events = {
    onWarning: new Set(),
    onDevToolsDetected: new Set(),
    onConfigValidated: new Set(),
    onCleanup: new Set()
  };

  function emit(eventName, data) {
    if (events[eventName]) {
      events[eventName].forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          logger.error(`Event handler error: ${e.message}`);
        }
      });
    }
  }

  const state = new WeakMap();
  state.set(securePage, {
    warningShown: false,
    checkCount: 0,
    lastCheck: Date.now(),
    originalContent: null,
    mutationObserver: null
  });

  const domUtils = {
    createElement(tag, attributes = {}, styles = {}) {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
      return element;
    },

    createWarningElement() {
      const wrapper = this.createElement('div', {
        'data-secure': 'warning'
      }, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: config.styles.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '2147483647',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      });

      const inner = this.createElement('div');
      const title = this.createElement('h1', {}, {
        color: config.styles.color,
        fontSize: config.styles.fontSize,
        fontFamily: config.styles.fontFamily
      });

      title.textContent = '请勿调试！谢谢';
      inner.appendChild(title);
      wrapper.appendChild(inner);
      return wrapper;
    }
  };

  const detectionStrategies = {
    checkWindowSize() {
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      return widthDiff > config.devToolsThreshold || heightDiff > config.devToolsThreshold;
    },

    checkPerformance() {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        console.log('');
        console.clear();
      }
      const end = performance.now();
      return (end - start) > config.performanceThreshold;
    },

    checkConsole() {
      const consoleCheck = /./;
      consoleCheck.toString = () => {
        state.get(securePage).warningShown = true;
        return 'devtools';
      };
      console.log('%c', consoleCheck);
      return state.get(securePage).warningShown;
    },

    setupDOMObserver() {
      const currentState = state.get(securePage);
      if (currentState.mutationObserver) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.nodeName === 'BODY' && mutation.type === 'childList') {
            checkDevTools();
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      currentState.mutationObserver = observer;
    }
  };

  function showWarning() {
    const currentState = state.get(securePage);
    if (currentState.warningShown) return;

    currentState.warningShown = true;
    currentState.originalContent = document.body.cloneNode(true);

    const warningElement = domUtils.createWarningElement();
    document.body.appendChild(warningElement);

    requestAnimationFrame(() => {
      warningElement.style.opacity = '1';
    });

    emit('onWarning', { timestamp: Date.now() });

    if (config.redirectURL) {
      setTimeout(() => {
        try {
          window.location.replace(config.redirectURL);
        } catch (e) {
          logger.error(`Redirect failed: ${e.message}`);
          window.location.href = config.redirectURL;
        }
      }, config.warningDuration);
    }
  }

  function checkDevTools() {
    const currentState = state.get(securePage);
    const now = Date.now();

    if (now - currentState.lastCheck < config.checkInterval) return;
    currentState.lastCheck = now;

    let detected = false;
    try {
      detected = Object.values(detectionStrategies)
        .filter(strategy => typeof strategy === 'function')
        .some(strategy => strategy());
    } catch (e) {
      logger.error(`Detection error: ${e.message}`);
    }

    if (detected) {
      currentState.checkCount++;
      if (currentState.checkCount >= config.maxChecks) {
        emit('onDevToolsDetected', { timestamp: now });
        showWarning();
      }
    } else {
      currentState.checkCount = Math.max(0, currentState.checkCount - 1);
    }
  }

  const eventHandlers = {
    contextmenu: (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },

    keydown: (e) => {
      const forbiddenKeys = [
        { ctrl: true, shift: true, key: 'I' },
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'C' },
        { ctrl: true, key: 'U' },
        { key: 'F12' }
      ];

      const isDevToolKey = forbiddenKeys.some(combo => 
        (combo.ctrl ? e.ctrlKey : true) &&
        (combo.shift ? e.shiftKey : true) &&
        (combo.key ? e.key.toUpperCase() === combo.key : true)
      );

      if (isDevToolKey) {
        e.preventDefault();
        e.stopPropagation();
        showWarning();
        return false;
      }
    },

    visibilitychange: () => {
      if (document.hidden) {
        checkDevTools();
      }
    }
  };

  function init(userConfig = {}) {
    try {
      const config = { ...defaultConfig, ...userConfig };
      validateConfig(config);
      emit('onConfigValidated', config);

      Object.entries(eventHandlers).forEach(([event, handler]) => {
        document.addEventListener(event, handler, { capture: true, passive: false });
      });

      detectionStrategies.setupDOMObserver();
      const intervalId = setInterval(checkDevTools, config.checkInterval);

      const cleanup = () => {
        const currentState = state.get(securePage);
        clearInterval(intervalId);
        
        if (currentState.mutationObserver) {
          currentState.mutationObserver.disconnect();
        }

        Object.entries(eventHandlers).forEach(([event, handler]) => {
          document.removeEventListener(event, handler, { capture: true });
        });

        emit('onCleanup', { timestamp: Date.now() });
      };

      window._securePageCleanup = cleanup;

      logger.debug('Security system initialized');
    } catch (e) {
      logger.error(`Initialization error: ${e.message}`);
      throw e;
    }
  }

  window.SecurePage = {
    init,
    on: (event, handler) => events[event]?.add(handler),
    off: (event, handler) => events[event]?.delete(handler)
  };

  init();
})();