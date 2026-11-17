#!/usr/bin/env python3
"""
Generate all ElseSourav App Submission and Showcase Assets:
- App Icons (1:1): Transparent 512x512, Night 512x512, and SVG.
- Hero Carousel Banners: 21:9 Ultrawide Desktop (2520x1080) and 3:4 Mobile (1200x1600).
- App Cover Images: 16:9 Landscape (1600x900) and 3:4 Portrait (1200x1600).
- Devlog / Update Post Banner: 16:9 Landscape (1600x900).

ALL BANNERS EXCLUSIVELY SHOWCASE THE MOBILE VERSION (SMARTPHONE MOCKUPS & MOBILE UI).
ZERO DESKTOP SCREENS ARE USED.
"""
import os
import shutil
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
SHOWCASE_DIR = os.path.join(BASE_DIR, 'showcase')
RAW_DIR = os.path.join(SHOWCASE_DIR, '.raw_916')
APP_ICONS_DIR = os.path.join(SHOWCASE_DIR, 'app-icons')
BANNERS_DIR = os.path.join(SHOWCASE_DIR, 'banners')
SCREENSHOTS_DIR = os.path.join(SHOWCASE_DIR, 'screenshots')

os.makedirs(APP_ICONS_DIR, exist_ok=True)
os.makedirs(BANNERS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# System Fonts on macOS
FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_TITLE = '/System/Library/Fonts/Supplemental/Futura.ttc'
FONT_TREBUCHET = '/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf'
FONT_REGULAR = '/System/Library/Fonts/HelveticaNeue.ttc'

def get_font(font_path, size):
    try:
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

def clean_source_icon():
    clean_src = os.path.join(PUBLIC_DIR, 'icon-breakout-clean.png')
    if os.path.exists(clean_src):
        return Image.open(clean_src).convert('RGBA')
    orig_src = os.path.join(PUBLIC_DIR, 'icon-breakout.png')
    im = Image.open(orig_src).convert('RGBA')
    arr = np.array(im)
    arr[arr[:, :, 3] <= 12, 3] = 0
    cleaned = Image.fromarray(arr)
    bbox = cleaned.getbbox()
    cropped = cleaned.crop(bbox)
    w, h = cropped.size
    dim = max(w, h)
    sq = Image.new('RGBA', (int(dim * 1.08), int(dim * 1.08)), (0, 0, 0, 0))
    sq.paste(cropped, ((sq.width - w) // 2, (sq.height - h) // 2), cropped)
    return sq

def create_cyber_background(w, h):
    """
    Creates high-tech futuristic gradient background with grid lines and neon glow spots.
    """
    y, x = np.ogrid[:h, :w]
    cx, cy = w * 0.45, h * 0.5
    max_r = math.hypot(cx, cy)
    r = np.hypot(x - cx, y - cy) / max_r
    t = np.clip(r, 0.0, 1.0) ** 1.8
    
    red = (10 * (1 - t) + 2 * t).astype(np.uint8)
    green = (16 * (1 - t) + 4 * t).astype(np.uint8)
    blue = (36 * (1 - t) + 10 * t).astype(np.uint8)
    alpha = np.full((h, w), 255, dtype=np.uint8)
    
    bg = Image.fromarray(np.dstack([red, green, blue, alpha]))
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    grid_spacing = max(30, int(w / 48))
    for gx in range(0, w, grid_spacing):
        draw.line([(gx, 0), (gx, h)], fill=(16, 32, 64, 28), width=1)
    for gy in range(0, h, grid_spacing):
        draw.line([(0, gy), (w, gy)], fill=(16, 32, 64, 28), width=1)
        
    glow_r1 = int(min(w, h) * 0.5)
    draw.ellipse([int(w * 0.75 - glow_r1), int(h * 0.3 - glow_r1),
                  int(w * 0.75 + glow_r1), int(h * 0.3 + glow_r1)],
                 fill=(0, 240, 255, 32))
                 
    glow_r2 = int(min(w, h) * 0.4)
    draw.ellipse([int(w * 0.2 - glow_r2), int(h * 0.8 - glow_r2),
                  int(w * 0.2 + glow_r2), int(h * 0.8 + glow_r2)],
                 fill=(168, 85, 247, 28))

    glow_r3 = int(min(w, h) * 0.3)
    draw.ellipse([int(w * 0.6 - glow_r3), int(h * 0.65 - glow_r3),
                  int(w * 0.6 + glow_r3), int(h * 0.65 + glow_r3)],
                 fill=(255, 120, 30, 24))

    blurred_overlay = overlay.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.05)))
    return Image.alpha_composite(bg, blurred_overlay)

