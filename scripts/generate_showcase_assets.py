#!/usr/bin/env python3
"""
Generate all ElseSourav App Submission and Showcase Assets:
- App Icons (1:1): Transparent 512x512, Night 512x512, and SVG.
- Hero Carousel Banners: 21:9 Ultrawide Desktop (2520x1080) and 3:4 Mobile (1200x1600).
- App Cover Images: 16:9 Landscape (1600x900) and 3:4 Portrait (1200x1600).
- Devlog / Update Post Banner: 16:9 Landscape (1600x900).
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
    # Fallback to cleaning icon-breakout.png
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

def create_cyber_background(w, h, style='desktop'):
    """
    Creates high-tech futuristic gradient background with grid lines and neon glow spots.
    """
    # Base dark gradient
    y, x = np.ogrid[:h, :w]
    cx, cy = w * 0.45, h * 0.5
    max_r = math.hypot(cx, cy)
    r = np.hypot(x - cx, y - cy) / max_r
    t = np.clip(r, 0.0, 1.0) ** 1.8
    
    # Deep Cyber Void: #060919 to #02030a
    red = (10 * (1 - t) + 2 * t).astype(np.uint8)
    green = (16 * (1 - t) + 4 * t).astype(np.uint8)
    blue = (36 * (1 - t) + 10 * t).astype(np.uint8)
    alpha = np.full((h, w), 255, dtype=np.uint8)
    
    bg = Image.fromarray(np.dstack([red, green, blue, alpha]))
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Grid lines (perspective / tech matrix)
    grid_spacing = max(30, int(w / 48))
    for gx in range(0, w, grid_spacing):
        draw.line([(gx, 0), (gx, h)], fill=(16, 32, 64, 28), width=1)
    for gy in range(0, h, grid_spacing):
        draw.line([(0, gy), (w, gy)], fill=(16, 32, 64, 28), width=1)
        
    # Glow orbs
    # Top-right cyan flare
    glow_r1 = int(min(w, h) * 0.5)
    draw.ellipse([int(w * 0.75 - glow_r1), int(h * 0.3 - glow_r1),
                  int(w * 0.75 + glow_r1), int(h * 0.3 + glow_r1)],
                 fill=(0, 240, 255, 32))
                 
    # Bottom-left violet/magenta flare
    glow_r2 = int(min(w, h) * 0.4)
    draw.ellipse([int(w * 0.2 - glow_r2), int(h * 0.8 - glow_r2),
                  int(w * 0.2 + glow_r2), int(h * 0.8 + glow_r2)],
                 fill=(168, 85, 247, 28))

    # Center-right energetic amber spark
    glow_r3 = int(min(w, h) * 0.3)
    draw.ellipse([int(w * 0.6 - glow_r3), int(h * 0.65 - glow_r3),
                  int(w * 0.6 + glow_r3), int(h * 0.65 + glow_r3)],
                 fill=(255, 120, 30, 24))

    blurred_overlay = overlay.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.05)))
    bg = Image.alpha_composite(bg, blurred_overlay)
    
    return bg

def add_mockup_frame(screenshot_img, frame_w, frame_h, corner_radius=20, border_color=(0, 229, 255, 180)):
    """
    Renders a screenshot inside a sleek futuristic glass bezel with rounded corners and glowing border.
    """
    # Resize screenshot maintaining aspect ratio
    src_w, src_h = screenshot_img.size
    aspect = src_w / src_h
    target_aspect = frame_w / frame_h
    
    if aspect > target_aspect:
        # screenshot is wider, scale by height
        new_h = frame_h
        new_w = int(frame_h * aspect)
    else:
        new_w = frame_w
        new_h = int(frame_w / aspect)
        
    resized_sc = screenshot_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Crop to exact frame dimensions
    left = (new_w - frame_w) // 2
    top = (new_h - frame_h) // 2
    cropped_sc = resized_sc.crop((left, top, left + frame_w, top + frame_h))
    
    # Mask rounded corners
    mask = Image.new('L', (frame_w, frame_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_radius, fill=255)
    
    frame = Image.new('RGBA', (frame_w, frame_h), (0, 0, 0, 0))
    frame.paste(cropped_sc, (0, 0), mask)
    
    # Add border & inner glow
    border_layer = Image.new('RGBA', (frame_w, frame_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_layer)
    bdraw.rounded_rectangle([1, 1, frame_w - 2, frame_h - 2], radius=corner_radius, outline=border_color, width=3)
    bdraw.rounded_rectangle([4, 4, frame_w - 5, frame_h - 5], radius=max(2, corner_radius - 3), outline=(255, 255, 255, 50), width=1)
    
    # Header notch / dots for window style
    bdraw.ellipse([14, 12, 22, 20], fill=(244, 63, 94, 220)) # red dot
    bdraw.ellipse([28, 12, 36, 20], fill=(234, 179, 8, 220)) # yellow dot
    bdraw.ellipse([42, 12, 50, 20], fill=(34, 197, 94, 220)) # green dot
    
    return Image.alpha_composite(frame, border_layer)

def generate_icons(clean_icon):
    print("Generating ElseSourav App Icons (512x512)...")
    
    # 1. 512x512 Transparent Icon
    icon_transparent = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    scaled_icon = clean_icon.resize((480, 480), Image.Resampling.LANCZOS)
    icon_transparent.paste(scaled_icon, (16, 16), scaled_icon)
    icon_transparent.save(os.path.join(APP_ICONS_DIR, 'app-icon-512x512.png'), 'PNG')
    
    # 2. 512x512 Cyber Night App Icon with rounded corners and glowing border
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
    
    # Mask to rounded app icon (iOS / Android squircle radius 112)
    icon_mask = Image.new('L', (512, 512), 0)
    im_draw = ImageDraw.Draw(icon_mask)
    im_draw.rounded_rectangle([0, 0, 512, 512], radius=110, fill=255)
    
    night_icon = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    night_icon.paste(bg_core, (0, 0), icon_mask)
    
    # Add subtle inner neon border
    border_draw = ImageDraw.Draw(night_icon)
    border_draw.rounded_rectangle([3, 3, 509, 509], radius=108, outline=(0, 240, 255, 160), width=4)
    border_draw.rounded_rectangle([7, 7, 505, 505], radius=104, outline=(168, 85, 247, 80), width=2)
    
    # Paste fireball
    scaled_fireball = clean_icon.resize((410, 410), Image.Resampling.LANCZOS)
    night_icon.paste(scaled_fireball, (51, 51), scaled_fireball)
    night_icon.save(os.path.join(APP_ICONS_DIR, 'app-icon-night-512x512.png'), 'PNG')
    
    # 3. SVG vector icon copy
    svg_source = os.path.join(PUBLIC_DIR, 'favicon.svg')
    if os.path.exists(svg_source):
        shutil.copyfile(svg_source, os.path.join(APP_ICONS_DIR, 'app-icon.svg'))
    print("✓ App icons generated successfully.")

def generate_desktop_carousel_banner(clean_icon):
    """
    21:9 Ultrawide Desktop Carousel Banner (2520x1080)
    As required by ElseSourav carousel.schema.ts
    """
    print("Generating Desktop Carousel Banner (2520x1080 - 21:9)...")
    w, h = 2520, 1080
    banner = create_cyber_background(w, h, 'desktop')
    draw = ImageDraw.Draw(banner)
    
    # Load fonts
    font_badge = get_font(FONT_BOLD, 28)
    font_title = get_font(FONT_TITLE, 102)
    font_subtitle = get_font(FONT_TREBUCHET, 46)
    font_body = get_font(FONT_REGULAR, 32)
    font_pill = get_font(FONT_BOLD, 26)
    
    # LEFT CONTENT
    left_x = 140
    
    # Badge Pill: "★ MAJOR UPDATE 2.0 • 100 SECTORS"
    badge_text = "★ MAJOR UPDATE 2.0  •  100 TACTICAL SECTORS"
    bbox_b = font_badge.getbbox(badge_text)
    bw = bbox_b[2] - bbox_b[0] + 44
    bh = 54
    by = 160
    draw.rounded_rectangle([left_x, by, left_x + bw, by + bh], radius=27,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 210), width=2)
    draw.text((left_x + 22, by + 12), badge_text, font=font_badge, fill=(0, 240, 255))
    
    # Fireball icon miniature next to title
    icon_sm = clean_icon.resize((120, 120), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 240), icon_sm)
    
    # Title
    draw.text((left_x + 135, 245), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    
    # Subtitle
    draw.text((left_x, 385), "CYBER ARCADE REIMAGINED", font=font_subtitle, fill=(0, 229, 255))
    
    # Body Description
    body_text_1 = "High-octane WebAssembly physics, 100 deep-space sectors,"
    body_text_2 = "real-time global arena rankings, and custom level creator studio."
    draw.text((left_x, 470), body_text_1, font=font_body, fill=(203, 213, 225))
    draw.text((left_x, 520), body_text_2, font=font_body, fill=(148, 163, 184))
    
    # Feature Pills
    pills = [
        ("⚡ C++ WASM Physics", (0, 229, 255)),
        ("🌐 Global Apex Arena", (168, 85, 247)),
        ("🛠️ Level Studio", (244, 63, 94)),
        ("🛡️ Cyber Armory", (234, 179, 8)),
        ("🎮 Gamepad & Haptics", (34, 197, 94))
    ]
    px = left_x
    py = 620
    for label, col in pills:
        l_bbox = font_pill.getbbox(label)
        pw = l_bbox[2] - l_bbox[0] + 36
        draw.rounded_rectangle([px, py, px + pw, py + 52], radius=14,
                               fill=(15, 23, 42, 200), outline=(col[0], col[1], col[2], 180), width=2)
        draw.text((px + 18, py + 11), label, font=font_pill, fill=col)
        px += pw + 18
        
    # CTA Buttons visual preview
    btn_x = left_x
    btn_y = 730
    draw.rounded_rectangle([btn_x, btn_y, btn_x + 280, btn_y + 70], radius=35,
                           fill=(0, 229, 255), outline=(255, 255, 255, 120), width=2)
    font_btn = get_font(FONT_BOLD, 30)
    draw.text((btn_x + 55, btn_y + 17), "PLAY NOW ▶", font=font_btn, fill=(5, 12, 30))
    
    draw.rounded_rectangle([btn_x + 310, btn_y, btn_x + 610, btn_y + 70], radius=35,
                           fill=(15, 23, 42, 220), outline=(255, 255, 255, 120), width=2)
    draw.text((btn_x + 355, btn_y + 17), "STUDIO CREATOR", font=font_btn, fill=(241, 245, 249))

    # RIGHT SIDE: Embedded Dual Device Showcase
    # 1. Desktop gameplay action frame
    dt_img_path = os.path.join(SCREENSHOTS_DIR, 'desktop-02-gameplay-action.png')
    if os.path.exists(dt_img_path):
        dt_sc = Image.open(dt_img_path)
        dt_frame = add_mockup_frame(dt_sc, 1160, 650, corner_radius=22, border_color=(0, 240, 255, 200))
        # Add drop shadow
        shadow = Image.new('RGBA', (1200, 690), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.rounded_rectangle([20, 20, 1180, 670], radius=24, fill=(0, 0, 0, 180))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20))
        banner.paste(shadow, (1260, 190), shadow)
        banner.paste(dt_frame, (1280, 210), dt_frame)
        
    # 2. Overlapping Mobile campaign map frame
    mb_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-01-campaign-map.png')
    if os.path.exists(mb_img_path):
        mb_sc = Image.open(mb_img_path)
        mb_frame = add_mockup_frame(mb_sc, 320, 690, corner_radius=32, border_color=(168, 85, 247, 230))
        # Drop shadow
        mshadow = Image.new('RGBA', (360, 730), (0, 0, 0, 0))
        msdraw = ImageDraw.Draw(mshadow)
        msdraw.rounded_rectangle([20, 20, 340, 710], radius=32, fill=(0, 0, 0, 220))
        mshadow = mshadow.filter(ImageFilter.GaussianBlur(radius=25))
        banner.paste(mshadow, (1160, 280), mshadow)
        banner.paste(mb_frame, (1180, 300), mb_frame)

    out_path = os.path.join(BANNERS_DIR, 'carousel-slider-desktop-21x9.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Desktop carousel saved: {out_path}")

def generate_mobile_carousel_banner(clean_icon):
    """
    3:4 Mobile Carousel Banner (1200x1600)
    As required by ElseSourav carousel.schema.ts
    """
    print("Generating Mobile Carousel Banner (1200x1600 - 3:4)...")
    w, h = 1200, 1600
    banner = create_cyber_background(w, h, 'mobile')
    draw = ImageDraw.Draw(banner)
    
    font_badge = get_font(FONT_BOLD, 26)
    font_title = get_font(FONT_TITLE, 76)
    font_subtitle = get_font(FONT_TREBUCHET, 38)
    font_body = get_font(FONT_REGULAR, 28)
    font_pill = get_font(FONT_BOLD, 22)
    font_btn = get_font(FONT_BOLD, 30)

    # TOP: Badge
    badge_text = "★ MAJOR UPDATE 2.0 • 100 SECTORS"
    bbox = font_badge.getbbox(badge_text)
    bw = bbox[2] - bbox[0] + 40
    draw.rounded_rectangle([(w - bw) // 2, 70, (w + bw) // 2, 124], radius=27,
                           fill=(13, 22, 48, 230), outline=(0, 240, 255, 220), width=2)
    draw.text(((w - bw) // 2 + 20, 83), badge_text, font=font_badge, fill=(0, 240, 255))
    
    # Fireball icon centered
    icon_sz = 140
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, ((w - icon_sz) // 2, 145), icon_sm)
    
    # Title centered
    draw.text(((w - 620) // 2, 300), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text(((w - 490) // 2, 390), "CYBER ARCADE 2.0", font=font_subtitle, fill=(0, 229, 255))
    
    # Subtitle
    draw.text(((w - 680) // 2, 445), "C++ WebAssembly Physics • Real-Time Arena", font=font_body, fill=(203, 213, 225))

    # Center: Mobile Device Frame with Action Gameplay
    mb_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-03-gameplay-action.png')
    if os.path.exists(mb_img_path):
        mb_sc = Image.open(mb_img_path)
        mb_frame = add_mockup_frame(mb_sc, 460, 780, corner_radius=36, border_color=(0, 240, 255, 220))
        # Drop shadow
        mshadow = Image.new('RGBA', (500, 820), (0, 0, 0, 0))
        msdraw = ImageDraw.Draw(mshadow)
        msdraw.rounded_rectangle([20, 20, 480, 800], radius=36, fill=(0, 0, 0, 220))
        mshadow = mshadow.filter(ImageFilter.GaussianBlur(radius=25))
        banner.paste(mshadow, ((w - 500) // 2, 510), mshadow)
        banner.paste(mb_frame, ((w - 460) // 2, 530), mb_frame)

    # Feature tags row
    pills = [("⚡ C++ WASM", (0, 229, 255)), ("🌐 Live Arena", (168, 85, 247)), ("🛠️ Studio", (244, 63, 94))]
    total_pw = 170 * 3 + 30
    px = (w - total_pw) // 2
    for label, col in pills:
        draw.rounded_rectangle([px, 1350, px + 170, 1400], radius=14,
                               fill=(15, 23, 42, 220), outline=col, width=2)
        draw.text((px + 16, 1362), label, font=font_pill, fill=col)
        px += 185

    # Bottom CTA Button
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
    As required by ElseSourav AdminAppMediaSection.tsx
    """
    print("Generating Landscape App Cover (1600x900 - 16:9)...")
    w, h = 1600, 900
    banner = create_cyber_background(w, h, 'desktop')
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
    draw.text((left_x + 18, 122), "★ NEXT-GEN WEB BRICK BREAKER", font=font_badge, fill=(0, 240, 255))
    
    # Title & Icon
    icon_sz = 95
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 180), icon_sm)
    
    draw.text((left_x + 110, 185), "BREAKOUT BALL", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 290), "CYBER ARCADE REIMAGINED", font=font_subtitle, fill=(0, 229, 255))
    
    draw.text((left_x, 355), "100 Tactical Sectors with C++ WASM Physics,", font=font_body, fill=(203, 213, 225))
    draw.text((left_x, 395), "Level Designer Studio, and Real-Time Arena.", font=font_body, fill=(148, 163, 184))

    # Feature Pills
    pills = [
        ("⚡ WASM Physics", (0, 229, 255)),
        ("🌐 Global Apex", (168, 85, 247)),
        ("🛠️ Level Studio", (244, 63, 94)),
        ("🛡️ Armory", (234, 179, 8))
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

    # RIGHT: Desktop Gameplay Action Mockup Frame
    dt_img_path = os.path.join(SCREENSHOTS_DIR, 'desktop-02-gameplay-action.png')
    if os.path.exists(dt_img_path):
        dt_sc = Image.open(dt_img_path)
        dt_frame = add_mockup_frame(dt_sc, 740, 520, corner_radius=20, border_color=(0, 240, 255, 200))
        # Drop shadow
        shadow = Image.new('RGBA', (780, 560), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.rounded_rectangle([20, 20, 760, 540], radius=22, fill=(0, 0, 0, 200))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=18))
        banner.paste(shadow, (800, 160), shadow)
        banner.paste(dt_frame, (820, 180), dt_frame)

    out_path = os.path.join(BANNERS_DIR, 'app-cover-landscape-16x9.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Landscape app cover saved: {out_path}")

def generate_portrait_app_cover(clean_icon):
    """
    3:4 Portrait App Cover (1200x1600)
    As required by ElseSourav AdminAppMediaSection.tsx
    """
    print("Generating Portrait App Cover (1200x1600 - 3:4)...")
    w, h = 1200, 1600
    banner = create_cyber_background(w, h, 'mobile')
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

    # Center: Mobile Device Frame with Campaign Map
    mb_img_path = os.path.join(SCREENSHOTS_DIR, 'mobile-01-campaign-map.png')
    if os.path.exists(mb_img_path):
        mb_sc = Image.open(mb_img_path)
        mb_frame = add_mockup_frame(mb_sc, 490, 840, corner_radius=36, border_color=(0, 240, 255, 220))
        mshadow = Image.new('RGBA', (530, 880), (0, 0, 0, 0))
        msdraw = ImageDraw.Draw(mshadow)
        msdraw.rounded_rectangle([20, 20, 510, 860], radius=36, fill=(0, 0, 0, 220))
        mshadow = mshadow.filter(ImageFilter.GaussianBlur(radius=25))
        banner.paste(mshadow, ((w - 530) // 2, 480), mshadow)
        banner.paste(mb_frame, ((w - 490) // 2, 500), mb_frame)

    # Bottom CTA Button
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
    As required by ElseSourav AdminUpdateForm.tsx for Devlog / Updates posts
    """
    print("Generating Devlog / Update Banner (1600x900 - 16:9)...")
    w, h = 1600, 900
    banner = create_cyber_background(w, h, 'desktop')
    draw = ImageDraw.Draw(banner)
    
    font_badge = get_font(FONT_BOLD, 22)
    font_title = get_font(FONT_TITLE, 74)
    font_subtitle = get_font(FONT_TREBUCHET, 34)
    font_body = get_font(FONT_REGULAR, 24)
    font_pill = get_font(FONT_BOLD, 20)

    left_x = 90

    # Badge: DEVLOG UPDATE // V2.0.0
    draw.rounded_rectangle([left_x, 110, left_x + 360, 156], radius=23,
                           fill=(13, 22, 48, 230), outline=(244, 63, 94, 220), width=2)
    draw.text((left_x + 22, 122), "⚡ DEVLOG UPDATE  •  VERSION 2.0", font=font_badge, fill=(244, 63, 94))

    # Icon + Title
    icon_sz = 95
    icon_sm = clean_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 180), icon_sm)

    draw.text((left_x + 110, 185), "ROAD TO 100 SECTORS", font=font_title, fill=(255, 255, 255))
    draw.text((left_x, 290), "BREAKOUT BALL MAJOR OVERHAUL", font=font_subtitle, fill=(0, 229, 255))

    changelog = [
        "✓ 100 Hand-Crafted Sectors across 10 Cyber Worlds",
        "✓ WebAssembly (C++) Physics Engine for zero lag",
        "✓ Full In-Browser Level Designer Studio with Cloud Sharing",
        "✓ Live Global Apex Arena with Real-Time Leaderboards",
        "✓ Cyber Armory with customizable paddles, balls, and VFX"
    ]
    cy = 360
    for item in changelog:
        draw.text((left_x, cy), item, font=font_body, fill=(203, 213, 225))
        cy += 42

    # Bottom Update Pill
    draw.rounded_rectangle([left_x, 600, left_x + 300, 650], radius=14,
                           fill=(15, 23, 42, 220), outline=(0, 229, 255), width=2)
    draw.text((left_x + 24, 613), "🚀 Live on elsesourav.com", font=font_pill, fill=(0, 229, 255))

    # RIGHT: Overlapping preview collage (Studio + Arena)
    studio_img_path = os.path.join(SCREENSHOTS_DIR, 'desktop-03-level-designer.png')
    if os.path.exists(studio_img_path):
        st_sc = Image.open(studio_img_path)
        st_frame = add_mockup_frame(st_sc, 700, 480, corner_radius=20, border_color=(244, 63, 94, 200))
        shadow = Image.new('RGBA', (740, 520), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.rounded_rectangle([20, 20, 720, 500], radius=22, fill=(0, 0, 0, 200))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=18))
        banner.paste(shadow, (820, 180), shadow)
        banner.paste(st_frame, (840, 200), st_frame)

    out_path = os.path.join(BANNERS_DIR, 'update-banner-v2-16x9.png')
    banner.save(out_path, 'PNG', optimize=True)
    print(f"✓ Update post banner saved: {out_path}")

def main():
    print("--- Starting Generation of Showcase Assets ---")
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
