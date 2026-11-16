import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9300',
    '--user-data-dir=/tmp/chrome_test_verify_bottom_bg_level1',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9300/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
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
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    // Scroll container to show Level 1 and Sector 1 banner matching user's screenshot
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollContainer = document.querySelectorAll('.overflow-y-auto')[0];
          const node1 = document.getElementById('roadmap-level-node-1');
          if (scrollContainer && node1) {
            const item = node1.closest('.roadmap-scale-item');
            const top = item ? item.offsetTop : node1.offsetTop;
            // Scroll so Level 1 is around middle/lower screen exactly like user screenshot
            scrollContainer.scrollTop = top - 450;
          }
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1200));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    if (snap && snap.data) {
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_bottom_bg_level1_fixed.png', Buffer.from(snap.data, 'base64'));
      console.log('Saved verify_bottom_bg_level1_fixed.png');
    }

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

run();
