/* Pharmacy workflow additions. This file extends the existing screens and JSON store. */
let currentStaff=null, histQuery='', histFrom='', histTo='';
const MANAGER_PERMISSIONS=[
 {key:'inventory',label:'Manage inventory'},
 {key:'sales',label:'Use sales and sales history'},
 {key:'purchases',label:'Record purchases'},
 {key:'reports',label:'View and export reports'},
 {key:'staff',label:'Manage staff accounts'},
 {key:'restore',label:'Restore backups'}
];
const DEFAULT_MANAGER_PERMISSIONS=MANAGER_PERMISSIONS.map(x=>x.key);
function permissionsForRole(role){return role==='Manager'?MANAGER_PERMISSIONS.filter(p=>p.key!=='restore'):MANAGER_PERMISSIONS.filter(p=>!['staff','restore'].includes(p.key))}
function managerHasPermission(user,permission){
 return user?.role==='CEO'||!Array.isArray(user?.permissions)||user.permissions.includes(permission)
}
function isRootAdmin(user=currentStaff){return user?.role==='CEO'}
function managerCan(permission){return !!currentStaff&&managerHasPermission(currentStaff,permission)}
function managerFeatureAllowed(permission){
 if(managerCan(permission))return true;
 toast('Your manager account does not have permission for this feature.');return false
}
function visibleTabs(){
 const capability={dash:'reports',inv:'inventory',sell:'sales',hist:'sales',buy:'purchases',data:'reports'};
 const configured=Array.isArray(S.layoutTabs)?S.layoutTabs:null;
 return TABS.filter(([key])=>(key==='staff'||!configured||configured.includes(key))&&(key==='data'?managerCan('reports'):!capability[key]||managerCan(capability[key])))
}
function requireManager(permission='staff'){
 if(!currentStaff||!['Manager','CEO'].includes(currentStaff.role)){toast('Manager access is required.');return false}
 if(!managerHasPermission(currentStaff,permission)){toast('Your manager account does not have permission for this action.');return false}
 return true
}
function requireCEO(){if(isRootAdmin())return true;toast('CEO access is required.');return false}
function ensureCEO(){
 let changed=false;
 const ceo=S.staff.find(u=>u.role==='CEO')||S.staff.find(u=>u.role==='Ultimate Manager')||S.staff.find(u=>u.role==='Manager')||S.staff[0];
 if(ceo&&ceo.role!=='CEO'){ceo.role='CEO';changed=true}
 for(const user of S.staff){
   if(user!==ceo&&(user.role==='CEO'||user.role==='Ultimate Manager')){user.role='Manager';changed=true}
   if(!Array.isArray(user.permissions)){user.permissions=user.role==='Manager'?[...DEFAULT_MANAGER_PERMISSIONS]:[];changed=true}
 }
 if(changed)save()
}

