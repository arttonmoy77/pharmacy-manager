# Pharmacy Manager

**A free, offline desktop app for stock, expiry tracking and billing in small pharmacies, designed after a field survey in Sanirakhra, Dhaka.**

![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Platform: Windows](https://img.shields.io/badge/platform-Windows-blue)
![Stack: Python + JavaScript](https://img.shields.io/badge/stack-Python%20%2B%20JavaScript-orange)

---

## Why this project exists

Small pharmacies keep a lot in paper registers and in people's heads: which medicines are running low, which batches are about to expire, and what was sold today. When that goes wrong, medicine expires on the shelf, popular items run out, and the owner does not know the day's sales.

I surveyed pharmacies around **Sanirakhra (Shonir Akhra), Dhaka** and asked a simple question: *do you use a pharmacy management app, or do you work manually?*

**What I found:** most of the pharmacies were working **offline and manually**. The reasons they gave were mainly **lack of knowledge about such software** and **lack of staff who could operate it**, along with other practical barriers.

So the goal of this project is not to build the most powerful pharmacy software. It is to build one that a shop with no IT knowledge and no spare staff can start using in minutes.

> The questionnaire, a CSV template and an analysis script are in [`survey/`](survey/). Raw responses are not published, to protect the shops' privacy.

## From survey to design

| What the survey showed | How Pharmacy Manager responds |
|---|---|
| Staff do not know how to use such software | Four simple screens (Dashboard, Inventory, New sale, Sales history). Sample medicines appear on the first start so you can learn by clicking. No accounts, no server, no setup. |
| No spare staff to operate it | A sale takes three steps: search, click, complete. Stock is deducted automatically and expiry and low-stock warnings appear on their own, so nobody has to check shelves by hand. |
| Shops work offline | Runs fully offline. Data is kept in a file on the same PC. Internet is never required. |
| Other barriers (setup, cost, complexity) | Free and open source (MIT). One `.exe` file to run, nothing to install. |

## Features

- **Dashboard:** sales today, number of medicines, items to reorder, batches expired or expiring within 60 days, and stock value.
- **Inventory:** search by name, generic name or supplier; filters (all, low or out of stock, expired or expiring); add, edit, restock and delete.
- **Status tags:** Expired, Out of stock, Expires in N d, Low stock, OK, calculated automatically.
- **New sale:** search by brand or generic name, build a bill, add a customer name and a percentage discount, complete the sale and **print a receipt**.
- **Safety checks:** expired or out-of-stock medicines cannot be added to a bill.
- **Sales history:** every bill with date, customer and total; reopen and reprint any receipt.
- **Safe storage:** data is saved to a file with an automatic backup copy.
- **Light and dark mode** that follows the Windows setting.

## Quick start

### Option A: use the ready-made app
Download `PharmacyManager.exe` from the **Releases** page of this repository and double-click it. It needs Microsoft Edge or Google Chrome (Windows 10 and 11 already include Edge). Python is not needed.

### Option B: run from source (Windows)
```bat
git clone https://github.com/<arttonmoy77>/pharmacy-manager.git
cd pharmacy-manager\app
run.bat
```
`run.bat` creates a virtual environment, installs the requirements and starts the app. You need Python 3.12 or 3.13.

### Build the .exe yourself
```bat
cd app
build_exe.bat
```
The result is `app\dist\PharmacyManager.exe`. The command it runs is:
```bat
pyinstaller --onefile --noconsole --clean --name PharmacyManager --icon icon.ico ^
  --add-data "web;web" --add-data ".venv\Lib\site-packages\eel\eel.js;eel" main.py
```

## How to use it (first 10 minutes)

1. **Start the app.** Seven sample medicines appear so every screen has something to show.
2. **Inventory.** Delete or edit the samples, then use **Add medicine** for your real stock (brand name, expiry date and price are required).
3. **Dashboard.** Check it every morning: *Reorder soon* and *Expiry watch* tell you what needs attention.
4. **New sale.** Type a name, click the medicine, adjust the quantity, enter a customer and discount if needed, then **Complete sale** and print the receipt.
5. **Sales history.** Reopen any bill when a customer asks.

## Where is my data?

```
%APPDATA%\PharmacyManager\data.json          (your data)
%APPDATA%\PharmacyManager\data.backup.json   (the previous save)
```
To back up the pharmacy, copy that folder. To move to another PC, install the app there and copy the folder across.

## How it works

```
 Page (HTML + CSS + JavaScript)  <--->  Eel (local web server + WebSocket)  <--->  main.py  --->  data.json
```

The interface is a single HTML page shown in its own Edge or Chrome app window. A very small Python program does one job: reading and writing the data file. Writes go to a temporary file first, are checked to be valid JSON, then swapped in atomically, with the previous good file kept as a backup. If the page is opened in a plain browser without Python, it falls back to the browser's localStorage.

Full details are in the [project documentation (PDF)](docs/PharmacyManager_Documentation.pdf).

## Tech stack

| Part | Technology |
|---|---|
| Interface | HTML5, CSS3, vanilla JavaScript (no framework, no external JS libraries) |
| Bridge to Python | [Eel](https://github.com/python-eel/Eel) |
| Backend | Python 3.12 (file storage only) |
| Packaging | PyInstaller |

## Project structure

```
pharmacy-manager/
  app/
    main.py            Python: load_data() / save_data(), opens the window
    web/index.html     the whole interface
    web/favicon.ico    window icon
    icon.ico           exe icon
    requirements.txt   eel, pyinstaller
    run.bat            run from source
    build_exe.bat      build the .exe
  survey/              questionnaire, CSV template, analysis script
  docs/                project documentation (PDF)
  CHANGELOG.md
  LICENSE
```

## Roadmap

- [ ] **Bangla interface and Bangla help text** (top priority from the survey: lack of IT knowledge)
- [ ] Short video or printable guide for shop staff
- [ ] Export and import (CSV) and a one-click backup button
- [ ] Several batches per medicine, selling the oldest expiry first
- [ ] Supplier list and purchase orders from the reorder screen
- [ ] Returns and refunds, VAT, thermal-printer receipt layout
- [ ] Barcode scanning through the search box
- [ ] Windows installer (for example with Inno Setup)

## Known limitations

- One PC, one data file: no sharing between computers and no user login.
- Each medicine has a single batch and expiry date; add each batch as its own entry for now.
- The `.exe` is Windows-only (the page itself runs in any Chromium browser).
- PyInstaller programs are sometimes flagged by antivirus as false positives.

## Contributing

Issues and pull requests are welcome, especially Bangla translations and feedback from people who run a pharmacy. Please do not commit any real shop data.

## License

[MIT](LICENSE). Free to use, change and share.
