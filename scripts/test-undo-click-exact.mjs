import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--user-data-dir=/tmp/chrome_test_undo_click_exact',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9299/json/list');
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

    // Click 5 distinct cells inside the rendered grid
    const clickResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          const rect = canvas.getBoundingClientRect();

          // Calculate exact rendered coordinates inside canvas letterbox
          const DESIGNER_CANVAS_WIDTH = 1152;
          const DESIGNER_CANVAS_HEIGHT = 1056;
          const scale = Math.min(rect.width / DESIGNER_CANVAS_WIDTH, rect.height / DESIGNER_CANVAS_HEIGHT);
          const renderedW = DESIGNER_CANVAS_WIDTH * scale;
          const renderedH = DESIGNER_CANVAS_HEIGHT * scale;
          const offsetX = (rect.width - renderedW) / 2;
          const offsetY = (rect.height - renderedH) / 2;

          const cellW = renderedW / 9;
          const cellH = renderedH / 11;

          const placed = [];
          for (let i = 0; i < 5; i++) {
            const x = rect.left + offsetX + (i + 2) * cellW + cellW / 2;
            const y = rect.top + offsetY + 5 * cellH + cellH / 2;
            canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
            canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
            const badge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
            placed.push(badge ? badge.textContent : null);
          }

          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          const redoBtn = document.querySelector('button[aria-label="Redo"]');

          return {
            placed,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Placed 5 blocks result:', JSON.stringify(clickResult.result.value, null, 2));

    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_5_blocks_placed.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_5_blocks_placed.png');

    // Click Undo 2 times
    const undoResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          const afterUndo = [];
          for (let u = 0; u < 2; u++) {
            if (undoBtn && !undoBtn.disabled) undoBtn.click();
            const badge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
            afterUndo.push(badge ? badge.textContent : null);
          }
          const redoBtn = document.querySelector('button[aria-label="Redo"]');
          return {
            afterUndo,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Undo 2 times result:', JSON.stringify(undoResult.result.value, null, 2));

    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_after_2_undos.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_after_2_undos.png');

    // Click Redo 1 time
    const redoResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const redoBtn = document.querySelector('button[aria-label="Redo"]');
          if (redoBtn && !redoBtn.disabled) redoBtn.click();
          const badge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          return {
            afterRedo: badge ? badge.textContent : null,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Redo 1 time result:', JSON.stringify(redoResult.result.value, null, 2));

    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_after_1_redo.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_after_1_redo.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
