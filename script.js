/***********************************************
 * FINAL WORKING script.js
 * Buyer / Seller / Rent / Search / Edit / Delete / WhatsApp
 ***********************************************/

/* ---------- Supabase config ---------- */
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";
const RENT_TABLE = "rentinfo";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);

/* ---------- Toast ---------- */
function toast(msg, type = "success") {
  const box = $("toastContainer");
  const el = document.createElement("div");
  el.className = `toast text-white bg-${type} mb-2`;
  el.innerHTML = `<div class="toast-body">${msg}</div>`;
  box.appendChild(el);
  new bootstrap.Toast(el, { delay: 3000 }).show();
  setTimeout(() => el.remove(), 3500);
}

/* ---------- Modals ---------- */
const buyerModal = new bootstrap.Modal($("buyerModal"));
const sellerModal = new bootstrap.Modal($("sellerModal"));
const rentModal = new bootstrap.Modal($("rentModal"));
const confirmDeleteModal = new bootstrap.Modal($("confirmDeleteModal"));

let deleteContext = null;

/* ---------- Follow-up coloring ---------- */
function followupClass(dateStr) {
  if (!dateStr) return "";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  if (d < today) return "table-danger";
  if (d.getTime() === today.getTime()) return "table-warning";
  return "table-success";
}

/* ---------- Page switching ---------- */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
  $(id).classList.remove("d-none");
}

document.querySelectorAll("[data-target]").forEach(el => {
  el.addEventListener("click", () => showPage(el.dataset.target));
});

