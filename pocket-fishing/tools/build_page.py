"""
Rebuilds the generated blocks inside index.html from the files in tools/:

  /*FISHING-MODULE*/ ... /*/FISHING-MODULE*/   <- build_fishing.py (original game + fishing_theme.js + extra_fish.json)
  /*FISH3D*/ ... /*/FISH3D*/                   <- fish3d.js   (3D fish models)
  /*PART3D*/ ... /*/PART3D*/                   <- part3d.js   (rod upgrade icons)
  const FISH_EXTRA = {...};                    <- fish_trivia.json (trivia 2 and 3 for every fish)

usage (from the pocket-fishing folder):
  python3 tools/build_page.py            # uses tools/original_game.html
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "..", "index.html")
ORIGINAL = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "original_game.html")

def swap(text, start, end, body):
    a = text.index(start) + len(start); b = text.index(end, a)
    return text[:a] + body + text[b:]

with tempfile.TemporaryDirectory() as tmp:
    mod_path = os.path.join(tmp, "fishing_module.js")
    subprocess.run([sys.executable, os.path.join(HERE, "build_fishing.py"), ORIGINAL, mod_path], check=True)
    module = open(mod_path, encoding="utf-8").read()

page = open(PAGE, encoding="utf-8").read()
page = swap(page, "/*FISHING-MODULE*/\n", "\n/*/FISHING-MODULE*/", module)
page = swap(page, "/*FISH3D*/\n", "/*/FISH3D*/", open(os.path.join(HERE, "fish3d.js"), encoding="utf-8").read())
page = swap(page, "/*PART3D*/\n", "/*/PART3D*/", open(os.path.join(HERE, "part3d.js"), encoding="utf-8").read())
trivia = json.load(open(os.path.join(HERE, "fish_trivia.json"), encoding="utf-8"))
page = swap(page, "const FISH_EXTRA = ", ";\n", json.dumps(trivia, ensure_ascii=False))
open(PAGE, "w", encoding="utf-8").write(page)
print("rebuilt", os.path.normpath(PAGE))
