/* Pharmacy workflow additions. This file extends the existing screens and JSON store. */
let currentStaff=null, histQuery='', histFrom='', histTo='';

function initFeatures(){
 S.staff=Array.isArray(S.staff)?S.staff:[];
 S.movements=Array.isArray(S.movements)?S.movements:[];
 S.purchases=Array.isArray(S.purchases)?S.purchases:[];
 S.meds.forEach(m=>{if(m.unitCost==null)m.unitCost=null;if(m.barcode==null)m.barcode=''});
 TABS.push(['buy','Purchases'],['staff','Staff & activity']);
 if(S.staff.length)showStaffLogin();else showFirstStaffSetup();
}
const safeDate=()=>new Date().toISOString();
function actor(){return currentStaff?currentStaff.name:'Unassigned'}
function addActivity(action,details=''){
 S.activity=Array.isArray(S.activity)?S.activity:[];
 S.activity.unshift({id:uid(),t:safeDate(),staff:actor(),action,details});
 S.activity=S.activity.slice(0,1000);
}
function recordMovement(m,kind,quantity,before,after,reason='',link=''){
 S.movements.unshift({id:uid(),t:safeDate(),staff:actor(),medicine:m.name,medId:m.id,batch:m.batch||'',kind,quantity,before,after,reason,link});
 S.movements=S.movements.slice(0,3000);
 addActivity('Stock '+kind,`${m.name}: ${quantity>0?'+':''}${quantity} units${reason?` (${reason})`:''}`);
}
function setDialog(title,body){$('#dlg').innerHTML=`<h3>${title}</h3>${body}`;$('#dlg').showModal()}
function normalizePinInput(value){
 const zeroes=[0x0660,0x06f0,0x0966,0x09e6,0x0a66,0x0ae6,0x0b66,0x0be6,0x0c66,0x0ce6,0x0d66,0xff10];
 return Array.from(String(value||'').normalize('NFKC').replace(/[\s-]/g,''),ch=>{const cp=ch.codePointAt(0);if(cp>=48&&cp<=57)return ch;const z=zeroes.find(n=>cp>=n&&cp<n+10);return z===undefined?ch:String(cp-z)}).join('').slice(0,12)
}
function showFirstStaffSetup(){
 setDialog('Set up manager account',`<p style="color:var(--mut)">Create the first local account to identify staff actions. Use 4–12 digits for the PIN. English and Bangla digits are accepted.</p>
 <label>Manager name<input id="staffName" autocomplete="name" maxlength="40"></label><label style="margin-top:10px">PIN<input id="staffPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" maxlength="12" placeholder="4–12 digits" oninput="this.value=normalizePinInput(this.value)"></label>
 <div class="acts"><button class="btn" onclick="createFirstStaff()">Create account</button></div>`)
}
function showStaffLogin(){
 currentStaff=null;
 setDialog('Sign in',`<p style="color:var(--mut)">Choose your staff account and enter its PIN.</p><label>Staff account<select id="loginUser">${S.staff.map(u=>`<option value="${e(u.id)}">${e(u.name)}</option>`).join('')}</select></label>
 <label style="margin-top:10px">PIN<input id="loginPin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" oninput="this.value=normalizePinInput(this.value)" onkeydown="if(event.key==='Enter')loginStaff()"></label><div id="loginError" role="status" style="color:var(--bd);min-height:20px;margin-top:6px"></div>
 <div class="acts"><button class="btn" onclick="loginStaff()">Unlock app</button></div>`)
}
async function pinDigest(pin,salt){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(atob(salt),c=>c.charCodeAt(0)),iterations:120000,hash:'SHA-256'},key,256);
 return btoa(String.fromCharCode(...new Uint8Array(bits)))
}
function randomSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return btoa(String.fromCharCode(...a))}
async function createFirstStaff(){
 const name=$('#staffName').value.trim(),pin=normalizePinInput($('#staffPin').value);
 if(!name){toast('Enter the manager name.');return}
 if(!/^\d{4,12}$/.test(pin)){toast('Enter a PIN using 4–12 digits. English and Bangla digits are accepted.');return}
 try{const salt=randomSalt(),u={id:uid(),name,role:'Manager',salt,pinHash:await pinDigest(pin,salt)};S.staff.push(u);currentStaff=u;addActivity('Account created',name);save();$('#dlg').close();toast('Manager account created');render()}
 catch(x){toast('PIN security is unavailable in this browser. Open the desktop app and try again.')}
}
async function loginStaff(){
 const u=S.staff.find(x=>x.id===$('#loginUser').value),pin=normalizePinInput($('#loginPin').value);
 if(!u||!pin)return;
 try{if(await pinDigest(pin,u.salt)!==u.pinHash){$('#loginError').textContent='The PIN did not match.';return}
   currentStaff=u;addActivity('Signed in');save();$('#dlg').close();render()
 }catch(x){$('#loginError').textContent='Could not verify the PIN in this browser.'}
}
function lockApp(){save();currentStaff=null;showStaffLogin();$('#app').innerHTML='<div class="panel"><h2>App locked</h2><p>Sign in to continue.</p></div>'}
function requireManager(){if(currentStaff&&currentStaff.role==='Manager')return true;toast('Manager access is required.');return false}

