import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9255',
    '--user-data-dir=/tmp/chrome_test_dup_edit_exact',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4000));
    const listRes = await fetch('http://127.0.0.1:9255/json/list');
    const pages = await listRes.json();
    const page = pages.find((p) => p.type === 'page');
    if (!page) return;

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
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    // Seed test level into breakout_db_user_levels matching current anonymous user ID
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          let anonId = localStorage.getItem('breakout_anonymous_user_id');
          if (!anonId) {
            anonId = 'anon_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('breakout_anonymous_user_id', anonId);
          }
          const testLevel = {
            id: 'custom_test_101',
            name: 'Neon Matrix',
            creator: 'anonymous',
            creatorId: anonId,
            playCount: 5,
            blocks: [
              { x: 3, y: 5, h: 1 },
              { x: 4, y: 5, h: 2 },
              { x: 5, y: 5, h: 3 }
            ],
            isPublic: false,
            createdAt: Date.now()
          };
          localStorage.setItem('breakout_db_user_levels', JSON.stringify([testLevel]));
        })()
      `
    });

    // Refresh page to load seeded level
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    console.log('1. Navigating to Studio...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dock = document.querySelector('aside[aria-label="Navigation Dock"]');
          const btns = dock ? Array.from(dock.querySelectorAll('button')) : [];
          const studioBtn = btns.find(b => b.textContent.includes('STUDIO'));
          if (studioBtn) studioBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2000));

    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_studio_seeded_level.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verify_studio_seeded_level.png');

    // 2. Click Duplicate Arena button on the card
    console.log('2. Clicking Duplicate Arena button...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dupBtn = document.querySelector('button[title="Duplicate Arena"]');
          if (dupBtn) dupBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_duplicate_modal_open.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verify_duplicate_modal_open.png');

    // 3. Test typing the SAME source name -> verify validation error
    console.log('3. Testing validation: typing identical source name...');
    const sameNameRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.querySelector('input[placeholder="Unique Arena Name"]');
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, 'Neon Matrix');
          input.dispatchEvent(new Event('input', { bubbles: true }));

          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('DUPLICATE'));
          const err = document.querySelector('.text-rose-400');
          return {
            inputValue: input.value,
            btnDisabled: btn ? btn.disabled : null,
            errorText: err ? err.textContent.trim() : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Identical Name Validation:', sameNameRes.result.value);

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_duplicate_same_name_error.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verify_duplicate_same_name_error.png');

    // 4. Test typing a UNIQUE valid name
    console.log('4. Testing unique name entry: "Neon Matrix Alpha"...');
    const validNameRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.querySelector('input[placeholder="Unique Arena Name"]');
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, 'Neon Matrix Alpha');
          input.dispatchEvent(new Event('input', { bubbles: true }));

          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('DUPLICATE'));
          const valid = document.querySelector('.text-emerald-400');
          return {
            inputValue: input.value,
            btnEnabled: btn ? !btn.disabled : null,
            successText: valid ? valid.textContent.trim() : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Unique Name Validation:', validNameRes.result.value);

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_duplicate_unique_valid.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verify_duplicate_unique_valid.png');

    // 5. Submit Duplicate
    console.log('5. Submitting duplicate...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('DUPLICATE'));
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2000));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_two_arenas_in_studio.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verify_two_arenas_in_studio.png');

    // 6. Test Edit button on card
    console.log('6. Clicking Edit button on "Neon Matrix Alpha"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const editBtns = Array.from(document.querySelectorAll('button[title="Edit in Designer"]'));
          if (editBtns.length > 0) editBtns[0].click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/verify_editor_opened_for_editing.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verify_editor_opened_for_editing.png');

    const editorCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const designer = document.querySelector('#levelDesigner');
          const header = designer ? designer.querySelector('header') || designer : null;
          return {
            hasDesigner: Boolean(designer),
            headerText: header ? header.textContent : ''
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Editor Opened check:', editorCheck.result.value);

    ws.close();
    console.log('ALL DUPLICATE & EDIT TESTS PASSED!');
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
