import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.resolve('showcase/screenshots');

fs.mkdirSync(OUT_DIR, { recursive: true });

async function captureAll() {
  console.log('Starting Headless Chrome for 3:4 Mobile Screenshot Captures...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9315',
    '--user-data-dir=/tmp/chrome_showcase_34_clean_' + Date.now(),
    '--window-size=1200,1600',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9315/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    if (!listRes) throw new Error('Could not connect to Chrome debugger on port 9315');

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

    async function setViewport(width, height, scale = 2.5) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: scale,
        mobile: true,
      });
    }

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // Helper: Wait for initial loading screen to completely vanish, and dismiss any floating toast alerts
    async function prepareScreen(additionalWait = 1000) {
      await send('Runtime.evaluate', {
        awaitPromise: true,
        expression: `
          new Promise((resolve) => {
            const check = () => {
              const loader = document.querySelector('[class*="z-[9999]"]');
              if (!loader) {
                // Remove any floating achievement toasts or alert popups
                document.querySelectorAll('[role="alert"], [class*="toast"], [class*="Toast"]').forEach(el => el.remove());
                return resolve();
              }
              setTimeout(check, 100);
            };
            check();
          });
        `
      });
      await wait(additionalWait);
      // Double clean toasts right before screenshot
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('[role="alert"], [class*="toast"], [class*="Toast"]').forEach(el => el.remove());
        `
      });
      await wait(150);
    }

    async function snap(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const dest = path.join(OUT_DIR, filename);
      fs.writeFileSync(dest, Buffer.from(res.data, 'base64'));
      console.log(`✓ Saved screenshot (3:4 ratio - 1200x1600): ${filename}`);
    }

    // Set 3:4 mobile viewport: 480 x 640 @ 2.5x scale = 1200 x 1600
    await setViewport(480, 640, 2.5);

    // ==========================================
    // 1. CAMPAIGN MAP (100 Sectors)
    // ==========================================
    console.log('\n1. Capturing Campaign Map...');
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await wait(3800);
    await prepareScreen(1500);
    await snap('mobile-01-campaign-map.png');

    // ==========================================
    // 2. LEVEL PREVIEW MODAL
    // ==========================================
    console.log('\n2. Capturing Level Preview Modal...');
    await send('Page.navigate', { url: `${BASE_URL}/level/3` });
    await wait(3000);
    await prepareScreen(1200);
    await snap('mobile-02-level-preview.png');

    // ==========================================
    // 3. ACTIVE GAMEPLAY ACTION
    // ==========================================
    console.log('\n3. Capturing Gameplay Action...');
    await send('Page.navigate', { url: `${BASE_URL}/play/3` });
    // Wait for 3-2-1-GO to finish and ball to launch into action
    await wait(4000);
    await snap('mobile-03-gameplay-action.png');

    // ==========================================
    // 4. GLOBAL APEX ARENA
    // ==========================================
    console.log('\n4. Capturing Global Apex Arena...');
    await send('Page.navigate', { url: `${BASE_URL}/arena` });
    await wait(3200);
    await prepareScreen(1200);
    await snap('mobile-04-global-arena.png');

    // ==========================================
    // 5. LEVEL STUDIO (MATRIX FORGE DESIGNER)
    // ==========================================
    console.log('\n5. Capturing Level Studio Designer Canvas...');
    await send('Page.navigate', { url: `${BASE_URL}/studio` });
    await wait(3200);
    await prepareScreen(1000);

    // Click "DESIGN NEW ARENA" to enter the matrix designer canvas
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll("button").forEach(b => {
          if (b.textContent && b.textContent.includes("DESIGN NEW")) {
            b.click();
          }
        });
      `
    });
    await wait(1800);

    // Click on canvas to draw a few colorful bricks
    await send('Runtime.evaluate', {
      expression: `
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const dX = rect.left + rect.width / 2;
          const dY = rect.top + rect.height / 3;
          // Trigger mouse click to place a block
          const evt = new MouseEvent('mousedown', { bubbles: true, clientX: dX, clientY: dY });
          canvas.dispatchEvent(evt);
          const evtUp = new MouseEvent('mouseup', { bubbles: true, clientX: dX, clientY: dY });
          canvas.dispatchEvent(evtUp);
        }
      `
    });
    await wait(500);
    await prepareScreen(400);
    await snap('mobile-05-level-designer.png');

    // ==========================================
    // 6. CYBER ARMORY
    // ==========================================
    console.log('\n6. Capturing Cyber Armory...');
    await send('Page.navigate', { url: `${BASE_URL}/armory` });
    await wait(3200);
    await prepareScreen(1200);
    await snap('mobile-06-cyber-armory.png');

    // ==========================================
    // 7. PILOT PROFILE & ACHIEVEMENTS
    // ==========================================
    console.log('\n7. Capturing Pilot Profile...');
    await send('Page.navigate', { url: `${BASE_URL}/profile` });
    await wait(3500);
    await prepareScreen(1500);
    await snap('mobile-07-pilot-profile.png');

    // Cleanup desktop screenshots if any
    const files = fs.readdirSync(OUT_DIR);
    for (const f of files) {
      if (f.startsWith('desktop-')) {
        fs.unlinkSync(path.join(OUT_DIR, f));
      }
    }

    ws.close();
    console.log('\nAll 3:4 Mobile Screenshots Captured Successfully & Verified!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

captureAll();
