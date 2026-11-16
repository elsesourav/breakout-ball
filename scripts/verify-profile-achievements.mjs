import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9298',
    '--user-data-dir=/tmp/chrome_test_verify_achievements_2',
    '--window-size=412,915',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 20; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9298/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    if (!listRes) {
      console.error('Failed to connect to chrome debugger');
      return;
    }

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
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    // 1. Trigger an achievement unlock
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const achs = JSON.parse(localStorage.getItem('breakout_unlocked_trophies') || '[]');
          if (!achs.includes('first_blood')) {
            achs.push('first_blood');
            localStorage.setItem('breakout_unlocked_trophies', JSON.stringify(achs));
          }
          const claimed = JSON.parse(localStorage.getItem('breakout_claimed_trophies') || '[]');
          const filtered = claimed.filter(id => id !== 'first_blood');
          localStorage.setItem('breakout_claimed_trophies', JSON.stringify(filtered));

          window.dispatchEvent(new CustomEvent('achievement_unlocked', {
            detail: { id: 'first_blood', title: 'FIRST BLOOD', coreReward: 25, unlocked: true }
          }));
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1200));

    // Screenshot 1: Toast at the very top + Profile button shine
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    if (snap1 && snap1.data) {
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_achievement_toast.png', Buffer.from(snap1.data, 'base64'));
      console.log('Saved verify_achievement_toast.png');
    }

    // 2. Open Profile View
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const profileBtn = document.querySelector('button[title="Pilot Profile"]');
          if (profileBtn) profileBtn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1500));

    // Screenshot 2: Profile view with sticky header and achievement list
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    if (snap2 && snap2.data) {
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_profile_header.png', Buffer.from(snap2.data, 'base64'));
      console.log('Saved verify_profile_header.png');
    }

    // 3. Scroll down in profile to verify header is STICKY and does NOT move or hide
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollable = document.querySelector('.flex-1.overflow-y-auto');
          if (scrollable) {
            scrollable.scrollTop = 220;
          }
        })()
      `
    });

    await new Promise(r => setTimeout(r, 800));

    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    if (snap3 && snap3.data) {
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_profile_sticky_header.png', Buffer.from(snap3.data, 'base64'));
      console.log('Saved verify_profile_sticky_header.png');
    }

    // 4. Click the CLAIM button on the achievement to trigger Flying Cores
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const claimBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('CLAIM'));
          if (claimBtn) {
            claimBtn.click();
          }
        })()
      `
    });

    // Wait 350ms mid-flight
    await new Promise(r => setTimeout(r, 380));

    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    if (snap4 && snap4.data) {
      fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_flying_cores.png', Buffer.from(snap4.data, 'base64'));
      console.log('Saved verify_flying_cores.png');
    }

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    chrome.kill();
  }
}

run();
