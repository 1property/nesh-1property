const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

/* ---------- CREATE SUPABASE CLIENT (MUST BE FIRST) ---------- */
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- STATUS LOGGER (STEP 4A) ---------- */
async function logStatusChange({
  caseId,
  track,        // "PROPERTY" | "LOAN" | "LEGAL"
  oldStatus,
  newStatus
}) {
  if (!caseId || oldStatus === newStatus) return;

  const { error } = await sb.from("case_status_logs").insert([{
    case_id: caseId,
    track,
    old_status: oldStatus,
    new_status: newStatus
  }]);

  if (error) {
    console.error("Status log failed:", error);
  }
}

/* ---------- CONSTANTS ---------- */
const LOAN_TABLE = "loan_clients";
const LOAN_BUCKET = "loan-attachments";

/* ---------- UI ELEMENTS ---------- */
const loanForm = document.getElementById("loanForm");
const loanTableBody = document.getElementById("loanTableBody");
const searchLoan = document.getElementById("searchLoan");
const searchBtn = document.getElementById("searchBtn");
const refreshBtn = document.getElementById("refreshBtn");
const cancelEditBtn = document.getElementById("cancelEdit");
const formMsg = document.getElementById("formMsg");

const formCard = document.getElementById("formCard");
const listCard = document.getElementById("listCard");
const formTitle = document.getElementById("formTitle");

let editingId = null;

/* ---------- HELPERS ---------- */
function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}
function fmtCurrency(v) {
  if (!v) return "";
  return Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ---------- SHOW / HIDE ---------- */
function showForm(editing = false) {
  listCard.classList.add("d-none");
  formCard.classList.remove("d-none");

  formTitle.textContent = editing ? "Edit Loan Client" : "Add Loan Client";

  if (!editing) {
    editingId = null;
    loanForm.reset();
    formMsg.textContent = "";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showList() {
  formCard.classList.add("d-none");
  listCard.classList.remove("d-none");
  fetchLoanClients();
}

/* ---------- FETCH ---------- */
async function fetchLoanClients(query = "") {
  loanTableBody.innerHTML =
    "<tr><td colspan='12'>Loading...</td></tr>";

  const { data, error } = await sb
    .from(LOAN_TABLE)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    loanTableBody.innerHTML =
      "<tr><td colspan='12'>Failed to load</td></tr>";
    return;
  }

  let rows = data || [];
  if (query) {
    const q = query.toLowerCase();
    rows = rows.filter(r =>
      JSON.stringify(r).toLowerCase().includes(q)
    );
  }

  loanTableBody.innerHTML = "";

  rows.forEach(row => {
    const url = row.attachment_path
      ? sb.storage.from(LOAN_BUCKET)
          .getPublicUrl(row.attachment_path).data.publicUrl
      : "";

    loanTableBody.innerHTML += `
      <tr>
        <td>${row.client_name || ""}</td>
        <td>${row.phone || ""}</td>
        <td>${row.email || ""}</td>
        <td>${fmtCurrency(row.income)}</td>
        <td>${row.loan_type || ""}</td>
        <td>${fmtCurrency(row.loan_amount)}</td>
        <td>${row.bank || ""}</td>
        <td>${row.banker_name || ""}</td>
        <td>${row.status || ""}</td>
        <td>${url ? `<a href="${url}" target="_blank">View</a>` : ""}</td>
        <td>${row.notes || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="onEditLoan(${row.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="onDeleteLoan(${row.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ---------- FILE UPLOAD ---------- */
async function uploadAttachment(file) {
  if (!file) return null;
  const filename = `${Date.now()}_${safeFilename(file.name)}`;
  const { data, error } = await sb.storage
    .from(LOAN_BUCKET)
    .upload(filename, file);
  if (error) throw error;
  return data.path;
}

/* ---------- SAVE (WITH STEP 4B) ---------- */
loanForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "Saving...";

  const payload = {
    client_name: clientName.value,
    phone: phone.value,
    email: email.value,
    income: income.value ? Number(income.value) : null,
    loan_type: loanType.value,
    loan_amount: loanAmount.value ? Number(loanAmount.value) : null,
    bank: bank.value,
    banker_name: bankerName.value,
    status: status.value,
    notes: notes.value
  };

  const file = attachment.files[0];
  if (file) payload.attachment_path = await uploadAttachment(file);

  if (editingId) {
    const { data: oldRow } = await sb
      .from(LOAN_TABLE)
      .select("status, case_id")
      .eq("id", editingId)
      .single();

    await sb.from(LOAN_TABLE).update(payload).eq("id", editingId);

    await logStatusChange({
      caseId: oldRow.case_id,
      track: "LOAN",
      oldStatus: oldRow.status,
      newStatus: payload.status
    });
  } else {
    await sb.from(LOAN_TABLE).insert(payload);
  }

  showList();
});

/* ---------- EDIT ---------- */
window.onEditLoan = async (id) => {
  const { data } = await sb.from(LOAN_TABLE).select("*").eq("id", id).single();
  editingId = id;

  clientName.value = data.client_name || "";
  phone.value = data.phone || "";
  email.value = data.email || "";
  income.value = data.income || "";
  loanType.value = data.loan_type || "";
  loanAmount.value = data.loan_amount || "";
  bank.value = data.bank || "";
  bankerName.value = data.banker_name || "";
  status.value = data.status || "";
  notes.value = data.notes || "";

  showForm(true);
};

/* ---------- DELETE ---------- */
window.onDeleteLoan = async (id) => {
  if (!confirm("Delete this client?")) return;
  await sb.from(LOAN_TABLE).delete().eq("id", id);
  fetchLoanClients();
};

/* ---------- SEARCH ---------- */
searchBtn.onclick = () => fetchLoanClients(searchLoan.value);
refreshBtn.onclick = () => {
  searchLoan.value = "";
  fetchLoanClients();
};

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  btnAddClient.onclick = () => showForm(false);
  btnViewList.onclick = () => showList();
  showList();
});
