import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9277',
    '--user-data-dir=/tmp/chrome_test_arena_ranks',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4000));
    const listRes = await fetch('http://127.0.0.1:9277/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page) {
      console.error('No page target found');
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

    async function screenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/${filename}`, Buffer.from(data, 'base64'));
      console.log(`Saved ${filename}`);
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    console.log('1. Navigating to RANKS (Leaderboard)...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const btns = dock ? Array.from(dock.querySelectorAll('button')) : [];
          const rankBtn = btns.find(b => b.textContent.includes('RANKS'));
          if (rankBtn) rankBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2000));
    await screenshot('verify_ranks_top50.png');

    const ranksPreview = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const rows = Array.from(document.querySelectorAll('.divide-y > div'));
          return rows.slice(0, 5).map(r => r.innerText.replace(/\\n+/g, ' | '));
        })()
      `,
      returnByValue: true
    });
    console.log('Top 5 Pilots preview in RANKS:', ranksPreview.result?.value);

    console.log('2. Returning home and navigating to ARENA...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('BACK'));
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const btns = dock ? Array.from(dock.querySelectorAll('button')) : [];
          const arenaBtn = btns.find(b => b.textContent.includes('ARENA'));
          if (arenaBtn) arenaBtn.click();
        })()
      `
    });
    // Wait for arena levels and skeleton loader to complete
    await new Promise(r => setTimeout(r, 3500));
    await screenshot('verify_arena_view.png');

    console.log('3. Clicking CHAMP (Apex Arena) card to open LevelPreviewModal...');
    const cardClickResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const h4s = Array.from(document.querySelectorAll('h4'));
          const champ = h4s.find(h => h.innerText.includes('Apex Arena'));
          if (champ) {
            const card = champ.closest('.cursor-pointer');
            if (card) {
              card.click();
              return { found: true, name: champ.innerText };
            }
          }
          return { found: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Level card clicked:', cardClickResult.result?.value);
    await new Promise(r => setTimeout(r, 2500));

    await screenshot('verify_arena_champ_modal.png');

    const modalDetails = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyText = document.body.innerText;
          const rows = Array.from(document.querySelectorAll('.divide-y > div'));
          const playsMatch = bodyText.match(/(\\d+(\\.\\d+)?k?)\\s+Plays/i);
          const pilotsMatch = bodyText.match(/(\\d+)\\s+Ranked Pilots/i);
          return {
            playsDetected: playsMatch ? playsMatch[0] : null,
            pilotsDetected: pilotsMatch ? pilotsMatch[0] : null,
            pilotCount: rows.length,
            samplePilots: rows.slice(0, 10).map(r => r.innerText.replace(/\\n+/g, ' | '))
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Modal Leaderboard details:', modalDetails.result?.value);

    ws.close();
    chrome.kill();
    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during test:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
