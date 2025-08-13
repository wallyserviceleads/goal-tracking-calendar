/* Calendar Logic */
(async function(){
  const cfg = window.APP_CONFIG;
  const $  = (sel)=>document.querySelector(sel);
  const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

  const yearInput      = $("#yearlyGoal");
  const saturdayToggle = $("#toggleSaturday");
  const paceToggle     = $("#toggleWorkingPace");
  const fsBtn          = $("#fullscreenBtn");

  const monthLabel  = $("#monthLabel");
  const grid        = $("#calendarGrid");
  const kpiDaily    = $("#kpiDaily");
  const kpiWeekly   = $("#kpiWeekly");
  const kpiMonthly  = $("#kpiMonthly");
  const kpiQuarterly= $("#kpiQuarterly");
  const kpiYTD      = $("#kpiYTD");

  const prevBtn = $("#prevMonth");
  const nextBtn = $("#nextMonth");

  // State
  let current = new Date();
  current.setDate(1);
  let rows = []; // parsed CSV rows

  // Init UI defaults
  yearInput.value        = cfg.DEFAULT_YEARLY_GOAL;
  saturdayToggle.checked = cfg.DEFAULT_INCLUDE_SATURDAY;
  paceToggle.checked     = cfg.DEFAULT_WORKING_PACE;

  // Events
  prevBtn.addEventListener("click", ()=>{ current.setMonth(current.getMonth()-1); render(); });
  nextBtn.addEventListener("click", ()=>{ current.setMonth(current.getMonth()+1); render(); });
  [yearInput, saturdayToggle, paceToggle].forEach(el => el.addEventListener("input", render));
  fsBtn.addEventListener("click", ()=>{
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  });

  // Fetch CSV
  async function getCSV(){
    const url = (cfg.SHEET_CSV_URL && cfg.SHEET_CSV_URL.length) ? cfg.SHEET_CSV_URL : cfg.FALLBACK_CSV;
    const resp = await fetch(url, {cache:"no-store"});
    if(!resp.ok) throw new Error("Failed to load CSV");
    return await resp.text();
  }

  function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(x=>x.trim().length);
    if(lines.length===0) return [];
    const headers = lines[0].split(",").map(h=>h.trim());
    const out = [];
    for(let i=1;i<lines.length;i++){
      const cols = lines[i].split(","); // naive; avoid commas in fields
      const obj = {};
      headers.forEach((h,idx)=>obj[h]= (cols[idx]||"").trim());
      if(obj["Date"]) out.push(obj);
    }
    return out;
  }

  function money(n){
    const num = Number(n);
    if(!isFinite(num)) return "—";
    return num.toLocaleString(undefined,{style:"currency", currency:"USD", maximumFractionDigits:0});
  }

  function getWorkingDaysInMonth(dt, includeSat){
    const y=dt.getFullYear(), m=dt.getMonth();
    const days = new Date(y, m+1, 0).getDate();
    let count=0;
    for(let d=1; d<=days; d++){
      const day = new Date(y,m,d).getDay(); // 0 Sun..6 Sat
      const isWeekend = includeSat ? (day===0) : (day===0 || day===6);
      if(!isWeekend) count++;
    }
    return count;
  }

  function keyFor(y,m,d){ return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }

  function render(){
    // Month label
    const fmt = new Intl.DateTimeFormat(undefined,{month:"long", year:"numeric"});
    monthLabel.textContent = fmt.format(current);

    // Filter rows to this month
    const y=current.getFullYear(), m=current.getMonth();
    const inMonth = rows.filter(r=>{
      const d = new Date(r["Date"]);
      return d.getFullYear()===y && d.getMonth()===m;
    });

    // Build day map
    const daysInMonth = new Date(y,m+1,0).getDate();
    const dayMap = new Map(); // 'YYYY-MM-DD' -> { items:[], total: number }
    for(let d=1; d<=daysInMonth; d++){
      dayMap.set(keyFor(y,m,d), {items:[], total:0});
    }

    let ytd = 0;
    const now = new Date();
    rows.forEach(r=>{
      const d = new Date(r["Date"]);
      if (d.getFullYear()===y && (r["Status"]||"").toLowerCase()!=="cancelled"){
        if (d <= now) ytd += Number(r["Amount"]||0) || 0;
      }
    });

    // Populate items for the month
    inMonth.forEach(r=>{
      const d = new Date(r["Date"]);
      const key = keyFor(y,m,d.getDate());
      const bucket = dayMap.get(key);
      const amt = Number(r["Amount"]||0) || 0;
      const cancelled = (r["Status"]||"").toLowerCase()==="cancelled";
      bucket.items.push({
        service: r["Service"]||"Repair",
        amount: amt,
        cancelled,
        name: r["Customer Name"]||""
      });
      if(!cancelled) bucket.total += amt;
    });

    // Compute targets
const yearlyGoal = Number(yearInput.value || 0) || 0;
const includeSat = !!saturdayToggle.checked;

// Working days in this month (Sun excluded; Sat optional)
const workingDays = getWorkingDaysInMonth(current, includeSat);

// Targets
const monthlyTarget  = yearlyGoal / 12;
const dailyTarget    = workingDays > 0 ? (monthlyTarget / workingDays) : 0;
const weeklyWorkdays = includeSat ? 6 : 5;
const weeklyTarget   = dailyTarget * weeklyWorkdays;

// Update KPI
kpiDaily.textContent      = money(dailyTarget);
kpiWeekly.textContent     = money(weeklyTarget);
kpiMonthly.textContent    = money(monthlyTarget);
kpiQuarterly.textContent  = money(yearlyGoal / 4);
kpiYTD.textContent        = money(ytd);


    // Render grid
    grid.innerHTML = "";

    // Weekday headers (Sun..Sat)
    const headers = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    headers.forEach(h=>{
      const div = document.createElement("div");
      div.className = "day";
      div.innerHTML = `<div class="date"><strong>${h}</strong></div>`;
      grid.appendChild(div);
    });

    // Pad start
    const firstDay = new Date(y,m,1).getDay(); // 0 Sun..6 Sat
    for(let i=0;i<firstDay;i++){
      const pad = document.createElement("div");
      pad.className = "day";
      pad.innerHTML = `<div class="date"> </div>`;
      grid.appendChild(pad);
    }

    // Days
    let weekAccumulator = 0, dayCountThisWeek = 0;

    for(let d=1; d<=daysInMonth; d++){
      const date = new Date(y,m,d);
      const key = keyFor(y,m,d);
      const data = dayMap.get(key);

      const el = document.createElement("div");
      el.className = "day";

     // day header
const weekday    = date.getDay(); // 0 Sun..6 Sat


const paceHTML = (!isExcluded && isFinite(dailyTarget))
  ? `<span class="pace"><span class="pill goal"></span>${money(dailyTarget)}</span>`
  : "";

el.innerHTML = `<div class="date"><span>${d}</span>${paceHTML}</div>`;

// items & totals only on non-excluded days
if (!isExcluded) {
  const itemsWrap = document.createElement("div");
  itemsWrap.className = "items";

  data.items.slice().sort((a,b)=>b.amount-a.amount).forEach(it=>{
    const item = document.createElement("div");
    item.className = "item" + (it.cancelled ? " cancelled" : "");
    const svc = it.service || "Repair";
    item.innerHTML = `<span>${svc}</span><span class="amount">${money(it.amount)}</span>`;
    itemsWrap.appendChild(item);
  });

  el.appendChild(itemsWrap);

  const total = document.createElement("div");
  total.className = "total";
  total.innerHTML = `<span>Total</span><span>${money(data.total)}</span>`;
  el.appendChild(total);

  // weekly accumulation
  weekAccumulator += data.total;
  dayCountThisWeek++;
}

// append the day cell either way
grid.appendChild(el);

// weekly roll (Saturday or last day of month)
if (weekday === 6 || d === daysInMonth) {
  const weekRow = document.createElement("div");
  weekRow.className = "week-row";
  weekRow.innerHTML = `<div>Week subtotal</div><div>${money(weekAccumulator)}</div>`;
  grid.appendChild(weekRow);
  weekAccumulator = 0;
  dayCountThisWeek = 0;
}
    }
  }

  // Boot
  try {
    const csv = await getCSV();
    rows = parseCSV(csv);
  } catch(e){
    console.error(e);
    rows = [];
  }
  render();
})();
