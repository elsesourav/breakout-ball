import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--user-data-dir=/tmp/chrome_test_undo_drag',
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

    // Open Studio & click DESIGN NEW ARENA
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

    // Simulate drag across 6 cells: mousedown on cell 1, mousemove across cells 2..6, then mouseup
    const dragResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          const rect = canvas.getBoundingClientRect();
          const DESIGNER_CANVAS_WIDTH = 1152;
          const DESIGNER_CANVAS_HEIGHT = 1056;
          const scale = Math.min(rect.width / DESIGNER_CANVAS_WIDTH, rect.height / DESIGNER_CANVAS_HEIGHT);
          const renderedW = DESIGNER_CANVAS_WIDTH * scale;
          const renderedH = DESIGNER_CANVAS_HEIGHT * scale;
          const offsetX = (rect.width - renderedW) / 2;
          const offsetY = (rect.height - renderedH) / 2;

          const cellW = renderedW / 9;
          const cellH = renderedH / 11;

          // Drag across row 4, cols 1..6
          const startX = rect.left + offsetX + 1 * cellW + cellW / 2;
          const y = rect.top + offsetY + 4 * cellH + cellH / 2;

          canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: startX, clientY: y }));

          for (let col = 2; col <= 6; col++) {
            const moveX = rect.left + offsetX + col * cellW + cellW / 2;
            canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: moveX, clientY: y }));
          }

          const endX = rect.left + offsetX + 6 * cellW + cellW / 2;
          canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: endX, clientY: y }));

          const badge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
          return {
            afterDrag: badge ? badge.textContent : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Drag result:', JSON.stringify(dragResult.result.value, null, 2));

    await new Promise(r => setTimeout(r, 500));

    // Check after drag renders
    const checkDrag = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          return {
            brickCount: badge ? badge.textContent : null,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Check drag count:', JSON.stringify(checkDrag.result.value, null, 2));

    // Click Undo 2 times - each should reduce count by 1!
    const undoDragRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          const counts = [];
          for (let i = 0; i < 2; i++) {
            if (undoBtn && !undoBtn.disabled) undoBtn.click();
            const badge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
            counts.push(badge ? badge.textContent : null);
          }
          return { counts };
        })()
      `,
      returnByValue: true
    });
    console.log('Counts after 2 undos of dragged stroke:', JSON.stringify(undoDragRes.result.value, null, 2));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_drag_undo_single_block.png', Buffer.from(snap.data, 'base64'));
    console.log('Saved verify_drag_undo_single_block.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
