import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9305',
    '--user-data-dir=/tmp/chrome_test_verify_white_settings_clip',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9305/json/list');
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

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="System Settings"]');
          if (!btn) return null;
          const rect = btn.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })()
      `,
      returnByValue: true
    });

    console.log('Button rect:', evalRes.result.value);
    const rect = evalRes.result.value;

    const clipX = Math.max(0, rect.x - 10);
    const clipY = Math.max(0, rect.y - 10);
    const clipW = Math.min(412 - clipX, rect.width + 20);
    const clipH = Math.min(915 - clipY, rect.height + 25);

    const clipSnap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: clipX,
        y: clipY,
        width: clipW,
        height: clipH,
        scale: 3
      }
    });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_white_button_exact.png', Buffer.from(clipSnap.data, 'base64'));

    console.log('Exact crop saved');
  } catch (err) {
    console.error('Error running test:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
