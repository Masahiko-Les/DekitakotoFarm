# listing.md の各項目が App Store Connect の文字数上限に収まっているか確かめる
# 使い方: python3 docs/app-store/check.py
import pathlib
import re

text = (pathlib.Path(__file__).parent / "listing.md").read_text(encoding="utf-8")


def section(title):
    m = re.search(r"^## " + re.escape(title) + r".*?\n(.*?)(?=^---|\Z)", text, re.S | re.M)
    return m.group(1).strip() if m else ""


def row(label):
    m = re.search(r"^\| " + re.escape(label) + r"[^|]*\| (.+?) \|$", text, re.M)
    return m.group(1).strip() if m else ""


keywords = section("キーワード").splitlines()[0]
checks = [
    ("名前", row("名前"), 30),
    ("サブタイトル", row("サブタイトル"), 30),
    ("プロモーションテキスト", section("プロモーションテキスト"), 170),
    ("概要", section("概要"), 4000),
    ("キーワード", keywords, 100),
]
for name, value, limit in checks:
    n = len(value)
    print(f"{'OK ' if 0 < n <= limit else 'NG '} {name}: {n} / {limit}")
