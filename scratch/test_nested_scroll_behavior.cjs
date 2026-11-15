const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = '/Users/sourav/.gemini/antigravity/brain/f5ab78d3-78d8-495b-8222-926f4e0df2e0';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9245;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const tmpProfile = fs.mkdtempSync('/tmp/chrome-test-nested-');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + tmpProfile,
    '--disable-gpu',
    '--window-size=412,915',
    'http://localhost:4173/profile?section=leaderboard',
  ]);

  await delay(2500);

  try {
    const listData = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const page = listData.find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.addEventListener('message', (event) => {
      const res = JSON.parse(event.data);
      if (res.id && pending.has(res.id)) {
        const { resolve, reject } = pending.get(res.id);
        pending.delete(res.id);
        if (res.error) reject(res.error);
        else resolve(res.result);
      }
    });

    await new Promise((resolve) => {
      if (ws.readyState === WebSocket.OPEN) resolve();
      else ws.addEventListener('open', resolve);
    });

    const send = (method, params = {}) => {
      const id = idCounter++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await delay(2000);

    // Initial check: outer.scrollTop should be 0 (user sees Hero card first)
    const initialCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const outer = document.querySelector('.overflow-y-auto');
        const inner = document.querySelector('[data-inner-scroll="true"]');
        return {
          outerScrollTop: outer ? outer.scrollTop : null,
          innerScrollTop: inner ? inner.scrollTop : null,
        };
      })()`,
      returnByValue: true,
    });
    console.log('1. Initial state:', initialCheck.result.value);

    // Capture initial state screenshot (Hero card visible at top)
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'v37_step1_body_at_top.png'), Buffer.from(shot1.data, 'base64'));

    // Test wheel down 150px: Should scroll outer (body) only
    const wheelDown1 = await send('Runtime.evaluate', {
      expression: `(() => {
        const outer = document.querySelector('.overflow-y-auto');
        outer.dispatchEvent(new WheelEvent('wheel', { deltaY: 150, bubbles: true }));
        const inner = document.querySelector('[data-inner-scroll="true"]');
        return { outerScrollTop: outer.scrollTop, innerScrollTop: inner ? inner.scrollTop : null };
      })()`,
      returnByValue: true,
    });
    console.log('2. After scrolling down 150px (body scrolls first):', wheelDown1.result.value);

    // Test wheel down 300px more: Should dock switcher at maxOuter, then inner starts scrolling
    const wheelDown2 = await send('Runtime.evaluate', {
      expression: `(() => {
        const outer = document.querySelector('.overflow-y-auto');
        // Scroll 500px down total
        outer.dispatchEvent(new WheelEvent('wheel', { deltaY: 400, bubbles: true }));
        const inner = document.querySelector('[data-inner-scroll="true"]');
        return { outerScrollTop: outer.scrollTop, innerScrollTop: inner ? inner.scrollTop : null };
      })()`,
      returnByValue: true,
    });
    console.log('3. After scrolling down 400px more (body docks, table starts scrolling):', wheelDown2.result.value);

    // Capture docked state screenshot
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'v37_step2_body_docked_table_scrolling.png'), Buffer.from(shot2.data, 'base64'));

    // Test wheel all the way down: Inner reaches maxInner, outer stays locked at maxOuter (NO glitch)
    const wheelToEnd = await send('Runtime.evaluate', {
      expression: `(() => {
        const outer = document.querySelector('.overflow-y-auto');
        const inner = document.querySelector('[data-inner-scroll="true"]');
        for (let i = 0; i < 20; i++) {
          outer.dispatchEvent(new WheelEvent('wheel', { deltaY: 200, bubbles: true }));
        }
        const maxInner = inner.scrollHeight - inner.clientHeight;
        return { outerScrollTop: outer.scrollTop, innerScrollTop: inner.scrollTop, maxInner };
      })()`,
      returnByValue: true,
    });
    console.log('4. Scrolled all the way to end of table (no glitch):', wheelToEnd.result.value);

    // Capture end state screenshot
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'v37_step3_table_at_very_end.png'), Buffer.from(shot3.data, 'base64'));

    // Test wheel back UP: Inner scrolls to 0 first, then outer scrolls back down to 0
    const wheelBackUp = await send('Runtime.evaluate', {
      expression: `(() => {
        const outer = document.querySelector('.overflow-y-auto');
        const inner = document.querySelector('[data-inner-scroll="true"]');
        // Scroll back up 3000px
        for (let i = 0; i < 30; i++) {
          outer.dispatchEvent(new WheelEvent('wheel', { deltaY: -200, bubbles: true }));
        }
        return { outerScrollTop: outer.scrollTop, innerScrollTop: inner.scrollTop };
      })()`,
      returnByValue: true,
    });
    console.log('5. Scrolled all the way back up to top (revealing hero card):', wheelBackUp.result.value);

    ws.close();
  } finally {
    chromeProc.kill();
    await delay(300);
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
