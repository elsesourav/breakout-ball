import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--user-data-dir=/tmp/chrome_test_verify_sectors',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4500));
    const listRes = await fetch('http://127.0.0.1:9295/json/list');
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

    async function captureSector(targetLevel, filename) {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const scrollContainer = document.querySelectorAll('.overflow-y-auto')[0];
            const node = document.getElementById('roadmap-level-node-${targetLevel}');
            if (node && scrollContainer) {
              const item = node.closest('.roadmap-scale-item');
              const top = item ? item.offsetTop : node.offsetTop;
              scrollContainer.scrollTop = top - 320;
            }
          })()
        `
      });
      await new Promise(r => setTimeout(r, 1200));

      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      if (screenshot && screenshot.data) {
        fs.writeFileSync(filename, Buffer.from(screenshot.data, 'base64'));
        console.log(`Saved screenshot: ${filename}`);
      }
    }

    // Capture Sector 1 (levels 1-10)
    await captureSector(1, '/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_sector_1.png');

    // Capture Sector 2 (levels 11-20)
    await captureSector(11, '/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_sector_2.png');

    // Capture Sector 3 (levels 21-30)
    await captureSector(21, '/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_sector_3.png');

    // Capture Sector 4 (levels 31-40)
    await captureSector(31, '/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_sector_4.png');

    // Capture Sector 5 (levels 41-50) & Summit Banner
    await captureSector(50, '/Users/sourav/.gemini/antigravity/brain/3d7b0e3e-776f-41c0-ad5c-dad3270831ce/verify_sector_5.png');

    ws.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    chrome.kill();
  }
}

run();
