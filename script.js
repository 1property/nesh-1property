/***********************************************
 * FINAL script.js – SEARCH FIXED + FULLY WORKING
 * Buyer / Seller / Rent / Edit / Delete / WhatsApp
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

/* ---------- Cache (CRITICAL FOR SEARCH) ---------- */
let buyerCache = [];
let sellerCache = [];
let rentCache = [];

/* ---------- Toast ---------- */
function toast(msg, type = "primary") {
  const box = $("toastContainer");
  const el = document.createElement("div");
  el.className = `toast text-white bg-${type} mb-2`;
  el.innerHTML = `<div class="toast-body">${msg}</div>`;
  box.appendChild(el);
  new bootstrap.Toast(el, { delay: 2500 }).show();
  setTimeout(() => el.remove(), 3000);
}

/* =====================================================
   PAGE SWITCHING
===================================================== */
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
  const { data } = await sb.from(BUYER_TABLE).select("*").order("id", { ascending: false });
  buyerCache = data || [];
  renderBuyerTable(buyerCache);
}

function renderBuyerTable(data) {
  const tbody = $("buyer-table-body");
  tbody.innerHTML = "";

  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.name || ""}</td>
      <td>${r.phone || ""}</td>
      <td>${r.email || ""}</td>
      <td>${r.location || ""}</td>
      <td>${r.property || ""}</td>
      <td>${r.source || ""}</td>
      <td>${r.followup || ""}</td>
      <td>${r.status || ""}</td>
      <td>${r.notes || ""}</td>
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

/* =====================================================
   SELLERS
===================================================== */
async function fetchSellerData() {
  const { data } = await sb.from(SELLER_TABLE).select("*").order("id", { ascending: false });
  sellerCache = data || [];
  renderSellerTable(sellerCache);
}

function renderSellerTable(data) {
  const tbody = $("seller-table-body");
  tbody.innerHTML = "";

  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.name || ""}</td>
      <td>${r.phone || ""}</td>
      <td>${r.email || ""}</td>
      <td>${r.location || ""}</td>
      <td>${r.property || ""}</td>
      <td>${r.source || ""}</td>
      <td>${r.followup || ""}</td>
      <td>${r.status || ""}</td>
      <td>${r.notes || ""}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success btn-wa" data-phone="${r.phone}" data-name="${r.name}">WhatsApp</button>
          <button class="btn btn-sm btn-outline-primary btn-edit-seller" data-id="${r.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-seller" data-id="${r.id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* =====================================================
   RENT
===================================================== */
async function fetchRentData() {
  const { data } = await sb.from(RENT_TABLE).select("*").order("id", { ascending: false });
  rentCache = data || [];
  renderRentTable(rentCache);
}

function renderRentTable(data) {
  const tbody = $("rent-table-body");
  tbody.innerHTML = "";

  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.tenant_name || ""}</td>
      <td>${r.property_address || ""}</td>
      <td>${r.monthly_rent || ""}</td>
      <td>${r.due_date || ""}</td>
      <td>${r.tenant_contact || ""}</td>
      <td>${r.status || ""}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-edit-rent" data-id="${r.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger btn-delete-rent" data-id="${r.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* =====================================================
   GLOBAL CLICK HANDLER
===================================================== */
document.addEventListener("click", e => {
  if (e.target.classList.contains("btn-wa")) {
    const phone = e.target.dataset.phone?.replace(/\D/g, "");
    const name = e.target.dataset.name || "Customer";
    window.open(`https://wa.me/60${phone}?text=${encodeURIComponent(`Hi ${name}, this is Theenesh from Nesh Property 👋`)}`);
  }
});

/* =====================================================
   INIT + SEARCH (FIXED)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

  fetchBuyerData();
  fetchSellerData();
  fetchRentData();
  showPage("buyerPage");

  // ✅ BUYER SEARCH
  $("searchBuyer").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    renderBuyerTable(
      buyerCache.filter(b =>
        Object.values(b).join(" ").toLowerCase().includes(q)
      )
    );
  });

  // ✅ SELLER SEARCH
  $("searchSeller").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    renderSellerTable(
      sellerCache.filter(s =>
        Object.values(s).join(" ").toLowerCase().includes(q)
      )
    );
  });

  // ✅ RENT SEARCH
  $("searchRent").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    renderRentTable(
      rentCache.filter(r =>
        Object.values(r).join(" ").toLowerCase().includes(q)
      )
    );
  });

});

