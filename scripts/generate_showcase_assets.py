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

def create_mobile_phone_mockup(screenshot_img, phone_w, phone_h, corner_radius=38, border_color=(0, 240, 255, 230)):
    """
    Renders a sleek futuristic mobile smartphone mockup:
    - Titanium / dark glass chassis with glowing neon chamfer
    - Full-bleed mobile screen with rounded corners
    - Dynamic Island camera capsule at the top
    """
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
    
    # 3. Dynamic Island / Speaker Pill
    pdraw = ImageDraw.Draw(phone)
    pill_w = int(screen_w * 0.28)
    pill_h = max(10, int(screen_h * 0.026))
    pill_x = (phone_w - pill_w) // 2
    pill_y = bezel + 6
    pdraw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=pill_h // 2, fill=(0, 0, 0, 230))
    # Camera dot
    cam_sz = max(4, pill_h // 3)
    pdraw.ellipse([pill_x + pill_w - cam_sz * 3, pill_y + (pill_h - cam_sz) // 2,
                   pill_x + pill_w - cam_sz * 2, pill_y + (pill_h + cam_sz) // 2], fill=(20, 30, 50, 255))
    
    # 4. Outer Glowing Titanium / Neon Border
    border_layer = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_layer)
    bdraw.rounded_rectangle([1, 1, phone_w - 2, phone_h - 2], radius=corner_radius, outline=border_color, width=3)
    bdraw.rounded_rectangle([bezel - 1, bezel - 1, phone_w - bezel + 1, phone_h - bezel + 1],
                            radius=screen_r + 1, outline=(255, 255, 255, 40), width=1)
    
    return Image.alpha_composite(phone, border_layer)

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
    
    font_badge = get_font(FONT_BOLD, 28)
    font_title = get_font(FONT_TITLE, 102)
    font_subtitle = get_font(FONT_TREBUCHET, 46)
    font_body = get_font(FONT_REGULAR, 32)
    font_pill = get_font(FONT_BOLD, 26)
    font_btn = get_font(FONT_BOLD, 30)
    
    # LEFT CONTENT
    left_x = 130
    
    # Badge Pill
    badge_text = "★ MOBILE ARCADE REVOLUTION • 100 SECTORS"
    bbox_b = font_badge.getbbox(badge_text)
    bw = bbox_b[2] - bbox_b[0] + 44
    bh = 54
    by = 150
    draw.rounded_rectangle([left_x, by, left_x + bw, by + bh], radius=27,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 210), width=2)
    draw.text((left_x + 22, by + 12), badge_text, font=font_badge, fill=(0, 240, 255))
    
    # Fireball icon miniature next to title
    icon_sm = clean_icon.resize((120, 120), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 230), icon_sm)
    
    # Title
    draw.text((left_x + 135, 235), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 375), "MOBILE CYBER ARCADE", font=font_subtitle, fill=(0, 229, 255))
    
    # Body Description
    draw.text((left_x, 460), "Engineered for pure mobile immersion: high-octane physics,", font=font_body, fill=(203, 213, 225))
    draw.text((left_x, 510), "fluid touch steering, 100 tactical sectors, and live rankings.", font=font_body, fill=(148, 163, 184))
    
    # Feature Pills
    pills = [
        ("⚡ C++ WASM Physics", (0, 229, 255)),
        ("📱 Touch & Gyro Tilt", (168, 85, 247)),
        ("🌐 Global Apex Arena", (244, 63, 94)),
        ("🛠️ Level Studio", (234, 179, 8)),
        ("🛡️ Cyber Armory", (34, 197, 94))
    ]
    px = left_x
    py = 610
    for label, col in pills:
        l_bbox = font_pill.getbbox(label)
        pw = l_bbox[2] - l_bbox[0] + 36
        draw.rounded_rectangle([px, py, px + pw, py + 52], radius=14,
                               fill=(15, 23, 42, 200), outline=(col[0], col[1], col[2], 180), width=2)
        draw.text((px + 18, py + 11), label, font=font_pill, fill=col)
        px += pw + 18
        
    # CTA Buttons
    btn_x = left_x
    btn_y = 720
    draw.rounded_rectangle([btn_x, btn_y, btn_x + 290, btn_y + 72], radius=36,
                           fill=(0, 229, 255), outline=(255, 255, 255, 120), width=2)
    draw.text((btn_x + 60, btn_y + 18), "PLAY NOW ▶", font=font_btn, fill=(5, 12, 30))
    
    draw.rounded_rectangle([btn_x + 320, btn_y, btn_x + 630, btn_y + 72], radius=36,
                           fill=(15, 23, 42, 220), outline=(255, 255, 255, 120), width=2)
    draw.text((btn_x + 365, btn_y + 18), "LEVEL STUDIO", font=font_btn, fill=(241, 245, 249))

    # RIGHT SIDE: Dual Mobile Smartphone Presentation Showcase
    # Phone 1 (Primary - Gameplay Action): 460 x 780
    sc_action_path = os.path.join(SCREENSHOTS_DIR, 'mobile-03-gameplay-action.png')
    if os.path.exists(sc_action_path):
        sc_action = Image.open(sc_action_path)
        phone_1 = create_mobile_phone_mockup(sc_action, 470, 800, corner_radius=42, border_color=(0, 240, 255, 240))
        # Shadow
        p1_shadow = Image.new('RGBA', (510, 840), (0, 0, 0, 0))
        p1_sdraw = ImageDraw.Draw(p1_shadow)
        p1_sdraw.rounded_rectangle([20, 20, 490, 820], radius=42, fill=(0, 0, 0, 230))
        p1_shadow = p1_shadow.filter(ImageFilter.GaussianBlur(radius=25))
        banner.paste(p1_shadow, (1380, 120), p1_shadow)
        banner.paste(phone_1, (1400, 140), phone_1)

    # Phone 2 (Secondary - Campaign Map): 420 x 720
    sc_map_path = os.path.join(SCREENSHOTS_DIR, 'mobile-01-campaign-map.png')
    if os.path.exists(sc_map_path):
        sc_map = Image.open(sc_map_path)
        phone_2 = create_mobile_phone_mockup(sc_map, 430, 730, corner_radius=38, border_color=(168, 85, 247, 230))
        p2_shadow = Image.new('RGBA', (470, 770), (0, 0, 0, 0))
        p2_sdraw = ImageDraw.Draw(p2_shadow)
        p2_sdraw.rounded_rectangle([20, 20, 450, 750], radius=38, fill=(0, 0, 0, 220))
        p2_shadow = p2_shadow.filter(ImageFilter.GaussianBlur(radius=22))
        banner.paste(p2_shadow, (1930, 180), p2_shadow)
        banner.paste(phone_2, (1950, 200), phone_2)

    # Phone 3 (Tertiary background peek - Level Preview): 370 x 630
    sc_prev_path = os.path.join(SCREENSHOTS_DIR, 'mobile-02-level-preview.png')
    if os.path.exists(sc_prev_path):
        sc_prev = Image.open(sc_prev_path)
        phone_3 = create_mobile_phone_mockup(sc_prev, 380, 640, corner_radius=34, border_color=(244, 63, 94, 200))
        p3_shadow = Image.new('RGBA', (420, 680), (0, 0, 0, 0))
        p3_sdraw = ImageDraw.Draw(p3_shadow)
        p3_sdraw.rounded_rectangle([20, 20, 400, 660], radius=34, fill=(0, 0, 0, 210))
        p3_shadow = p3_shadow.filter(ImageFilter.GaussianBlur(radius=20))
        banner.paste(p3_shadow, (1160, 240), p3_shadow)
        banner.paste(phone_3, (1180, 260), phone_3)

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
    
    font_badge = get_font(FONT_BOLD, 26)
    font_title = get_font(FONT_TITLE, 76)
    font_subtitle = get_font(FONT_TREBUCHET, 38)
    font_body = get_font(FONT_REGULAR, 28)
    font_pill = get_font(FONT_BOLD, 22)
    font_btn = get_font(FONT_BOLD, 30)

    # Top: Badge
    badge_text = "★ MOBILE ARCADE 2.0 • 100 SECTORS"
    bbox = font_badge.getbbox(badge_text)
    bw = bbox[2] - bbox[0] + 40
    draw.rounded_rectangle([(w - bw) // 2, 70, (w + bw) // 2, 124], radius=27,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 220), width=2)
    draw.text(((w - bw) // 2 + 20, 83), badge_text, font=font_badge, fill=(0, 240, 255))
    
    icon_sz = 140
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, ((w - icon_sz) // 2, 145), icon_sm)
    
    draw.text(((w - 620) // 2, 300), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text(((w - 490) // 2, 390), "CYBER ARCADE 2.0", font=font_subtitle, fill=(0, 229, 255))
    draw.text(((w - 680) // 2, 445), "C++ WebAssembly Physics • Real-Time Arena", font=font_body, fill=(203, 213, 225))

    # Center: Mobile Phone Mockup
    mb_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-03-gameplay-action.png')
    if os.path.exists(mb_img_path):
        mb_sc = Image.open(mb_img_path)
        phone = create_mobile_phone_mockup(mb_sc, 490, 800, corner_radius=42, border_color=(0, 240, 255, 230))
        mshadow = Image.new('RGBA', (530, 840), (0, 0, 0, 0))
        msdraw = ImageDraw.Draw(mshadow)
        msdraw.rounded_rectangle([20, 20, 510, 820], radius=42, fill=(0, 0, 0, 230))
        mshadow = mshadow.filter(ImageFilter.GaussianBlur(radius=25))
        banner.paste(mshadow, ((w - 530) // 2, 500), mshadow)
        banner.paste(phone, ((w - 490) // 2, 520), phone)

    pills = [("⚡ C++ WASM", (0, 229, 255)), ("📱 Touch / Gyro", (168, 85, 247)), ("🛠️ Studio", (244, 63, 94))]
    total_pw = 175 * 3 + 30
    px = (w - total_pw) // 2
    for label, col in pills:
        draw.rounded_rectangle([px, 1350, px + 175, 1400], radius=14,
                               fill=(15, 23, 42, 220), outline=col, width=2)
        draw.text((px + 16, 1362), label, font=font_pill, fill=col)
        px += 190

    btn_w = 420
    draw.rounded_rectangle([(w - btn_w) // 2, 1440, (w + btn_w) // 2, 1515], radius=38,
                           fill=(0, 229, 255), outline=(255, 255, 255, 140), width=2)
    draw.text(((w - 180) // 2, 1460), "PLAY NOW ▶", font=font_btn, fill=(5, 12, 30))

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
    
    font_badge = get_font(FONT_BOLD, 22)
    font_title = get_font(FONT_TITLE, 74)
    font_subtitle = get_font(FONT_TREBUCHET, 34)
    font_body = get_font(FONT_REGULAR, 24)
    font_pill = get_font(FONT_BOLD, 20)
    font_btn = get_font(FONT_BOLD, 24)

    left_x = 90
    
    # Badge
    draw.rounded_rectangle([left_x, 110, left_x + 360, 156], radius=23,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 200), width=2)
    draw.text((left_x + 18, 122), "★ NEXT-GEN MOBILE BRICK BREAKER", font=font_badge, fill=(0, 240, 255))
    
    # Title & Icon
    icon_sz = 95
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 180), icon_sm)
    
    draw.text((left_x + 110, 185), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 290), "CYBER ARCADE REIMAGINED", font=font_subtitle, fill=(0, 229, 255))
    
    draw.text((left_x, 355), "100 Tactical Sectors with C++ WASM Physics,", font=font_body, fill=(203, 213, 225))
    draw.text((left_x, 395), "Touch / Gyro Tilt Steering, and Real-Time Arena.", font=font_body, fill=(148, 163, 184))

    # Feature Pills
    pills = [
        ("⚡ WASM Physics", (0, 229, 255)),
        ("📱 Touch & Tilt", (168, 85, 247)),
        ("🌐 Global Apex", (244, 63, 94)),
        ("🛠️ Level Studio", (234, 179, 8))
    ]
    px = left_x
    for label, col in pills:
        draw.rounded_rectangle([px, 470, px + 175, 515], radius=12,
                               fill=(15, 23, 42, 220), outline=col, width=2)
        draw.text((px + 14, 482), label, font=font_pill, fill=col)
        px += 190

    # CTA Button
    draw.rounded_rectangle([left_x, 560, left_x + 220, 620], radius=30,
                           fill=(0, 229, 255), outline=(255, 255, 255, 120), width=2)
    draw.text((left_x + 45, 577), "PLAY FREE ▶", font=font_btn, fill=(5, 12, 30))

    # RIGHT: Dual Mobile Smartphone Mockups (Gameplay + Campaign Map)
    # Primary Phone (Gameplay): 390 x 660
    sc_action_path = os.path.join(SCREENSHOTS_DIR, 'mobile-03-gameplay-action.png')
    if os.path.exists(sc_action_path):
        sc_action = Image.open(sc_action_path)
        phone_1 = create_mobile_phone_mockup(sc_action, 400, 680, corner_radius=38, border_color=(0, 240, 255, 230))
        p1_shadow = Image.new('RGBA', (440, 720), (0, 0, 0, 0))
        p1_sdraw = ImageDraw.Draw(p1_shadow)
        p1_sdraw.rounded_rectangle([20, 20, 420, 700], radius=38, fill=(0, 0, 0, 230))
        p1_shadow = p1_shadow.filter(ImageFilter.GaussianBlur(radius=22))
        banner.paste(p1_shadow, (1080, 90), p1_shadow)
        banner.paste(phone_1, (1100, 110), phone_1)

    # Secondary Phone (Campaign Map): 350 x 590
    sc_map_path = os.path.join(SCREENSHOTS_DIR, 'mobile-01-campaign-map.png')
    if os.path.exists(sc_map_path):
        sc_map = Image.open(sc_map_path)
        phone_2 = create_mobile_phone_mockup(sc_map, 350, 590, corner_radius=34, border_color=(168, 85, 247, 210))
        p2_shadow = Image.new('RGBA', (390, 630), (0, 0, 0, 0))
        p2_sdraw = ImageDraw.Draw(p2_shadow)
        p2_sdraw.rounded_rectangle([20, 20, 370, 610], radius=34, fill=(0, 0, 0, 210))
        p2_shadow = p2_shadow.filter(ImageFilter.GaussianBlur(radius=20))
        banner.paste(p2_shadow, (880, 170), p2_shadow)
        banner.paste(phone_2, (900, 190), phone_2)

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
    
    font_badge = get_font(FONT_BOLD, 26)
    font_title = get_font(FONT_TITLE, 78)
    font_subtitle = get_font(FONT_TREBUCHET, 38)
    font_body = get_font(FONT_REGULAR, 28)
    font_btn = get_font(FONT_BOLD, 32)

    # Top: Logo & Title
    icon_sz = 160
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, ((w - icon_sz) // 2, 90), icon_sm)

    draw.text(((w - 640) // 2, 270), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text(((w - 530) // 2, 360), "CYBER ARCADE REIMAGINED", font=font_subtitle, fill=(0, 229, 255))
    draw.text(((w - 620) // 2, 420), "100 Tactical Sectors • C++ WASM Physics", font=font_body, fill=(203, 213, 225))

    # Center: Mobile Phone Mockup (Campaign Map)
    mb_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-01-campaign-map.png')
    if os.path.exists(mb_img_path):
        mb_sc = Image.open(mb_img_path)
        phone = create_mobile_phone_mockup(mb_sc, 500, 850, corner_radius=44, border_color=(0, 240, 255, 230))
        mshadow = Image.new('RGBA', (540, 890), (0, 0, 0, 0))
        msdraw = ImageDraw.Draw(mshadow)
        msdraw.rounded_rectangle([20, 20, 520, 870], radius=44, fill=(0, 0, 0, 230))
        mshadow = mshadow.filter(ImageFilter.GaussianBlur(radius=25))
        banner.paste(mshadow, ((w - 540) // 2, 480), mshadow)
        banner.paste(phone, ((w - 500) // 2, 500), phone)

    btn_w = 440
    draw.rounded_rectangle([(w - btn_w) // 2, 1420, (w + btn_w) // 2, 1500], radius=40,
                           fill=(0, 229, 255), outline=(255, 255, 255, 140), width=2)
    draw.text(((w - 200) // 2, 1442), "PLAY NOW ▶", font=font_btn, fill=(5, 12, 30))

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
    
    font_badge = get_font(FONT_BOLD, 22)
    font_title = get_font(FONT_TITLE, 74)
    font_subtitle = get_font(FONT_TREBUCHET, 34)
    font_body = get_font(FONT_REGULAR, 24)
    font_pill = get_font(FONT_BOLD, 20)

    left_x = 90

    # Badge
    draw.rounded_rectangle([left_x, 110, left_x + 360, 156], radius=23,
                           fill=(13, 22, 48, 230), outline=(244, 63, 94, 220), width=2)
    draw.text((left_x + 22, 122), "⚡ DEVLOG UPDATE  •  VERSION 2.0", font=font_badge, fill=(244, 63, 94))

    icon_sz = 95
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 180), icon_sm)

    draw.text((left_x + 110, 185), "ROAD TO 100 SECTORS", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 290), "MOBILE ARCADE MAJOR OVERHAUL", font=font_subtitle, fill=(0, 229, 255))

    changelog = [
        "✓ 100 Hand-Crafted Sectors across 10 Cyber Worlds",
        "✓ C++ WASM Physics Engine with fluid touch response",
        "✓ Mobile Level Designer Studio with cloud sharing",
        "✓ Live Apex Arena with global mobile leaderboards",
        "✓ Cyber Armory with customizable hulls, balls & trails"
    ]
    cy = 360
    for item in changelog:
        draw.text((left_x, cy), item, font=font_body, fill=(203, 213, 225))
        cy += 42

    draw.rounded_rectangle([left_x, 600, left_x + 300, 650], radius=14,
                           fill=(15, 23, 42, 220), outline=(0, 229, 255), width=2)
    draw.text((left_x + 24, 613), "🚀 Live on elsesourav.com", font=font_pill, fill=(0, 229, 255))

    # RIGHT: Dual Mobile Smartphone Mockups (Mobile Studio + Mobile Arena)
    # Primary Phone (Studio Designer): 400 x 680
    studio_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-05-level-designer.png')
    if os.path.exists(studio_img_path):
        st_sc = Image.open(studio_img_path)
        phone_1 = create_mobile_phone_mockup(st_sc, 400, 680, corner_radius=38, border_color=(244, 63, 94, 230))
        p1_shadow = Image.new('RGBA', (440, 720), (0, 0, 0, 0))
        p1_sdraw = ImageDraw.Draw(p1_shadow)
        p1_sdraw.rounded_rectangle([20, 20, 420, 700], radius=38, fill=(0, 0, 0, 230))
        p1_shadow = p1_shadow.filter(ImageFilter.GaussianBlur(radius=22))
        banner.paste(p1_shadow, (1080, 90), p1_shadow)
        banner.paste(phone_1, (1100, 110), phone_1)

    # Secondary Phone (Global Arena): 350 x 590
    arena_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-04-global-arena.png')
    if os.path.exists(arena_img_path):
        ar_sc = Image.open(arena_img_path)
        phone_2 = create_mobile_phone_mockup(ar_sc, 350, 590, corner_radius=34, border_color=(0, 240, 255, 210))
        p2_shadow = Image.new('RGBA', (390, 630), (0, 0, 0, 0))
        p2_sdraw = ImageDraw.Draw(p2_shadow)
        p2_sdraw.rounded_rectangle([20, 20, 370, 610], radius=34, fill=(0, 0, 0, 210))
        p2_shadow = p2_shadow.filter(ImageFilter.GaussianBlur(radius=20))
        banner.paste(p2_shadow, (880, 170), p2_shadow)
        banner.paste(phone_2, (900, 190), phone_2)

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
