import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const TMP_DIR = path.resolve('showcase/.tmp_gameplay_frames');
const OUTPUT_GIF = path.resolve('showcase/gifs/gameplay-action.gif');

if (fs.existsSync(TMP_DIR)) {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TMP_DIR, { recursive: true });

async function run() {
  console.log('Starting Headless Chrome for Live Gameplay Action Capture...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9323',
    '--user-data-dir=/tmp/chrome_gameplay_' + Date.now(),
    '--window-size=420,754',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  try {
    let listRes = null;
    for (let i = 0; i < 30; i++) {
      try {
        listRes = await fetch('http://127.0.0.1:9323/json/list');
        if (listRes.ok) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    if (!listRes) throw new Error('Could not connect to Chrome debugger');

    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
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

    await send('Emulation.setDeviceMetricsOverride', {
      width: 420,
      height: 754,
      deviceScaleFactor: 2,
      mobile: true,
    });

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    console.log('Navigating to /play/35...');
    await send('Page.navigate', { url: `${BASE_URL}/play/35` });

    // Wait for countdown sequence (approx 3.4s) to finish completely
    console.log('Waiting for countdown and launch...');
    await wait(3600);

    // Install autonomous paddle autoplayer bot that follows the ball smoothly
    await send('Runtime.evaluate', {
      expression: `
        window.__autoplayInterval = setInterval(() => {
          if (window.__gameEngine && window.__gameEngine.tsPhysics) {
            const ball = window.__gameEngine.tsPhysics.balls[0];
            if (ball) {
              window.__gameEngine.setPaddleTarget(ball.x);
              // Ensure paddle stays within bounds
              const halfW = window.__gameEngine.tsPhysics.paddle.width / 2;
              const clampedX = Math.max(halfW, Math.min(600 - halfW, ball.x));
              window.__gameEngine.tsPhysics.paddle.x = clampedX;
            }
          }
        }, 16);
      `
    });

    console.log('Capturing 80 active gameplay frames...');
    // Capture 80 frames at ~65ms intervals (approx 5.2 seconds of real gameplay)
    for (let i = 0; i < 80; i++) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(TMP_DIR, `frame_${String(i).padStart(3, '0')}.png`), Buffer.from(res.data, 'base64'));
      await wait(60);
    }
    console.log('✓ Successfully captured 80 gameplay frames!');

    ws.close();
  } catch (err) {
    console.error('Error during gameplay capture:', err);
  } finally {
    chrome.kill('SIGKILL');
  }
}

run();
