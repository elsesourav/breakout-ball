import { spawn } from 'child_process';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9296',
    '--user-data-dir=/tmp/chrome_test_undo_redo',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9296/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page) {
      console.error('No page found');
      return;
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const msgId = id++;
        const handler = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    // 1. Click STUDIO button in side dock to open Studio
    console.log('Navigating to Studio...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const buttons = dock.querySelectorAll('button');
          for (const b of buttons) {
            if (b.textContent.includes('STUDIO')) {
              b.click();
              return true;
            }
          }
          return false;
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // 2. Click "DESIGN NEW ARENA" button in Studio
    console.log('Clicking DESIGN NEW ARENA...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const designBtn = btns.find(b => b.textContent.includes('DESIGN NEW ARENA'));
          if (designBtn) {
            designBtn.click();
            return true;
          }
          return false;
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Check if Level Designer is open
    const designerCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const designer = document.getElementById('levelDesigner');
          const canvas = document.getElementById('mainCanvas');
          const undoBtn = document.querySelector('button[title*="Undo"]');
          const redoBtn = document.querySelector('button[title*="Redo"]');
          return {
            hasDesigner: !!designer,
            hasCanvas: !!canvas,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Designer check:', designerCheck.value);

    // 3. Place a block by simulating mousedown + mouseup on canvas
    console.log('Placing block 1 at center of canvas...');
    const clickRes1 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          if (!canvas) return 'no canvas';
          const rect = canvas.getBoundingClientRect();
          const x = rect.left + rect.width * 0.5;
          const y = rect.top + rect.height * 0.3;

          const down = new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y });
          canvas.dispatchEvent(down);
          const up = new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y });
          canvas.dispatchEvent(up);

          const undoBtn = document.querySelector('button[title*="Undo"]');
          const redoBtn = document.querySelector('button[title*="Redo"]');
          return {
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('After block 1 click:', clickRes1.value);

    // 4. Place block 2
    console.log('Placing block 2...');
    const clickRes2 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          const rect = canvas.getBoundingClientRect();
          const x = rect.left + rect.width * 0.3;
          const y = rect.top + rect.height * 0.3;

          canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
          canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));

          const undoBtn = document.querySelector('button[title*="Undo"]');
          const redoBtn = document.querySelector('button[title*="Redo"]');
          return {
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('After block 2 click:', clickRes2.value);

    // 5. Test clicking Undo
    console.log('Clicking Undo button...');
    const undoRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const undoBtn = document.querySelector('button[title*="Undo"]');
          if (undoBtn) undoBtn.click();
          const redoBtn = document.querySelector('button[title*="Redo"]');
          return {
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('After clicking Undo:', undoRes.value);

    // 6. Test clicking Redo
    console.log('Clicking Redo button...');
    const redoRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const redoBtn = document.querySelector('button[title*="Redo"]');
          if (redoBtn) redoBtn.click();
          const undoBtn = document.querySelector('button[title*="Undo"]');
          return {
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('After clicking Redo:', redoRes.value);

    ws.close();
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    chrome.kill();
  }
}

run();
