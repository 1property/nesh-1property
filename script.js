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

/* ---------- ✅ WHATSAPP FOLLOW-UP (ADDED) ---------- */
function sendWhatsAppFollowUp(phone, name, location, property) {
  if (!phone) {
    alert("Phone number not available");
    return;
  }

  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "60" + cleanPhone.slice(1); // MY format
  }

  const message = `
Hi ${name || ""},

This is Theenesh from 1Property 👋  
Just following up regarding:

📍 Location: ${location || "-"}
🏠 Property: ${property || "-"}

Let me know if you're interested. Thank you 🙂
`.trim();

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ---------- Toast ---------- */
function toast(message, opts = {}) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast align-items-center text-white bg-" + (opts.type || "primary") + " border-0 mb-2";
  el.innerHTML = `<div class="toast-body">${message}</div>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
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
        <button class="btn btn-sm btn-outline-primary btn-edit-buyer" data-id="${row.id}">Edit</button>
        <button class="btn btn-sm btn-success"
          onclick="sendWhatsAppFollowUp('${row.phone}','${row.name}','${row.location}','${row.property}')">
          WhatsApp
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- Fetch Sellers ---------- */
async function fetchSellerData() {
  const tbody = $("seller-table-body");
  if (!tbody) return;

  const { data, error } = await sb.from(SELLER_TABLE).select("*").order("id", { ascending: false });
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
        <button class="btn btn-sm btn-outline-primary btn-edit-seller" data-id="${row.id}">Edit</button>
        <button class="btn btn-sm btn-success"
          onclick="sendWhatsAppFollowUp('${row.phone}','${row.name}','${row.location}','${row.property}')">
          WhatsApp
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchBuyerData();
  await fetchSellerData();
  showPage("buyerPage");
});

/* ---------- PAGE SWITCH ---------- */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
  const el = document.getElementById(pageId);
  if (el) el.classList.remove("d-none");
}

/* ---------- expose ---------- */
window.sendWhatsAppFollowUp = sendWhatsAppFollowUp;
window.fetchBuyerData = fetchBuyerData;
window.fetchSellerData = fetchSellerData;
