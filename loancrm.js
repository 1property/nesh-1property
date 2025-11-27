/*******************************
 * loancrm.js
 * Supabase-backed Bank Loan CRM (view toggles added)
 *******************************/

const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const LOAN_TABLE = "loan_clients";
const LOAN_BUCKET = "loan-attachments";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* --- UI elements --- */
const loanForm = document.getElementById("loanForm");
const loanTableBody = document.getElementById("loanTableBody");
const searchLoan = document.getElementById("searchLoan");
const searchBtn = document.getElementById("searchBtn");
const refreshBtn = document.getElementById("refreshBtn");
const cancelEdit = document.getElementById("cancelEdit");
const formMsg = document.getElementById("formMsg");

const formCard = document.getElementById("formCard");
const listCard = document.getElementById("listCard");
const formTitle = document.getElementById("formTitle");

let editingId = null;

/* ---------------------------
   Utility helpers
   --------------------------- */
function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}
function fmtCurrency(v) {
  if (v === null || v === undefined || v === "") return "";
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------------------------
   Show / Hide Views
   --------------------------- */
function showForm(editing = false) {
  listCard.style.display = "none";
  formCard.style.display = "block";
  if (editing) {
    formTitle.textContent = "Edit Loan Client";
  } else {
    formTitle.textContent = "Add Loan Client";
    loanForm.reset();
    editingId = null;
    document.getElementById("loanEditId").value = "";
    formMsg.textContent = "";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showList() {
  formCard.style.display = "none";
  listCard.style.display = "block";
  // refresh list
  fetchLoanClients();
}

/* ---------------------------
   Fetch & render
   --------------------------- */
async function fetchLoanClients(query = "") {
  if (!loanTableBody) return;
  loanTableBody.innerHTML = "<tr><td colspan='12' class='muted'>Loading…</td></tr>";

  const { data, error } = await supabase
    .from(LOAN_TABLE)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    loanTableBody.innerHTML = `<tr><td colspan='12' class='muted'>Failed to load: ${error.message}</td></tr>`;
    console.error(error);
    return;
  }

  let items = data || [];

  if (query) {
    const q = query.toLowerCase();
    items = items.filter(r =>
      (r.client_name || "").toLowerCase().includes(q) ||
      (r.bank || "").toLowerCase().includes(q) ||
      (r.loan_type || "").toLowerCase().includes(q) ||
      (r.banker_name || "").toLowerCase().includes(q) ||
      (r.status || "").toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    loanTableBody.innerHTML = "<tr><td colspan='12' class='muted'>No clients found</td></tr>";
    return;
  }

  loanTableBody.innerHTML = "";
  items.forEach(row => {
    const attachLink = row.attachment_path ? createPublicUrl(row.attachment_path) : "";
    const attachmentCell = attachLink ? `<a class="file-link" href="${attachLink}" target="_blank">View</a>` : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.client_name || ""}</td>
      <td>${row.phone || ""}</td>
      <td>${row.email || ""}</td>
      <td>${row.income ? fmtCurrency(row.income) : ""}</td>
      <td>${row.loan_type || ""}</td>
      <td>${row.loan_amount ? fmtCurrency(row.loan_amount) : ""}</td>
      <td>${row.bank || ""}</td>
      <td>${row.banker_name || ""}</td>
      <td>${row.status || ""}</td>
      <td>${attachmentCell}</td>
      <td>${(row.notes || "").slice(0,120)}</td>
      <td>
        <button onclick="onEditLoan(${row.id})">Edit</button>
        <button onclick="onDeleteLoan(${row.id})" class="secondary">Delete</button>
      </td>
    `;
    loanTableBody.appendChild(tr);
  });
}

/* ---------------------------
   File helpers
   --------------------------- */
function createPublicUrl(path) {
  try {
    const res = supabase.storage.from(LOAN_BUCKET).getPublicUrl(path);
    return res?.data?.publicUrl || "";
  } catch (e) {
    return "";
  }
}

async function uploadAttachment(file) {
  if (!file) return null;
  const safe = `${Date.now()}_${safeFilename(file.name)}`;
  const { data, error } = await supabase.storage.from(LOAN_BUCKET).upload(safe, file, { upsert: false });
  if (error) throw error;
  return data?.path || safe;
}

/* ---------------------------
   Form submit - create or update
   --------------------------- */
loanForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  formMsg.textContent = "";

  const clientName = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const income = document.getElementById("income").value || null;
  const loanType = document.getElementById("loanType").value;
  const loanAmount = document.getElementById("loanAmount").value || null;
  const bank = document.getElementById("bank").value.trim();
  const bankerName = document.getElementById("bankerName").value.trim();
  const status = document.getElementById("status").value;
  const notes = document.getElementById("notes").value.trim();

  const inputFile = document.getElementById("attachment");
  let attachmentPath = null;
  if (inputFile && inputFile.files && inputFile.files[0]) {
    try {
      formMsg.textContent = "Uploading file...";
      attachmentPath = await uploadAttachment(inputFile.files[0]);
    } catch (err) {
      console.error(err);
      return alert("File upload failed: " + (err.message || err));
    }
  }

  const payload = {
    client_name: clientName,
    phone,
    email,
    income: income ? Number(income) : null,
    loan_type: loanType,
    loan_amount: loanAmount ? Number(loanAmount) : null,
    bank,
    banker_name: bankerName,
    status,
    notes,
  };
  if (attachmentPath) payload.attachment_path = attachmentPath;

  try {
    if (editingId) {
      formMsg.textContent = "Saving changes...";
      const { error } = await supabase.from(LOAN_TABLE).update(payload).eq("id", editingId);
      if (error) throw error;
      formMsg.textContent = "Updated successfully";
    } else {
      formMsg.textContent = "Saving client...";
      const { error } = await supabase.from(LOAN_TABLE).insert([payload]);
      if (error) throw error;
      formMsg.textContent = "Saved";
    }
    loanForm.reset();
    editingId = null;
    document.getElementById("loanEditId").value = "";
    // go back to list after save
    showList();
    setTimeout(() => formMsg.textContent = "", 2500);
  } catch (err) {
    console.error(err);
    alert("Save failed: " + (err.message || err));
    formMsg.textContent = "";
  }
});

/* ---------------------------
   Edit / Delete handlers
   --------------------------- */
window.onEditLoan = async function(id) {
  const { data, error } = await supabase.from(LOAN_TABLE).select("*").eq("id", id).single();
  if (error || !data) {
    return alert("Failed to load record: " + (error?.message || ""));
  }
  editingId = id;
  document.getElementById("loanEditId").value = id;
  document.getElementById("clientName").value = data.client_name || "";
  document.getElementById("phone").value = data.phone || "";
  document.getElementById("email").value = data.email || "";
  document.getElementById("income").value = data.income ?? "";
  document.getElementById("loanType").value = data.loan_type || "Housing Loan";
  document.getElementById("loanAmount").value = data.loan_amount ?? "";
  document.getElementById("bank").value = data.bank || "";
  document.getElementById("bankerName").value = data.banker_name || "";
  document.getElementById("status").value = data.status || "New";
  document.getElementById("notes").value = data.notes || "";
  formMsg.textContent = data.attachment_path ? "Record has existing attachment" : "";
  showForm(true);
};

window.onDeleteLoan = async function(id) {
  if (!confirm("Delete this client? This cannot be undone.")) return;
  const { error } = await supabase.from(LOAN_TABLE).delete().eq("id", id);
  if (error) {
    console.error(error);
    return alert("Delete failed: " + error.message);
  }
  await fetchLoanClients();
};

/* ---------------------------
   Search / refresh / clear
   --------------------------- */
searchBtn.addEventListener("click", () => fetchLoanClients(searchLoan.value || ""));
refreshBtn.addEventListener("click", () => { searchLoan.value = ""; fetchLoanClients(); });
cancelEdit.addEventListener("click", () => { loanForm.reset(); editingId = null; document.getElementById("loanEditId").value=""; formMsg.textContent=""; });

/* ---------------------------
   initial load
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // show list view by default
  showList();
});

