class ImageSlider {
  constructor(container, options = {}) {
    // 默认配置
    this.defaults = {
      images: [], // 图片数组
      autoPlay: true, // 是否自动播放
      interval: 3000, // 自动播放间隔时间
      loop: true, // 是否循环播放
      fullscreenButton: true, // 是否显示全屏按钮
      customStyles: {}, // 自定义样式
      transition: 'slide', // 过渡动画类型: 'slide' | 'fade'
    };

    // 合并用户配置和默认配置
    this.settings = { ...this.defaults, ...options };
    this.container = document.querySelector(container);
    if (!this.container) {
      throw new Error('Container not found');
    }

    this.init();
  }

  init() {
    // 创建滑块结构
    this.sliderContainer = document.createElement('div');
    this.sliderContainer.className = 'slider-container';

    // 应用自定义样式
    this.applyCustomStyles(this.sliderContainer, this.settings.customStyles.container);

    this.slider = document.createElement('div');
    this.slider.className = `siema ${this.settings.transition}`;

    this.settings.images.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Slider Image';
      this.applyCustomStyles(img, this.settings.customStyles.image);
      this.slider.appendChild(img);
    });

    this.sliderContainer.appendChild(this.slider);
    this.container.appendChild(this.sliderContainer);

    if (this.settings.fullscreenButton) {
      this.createFullscreenButton();
    }

    this.initSiema();
    if (this.settings.autoPlay) {
      this.initAutoPlay();
    }
  }

  createFullscreenButton() {
    this.fullscreenButton = document.createElement('button');
    this.fullscreenButton.className = 'fullscreen-btn';
    this.fullscreenButton.textContent = '全屏';
    this.sliderContainer.appendChild(this.fullscreenButton);

    this.fullscreenButton.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        this.sliderContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  initSiema() {
    this.siema = new Siema({
      duration: 200,
      easing: 'ease-out',
      perPage: 1,
      startIndex: 0,
      draggable: true,
      threshold: 20,
      loop: this.settings.loop,
    });
  }

  initAutoPlay() {
    const intervalTime = this.settings.interval;
    let timer;

    const stopTimer = () => clearInterval(timer);
    const startTimer = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        this.siema.next();
      }, intervalTime);
    };

    this.slider.addEventListener('mouseenter', stopTimer);
    this.slider.addEventListener('mouseleave', startTimer);
    this.slider.addEventListener('touchstart', stopTimer);
    this.slider.addEventListener('touchend', startTimer);

    startTimer();
  }

  applyCustomStyles(element, styles = {}) {
    if (styles && typeof styles === 'object') {
      Object.entries(styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
    }
  }
}

// 导出模块
export default ImageSlider;
