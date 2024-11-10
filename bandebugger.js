
(function securePage() {
  const redirectURL = ''; // 重定向目标地址 这里填你想要跳转的网站
  
  const warningMessage = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      color: white;
      font-size: 40px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
    ">
      <div>
        <h1>请勿调试！谢谢</h1>
      </div>
    </div>
  `;

  // 添加警告页面
  function showWarning() {
    document.body.innerHTML = warningMessage; // 清空当前页面并显示警告
  }

  // 禁用右键菜单
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  // 禁用常见的调试快捷键
  document.addEventListener('keydown', function(e) {
    const forbiddenKeys = [
      { ctrl: true, shift: true, key: 'I' },
      { ctrl: true, shift: true, key: 'J' },
      { ctrl: true, shift: true, key: 'C' },
      { ctrl: true, key: 'U' },
      { key: 'F12' }
    ];
    forbiddenKeys.forEach(combo => {
      if ((combo.ctrl ? e.ctrlKey : true) &&
          (combo.shift ? e.shiftKey : true) &&
          (combo.key ? e.key.toUpperCase() === combo.key : true)) {
        e.preventDefault();
        showWarning(); // 显示警告页面
        setTimeout(() => window.location.href = redirectURL, 3000); // 显示3秒钟后跳转
      }
    });
  });

  // 检测是否打开了开发者工具
  function detectDebugger() {
    setInterval(() => {
      const start = Date.now();
      debugger; // 触发调试器

      // 如果检测到调试器延迟，说明开发者工具已打开
      if (Date.now() - start > 100) {
        showWarning(); // 显示警告
        setTimeout(() => window.location.href = redirectURL, 3000); // 显示3秒钟后跳转
      }
    }, 100);
  }

  // 检测开发者工具
  setInterval(function() {
    const devtools = /./;
    devtools.toString = function() {
      showWarning(); // 显示警告
      setTimeout(() => window.location.href = redirectURL, 3000); // 显示3秒钟后跳转
    };
    console.log('%c', devtools);
  }, 1000);

  // 错误监听，捕获未处理的错误
  window.addEventListener('error', function(event) {
    if (event.message === 'Script error.' && !event.filename) {
      showWarning(); // 显示警告
      setTimeout(() => window.location.href = redirectURL, 3000); // 显示3秒钟后跳转
    }
  });

  // 开始调试器检测
  detectDebugger();
})();
