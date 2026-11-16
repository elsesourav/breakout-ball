import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9292',
    '--user-data-dir=/tmp/chrome_test_verify_all_updates',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9292/json/list');
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

    // Capture Screenshot 1: Arcade with Profile in Top Left, Stars in Top Center, Cores & Settings in Top Right
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_arcade_cores_badge_clean.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_arcade_cores_badge_clean.png');

    // 2. Click the Profile avatar in top-left
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profBtn) profBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Capture Screenshot 2: Profile page (Achievements list, no inner scroll, no filter, 15 achievements, collect buttons)
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_profile_achievements_and_collect.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_profile_achievements_and_collect.png');

    // 3. Scroll down on the outer profile page to verify natural outer scroll
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollContainer = document.querySelector('.overflow-y-auto');
          if (scrollContainer) scrollContainer.scrollTop = 500;
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Capture Screenshot 3: Profile page scrolled showing lower achievements naturally
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_profile_scrolled_achievements.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_profile_scrolled_achievements.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
