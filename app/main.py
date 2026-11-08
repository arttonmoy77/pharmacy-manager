import json
import os
import shutil

import eel

# Where the pharmacy data lives: C:\Users\<you>\AppData\Roaming\PharmacyManager\data.json
APP_DIR = os.path.join(os.environ.get("APPDATA") or os.path.expanduser("~"), "PharmacyManager")
DATA_FILE = os.path.join(APP_DIR, "data.json")
BACKUP_FILE = os.path.join(APP_DIR, "data.backup.json")

eel.init("web")


def _read_valid(path):
    """Return the file's text if it exists and is valid JSON, else None."""
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
        json.loads(text)
        return text
    except Exception:
        return None


@eel.expose
def load_data():
    return _read_valid(DATA_FILE) or _read_valid(BACKUP_FILE)


@eel.expose
def save_data(text):
    try:
        json.loads(text)                       # never write garbage
        os.makedirs(APP_DIR, exist_ok=True)
        tmp = DATA_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(text)
        if _read_valid(DATA_FILE):             # keep the last good copy as a backup
            shutil.copy2(DATA_FILE, BACKUP_FILE)
        os.replace(tmp, DATA_FILE)             # atomic swap
        return True
    except Exception:
        return False


if __name__ == "__main__":
    try:
        eel.start("index.html", size=(1200, 800), port=0)
    except EnvironmentError:
        eel.start("index.html", size=(1200, 800), port=0, mode="edge")
