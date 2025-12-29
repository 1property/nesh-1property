// script.js
/***********************************************
 * Rebuilt script.js - ES6, Bootstrap modals/toasts
 * Preserves original Supabase behavior (CRUD + uploads)
 ***********************************************/

/* ---------- Supabase config (kept from your input) ---------- */
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";
const RENT_TABLE = "rentinfo";
const RENT_BUCKET = "rent-attachments";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Helper ---------- */
const $ = (id) => document.getElementById(id);

function toast(message, opts = {}) {
  const container = document.getElementById("toastContainer");
  const id = "t" + Date.now();
  const el = document.createElement("div");
  el.className = "toast align-items-center text-white bg-" + (opts.type || "primary") + " border-0 mb-2";
  el.role = "alert";
  el.ariaLive = "assertive";
  el.ariaAtomic = "true";
  el.id = id;
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  container.appendChild(el);
  const btoast = new bootstrap.Toast(el, { delay: opts.delay || 4000 });
  btoast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

/* ---------- Modal instances ---------- */
const buyerModalEl = document.getElementById("buyerModal");
const buyerModal = new bootstrap.Modal(buyerModalEl);
const sellerModalEl = document.getElementById("sellerModal");
const sellerModal = new bootstrap.Modal(sellerModalEl);
const rentModalEl = document.getElementById("rentModal");
const rentModal = new bootstrap.Modal(rentModalEl);
const confirmDeleteModalEl = document.getElementById("confirmDeleteModal");
const confirmDeleteModal = new bootstrap.Modal(confirmDeleteModalEl);

/* ---------- App State ---------- */
let deleteContext = null; // { table, id }
let currentView = "tablePage";

/* ---------- Utilities ---------- */
function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

/* ---------- Upload helper (rent attachments only) ---------- */
async function uploadAttachmentToBucket(file) {
  if (!file) return null;
  const filename = `rent_${Date.now()}_${safeFilename(file.name)}`;
  const { data, error } = await sb.storage.from(RENT_BUCKET).upload(filename, file);
  if (error) throw error;
  return data.path;
}

/* ---------- Fetch and render buyers/sellers ---------- */
async function fetchBuyerData(query = "") {
  // show simple loading
  const tbody = $("buyer-table-body");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">Loading…</td></tr>`;

  const { data, error } = await sb.from(BUYER_TABLE).select("*").order("id", { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-danger">Failed to load</td></tr>`;
    console.error("fetchBuyerData error:", error);
    toast("Failed to load data", { type: "danger" });
    return;
  }

  const list = Array.isArray(data) ? data : [];
  const q = (query || "").toLowerCase().trim();
  const filtered = q ? list.filter(r => ((r.name || "") + " " + (r.location || "") + " " + (r.status || "")).toLowerCase().includes(q)) : list;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-muted">No records found</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name || ""}</td>
      <td>${row.phone || ""}</td>
      <td>${row.email || ""}</td>
      <td>${row.location || ""}</td>
      <td>${row.property || ""}</td>
      <td>${row.source || ""}</td>
      <td>${row.followup || ""}</td>
      <td>${row.status || ""}</td>
      <td>${(row.notes || "").slice(0, 80)}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary btn-edit-buyer" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-buyer" data-id="${row.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- Fetch and render sellers ---------- */
async function fetchSellerData(query = "") {
  // show simple loading
  const tbody = $("seller-table-body");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">Loading…</td></tr>`;

  const { data, error } = await sb.from(SELLER_TABLE).select("*").order("id", { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-danger">Failed to load</td></tr>`;
    console.error("fetchSellerData error:", error);
    toast("Failed to load data", { type: "danger" });
    return;
  }

  const list = Array.isArray(data) ? data : [];
  const q = (query || "").toLowerCase().trim();
  const filtered = q ? list.filter(r => ((r.name || "") + " " + (r.location || "") + " " + (r.status || "")).toLowerCase().includes(q)) : list;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-muted">No records found</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name || ""}</td>
      <td>${row.phone || ""}</td>
      <td>${row.email || ""}</td>
      <td>${row.location || ""}</td>
      <td>${row.property || ""}</td>
      <td>${row.source || ""}</td>
      <td>${row.followup || ""}</td>
      <td>${row.status || ""}</td>
      <td>${(row.notes || "").slice(0, 80)}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary btn-edit-seller" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-seller" data-id="${row.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- Add / Update Listing ---------- */
async function saveBuyer(e) {
  e.preventDefault();
  const buyerRecordIdEl = $("buyerRecordId");
  const buyerRecordId = buyerRecordIdEl ? buyerRecordIdEl.value : "";

  const payload = {
    name: $("buyer_name").value || "",
    phone: $("buyer_phone").value || "",
    email: $("buyer_email").value || "",
    location: $("buyer_location").value || "",
    property: $("buyer_property").value || "",
    source: $("buyer_source").value || "",
    followup: $("buyer_followUp").value || null,
    status: $("buyer_status").value || "",
    notes: $("buyer_notes").value || ""
  };

  try {
    if (buyerRecordId) {
      const { error } = await sb.from(BUYER_TABLE).update(payload).eq("id", buyerRecordId);
      if (error) throw error;
      toast("Buyer updated", { type: "success" });
    } else {
      const { error } = await sb.from(BUYER_TABLE).insert([payload]);
      if (error) throw error;
      toast("Buyer created", { type: "success" });
    }
    // reset form & reload
    $("buyerForm").reset();
    if (buyerRecordIdEl) buyerRecordIdEl.value = "";
    buyerModal.hide();
    fetchBuyerData();
    fetchSellerData();
    showPage("buyerPage");
  } catch (err) {
    console.error("save buyer error:", err);
    toast("Failed to save buyer", { type: "danger" });
  }
}

/* ---------- Add / Update Seller ---------- */
async function saveSeller(e) {
  e.preventDefault();
  const sellerRecordIdEl = $("sellerRecordId");
  const sellerRecordId = sellerRecordIdEl ? sellerRecordIdEl.value : "";

  const payload = {
    name: $("seller_name").value || "",
    phone: $("seller_phone").value || "",
    email: $("seller_email").value || "",
    location: $("seller_location").value || "",
    property: $("seller_property").value || "",
    source: $("seller_source").value || "",
    followup: $("seller_followUp").value || null,
    status: $("seller_status").value || "",
    notes: $("seller_notes").value || ""
  };

  try {
    if (sellerRecordId) {
      const { error } = await sb.from(SELLER_TABLE).update(payload).eq("id", sellerRecordId);
      if (error) throw error;
      toast("Listing updated", { type: "success" });
    } else {
      const { error } = await sb.from(SELLER_TABLE).insert([payload]);
      if (error) throw error;
      toast("Listing created", { type: "success" });
    }
    // reset form & reload
    $("sellerForm").reset();
    if (sellerRecordIdEl) sellerRecordIdEl.value = "";
    sellerModal.hide();
    fetchBuyerData();
    fetchSellerData();
    showPage("sellerPage");
  } catch (err) {
    console.error("save seller error:", err);
    toast("Failed to save seller", { type: "danger" });
  }
}

/* ---------- Edit Buyer (populate modal) ---------- */
async function editBuyer(id) {
  try {
    const { data, error } = await sb.from(BUYER_TABLE).select("*").eq("id", id).single();
    if (error) throw error;

    $("buyerRecordId").value = id;
    $("buyer_name").value = data.name || "";
    $("buyer_phone").value = data.phone || "";
    $("buyer_email").value = data.email || "";
    $("buyer_location").value = data.location || "";
    $("buyer_property").value = data.property || "";
    $("buyer_source").value = data.source || "";
    $("buyer_followUp").value = data.followup || "";
    $("buyer_status").value = data.status || "";
    $("buyer_notes").value = data.notes || "";

    $("buyerModalTitle").textContent = "Edit Buyer";
    buyerModal.show();
  } catch (err) {
    console.error("edit buyer error:", err);
    toast("Failed to load buyer record", { type: "danger" });
  }
}

/* ---------- Edit Seller (populate modal) ---------- */
async function editSeller(id) {
  try {
    const { data, error } = await sb.from(SELLER_TABLE).select("*").eq("id", id).single();
    if (error) throw error;

    $("sellerRecordId").value = id;
    $("seller_name").value = data.name || "";
    $("seller_phone").value = data.phone || "";
    $("seller_email").value = data.email || "";
    $("seller_location").value = data.location || "";
    $("seller_property").value = data.property || "";
    $("seller_source").value = data.source || "";
    $("seller_followUp").value = data.followup || "";
    $("seller_status").value = data.status || "";
    $("seller_notes").value = data.notes || "";

    $("sellerModalTitle").textContent = "Edit Seller";
    sellerModal.show();
  } catch (err) {
    console.error("edit seller error:", err);
    toast("Failed to load seller record", { type: "danger" });
  }
}

/* ---------- Delete Listing (confirm) ---------- */
function askDelete(table, id) {
  deleteContext = { table, id };
  $("confirmDeleteText").textContent = "Delete this record? This action cannot be undone.";
  confirmDeleteModal.show();
}

async function confirmDelete() {
  if (!deleteContext) return;
  try {
    const { error } = await sb.from(deleteContext.table).delete().eq("id", deleteContext.id);
    if (error) throw error;
    toast("Record deleted", { type: "success" });
    fetchBuyerData();
    fetchSellerData();
    fetchRentData();
  } catch (err) {
    console.error("confirm delete error:", err);
    toast("Failed to delete", { type: "danger" });
  } finally {
    deleteContext = null;
    confirmDeleteModal.hide();
  }
}

/* ---------- Rent: fetch, add/update, edit, delete ---------- */
async function fetchRentData(query = "") {
  const tbody = $("rent-table-body");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Loading…</td></tr>`;

  const { data, error } = await sb.from(RENT_TABLE).select("*").order("id", { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Failed to load</td></tr>`;
    console.error("fetchRentData error:", error);
    toast("Failed to load rent data", { type: "danger" });
    return;
  }

  let list = Array.isArray(data) ? data : [];
  const q = (query || "").toLowerCase().trim();
  if (q) {
    list = list.filter(r => ((r.tenant_name || "") + " " + (r.property_address || "") + " " + (r.status || "")).toLowerCase().includes(q));
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted">No rent records found</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  list.forEach(row => {
    let attachHtml = "";
    if (row.attachment_path) {
      try {
        const url = sb.storage.from(RENT_BUCKET).getPublicUrl(row.attachment_path).data.publicUrl;
        attachHtml = `<a href="${url}" target="_blank" class="link-primary">View</a>`;
      } catch (e) {
        attachHtml = "";
      }
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.tenant_name || ""}</td>
      <td>${row.property_address || ""}</td>
      <td>${row.monthly_rent || ""}</td>
      <td>${row.due_date || ""}</td>
      <td>${row.tenant_contact || ""}</td>
      <td>${row.status || ""}</td>
      <td>${attachHtml}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary btn-edit-rent" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-rent" data-id="${row.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveRent(e) {
  e.preventDefault();

  const editEl = $("rentEditId");
  const isEdit = editEl && editEl.value;

  const tenantNameVal = $("tenantName").value || "";
  const propertyAddressVal = $("propertyAddress").value || "";
  const monthlyRentVal = $("monthlyRent").value || "";
  const rentDueDateVal = $("rentDueDate").value || "";
  const tenantContactVal = $("tenantContact").value || "";

  let attachmentPath = null;
  const fileInput = $("rentAttachment");
  try {
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      attachmentPath = await uploadAttachmentToBucket(fileInput.files[0]);
    }
  } catch (err) {
    console.error("upload error:", err);
    toast("Attachment upload failed", { type: "danger" });
    return;
  }

  const rentRecord = {
    tenant_name: tenantNameVal,
    property_address: propertyAddressVal,
    monthly_rent: monthlyRentVal,
    due_date: rentDueDateVal,
    tenant_contact: tenantContactVal,
    attachment_path: attachmentPath,
  };

  try {
    if (isEdit) {
      const { error } = await sb.from(RENT_TABLE).update(rentRecord).eq("id", editEl.value);
      if (error) throw error;
      toast("Rent updated", { type: "success" });
      editEl.remove();
    } else {
      const { error } = await sb.from(RENT_TABLE).insert([rentRecord]);
      if (error) throw error;
      toast("Rent created", { type: "success" });
    }

    $("rentForm").reset();
    rentModal.hide();
    fetchRentData();
    showPage("rentPage");
  } catch (err) {
    console.error("saveRent error:", err);
    toast("Failed to save rent", { type: "danger" });
  }
}

async function editRent(id) {
  try {
    const { data, error } = await sb.from(RENT_TABLE).select("*").eq("id", id).single();
    if (error) throw error;

    $("tenantName").value = data.tenant_name || "";
    $("propertyAddress").value = data.property_address || "";
    $("monthlyRent").value = data.monthly_rent || "";
    $("rentDueDate").value = data.due_date || "";
    $("tenantContact").value = data.tenant_contact || "";

    let hidden = $("rentEditId");
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "rentEditId";
      $("rentForm").appendChild(hidden);
    }
    hidden.value = id;

    $("rentModalTitle").textContent = "Edit Rent";
    rentModal.show();
  } catch (err) {
    console.error("editRent error:", err);
    toast("Failed to load rent", { type: "danger" });
  }
}

async function deleteRent(id) {
  // reuse delete modal with context
  deleteContext = { table: RENT_TABLE, id };
  $("confirmDeleteText").textContent = "Delete this rent record?";
  confirmDeleteModal.show();
}

/* ---------- Event delegation for edit/delete buttons in tables ---------- */
document.addEventListener("click", (ev) => {
  const target = ev.target;

  // buyer edit
  if (target.matches(".btn-edit-buyer")) {
    const id = target.dataset.id;
    editBuyer(id);
    return;
  }

  // seller edit
  if (target.matches(".btn-edit-seller")) {
    const id = target.dataset.id;
    editSeller(id);
    return;
  }

  // buyer delete
  if (target.matches(".btn-delete-buyer")) {
    const id = target.dataset.id;
    askDelete(BUYER_TABLE, id);
    return;
  }

  // seller delete
  if (target.matches(".btn-delete-seller")) {
    const id = target.dataset.id;
    askDelete(SELLER_TABLE, id);
    return;
  }

  // rent edit
  if (target.matches(".btn-edit-rent")) {
    const id = target.dataset.id;
    editRent(id);
    return;
  }

  // rent delete
  if (target.matches(".btn-delete-rent")) {
    const id = target.dataset.id;
    deleteRent(id);
    return;
  }
});

/* ---------- Confirm delete button ---------- */
$("confirmDeleteBtn").addEventListener("click", confirmDelete);

/* ---------- Form submissions ---------- */
$("buyerForm").addEventListener("submit", saveBuyer);
$("rentForm").addEventListener("submit", saveRent);
$("sellerForm").addEventListener("submit", saveSeller);

/* ---------- Search inputs ---------- */
$("searchBuyer").addEventListener("input", (e) => fetchBuyerData(e.target.value, BUYER_TABLE));
$("searchSeller")?.addEventListener("input", (e) => fetchSellerData(e.target.value, SELLER_TABLE));
$("searchRent")?.addEventListener("input", (e) => fetchRentData(e.target.value));

/* ---------- Nav links (converted from data-target attributes) ---------- */
document.querySelectorAll("[data-target]").forEach(el => {
  el.addEventListener("click", () => {
    const t = el.getAttribute("data-target");
    showPage(t);
  });
});

/* ---------- Header buttons ---------- */
$("btnOpenAddBuyer")?.addEventListener("click", () => {
  // clear form
  $("buyerForm").reset();
  $("buyerRecordId").value = "";
  $("buyerModalTitle").textContent = "Add Buyer";
  buyerModal.show();
});

$("btnOpenAddSeller")?.addEventListener("click", () => {
  // clear form
  $("sellerForm").reset();
  $("sellerRecordId").value = "";
  $("sellerModalTitle").textContent = "Add Seller";
  sellerModal.show();
});

$("btnOpenAddRent")?.addEventListener("click", () => {
  $("rentForm").reset();
  const rentEditId = $("rentEditId");
  if (rentEditId) rentEditId.remove();
  $("rentModalTitle").textContent = "Add Renter";
  rentModal.show();
});

/* Back buttons */
$("btnBackToList")?.addEventListener("click", () => showPage("tablePage"));
$("btnBackToRentList")?.addEventListener("click", () => showPage("rentPage"));

/* ---------- showPage implementation ---------- */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
  const el = document.getElementById(pageId);
  if (el) {
    el.classList.remove("d-none");
    currentView = pageId;
  }
}

/* ---------- initial load ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  // initial fetch
  await fetchBuyerData();
  await fetchSellerData();
  await fetchRentData();

  // default page
  showPage("buyerPage");
  // attach listener on modal hide to reset title and validation states
  buyerModalEl.addEventListener("hidden.bs.modal", () => {
    $("buyerForm").classList.remove("was-validated");
    $("buyerModalTitle").textContent = "Add Buyer";
  });
  buyerModalEl.addEventListener("hidden.bs.modal", () => {
    $("sellerForm").classList.remove("was-validated");
    $("sellerModalTitle").textContent = "Add Seller";
  });
  rentModalEl.addEventListener("hidden.bs.modal", () => {
    $("rentForm").classList.remove("was-validated");
    $("rentModalTitle").textContent = "Add Renter";
  });
});

/* ---------- expose some functions for debugging (optional) ---------- */
window.fetchBuyerData = fetchBuyerData;
window.fetchSellerData = fetchSellerData;
window.fetchRentData = fetchRentData;
