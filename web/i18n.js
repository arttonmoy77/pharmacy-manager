/* Language switch: English / বাংলা.
   Visible text is translated in place after every render (MutationObserver),
   so the existing render code does not need to change.
   The choice is stored in the app data as S.lang. Eel starts the page on a new
   port each launch, which would reset localStorage, so the data file is used. */
(function () {
  var BN = {
    "Dashboard": "ড্যাশবোর্ড",
    "Inventory": "মজুদ তালিকা",
    "New sale": "নতুন বিক্রয়",
    "Sales history": "বিক্রয়ের ইতিহাস",
    "Reports & backup": "প্রতিবেদন ও ব্যাকআপ",
    "Staff & activity": "কর্মী ও কার্যক্রম",
    "Expenses": "খরচ",
    "Day mode": "দিনের মোড",
    "Night mode": "রাতের মোড",
    "Pharmacy Manager": "ফার্মেসি ম্যানেজার",
    "Sign in": "সাইন ইন",
    "Sign in to continue.": "চালিয়ে যেতে সাইন ইন করুন।",
    "Lock app": "অ্যাপ লক করুন",
    "Unlock app": "অ্যাপ আনলক করুন",
    "App locked": "অ্যাপ লক করা আছে",
    "Signed in": "সাইন ইন হয়েছে",
    "Staff login": "কর্মী লগইন",
    "Manager login": "ম্যানেজার লগইন",
    "CEO login": "সিইও লগইন",
    "CEO": "সিইও",
    "Manager": "ম্যানেজার",
    "Staff": "কর্মী",
    "Ultimate Manager": "সর্বোচ্চ ম্যানেজার",
    "Choose how you want to sign in.": "কীভাবে সাইন ইন করতে চান তা বেছে নিন।",
    "Back": "ফিরে যান",
    "Back to sign in": "সাইন ইনে ফিরে যান",
    "Forgot PIN": "পিন ভুলে গেছেন",
    "Forgot PIN?": "পিন ভুলে গেছেন?",
    "Use recovery code": "রিকভারি কোড ব্যবহার করুন",
    "Recovery code": "রিকভারি কোড",
    "One-time recovery code": "একবারের রিকভারি কোড",
    "I saved the code": "আমি কোডটি সংরক্ষণ করেছি",
    "Save manager recovery code": "ম্যানেজারের রিকভারি কোড সংরক্ষণ",
    "Save CEO recovery code": "সিইও রিকভারি কোড সংরক্ষণ",
    "Set up CEO account": "সিইও অ্যাকাউন্ট সেট আপ করুন",
    "CEO account": "সিইও অ্যাকাউন্ট",
    "CEO name": "সিইও-এর নাম",
    "Recover CEO PIN": "সিইও পিন উদ্ধার",
    "Reset CEO PIN": "সিইও পিন রিসেট",
    "CEO access is required.": "সিইও-এর অ্যাক্সেস প্রয়োজন।",
    "CEO account created": "সিইও অ্যাকাউন্ট তৈরি হয়েছে",
    "CEO recovery code generated": "সিইও-এর রিকভারি কোড তৈরি হয়েছে",
    "Use the correct login option for this account.": "এই অ্যাকাউন্টের জন্য সঠিক লগইন বিকল্প ব্যবহার করুন।",
    "Choose the CEO account.": "সিইও অ্যাকাউন্ট বেছে নিন।",
    "Choose an authorized Manager or CEO.": "একজন অনুমোদিত ম্যানেজার বা সিইও বেছে নিন।",
    "Enter the manager name.": "ম্যানেজারের নাম লিখুন।",
    "Enter a staff name.": "একটি কর্মীর নাম লিখুন।",
    "Enter a name.": "একটি নাম লিখুন।",
    "Enter a valid email address.": "সঠিক ইমেইল ঠিকানা লিখুন।",
    "Enter": "প্রবেশ করুন",
    "Approve and reset": "অনুমোদন দিয়ে রিসেট করুন",
    "Approver PIN": "অনুমোদনকারীর পিন",
    "Approving account": "অনুমোদনকারী অ্যাকাউন্ট",
    "Account to reset": "রিসেট করার অ্যাকাউন্ট",
    "Choose an account to reset.": "রিসেট করার জন্য একটি অ্যাকাউন্ট বেছে নিন।",
    "Choose a valid account role.": "সঠিক অ্যাকাউন্ট ভূমিকা বেছে নিন।",
    "Manager access is required.": "ম্যানেজারের অ্যাক্সেস প্রয়োজন।",
    "Manager access is required to view staff profiles.": "কর্মীর প্রোফাইল দেখতে ম্যানেজারের অ্যাক্সেস প্রয়োজন।",
    "Your access is set by the CEO.": "আপনার অ্যাক্সেস সিইও ঠিক করেছেন।",
    "Your account does not have permission for this feature.": "এই ফিচারের জন্য আপনার অ্যাকাউন্টের অনুমতি নেই।",
    "Your manager account does not have permission for this action.": "এই কাজের জন্য আপনার ম্যানেজার অ্যাকাউন্টের অনুমতি নেই।",
    "Your manager account does not have permission for this feature.": "এই ফিচারের জন্য আপনার ম্যানেজার অ্যাকাউন্টের অনুমতি নেই।",
    "Only the CEO can change a Manager PIN.": "শুধু সিইও ম্যানেজারের পিন পরিবর্তন করতে পারেন।",
    "Only the CEO can reset a Manager PIN.": "শুধু সিইও ম্যানেজারের পিন রিসেট করতে পারেন।",
    "This manager account cannot manage staff PINs.": "এই ম্যানেজার অ্যাকাউন্ট কর্মীর পিন পরিচালনা করতে পারে না।",
    "At least one manager must keep staff-management access.": "অন্তত একজন ম্যানেজারের কর্মী-ব্যবস্থাপনার অ্যাক্সেস থাকতে হবে।",
    "You cannot remove this administrator account.": "এই অ্যাডমিন অ্যাকাউন্ট সরানো যাবে না।",
    "Could not create a recovery code in this browser.": "এই ব্রাউজারে রিকভারি কোড তৈরি করা যায়নি।",
    "Could not create this account in the current browser.": "বর্তমান ব্রাউজারে এই অ্যাকাউন্ট তৈরি করা যায়নি।",
    "Could not reset the PIN in this browser.": "এই ব্রাউজারে পিন রিসেট করা যায়নি।",
    "Could not update the PIN in this browser.": "এই ব্রাউজারে পিন আপডেট করা যায়নি।",
    "Could not verify the PIN in this browser.": "এই ব্রাউজারে পিন যাচাই করা যায়নি।",
    "PIN security is unavailable in this browser. Open the desktop app and try again.": "এই ব্রাউজারে পিন নিরাপত্তা সুবিধা নেই। ডেস্কটপ অ্যাপ খুলে আবার চেষ্টা করুন।",
    "PIN reset. Sign in with the new PIN.": "পিন রিসেট হয়েছে। নতুন পিন দিয়ে সাইন ইন করুন।",
    "PIN reset approved": "পিন রিসেটের অনুমোদন দেওয়া হয়েছে",
    "PIN changed": "পিন পরিবর্তন হয়েছে",
    "PIN updated": "পিন আপডেট হয়েছে",
    "PIN": "পিন",
    "PIN (4–12 digits)": "পিন (4–12 সংখ্যা)",
    "New PIN": "নতুন পিন",
    "New PIN (4–12 digits)": "নতুন পিন (4–12 সংখ্যা)",
    "Current PIN": "বর্তমান পিন",
    "Confirm new PIN": "নতুন পিন নিশ্চিত করুন",
    "Enter your current PIN, then choose a new PIN using 4–12 digits.": "বর্তমান পিন লিখুন, তারপর 4–12 সংখ্যার একটি নতুন পিন বেছে নিন।",
    "Change PIN": "পিন পরিবর্তন",
    "Change my PIN": "আমার পিন পরিবর্তন করুন",
    "Save PIN": "পিন সংরক্ষণ",
    "PINs are stored as hashes and cannot be shown. Use Reset PIN to set a new one.": "পিন হ্যাশ আকারে সংরক্ষিত থাকে, তা দেখানো যায় না। নতুন পিন দিতে পিন রিসেট ব্যবহার করুন।",
    "The PIN did not match.": "পিন মেলেনি।",
    "The current PIN did not match.": "বর্তমান পিন মেলেনি।",
    "The new PINs do not match.": "নতুন পিন দুটি মেলেনি।",
    "The recovery code did not match.": "রিকভারি কোড মেলেনি।",
    "The approving manager PIN did not match.": "অনুমোদনকারী ম্যানেজারের পিন মেলেনি।",
    "The staff member will use this new PIN next time they sign in.": "কর্মী পরের বার সাইন ইনের সময় এই নতুন পিন ব্যবহার করবেন।",
    "Staff PIN reset": "কর্মীর পিন রিসেট",
    "Staff account added": "কর্মী অ্যাকাউন্ট যোগ হয়েছে",
    "Staff account added. Assign access in the account list.": "কর্মী অ্যাকাউন্ট যোগ হয়েছে। অ্যাকাউন্ট তালিকায় অ্যাক্সেস দিন।",
    "Staff account removed": "কর্মী অ্যাকাউন্ট সরানো হয়েছে",
    "Staff section": "কর্মী বিভাগ",
    "Staff photo": "কর্মীর ছবি",
    "No staff photo": "কর্মীর কোনো ছবি নেই",
    "Remove photo": "ছবি সরান",
    "Choose a JPG, PNG, WEBP or GIF image.": "JPG, PNG, WEBP বা GIF ছবি বেছে নিন।",
    "Choose an image smaller than 5 MB.": "5 MB-এর চেয়ে ছোট একটি ছবি বেছে নিন।",
    "Could not read this image.": "এই ছবিটি পড়া যায়নি।",
    "Account access setting was not valid.": "অ্যাকাউন্ট অ্যাক্সেসের সেটিং সঠিক ছিল না।",
    "Account access updated": "অ্যাকাউন্ট অ্যাক্সেস আপডেট হয়েছে",
    "Account details": "অ্যাকাউন্টের বিবরণ",
    "Account edited": "অ্যাকাউন্ট সম্পাদনা করা হয়েছে",
    "Account removed": "অ্যাকাউন্ট মুছে ফেলা হয়েছে",
    "Account updated": "অ্যাকাউন্ট আপডেট হয়েছে",
    "Add account": "অ্যাকাউন্ট যোগ করুন",
    "Add staff account": "কর্মী অ্যাকাউন্ট যোগ করুন",
    "Create account": "অ্যাকাউন্ট তৈরি করুন",
    "Save account": "অ্যাকাউন্ট সংরক্ষণ",
    "Save changes": "পরিবর্তন সংরক্ষণ করুন",
    "Edit account": "অ্যাকাউন্ট সম্পাদনা",
    "Remove account": "অ্যাকাউন্ট সরান",
    "Remove": "সরান",
    "View profile": "প্রোফাইল দেখুন",
    "View": "দেখুন",
    "Another account already uses this name.": "এই নামে আরেকটি অ্যাকাউন্ট আছে।",
    "Staff ID will be generated automatically.": "কর্মীর আইডি স্বয়ংক্রিয়ভাবে তৈরি হবে।",
    "Hire date": "নিয়োগের তারিখ",
    "Phone": "ফোন",
    "Email": "ইমেইল",
    "Address": "ঠিকানা",
    "Role": "ভূমিকা",
    "Status": "অবস্থা",
    "Type": "ধরন",
    "Notes": "মন্তব্য",
    "Search staff": "কর্মী খুঁজুন",
    "Search staff name, ID, phone or email": "কর্মীর নাম, আইডি, ফোন বা ইমেইল খুঁজুন",
    "No staff accounts found.": "কোনো কর্মী অ্যাকাউন্ট পাওয়া যায়নি।",
    "No staff match that search.": "এই অনুসন্ধানে কোনো কর্মী মেলেনি।",
    "No access assigned yet": "এখনও কোনো অ্যাক্সেস দেওয়া হয়নি",
    "Use sales and sales history": "বিক্রয় ও বিক্রয়ের ইতিহাস ব্যবহার",
    "View and export reports": "প্রতিবেদন দেখুন ও রপ্তানি করুন",
    "Restore backups": "ব্যাকআপ পুনরুদ্ধার",
    "Manage inventory": "মজুদ ব্যবস্থাপনা",
    "Manage staff accounts": "কর্মী অ্যাকাউন্ট ব্যবস্থাপনা",
    "Customize app layout": "অ্যাপের লেআউট কাস্টমাইজ করুন",
    "Save layout": "লেআউট সংরক্ষণ",
    "Show all sections": "সব বিভাগ দেখান",
    "All app sections are shown": "অ্যাপের সব বিভাগ দেখানো হচ্ছে",
    "App layout saved": "অ্যাপের লেআউট সংরক্ষিত হয়েছে",
    "Activity will appear here.": "কার্যক্রম এখানে দেখা যাবে।",
    "Recent activity": "সাম্প্রতিক কার্যক্রম",
    "No activity yet.": "এখনও কোনো কার্যক্রম নেই।",
    "No sign-in recorded": "কোনো সাইন-ইন রেকর্ড নেই",
    "Medicine": "ওষুধ",
    "Medicine / batch": "ওষুধ / ব্যাচ",
    "Medicine / product": "ওষুধ / পণ্য",
    "Medicines listed": "তালিকাভুক্ত ওষুধ",
    "Medicine saved": "ওষুধ সংরক্ষিত হয়েছে",
    "Medicine updated": "ওষুধ আপডেট হয়েছে",
    "Medicine added": "ওষুধ যোগ হয়েছে",
    "Medicine deleted": "ওষুধ মুছে ফেলা হয়েছে",
    "Medicine details, batch and expiry, quantity, reorder level and sale price.": "ওষুধের বিবরণ, ব্যাচ ও মেয়াদ, পরিমাণ, পুনঃঅর্ডারের সীমা ও বিক্রয়মূল্য।",
    "Add medicine": "ওষুধ যোগ করুন",
    "Edit medicine": "ওষুধ সম্পাদনা",
    "Save medicine": "ওষুধ সংরক্ষণ",
    "Delete medicine": "ওষুধ মুছুন",
    "This removes the medicine from inventory. Past sales keep their records.": "এতে ওষুধটি মজুদ তালিকা থেকে মুছে যাবে। আগের বিক্রয়ের রেকর্ড থাকবে।",
    "Brand name": "ব্র্যান্ড নাম",
    "Generic name": "জেনেরিক নাম",
    "Form (tablet, syrup…)": "ফর্ম (ট্যাবলেট, সিরাপ…)",
    "Supplier": "সরবরাহকারী",
    "Batch no.": "ব্যাচ নং",
    "Batch number": "ব্যাচ নম্বর",
    "Batch / expiry": "ব্যাচ / মেয়াদ",
    "Expiry date": "মেয়াদের তারিখ",
    "Expiry watch": "মেয়াদ পর্যবেক্ষণ",
    "Expired": "মেয়াদোত্তীর্ণ",
    "Expired or expiring": "মেয়াদোত্তীর্ণ বা মেয়াদ শেষ হওয়ার পথে",
    "Expired or expiring in 60 days": "60 দিনের মধ্যে মেয়াদোত্তীর্ণ বা মেয়াদ শেষ হবে",
    "No batches expire in the next 60 days.": "পরবর্তী 60 দিনে কোনো ব্যাচের মেয়াদ শেষ হবে না।",
    "Quantity": "পরিমাণ",
    "Reorder level": "পুনঃঅর্ডারের সীমা",
    "Sale price per unit (৳)": "প্রতি একক বিক্রয়মূল্য (৳)",
    "Price": "দাম",
    "Cost": "খরচ",
    "Stock": "মজুদ",
    "Stock added": "মজুদ যোগ হয়েছে",
    "Stock value at sale price": "বিক্রয়মূল্যে মজুদের মূল্য",
    "Stock changes will appear here.": "মজুদের পরিবর্তন এখানে দেখা যাবে।",
    "Stock movement history": "মজুদের পরিবর্তনের ইতিহাস",
    "Add stock": "মজুদ যোগ করুন",
    "Receive stock": "মজুদ গ্রহণ",
    "Restock": "মজুদ পূরণ",
    "Restock received": "মজুদ গ্রহণ সম্পন্ন",
    "Manual restock": "হাতে মজুদ যোগ",
    "Units received": "গৃহীত একক",
    "Units": "একক",
    "Items": "আইটেম",
    "Initial quantity": "প্রাথমিক পরিমাণ",
    "Opening stock": "প্রারম্ভিক মজুদ",
    "Correction": "সংশোধন",
    "Removed": "সরানো",
    "Purchase": "ক্রয়",
    "Sale": "বিক্রয়",
    "Balance": "ব্যালেন্স",
    "Reason / reference": "কারণ / সূত্র",
    "Inventory edited": "মজুদ তালিকা সম্পাদনা হয়েছে",
    "Reorder soon": "শীঘ্রই পুনঃঅর্ডার করুন",
    "Need reordering": "পুনঃঅর্ডার প্রয়োজন",
    "Everything is above its minimum level.": "সব কিছু ন্যূনতম মাত্রার উপরে আছে।",
    "Low stock": "মজুদ কম",
    "Low or out of stock": "কম বা মজুদ শেষ",
    "Out of stock": "মজুদ শেষ",
    "OK": "ঠিক আছে",
    "Sales total": "মোট বিক্রয়",
    "Sales total included in this estimate": "এই হিসাবে মোট বিক্রয় অন্তর্ভুক্ত",
    "Sales in filtered results": "ফিল্টার করা ফলাফলে বিক্রয়",
    "Sales margin": "বিক্রয়ে মুনাফার হার",
    "Total sales": "মোট বিক্রয়",
    "Total": "মোট",
    "Subtotal": "উপমোট",
    "Discount (%)": "ছাড় (%)",
    "Discount percent": "ছাড়ের শতাংশ",
    "Search medicine, generic or scan barcode": "ওষুধ, জেনেরিক নাম খুঁজুন বা বারকোড স্ক্যান করুন",
    "Search name, generic or supplier": "নাম, জেনেরিক নাম বা সরবরাহকারী খুঁজুন",
    "Search bill, customer, item or staff": "বিল, গ্রাহক, আইটেম বা কর্মী খুঁজুন",
    "No medicines match. Add one or change the filter.": "কোনো ওষুধ মেলেনি। একটি যোগ করুন বা ফিল্টার বদলান।",
    "No medicine found.": "কোনো ওষুধ পাওয়া যায়নি।",
    "No exact barcode match. Search results shown.": "হুবহু বারকোড মেলেনি। অনুসন্ধানের ফলাফল দেখানো হচ্ছে।",
    "This barcode is assigned to more than one product. Check inventory.": "এই বারকোড একাধিক পণ্যের সঙ্গে যুক্ত। মজুদ তালিকা দেখুন।",
    "This barcode is expired or out of stock.": "এই বারকোডের ওষুধের মেয়াদ শেষ বা মজুদ নেই।",
    "Barcode": "বারকোড",
    "Name": "নাম",
    "Clear": "মুছুন",
    "Clear filters": "ফিল্টার মুছুন",
    "All items": "সব আইটেম",
    "Enter a name, expiry date and price.": "নাম, মেয়াদের তারিখ ও দাম লিখুন।",
    "Enter supplier, batch, expiry, quantity and a valid unit cost.": "সরবরাহকারী, ব্যাচ, মেয়াদ, পরিমাণ ও সঠিক একক দাম লিখুন।",
    "Enter a valid purchase cost.": "সঠিক ক্রয়মূল্য লিখুন।",
    "Enter units greater than zero.": "শূন্যের চেয়ে বড় পরিমাণ লিখুন।",
    "Purchase cost per unit (৳)": "প্রতি একক ক্রয়মূল্য (৳)",
    "Leave blank to keep current cost": "বর্তমান খরচ রাখতে ফাঁকা রাখুন",
    "Keep": "রাখুন",
    "Record purchases": "ক্রয় রেকর্ড করুন",
    "Record purchase and add stock": "ক্রয় রেকর্ড করুন ও মজুদ যোগ করুন",
    "Purchases": "ক্রয়সমূহ",
    "Purchase recorded": "ক্রয় রেকর্ড করা হয়েছে",
    "Purchase recorded and stock updated": "ক্রয় রেকর্ড করা হয়েছে এবং মজুদ আপডেট হয়েছে",
    "Received purchases will appear here.": "গৃহীত ক্রয় এখানে দেখা যাবে।",
    "Add a medicine in Inventory before receiving stock.": "মজুদ গ্রহণের আগে মজুদ তালিকায় একটি ওষুধ যোগ করুন।",
    "Supplier / invoice": "সরবরাহকারী / ইনভয়েস",
    "Supplier invoice / reference": "সরবরাহকারীর ইনভয়েস / সূত্র",
    "Supplier and purchase records": "সরবরাহকারী ও ক্রয়ের রেকর্ড",
    "Export purchase CSV": "ক্রয়ের CSV রপ্তানি করুন",
    "Export movement CSV": "মজুদ পরিবর্তনের CSV রপ্তানি করুন",
    "Export profit detail CSV": "লাভের বিস্তারিত CSV রপ্তানি করুন",
    "Line profit after allocated discount": "ছাড় বাদ দেওয়ার পর লাইনের লাভ",
    "Pick medicines from the list to start a bill.": "বিল শুরু করতে তালিকা থেকে ওষুধ বেছে নিন।",
    "Complete sale": "বিক্রয় সম্পন্ন করুন",
    "Sale completed": "বিক্রয় সম্পন্ন হয়েছে",
    "Customer": "গ্রাহক",
    "Walk-in": "ওয়াক-ইন",
    "Bill": "বিল",
    "Bills issued": "ইস্যু করা বিল",
    "Bills made": "তৈরি করা বিল",
    "Matching bills": "মিলে যাওয়া বিল",
    "Date": "তারিখ",
    "No sales yet. Complete a bill in New sale and it will show up here.": "এখনও কোনো বিক্রয় নেই। নতুন বিক্রয়ে একটি বিল সম্পন্ন করুন, তা এখানে দেখা যাবে।",
    "No sales match these filters.": "এই ফিল্টারে কোনো বিক্রয় মেলেনি।",
    "Export reports": "প্রতিবেদন রপ্তানি",
    "Download a spreadsheet-friendly snapshot of current inventory or recorded sales.": "বর্তমান মজুদ বা রেকর্ড করা বিক্রয়ের একটি স্প্রেডশিট-বান্ধব কপি ডাউনলোড করুন।",
    "Export inventory CSV": "মজুদ CSV রপ্তানি করুন",
    "Export sales CSV": "বিক্রয়ের CSV রপ্তানি করুন",
    "Backup and restore": "ব্যাকআপ ও পুনরুদ্ধার",
    "Save a portable copy of your medicines and sales. Restore replaces the current records.": "আপনার ওষুধ ও বিক্রয়ের একটি বহনযোগ্য কপি সংরক্ষণ করুন। পুনরুদ্ধার বর্তমান রেকর্ড প্রতিস্থাপন করবে।",
    "Download JSON backup": "JSON ব্যাকআপ ডাউনলোড করুন",
    "Restore from backup": "ব্যাকআপ থেকে পুনরুদ্ধার",
    "Backup restored": "ব্যাকআপ পুনরুদ্ধার হয়েছে",
    "That file is not a valid Pharmacy Manager backup.": "এটি সঠিক ফার্মেসি ম্যানেজার ব্যাকআপ ফাইল নয়।",
    "What the exports contain": "রপ্তানিতে কী থাকে",
    "Inventory CSV": "মজুদ CSV",
    "JSON backup": "JSON ব্যাকআপ",
    "Sales CSV": "বিক্রয় CSV",
    "Restorable copy of the app's current medicine and sales records.": "অ্যাপের বর্তমান ওষুধ ও বিক্রয়ের রেকর্ডের পুনরুদ্ধারযোগ্য কপি।",
    "One row per medicine line, with bill, customer, date, price and total.": "প্রতিটি ওষুধের জন্য এক সারি, সঙ্গে বিল, গ্রাহক, তারিখ, দাম ও মোট।",
    "Could not save data": "তথ্য সংরক্ষণ করা যায়নি",
    "Unassigned": "বরাদ্দহীন",
    "Close": "বন্ধ করুন",
    "Close popup": "পপআপ বন্ধ করুন",
    "Cancel": "বাতিল",
    "Delete": "মুছুন",
    "Edit": "সম্পাদনা",
    "Print": "প্রিন্ট",
    "Current": "বর্তমান",
    "Reset PIN": "পিন রিসেট",
    "Enter a 4–12 digit PIN.": "4–12 সংখ্যার একটি পিন লিখুন।",
    "Enter a PIN using 4–12 digits.": "4–12 সংখ্যার একটি পিন লিখুন।",
    "Enter a PIN using 4–12 digits. English and Bangla digits are accepted.": "4–12 সংখ্যার একটি পিন লিখুন। ইংরেজি ও বাংলা উভয় সংখ্যাই গ্রহণযোগ্য।",
    "Enter a new PIN using 4–12 digits.": "4–12 সংখ্যার একটি নতুন পিন লিখুন।",
    "New staff": "নতুন কর্মী",
    "Replace current medicines and sales with the selected backup? Export a backup first if you may need the current data.": "নির্বাচিত ব্যাকআপ দিয়ে বর্তমান ওষুধ ও বিক্রয়ের তথ্য বদলাবেন? বর্তমান তথ্য দরকার হলে আগে ব্যাকআপ ডাউনলোড করুন।",
  };

  // Patterns for text that contains numbers or names. Digits stay in Western form.
  var RULES = [
    [/^Expires in (-?\d+) d$/, function (m) { return m[1] + " দিন পরে মেয়াদ শেষ"; }],
    [/^Only (\d+) in stock\.$/, function (m) { return "মজুদে মাত্র " + m[1] + "টি আছে।"; }],
    [/^Check stock for (.+)$/, function (m) { return m[1] + "-এর মজুদ যাচাই করুন"; }],
    [/^Restock (.+)$/, function (m) { return m[1] + "-এর মজুদ পূরণ"; }],
    [/^Currently (\d+) in stock\.$/, function (m) { return "বর্তমানে মজুদ আছে " + m[1] + "টি।"; }],
    [/^(.+) · (\d+) left \(minimum (\d+)\)$/, function (m) { return m[1] + " · " + m[2] + "টি আছে (সর্বনিম্ন " + m[3] + ")"; }],
    [/^Batch (.+) · (.+) · (\d+) units$/, function (m) { return "ব্যাচ " + m[1] + " · " + m[2] + " · " + m[3] + " একক"; }],
    [/^Sales today \((\d+) bills\)$/, function (m) { return "আজকের বিক্রয় (" + m[1] + "টি বিল)"; }],
    [/^Stock (Opening stock|Correction|Removed|Restock|Sale|Purchase)$/, function (m) { return "মজুদ: " + (BN[m[1]] || m[1]); }],
    [/^(.+): ([+-]?\d+) units(?: \((.+)\))?$/, function (m) { return m[1] + ": " + m[2] + " একক" + (m[3] ? " (" + m[3] + ")" : ""); }]
  ];

  function currentLang() {
    return (typeof S !== "undefined" && S && S.lang === "bn") ? "bn" : "en";
  }

  // Returns the Bangla version of an English string, or the input unchanged.
  function translate(text) {
    var key = String(text).trim();
    if (!key) return text;
    var out = Object.prototype.hasOwnProperty.call(BN, key) ? BN[key] : undefined;
    if (out === undefined) {
      for (var i = 0; i < RULES.length; i++) {
        var m = key.match(RULES[i][0]);
        if (m) { out = RULES[i][1](m); break; }
      }
    }
    if (out === undefined) return text;
    return String(text).replace(key, function () { return out; });
  }

  // EN / বাংলা buttons. Used in the header and inside sign-in windows.
  window.languageSwitchHTML = function () {
    return '<div class="lang" role="group" aria-label="Language" style="justify-content:flex-end;margin-bottom:10px">' +
      '<button type="button" data-lang="en" onclick="setLanguage(\'en\')">EN</button>' +
      '<button type="button" data-lang="bn" onclick="setLanguage(\'bn\')">বাংলা</button></div>';
  };

  // For JavaScript messages such as confirm(), which the DOM walker cannot reach.
  window.i18nText = function (s) {
    return currentLang() === "bn" ? translate(s) : s;
  };

  var originals = new WeakMap();      // text node -> English text it came from
  var attrOriginals = new WeakMap();  // element -> { attribute: English value }
  var ATTRS = ["placeholder", "title", "aria-label"];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, TITLE: 1 };

  function applyNode(node) {
    var parent = node.parentNode;
    if (!parent || SKIP[parent.nodeName]) return;
    var current = node.nodeValue;
    if (currentLang() === "bn") {
      var source = originals.has(node) ? originals.get(node) : current;
      var out = translate(source);
      if (out !== current) node.nodeValue = out;
      if (out !== source) originals.set(node, source); else originals.delete(node);
    } else if (originals.has(node)) {
      node.nodeValue = originals.get(node);
      originals.delete(node);
    }
  }

  function applyAttrs(el) {
    var store = attrOriginals.get(el) || {};
    ATTRS.forEach(function (name) {
      if (!el.hasAttribute(name)) return;
      var current = el.getAttribute(name);
      if (currentLang() === "bn") {
        var source = Object.prototype.hasOwnProperty.call(store, name) ? store[name] : current;
        var out = translate(source);
        if (out !== current) el.setAttribute(name, out);
        if (out !== source) store[name] = source; else delete store[name];
      } else if (Object.prototype.hasOwnProperty.call(store, name)) {
        el.setAttribute(name, store[name]);
        delete store[name];
      }
    });
    attrOriginals.set(el, store);
  }

  function syncLangButtons() {
    var lang = currentLang();
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      var pressed = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      if (b.classList.contains("on") !== on) b.classList.toggle("on", on);
    });
  }

  function translateAll() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(applyNode);
    document.body.querySelectorAll("[placeholder],[title],[aria-label]").forEach(applyAttrs);
    syncLangButtons();
    document.documentElement.lang = currentLang();
  }

  // Run after each batch of DOM changes. Translating does not loop: once a string
  // is in its target language, translate() returns it unchanged.
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    Promise.resolve().then(function () { pending = false; translateAll(); });
  }

  // Called by the EN / বাংলা buttons. Ignored until the app has loaded its data,
  // because saving earlier would overwrite the saved file with empty data.
  window.setLanguage = function (lang) {
    if (!window.appReady || typeof S === "undefined") return;
    if (lang !== "en" && lang !== "bn") return;
    if (currentLang() === lang) return;
    S.lang = lang;
    save();
    translateAll();
  };

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS
  });
  schedule();
})();
