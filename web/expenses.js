/* Day / night mode and the CEO-only Expenses section.
   Expenses are kept in S.expenses in the same JSON data file as the rest of the app. */
const EXPENSE_CATEGORIES=['Staff salary','Rent','Electricity and water','Internet and phone','Transport','Maintenance','Other'];
const pad2=n=>String(n).padStart(2,'0');
const localMonthOf=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1);
const localDateValue=d=>localMonthOf(d)+'-'+pad2(d.getDate());
let expMonth='';

/* Day / night mode. The choice is saved in the data file; without a choice the phone or PC setting is used. */
function themeMode(){
 if(S.theme==='dark'||S.theme==='light')return S.theme;
 return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'
}
function applyTheme(){
 const root=document.documentElement;
 if(S.theme==='dark'||S.theme==='light')root.setAttribute('data-theme',S.theme);else root.removeAttribute('data-theme');
 const btn=$('#themeBtn');
 if(btn){const next=themeMode()==='dark'?'Day mode':'Night mode';if(btn.textContent!==next)btn.textContent=next}
}
function toggleTheme(){
 S.theme=themeMode()==='dark'?'light':'dark';
 save();applyTheme()
}

/* Income and expense totals by month. Sales use the local date of each bill. */
function salesIncomeIn(month){return S.sales.filter(s=>localMonthOf(new Date(s.t))===month).reduce((a,s)=>a+(+s.total||0),0)}
function expensesIn(month){return S.expenses.filter(x=>String(x.date||'').slice(0,7)===month).reduce((a,x)=>a+(+x.amount||0),0)}
function lastMonths(n){const out=[],d=new Date();d.setDate(1);for(let i=0;i<n;i++){out.unshift(localMonthOf(d));d.setMonth(d.getMonth()-1)}return out}
function monthLabel(m){return new Date(+m.slice(0,4),+m.slice(5,7)-1,1).toLocaleString('en-US',{month:'short',year:'numeric'})}

