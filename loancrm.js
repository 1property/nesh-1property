/*******************************
 * loancrm.js
 * Supabase-backed Bank Loan CRM (fixed client)
 *******************************/

const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const LOAN_TABLE = "loan_clients";
const LOAN_BUCKET = "loan-attachments";

/* ❗ FIX: create client correctly */
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  if (!v) return "";
  return Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ---------------------------
   Show / Hide Sections
   --------------------------- */
function showForm(editing = false) {
  listCard.style.display = "none";
  formCard.style.display = "block";

  if (editing) {
    formTitle.textContent = "Edit Loan Client";
  } else {
    formTitle.textContent = "Add Loan Client";
    editingId = null;
    loanForm.reset();
    document.getElementById("loanEditId").value = "";
    formMsg.textContent = "";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showList() {
  formCard.style.display = "none";
  listCard.style.display = "block";
  fetchLoanClients();
}

/* ---------------------------
   Fetch & render
   --------------------------- */
async function fetchLoanClients(query = "") {
  loanTableBody.innerHTML =
    "<tr><td colspan='12' class='muted'>Loading…</td></tr>";

  const { data, error } = await sb
    .from(LOAN_TABLE)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    loanTableBody.innerHTML =
      "<tr><td colspan='12' class='muted'>Failed to load</td></tr>";
    console.error(error);
    return;
  }

  let items = data || [];

  if (query) {
    const q = query.toLowerCase();
    items = items.filter(
      (r) =>
        (r.client_name || "").toLowerCase().includes(q) ||
        (r.bank || "").toLowerCase().includes(q) ||
        (r.loan_type || "").toLowerCase().includes(q) ||
        (r.banker_name || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    loanTableBody.innerHTML =
      "<tr><td colspan='12' class='muted'>No clients found</td></tr>";
    return;
  }

  loanTableBody.innerHTML = "";
  items.forEach((row) => {
    const url = row.attachment_path
      ? sb.storage.from(LOAN_BUCKET).getPublicUrl(row.attachment_path).data
          .publicUrl
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
        <td>${url ? `<a class="file-link" href="${url}" target="_blank">View</a>` : ""}</td>
        <td>${(row.notes || "").slice(0, 120)}</td>
        <td>
          <button onclick="onEditLoan(${row.id})">Edit</button>
          <button onclick="onDeleteLoan(${row.id})" class="secondary">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ---------------------------
   File upload
   --------------------------- */
async function uploadAttachment(file) {
  if (!file) return null;

  const filename = `${Date.now()}_${safeFilename(file.name)}`;

  const { data, error } = await sb.storage
    .from(LOAN_BUCKET)
    .upload(filename, file);

  if (error) throw error;

  return data.path;
}

/* ---------------------------
   Save Form
   --------------------------- */
loanForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  formMsg.textContent = "Saving...";

  const payload = {
    client_name: clientName.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    income: income.value ? Number(income.value) : null,
    loan_type: loanType.value,
    loan_amount: loanAmount.value ? Number(loanAmount.value) : null,
    bank: bank.value.trim(),
    banker_name: bankerName.value.trim(),
    status: status.value,
    notes: notes.value.trim(),
  };

  let file = document.getElementById("attachment").files[0];
  if (file) {
    try {
      payload.attachment_path = await uploadAttachment(file);
    } catch (err) {
      alert("Upload failed: " + err.message);
      return;
    }
  }

  if (editingId) {
    await sb.from(LOAN_TABLE).update(payload).eq("id", editingId);
  } else {
    await sb.from(LOAN_TABLE).insert(payload);
  }

  formMsg.textContent = "Saved!";
  showList();
});

/* ---------------------------
   Edit
   --------------------------- */
window.onEditLoan = async (id) => {
  const { data, error } = await sb
    .from(LOAN_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Load error");
    return;
  }

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

/* ---------------------------
   Delete
   --------------------------- */
window.onDeleteLoan = async (id) => {
  if (!confirm("Delete this client?")) return;
  await sb.from(LOAN_TABLE).delete().eq("id", id);
  fetchLoanClients();
};

/* ---------------------------
   Search / Refresh
   --------------------------- */
searchBtn.addEventListener("click", () =>
  fetchLoanClients(searchLoan.value.trim())
);
refreshBtn.addEventListener("click", () => {
  searchLoan.value = "";
  fetchLoanClients();
});

/* ---------------------------
   Load List on start
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => showList());




