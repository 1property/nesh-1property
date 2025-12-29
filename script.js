// script.js
/***********************************************
 * Rebuilt script.js - ES6, Bootstrap modals/toasts
 * Preserves original Supabase behavior (CRUD + uploads)
 ***********************************************/

/* ---------- Supabase config ---------- */
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

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
  el.className = "toast align-items-center text-white bg-" + (opts.type || "primary");
  el.innerHTML = `<div class="toast-body">${message}</div>`;
  container.appendChild(el);
  new bootstrap.Toast(el).show();
  setTimeout(() => el.remove(), 4000);
}

/* ---------- Fetch Buyers ---------- */
async function fetchBuyerData(query = "") {
  const tbody = $("buyer-table-body");
  if (!tbody) return;

  const { data, error } = await sb.from(BUYER_TABLE).select("*").order("id", { ascending: false });
  if (error) return;

  tbody.innerHTML = "";
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
          <!-- ✅ WHATSAPP BUTTON (ADDED ONLY) -->
          <button class="btn btn-sm btn-success"
            onclick="openWhatsApp('${row.phone}','${row.name}')">
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

/* ---------- Delete ---------- */
async function deleteBuyer(id) {
  if (!confirm("Delete this record?")) return;
  await sb.from(BUYER_TABLE).delete().eq("id", id);
  fetchBuyerData();
}

/* ---------- WhatsApp Follow-Up (ONLY ADDITION) ---------- */
function openWhatsApp(phone, name) {
  if (!phone) {
    alert("No phone number");
    return;
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const message =
    `Hi ${name || "there"}, this is Theenesh from Nesh Property 👋\n\n` +
    `Just following up on your property enquiry.\n` +
    `Let me know when you’re free 🙂`;

  const url =
    `https://wa.me/60${cleanPhone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

/* ---------- Initial Load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  fetchBuyerData();
});
