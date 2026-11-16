import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--user-data-dir=/tmp/chrome_test_undo_10_blocks',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9299/json/list');
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

    // Place 10 blocks one by one across cells (0,0) to (8,0) and (0,1)
    console.log('Placing 10 blocks step-by-step...');
    const placeRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          if (!canvas) return { error: 'no canvas' };
          const rect = canvas.getBoundingClientRect();
          
          // Canvas grid is 9 cols (0..8) and 11 rows (0..10)
          const cellW = rect.width / 9;
          const cellH = rect.height / 11;
          
          const counts = [];
          
          // Place 10 distinct blocks
          for (let i = 0; i < 10; i++) {
            const col = i % 9;
            const row = Math.floor(i / 9);
            const cx = rect.left + col * cellW + cellW / 2;
            const cy = rect.top + row * cellH + cellH / 2;
            
            canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: cx, clientY: cy }));
            canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: cx, clientY: cy }));
            
            // Read brick count from header badge
            const countBadge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
            counts.push(countBadge ? parseInt(countBadge.textContent.replace(/\\D/g, ''), 10) : null);
          }
          
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          const redoBtn = document.querySelector('button[aria-label="Redo"]');
          
          return {
            stepCounts: counts,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Placed 10 blocks:', placeRes.value);

    // Capture screenshot with 10 blocks placed
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_designer_10_blocks_placed.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_designer_10_blocks_placed.png');

    // Now test clicking Undo 3 times: count should go 10 -> 9 -> 8 -> 7!
    console.log('Testing Undo 3 times...');
    const undo3Res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          const countsAfterUndo = [];
          
          for (let u = 0; u < 3; u++) {
            if (undoBtn && !undoBtn.disabled) undoBtn.click();
            const countBadge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
            countsAfterUndo.push(countBadge ? parseInt(countBadge.textContent.replace(/\\D/g, ''), 10) : null);
          }
          
          const redoBtn = document.querySelector('button[aria-label="Redo"]');
          return {
            countsAfterUndo,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Counts after 3 Undos (expected [9, 8, 7]):', undo3Res.value);

    // Capture screenshot after 3 undos (should have 7 blocks left)
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_designer_after_3_undos.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_designer_after_3_undos.png');

    // Now test Redo 2 times: count should go 7 -> 8 -> 9!
    console.log('Testing Redo 2 times...');
    const redo2Res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const redoBtn = document.querySelector('button[aria-label="Redo"]');
          const countsAfterRedo = [];
          
          for (let r = 0; r < 2; r++) {
            if (redoBtn && !redoBtn.disabled) redoBtn.click();
            const countBadge = document.querySelector('.font-tech.text-\\\\[9px\\\\]');
            countsAfterRedo.push(countBadge ? parseInt(countBadge.textContent.replace(/\\D/g, ''), 10) : null);
          }
          
          const undoBtn = document.querySelector('button[aria-label="Undo"]');
          return {
            countsAfterRedo,
            undoDisabled: undoBtn ? undoBtn.disabled : null,
            redoDisabled: redoBtn ? redoBtn.disabled : null,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Counts after 2 Redos (expected [8, 9]):', redo2Res.value);

    // Capture screenshot after 2 redos (should have 9 blocks)
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_designer_after_2_redos.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_designer_after_2_redos.png');

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
  }
}

run();
