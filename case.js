
cconst SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// get token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  alert("Invalid link");
}

// load case using token
async function loadCase() {
  const { data, error } = await sb
    .from("cases")
    .select("*")
    .eq("client_token", token)
    .single();

  if (error || !data) {
    alert("Case not found");
    return;
  }

  window.caseId = data.id;

  document.getElementById("caseTitle").innerText = data.case_code;
  document.getElementById("property").innerText = data.property_address || "-";
  document.getElementById("statusProperty").innerText = data.status_property;
  document.getElementById("statusLoan").innerText = data.status_loan;
  document.getElementById("statusLegal").innerText = data.status_legal;

  loadTimeline(data.id);
}

// load timeline
async function loadTimeline(caseId) {
  const { data } = await sb
    .from("case_status_logs")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  const ul = document.getElementById("timeline");
  ul.innerHTML = "";

  if (!data || data.length === 0) {
    ul.innerHTML = `<li class="list-group-item text-muted">No updates yet</li>`;
    return;
  }

  data.forEach(log => {
    ul.innerHTML += `
      <li class="list-group-item">
        <b>${log.track}</b><br>
        ${log.old_status || "-"} → <strong>${log.new_status}</strong>
        <div class="small text-muted">
          ${new Date(log.created_at).toLocaleString()}
        </div>
      </li>
    `;
  });
}

loadCase();
