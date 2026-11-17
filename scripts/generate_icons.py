#!/usr/bin/env python3
"""
Generate all favicon, PWA, mobile app install, and social preview assets
from public/icon-breakout.png.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

def clean_source_image(src_path):
    im = Image.open(src_path).convert('RGBA')
    arr = np.array(im)
    alpha = arr[:, :, 3]
    
    # Clean up faint outer edge noise (alpha <= 12)
    # Smooth falloff for semi-transparent edges
    mask_noise = alpha <= 10
    arr[mask_noise, 3] = 0
    
    # Smooth edge alpha
    mask_transition = (alpha > 10) & (alpha < 35)
    arr[mask_transition, 3] = ((arr[mask_transition, 3].astype(float) - 10) / 25.0 * arr[mask_transition, 3]).astype(np.uint8)
    
    cleaned = Image.fromarray(arr)
    
    # Compute bounding box of non-zero alpha
    bbox = cleaned.getbbox()
    cropped = cleaned.crop(bbox)
    
    # Square canvas with balanced padding (e.g. 1024x1024)
    w, h = cropped.size
    max_dim = max(w, h)
    
    # Create square transparent canvas
    square_size = int(max_dim * 1.08)
    square_img = Image.new('RGBA', (square_size, square_size), (0, 0, 0, 0))
    offset_x = (square_size - w) // 2
    offset_y = (square_size - h) // 2
    square_img.paste(cropped, (offset_x, offset_y), cropped)
    
    return square_img

def create_night_background(size):
    """
    Creates a deep cyberpunk night sky radial gradient:
    Center: #0c1435 -> Mid: #05081c -> Corners: #02030a
    With subtle cosmic aura.
    """
    w, h = size
    # Create gradient via radial distance
    y, x = np.ogrid[:h, :w]
    cx, cy = w / 2.0, h / 2.0
    # Normalize radius 0 to 1 at corners
    max_r = math.hypot(cx, cy)
    r = np.hypot(x - cx, y - cy) / max_r
    
    # Smooth step
    # Center color: (12, 22, 54)
    # Edge color: (2, 4, 12)
    t = np.clip(r, 0.0, 1.0)
    # Quadratic easing
    t = t * t
    
    red = (12 * (1 - t) + 2 * t).astype(np.uint8)
    green = (22 * (1 - t) + 4 * t).astype(np.uint8)
    blue = (58 * (1 - t) + 14 * t).astype(np.uint8)
    alpha = np.full((h, w), 255, dtype=np.uint8)
    
    bg_arr = np.dstack([red, green, blue, alpha])
    bg_img = Image.fromarray(bg_arr)
    
    # Add subtle atmospheric cyan/amber nebula glow in background
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Warm amber glow behind ball trajectory
    glow_r = int(w * 0.38)
    glow_x = int(cx + w * 0.08)
    glow_y = int(cy - h * 0.08)
    draw.ellipse([glow_x - glow_r, glow_y - glow_r, glow_x + glow_r, glow_y + glow_r], fill=(255, 120, 20, 28))
    
    # Deep cyan rim ambient pulse
    cyan_r = int(w * 0.44)
    draw.ellipse([cx - cyan_r, cy - cyan_r, cx + cyan_r, cy + cyan_r], outline=(0, 247, 255, 30), width=max(1, int(w * 0.008)))
    
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=max(2, int(w * 0.05))))
    bg_img = Image.alpha_composite(bg_img, overlay)
    
    return bg_img

def generate_assets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'public')
    src_icon = os.path.join(public_dir, 'icon-breakout.png')
    
    print(f"Cleaning source image: {src_icon}")
    clean_master = clean_source_image(src_icon)
    
    # Save clean transparent master square
    master_1024 = clean_master.resize((1024, 1024), Image.Resampling.LANCZOS)
    clean_master_path = os.path.join(public_dir, 'icon-breakout-clean.png')
    master_1024.save(clean_master_path, 'PNG', optimize=True)
    print(f"Saved {clean_master_path}")
    
    # 1. Favicon PNGs (Transparent background)
    fav_16 = master_1024.resize((16, 16), Image.Resampling.LANCZOS)
    fav_16.save(os.path.join(public_dir, 'favicon-16x16.png'), 'PNG', optimize=True)
    
    fav_32 = master_1024.resize((32, 32), Image.Resampling.LANCZOS)
    fav_32.save(os.path.join(public_dir, 'favicon-32x32.png'), 'PNG', optimize=True)
    fav_32.save(os.path.join(public_dir, 'favicon.png'), 'PNG', optimize=True)
    
    fav_48 = master_1024.resize((48, 48), Image.Resampling.LANCZOS)
    fav_64 = master_1024.resize((64, 64), Image.Resampling.LANCZOS)
    fav_128 = master_1024.resize((128, 128), Image.Resampling.LANCZOS)
    
    # Multi-resolution favicon.ico
    fav_32.save(
        os.path.join(public_dir, 'favicon.ico'),
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)],
        append_images=[fav_16, fav_48, fav_64, fav_128]
    )
    print("Saved favicon-16x16.png, favicon-32x32.png, favicon.ico")
    
    # 2. Mobile App Install Icons with Night Background
    # Standard PWA recommended icon sizes:
    # 512x512 (pwa-512x512.png)
    # 192x192 (logo.png)
    # 180x180 (apple-touch-icon.png)
    # img/icon.png
    
    def make_app_icon(target_size, ball_scale=0.82):
        bg = create_night_background((target_size, target_size))
        ball_size = int(target_size * ball_scale)
        scaled_ball = master_1024.resize((ball_size, ball_size), Image.Resampling.LANCZOS)
        
        offset = (target_size - ball_size) // 2
        bg.paste(scaled_ball, (offset, offset), scaled_ball)
        return bg
    
    pwa_512 = make_app_icon(512, ball_scale=0.82)
    pwa_512.save(os.path.join(public_dir, 'pwa-512x512.png'), 'PNG', optimize=True)
    print("Saved pwa-512x512.png with night background")
    
    logo_192 = make_app_icon(192, ball_scale=0.82)
    logo_192.save(os.path.join(public_dir, 'logo.png'), 'PNG', optimize=True)
    print("Saved logo.png (192x192) with night background")
    
    apple_180 = make_app_icon(180, ball_scale=0.82)
    apple_180.save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG', optimize=True)
    print("Saved apple-touch-icon.png (180x180) with night background")
    
    # img/icon.png if dir exists
    img_dir = os.path.join(public_dir, 'img')
    if os.path.exists(img_dir):
        logo_192.save(os.path.join(img_dir, 'icon.png'), 'PNG', optimize=True)
    
    # 3. Social Media Share Banner (og-image.png & og-image.jpg: 1200 x 630)
    # Designed specifically to show the breakout ball with night background,
    # title "BREAKOUT BALL", cyberpunk tagline, and crisp branding.
    # Strictly kept < 300KB for WhatsApp compatibility!
    make_social_banner(public_dir, master_1024)

def make_social_banner(public_dir, master_ball):
    W, H = 1200, 630
    
    # Background night sky gradient with cyber grid
    bg = create_night_background((W, H))
    draw = ImageDraw.Draw(bg)
    
    # Cyber grid lines in lower half
    grid_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid_overlay)
    grid_color = (0, 247, 255, 22)
    
    # Perspective grid floor
    vanishing_y = int(H * 0.42)
    for gx in range(-W, W * 2, 70):
        gdraw.line([(gx, H), (W // 2 + (gx - W // 2) // 4, vanishing_y)], fill=grid_color, width=1)
    
    for gy in range(vanishing_y + 30, H + 20, 35):
        alpha_factor = int(22 * ((gy - vanishing_y) / (H - vanishing_y)))
        gdraw.line([(0, gy), (W, gy)], fill=(0, 247, 255, alpha_factor), width=1)
    
    bg = Image.alpha_composite(bg, grid_overlay)
    
    # Place Fireball Breakout Ball on the Right/Center
    ball_size = 460
    ball_scaled = master_ball.resize((ball_size, ball_size), Image.Resampling.LANCZOS)
    
    # Ball position
    bx = int(W * 0.58)
    by = int(H * 0.12)
    bg.paste(ball_scaled, (bx, by), ball_scaled)
    
    # Left Side: Typography & Badges
    draw = ImageDraw.Draw(bg)
    
    # Load fonts (fallback to default if necessary)
    def load_font(name, size):
        for font_path in [
            f"/System/Library/Fonts/Supplemental/{name}.ttf",
            f"/System/Library/Fonts/{name}.ttc",
            f"/Library/Fonts/{name}.ttf",
            os.path.join(public_dir, 'fonts', f"{name}.ttf"),
            "/System/Library/Fonts/HelveticaNeue.ttc"
        ]:
            if os.path.exists(font_path):
                try:
                    return ImageFont.truetype(font_path, size)
                except Exception:
                    pass
        return ImageFont.load_default()

    font_brand = load_font("Arial Bold", 20)
    font_title = load_font("Arial Bold", 64)
    font_sub = load_font("Arial", 26)
    font_badge = load_font("Arial Bold", 18)
    
    # Top Tag: CYBERPUNK ARCADE
    tag_text = "CYBERPUNK NEON ARCADE"
    draw.text((82, 138), tag_text, fill=(0, 247, 255, 230), font=font_brand)
    
    # Main Title: BREAKOUT BALL
    draw.text((80, 180), "BREAKOUT", fill=(255, 255, 255, 255), font=font_title)
    draw.text((80, 250), "BALL", fill=(255, 140, 20, 255), font=font_title)
    
    # Subtitle
    sub_text = "100 Campaign Sectors • Live Global Arena\nCustom Level Studio • Kinetic Upgrades"
    draw.text((82, 345), sub_text, fill=(180, 210, 240, 240), font=font_sub)
    
    # Badges row: [100 LEVELS] [GLOBAL ARENA] [INSTANT PLAY]
    badges = [
        ("100 LEVELS", (255, 180, 40), (45, 30, 8)),
        ("GLOBAL ARENA", (0, 247, 255), (6, 35, 45)),
        ("INSTANT PLAY", (50, 240, 130), (8, 40, 20))
    ]
    cur_x = 82
    badge_y = 450
    for text, border_c, bg_c in badges:
        bbox = font_badge.getbbox(text)
        bw = (bbox[2] - bbox[0]) + 28
        bh = 38
        # Background rect
        draw.rounded_rectangle([cur_x, badge_y, cur_x + bw, badge_y + bh], radius=8, fill=bg_c, outline=border_c, width=1)
        draw.text((cur_x + 14, badge_y + 8), text, fill=border_c, font=font_badge)
        cur_x += bw + 14
        
    # URL watermark at bottom left
    draw.text((82, 535), "elsesourav.com/apps/breakout-ball", fill=(100, 130, 170, 200), font=font_brand)
    
    # Save PNG (optimize to stay well under 300KB for WhatsApp)
    og_png_path = os.path.join(public_dir, 'og-image.png')
    bg.convert('RGB').save(og_png_path, 'PNG', optimize=True)
    png_size = os.path.getsize(og_png_path)
    print(f"Saved {og_png_path} ({png_size // 1024} KB)")
    
    # Save JPEG (Quality 90)
    og_jpg_path = os.path.join(public_dir, 'og-image.jpg')
    bg.convert('RGB').save(og_jpg_path, 'JPEG', quality=90, optimize=True)
    jpg_size = os.path.getsize(og_jpg_path)
    print(f"Saved {og_jpg_path} ({jpg_size // 1024} KB)")

if __name__ == '__main__':
    generate_assets()
