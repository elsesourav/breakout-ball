import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const RAW_DIR = path.resolve('showcase/.raw_916');

fs.mkdirSync(RAW_DIR, { recursive: true });

async function capture916() {
  console.log('Starting Headless Chrome for 9:16 Native Mobile Screenshot Captures...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9328',
    '--user-data-dir=/tmp/chrome_raw_916_v3_' + Date.now(),
    '--window-size=1080,1920',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9328/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    if (!listRes) throw new Error('Could not connect to Chrome debugger on port 9328');

    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page) throw new Error('No target page found');

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

    // 432 x 768 @ 2.5x = 1080 x 1920 (exact 9:16 FHD Mobile)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 432,
      height: 768,
      deviceScaleFactor: 2.5,
      mobile: true,
    });

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    async function cleanAndPrepare(extraWait = 1000) {
      await send('Runtime.evaluate', {
        awaitPromise: true,
        expression: `
          new Promise((resolve) => {
            const check = () => {
              const loader = document.querySelector('[class*="z-[9999]"]');
              if (!loader) return resolve();
              setTimeout(check, 100);
            };
            check();
          });
        `
      });
      await wait(extraWait);
      // Suppress any achievement toasts so the header remains 100% clean
      await send('Runtime.evaluate', {
        expression: `
          window.dispatchEvent(new CustomEvent('achievement_claimed'));
          document.querySelectorAll('[role="alert"], [class*="toast"], [class*="Toast"], [class*="achievement"]').forEach(el => el.remove());
        `
      });
      await wait(200);
    }

    async function snap(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const dest = path.join(RAW_DIR, filename);
      fs.writeFileSync(dest, Buffer.from(res.data, 'base64'));
      console.log(`✓ Saved raw 9:16 screen: ${filename}`);
    }

    // 1. Campaign Map
    console.log('\n1. Capturing Campaign Map (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await wait(3800);
    await cleanAndPrepare(1500);
    await snap('raw_01_map.png');

    // 2. Level Preview Modal
    console.log('\n2. Capturing Level Preview Modal (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/level/3` });
    await wait(3000);
    await cleanAndPrepare(1000);
    await snap('raw_02_preview.png');

    // 3. Gameplay Action (Pre-mark all achievements as unlocked & viewed so toast does not cover HUD)
    console.log('\n3. Capturing Gameplay Action (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await wait(1200);
    await send('Runtime.evaluate', {
      expression: `
        try {
          const allIds = [
            'first_blood', 'portal_hopper', 'emp_detonator', 'speed_demon',
            'apex_champion', 'omega_sovereign', 'level_architect', 'arena_challenger',
            'laser_barrage', 'multiball_chaos', 'shield_saviour', 'boss_slayer', 'celestial_ace'
          ];
          localStorage.setItem('breakout_achievements_v1', JSON.stringify(allIds));
          localStorage.setItem('breakout_viewed_achievements_v1', JSON.stringify(allIds));
          localStorage.setItem('breakout_achievement_claims_v1', JSON.stringify(allIds));
          for (const k of Object.keys(localStorage)) {
            if (k.startsWith('breakout_achievements') || k.startsWith('breakout_viewed') || k.startsWith('breakout_achievement_claims')) {
              localStorage.setItem(k, JSON.stringify(allIds));
            }
          }
        } catch(e) {}
      `
    });

    await send('Page.navigate', { url: `${BASE_URL}/play/3` });
    // Wait for countdown and ball launch into action
    await wait(4200);
    await send('Runtime.evaluate', {
      expression: `
        const style = document.createElement('style');
        style.textContent = 'div[style*="99999"] { display: none !important; opacity: 0 !important; visibility: hidden !important; }';
        document.head.appendChild(style);
        document.querySelectorAll('button[title="Dismiss notification"]').forEach(b => b.click());
        document.querySelectorAll('[role="alert"], [class*="toast"], [class*="Toast"], [class*="achievement"]').forEach(el => el.remove());
      `
    });
    await snap('raw_03_gameplay.png');

    // 4. Global Arena
    console.log('\n4. Capturing Global Arena (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/arena` });
    await wait(3500);
    await cleanAndPrepare(1200);
    await snap('raw_04_arena.png');

    // 5. Level Designer Studio Canvas with drawn bricks
    console.log('\n5. Capturing Level Designer Studio (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/studio` });
    await wait(3500);

    // Click DESIGN NEW ARENA
    await send('Runtime.evaluate', {
      expression: 'document.querySelectorAll("button").forEach(b => { if (b.textContent && b.textContent.includes("DESIGN NEW")) b.click(); });'
    });
    await wait(1500);

    // Get mainCanvas bounds and tap a crisp pattern of bricks
    const boxRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          const c = document.getElementById('mainCanvas') || document.querySelector('canvas');
          if (!c) return null;
          const r = c.getBoundingClientRect();
          return { left: r.left, top: r.top, width: r.width, height: r.height };
        })()
      `
    });

    if (boxRes && boxRes.result && boxRes.result.value) {
      const b = boxRes.result.value;
      const scale = Math.min(b.width / 1152, b.height / 1056);
      const rendW = 1152 * scale;
      const rendH = 1056 * scale;
      const offX = b.left + (b.width - rendW) / 2;
      const offY = b.top + (b.height - rendH) / 2;
      const cW = (1152 / 9) * scale;
      const cH = (1056 / 11) * scale;

      const tap = async (gx, gy) => {
        const x = Math.round(offX + (gx + 0.5) * cW);
        const y = Math.round(offY + (gy + 0.5) * cH);
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await wait(35);
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await wait(55);
      };

      // Tap chevron diamond pattern
      await tap(1, 1); await tap(2, 2); await tap(3, 3); await tap(4, 4);
      await tap(7, 1); await tap(6, 2); await tap(5, 3);
      await tap(3, 1); await tap(4, 2); await tap(5, 1);
      await wait(600);
    }

    await cleanAndPrepare(400);
    await snap('raw_05_designer.png');

    // 6. Cyber Armory
    console.log('\n6. Capturing Cyber Armory (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/armory` });
    await wait(3500);
    await cleanAndPrepare(1200);
    await snap('raw_06_armory.png');

    // 7. Pilot Profile
    console.log('\n7. Capturing Pilot Profile (9:16)...');
    await send('Page.navigate', { url: `${BASE_URL}/profile` });
    await wait(4500);
    await cleanAndPrepare(1500);
    await snap('raw_07_profile.png');

    ws.close();
    console.log('\nAll raw 9:16 screens captured with zero artifacts!');
  } catch (err) {
    console.error('Error during 9:16 screen capture:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

capture916();