function initFeatures(){
 S.staff=Array.isArray(S.staff)?S.staff:[];
 S.movements=Array.isArray(S.movements)?S.movements:[];
 S.purchases=Array.isArray(S.purchases)?S.purchases:[];
 ensureCEO();
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
function setDialog(title,body){const dialog=$('#dlg');if(dialog.open)dialog.close();dialog.innerHTML=`<h3>${title}</h3>${body}`;dialog.showModal()}
function normalizePinInput(value){
 const zeroes=[0x0660,0x06f0,0x0966,0x09e6,0x0a66,0x0ae6,0x0b66,0x0be6,0x0c66,0x0ce6,0x0d66,0xff10];
 return Array.from(String(value||'').normalize('NFKC').replace(/[\s-]/g,''),ch=>{const cp=ch.codePointAt(0);if(cp>=48&&cp<=57)return ch;const z=zeroes.find(n=>cp>=n&&cp<n+10);return z===undefined?ch:String(cp-z)}).join('').slice(0,12)
}
function showFirstStaffSetup(){
 setDialog('Set up CEO account',`<p style="color:var(--mut)">Create the first local CEO account to identify staff actions. Use 4–12 digits for the PIN. English and Bangla digits are accepted.</p>
 <label>CEO name<input id="staffName" autocomplete="name" maxlength="40"></label><label style="margin-top:10px">PIN<input id="staffPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" maxlength="12" placeholder="4–12 digits" oninput="this.value=normalizePinInput(this.value)"></label>
 <div class="acts"><button class="btn" onclick="createFirstStaff()">Create account</button></div>`)
}
function showStaffLogin(){
 S.staff=Array.isArray(S.staff)?S.staff:[];ensureCEO();
 currentStaff=null;
 setDialog('Sign in',`<p style="color:var(--mut)">Choose your staff account and enter its PIN.</p><label>Staff account<select id="loginUser">${S.staff.map(u=>`<option value="${e(u.id)}">${e(u.name)}</option>`).join('')}</select></label>
 <label style="margin-top:10px">PIN<input id="loginPin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12" oninput="this.value=normalizePinInput(this.value)" onkeydown="if(event.key==='Enter')loginStaff()"></label><div id="loginError" role="status" style="color:var(--bd);min-height:20px;margin-top:6px"></div>
 <div class="acts"><button class="btn o" onclick="showForgotPin()">Forgot PIN?</button><button class="btn" onclick="loginStaff()">Unlock app</button></div>`)
}
async function pinDigest(pin,salt){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(atob(salt),c=>c.charCodeAt(0)),iterations:120000,hash:'SHA-256'},key,256);
 return btoa(String.fromCharCode(...new Uint8Array(bits)))
}
function randomSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return btoa(String.fromCharCode(...a))}
function newManagerRecoveryCode(){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()}
function normalizeRecoveryCode(value){return String(value||'').replace(/[\s-]/g,'').toUpperCase()}
function showRecoveryCode(code,title='Save manager recovery code',returnTo='login'){
 const onDone=returnTo==='app'?'render()':'showStaffLogin()';
 setDialog(title,`<p style="color:var(--mut)">Store this code somewhere private and separate from the computer. It is shown only once and can reset the CEO PIN. Replacing or using it invalidates the previous code.</p><label>One-time recovery code<input value="${e(code)}" readonly onclick="this.select()" autocomplete="off"></label><div class="acts"><button class="btn x" onclick="exitApp()">Exit app</button><button class="btn" onclick="${onDone}">I saved the code</button></div>`)
}
async function generateCEORecoveryCode(){
 if(!requireCEO())return;
 try{
   const code=newManagerRecoveryCode(),salt=randomSalt(),hash=await pinDigest(code,salt);
   S.managerRecovery={salt,hash};addActivity('CEO recovery code generated');save();showRecoveryCode(code,'Save CEO recovery code','app')
 }catch(x){toast('Could not create a recovery code in this browser.')}
}
function showForgotPin(){
 const approvers=S.staff.filter(u=>['Manager','CEO'].includes(u.role)&&managerHasPermission(u,'staff'));
 if(!approvers.length){
   if(S.managerRecovery?.salt&&S.managerRecovery?.hash){showManagerRecoveryReset();return}
   setDialog('Forgot PIN',`<p style="color:var(--mut)">A CEO must approve administrator PIN resets. If you are the CEO, create a recovery code in Staff & activity before forgetting the PIN. Contact the app owner to restore access.</p><div class="acts"><button class="btn" onclick="showStaffLogin()">Back to sign in</button></div>`);return
 }
 if(!S.managerRecovery?.hash&&approvers.length===1&&isRootAdmin(approvers[0])){
   setDialog('Forgot PIN',`<p style="color:var(--mut)">No CEO recovery code has been set. The CEO must create one in Staff & activity before forgetting the PIN. Contact the app owner for one-time recovery, then create a recovery code.</p><div class="acts"><button class="btn" onclick="showStaffLogin()">Back to sign in</button></div>`);return
 }
  setDialog('Forgot PIN',`<p style="color:var(--mut)">A CEO approves Manager PIN resets. A Manager with staff-management access may reset Staff PINs.</p><label>Approving account<select id="forgotManager">${approvers.map(u=>`<option value="${e(u.id)}">${e(u.name)} · ${e(u.role)}</option>`).join('')}</select></label><label style="margin-top:10px">Account to reset<select id="forgotTarget">${S.staff.map(u=>`<option value="${e(u.id)}">${e(u.name)} · ${e(u.role)}</option>`).join('')}</select></label><label style="margin-top:10px">Approver PIN<input id="forgotManagerPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><label style="margin-top:10px">New PIN (4–12 digits)<input id="forgotNewPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><label style="margin-top:10px">Confirm new PIN<input id="forgotConfirmPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div id="forgotError" role="status" style="color:var(--bd);min-height:20px;margin-top:6px"></div><div class="acts"><button class="btn o" onclick="showStaffLogin()">Cancel</button>${S.managerRecovery?.hash?'<button class="btn o" onclick="showManagerRecoveryReset()">Use recovery code</button>':''}<button class="btn" onclick="completeForgotPin()">Approve and reset</button></div>`)
}
function showManagerRecoveryReset(){
 const managers=S.staff.filter(u=>isRootAdmin(u));
 if(!S.managerRecovery?.salt||!S.managerRecovery?.hash||!managers.length){showStaffLogin();return}
  setDialog('Recover CEO PIN',`<p style="color:var(--mut)">Enter the one-time recovery code to reset the CEO PIN. A new recovery code will be generated after a successful reset.</p><label>CEO account<select id="recoveryTarget">${managers.map(u=>`<option value="${e(u.id)}">${e(u.name)}</option>`).join('')}</select></label><label style="margin-top:10px">Recovery code<input id="managerRecoveryCode" autocomplete="off" autocapitalize="characters"></label><label style="margin-top:10px">New PIN (4–12 digits)<input id="recoveryNewPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><label style="margin-top:10px">Confirm new PIN<input id="recoveryConfirmPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div id="recoveryError" role="status" style="color:var(--bd);min-height:20px;margin-top:6px"></div><div class="acts"><button class="btn o" onclick="showStaffLogin()">Cancel</button><button class="btn" onclick="resetManagerPinWithCode()">Reset CEO PIN</button></div>`)
}
async function resetManagerPinWithCode(){
 const target=S.staff.find(u=>u.id===$('#recoveryTarget').value),code=normalizeRecoveryCode($('#managerRecoveryCode').value),pin=normalizePinInput($('#recoveryNewPin').value),confirmPin=normalizePinInput($('#recoveryConfirmPin').value),error=$('#recoveryError');
  if(!target||target.role!=='CEO'){error.textContent='Choose the CEO account.';return}
 if(!/^\d{4,12}$/.test(pin)){error.textContent='Enter a new PIN using 4–12 digits.';return}
 if(pin!==confirmPin){error.textContent='The new PINs do not match.';return}
 try{
   const recovery=S.managerRecovery;
   if(!recovery?.salt||!recovery?.hash||await pinDigest(code,recovery.salt)!==recovery.hash){error.textContent='The recovery code did not match.';return}
   const newCode=newManagerRecoveryCode(),salt=randomSalt(),hash=await pinDigest(newCode,salt);
   target.salt=randomSalt();target.pinHash=await pinDigest(pin,target.salt);S.managerRecovery={salt,hash};
    S.activity=Array.isArray(S.activity)?S.activity:[];S.activity.unshift({id:uid(),t:safeDate(),staff:'Recovery code',action:'Administrator PIN recovered',details:`${target.name}'s PIN reset; recovery code rotated`});S.activity=S.activity.slice(0,1000);
   save();showRecoveryCode(newCode,'PIN reset — save your new recovery code')
 }catch(x){error.textContent='Could not reset the PIN in this browser.'}
}
async function completeForgotPin(){
 const approver=S.staff.find(u=>u.id===$('#forgotManager').value),target=S.staff.find(u=>u.id===$('#forgotTarget').value),managerPin=normalizePinInput($('#forgotManagerPin').value),pin=normalizePinInput($('#forgotNewPin').value),confirmPin=normalizePinInput($('#forgotConfirmPin').value);
 const error=$('#forgotError');
  if(!approver||!['Manager','CEO'].includes(approver.role)||!managerHasPermission(approver,'staff')){error.textContent='Choose an authorized Manager or CEO.';return}
  if(!target){error.textContent='Choose an account to reset.';return}
  if(target.role!=='Staff'&&approver.role!=='CEO'){error.textContent='Only the CEO can reset a Manager PIN.';return}
 if(!/^\d{4,12}$/.test(pin)){error.textContent='Enter a PIN using 4–12 digits.';return}
 if(pin!==confirmPin){error.textContent='The new PINs do not match.';return}
 try{
   if(await pinDigest(managerPin,approver.salt)!==approver.pinHash){error.textContent='The approving manager PIN did not match.';return}
   target.salt=randomSalt();target.pinHash=await pinDigest(pin,target.salt);
   S.activity=Array.isArray(S.activity)?S.activity:[];S.activity.unshift({id:uid(),t:safeDate(),staff:approver.name,action:'PIN reset approved',details:`${target.name}'s PIN reset`});S.activity=S.activity.slice(0,1000);
   save();showStaffLogin();toast('PIN reset. Sign in with the new PIN.')
 }catch(x){error.textContent='Could not reset the PIN in this browser.'}
}
async function createFirstStaff(){
 const name=$('#staffName').value.trim(),pin=normalizePinInput($('#staffPin').value);
 if(!name){toast('Enter the manager name.');return}
 if(!/^\d{4,12}$/.test(pin)){toast('Enter a PIN using 4–12 digits. English and Bangla digits are accepted.');return}
  try{const salt=randomSalt(),recoveryCode=newManagerRecoveryCode(),recoverySalt=randomSalt(),recoveryHash=await pinDigest(recoveryCode,recoverySalt),u={id:uid(),name,role:'CEO',permissions:[...DEFAULT_MANAGER_PERMISSIONS],salt,pinHash:await pinDigest(pin,salt)};S.staff.push(u);S.managerRecovery={salt:recoverySalt,hash:recoveryHash};currentStaff=u;addActivity('CEO account created',name);save();$('#dlg').close();toast('CEO account created');render();showRecoveryCode(recoveryCode,'Save CEO recovery code','app')}
 catch(x){toast('PIN security is unavailable in this browser. Open the desktop app and try again.')}
}
async function loginStaff(){
 const u=S.staff.find(x=>x.id===$('#loginUser').value),pin=normalizePinInput($('#loginPin').value);
 if(!u||!pin)return;
 try{if(await pinDigest(pin,u.salt)!==u.pinHash){$('#loginError').textContent='The PIN did not match.';return}
   currentStaff=u;addActivity('Signed in');save();$('#dlg').close();render()
 }catch(x){$('#loginError').textContent='Could not verify the PIN in this browser.'}
}
function changeMyPin(){
 if(!currentStaff)return;
 setDialog('Change my PIN',`<p style="color:var(--mut)">Enter your current PIN, then choose a new PIN using 4–12 digits.</p><label>Current PIN<input id="currentPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><label style="margin-top:10px">New PIN<input id="newMyPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><label style="margin-top:10px">Confirm new PIN<input id="confirmMyPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div id="changePinError" role="status" style="color:var(--bd);min-height:20px;margin-top:6px"></div><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn" onclick="saveMyPin()">Change PIN</button></div>`)
}
async function saveMyPin(){
 const user=currentStaff,currentPin=normalizePinInput($('#currentPin').value),pin=normalizePinInput($('#newMyPin').value),confirmPin=normalizePinInput($('#confirmMyPin').value),error=$('#changePinError');
 if(!user)return;
 if(!/^\d{4,12}$/.test(pin)){error.textContent='Enter a new PIN using 4–12 digits.';return}
 if(pin!==confirmPin){error.textContent='The new PINs do not match.';return}
 try{
   if(await pinDigest(currentPin,user.salt)!==user.pinHash){error.textContent='The current PIN did not match.';return}
   user.salt=randomSalt();user.pinHash=await pinDigest(pin,user.salt);addActivity('PIN changed');save();$('#dlg').close();toast('PIN changed')
 }catch(x){error.textContent='Could not update the PIN in this browser.'}
}
function lockApp(){save();currentStaff=null;showStaffLogin();$('#app').innerHTML='<div class="panel"><h2>App locked</h2><p>Sign in to continue.</p></div>'}
async function exitApp(){
 if(!confirm('Exit Pharmacy Manager? Make sure you have saved or copied any one-time recovery code.'))return;
 save();
 if(useFile&&typeof eel!=='undefined'){
   try{await saving;await eel.exit_app()()}catch(x){window.close()}
 }else window.close()
}