function installFeatures(){
 const baseRender=render, baseMedForm=medForm, baseSaveMed=saveMed, baseRestock=restock, baseDoRestock=doRestock, baseComplete=complete, baseReceipt=receipt, baseDataTools=dataTools, baseRestore=restoreBackup;
 const baseInvRows=invRows;
 render=function(){
   if(!currentStaff){$('#app').innerHTML='<div class="panel"><h2>Sign in required</h2><p>Unlock the app to continue.</p><button class="btn" onclick="showStaffLogin()">Sign in</button></div>';return}
   if(tab==='buy'){navBar();purchasePage();return}
   if(tab==='staff'){navBar();staffPage();return}
   baseRender();
   if(tab==='data')appendProfitPanel();
 };
 function navBar(){$('#nav').innerHTML=TABS.map(t=>`<button class="${t[0]==tab?'on':''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('')}
 medForm=function(id){
   baseMedForm(id);const m=S.meds.find(x=>x.id===id)||{};const acts=$('#dlg').querySelector('.acts');
   const row=document.createElement('div');row.className='row';row.innerHTML=`<label>Barcode<input id="f_barcode" inputmode="numeric" value="${e(m.barcode||'')}"></label><label>Purchase cost per unit (৳)<input id="f_unitCost" type="number" min="0" step="any" value="${m.unitCost==null?'':e(m.unitCost)}"></label>`;acts.parentElement.insertBefore(row,acts)
 };
 saveMed=function(id){
   const before=S.meds.find(m=>m.id===id),oldQty=before?+before.qty:0;
   const barcode=$('#f_barcode')?.value.trim()||'',costText=$('#f_unitCost')?.value.trim()||'';
   if(costText!==''&&(!Number.isFinite(+costText)||+costText<0)){toast('Enter a valid purchase cost.');return}
   baseSaveMed(id);
   const m=id?S.meds.find(x=>x.id===id):S.meds[S.meds.length-1];
   if(!m||!m.name)return;
   m.barcode=barcode;m.unitCost=costText===''?null:+costText;
   const delta=+m.qty-oldQty;
   if(!before&&+m.qty)recordMovement(m,'Opening stock',+m.qty,0,+m.qty,'Initial quantity');
   else if(before&&delta)recordMovement(m,'Correction',delta,oldQty,+m.qty,'Inventory edited');
   addActivity(before?'Medicine updated':'Medicine added',m.name);save();
 };
 const baseDelete=del;
 del=function(id){
   const m=S.meds.find(x=>x.id===id);if(!m)return;
   setDialog(`Delete ${e(m.name)}?`,`<p>This removes the medicine from inventory. Past sales keep their records.</p><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Keep</button><button class="btn x" id="confirmMedDelete">Delete medicine</button></div>`);
   $('#confirmMedDelete').onclick=()=>{recordMovement(m,'Removed',-m.qty,m.qty,0,'Medicine deleted');S.meds=S.meds.filter(x=>x.id!==id);addActivity('Medicine deleted',m.name);save();$('#dlg').close();toast('Medicine deleted');render()}
 };
 restock=function(id){
   baseRestock(id);const acts=$('#dlg').querySelector('.acts');
   const cost=document.createElement('label');cost.style.marginTop='10px';cost.innerHTML='Purchase cost per unit (৳), optional<input id="rqCost" type="number" min="0" step="any" placeholder="Leave blank to keep current cost">';acts.parentElement.insertBefore(cost,acts)
 };
 doRestock=function(id){
   const m=S.meds.find(x=>x.id===id),before=+m.qty,n=Math.floor(+$('#rq').value),costVal=$('#rqCost')?.value.trim()||'';
   if(costVal!==''&&(!Number.isFinite(+costVal)||+costVal<0)){toast('Enter a valid purchase cost.');return}
   baseDoRestock(id);if(+m.qty>before){if(costVal!=='')m.unitCost=m.unitCost==null?+costVal:(before*m.unitCost+n*(+costVal))/(before+n);recordMovement(m,'Restock',+m.qty-before,before,+m.qty,'Manual restock');addActivity('Restock received',m.name);save()}
 };
 complete=function(){
   const oldLen=S.sales.length,lines=cart.map(c=>{const m=S.meds.find(x=>x.id===c.id);return{id:c.id,qty:c.qty,cost:m&&m.unitCost!=null?+m.unitCost:null,before:m?+m.qty:0,name:m?m.name:''}});
   baseComplete();if(S.sales.length===oldLen)return;
   const sale=S.sales[S.sales.length-1];sale.staff=actor();sale.items.forEach((line,i)=>{line.cost=lines[i]?.cost??null});
   const receiptMeta=$('#dlg').querySelector('.rc div');if(receiptMeta)receiptMeta.innerHTML+=`<br>Staff: ${e(sale.staff)}`;
   lines.forEach(x=>{const m=S.meds.find(y=>y.id===x.id);if(m)recordMovement(m,'Sale',-x.qty,x.before,+m.qty,`Bill ${sale.id}`,sale.id)});
   addActivity('Sale completed',`${sale.id} · ${money(sale.total)}`);save()
 };
 receipt=function(id){baseReceipt(id);const s=S.sales.find(x=>x.id===id);if(s?.staff){const meta=$('#dlg').querySelector('.rc div');meta.innerHTML+=`<br>Staff: ${e(s.staff)}`}};
 dataTools=function(){baseDataTools();$('#app').insertAdjacentHTML('beforeend',`<div class="panel" id="profitPanel"></div>`);appendProfitPanel()};
 restoreBackup=function(input){if(requireManager())baseRestore(input)};
 hist=filteredHist;
 // This extension is combined with the original inventory and checkout search.
 window.scanBarcode=scanBarcode;
 window.invRows=baseInvRows;
}
function appendProfitPanel(){
 const panel=$('#profitPanel');if(!panel)return;
 const known=S.sales.filter(s=>s.items?.every(i=>i.cost!=null&&Number.isFinite(+i.cost)));
 const revenue=known.reduce((a,s)=>a+s.total,0),profit=known.reduce((a,s)=>a+s.total-s.items.reduce((n,i)=>n+i.qty*i.cost,0),0);
 panel.innerHTML=`<h3>Sales margin</h3><div class="grid"><div class="stat"><b>${money(profit)}</b><span>Estimated gross profit for ${known.length} costed bills</span></div><div class="stat"><b>${money(revenue)}</b><span>Sales total included in this estimate</span></div></div><p style="color:var(--mut)">${S.sales.length-known.length} older or incomplete bills are excluded because they have no saved purchase cost. New bills capture the item cost at sale time.</p><button class="btn o" onclick="exportProfit()">Export profit detail CSV</button>`
}
function csvOut(file,rows){const cell=x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"';downloadFile(file,'\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
function exportProfit(){const rows=[['Bill','Date','Staff','Medicine','Quantity','Sale unit price','Purchase unit cost','Discount percent','Line profit after allocated discount']];S.sales.forEach(s=>s.items?.forEach(i=>{if(i.cost!=null)rows.push([s.id,s.t,s.staff||'',i.name,i.qty,i.price,i.cost,s.disc||0,i.qty*i.price*(1-(s.disc||0)/100)-i.qty*i.cost])}));csvOut('pharmacy-profit-detail.csv',rows)}
function scanBarcode(){
 const input=$('#sq'),code=input.value.trim(),matches=S.meds.filter(x=>x.barcode&&x.barcode===code).sort((a,b)=>a.exp.localeCompare(b.exp)),m=matches.find(x=>x.qty>0&&days(x.exp)>=0);
 if(new Set(matches.map(x=>x.name+'|'+x.generic+'|'+x.form)).size>1){toast('This barcode is assigned to more than one product. Check inventory.');return}
 if(m){add(m.id);input.value='';sRes();return}
 if(matches.length){toast('This barcode is expired or out of stock.');input.value='';sRes();return}
 toast('No exact barcode match. Search results shown.');sRes()
}
function purchasePage(){
 const meds=[...S.meds].sort((a,b)=>a.name.localeCompare(b.name));
 $('#app').innerHTML=`<h2>Purchases</h2><div class="two"><div class="panel"><h3>Receive stock</h3>${meds.length?`<label>Medicine / product<select id="buyMed" onchange="setPurchaseMedicine(this.value)">${meds.map(m=>`<option value="${e(m.id)}">${e(m.name)}${m.batch?' · batch '+e(m.batch):''} (${m.qty} on hand)</option>`).join('')}</select></label>`:'<p class="empty">Add a medicine in Inventory before receiving stock.</p>'}
 <div class="row" style="margin-top:10px"><label>Supplier<input id="buySupplier"></label><label>Supplier invoice / reference<input id="buyInvoice"></label></div><div class="row"><label>Units received<input id="buyQty" type="number" min="1" step="1"></label><label>Purchase cost per unit (৳)<input id="buyCost" type="number" min="0" step="any"></label></div>
 <div class="row"><label>Batch number<input id="buyBatch"></label><label>Expiry date<input id="buyExpiry" type="date"></label></div><button class="btn" ${meds.length?'':'disabled'} onclick="receivePurchase()">Record purchase and add stock</button></div>
 <div class="panel"><h3>Supplier and purchase records</h3><button class="btn o s" onclick="exportPurchases()">Export purchase CSV</button>${S.purchases.length?`<div class="tw"><table><thead><tr><th>Date</th><th>Supplier / invoice</th><th>Medicine / batch</th><th class="r">Units</th><th class="r">Cost</th></tr></thead><tbody>${S.purchases.slice(0,100).map(p=>`<tr><td>${new Date(p.t).toLocaleDateString()}</td><td>${e(p.supplier)}<small>${e(p.invoice||'')}</small></td><td>${e(p.medicine)}<small>${e(p.batch||'')}</small></td><td class="r">${p.qty}</td><td class="r">${money(p.totalCost)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Received purchases will appear here.</div>'}</div></div>`;
 supplierHint()
}
function supplierHint(){const m=S.meds.find(x=>x.id===$('#buyMed')?.value);if(m){if(!$('#buySupplier').value)$('#buySupplier').value=m.supplier||'';if(!$('#buyBatch').value)$('#buyBatch').value=m.batch||'';if(!$('#buyExpiry').value)$('#buyExpiry').value=m.exp||'';if(!$('#buyCost').value&&m.unitCost!=null)$('#buyCost').value=m.unitCost}}
function setPurchaseMedicine(id){const m=S.meds.find(x=>x.id===id);if(!m)return;$('#buySupplier').value=m.supplier||'';$('#buyBatch').value=m.batch||'';$('#buyExpiry').value=m.exp||'';$('#buyCost').value=m.unitCost==null?'':m.unitCost}
function receivePurchase(){
 const src=S.meds.find(m=>m.id===$('#buyMed').value),qty=Math.floor(+$(`#buyQty`).value),cost=+$(`#buyCost`).value,supplier=$('#buySupplier').value.trim(),invoice=$('#buyInvoice').value.trim(),batch=$('#buyBatch').value.trim(),exp=$('#buyExpiry').value;
 if(!src||qty<1||!Number.isFinite(cost)||cost<0||!supplier||!batch||!exp){toast('Enter supplier, batch, expiry, quantity and a valid unit cost.');return}
 let m=S.meds.find(x=>x.id===src.id&&x.batch===batch&&x.exp===exp);
 if(!m){m={...src,id:uid(),batch,exp,qty:0,supplier,unitCost:null};S.meds.push(m)}
 const before=+m.qty,oldCost=m.unitCost==null?null:+m.unitCost;
 m.qty+=qty;m.supplier=supplier;m.unitCost=oldCost==null?cost:(before*oldCost+qty*cost)/(before+qty);
 const p={id:uid(),t:safeDate(),staff:actor(),supplier,invoice,medicine:m.name,medId:m.id,batch,exp,qty,unitCost:cost,totalCost:qty*cost};
 S.purchases.unshift(p);recordMovement(m,'Purchase',qty,before,m.qty,`${supplier}${invoice?' · '+invoice:''}`,p.id);addActivity('Purchase recorded',`${m.name}, ${qty} units from ${supplier}`);save();toast('Purchase recorded and stock updated');purchasePage()
}
function exportPurchases(){const rows=[['Date','Staff','Supplier','Invoice','Medicine','Batch','Expiry','Units','Unit cost','Total cost']];S.purchases.forEach(p=>rows.push([p.t,p.staff,p.supplier,p.invoice,p.medicine,p.batch,p.exp,p.qty,p.unitCost,p.totalCost]));csvOut('pharmacy-purchases.csv',rows)}
function exportMovements(){const rows=[['Date','Staff','Medicine','Batch','Movement','Quantity change','Balance after','Reason','Reference']];S.movements.forEach(m=>rows.push([m.t,m.staff,m.medicine,m.batch,m.kind,m.quantity,m.after,m.reason,m.link]));csvOut('pharmacy-stock-movements.csv',rows)}
function filteredHist(){
 const q=histQuery.toLowerCase(),L=[...S.sales].reverse().filter(s=>{
   const d=s.t.slice(0,10),text=[s.id,s.cust,s.staff,...(s.items||[]).map(i=>i.name)].join(' ').toLowerCase();
   return(!q||text.includes(q))&&(!histFrom||d>=histFrom)&&(!histTo||d<=histTo)
 }),sum=L.reduce((a,s)=>a+s.total,0);
 const rows=L.length?`<table><thead><tr><th>Bill</th><th>Date</th><th>Customer</th><th>Staff</th><th>Items</th><th class="r">Total</th><th></th></tr></thead><tbody>${L.map(s=>`<tr><td>${e(s.id)}</td><td>${new Date(s.t).toLocaleString()}</td><td>${e(s.cust)}</td><td>${e(s.staff||'—')}</td><td>${(s.items||[]).reduce((a,i)=>a+(+i.qty||0),0)}</td><td class="r">${money(s.total)}</td><td class="r"><button class="btn o s" onclick="receipt('${e(s.id)}')">View</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">No sales match these filters.</div>';
 if(!$('#histSearch')){
   $('#app').innerHTML=`<h2>Sales history</h2><div class="grid"><div class="stat"><b id="histCount">${L.length}</b><span>Matching bills</span></div><div class="stat"><b id="histTotal">${money(sum)}</b><span>Sales in filtered results</span></div></div>
   <div class="tools"><input id="histSearch" placeholder="Search bill, customer, item or staff" value="${e(histQuery)}" oninput="histQuery=this.value;hist()"><label>From<input id="histFrom" type="date" value="${e(histFrom)}" onchange="histFrom=this.value;hist()"></label><label>To<input id="histTo" type="date" value="${e(histTo)}" onchange="histTo=this.value;hist()"></label><button class="btn o" onclick="histQuery='';histFrom='';histTo='';$('#histSearch').value='';$('#histFrom').value='';$('#histTo').value='';hist()">Clear filters</button></div>
   <div id="histResults" class="panel tw">${rows}</div>`;
   return
 }
 $('#histCount').textContent=L.length;
 $('#histTotal').textContent=money(sum);
 $('#histResults').innerHTML=rows;
}
function staffPage(){
 const admin=currentStaff?.role==='Manager';
 $('#app').innerHTML=`<h2>Staff & activity</h2><div class="two"><div class="panel"><h3>Signed in as ${e(currentStaff?.name||'')}</h3><p style="color:var(--mut)">Role: ${e(currentStaff?.role||'Staff')}. Lock the app when stepping away.</p><button class="btn o" onclick="lockApp()">Lock app</button>
 <h3 style="margin-top:20px">Staff accounts</h3>${S.staff.map(u=>`<div class="item"><div>${e(u.name)}<small>${e(u.role)}</small></div>${u.id===currentStaff.id?'<span class="tag">Current</span>':''}</div>`).join('')}
 ${admin?`<button class="btn" style="margin-top:12px" onclick="addStaffForm()">Add staff account</button>${S.staff.filter(u=>u.id!==currentStaff.id).map(u=>`<button class="btn o s" style="margin:8px 4px 0 0" onclick="resetStaffPin('${e(u.id)}')">Reset ${e(u.name)} PIN</button>`).join('')}`:''}</div>
 <div class="panel"><h3>Recent activity</h3>${S.activity?.length?S.activity.slice(0,60).map(a=>`<div class="item"><div>${e(a.action)}<small>${new Date(a.t).toLocaleString()} · ${e(a.staff)}${a.details?' · '+e(a.details):''}</small></div></div>`).join(''):'<div class="empty">Activity will appear as staff use the app.</div>'}</div></div>
 <div class="panel"><h3>Stock movement history</h3><button class="btn o s" onclick="exportMovements()">Export movement CSV</button>${S.movements.length?`<div class="tw"><table><thead><tr><th>Date</th><th>Staff</th><th>Medicine / batch</th><th>Type</th><th class="r">Change</th><th class="r">Balance</th><th>Reason / reference</th></tr></thead><tbody>${S.movements.slice(0,150).map(m=>`<tr><td>${new Date(m.t).toLocaleString()}</td><td>${e(m.staff)}</td><td>${e(m.medicine)}<small>${e(m.batch)}</small></td><td>${e(m.kind)}</td><td class="r">${m.quantity>0?'+':''}${m.quantity}</td><td class="r">${m.after}</td><td>${e(m.reason||'')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Stock changes will appear here.</div>'}</div>`
}
function addStaffForm(){
 if(!requireManager())return;
 setDialog('Add staff account',`<label>Name<input id="newStaffName" maxlength="40"></label><label style="margin-top:10px">Role<select id="newStaffRole"><option>Staff</option><option>Manager</option></select></label><label style="margin-top:10px">PIN (4–12 digits)<input id="newStaffPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn" onclick="saveNewStaff()">Save account</button></div>`)
}
async function saveNewStaff(){
 const name=$('#newStaffName').value.trim(),role=$('#newStaffRole').value,pin=normalizePinInput($('#newStaffPin').value);
 if(!name){toast('Enter a staff name.');return}if(!/^\d{4,12}$/.test(pin)){toast('Enter a PIN using 4–12 digits.');return}
 try{const salt=randomSalt();S.staff.push({id:uid(),name,role,salt,pinHash:await pinDigest(pin,salt)});addActivity('Staff account added',name);save();$('#dlg').close();staffPage();toast('Staff account added')}
 catch(x){toast('Could not create this account in the current browser.')}
}
function resetStaffPin(id){
 if(!requireManager())return;const u=S.staff.find(x=>x.id===id);if(!u)return;
 setDialog(`Reset PIN for ${e(u.name)}`,`<p style="color:var(--mut)">The staff member will use this new PIN next time they sign in.</p><label>New PIN (4–12 digits)<input id="resetPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn" onclick="saveResetPin('${e(id)}')">Save PIN</button></div>`)
}
async function saveResetPin(id){
 const u=S.staff.find(x=>x.id===id),pin=normalizePinInput($('#resetPin').value);if(!u||!/^\d{4,12}$/.test(pin)){toast('Enter a 4–12 digit PIN.');return}
 try{u.salt=randomSalt();u.pinHash=await pinDigest(pin,u.salt);addActivity('Staff PIN reset',u.name);save();$('#dlg').close();staffPage();toast('PIN updated')}
 catch(x){toast('Could not update the PIN in this browser.')}
}
