/***********************************************
 * RESTORED script.js – FULL WORKING VERSION
 * Buyer / Seller / Rent / Edit / Delete / WhatsApp / Follow-up colors
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

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);

/* ---------- Toast ---------- */
function toast(msg, type = "primary") {
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

/* =====================================================
   FOLLOW-UP COLOR LOGIC
===================================================== */
function followupClass(dateStr) {
  if (!dateStr) return "";
  const today = new Date(); today.setHours(0,0,0,0);
  const f = new Date(dateStr); f.setHours(0,0,0,0);

  if (f < today) return "table-danger";   // overdue
  if (f.getTime() === today.getTime()) return "table-warning"; // today
  return "table-success"; // future
}

/* =====================================================
   PAGE SWITCHING (CRITICAL – RESTORED)
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
  const tbody = $("buyer-table-body");
  tbody.innerHTML = "";

  const { data } = await sb.from(BUYER_TABLE).select("*").order("id",{ascending:false});

  data.forEach(r => {
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

async function editBuyer(id){
  const { data } = await sb.from(BUYER_TABLE).select("*").eq("id",id).single();
  $("buyerRecordId").value = id;
  $("buyer_name").value = data.name||"";
  $("buyer_phone").value = data.phone||"";
  $("buyer_email").value = data.email||"";
  $("buyer_location").value = data.location||"";
  $("buyer_property").value = data.property||"";
  $("buyer_source").value = data.source||"";
  $("buyer_followUp").value = data.followup||"";
  $("buyer_status").value = data.status||"";
  $("buyer_notes").value = data.notes||"";
  buyerModal.show();
}

$("buyerForm").addEventListener("submit", async e=>{
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
    ? await sb.from(BUYER_TABLE).update(payload).eq("id",id)
    : await sb.from(BUYER_TABLE).insert([payload]);
  buyerModal.hide();
  fetchBuyerData();
});

/* =====================================================
   SELLERS (RESTORED)
===================================================== */
async function fetchSellerData() {
  const tbody = $("seller-table-body");
  tbody.innerHTML = "";

  const { data } = await sb.from(SELLER_TABLE).select("*").order("id",{ascending:false});

  data.forEach(r=>{
    const tr=document.createElement("tr");
    tr.className=followupClass(r.followup);
    tr.innerHTML=`
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
          <button class="btn btn-sm btn-outline-primary btn-edit-seller" data-id="${r.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-seller" data-id="${r.id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function editSeller(id){
  const { data } = await sb.from(SELLER_TABLE).select("*").eq("id",id).single();
  $("sellerRecordId").value=id;
  $("seller_name").value=data.name||"";
  $("seller_phone").value=data.phone||"";
  $("seller_email").value=data.email||"";
  $("seller_location").value=data.location||"";
  $("seller_property").value=data.property||"";
  $("seller_source").value=data.source||"";
  $("seller_followUp").value=data.followup||"";
  $("seller_status").value=data.status||"";
  $("seller_notes").value=data.notes||"";
  sellerModal.show();
}

$("sellerForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=$("sellerRecordId").value;
  const payload={
    name:$("seller_name").value,
    phone:$("seller_phone").value,
    email:$("seller_email").value,
    location:$("seller_location").value,
    property:$("seller_property").value,
    source:$("seller_source").value,
    followup:$("seller_followUp").value||null,
    status:$("seller_status").value,
    notes:$("seller_notes").value
  };
  id
    ? await sb.from(SELLER_TABLE).update(payload).eq("id",id)
    : await sb.from(SELLER_TABLE).insert([payload]);
  sellerModal.hide();
  fetchSellerData();
});

/* =====================================================
   RENT (RESTORED)
===================================================== */
async function fetchRentData(){
  const tbody=$("rent-table-body");
  tbody.innerHTML="";
  const { data }=await sb.from(RENT_TABLE).select("*").order("id",{ascending:false});
  data.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${r.tenant_name||""}</td>
      <td>${r.property_address||""}</td>
      <td>${r.monthly_rent||""}</td>
      <td>${r.due_date||""}</td>
      <td>${r.tenant_contact||""}</td>
      <td>${r.status||""}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-edit-rent" data-id="${r.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger btn-delete-rent" data-id="${r.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* =====================================================
   WHATSAPP + DELETE (GLOBAL)
===================================================== */
document.addEventListener("click",e=>{
  if(e.target.classList.contains("btn-wa")){
    const p=e.target.dataset.phone.replace(/\D/g,"");
    const n=e.target.dataset.name||"Customer";
    window.open(`https://wa.me/60${p}?text=${encodeURIComponent(`Hi ${n}, this is Theenesh from Nesh Property 👋`)}`);
  }
  if(e.target.classList.contains("btn-edit-buyer")) editBuyer(e.target.dataset.id);
  if(e.target.classList.contains("btn-edit-seller")) editSeller(e.target.dataset.id);
  if(e.target.classList.contains("btn-delete-buyer")){deleteContext={table:BUYER_TABLE,id:e.target.dataset.id};confirmDeleteModal.show();}
  if(e.target.classList.contains("btn-delete-seller")){deleteContext={table:SELLER_TABLE,id:e.target.dataset.id};confirmDeleteModal.show();}
});

$("confirmDeleteBtn").addEventListener("click",async()=>{
  await sb.from(deleteContext.table).delete().eq("id",deleteContext.id);
  confirmDeleteModal.hide();
  fetchBuyerData(); fetchSellerData(); fetchRentData();
});

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded",()=>{
  fetchBuyerData();
  fetchSellerData();
  fetchRentData();
  showPage("buyerPage");
});
