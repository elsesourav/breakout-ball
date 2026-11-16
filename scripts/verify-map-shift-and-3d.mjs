import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9293',
    '--user-data-dir=/tmp/chrome_test_verify_map_3d',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9293/json/list');
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

    // Navigate to Arcade
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3500));

    // Capture View 1: Initial bottom of roadmap (Level 1, 2, 3...)
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_map_3d_bottom.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_map_3d_bottom.png');

    // Measure bounding boxes and distances
    const measurements = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const dockRect = dock ? dock.getBoundingClientRect() : null;
          
          const arenaBtn = dock ? dock.querySelector('button') : null;
          const arenaRect = arenaBtn ? arenaBtn.getBoundingClientRect() : null;

          const scrollContainer = document.querySelectorAll('.overflow-y-auto')[0];
          
          // Scroll so that levels 4, 5, 6, 7 are prominently in view
          const node5 = document.getElementById('roadmap-level-node-5');
          const node6 = document.getElementById('roadmap-level-node-6');
          const node4 = document.getElementById('roadmap-level-node-4');
          const node7 = document.getElementById('roadmap-level-node-7');
          
          if (node5 && scrollContainer) {
            // Scroll to center node 5
            const item5 = node5.closest('.roadmap-scale-item');
            if (item5) {
              const targetY = parseFloat(item5.getAttribute('data-y') || '0');
              scrollContainer.scrollTop = Math.max(0, targetY - 450);
            }
          }
          
          return {
            dockRight: dockRect ? dockRect.right : null,
            arenaRight: arenaRect ? arenaRect.right : null,
            viewWidth: window.innerWidth,
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Initial measurements:', measurements.value);

    await new Promise(r => setTimeout(r, 1500));

    // Measure positions after scroll
    const nodeData = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const dockRight = dock ? dock.getBoundingClientRect().right : 0;
          
          const nodes = [4, 5, 6, 7].map(id => {
            const btn = document.getElementById('roadmap-level-node-' + id);
            const item = btn ? btn.closest('.roadmap-scale-item') : null;
            if (!item || !btn) return null;
            const r = btn.getBoundingClientRect();
            const computedTransform = window.getComputedStyle(item).transform;
            return {
              id,
              left: Math.round(r.left),
              right: Math.round(r.right),
              top: Math.round(r.top),
              width: Math.round(r.width),
              height: Math.round(r.height),
              gapFromDock: Math.round(r.left - dockRight),
              transform: item.style.transform,
              filter: item.style.filter,
            };
          });
          
          return {
            dockRight: Math.round(dockRight),
            nodes: nodes.filter(Boolean),
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Node measurements at Level 4-7 view:', JSON.stringify(nodeData.value, null, 2));

    // Capture View 2: Levels 4, 5, 6, 7 showing generous gap from dock and 3D perspective
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_map_shifted_right_dock_clearance.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_map_shifted_right_dock_clearance.png');

    // Scroll higher up (Levels 8-12) to capture distinct small distance vs big foreground
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollContainer = document.querySelectorAll('.overflow-y-auto')[0];
          const node9 = document.getElementById('roadmap-level-node-9');
          if (node9 && scrollContainer) {
            const item = node9.closest('.roadmap-scale-item');
            if (item) {
              const targetY = parseFloat(item.getAttribute('data-y') || '0');
              scrollContainer.scrollTop = Math.max(0, targetY - 450);
            }
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_map_3d_perspective_distance_small.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_map_3d_perspective_distance_small.png');

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    chrome.kill();
  }
}

run();
