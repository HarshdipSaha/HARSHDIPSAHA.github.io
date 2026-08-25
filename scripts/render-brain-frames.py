"""
Render the axial frame sequence behind the home page's scroll-scrubbed brain.

Source: ICBM 152 Nonlinear Symmetric 2009a T1 template (McConnell Brain Imaging
Centre, MNI, McGill). Its licence permits copying and redistribution with the
copyright notice, which the site's colophon carries.

    python scripts/render-brain-frames.py <path-to-mni_icbm152_nlin_sym_09a>

Writes public/brain/<size>/<index>.webp for two size tiers plus a manifest.
The output is committed: regenerating it needs the 63 MB template download,
which is not something CI should do on every push.
"""
import json
import os
import sys

import nibabel as nib
import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else ".ref/mni/mni_icbm152_nlin_sym_09a"
OUT = "public/brain"
FRAMES = 160
TIERS = {"1080": 1080, "640": 640}
# Page background, so the frame edge is invisible against the page.
BG = np.array([23, 21, 25], dtype=np.float32)

t1 = nib.load(os.path.join(SRC, "mni_icbm152_t1_tal_nlin_sym_09a.nii")).get_fdata()
mask = nib.load(os.path.join(SRC, "mni_icbm152_t1_tal_nlin_sym_09a_mask.nii")).get_fdata()

brain_z = np.where(mask.sum(axis=(0, 1)) > 50)[0]
# Start at the cerebellum rather than the neck: the lowest slices of the
# template are jaw and sinus, which read as a face rather than a brain.
z_lo, z_hi = int(brain_z.min()) + 34, int(brain_z.max()) - 2
lo, hi = np.percentile(t1[mask > 0], [0.5, 99.7])


def render(z: int, size: int) -> Image.Image:
    s = np.clip((t1[:, :, z] - lo) / (hi - lo), 0, 1)
    s = np.flipud(s.T) ** 0.9
    rgb = BG[None, None, :] * (1 - s[..., None]) + 255 * s[..., None]
    img = Image.fromarray(rgb.astype(np.uint8))
    w, h = img.size
    m = max(w, h) + 40
    canvas = Image.new("RGB", (m, m), tuple(int(c) for c in BG))
    canvas.paste(img, ((m - w) // 2, (m - h) // 2))
    out = canvas.resize((size, size), Image.LANCZOS)
    # The template is an average of 152 brains and reads soft; a light unsharp
    # mask gives the sulci back their edges without inventing detail.
    return out.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))


zs = np.linspace(z_lo, z_hi, FRAMES).round().astype(int)
total = 0
for tier, size in TIERS.items():
    d = os.path.join(OUT, tier)
    os.makedirs(d, exist_ok=True)
    for i, z in enumerate(zs):
        p = os.path.join(d, f"{i:03d}.webp")
        render(int(z), size).save(p, "WEBP", quality=80, method=6)
        total += os.path.getsize(p)
    print(tier, "done")

with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump({"frames": FRAMES, "tiers": TIERS, "source": "ICBM 152 NLIN SYM 2009a T1"}, f)
print(f"{FRAMES} frames x {len(TIERS)} tiers, {total / 1e6:.2f} MB")
