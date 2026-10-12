"""Regenerate the three Android adaptive icon layers from the 1024 app icon.

    python3 scripts/android-icons.py ~/Desktop/final/FINAL-app-icon-3b-1024.png

Needs Pillow. Writes assets/android-icon-{foreground,background,monochrome}.png and
assets/android-splash.png.

An adaptive icon is a 108dp canvas of which a launcher shows at most the
central 72dp, through whatever mask it likes: circle, squircle, rounded
square. So the whole scene is scaled to that 72dp square, two thirds of the
canvas. Every mask then crops inside the artwork, never past its edge, and the
bike survives even the circle because it sits inside the icon's inscribed
circle. The 18dp bleed around it is only seen when a launcher animates the
layers; the scene's edge pixels are stretched into it so nothing shows there.

The monochrome layer is what Android 13+ tints for themed icons, using only
its alpha. Alpha is darkness against the cream sky: the bike solid, the ridges
graded by their own tone, the white spokes and the sky clear.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

CANVAS = 1024
# 72/108 of the canvas, rounded up a few pixels so no mask shows a hairline.
ART = 688
CREAM = (0xF6, 0xF3, 0xEC)

assets = Path(__file__).resolve().parent.parent / 'assets'
source = Image.open(sys.argv[1]).convert('RGB')
art = source.resize((ART, ART), Image.LANCZOS)
offset = (CANVAS - ART) // 2

# Foreground: the scene, with its edges stretched out into the bleed.
fg = Image.new('RGB', (CANVAS, CANVAS))
for y in range(CANVAS):
    sy = min(max(y - offset, 0), ART - 1)
    for x in range(CANVAS):
        sx = min(max(x - offset, 0), ART - 1)
        fg.putpixel((x, y), art.getpixel((sx, sy)))
fg.convert('RGBA').save(assets / 'android-icon-foreground.png')

Image.new('RGBA', (CANVAS, CANVAS), CREAM + (255,)).save(assets / 'android-icon-background.png')

# Monochrome: luminance darkness against the sky, as alpha on white.
def luminance(rgb):
    r, g, b = rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

sky = luminance(CREAM)
darkest = min(luminance(p) for p in art.getdata())
mono = Image.new('RGBA', (CANVAS, CANVAS), (255, 255, 255, 0))
for y in range(ART):
    for x in range(ART):
        a = (sky - luminance(art.getpixel((x, y)))) / (sky - darkest)
        mono.putpixel((x + offset, y + offset), (255, 255, 255, round(255 * min(max(a, 0), 1))))
mono.save(assets / 'android-icon-monochrome.png')

# Splash: Android 12+ shows the splash image through a 192dp circle centred in
# a 288dp canvas, the same two thirds as the icon. The iOS splash has the
# wordmark baked in, which that circle would cut through, so Android gets the
# scene already cut to the circle, clear outside it, on the splash cream.
circle = Image.new('L', (ART, ART), 0)
ImageDraw.Draw(circle).ellipse((0, 0, ART - 1, ART - 1), fill=255)
splash = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
splash.paste(art, (offset, offset), circle)
splash.save(assets / 'android-splash.png')

print('wrote android-icon-{foreground,background,monochrome}.png, android-splash.png')
