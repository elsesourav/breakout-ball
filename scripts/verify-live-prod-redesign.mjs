import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9282',
    '--user-data-dir=/tmp/chrome_test_verify_live_redesign',
    '--window-size=430,932',
    'https://breakout.elsesourav.com'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9282/json/list');
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

    // Screenshot 1: Live Prod Arcade
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_redesign_arcade.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_live_prod_redesign_arcade.png');

    // 2. Click SHOP button on live side dock
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const shopBtn = document.querySelector('button[title="SHOP"]');
          if (shopBtn) shopBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot 2: Live Prod Shop View with [← BACK]
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_redesign_shop.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_live_prod_redesign_shop.png');

    // 3. Click BACK to return to Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title="Return to previous screen"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // 4. Click Profile button on live top-right
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profileBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profileBtn) profileBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot 3: Live Prod Profile View with [← BACK]
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_redesign_profile.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_live_prod_redesign_profile.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill();
  }
}

run();
