# Changelog

## 1.0.0 - 2026-11-08
- First public release of the desktop version: runs in its own window and builds to a single `PharmacyManager.exe`.
- Data is stored in `%APPDATA%\PharmacyManager\data.json` with a backup copy, validated and written atomically.
- Old data in the browser's localStorage is copied into the file on first start.
- Fixed: "Sales today" compared UTC dates, so in Bangladesh (UTC+6) it reset at 6:00 AM instead of midnight. It now uses the local date.
- Fixed: expiry-day counting and the sample-data dates are now correct in every time zone.
- Added a custom icon and a short survey toolkit (`survey/`).
