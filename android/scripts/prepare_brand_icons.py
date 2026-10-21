#!/usr/bin/env python3
"""Build launcher assets from the SAME logo as the website homepage."""
from pathlib import Path
from PIL import Image, ImageOps
root=Path(__file__).resolve().parents[2]
source=root/"app/assets/logo.png"
assert source.is_file(),"Website logo missing"
logo=Image.open(source).convert("RGBA")
for folder,size in [("mipmap-mdpi",48),("mipmap-hdpi",72),("mipmap-xhdpi",96),("mipmap-xxhdpi",144),("mipmap-xxxhdpi",192)]:
    dest=root/"android/app/src/main/res"/folder
    dest.mkdir(parents=True,exist_ok=True)
    image=Image.new("RGBA",(size,size),(13,26,55,255))
    visible=ImageOps.contain(logo,(round(size*.76),round(size*.76)),Image.Resampling.LANCZOS)
    image.alpha_composite(visible,((size-visible.width)//2,(size-visible.height)//2))
    image.save(dest/"ic_launcher.png",optimize=True)
foreground=root/"android/app/src/main/res/drawable-nodpi"
foreground.mkdir(parents=True,exist_ok=True)
large=Image.new("RGBA",(432,432),(0,0,0,0))
foreground_logo=ImageOps.contain(logo,(290,290),Image.Resampling.LANCZOS)
large.alpha_composite(foreground_logo,((432-foreground_logo.width)//2,(432-foreground_logo.height)//2))
large.save(foreground/"op_official_logo.png",optimize=True)
print("Verified real website logo -> Android launcher PNG densities and adaptive icon")
