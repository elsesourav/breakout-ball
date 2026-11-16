import { spawn } from 'child_process';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9298',
    '--user-data-dir=/tmp/chrome_test_undo_draw',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9298/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page) return;

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

    // Open Studio
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const btns = dock.querySelectorAll('button');
          for (const b of btns) {
            if (b.textContent.includes('STUDIO')) b.click();
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Click DESIGN NEW ARENA
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const designBtn = btns.find(b => b.textContent.includes('DESIGN NEW ARENA'));
          if (designBtn) designBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Simulate clicking canvas to place a block
    const clickSim = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          const rect = canvas.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height * 0.25;

          canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: cx, clientY: cy }));
          canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: cx, clientY: cy }));

          const undoBtn = document.querySelector('button[title*="Undo"]');
          const redoBtn = document.querySelector('button[title*="Redo"]');

          return {
            afterClick1: {
              undoDisabled: undoBtn ? undoBtn.disabled : null,
              redoDisabled: redoBtn ? redoBtn.disabled : null,
            }
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Click sim 1:', JSON.stringify(clickSim.result.value, null, 2));

    await new Promise(r => setTimeout(r, 500));

    // Check states after 500ms
    const checkAfter500 = await send('Runtime.evaluate', {
      expression: `
        (() => {
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
    console.log('Check after 500ms:', JSON.stringify(checkAfter500.result.value, null, 2));

    // Click Undo
    const undoClickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const undoBtn = document.querySelector('button[title*="Undo"]');
          if (undoBtn) undoBtn.click();
          return true;
        })()
      `,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 500));

    // Check states after undo
    const checkAfterUndo = await send('Runtime.evaluate', {
      expression: `
        (() => {
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
    console.log('Check after Undo:', JSON.stringify(checkAfterUndo.result.value, null, 2));

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
