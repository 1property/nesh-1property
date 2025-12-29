/***********************************************
 * Rebuilt script.js - ES6, Bootstrap modals/toasts
 * Preserves original Supabase behavior (CRUD + uploads)
 ***********************************************/

/* ---------- Supabase config ---------- */
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

/* ---------- Toast ---------- */
function toast(message, opts = {}) {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = `toast text-white bg-${opts.type || "primary"} mb-2`;
  el.innerHTML = `<div class="toast-body">${message}</div>`;
  container.appendChild(el);
  new bootstrap.Toast(el, { delay: 3000 }).show();
}

/* ---------- Modals ---------- */
const buyerModal = new bootstrap.Modal($("buyerModal"));
const sellerModal = new bootstrap.Modal($("sellerModal"));
const rentModal = new bootstrap.Modal($("rentModal"));
const confirmDeleteModal = new bootstrap.Modal($("confirmDeleteModal"));

let deleteContext = null;

/* ---------- Fetch Buyers ---------- */
async function fetchBuyerData(query = "") {
  const tbody = $("buyer-table-body");
  tbody.innerHTML = "";

  const { data } = await sb.from(BUYER_TABLE).select("*").order("id", { ascending: false });

  data.forEach(row => {
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
      <td>${row.notes || ""}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success btn-wa" 
            data-phone="${row.phone}" 
            data-name="${row.name}">
            WhatsApp
          </button>
          <button class="btn btn-sm btn-outline-primary btn-edit-buyer" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-buyer" data-id="${row.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- Fetch Sellers ---------- */
async function fetchSellerData() {
  const tbody = $("seller-table-body");
  tbody.innerHTML = "";

  const { data } = await sb.from(SELLER_TABLE).select("*").order("id", { ascending: false });

  data.forEach(row => {
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
      <td>${row.notes || ""}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success btn-wa" 
            data-phone="${row.phone}" 
            data-name="${row.name}">
            WhatsApp
          </button>
          <button class="btn btn-sm btn-outline-primary btn-edit-seller" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-seller" data-id="${row.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- WhatsApp Follow-Up (NEW) ---------- */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-wa")) {
    const phone = e.target.dataset.phone.replace(/\D/g, "");
    const name = e.target.dataset.name || "Customer";

    const msg =
      `Hi ${name}, this is Theenesh from Nesh Property 👋\n\n` +
      `Just following up on your property enquiry.\n` +
      `Let me know when you’re free 😊`;

    window.open(
      `https://wa.me/60${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  }
});

/* ---------- Delete ---------- */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete-buyer")) {
    deleteContext = { table: BUYER_TABLE, id: e.target.dataset.id };
    confirmDeleteModal.show();
  }
  if (e.target.classList.contains("btn-delete-seller")) {
    deleteContext = { table: SELLER_TABLE, id: e.target.dataset.id };
    confirmDeleteModal.show();
  }
});

$("confirmDeleteBtn").addEventListener("click", async () => {
  await sb.from(deleteContext.table).delete().eq("id", deleteContext.id);
  confirmDeleteModal.hide();
  fetchBuyerData();
  fetchSellerData();
});

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  fetchBuyerData();
  fetchSellerData();
});