def create_mobile_phone_mockup(raw_filename, phone_w, phone_h, corner_radius=36, border_color=(0, 240, 255, 230)):
    """
    Renders a realistic smartphone mockup around native 9:16 mobile screenshots:
    - Titanium chassis
    - Full-bleed mobile screen with rounded corners
    - Sleek punch-hole camera (zero obstruction of top game HUD)
    """
    raw_path = os.path.join(RAW_DIR, raw_filename)
    if not os.path.exists(raw_path):
        raw_path = os.path.join(SCREENSHOTS_DIR, raw_filename)
    screenshot_img = Image.open(raw_path).convert('RGBA')

    # 1. Base phone chassis
    phone = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(phone)
    pdraw.rounded_rectangle([0, 0, phone_w, phone_h], radius=corner_radius, fill=(8, 12, 22, 255))
    
    # 2. Resize and crop mobile screenshot to screen area
    bezel = max(6, int(phone_w * 0.024))
    screen_w = phone_w - bezel * 2
    screen_h = phone_h - bezel * 2
    screen_r = max(10, corner_radius - bezel)
    
    src_w, src_h = screenshot_img.size
    aspect = src_w / src_h
    target_aspect = screen_w / screen_h
    
    if aspect > target_aspect:
        new_h = screen_h
        new_w = int(screen_h * aspect)
    else:
        new_w = screen_w
        new_h = int(screen_w / aspect)
        
    resized_sc = screenshot_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - screen_w) // 2
    top = (new_h - screen_h) // 2
    cropped_sc = resized_sc.crop((left, top, left + screen_w, top + screen_h))
    
    # Screen mask
    s_mask = Image.new('L', (screen_w, screen_h), 0)
    s_draw = ImageDraw.Draw(s_mask)
    s_draw.rounded_rectangle([0, 0, screen_w, screen_h], radius=screen_r, fill=255)
    
    screen_layer = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    screen_layer.paste(cropped_sc, (bezel, bezel), s_mask)
    phone = Image.alpha_composite(phone, screen_layer)
    
    # 3. Modern Sleek Camera Punch-Hole (subtle top dot, keeping HUD fully visible)
    pdraw = ImageDraw.Draw(phone)
    cam_r = max(3, int(phone_w * 0.008))
    cx = phone_w // 2
    cy = bezel + cam_r + 2
    pdraw.ellipse([cx - cam_r, cy - cam_r, cx + cam_r, cy + cam_r], fill=(0, 0, 0, 240), outline=(20, 30, 45, 180), width=1)
    
    # 4. Outer Glowing Titanium / Neon Border
    border_layer = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_layer)
    bdraw.rounded_rectangle([1, 1, phone_w - 2, phone_h - 2], radius=corner_radius, outline=border_color, width=3)
    bdraw.rounded_rectangle([bezel - 1, bezel - 1, phone_w - bezel + 1, phone_h - bezel + 1],
                            radius=screen_r + 1, outline=(255, 255, 255, 40), width=1)
    
    return Image.alpha_composite(phone, border_layer)

