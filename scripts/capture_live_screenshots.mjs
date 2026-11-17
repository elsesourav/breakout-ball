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
    '--remote-debugging-port=9310',
    '--user-data-dir=/tmp/chrome_showcase_34_' + Date.now(),
    '--window-size=1200,1600',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9310/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    if (!listRes) throw new Error('Could not connect to Chrome debugger on port 9310');

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

    async function snap(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const dest = path.join(OUT_DIR, filename);
      fs.writeFileSync(dest, Buffer.from(res.data, 'base64'));
      console.log(`Saved screenshot (3:4 ratio - 1200x1600): ${filename}`);
    }

    // ===============================================================
    // MOBILE SCREENSHOTS IN 3:4 RATIO (480 x 640 @ 2.5x = 1200 x 1600)
    // ===============================================================
    console.log('\n--- Capturing 3:4 Mobile Screenshots (1200x1600) ---');
    await setViewport(480, 640, 2.5);

    // 1. Campaign Map
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await wait(3800);
    await snap('mobile-01-campaign-map.png');

    // 2. Level 3 Preview Modal
    await send('Page.navigate', { url: `${BASE_URL}/level/3` });
    await wait(3000);
    await snap('mobile-02-level-preview.png');

    // 3. Active Gameplay Action
    await send('Page.navigate', { url: `${BASE_URL}/play/3` });
    await wait(3900); // Allow countdown to finish and ball to launch
    await snap('mobile-03-gameplay-action.png');

    // 4. Global Arena
    await send('Page.navigate', { url: `${BASE_URL}/arena` });
    await wait(3500);
    await snap('mobile-04-global-arena.png');

    // 5. Level Studio (Mobile Designer)
    await send('Page.navigate', { url: `${BASE_URL}/studio` });
    await wait(3000);
    await snap('mobile-05-level-designer.png');

    // 6. Cyber Armory
    await send('Page.navigate', { url: `${BASE_URL}/armory` });
    await wait(3000);
    await snap('mobile-06-cyber-armory.png');

    // 7. Pilot Profile & Achievements
    await send('Page.navigate', { url: `${BASE_URL}/profile` });
    await wait(3000);
    await snap('mobile-07-pilot-profile.png');

    // Clean up any remaining desktop screenshots from showcase/screenshots
    const files = fs.readdirSync(OUT_DIR);
    for (const f of files) {
      if (f.startsWith('desktop-')) {
        fs.unlinkSync(path.join(OUT_DIR, f));
        console.log(`Removed desktop screenshot: ${f}`);
      }
    }

    ws.close();
    console.log('\nAll 3:4 mobile screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

captureAll();
