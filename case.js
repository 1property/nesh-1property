
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_KEY";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const caseId = params.get("id");

async function loadCase() {
  const { data } = await sb.from("cases").select("*").eq("id", caseId).single();

  document.getElementById("caseTitle").innerText = data.case_code;
  document.getElementById("property").innerText = data.property_address || "-";
  document.getElementById("statusProperty").innerText = data.status_property;
  document.getElementById("statusLoan").innerText = data.status_loan;
  document.getElementById("statusLegal").innerText = data.status_legal;
}

async function loadTimeline() {
  const { data } = await sb
    .from("case_status_logs")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  const ul = document.getElementById("timeline");
  ul.innerHTML = "";

  data.forEach(log => {
    ul.innerHTML += `
      <li class="list-group-item">
        <strong>${log.track}</strong>: 
        ${log.old_status || "-"} → <b>${log.new_status}</b>
        <br>
        <small class="text-muted">${new Date(log.created_at).toLocaleString()}</small>
      </li>
    `;
  });
}

loadCase();
loadTimeline();
