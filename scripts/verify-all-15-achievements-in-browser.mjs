import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--user-data-dir=/tmp/chrome_test_verify_achievements_15',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9294/json/list');
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

    // 1. Navigate to root URL /
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 3500));

    // Verify root pathname
    const pathnameResult = await send('Runtime.evaluate', {
      expression: 'window.location.pathname'
    });
    console.log('Arcade root URL pathname:', pathnameResult.result.value);

    // 2. Unlock all 15 achievements in browser environment
    const unlockResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          // Import achievementManager from storage or global dispatch
          const storageKey = 'breakout_achievements_v1';
          const allIds = [
            'first_blood', 'combo_5', 'combo_10', 'portal_hopper', 'emp_detonator',
            'speed_demon', 'campaign_10', 'apex_champion', 'level_architect', 'arena_challenger',
            'laser_barrage', 'multiball_chaos', 'shield_saviour', 'boss_slayer', 'celestial_ace'
          ];
          localStorage.setItem(storageKey, JSON.stringify(allIds));
          return allIds.length;
        })()
      `
    });
    console.log('Unlocked achievements count:', unlockResult.result.value);

    // 3. Navigate to /profile to inspect the full list with all 15 achievements & custom SVGs
    await send('Page.navigate', { url: 'http://localhost:3000/profile' });
    await new Promise(r => setTimeout(r, 2500));

    // Capture Screenshot 1: Profile with all 15 achievements, custom SVGs & Claim buttons
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_achievements_all_15_unlocked.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved verify_live_achievements_all_15_unlocked.png');

    // 4. Click the CLAIM button on the first achievement
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const claimBtn = document.querySelector('button[title*="Collect"]');
          if (claimBtn) {
            claimBtn.click();
            return 'clicked';
          }
          return 'not_found';
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 2: Profile after claim showing claimed status and updated balance
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_achievement_claimed_state.png', Buffer.from(snap2.data, 'base64'));
    console.log('Saved verify_live_achievement_claimed_state.png');

    // 5. Scroll down to show remaining custom SVG icons
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const scrollContainer = document.querySelector('.overflow-y-auto');
          if (scrollContainer) scrollContainer.scrollTop = 550;
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture Screenshot 3: Lower achievements showing new custom icons (Overclocked Swarm, Aegis Sentinel, Titan Breaker, Celestial Ace)
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_live_achievements_custom_svgs_scrolled.png', Buffer.from(snap3.data, 'base64'));
    console.log('Saved verify_live_achievements_custom_svgs_scrolled.png');

    ws.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
