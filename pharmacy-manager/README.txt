PHARMACY MANAGER (desktop app)

RUN (for testing):   double-click run.bat
BUILD THE EXE:       double-click build_exe.bat   ->  dist\PharmacyManager.exe

Your data is stored in:  %APPDATA%\PharmacyManager\data.json
(a backup of the previous save is kept as data.backup.json).
To move to another PC, copy that folder.

Needs Microsoft Edge or Google Chrome on the PC (Windows 10/11 already have Edge).

NEW FEATURES
- First launch asks you to create a Manager account and PIN. Managers can add staff accounts and reset staff PINs. Lock the app from Staff & activity when stepping away.
- Inventory medicine records include optional barcode and purchase cost fields.
- Use Purchases to record supplier receipts, invoice references, costs, batch and expiry details. New batches remain separate inventory rows.
- New sale accepts exact barcode scans from keyboard-style USB scanners after a barcode is saved for the medicine.
- Sales history supports bill, customer, medicine, staff, and date filters.
- Staff & activity shows stock movements and recent actions, with CSV exports.
- Reports & backup includes estimated gross profit for sales with known costs, plus inventory, sales, purchase, movement, and JSON backup exports.
- Restoring a JSON backup replaces current records, including staff accounts. Make a backup first. Manager access is required.

PIN sign-in is a local access gate, not data encryption. The app remains local to one Windows user and does not synchronize across computers.

Updated executable from this feature update: dist\PharmacyManager-Updated.exe

First-run setup fix: PIN entry accepts English or Bangla digits and ignores spaces or hyphens. Latest executable: dist\PharmacyManager-Setup-Fix.exe
