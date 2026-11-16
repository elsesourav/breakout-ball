import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9293',
    '--user-data-dir=/tmp/chrome_test_verify_live_achievements',
    '--window-size=430,932',
    'https://breakout.elsesourav.com'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9293/json/list');
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

    // 1. Navigate to live site with forceFree=1
    await send('Page.navigate', { url: 'https://breakout.elsesourav.com?forceFree=1' });
    await new Promise(r => setTimeout(r, 4500));

    // Capture Screenshot 1: Arcade with Profile in Top Left, Cores pill (no plus border, fixed width) and Settings underneath
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_arcade_cores_clean.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_live_prod_arcade_cores_clean.png');

    // 2. Click Profile avatar in top-left
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profBtn) profBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2000));

    // Capture Screenshot 2: Profile page (Achievements list with 15 achievements, no inner scroll, rewards, no settings)
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_prod_profile_achievements_clean.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_live_prod_profile_achievements_clean.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