/* =====================================================
   BUYERS
===================================================== */
async function fetchBuyerData() {
  const tbody = $("buyer-table-body");
  tbody.innerHTML = "";

  const search = $("searchBuyer").value.toLowerCase();
  const { data } = await sb.from(BUYER_TABLE).select("*").order("id",{ascending:false});

  data.filter(r =>
    r.name?.toLowerCase().includes(search) ||
    r.phone?.includes(search) ||
    r.location?.toLowerCase().includes(search)
  ).forEach(r => {
    const tr = document.createElement("tr");
    tr.className = followupClass(r.followup);
    tr.innerHTML = `
      <td>${r.name||""}</td>
      <td>${r.phone||""}</td>
      <td>${r.email||""}</td>
      <td>${r.location||""}</td>
      <td>${r.property||""}</td>
      <td>${r.source||""}</td>
      <td>${r.followup||""}</td>
      <td>${r.status||""}</td>
      <td>${r.notes||""}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success btn-wa" data-phone="${r.phone}" data-name="${r.name}">WhatsApp</button>
          <button class="btn btn-sm btn-outline-primary btn-edit-buyer" data-id="${r.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-buyer" data-id="${r.id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Add / Edit Buyer ---------- */
$("btnOpenAddBuyer").addEventListener("click", () => {
  $("buyerForm").reset();
  $("buyerRecordId").value = "";
  buyerModal.show();
});

$("buyerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("buyerRecordId").value;

  const payload = {
    name: $("buyer_name").value,
    phone: $("buyer_phone").value,
    email: $("buyer_email").value,
    location: $("buyer_location").value,
    property: $("buyer_property").value,
    source: $("buyer_source").value,
    followup: $("buyer_followUp").value || null,
    status: $("buyer_status").value,
    notes: $("buyer_notes").value
  };

  id
    ? await sb.from(BUYER_TABLE).update(payload).eq("id", id)
    : await sb.from(BUYER_TABLE).insert([payload]);

  buyerModal.hide();
  fetchBuyerData();
  toast("Buyer saved");
});

/* =====================================================
   SELLERS
===================================================== */
async function fetchSellerData() {
  const tbody = $("seller-table-body");
  tbody.innerHTML = "";

  const search = $("searchSeller").value.toLowerCase();
  const { data } = await sb.from(SELLER_TABLE).select("*").order("id",{ascending:false});

  data.filter(r =>
    r.name?.toLowerCase().includes(search) ||
    r.phone?.includes(search)
  ).forEach(r => {
    const tr = document.createElement("tr");
    tr.className = followupClass(r.followup);
    tr.innerHTML = `
      <td>${r.name||""}</td>
      <td>${r.phone||""}</td>
      <td>${r.email||""}</td>
      <td>${r.location||""}</td>
      <td>${r.property||""}</td>
      <td>${r.source||""}</td>
      <td>${r.followup||""}</td>
      <td>${r.status||""}</td>
      <td>${r.notes||""}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-edit-seller" data-id="${r.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger btn-delete-seller" data-id="${r.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

$("btnOpenAddSeller").addEventListener("click", () => {
  $("sellerForm").reset();
  $("sellerRecordId").value = "";
  sellerModal.show();
});

$("sellerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("sellerRecordId").value;

  const payload = {
    name: $("seller_name").value,
    phone: $("seller_phone").value,
    email: $("seller_email").value,
    location: $("seller_location").value,
    property: $("seller_property").value,
    source: $("seller_source").value,
    followup: $("seller_followUp").value || null,
    status: $("seller_status").value,
    notes: $("seller_notes").value
  };

  id
    ? await sb.from(SELLER_TABLE).update(payload).eq("id", id)
    : await sb.from(SELLER_TABLE).insert([payload]);

  sellerModal.hide();
  fetchSellerData();
  toast("Seller saved");
});

/* =====================================================
   RENT
===================================================== */
async function fetchRentData() {
  const tbody = $("rent-table-body");
  tbody.innerHTML = "";

  const search = $("searchRent").value.toLowerCase();
  const { data } = await sb.from(RENT_TABLE).select("*").order("id",{ascending:false});

  data.filter(r =>
    r.tenant_name?.toLowerCase().includes(search) ||
    r.property_address?.toLowerCase().includes(search)
  ).forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.tenant_name||""}</td>
      <td>${r.property_address||""}</td>
      <td>${r.monthly_rent||""}</td>
      <td>${r.due_date||""}</td>
      <td>${r.tenant_contact||""}</td>
      <td>${r.status||""}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-delete-rent" data-id="${r.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

$("btnOpenAddRent").addEventListener("click", () => {
  $("rentForm").reset();
  $("rentEditId").value = "";
  rentModal.show();
});

$("rentForm").addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    tenant_name: $("tenantName").value,
    property_address: $("propertyAddress").value,
    monthly_rent: $("monthlyRent").value,
    due_date: $("rentDueDate").value,
    tenant_contact: $("tenantContact").value,
    status: "Active"
  };

  await sb.from(RENT_TABLE).insert([payload]);
  rentModal.hide();
  fetchRentData();
  toast("Rent saved");
});

/* =====================================================
   GLOBAL CLICK HANDLER
===================================================== */
document.addEventListener("click", e => {
  if (e.target.classList.contains("btn-wa")) {
    const p = e.target.dataset.phone.replace(/\D/g,"");
    const n = e.target.dataset.name || "Customer";
    window.open(`https://wa.me/60${p}?text=${encodeURIComponent(`Hi ${n}, this is Theenesh from Nesh Property 👋`)}`);
  }

  if (e.target.classList.contains("btn-delete-buyer"))
    deleteContext = { table: BUYER_TABLE, id: e.target.dataset.id }, confirmDeleteModal.show();

  if (e.target.classList.contains("btn-delete-seller"))
    deleteContext = { table: SELLER_TABLE, id: e.target.dataset.id }, confirmDeleteModal.show();

  if (e.target.classList.contains("btn-delete-rent"))
    deleteContext = { table: RENT_TABLE, id: e.target.dataset.id }, confirmDeleteModal.show();
});

$("confirmDeleteBtn").addEventListener("click", async () => {
  await sb.from(deleteContext.table).delete().eq("id", deleteContext.id);
  confirmDeleteModal.hide();
  fetchBuyerData(); fetchSellerData(); fetchRentData();
});

/* ---------- Search listeners ---------- */
$("searchBuyer").addEventListener("input", fetchBuyerData);
$("searchSeller").addEventListener("input", fetchSellerData);
$("searchRent").addEventListener("input", fetchRentData);

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  fetchBuyerData();
  fetchSellerData();
  fetchRentData();
  showPage("buyerPage");
});
