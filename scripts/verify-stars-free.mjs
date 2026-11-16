import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9274',
    '--user-data-dir=/tmp/chrome_test_verify_stars_free',
    '--window-size=430,932',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9274/json/list');
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

    // State 1: Default / When Free is available (using forceFree=1)
    await send('Page.navigate', { url: 'http://localhost:3000?forceFree=1' });
    await new Promise(r => setTimeout(r, 3500));

    const checkWithFree = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const freeBtn = document.getElementById('daily-free-collect-button');
          const breakoutLogo = Array.from(document.querySelectorAll('*')).some(el => el.textContent === 'BREAKOUT' && el.tagName === 'SPAN');
          const coresBadge = document.getElementById('top-cores-badge');
          return {
            hasFree: !!freeBtn,
            hasBreakoutLogo: breakoutLogo,
            hasCoresBadge: !!coresBadge
          };
        })()
      `,
      returnByValue: true
    });
    console.log('1. State with Free:', checkWithFree?.result?.value);

    const shotWithFree = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_stars_with_free.png', Buffer.from(shotWithFree.data, 'base64'));
    console.log('Saved verify_stars_with_free.png');

    // State 2: When Free is NOT available
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));
    // Simulate collected free
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          sessionStorage.removeItem('forceFree');
          localStorage.setItem('daily_free_collect_timestamp', Date.now().toString());
          window.dispatchEvent(new Event('storage'));
        })()
      `
    });
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    const checkWithoutFree = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const freeBtn = document.getElementById('daily-free-collect-button');
          const breakoutLogo = Array.from(document.querySelectorAll('*')).some(el => el.textContent === 'BREAKOUT' && el.tagName === 'SPAN');
          const coresBadge = document.getElementById('top-cores-badge');
          return {
            hasFree: !!freeBtn,
            hasBreakoutLogo: breakoutLogo,
            hasCoresBadge: !!coresBadge
          };
        })()
      `,
      returnByValue: true
    });
    console.log('2. State without Free:', checkWithoutFree?.result?.value);

    const shotWithoutFree = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_stars_without_free.png', Buffer.from(shotWithoutFree.data, 'base64'));
    console.log('Saved verify_stars_without_free.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
