import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9302',
    '--user-data-dir=/tmp/chrome_test_verify_white_settings',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9302/json/list');
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

    // Full screen capture
    const fullSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_white_full.png', Buffer.from(fullSnap.data, 'base64'));

    // Clip settings button area (top right)
    // Settings button is at top right around x: 340-400, y: 50-130
    const clipSnap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 310,
        y: 40,
        width: 100,
        height: 100,
        scale: 2
      }
    });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_white_crop.png', Buffer.from(clipSnap.data, 'base64'));

    // Also clip the full top header (left avatar + stars + cores + settings)
    const headerSnap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 412,
        height: 140,
        scale: 2
      }
    });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_header_crop.png', Buffer.from(headerSnap.data, 'base64'));

    console.log('Screenshots saved successfully');
  } catch (err) {
    console.error('Error running test:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
