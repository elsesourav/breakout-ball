import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9308',
    '--user-data-dir=/tmp/chrome_test_verify_white_settings_poll',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9308/json/list');
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      mobile: true
    });

    await send('Page.navigate', { url: 'http://localhost:3000' });

    // Poll until loading screen finishes and settings button is visible
    let rect = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('button[title="System Settings"]');
            if (!btn) return null;
            const style = window.getComputedStyle(btn);
            const parent = btn.closest('.z-40');
            const parentStyle = parent ? window.getComputedStyle(parent) : null;
            if (style.display === 'none' || style.visibility === 'hidden') return null;
            const r = btn.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            }
            return null;
          })()
        `,
        returnByValue: true
      });
      if (evalRes?.result?.value) {
        rect = evalRes.result.value;
        // Wait an extra second for fade-in animations to complete
        await new Promise(r => setTimeout(r, 1200));
        break;
      }
    }

    console.log('Button rect:', rect);

    // Full screen mobile screenshot
    const fullSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_mobile_full.png', Buffer.from(fullSnap.data, 'base64'));

    if (rect) {
      // Zoomed in button screenshot
      const btnSnap = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: Math.max(0, Math.round(rect.x - 20)),
          y: Math.max(0, Math.round(rect.y - 20)),
          width: Math.round(rect.width + 40),
          height: Math.round(rect.height + 40),
          scale: 3
        }
      });
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_white_button_zoom.png', Buffer.from(btnSnap.data, 'base64'));

      // Header row screenshot
      const headerSnap = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 412,
          height: 160,
          scale: 2
        }
      });
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_settings_header_full.png', Buffer.from(headerSnap.data, 'base64'));
    }

    console.log('Mobile screenshots captured successfully');
  } catch (err) {
    console.error('Error running test:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
