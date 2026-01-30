
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* =====================================
   GET CASE ID FROM URL
===================================== */
const params = new URLSearchParams(window.location.search);
const caseId = params.get("id");

if (!caseId) {
  alert("Case ID missing in URL");
}

/* =====================================
   LOAD CASE DETAILS
===================================== */
async function loadCase() {
  const { data, error } = await sb
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (error || !data) {
    console.error(error);
    alert("Failed to load case");
    return;
  }

  document.getElementById("caseTitle").innerText = data.case_code || "-";
  document.getElementById("property").innerText = data.property_address || "-";
  document.getElementById("statusProperty").innerText = data.status_property || "-";
  document.getElementById("statusLoan").innerText = data.status_loan || "-";
  document.getElementById("statusLegal").innerText = data.status_legal || "-";
}

/* =====================================
   LOAD STATUS TIMELINE
===================================== */
async function loadTimeline() {
  const { data, error } = await sb
    .from("case_status_logs")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  const ul = document.getElementById("timeline");
  ul.innerHTML = "";

  if (error) {
    console.error(error);
    ul.innerHTML = `<li class="list-group-item text-danger">Failed to load timeline</li>`;
    return;
  }

  if (!data || data.length === 0) {
    ul.innerHTML = `<li class="list-group-item text-muted">No updates yet</li>`;
    return;
  }

  data.forEach(log => {
    ul.innerHTML += `
      <li class="list-group-item">
        <strong>${log.track}</strong><br>
        ${log.old_status || "-"} → <b>${log.new_status}</b>
        <div class="small text-muted">
          ${new Date(log.created_at).toLocaleString()}
        </div>
      </li>
    `;
  });
}

/* =====================================
   INIT
===================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadCase();
  loadTimeline();
});
</script>
