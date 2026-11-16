import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--user-data-dir=/tmp/chrome_test_verify_sector2',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9294/json/list');
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

    // Scroll directly to Level 11 (Sector 2 Gateway)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollContainer = document.querySelectorAll('.overflow-y-auto')[0];
          const node11 = document.getElementById('roadmap-level-node-11');
          if (node11 && scrollContainer) {
            const item = node11.closest('.roadmap-scale-item');
            if (item) {
              const targetY = parseFloat(item.getAttribute('data-y') || '0');
              scrollContainer.scrollTop = Math.max(0, targetY - 500);
            }
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_sector2_gateway.png', Buffer.from(snap.data, 'base64'));
    console.log('Saved verify_sector2_gateway.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run();