function installFeatures(){
 const baseRender=render, baseMedForm=medForm, baseSaveMed=saveMed, baseRestock=restock, baseDoRestock=doRestock, baseComplete=complete, baseReceipt=receipt, baseDataTools=dataTools, baseRestore=restoreBackup;
 const baseInvRows=invRows,baseExportInventory=exportInventory,baseExportSales=exportSales,baseExportBackup=exportBackup,baseExportProfit=exportProfit,baseExportMovements=exportMovements,baseReceivePurchase=receivePurchase;
 render=function(){
   if(!currentStaff){$('#app').innerHTML='<div class="panel"><h2>Sign in required</h2><p>Unlock the app to continue.</p><button class="btn" onclick="showStaffLogin()">Sign in</button></div>';return}
   if(!visibleTabs().some(t=>t[0]===tab))tab=visibleTabs()[0]?.[0]||'staff';
   if(tab==='buy'){navBar();purchasePage();return}
   if(tab==='staff'){navBar();staffPage();return}
   baseRender();
   navBar();
   if(tab==='data'&&managerCan('reports'))appendProfitPanel();
 };
 function navBar(){$('#nav').innerHTML=visibleTabs().map(t=>`<button class="${t[0]==tab?'on':''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('')}
 medForm=function(id){
   if(!managerFeatureAllowed('inventory'))return;
   baseMedForm(id);const m=S.meds.find(x=>x.id===id)||{};const acts=$('#dlg').querySelector('.acts');
   const row=document.createElement('div');row.className='row';row.innerHTML=`<label>Barcode<input id="f_barcode" inputmode="numeric" value="${e(m.barcode||'')}"></label><label>Purchase cost per unit (৳)<input id="f_unitCost" type="number" min="0" step="any" value="${m.unitCost==null?'':e(m.unitCost)}"></label>`;acts.parentElement.insertBefore(row,acts)
 };
 saveMed=function(id){
   if(!managerFeatureAllowed('inventory'))return;
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
   if(!managerFeatureAllowed('inventory'))return;
   const m=S.meds.find(x=>x.id===id);if(!m)return;
   setDialog(`Delete ${e(m.name)}?`,`<p>This removes the medicine from inventory. Past sales keep their records.</p><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Keep</button><button class="btn x" id="confirmMedDelete">Delete medicine</button></div>`);
   $('#confirmMedDelete').onclick=()=>{recordMovement(m,'Removed',-m.qty,m.qty,0,'Medicine deleted');S.meds=S.meds.filter(x=>x.id!==id);addActivity('Medicine deleted',m.name);save();$('#dlg').close();toast('Medicine deleted');render()}
 };
 restock=function(id){
   if(!managerFeatureAllowed('inventory'))return;
   baseRestock(id);const acts=$('#dlg').querySelector('.acts');
   const cost=document.createElement('label');cost.style.marginTop='10px';cost.innerHTML='Purchase cost per unit (৳), optional<input id="rqCost" type="number" min="0" step="any" placeholder="Leave blank to keep current cost">';acts.parentElement.insertBefore(cost,acts)
 };
 doRestock=function(id){
   if(!managerFeatureAllowed('inventory'))return;
   const m=S.meds.find(x=>x.id===id),before=+m.qty,n=Math.floor(+$('#rq').value),costVal=$('#rqCost')?.value.trim()||'';
   if(costVal!==''&&(!Number.isFinite(+costVal)||+costVal<0)){toast('Enter a valid purchase cost.');return}
   baseDoRestock(id);if(+m.qty>before){if(costVal!=='')m.unitCost=m.unitCost==null?+costVal:(before*m.unitCost+n*(+costVal))/(before+n);recordMovement(m,'Restock',+m.qty-before,before,+m.qty,'Manual restock');addActivity('Restock received',m.name);save()}
 };
 complete=function(){
   if(!managerFeatureAllowed('sales'))return;
   const oldLen=S.sales.length,lines=cart.map(c=>{const m=S.meds.find(x=>x.id===c.id);return{id:c.id,qty:c.qty,cost:m&&m.unitCost!=null?+m.unitCost:null,before:m?+m.qty:0,name:m?m.name:''}});
   baseComplete();if(S.sales.length===oldLen)return;
   const sale=S.sales[S.sales.length-1];sale.staff=actor();sale.items.forEach((line,i)=>{line.cost=lines[i]?.cost??null});
   const receiptMeta=$('#dlg').querySelector('.rc div');if(receiptMeta)receiptMeta.innerHTML+=`<br>Staff: ${e(sale.staff)}`;
   lines.forEach(x=>{const m=S.meds.find(y=>y.id===x.id);if(m)recordMovement(m,'Sale',-x.qty,x.before,+m.qty,`Bill ${sale.id}`,sale.id)});
   addActivity('Sale completed',`${sale.id} · ${money(sale.total)}`);save()
 };
 receipt=function(id){baseReceipt(id);const s=S.sales.find(x=>x.id===id);if(s?.staff){const meta=$('#dlg').querySelector('.rc div');meta.innerHTML+=`<br>Staff: ${e(s.staff)}`}};
 dataTools=function(){
    if(!managerCan('reports')&&!isRootAdmin()){toast('Your account does not have permission for this feature.');return}
   baseDataTools();
    const sections=$('#app').querySelectorAll('section.panel');
    if(!managerCan('reports'))sections[0]?.remove();
    if(!isRootAdmin())sections[1]?.remove();
   $('#app').insertAdjacentHTML('beforeend',`<div class="panel" id="profitPanel"></div>`)
 };
  restoreBackup=function(input){if(requireCEO())baseRestore(input)};
 exportInventory=function(){if(managerFeatureAllowed('reports'))baseExportInventory()};
 exportSales=function(){if(managerFeatureAllowed('reports'))baseExportSales()};
 exportBackup=function(){if(requireCEO())baseExportBackup()};
 exportProfit=function(){if(managerFeatureAllowed('reports'))baseExportProfit()};
 exportMovements=function(){if(managerFeatureAllowed('reports'))baseExportMovements()};
 receivePurchase=function(){if(managerFeatureAllowed('purchases'))baseReceivePurchase()};
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
 const ceo=isRootAdmin(),admin=ceo||currentStaff?.role==='Manager',canManageStaff=ceo||(currentStaff?.role==='Manager'&&managerHasPermission(currentStaff,'staff'));
 const viewReports=managerCan('reports'),accounts=canManageStaff?S.staff:S.staff.filter(u=>u.id===currentStaff.id);
 const accountRows=accounts.map(u=>{
   const actions=[];
   if(canManageStaff&&u.id!==currentStaff.id&&(ceo||u.role==='Staff'))actions.push(`<button class="btn o s" style="margin:0 4px 8px 0" onclick="resetStaffPin('${e(u.id)}')">Reset ${e(u.name)} PIN</button>`);
   if(ceo&&u.id!==currentStaff.id&&u.role!=='CEO')actions.push(`<button class="btn x s" style="margin:0 4px 8px 0" onclick="removeStaffAccount('${e(u.id)}')">Remove account</button>`);
   const limits=ceo&&!isRootAdmin(u)?`<div class="panel" style="margin:0 0 10px"><b>${e(u.name)} access limits</b><div class="grid">${permissionsForRole(u.role).map(p=>`<label class="item" style="cursor:pointer"><span>${e(p.label)}</span><input type="checkbox" style="width:auto;margin:0" ${managerHasPermission(u,p.key)?'checked':''} onchange="setManagerPermission('${e(u.id)}','${p.key}',this.checked)" aria-label="${e(p.label)} for ${e(u.name)}"></label>`).join('')}</div></div>`:'';
   return `<div class="item"><div>${e(u.name)}<small>${e(u.role)}</small></div>${u.id===currentStaff.id?'<span class="tag">Current</span>':''}</div>${actions.join('')}${limits}`
 }).join('');
 const activityPanel=viewReports?`<div class="panel"><h3>Recent activity</h3>${S.activity?.length?S.activity.slice(0,60).map(a=>`<div class="item"><div>${e(a.action)}<small>${new Date(a.t).toLocaleString()} · ${e(a.staff)}${a.details?' · '+e(a.details):''}</small></div></div>`).join(''):'<div class="empty">Activity will appear here.</div>'}</div>`:`<div class="panel"><h3>Account details</h3><p style="color:var(--mut)">Your access is set by the CEO.</p></div>`;
 const movementPanel=viewReports?`<div class="panel"><h3>Stock movement history</h3><button class="btn o s" onclick="exportMovements()">Export movement CSV</button>${S.movements.length?`<div class="tw"><table><thead><tr><th>Date</th><th>Staff</th><th>Medicine / batch</th><th>Type</th><th class="r">Change</th><th class="r">Balance</th><th>Reason / reference</th></tr></thead><tbody>${S.movements.slice(0,150).map(m=>`<tr><td>${new Date(m.t).toLocaleString()}</td><td>${e(m.staff)}</td><td>${e(m.medicine)}<small>${e(m.batch)}</small></td><td>${e(m.kind)}</td><td class="r">${m.quantity>0?'+':''}${m.quantity}</td><td class="r">${m.after}</td><td>${e(m.reason||'')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Stock changes will appear here.</div>'}</div>`:'';
 const management=ceo?`<button class="btn" style="margin-top:12px" onclick="addStaffForm()">Add account</button>`:'';
 const recovery=ceo?`<button class="btn o" style="margin-top:8px" onclick="generateCEORecoveryCode()">${S.managerRecovery?.hash?'Replace':'Create'} CEO recovery code</button><p style="color:var(--mut);margin-bottom:0">Only the CEO can assign account access, change the shared app layout, and add or remove accounts. Store the recovery code somewhere private; it is shown once and replaces the previous code.</p>`:admin&&!canManageStaff?'<p style="color:var(--mut)">This manager account cannot manage staff PINs.</p>':'';
 const layout=ceo?'<button class="btn o" style="margin-top:8px" onclick="showLayoutOptions()">Customize app layout</button>':'';
  $('#app').innerHTML=`<h2>Staff & activity</h2><div class="two"><div class="panel"><h3>Signed in as ${e(currentStaff?.name||'')}</h3><p style="color:var(--mut)">Role: ${e(currentStaff?.role||'Staff')}. Lock the app when stepping away.</p><button class="btn o" onclick="lockApp()">Lock app</button><button class="btn o s" style="margin-top:10px" onclick="changeMyPin()">Change my PIN</button><h3 style="margin-top:20px">Accounts</h3>${accountRows}${management}${layout}${recovery}</div>${activityPanel}</div>${movementPanel}`
}function addStaffForm(){
 if(!requireCEO())return;
 const roleControl='<label style="margin-top:10px">Role<select id="newStaffRole"><option>Staff</option><option>Manager</option></select></label>';
 setDialog('Add staff account',`<label>Name<input id="newStaffName" maxlength="40"></label>${roleControl}<label style="margin-top:10px">PIN (4–12 digits)<input id="newStaffPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn" onclick="saveNewStaff()">Save account</button></div>`)
}
async function saveNewStaff(){
 if(!requireCEO())return;
 const name=$('#newStaffName').value.trim(),role=$('#newStaffRole').value,pin=normalizePinInput($('#newStaffPin').value);
 if(!['Staff','Manager'].includes(role)){toast('Choose a valid account role.');return}
 if(!name){toast('Enter a staff name.');return}if(!/^\d{4,12}$/.test(pin)){toast('Enter a PIN using 4–12 digits.');return}
 try{const salt=randomSalt();S.staff.push({id:uid(),name,role,permissions:[],salt,pinHash:await pinDigest(pin,salt)});addActivity('Staff account added',`${name} · ${role}`);save();$('#dlg').close();staffPage();toast('Staff account added. Assign access in the account list.')}
 catch(x){toast('Could not create this account in the current browser.')}
}
function setManagerPermission(id,permission,enabled){
 if(!requireCEO()){staffPage();return}
 const user=S.staff.find(x=>x.id===id);
 if(!user||isRootAdmin(user)||!permissionsForRole(user.role).some(p=>p.key===permission)){toast('Account access setting was not valid.');staffPage();return}
 const permissions=Array.isArray(user.permissions)?[...user.permissions]:[...DEFAULT_MANAGER_PERMISSIONS];
 const next=enabled?[...new Set([...permissions,permission])]:permissions.filter(x=>x!==permission);
 if(permission==='staff'&&!enabled&&!S.staff.some(other=>other.id!==user.id&&['Manager','CEO'].includes(other.role)&&managerHasPermission(other,'staff'))){toast('At least one manager must keep staff-management access.');staffPage();return}
 user.permissions=next;addActivity('Account access updated',`${user.name}: ${MANAGER_PERMISSIONS.find(p=>p.key===permission).label} ${enabled?'allowed':'removed'}`);save();staffPage();toast('Account access updated')
}
function showLayoutOptions(){
 if(!requireCEO())return;
 const selected=Array.isArray(S.layoutTabs)?S.layoutTabs:TABS.map(([key])=>key);
 const options=TABS.map(([key,label])=>`<label class="item" style="cursor:pointer"><span>${e(label)}${['dash','staff'].includes(key)?' · always shown':''}</span><input type="checkbox" value="${e(key)}" style="width:auto;margin:0" ${['dash','staff'].includes(key)?'checked disabled':selected.includes(key)?'checked':''} aria-label="Show ${e(label)} in the app menu"></label>`).join('');
 setDialog('Customize app layout',`<p style="color:var(--mut)">Choose which existing sections appear in the shared app menu. A visible section does not grant access; each account still needs its assigned permission.</p><div id="layoutOptions" class="panel">${options}</div><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn o" onclick="resetAppLayout()">Show all sections</button><button class="btn" onclick="saveAppLayout()">Save layout</button></div>`)
}
function saveAppLayout(){
 if(!requireCEO())return;
 const selected=Array.from(document.querySelectorAll('#layoutOptions input:checked'),input=>input.value);
 if(!selected.includes('dash'))selected.unshift('dash');
 S.layoutTabs=TABS.map(([key])=>key).filter(key=>selected.includes(key));save();$('#dlg').close();render();toast('App layout saved')
}
function resetAppLayout(){
 if(!requireCEO())return;
 S.layoutTabs=TABS.map(([key])=>key);save();showLayoutOptions();toast('All app sections are shown')
}
function removeStaffAccount(id){
 if(!requireCEO())return;
 const user=S.staff.find(x=>x.id===id);if(!user||user.id===currentStaff.id||user.role==='CEO'){toast('You cannot remove this administrator account.');return}
 setDialog(`Remove ${e(user.name)}?`,`<p style="color:var(--mut)">This removes the account and its sign-in access. Existing sales and activity records remain saved under the staff name.</p><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn x" onclick="confirmRemoveStaffAccount('${e(user.id)}')">Remove account</button></div>`)
}
function confirmRemoveStaffAccount(id){
 if(!requireCEO())return;
 const user=S.staff.find(x=>x.id===id);if(!user||user.id===currentStaff.id||user.role==='CEO'){toast('You cannot remove this administrator account.');return}
 S.staff=S.staff.filter(x=>x.id!==id);addActivity('Staff account removed',`${user.name} · ${user.role}`);save();$('#dlg').close();staffPage();toast('Account removed')
}
function resetStaffPin(id){
 if(!requireManager('staff'))return;const u=S.staff.find(x=>x.id===id);if(!u)return;if(u.role!=='Staff'&&!isRootAdmin()){toast('Only the CEO can change a Manager PIN.');return}
 setDialog(`Reset PIN for ${e(u.name)}`,`<p style="color:var(--mut)">The staff member will use this new PIN next time they sign in.</p><label>New PIN (4–12 digits)<input id="resetPin" type="password" inputmode="numeric" maxlength="12" oninput="this.value=normalizePinInput(this.value)"></label><div class="acts"><button class="btn o" onclick="$('#dlg').close()">Cancel</button><button class="btn" onclick="saveResetPin('${e(id)}')">Save PIN</button></div>`)
}
async function saveResetPin(id){
 if(!requireManager('staff'))return;
  const u=S.staff.find(x=>x.id===id),pin=normalizePinInput($('#resetPin').value);if(!u||!/^\d{4,12}$/.test(pin)){toast('Enter a 4–12 digit PIN.');return}if(u.role!=='Staff'&&!isRootAdmin()){toast('Only the CEO can change a Manager PIN.');return}
 try{u.salt=randomSalt();u.pinHash=await pinDigest(pin,u.salt);addActivity('Staff PIN reset',u.name);save();$('#dlg').close();staffPage();toast('PIN updated')}
 catch(x){toast('Could not update the PIN in this browser.')}
}
