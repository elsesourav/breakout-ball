#!/usr/bin/env python3
"""
Compose 3:4 App Store / Showcase Slides (1200x1600):
- Overall Canvas: 3:4 aspect ratio (1200 x 1600)
- Inside: Real 9:16 mobile smartphone mockup
- Side (Left or Right): Big bold cyberpunk feature highlights, badges, specs & typography
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, 'showcase', '.raw_916')
OUT_DIR = os.path.join(BASE_DIR, 'showcase', 'screenshots')

os.makedirs(OUT_DIR, exist_ok=True)

FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_TITLE = '/System/Library/Fonts/Supplemental/Futura.ttc'
FONT_TREBUCHET = '/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf'
FONT_REGULAR = '/System/Library/Fonts/HelveticaNeue.ttc'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def create_cyber_bg(w, h, primary_color=(0, 240, 255), secondary_color=(168, 85, 247)):
    y, x = np.ogrid[:h, :w]
    cx, cy = w * 0.5, h * 0.5
    r = np.hypot(x - cx, y - cy) / math.hypot(cx, cy)
    t = np.clip(r, 0.0, 1.0) ** 1.6
    
    red = (10 * (1 - t) + 3 * t).astype(np.uint8)
    green = (14 * (1 - t) + 4 * t).astype(np.uint8)
    blue = (32 * (1 - t) + 12 * t).astype(np.uint8)
    alpha = np.full((h, w), 255, dtype=np.uint8)
    
    bg = Image.fromarray(np.dstack([red, green, blue, alpha]))
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Subtle cyber grid
    grid = 40
    for gx in range(0, w, grid):
        draw.line([(gx, 0), (gx, h)], fill=(20, 35, 65, 22), width=1)
    for gy in range(0, h, grid):
        draw.line([(0, gy), (w, gy)], fill=(20, 35, 65, 22), width=1)
        
    # Primary nebula flare
    draw.ellipse([int(w * 0.7 - 350), int(h * 0.3 - 350),
                  int(w * 0.7 + 350), int(h * 0.3 + 350)],
                 fill=(primary_color[0], primary_color[1], primary_color[2], 30))
                 
    # Secondary nebula flare
    draw.ellipse([int(w * 0.25 - 320), int(h * 0.75 - 320),
                  int(w * 0.25 + 320), int(h * 0.75 + 320)],
                 fill=(secondary_color[0], secondary_color[1], secondary_color[2], 26))
                 
    blurred = overlay.filter(ImageFilter.GaussianBlur(radius=40))
    return Image.alpha_composite(bg, blurred)

def build_phone_916_mockup(raw_img_path, phone_w, phone_h, border_color=(0, 240, 255, 240)):
    """
    Renders 9:16 mobile phone mockup with rounded corners, dynamic island, and sleek titanium bezel.
    """
    corner_r = 38
    phone = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(phone)
    pdraw.rounded_rectangle([0, 0, phone_w, phone_h], radius=corner_r, fill=(10, 14, 24, 255))
    
    bezel = 10
    screen_w = phone_w - bezel * 2
    screen_h = phone_h - bezel * 2
    screen_r = corner_r - bezel
    
    # Scale raw 9:16 image
    raw_img = Image.open(raw_img_path).convert('RGBA')
    resized = raw_img.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    
    mask = Image.new('L', (screen_w, screen_h), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, screen_w, screen_h], radius=screen_r, fill=255)
    
    screen_layer = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    screen_layer.paste(resized, (bezel, bezel), mask)
    phone = Image.alpha_composite(phone, screen_layer)
    
    # Dynamic Island Capsule
    pdraw = ImageDraw.Draw(phone)
    pill_w = int(screen_w * 0.28)
    pill_h = 16
    pill_x = (phone_w - pill_w) // 2
    pill_y = bezel + 6
    pdraw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=8, fill=(0, 0, 0, 240))
    
    # Outer Titanium / Neon Chamfer
    border_layer = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(border_layer)
    bdraw.rounded_rectangle([1, 1, phone_w - 2, phone_h - 2], radius=corner_r, outline=border_color, width=3)
    bdraw.rounded_rectangle([bezel - 1, bezel - 1, phone_w - bezel + 1, phone_h - bezel + 1],
                            radius=screen_r + 1, outline=(255, 255, 255, 45), width=1)
    
    return Image.alpha_composite(phone, border_layer)

def add_smooth_shadow(canvas, element, x, y, blur_radius=28, opacity=200):
    """
    Applies a smooth drop shadow with generous 120px padding to avoid any hard edge clipping.
    """
    pad = 120
    ew, eh = element.size
    shadow_box = Image.new('RGBA', (ew + pad * 2, eh + pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_box)
    sdraw.rounded_rectangle([pad + 6, pad + 12, pad + ew - 6, pad + eh + 4], radius=40, fill=(0, 0, 0, opacity))
    blurred = shadow_box.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    
    canvas.paste(blurred, (x - pad, y - pad), blurred)
    canvas.paste(element, (x, y), element)

def compose_slide(raw_file, out_file, title_lines, subtitle, badge, desc_lines, specs, side='right',
                  primary_color=(0, 240, 255), secondary_color=(168, 85, 247)):
    w, h = 1200, 1600
    canvas = create_cyber_bg(w, h, primary_color, secondary_color)
    draw = ImageDraw.Draw(canvas)
    
    raw_path = os.path.join(RAW_DIR, raw_file)
    if not os.path.exists(raw_path):
        print(f"Error: {raw_path} not found!")
        return
        
    # Phone size (exact 9:16 aspect ratio: 1360 x 765)
    phone_h = 1360
    phone_w = 765
    phone_mockup = build_phone_916_mockup(raw_path, phone_w, phone_h, border_color=(*primary_color, 240))
    
    font_badge = get_font(FONT_BOLD, 20)
    font_title = get_font(FONT_TITLE, 38)
    font_sub = get_font(FONT_TREBUCHET, 21)
    font_desc = get_font(FONT_REGULAR, 20)
    font_spec = get_font(FONT_BOLD, 17)
    
    phone_y = 120 # (1600 - 1360) // 2
    
    if side == 'right':
        phone_x = 400
        text_x = 42
    else:
        phone_x = 35
        text_x = 830
        
    # Render phone with smooth drop shadow
    add_smooth_shadow(canvas, phone_mockup, phone_x, phone_y, blur_radius=30, opacity=220)
    
    # RENDER TEXT CONTENT ON SIDE
    ty = phone_y + 45
    
    # 1. Badge Pill
    bbox = font_badge.getbbox(badge)
    bw = bbox[2] - bbox[0] + 28
    draw.rounded_rectangle([text_x, ty, text_x + bw, ty + 38], radius=10,
                           fill=(13, 22, 48, 230), outline=(*primary_color, 220), width=2)
    draw.text((text_x + 14, ty + 8), badge, font=font_badge, fill=primary_color)
    ty += 58
    
    # 2. Main Title (stacked lines)
    for line in title_lines:
        draw.text((text_x, ty), line, font=font_title, fill=(255, 255, 255))
        ty += 46
    ty += 6
    
    # 3. Accent Subtitle
    draw.text((text_x, ty), subtitle, font=font_sub, fill=primary_color)
    ty += 40
    
    # 4. Description Lines
    for dline in desc_lines:
        draw.text((text_x, ty), dline, font=font_desc, fill=(185, 195, 215))
        ty += 29
    ty += 28
    
    # 5. Feature Specs Pills
    for spec in specs:
        s_bbox = font_spec.getbbox(spec)
        sw = s_bbox[2] - s_bbox[0] + 30
        draw.rounded_rectangle([text_x, ty, text_x + sw, ty + 38], radius=10,
                               fill=(15, 23, 42, 220), outline=(*secondary_color, 180), width=2)
        # Dot bullet (vector drawn circle)
        draw.ellipse([text_x + 10, ty + 15, text_x + 16, ty + 21], fill=secondary_color)
        draw.text((text_x + 22, ty + 9), spec, font=font_spec, fill=(241, 245, 249))
        ty += 48
        
    out_path = os.path.join(OUT_DIR, out_file)
    canvas.save(out_path, 'PNG', optimize=True)
    print(f"✓ Saved 3:4 Showcase Slide: {out_file} ({phone_w}x{phone_h} phone in 1200x1600 canvas)")

def main():
    print("--- Composing 3:4 Showcase Slides with 9:16 Mobile Mockup & Side Highlights ---")
    
    # 1. Campaign Map
    compose_slide(
        raw_file='raw_01_map.png',
        out_file='mobile-01-campaign-map.png',
        title_lines=['100 TACTICAL', 'SECTORS'],
        subtitle='COSMIC MAP PROGRESSION',
        badge='01 // CAMPAIGN MAP',
        desc_lines=[
            'Explore 10 deep-space',
            'themed worlds with',
            'progressive brick challenges,',
            'glowing routes, and',
            'smart map positioning.'
        ],
        specs=['10 Cyber Galaxies', 'Smooth Map Scroll', 'Intelligent Centering', '3-Star Rating Tiers'],
        side='right',
        primary_color=(0, 240, 255),
        secondary_color=(168, 85, 247)
    )
    
    # 2. Level Preview Modal
    compose_slide(
        raw_file='raw_02_preview.png',
        out_file='mobile-02-level-preview.png',
        title_lines=['SECTOR INTEL', '& RATINGS'],
        subtitle='TACTICAL PRE-FLIGHT',
        badge='02 // LEVEL PREVIEW',
        desc_lines=[
            'Inspect target counts,',
            'total armor hit points,',
            'star thresholds, and',
            'live pilot speedrun',
            'rankings before takeoff.'
        ],
        specs=['Real-Time Pilot Ranks', 'Target & HP Breakdown', 'Speedrun Times', 'Direct Sector Launch'],
        side='left',
        primary_color=(244, 63, 94),
        secondary_color=(0, 240, 255)
    )
    
    # 3. Gameplay Action
    compose_slide(
        raw_file='raw_03_gameplay.png',
        out_file='mobile-03-gameplay-action.png',
        title_lines=['C++ WASM', 'PHYSICS CORE'],
        subtitle='SUB-MILLISECOND WASM',
        badge='03 // PURE GAMEPLAY',
        desc_lines=[
            'Continuous collision loops,',
            'zero garbage-collection lag,',
            'fluid touch deflection,',
            'dynamic particle trails,',
            'and 120 FPS performance.'
        ],
        specs=['WebAssembly Engine', 'Touch & Tilt Steering', 'WebGL 2 Particle Shaders', 'Vibration Haptics'],
        side='right',
        primary_color=(0, 240, 255),
        secondary_color=(234, 179, 8)
    )
    
    # 4. Global Arena
    compose_slide(
        raw_file='raw_04_arena.png',
        out_file='mobile-04-global-arena.png',
        title_lines=['GLOBAL APEX', 'ARENA'],
        subtitle='LIVE APEX ARENA',
        badge='04 // GLOBAL ARENA',
        desc_lines=[
            'Compete with pilots',
            'worldwide across daily',
            'apex missions and verified',
            'community speedrun stages.'
        ],
        specs=['Daily Apex Missions', '2X Rep & Core Bonuses', 'Verified Speedruns', 'Cross-Device Cloud Sync'],
        side='left',
        primary_color=(168, 85, 247),
        secondary_color=(0, 240, 255)
    )
    
    # 5. Level Designer Studio
    compose_slide(
        raw_file='raw_05_designer.png',
        out_file='mobile-05-level-designer.png',
        title_lines=['MATRIX FORGE', 'STUDIO'],
        subtitle='ARENA LEVEL CREATOR',
        badge='05 // LEVEL STUDIO',
        desc_lines=[
            'Build custom arenas on',
            'a multi-tile grid canvas.',
            'Choose from 12+ block types,',
            'test in sandbox mode,',
            'and publish to the cloud.'
        ],
        specs=['12+ Block Archetypes', 'Portals & EMP Bricks', 'One-Click Sandbox Test', 'Instant Cloud Share'],
        side='right',
        primary_color=(234, 179, 8),
        secondary_color=(244, 63, 94)
    )
    
    # 6. Cyber Armory
    compose_slide(
        raw_file='raw_06_armory.png',
        out_file='mobile-06-cyber-armory.png',
        title_lines=['CYBER ARMORY', '& ARSENAL'],
        subtitle='HULL & BALL TUNING',
        badge='06 // CYBER ARMORY',
        desc_lines=[
            'Upgrade ball kinetics,',
            'unlock high-tech paddles,',
            'equip energy visual trails,',
            'and redeem secret promo',
            'coupons for core rewards.'
        ],
        specs=['Modular Hull Upgrades', 'Signature Particle Auras', 'Trajectory Aim Matrix', 'Promo Coupon Depot'],
        side='left',
        primary_color=(34, 197, 94),
        secondary_color=(0, 240, 255)
    )
    
    # 7. Pilot Profile
    compose_slide(
        raw_file='raw_07_profile.png',
        out_file='mobile-07-pilot-profile.png',
        title_lines=['PILOT PROFILE', '& BADGES'],
        subtitle='IDENTITY & BADGES',
        badge='07 // PILOT PROFILE',
        desc_lines=[
            'Track all 16 milestone',
            'achievements, claim',
            'energy cores, and sync',
            'your career progress',
            'across all your devices.'
        ],
        specs=['16 Unlockable Trophies', 'Google & GitHub SSO', 'Multi-Window Sync', 'Cloud Save Backup'],
        side='right',
        primary_color=(0, 240, 255),
        secondary_color=(168, 85, 247)
    )

    print("--- All 7 3:4 Showcase Slides Generated Successfully! ---")

if __name__ == '__main__':
    main()
