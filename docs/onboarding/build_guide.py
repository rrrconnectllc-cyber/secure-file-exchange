"""Build the SFX for Legal setup guide as a PDF and as Markdown.

The wording lives in apps/web/src/content/setup-guide.json so the site and
the PDF stay on the same text. Screenshots live in docs/onboarding/figures.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib.colors import Color, white
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[2]
GUIDE_JSON = ROOT / "apps" / "web" / "src" / "content" / "setup-guide.json"
FIGURES = ROOT / "docs" / "onboarding" / "figures"
PDF_PATH = ROOT / "docs" / "onboarding" / "SFX-for-Legal-setup-guide.pdf"
MD_PATH = ROOT / "docs" / "onboarding" / "setup-guide.md"
PUBLIC_PDF = ROOT / "apps" / "web" / "public" / "guides" / "SFX-for-Legal-setup-guide.pdf"
PUBLIC_FIGURES = ROOT / "apps" / "web" / "public" / "guides" / "figures"

PAGE = landscape(letter)
PAGE_W, PAGE_H = PAGE

NAVY = Color(29 / 255, 39 / 255, 73 / 255)
CERULEAN = Color(0 / 255, 117 / 255, 153 / 255)
CREAM = Color(255 / 255, 251 / 255, 244 / 255)
INK = Color(45 / 255, 55 / 255, 72 / 255)
MUTED = Color(74 / 255, 85 / 255, 104 / 255)
HAIRLINE = Color(29 / 255, 39 / 255, 73 / 255, alpha=0.18)
MISS_BG = Color(255 / 255, 248 / 255, 235 / 255)
MISS_EDGE = Color(176 / 255, 122 / 255, 42 / 255)

pdfmetrics.registerFont(TTFont("Georgia", r"C:\Windows\Fonts\georgia.ttf"))
pdfmetrics.registerFont(TTFont("Georgia-Bold", r"C:\Windows\Fonts\georgiab.ttf"))
pdfmetrics.registerFont(TTFont("Georgia-Italic", r"C:\Windows\Fonts\georgiai.ttf"))
pdfmetrics.registerFont(TTFont("Segoe", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("Segoe-Bold", r"C:\Windows\Fonts\segoeuib.ttf"))


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    if not words:
        return [""]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def trim_cream(path: Path) -> PILImage.Image:
    image = PILImage.open(path).convert("RGB")
    width, height = image.size
    pixels = image.load()

    def margin(x: int, y: int) -> bool:
        red, green, blue = pixels[x, y]
        cream = red >= 246 and green >= 238 and blue >= 224 and abs(red - green) < 24 and blue < 252
        darkest = min(red, green, blue)
        lightest = max(red, green, blue)
        scrollbar = lightest - darkest < 48 and 110 <= darkest <= 236
        return cream or scrollbar

    def mostly_margin(points: list[tuple[int, int]]) -> bool:
        if not points:
            return False
        hits = sum(1 for x, y in points if margin(x, y))
        return hits / len(points) >= 0.85

    def column_is_margin(x: int) -> bool:
        return mostly_margin([(x, y) for y in range(0, height, 3)])

    def row_is_margin(y: int, left: int, right: int) -> bool:
        return mostly_margin([(x, y) for x in range(left, right, 3)])

    left = 0
    while left < width - 2 and column_is_margin(left):
        left += 1
    right = width - 1
    while right > left + 2 and column_is_margin(right):
        right -= 1
    top = 0
    while top < height - 2 and row_is_margin(top, left, right):
        top += 1
    bottom = height - 1
    while bottom > top + 2 and row_is_margin(bottom, left, right):
        bottom -= 1

    pad = 12
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(width - 1, right + pad)
    bottom = min(height - 1, bottom + pad)
    return image.crop((left, top, right + 1, bottom + 1))


def draw_lines(c: canvas.Canvas, lines: list[str], x: float, y: float, font: str, size: float, leading: float, color: Color) -> float:
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y - size, line)
        y -= leading
    return y


def paragraph(c: canvas.Canvas, text: str, x: float, y: float, width: float, font: str, size: float, leading: float, color: Color) -> float:
    return draw_lines(c, wrap(text, font, size, width), x, y, font, size, leading, color)


def bullets(c: canvas.Canvas, items: list[str], x: float, y: float, width: float) -> float:
    for item in items:
        lines = wrap(item, "Segoe", 10, width - 16)
        c.setFillColor(CERULEAN)
        c.circle(x + 3, y - 8, 2.2, fill=1, stroke=0)
        y = draw_lines(c, lines, x + 14, y, "Segoe", 10, 14, INK)
        y -= 6
    return y


def footer(c: canvas.Canvas, label: str) -> None:
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, 22, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Segoe", 8)
    c.drawString(28, 8, "SFX for Legal  ·  Setup guide  ·  November 2026")
    c.drawRightString(PAGE_W - 28, 8, label)


def cream_page(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def miss_box(c: canvas.Canvas, text: str, x: float, y: float, width: float) -> float:
    size = 9
    leading = 12.5
    lines = wrap(text, "Segoe", size, width - 20)
    height = 16 + len(lines) * leading
    c.setFillColor(MISS_BG)
    c.roundRect(x, y - height, width, height, 4, fill=1, stroke=0)
    c.setFillColor(MISS_EDGE)
    c.rect(x, y - height, 3, height, fill=1, stroke=0)
    c.setFillColor(MISS_EDGE)
    c.setFont("Segoe-Bold", 8)
    c.drawString(x + 12, y - 12, "EASY TO MISS")
    draw_lines(c, lines, x + 12, y - 16, "Segoe", size, leading, INK)
    return y - height


def draw_cover(c: canvas.Canvas, guide: dict) -> None:
    cream_page(c)
    c.setFillColor(NAVY)
    c.rect(0, 250, PAGE_W, PAGE_H - 250, fill=1, stroke=0)
    c.setFillColor(CERULEAN)
    c.rect(0, 250, PAGE_W, 6, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Segoe", 11)
    c.drawString(48, 520, "SFX FOR LEGAL")
    c.setFont("Georgia", 40)
    c.drawString(48, 460, "Setup guide")
    c.setFont("Georgia-Italic", 16)
    c.drawString(48, 428, "For the person opening the firm's first matter.")
    c.setFont("Segoe", 11)
    c.drawString(48, 390, "Read this before you request a walkthrough.")
    c.setFont("Segoe", 10)
    c.drawString(48, 300, guide["edition"])
    y = 214
    y = paragraph(c, guide["example"], 48, y, 500, "Segoe", 10, 14, INK)
    y -= 12
    y = paragraph(c, guide["video"], 48, y, 500, "Segoe", 10, 14, INK)
    y -= 16
    c.setFillColor(NAVY)
    c.setFont("Segoe-Bold", 10)
    c.drawString(48, y - 10, "20 screens  ·  one picture beside each step")
    footer(c, "Cover")
    c.showPage()


def draw_front(c: canvas.Canvas, guide: dict) -> None:
    cream_page(c)
    y = PAGE_H - 40
    c.setFillColor(CERULEAN)
    c.setFont("Segoe-Bold", 8)
    c.drawString(40, y, "BEFORE THE STEPS")
    y -= 28
    left = [section for section in guide["front"] if section["id"] in ("how", "is")]
    right = [section for section in guide["front"] if section["id"] in ("done", "call")]
    columns = ((40, 360, left), (420, 340, right))
    for x, width, sections in columns:
        column_y = y
        for section in sections:
            c.setFillColor(NAVY)
            c.setFont("Georgia", 16)
            c.drawString(x, column_y - 16, section["title"])
            column_y -= 32
            for text in section.get("paragraphs", []):
                column_y = paragraph(c, text, x, column_y, width, "Segoe", 10, 14, INK)
                column_y -= 8
            if section.get("bullets"):
                column_y = bullets(c, section["bullets"], x, column_y, width)
                column_y -= 8
            column_y -= 10
    footer(c, "Read this first")
    c.showPage()


def draw_step(c: canvas.Canvas, step: dict, image: PILImage.Image) -> None:
    cream_page(c)
    left_x = 28
    left_w = 300
    top = PAGE_H - 36
    bottom_limit = 36
    c.setFillColor(CERULEAN)
    c.setFont("Segoe-Bold", 8)
    c.drawString(left_x, top, f"STEP {step['n']}     FRAME {step['frame']}")
    y = top - 26
    title_lines = wrap(step["title"], "Georgia", 18, left_w)
    y = draw_lines(c, title_lines, left_x, y, "Georgia", 18, 22, NAVY)
    y -= 8
    for text in step["paragraphs"]:
        y = paragraph(c, text, left_x, y, left_w, "Segoe", 9.5, 13, INK)
        y -= 7
    y -= 4
    y = miss_box(c, step["miss"], left_x, y, left_w)
    y -= 12
    c.setFillColor(MUTED)
    c.setFont("Segoe", 8)
    look_lines = wrap("On the picture: " + step["look"], "Segoe", 8, left_w)
    y = draw_lines(c, look_lines, left_x, y, "Segoe", 8, 11, MUTED)
    if y < bottom_limit:
        raise RuntimeError(f"Step {step['n']} overflowed the page by {bottom_limit - y:.1f} points")

    max_w = PAGE_W - 28 - (left_x + left_w + 16)
    max_h = PAGE_H - 36 - 36
    scale = min(max_w / image.width, max_h / image.height)
    draw_w = image.width * scale
    draw_h = image.height * scale
    image_x = left_x + left_w + 16
    image_y = PAGE_H - 36 - draw_h
    c.setStrokeColor(HAIRLINE)
    c.setLineWidth(0.8)
    c.setFillColor(white)
    c.rect(image_x - 1, image_y - 1, draw_w + 2, draw_h + 2, fill=1, stroke=1)
    c.drawImage(ImageReader(image), image_x, image_y, draw_w, draw_h, mask="auto")
    footer(c, f"Step {step['n']}  ·  Frame {step['frame']}")
    c.showPage()


def draw_client_note(c: canvas.Canvas, guide: dict) -> None:
    cream_page(c)
    note = guide["clientNote"]
    y = PAGE_H - 48
    c.setFillColor(CERULEAN)
    c.setFont("Segoe-Bold", 8)
    c.drawString(48, y, "SEND THIS WITH THE LINK")
    y -= 28
    c.setFillColor(NAVY)
    c.setFont("Georgia", 22)
    c.drawString(48, y - 22, note["title"])
    y -= 48
    for text in note["paragraphs"]:
        y = paragraph(c, text, 48, y, 680, "Segoe", 12, 17, INK)
        y -= 12
    footer(c, "Note for the client")
    c.showPage()


def draw_index(c: canvas.Canvas, guide: dict) -> None:
    cream_page(c)
    y = PAGE_H - 44
    c.setFillColor(NAVY)
    c.setFont("Georgia", 22)
    c.drawString(40, y - 22, "Frames, in the order a later video will use")
    y -= 44
    c.setFillColor(INK)
    y = paragraph(
        c,
        "These are the same pictures printed beside the steps. The video is not in this file. When it is recorded, it should follow this order and these words.",
        40,
        y,
        700,
        "Segoe",
        10,
        14,
        INK,
    )
    y -= 16
    mid = 400
    column_y = {40: y, mid: y}
    for index, step in enumerate(guide["steps"]):
        x = 40 if index < 10 else mid
        column_y[x] = paragraph(
            c,
            f"Frame {step['frame']}  ·  Step {step['n']}  ·  {step['title']}",
            x,
            column_y[x],
            340,
            "Segoe",
            10,
            14,
            INK,
        )
        column_y[x] -= 4
    footer(c, "Frame index")
    c.showPage()


def write_markdown(guide: dict) -> None:
    lines = [
        f"# {guide['title']}",
        "",
        f"*{guide['edition']}. Read this before you request a walkthrough.*",
        "",
        guide["example"],
        "",
        guide["video"],
        "",
    ]
    for section in guide["front"]:
        lines.append(f"## {section['title']}")
        lines.append("")
        for text in section.get("paragraphs", []):
            lines.append(text)
            lines.append("")
        for item in section.get("bullets", []):
            lines.append(f"- {item}")
        if section.get("bullets"):
            lines.append("")
    for step in guide["steps"]:
        lines.append(f"## Step {step['n']}. {step['title']}")
        lines.append("")
        lines.append(f"Frame {step['frame']}.")
        lines.append("")
        for text in step["paragraphs"]:
            lines.append(text)
            lines.append("")
        lines.append(f"**Easy to miss.** {step['miss']}")
        lines.append("")
        lines.append(f"*On the picture: {step['look']}*")
        lines.append("")
        lines.append(f"![{step['alt']}](figures/{step['image']})")
        lines.append("")
    note = guide["clientNote"]
    lines.append(f"## {note['title']}")
    lines.append("")
    for text in note["paragraphs"]:
        lines.append(text)
        lines.append("")
    MD_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    guide = json.loads(GUIDE_JSON.read_text(encoding="utf-8"))
    c = canvas.Canvas(str(PDF_PATH), pagesize=PAGE)
    c.setTitle(guide["title"])
    c.setAuthor("SFX for Legal")
    c.setSubject("Setup guide for a firm opening its first matter")
    draw_cover(c, guide)
    draw_front(c, guide)
    cache: dict[str, PILImage.Image] = {}
    PUBLIC_FIGURES.mkdir(parents=True, exist_ok=True)
    for step in guide["steps"]:
        if step["image"] not in cache:
            trimmed = trim_cream(FIGURES / step["image"])
            cache[step["image"]] = trimmed
            trimmed.save(PUBLIC_FIGURES / step["image"], optimize=True)
        draw_step(c, step, cache[step["image"]])
    draw_client_note(c, guide)
    draw_index(c, guide)
    c.save()
    PUBLIC_PDF.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PDF.write_bytes(PDF_PATH.read_bytes())
    write_markdown(guide)
    print(f"Wrote {PDF_PATH}")
    print(f"Wrote {PUBLIC_PDF}")
    print(f"Wrote {MD_PATH}")


if __name__ == "__main__":
    main()
