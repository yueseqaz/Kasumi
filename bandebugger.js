(function securePage() {
      const redirectURL = 'https://www.pornhub.com/'; // 填写您的博客地址
      
      const warningMessage = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          background: url('https://t.alcy.cc/ycy') no-repeat center center; 
          background-size: cover; 
          color: pink;
          font-size: 40px;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: Arial, sans-serif;
        ">
          <div>
            <h1>检测到非法调试！即将跳转首页</h1>
          </div>
        </div>
      `;
    
      function showWarning() {
        document.body.innerHTML = warningMessage; 
      }
    
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showWarning();
        setTimeout(() => window.location.href = redirectURL, 5000); 
      });
    
      document.addEventListener('keydown', function(e) {
        const forbiddenKeys = [
          { ctrl: true, shift: true, key: 'I' },
          { ctrl: true, shift: true, key: 'J' },
          { ctrl: true, shift: true, key: 'C' },
          { ctrl: true, key: 'U' },
          { key: 'F12' }
        ];
        forbiddenKeys.forEach(combo => {
          if (
            (combo.ctrl ? e.ctrlKey : true) &&
            (combo.shift ? e.shiftKey : true) &&
            (combo.key ? e.key.toUpperCase() === combo.key : true)
          ) {
            e.preventDefault();
            showWarning(); 
            setTimeout(() => window.location.href = redirectURL, 5000); 
          }
        });
      });
    
      function detectDebugger() {
        let isDebuggerOpen = false;
        const threshold = 100; 
    
        setInterval(() => {
          const start = Date.now();
          debugger; 
          const duration = Date.now() - start;
          if (duration > threshold) {
            if (!isDebuggerOpen) {
              isDebuggerOpen = true;
              showWarning(); 
              setTimeout(() => window.location.href = redirectURL, 5000); 
            }
          } else {
            isDebuggerOpen = false;
          }
        }, 1000);
      }
    
      window.addEventListener('error', function(event) {
        if (event.message === 'Script error.' && !event.filename) {
          showWarning(); 
          setTimeout(() => window.location.href = redirectURL, 5000); 
        }
      });
      detectDebugger();
    })();
