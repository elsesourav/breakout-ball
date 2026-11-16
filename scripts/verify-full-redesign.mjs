import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9280',
    '--user-data-dir=/tmp/chrome_test_verify_redesign',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9280/json/list');
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

    // 1. Navigate to Arcade with forceFree=1
    await send('Page.navigate', { url: 'http://localhost:3000?forceFree=1' });
    await new Promise(r => setTimeout(r, 3500));

    // Capture Screenshot 1: Arcade with Free on Left, Stars in Center, Profile + Cores & Settings under it on Right, Side dock with Arena, Armory, Studio, Shop
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_redesign_arcade.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_redesign_arcade.png');

    // 2. Click SHOP button on Side Dock
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const shopBtn = document.querySelector('button[title="SHOP"]');
          if (shopBtn) shopBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 2: Dedicated Shop View with [← BACK]
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_redesign_shop_view.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_redesign_shop_view.png');

    // 3. Click [← BACK] in Shop View
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title="Return to previous screen"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // 4. Click Profile button at Top Right
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profileBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profileBtn) profileBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 3: Profile View with [← BACK]
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_redesign_profile_view.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_redesign_profile_view.png');

    // 5. Click [← BACK] to return to Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title="Return to previous screen"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // 6. Click Settings button (under Cores badge)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const settingsBtn = document.querySelector('button[title="System Settings"]');
          if (settingsBtn) settingsBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Capture Screenshot 4: Settings modal open
    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_redesign_settings_modal.png', Buffer.from(snap4.data, 'base64'));
    console.log('Saved verify_redesign_settings_modal.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill();
  }
}

run();
