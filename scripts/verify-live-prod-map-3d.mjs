import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--user-data-dir=/tmp/chrome_test_verify_live_prod_3d',
    '--window-size=412,915',
    'https://breakout.elsesourav.com/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9295/json/list');
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
    await send('Page.navigate', { url: 'https://breakout.elsesourav.com/' });
    await new Promise(r => setTimeout(r, 4000));

    // Capture Production View 1: Level 1-3
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_map_bottom.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_live_prod_map_bottom.png');

    // Scroll to levels 4, 5, 6, 7 (the exact view from the user's screenshot)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollContainer = document.querySelectorAll('.overflow-y-auto')[0];
          const node5 = document.getElementById('roadmap-level-node-5');
          if (node5 && scrollContainer) {
            const item = node5.closest('.roadmap-scale-item');
            if (item) {
              const targetY = parseFloat(item.getAttribute('data-y') || '0');
              scrollContainer.scrollTop = Math.max(0, targetY - 450);
            }
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2000));

    // Capture Production View 2: Levels 4-7 with generous clearance from dock
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_map_shifted_clearance.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_live_prod_map_shifted_clearance.png');

    // Scroll up to show small distance vs big foreground
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
    await new Promise(r => setTimeout(r, 2000));

    // Capture Production View 3: Levels 8-11
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_map_3d_perspective.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_live_prod_map_3d_perspective.png');

    ws.close();
  } catch (err) {
    console.error('Error during live prod test:', err);
  } finally {
    chrome.kill();
  }
}

run();
