#!/usr/bin/env python3
"""
Compile captured frames into optimized animated GIFs:
- showcase/gifs/gameplay-action.gif
- showcase/gifs/level-creator.gif
- showcase/gifs/map-navigation.gif
"""
import os
import shutil
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP_FRAMES_DIR = os.path.join(BASE_DIR, 'showcase', '.tmp_frames')
GIFS_DIR = os.path.join(BASE_DIR, 'showcase', 'gifs')

os.makedirs(GIFS_DIR, exist_ok=True)

def compile_gif(frame_subfolder, output_name, duration_ms=100, max_width=500):
    src_dir = os.path.join(TMP_FRAMES_DIR, frame_subfolder)
    if not os.path.exists(src_dir):
        print(f"Directory {src_dir} not found. Skipping {output_name}.")
        return

    frame_files = sorted([f for f in os.listdir(src_dir) if f.endswith('.png')])
    if not frame_files:
        print(f"No frames found in {src_dir}.")
        return

    print(f"Compiling {len(frame_files)} frames for {output_name}...")
    images = []
    for f in frame_files:
        img_path = os.path.join(src_dir, f)
        img = Image.open(img_path).convert('RGB')
        # Resize down slightly if wider than max_width to keep gif under 2-3MB
        if img.width > max_width:
            new_h = int(img.height * (max_width / img.width))
            img = img.resize((max_width, new_h), Image.Resampling.BILINEAR)
        # Quantize to adaptive 128 colors palette for crisp gif rendering and small size
        quantized = img.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
        images.append(quantized)

    dest_path = os.path.join(GIFS_DIR, output_name)
    images[0].save(
        dest_path,
        save_all=True,
        append_images=images[1:],
        duration=duration_ms,
        loop=0,
        optimize=True
    )
    file_size_kb = os.path.getsize(dest_path) / 1024
    print(f"✓ Saved {dest_path} ({file_size_kb:.1f} KB)")

def main():
    compile_gif('gameplay', 'gameplay-action.gif', duration_ms=110, max_width=440)
    compile_gif('studio', 'level-creator.gif', duration_ms=120, max_width=560)
    compile_gif('map', 'map-navigation.gif', duration_ms=120, max_width=420)
    
    # Clean up temporary frames folder
    if os.path.exists(TMP_FRAMES_DIR):
        shutil.rmtree(TMP_FRAMES_DIR)
        print("✓ Cleaned up temporary frames folder.")

if __name__ == '__main__':
    main()
