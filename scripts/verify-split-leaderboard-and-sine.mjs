import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9286',
    '--user-data-dir=/tmp/chrome_test_verify_sine_leaderboard',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9286/json/list');
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

    // Capture Screenshot 1: Arcade with 5 Side Buttons (Arena, Upgrade, Studio, Shop, Ranks), Top Left Free Cores with Sine effect, Top Center Stars, Top Right Profile + Cores & Settings
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_new_arcade_5buttons.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_new_arcade_5buttons.png');

    // 2. Click RANKS on the side dock
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const ranksBtn = document.querySelector('button[title="RANKS"]');
          if (ranksBtn) ranksBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 2: Dedicated Leaderboard View
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_dedicated_leaderboard_view.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_dedicated_leaderboard_view.png');

    // 3. Click BACK to return to Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title="Return to previous screen"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // 4. Click UPGRADE on the side dock
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const upBtn = document.querySelector('button[title="UPGRADE"]');
          if (upBtn) upBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 3: Dedicated Upgrade View
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_dedicated_upgrade_view.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_dedicated_upgrade_view.png');

    // 5. Click BACK to return to Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title="Return to previous screen"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // 6. Click SHOP on the side dock
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const shopBtn = document.querySelector('button[title="SHOP"]');
          if (shopBtn) shopBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 4: Shop View with 100% Free, Free Claim Ready, Sine glow & Claim Free button
    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_shop_free_sine_effect.png', Buffer.from(snap4.data, 'base64'));
    console.log('Saved verify_shop_free_sine_effect.png');

    // 7. Click BACK to return to Arcade
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = document.querySelector('button[title="Return to previous screen"]');
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // 8. Click Profile Button at top right
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profileBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profileBtn) profileBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 5: Profile View showing Badges directly (no leaderboard in profile)
    const snap5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_profile_no_leaderboard.png', Buffer.from(snap5.data, 'base64'));
    console.log('Saved verify_profile_no_leaderboard.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill();
  }
}

run();
