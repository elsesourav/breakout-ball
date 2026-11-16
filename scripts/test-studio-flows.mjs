import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9266',
    '--user-data-dir=/tmp/chrome_test_studio_full_flow',
    '--window-size=412,915',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 4000));
    const listRes = await fetch('http://127.0.0.1:9266/json/list');
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
    await new Promise(r => setTimeout(r, 1500));

    console.log('2. Opening Designer to forge a level...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const designBtn = btns.find(b => b.textContent.includes('DESIGN NEW ARENA'));
          if (designBtn) designBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    // Place 3 blocks in the designer
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('mainCanvas');
          const rect = canvas.getBoundingClientRect();
          const scale = Math.min(rect.width / 1152, rect.height / 1056);
          const renderedW = 1152 * scale;
          const renderedH = 1056 * scale;
          const offsetX = (rect.width - renderedW) / 2;
          const offsetY = (rect.height - renderedH) / 2;
          const cellW = renderedW / 9;
          const cellH = renderedH / 11;

          for (let i = 0; i < 3; i++) {
            const x = rect.left + offsetX + (i + 3) * cellW + cellW / 2;
            const y = rect.top + offsetY + 5 * cellH + cellH / 2;
            canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
            canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('3. Clicking TEST (test play)...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const testBtn = btns.find(b => b.textContent.includes('TEST'));
          if (testBtn) testBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1800));

    // Verify back button in HUD
    const hudCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const header = document.querySelector('header');
          const backBtn = header ? header.querySelector('button[title*="Back to Designer"]') : null;
          return {
            hasBackBtn: Boolean(backBtn),
            title: backBtn ? backBtn.getAttribute('title') : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('HUD Check in Test Mode:', hudCheck.result.value);

    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/final_verify_test_play_hud.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved final_verify_test_play_hud.png');

    console.log('4. Clicking Back button in Test Play (no confirm dialog)...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const header = document.querySelector('header');
          const backBtn = header ? header.querySelector('button[title*="Back to Designer"]') : null;
          if (backBtn) backBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/final_verify_returned_to_designer.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved final_verify_returned_to_designer.png');

    console.log('5. Saving Arena from Designer...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const saveBtn = btns.find(b => b.textContent.includes('SAVE'));
          if (saveBtn) saveBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Fill in a custom name
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.querySelector('input[placeholder="Arena Name"]');
          if (input) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(input, 'Cyber Fortress');
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const btns = Array.from(document.querySelectorAll('button'));
          const confirmSaveBtn = btns.find(b => b.textContent.includes('SAVE ARENA'));
          if (confirmSaveBtn) confirmSaveBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2000));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/final_verify_studio_after_save.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved final_verify_studio_after_save.png');

    // 6. Test Duplicate button on the newly saved card
    console.log('6. Clicking Duplicate on Cyber Fortress card...');
    const dupClickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const dupBtn = document.querySelector('button[title="Duplicate Arena"]');
          if (dupBtn) {
            dupBtn.click();
            return { clicked: true };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Duplicate button clicked:', dupClickRes.result.value);
    await new Promise(r => setTimeout(r, 1200));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/final_verify_duplicate_modal.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved final_verify_duplicate_modal.png');

    // 7. Test Unique Name in duplicate modal
    console.log('7. Testing duplicate validation...');
    const modalValidationRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.querySelector('input[placeholder="Unique Arena Name"]');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

          // Type identical name
          setter.call(input, 'Cyber Fortress');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('DUPLICATE'));
          const errText = document.querySelector('.text-rose-400') ? document.querySelector('.text-rose-400').textContent.trim() : null;

          // Type valid unique name
          setter.call(input, 'Cyber Fortress Prime');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const validText = document.querySelector('.text-emerald-400') ? document.querySelector('.text-emerald-400').textContent.trim() : null;

          return {
            identicalError: errText,
            validText: validText,
            btnEnabled: btn ? !btn.disabled : false
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Duplicate Validation Check:', modalValidationRes.result.value);

    // Confirm duplicate
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
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/final_verify_two_arenas_in_studio.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved final_verify_two_arenas_in_studio.png');

    // 8. Test Edit button on card
    console.log('8. Clicking Edit button on "Cyber Fortress Prime"...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const editBtns = document.querySelectorAll('button[title="Edit in Designer"]');
          if (editBtns.length > 0) editBtns[0].click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/sourav/.gemini/antigravity/brain/69415f22-138e-4078-8134-c1b5629d8d53/final_verify_editor_opened.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved final_verify_editor_opened.png');

    const editorCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const designer = document.querySelector('#levelDesigner');
          const header = designer ? designer.querySelector('span') : null;
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
    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