def paste_phone_with_smooth_shadow(canvas, phone_img, x, y, pad=100, blur_radius=25, opacity=220):
    """
    Pastes phone onto canvas with a generous shadow margin to guarantee zero box clipping.
    """
    pw, ph = phone_img.size
    shadow_box = Image.new('RGBA', (pw + pad * 2, ph + pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_box)
    sdraw.rounded_rectangle([pad + 4, pad + 10, pad + pw - 4, pad + ph + 2], radius=38, fill=(0, 0, 0, opacity))
    blurred = shadow_box.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    
    canvas.paste(blurred, (x - pad, y - pad), blurred)
    canvas.paste(phone_img, (x, y), phone_img)

def draw_cta_button(draw, x, y, w, h, text, fill=(0, 229, 255), text_color=(5, 12, 30), font=None):
    """
    Draws a high-contrast pill button with a crisp vector play triangle.
    """
    draw.rounded_rectangle([x, y, x + w, y + h], radius=h // 2,
                           fill=fill, outline=(255, 255, 255, 140), width=2)
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    arrow_sz = 14
    gap = 14
    total_w = tw + gap + arrow_sz
    start_x = x + (w - total_w) // 2
    ty = y + (h - th) // 2 - 2
    draw.text((start_x, ty), text, font=font, fill=text_color)
    
    ax = start_x + tw + gap
    ay = y + (h - arrow_sz) // 2
    draw.polygon([(ax, ay), (ax + arrow_sz, ay + arrow_sz // 2), (ax, ay + arrow_sz)], fill=text_color)

def generate_icons(clean_icon):
    print("Generating ElseSourav App Icons (512x512)...")
    
    # 1. 512x512 Transparent Icon
    icon_transparent = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    scaled_icon = clean_icon.resize((480, 480), Image.Resampling.LANCZOS)
    icon_transparent.paste(scaled_icon, (16, 16), scaled_icon)
    icon_transparent.save(os.path.join(APP_ICONS_DIR, 'app-icon-512x512.png'), 'PNG')
    
    # 2. 512x512 Cyber Night App Icon
    night_bg = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    y, x = np.ogrid[:512, :512]
    cx, cy = 256.0, 256.0
    r = np.hypot(x - cx, y - cy) / 362.0
    t = np.clip(r, 0.0, 1.0) ** 1.5
    red = (18 * (1 - t) + 4 * t).astype(np.uint8)
    green = (26 * (1 - t) + 6 * t).astype(np.uint8)
    blue = (58 * (1 - t) + 16 * t).astype(np.uint8)
    alpha = np.full((512, 512), 255, dtype=np.uint8)
    bg_core = Image.fromarray(np.dstack([red, green, blue, alpha]))
    
    icon_mask = Image.new('L', (512, 512), 0)
    im_draw = ImageDraw.Draw(icon_mask)
    im_draw.rounded_rectangle([0, 0, 512, 512], radius=110, fill=255)
    
    night_icon = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    night_icon.paste(bg_core, (0, 0), icon_mask)
    
    border_draw = ImageDraw.Draw(night_icon)
    border_draw.rounded_rectangle([3, 3, 509, 509], radius=108, outline=(0, 240, 255, 160), width=4)
    border_draw.rounded_rectangle([7, 7, 505, 505], radius=104, outline=(168, 85, 247, 80), width=2)
    
    scaled_fireball = clean_icon.resize((410, 410), Image.Resampling.LANCZOS)
    night_icon.paste(scaled_fireball, (51, 51), scaled_fireball)
    night_icon.save(os.path.join(APP_ICONS_DIR, 'app-icon-night-512x512.png'), 'PNG')
    
    svg_source = os.path.join(PUBLIC_DIR, 'favicon.svg')
    if os.path.exists(svg_source):
        shutil.copyfile(svg_source, os.path.join(APP_ICONS_DIR, 'app-icon.svg'))
    print("✓ App icons generated successfully.")

def generate_desktop_carousel_banner(clean_icon):
    """
    21:9 Ultrawide Desktop Carousel Banner (2520x1080)
    EXCLUSIVELY FEATURING MOBILE SMARTPHONES & MOBILE UI (NO DESKTOP WINDOWS).
    """
    print("Generating Desktop Carousel Banner (2520x1080 - 21:9 - Pure Mobile Mockups)...")
    w, h = 2520, 1080
    banner = create_cyber_background(w, h)
    draw = ImageDraw.Draw(banner)
    
    font_badge = get_font(FONT_BOLD, 24)
    font_title = get_font(FONT_TITLE, 94)
    font_subtitle = get_font(FONT_TREBUCHET, 42)
    font_body = get_font(FONT_REGULAR, 30)
    font_pill = get_font(FONT_BOLD, 22)
    font_btn = get_font(FONT_BOLD, 28)
    
    # LEFT CONTENT
    left_x = 130
    
    # Badge Pill (Dynamic width)
    badge_text = "// MOBILE ARCADE REVOLUTION • 100 SECTORS"
    bbox_b = font_badge.getbbox(badge_text)
    bw = bbox_b[2] - bbox_b[0] + 44
    bh = 50
    by = 135
    draw.rounded_rectangle([left_x, by, left_x + bw, by + bh], radius=25,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 210), width=2)
    draw.text((left_x + 22, by + 11), badge_text, font=font_badge, fill=(0, 240, 255))
    
    # Fireball icon miniature next to title
    icon_sm = clean_icon.resize((115, 115), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 215), icon_sm)
    
    # Title
    draw.text((left_x + 130, 220), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 355), "MOBILE CYBER ARCADE", font=font_subtitle, fill=(0, 229, 255))
    
    # Body Description
    draw.text((left_x, 435), "Engineered for pure mobile immersion: high-octane physics,", font=font_body, fill=(203, 213, 225))
    draw.text((left_x, 482), "fluid touch steering, 100 tactical sectors, and live rankings.", font=font_body, fill=(148, 163, 184))
    
    # Feature Pills in 2 clean, perfectly balanced rows
    row1_pills = [
        ("C++ WASM Physics", (0, 229, 255)),
        ("Touch & Tilt Steering", (168, 85, 247)),
        ("Global Apex Arena", (244, 63, 94))
    ]
    row2_pills = [
        ("Level Studio", (234, 179, 8)),
        ("Cyber Armory", (34, 197, 94)),
        ("Multi-Device Cloud Sync", (0, 240, 255))
    ]
    
    for r_idx, r_pills in enumerate([row1_pills, row2_pills]):
        px = left_x
        py = 560 + r_idx * 64
        for label, col in r_pills:
            l_bbox = font_pill.getbbox(label)
            pw = l_bbox[2] - l_bbox[0] + 44
            draw.rounded_rectangle([px, py, px + pw, py + 48], radius=14,
                                   fill=(15, 23, 42, 200), outline=(col[0], col[1], col[2], 180), width=2)
            draw.ellipse([px + 14, py + 20, px + 22, py + 28], fill=col)
            draw.text((px + 28, py + 10), label, font=font_pill, fill=col)
            px += pw + 18
        
    # CTA Buttons
    btn_x = left_x
    btn_y = 720
    draw_cta_button(draw, btn_x, btn_y, 280, 68, "PLAY NOW", fill=(0, 229, 255), text_color=(5, 12, 30), font=font_btn)
    
    draw.rounded_rectangle([btn_x + 310, btn_y, btn_x + 600, btn_y + 68], radius=34,
                           fill=(15, 23, 42, 220), outline=(255, 255, 255, 120), width=2)
    draw.text((btn_x + 350, btn_y + 16), "LEVEL STUDIO", font=font_btn, fill=(241, 245, 249))

    # RIGHT SIDE: Triple Mobile Smartphone Presentation Showcase (Pure 9:16 Screens)
    # Phone 3 (Tertiary background peek - Level Preview): 380 x 640
    phone_3 = create_mobile_phone_mockup('raw_02_preview.png', 380, 640, corner_radius=34, border_color=(244, 63, 94, 200))
    paste_phone_with_smooth_shadow(banner, phone_3, 1180, 260, pad=100, blur_radius=22, opacity=190)

    # Phone 2 (Secondary - Campaign Map): 430 x 730
    phone_2 = create_mobile_phone_mockup('raw_01_map.png', 430, 730, corner_radius=38, border_color=(168, 85, 247, 230))
    paste_phone_with_smooth_shadow(banner, phone_2, 1950, 200, pad=100, blur_radius=25, opacity=210)

    # Phone 1 (Primary - Gameplay Action): 470 x 800
    phone_1 = create_mobile_phone_mockup('raw_03_gameplay.png', 470, 800, corner_radius=42, border_color=(0, 240, 255, 240))
    paste_phone_with_smooth_shadow(banner, phone_1, 1400, 140, pad=120, blur_radius=28, opacity=230)

    out_path = os.path.join(BANNERS_DIR, 'carousel-slider-desktop-21x9.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Desktop carousel (pure mobile showcase) saved: {out_path}")

def generate_mobile_carousel_banner(clean_icon):
    """
    3:4 Mobile Carousel Banner (1200x1600)
    """
    print("Generating Mobile Carousel Banner (1200x1600 - 3:4)...")
    w, h = 1200, 1600
    banner = create_cyber_background(w, h)
    draw = ImageDraw.Draw(banner)
    
    font_badge = get_font(FONT_BOLD, 22)
    font_title = get_font(FONT_TITLE, 74)
    font_subtitle = get_font(FONT_TREBUCHET, 36)
    font_body = get_font(FONT_REGULAR, 26)
    font_pill = get_font(FONT_BOLD, 22)
    font_btn = get_font(FONT_BOLD, 30)

    # Top: Badge (dynamic width)
    badge_text = "// MOBILE ARCADE 2.0 • 100 SECTORS"
    bbox = font_badge.getbbox(badge_text)
    bw = bbox[2] - bbox[0] + 44
    draw.rounded_rectangle([(w - bw) // 2, 65, (w + bw) // 2, 115], radius=25,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 220), width=2)
    draw.text(((w - bw) // 2 + 22, 77), badge_text, font=font_badge, fill=(0, 240, 255))
    
    icon_sz = 125
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, ((w - icon_sz) // 2, 135), icon_sm)
    
    draw.text(((w - 600) // 2, 280), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text(((w - 470) // 2, 368), "CYBER ARCADE 2.0", font=font_subtitle, fill=(0, 229, 255))
    draw.text(((w - 640) // 2, 420), "C++ WebAssembly Physics • Real-Time Arena", font=font_body, fill=(203, 213, 225))

    # Center: Mobile Phone Mockup (Gameplay Action)
    phone = create_mobile_phone_mockup('raw_03_gameplay.png', 490, 800, corner_radius=42, border_color=(0, 240, 255, 230))
    paste_phone_with_smooth_shadow(banner, phone, (w - 490) // 2, 500, pad=100, blur_radius=25, opacity=230)

    # Dynamic centered pills
    pills = [("C++ WASM", (0, 229, 255)), ("Touch / Gyro", (168, 85, 247)), ("Studio", (244, 63, 94))]
    pill_widths = []
    for label, _ in pills:
        l_box = font_pill.getbbox(label)
        pill_widths.append(l_box[2] - l_box[0] + 46)
    
    total_pw = sum(pill_widths) + (len(pills) - 1) * 20
    px = (w - total_pw) // 2
    for (label, col), pw in zip(pills, pill_widths):
        draw.rounded_rectangle([px, 1345, px + pw, 1395], radius=14,
                               fill=(15, 23, 42, 220), outline=col, width=2)
        draw.ellipse([px + 14, 1366, px + 22, 1374], fill=col)
        draw.text((px + 28, 1358), label, font=font_pill, fill=col)
        px += pw + 20

    draw_cta_button(draw, (w - 420) // 2, 1435, 420, 76, "PLAY NOW", fill=(0, 229, 255), text_color=(5, 12, 30), font=font_btn)

    out_path = os.path.join(BANNERS_DIR, 'carousel-slider-mobile-3x4.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Mobile carousel saved: {out_path}")

def generate_landscape_app_cover(clean_icon):
    """
    16:9 Landscape App Cover (1600x900)
    EXCLUSIVELY FEATURING MOBILE SMARTPHONE MOCKUPS (NO DESKTOP WINDOWS).
    """
    print("Generating Landscape App Cover (1600x900 - 16:9 - Pure Mobile Mockup)...")
    w, h = 1600, 900
    banner = create_cyber_background(w, h)
    draw = ImageDraw.Draw(banner)
    
    font_badge = get_font(FONT_BOLD, 20)
    font_title = get_font(FONT_TITLE, 70)
    font_subtitle = get_font(FONT_TREBUCHET, 32)
    font_body = get_font(FONT_REGULAR, 23)
    font_pill = get_font(FONT_BOLD, 20)
    font_btn = get_font(FONT_BOLD, 24)

    left_x = 90
    
    # Badge (dynamic width)
    badge_text = "// NEXT-GEN MOBILE BRICK BREAKER"
    bbox_b = font_badge.getbbox(badge_text)
    bw = bbox_b[2] - bbox_b[0] + 40
    draw.rounded_rectangle([left_x, 110, left_x + bw, 154], radius=22,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 200), width=2)
    draw.text((left_x + 20, 122), badge_text, font=font_badge, fill=(0, 240, 255))
    
    # Title & Icon
    icon_sz = 95
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 180), icon_sm)
    
    draw.text((left_x + 110, 185), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 285), "CYBER ARCADE REIMAGINED", font=font_subtitle, fill=(0, 229, 255))
    
    draw.text((left_x, 345), "100 Tactical Sectors with C++ WASM Physics,", font=font_body, fill=(203, 213, 225))
    draw.text((left_x, 385), "Touch / Gyro Tilt Steering, and Real-Time Arena.", font=font_body, fill=(148, 163, 184))

    # Feature Pills (dynamic width)
    pills = [
        ("WASM Physics", (0, 229, 255)),
        ("Touch & Tilt", (168, 85, 247)),
        ("Global Apex", (244, 63, 94)),
        ("Level Studio", (234, 179, 8))
    ]
    px = left_x
    for label, col in pills:
        l_box = font_pill.getbbox(label)
        pw = l_box[2] - l_box[0] + 40
        draw.rounded_rectangle([px, 460, px + pw, 506], radius=12,
                               fill=(15, 23, 42, 220), outline=col, width=2)
        draw.ellipse([px + 12, 480, px + 18, 486], fill=col)
        draw.text((px + 24, 471), label, font=font_pill, fill=col)
        px += pw + 16

    # CTA Button
    draw_cta_button(draw, left_x, 555, 230, 60, "PLAY FREE", fill=(0, 229, 255), text_color=(5, 12, 30), font=font_btn)

    # RIGHT: Dual Mobile Smartphone Mockups (Gameplay + Campaign Map)
    # Secondary Phone (Campaign Map): 350 x 590
    phone_2 = create_mobile_phone_mockup('raw_01_map.png', 350, 590, corner_radius=34, border_color=(168, 85, 247, 210))
    paste_phone_with_smooth_shadow(banner, phone_2, 900, 190, pad=90, blur_radius=22, opacity=200)

    # Primary Phone (Gameplay): 400 x 680
    phone_1 = create_mobile_phone_mockup('raw_03_gameplay.png', 400, 680, corner_radius=38, border_color=(0, 240, 255, 230))
    paste_phone_with_smooth_shadow(banner, phone_1, 1100, 110, pad=100, blur_radius=25, opacity=230)

    out_path = os.path.join(BANNERS_DIR, 'app-cover-landscape-16x9.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Landscape app cover (pure mobile mockup) saved: {out_path}")

def generate_portrait_app_cover(clean_icon):
    """
    3:4 Portrait App Cover (1200x1600)
    """
    print("Generating Portrait App Cover (1200x1600 - 3:4)...")
    w, h = 1200, 1600
    banner = create_cyber_background(w, h)
    draw = ImageDraw.Draw(banner)
    
    font_title = get_font(FONT_TITLE, 78)
    font_subtitle = get_font(FONT_TREBUCHET, 38)
    font_body = get_font(FONT_REGULAR, 28)
    font_btn = get_font(FONT_BOLD, 32)

    # Top: Logo & Title
    icon_sz = 145
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, ((w - icon_sz) // 2, 85), icon_sm)

    draw.text(((w - 640) // 2, 260), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text(((w - 530) // 2, 350), "CYBER ARCADE REIMAGINED", font=font_subtitle, fill=(0, 229, 255))
    draw.text(((w - 620) // 2, 410), "100 Tactical Sectors • C++ WASM Physics", font=font_body, fill=(203, 213, 225))

    # Center: Mobile Phone Mockup (Campaign Map)
    phone = create_mobile_phone_mockup('raw_01_map.png', 500, 850, corner_radius=44, border_color=(0, 240, 255, 230))
    paste_phone_with_smooth_shadow(banner, phone, (w - 500) // 2, 485, pad=100, blur_radius=25, opacity=230)

    draw_cta_button(draw, (w - 440) // 2, 1420, 440, 80, "PLAY NOW", fill=(0, 229, 255), text_color=(5, 12, 30), font=font_btn)

    out_path = os.path.join(BANNERS_DIR, 'app-cover-portrait-3x4.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Portrait app cover saved: {out_path}")

def generate_update_post_banner(clean_icon):
    """
    16:9 Update Post Banner (1600x900)
    EXCLUSIVELY FEATURING MOBILE SMARTPHONE MOCKUPS (NO DESKTOP WINDOWS).
    """
    print("Generating Devlog / Update Banner (1600x900 - 16:9 - Pure Mobile Mockups)...")
    w, h = 1600, 900
    banner = create_cyber_background(w, h)
    draw = ImageDraw.Draw(banner)
    
    font_badge = get_font(FONT_BOLD, 20)
    font_title = get_font(FONT_TITLE, 64)
    font_subtitle = get_font(FONT_TREBUCHET, 32)
    font_body = get_font(FONT_REGULAR, 23)
    font_pill = get_font(FONT_BOLD, 19)

    left_x = 85

    # Badge (dynamic width)
    badge_text = "// DEVLOG UPDATE • VERSION 2.0"
    bbox_b = font_badge.getbbox(badge_text)
    bw = bbox_b[2] - bbox_b[0] + 40
    draw.rounded_rectangle([left_x, 90, left_x + bw, 134], radius=22,
                           fill=(13, 22, 48, 230), outline=(244, 63, 94, 220), width=2)
    draw.text((left_x + 20, 102), badge_text, font=font_badge, fill=(244, 63, 94))

    icon_sz = 88
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 155), icon_sm)

    # Title: Two crisp stacked lines so it never crowds phone_2
    draw.text((left_x + 105, 145), "ROAD TO", font=font_title, fill=(255, 255, 255))
    draw.text((left_x + 105, 215), "100 SECTORS", font=font_title, fill=(255, 255, 255))
    
    draw.text((left_x, 305), "MOBILE ARCADE MAJOR OVERHAUL", font=font_subtitle, fill=(0, 229, 255))

    changelog = [
        "100 Hand-Crafted Sectors across 10 Cyber Worlds",
        "C++ WASM Physics Engine with fluid touch response",
        "Mobile Level Designer Studio with cloud sharing",
        "Live Apex Arena with global mobile leaderboards",
        "Cyber Armory with customizable hulls, balls & trails"
    ]
    cy = 368
    for item in changelog:
        draw.ellipse([left_x, cy + 7, left_x + 10, cy + 17], fill=(0, 240, 255))
        draw.text((left_x + 22, cy), item, font=font_body, fill=(203, 213, 225))
        cy += 40

    pill_text = "LIVE ON ELSESOURAV.COM"
    p_box = font_pill.getbbox(pill_text)
    pw = p_box[2] - p_box[0] + 54
    draw.rounded_rectangle([left_x, 595, left_x + pw, 642], radius=14,
                           fill=(15, 23, 42, 220), outline=(0, 229, 255), width=2)
    draw.ellipse([left_x + 18, 614, left_x + 26, 622], fill=(0, 229, 255))
    draw.text((left_x + 36, 608), pill_text, font=font_pill, fill=(0, 229, 255))

    # RIGHT: Dual Mobile Smartphone Mockups (Mobile Studio + Mobile Arena)
    # Secondary Phone (Global Arena): 350 x 590
    phone_2 = create_mobile_phone_mockup('raw_04_arena.png', 350, 590, corner_radius=34, border_color=(0, 240, 255, 210))
    paste_phone_with_smooth_shadow(banner, phone_2, 900, 190, pad=90, blur_radius=22, opacity=200)

    # Primary Phone (Studio Designer): 400 x 680
    phone_1 = create_mobile_phone_mockup('raw_05_designer.png', 400, 680, corner_radius=38, border_color=(244, 63, 94, 230))
    paste_phone_with_smooth_shadow(banner, phone_1, 1100, 110, pad=100, blur_radius=25, opacity=230)

    out_path = os.path.join(BANNERS_DIR, 'update-banner-v2-16x9.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Update post banner (pure mobile mockups) saved: {out_path}")

def main():
    print("--- Starting Generation of Pure Mobile Showcase Assets ---")
    clean_icon = clean_source_icon()
    generate_icons(clean_icon)
    generate_desktop_carousel_banner(clean_icon)
    generate_mobile_carousel_banner(clean_icon)
    generate_landscape_app_cover(clean_icon)
    generate_portrait_app_cover(clean_icon)
    generate_update_post_banner(clean_icon)
    print("--- All Showcase Assets Generated Successfully! ---")

if __name__ == '__main__':
    main()
