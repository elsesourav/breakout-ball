import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const TMP_FRAMES_DIR = path.resolve('showcase/.tmp_frames');
const GIFS_DIR = path.resolve('showcase/gifs');

fs.mkdirSync(TMP_FRAMES_DIR, { recursive: true });
fs.mkdirSync(GIFS_DIR, { recursive: true });

async function captureGifs() {
  console.log('Starting Headless Chrome for Live GIF captures...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9306',
    '--user-data-dir=/tmp/chrome_gif_capture_' + Date.now(),
    '--window-size=960,640',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9306/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    if (!listRes) throw new Error('Could not connect to Chrome debugger on port 9306');

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

    async function setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1.5,
        mobile: false,
      });
    }

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // ==========================================
    // 1. CAPTURE GAMEPLAY ACTION GIF
    // ==========================================
    console.log('\n1. Recording Live Gameplay Action...');
    await setViewport(600, 750);
    await send('Page.navigate', { url: `${BASE_URL}/play/3` });
    // Wait for 3-2-1-GO to finish and ball to launch (approx 3.5s)
    await wait(3600);

    const gameFramesDir = path.join(TMP_FRAMES_DIR, 'gameplay');
    fs.mkdirSync(gameFramesDir, { recursive: true });

    for (let i = 0; i < 28; i++) {
      // Simulate slight paddle tracking
      const mouseX = 300 + Math.sin(i * 0.4) * 80;
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: mouseX,
        y: 680,
      });

      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(gameFramesDir, `frame_${String(i).padStart(3, '0')}.png`), Buffer.from(res.data, 'base64'));
      await wait(110);
    }
    console.log('✓ Gameplay frames captured.');

    // ==========================================
    // 2. CAPTURE LEVEL STUDIO DESIGNER GIF
    // ==========================================
    console.log('\n2. Recording Level Studio Designer...');
    await setViewport(960, 680);
    await send('Page.navigate', { url: `${BASE_URL}/studio` });
    await wait(2500);

    const studioFramesDir = path.join(TMP_FRAMES_DIR, 'studio');
    fs.mkdirSync(studioFramesDir, { recursive: true });

    for (let i = 0; i < 22; i++) {
      // Simulate moving cursor over the grid
      const gridX = 320 + (i % 6) * 45;
      const gridY = 240 + Math.floor(i / 6) * 40;
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: gridX,
        y: gridY,
      });
      if (i % 3 === 0) {
        await send('Input.dispatchMouseEvent', {
          type: 'mousePressed',
          x: gridX,
          y: gridY,
          button: 'left',
          clickCount: 1,
        });
        await wait(30);
        await send('Input.dispatchMouseEvent', {
          type: 'mouseReleased',
          x: gridX,
          y: gridY,
          button: 'left',
        });
      }
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(studioFramesDir, `frame_${String(i).padStart(3, '0')}.png`), Buffer.from(res.data, 'base64'));
      await wait(120);
    }
    console.log('✓ Studio frames captured.');

    // ==========================================
    // 3. CAPTURE CAMPAIGN MAP NAVIGATION GIF
    // ==========================================
    console.log('\n3. Recording Campaign Map Navigation...');
    await setViewport(520, 800);
    await send('Page.navigate', { url: `${BASE_URL}/` });
    await wait(2800);

    const mapFramesDir = path.join(TMP_FRAMES_DIR, 'map');
    fs.mkdirSync(mapFramesDir, { recursive: true });

    for (let i = 0; i < 24; i++) {
      // Dispatch scroll wheel events
      await send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 260,
        y: 400,
        deltaX: 0,
        deltaY: (i < 12 ? -180 : 180), // scroll up then down
      });
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(mapFramesDir, `frame_${String(i).padStart(3, '0')}.png`), Buffer.from(res.data, 'base64'));
      await wait(120);
    }
    console.log('✓ Map navigation frames captured.');

    ws.close();
  } catch (err) {
    console.error('Error during GIF capture:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

captureGifs();