function expensesPage(){
 if(!requireCEO()){$('#app').innerHTML='<h2>Expenses</h2><div class="panel"><p class="empty">Only the CEO account can open this section.</p></div>';return}
 S.expenses=Array.isArray(S.expenses)?S.expenses:[];
 const month=expMonth||localMonthOf(new Date());
 const rows=S.expenses.filter(x=>String(x.date).slice(0,7)===month).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(a.t<b.t?1:-1));
 const income=salesIncomeIn(month),spent=expensesIn(month),net=income-spent;
 const byCat=EXPENSE_CATEGORIES.map(c=>[c,rows.filter(x=>x.category===c).reduce((a,x)=>a+(+x.amount||0),0)]).filter(x=>x[1]>0);
 const salaryByPerson={};
 rows.filter(x=>x.category==='Staff salary').forEach(x=>{const k=x.person||'Unnamed';salaryByPerson[k]=(salaryByPerson[k]||0)+(+x.amount||0)});
 const catRows=byCat.map(([c,v])=>{
   const sub=c==='Staff salary'?Object.entries(salaryByPerson).map(([p,a])=>`<div class="item" style="padding:4px 0 4px 16px"><small>${e(p)}</small><small>${money(a)}</small></div>`).join(''):'';
   return `<div class="item"><span>${e(c)}</span><b>${money(v)}</b></div>${sub}`
 }).join('');
 const months=lastMonths(6).map(m=>({m,income:salesIncomeIn(m),spent:expensesIn(m)}));
 const top=Math.max(1,...months.map(x=>Math.max(x.income,x.spent)));
 const bar=(v,color)=>`<div style="height:10px;border-radius:5px;background:${color};width:${(Math.max(0,v)/top*100).toFixed(1)}%"></div>`;
 $('#app').innerHTML=`<h2>Expenses & income</h2>
 <div class="tools"><label style="min-width:200px">Month<input type="month" id="expMonthPick" value="${month}" onchange="expMonth=this.value||localMonthOf(new Date());expensesPage()"></label></div>
 <div class="grid">
  <div class="stat"><b>${money(income)}</b><span>Income (sales this month)</span></div>
  <div class="stat d"><b>${money(spent)}</b><span>Expenses recorded</span></div>
  <div class="stat ${net<0?'d':''}"><b>${money(net)}</b><span>${net<0?'Loss after expenses':'Left after expenses'}</span></div>
 </div>
 <div class="two">
  <div class="panel"><h3>Add expense</h3>
   <label>Date<input type="date" id="expDate" value="${localDateValue(new Date())}"></label>
   <label style="margin-top:10px">Category<select id="expCat" onchange="staffPickChanged()">${EXPENSE_CATEGORIES.map(c=>`<option>${e(c)}</option>`).join('')}</select></label>
   <div id="expStaffWrap" style="display:block;margin-top:10px">
    <label>Paid to (staff member)<select id="expStaff" onchange="staffPickChanged()"><option value="">Choose staff member</option>${S.staff.map(u=>`<option value="${e(u.id)}">${e(u.name)} · ${e(u.role)}</option>`).join('')}<option value="__other">Someone else (type name)</option></select></label>
    <label id="expOtherWrap" style="margin-top:10px;display:none">Name of the person paid<input id="expOther" maxlength="60" placeholder="Name"></label>
   </div>
   <label style="margin-top:10px">Description (optional)<input id="expDesc" maxlength="80" placeholder="e.g. March salaries, shop rent"></label>
   <label style="margin-top:10px">Amount (৳)<input id="expAmount" type="number" min="0" step="any" inputmode="decimal"></label>
   <div class="acts"><button class="btn" onclick="addExpense()">Save expense</button></div>
  </div>
  <div class="panel"><h3>Spending by category</h3>${byCat.length?catRows:'<div class="empty">No expenses recorded this month.</div>'}</div>
 </div>
 <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3 style="margin:0">Expense records</h3><button class="btn o s" onclick="exportExpenses()">Export expenses CSV</button></div>
  ${rows.length?rows.map(x=>`<div class="item"><div>${e(x.category)}${x.person?' · '+e(x.person):''}${x.desc?' · '+e(x.desc):''}<small>${e(x.date)} · recorded by ${e(x.staff||'')}</small></div><div style="display:flex;gap:8px;align-items:center"><b>${money(x.amount)}</b><button class="btn x s" onclick="deleteExpense('${e(x.id)}')">Delete</button></div></div>`).join(''):'<div class="empty">No expenses this month yet.</div>'}
 </div>
 <div class="panel tw"><h3>Income vs expenses, last 6 months</h3>
  <table><thead><tr><th>Month</th><th class="r">Income</th><th class="r">Expenses</th><th class="r">Left</th><th>Comparison</th></tr></thead><tbody>${months.map(x=>`<tr><td>${monthLabel(x.m)}</td><td class="r">${money(x.income)}</td><td class="r">${money(x.spent)}</td><td class="r" style="color:${x.income-x.spent<0?'var(--bd)':'var(--ac)'}">${money(x.income-x.spent)}</td><td><div style="display:grid;gap:4px;min-width:140px">${bar(x.income,'var(--ac)')}${bar(x.spent,'var(--bd)')}</div></td></tr>`).join('')}</tbody></table>
  <p style="color:var(--mut);margin-bottom:0">Green bars are income. Red bars are expenses. Medicine stock bought from suppliers is recorded under Purchases, so add it here only if you want it counted as an expense.</p>
 </div>`
}
function staffPickChanged(){
 const salary=$('#expCat').value==='Staff salary';
 $('#expStaffWrap').style.display=salary?'block':'none';
 $('#expOtherWrap').style.display=salary&&$('#expStaff').value==='__other'?'block':'none'
}
function addExpense(){
 if(!requireCEO())return;
 const date=$('#expDate').value,category=$('#expCat').value,desc=$('#expDesc').value.trim(),amount=+$('#expAmount').value;
 let person='',staffId='';
 if(category==='Staff salary'){
   const pick=$('#expStaff').value;
   if(pick==='__other'){person=$('#expOther').value.trim();if(!person){toast('Type the name of the person paid.');return}}
   else{const u=S.staff.find(x=>x.id===pick);if(!u){toast('Choose the staff member paid.');return}person=u.name;staffId=u.staffId||''}
 }
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast('Choose a date.');return}
 if(!Number.isFinite(amount)||amount<=0){toast('Enter an amount greater than zero.');return}
 S.expenses.push({id:uid(),date,category,person,staffId,desc,amount:Math.round(amount*100)/100,staff:actor(),t:safeDate()});
 addActivity('Expense recorded',`${category} · ${money(amount)}`);
 expMonth=date.slice(0,7);save();toast('Expense saved');expensesPage()
}
function deleteExpense(id){
 if(!requireCEO())return;
 const x=S.expenses.find(r=>r.id===id);if(!x)return;
 if(!confirm(`Delete this ${x.category} expense of ${money(x.amount)}?`))return;
 S.expenses=S.expenses.filter(r=>r.id!==id);
 addActivity('Expense deleted',`${x.category} · ${money(x.amount)}`);save();expensesPage()
}
function exportExpenses(){
 if(!requireCEO())return;
 const rows=[['Date','Category','Paid to','Description','Amount','Recorded by']];
 S.expenses.slice().sort((a,b)=>a.date<b.date?-1:1).forEach(x=>rows.push([x.date,x.category,x.person||'',x.desc,x.amount,x.staff]));
 csvOut('pharmacy-expenses-'+new Date().toISOString().slice(0,10)+'.csv',rows)
}
