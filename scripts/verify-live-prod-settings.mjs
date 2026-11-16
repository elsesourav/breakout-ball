import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9278',
    '--user-data-dir=/tmp/chrome_test_verify_live_settings',
    '--window-size=430,932',
    'https://breakout.elsesourav.com'
  ]);

  try {
    await new Promise(r => setTimeout(r, 3000));
    const listRes = await fetch('http://127.0.0.1:9278/json/list');
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

    // 1. Navigate to live site with cache bust
    await send('Page.navigate', { url: `https://breakout.elsesourav.com?v=${Date.now()}` });
    await new Promise(r => setTimeout(r, 4500));

    // Verify Arcade on live prod
    const checkLiveArcade = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const coresBadge = document.getElementById('top-cores-badge');
          const settingsBtn = document.querySelector('button[title="System Settings"]');
          return {
            hasCoresBadge: !!coresBadge,
            hasSettingsBtn: !!settingsBtn
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Live Prod Arcade Header:', checkLiveArcade.result?.value);

    // Screenshot: Live Prod Arcade
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_arcade_settings.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_live_prod_arcade_settings.png');

    // 2. Click Settings button on live prod
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title="System Settings"]');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot: Live Prod Settings Modal
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_settings_modal.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_live_prod_settings_modal.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill();
  }
}

run();
