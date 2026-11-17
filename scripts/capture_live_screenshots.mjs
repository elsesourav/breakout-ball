import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.resolve('showcase/screenshots');

fs.mkdirSync(OUT_DIR, { recursive: true });

async function captureAll() {
  console.log('Starting Headless Chrome for live screenshot captures...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9305',
    '--user-data-dir=/tmp/chrome_showcase_capture_' + Date.now(),
    '--window-size=1920,1080',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9305/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    if (!listRes) throw new Error('Could not connect to Chrome debugger on port 9305');

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

    async function setViewport(width, height, isMobile = false) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: isMobile,
      });
    }

    async function waitTime(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    async function snap(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const dest = path.join(OUT_DIR, filename);
      fs.writeFileSync(dest, Buffer.from(res.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
    }

    // ==========================================
    // 1. MOBILE SCREENSHOTS (9:16 - 430 x 932 @ 2x = 860 x 1864)
    // ==========================================
    console.log('\n--- Capturing Mobile Screenshots (9:16) ---');
    await setViewport(430, 932, true);

    // 1.1 Campaign Map
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await waitTime(4000);
    await snap('mobile-01-campaign-map.png');

    // 1.2 Level 3 Preview Modal
    await send('Page.navigate', { url: `${BASE_URL}/level/3` });
    await waitTime(3000);
    await snap('mobile-02-level-preview.png');

    // 1.3 Active Gameplay Action
    await send('Page.navigate', { url: `${BASE_URL}/play/3` });
    await waitTime(3800);
    await snap('mobile-03-gameplay-action.png');

    // 1.4 Global Arena
    await send('Page.navigate', { url: `${BASE_URL}/arena` });
    await waitTime(3500);
    await snap('mobile-04-global-arena.png');

    // 1.5 Level Studio (Designer)
    await send('Page.navigate', { url: `${BASE_URL}/studio` });
    await waitTime(3000);
    await snap('mobile-05-level-designer.png');

    // 1.6 Cyber Armory
    await send('Page.navigate', { url: `${BASE_URL}/armory` });
    await waitTime(3000);
    await snap('mobile-06-cyber-armory.png');

    // 1.7 Pilot Profile
    await send('Page.navigate', { url: `${BASE_URL}/profile` });
    await waitTime(3000);
    await snap('mobile-07-pilot-profile.png');

    // ==========================================
    // 2. DESKTOP SCREENSHOTS (16:9 - 1920 x 1080 @ 1x)
    // ==========================================
    console.log('\n--- Capturing Desktop Screenshots (16:9) ---');
    await setViewport(1920, 1080, false);

    // 2.1 Desktop Map & Arena
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await waitTime(3500);
    await snap('desktop-01-campaign-map.png');

    // 2.2 Desktop Gameplay
    await send('Page.navigate', { url: `${BASE_URL}/play/16` });
    await waitTime(3800);
    await snap('desktop-02-gameplay-action.png');

    // 2.3 Desktop Level Designer
    await send('Page.navigate', { url: `${BASE_URL}/studio` });
    await waitTime(3000);
    await snap('desktop-03-level-designer.png');

    // 2.4 Desktop Global Arena
    await send('Page.navigate', { url: `${BASE_URL}/arena` });
    await waitTime(3500);
    await snap('desktop-04-global-arena.png');

    // 2.5 Desktop Cyber Armory
    await send('Page.navigate', { url: `${BASE_URL}/armory` });
    await waitTime(3000);
    await snap('desktop-05-cyber-armory.png');

    ws.close();
    console.log('\nAll live screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

captureAll();
