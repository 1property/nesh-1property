/***********************************************
 * script.js – FINAL (Buyer + Seller + WhatsApp)
 ***********************************************/

/* ---------- Supabase config ---------- */
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentEditingId = null;

/* ---------- WhatsApp Follow-Up ---------- */
function sendWhatsApp(phone, name, location, property) {
  if (!phone) {
    alert("Phone number not available");
    return;
  }

  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "60" + cleanPhone.slice(1);
  }

  const message = `
Hi ${name || ""},
This is Theenesh from 1Property.

Just following up regarding:
📍 Location: ${location || ""}
🏠 Property: ${property || ""}

Let me know if you're interested 🙂
  `.trim();

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ---------- FETCH DATA ---------- */
async function fetchData(query = "", table = BUYER_TABLE) {
  let { data, error } = await supabaseClient.from(table).select("*");

  if (error) {
    alert("❌ Failed to load data: " + error.message);
    return;
  }

  if (query) {
    data = data.filter((row) =>
      (row.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (row.location || "").toLowerCase().includes(query.toLowerCase()) ||
      (row.status || "").toLowerCase().includes(query.toLowerCase())
    );
  }

  const tableBody =
    table === SELLER_TABLE
      ? document.getElementById("seller-table-body")
      : document.getElementById("data-table-body");

  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="10">No records found</td></tr>`;
    return;
  }

  data.forEach((row) => {
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
        <button onclick="editProperty(${row.id}, '${table}')">Edit</button>
        <button onclick="deleteProperty(${row.id}, '${table}')">Delete</button>
        <button style="background:#25D366;color:white;border:none;padding:4px 8px"
          onclick="sendWhatsApp(
            '${row.phone || ""}',
            '${row.name || ""}',
            '${row.location || ""}',
            '${row.property || ""}'
          )">
          WhatsApp
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

/* ---------- ADD / UPDATE ---------- */
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const listingType = document.getElementById("listingType").value;
  const selectedTable =
    listingType === "seller" ? SELLER_TABLE : BUYER_TABLE;

  const formData = {
    name: name.value,
    phone: phone.value,
    email: email.value,
    location: location.value,
    property: property.value,
    source: source.value,
    followup: followUp.value,
    status: status.value,
    notes: notes.value,
  };

  let error;

  if (currentEditingId) {
    ({ error } = await supabaseClient
      .from(selectedTable)
      .update(formData)
      .eq("id", currentEditingId));
    currentEditingId = null;
  } else {
    ({ error } = await supabaseClient
      .from(selectedTable)
      .insert([formData]));
  }

  if (error) {
    alert("❌ Error saving record: " + error.message);
    return;
  }

  document.getElementById("addForm").reset();

  if (listingType === "seller") {
    fetchData("", SELLER_TABLE);
    showPage("sellerPage");
  } else {
    fetchData("", BUYER_TABLE);
    showPage("tablePage");
  }
});

/* ---------- EDIT ---------- */
async function editProperty(id, tableUsed) {
  const { data, error } = await supabaseClient
    .from(tableUsed)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("❌ Error loading record: " + error.message);
    return;
  }

  name.value = data.name || "";
  phone.value = data.phone || "";
  email.value = data.email || "";
  location.value = data.location || "";
  property.value = data.property || "";
  source.value = data.source || "";
  followUp.value = data.followup || "";
  status.value = data.status || "";
  notes.value = data.notes || "";

  listingType.value = tableUsed === SELLER_TABLE ? "seller" : "buyer";

  currentEditingId = id;
  showPage("formPage");
}

/* ---------- DELETE ---------- */
async function deleteProperty(id, tableUsed) {
  if (!confirm("Delete this record?")) return;

  const { error } = await supabaseClient
    .from(tableUsed)
    .delete()
    .eq("id", id);

  if (error) {
    alert("❌ Error deleting: " + error.message);
    return;
  }

  fetchData("", tableUsed);
}

/* ---------- SEARCH ---------- */
function searchProperties() {
  fetchData(searchInput.value, BUYER_TABLE);
}

/* ---------- PAGE SWITCH ---------- */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => {
    p.style.display = "none";
  });
  document.getElementById(pageId).style.display = "block";
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  fetchData("", SELLER_TABLE);
  showPage("tablePage");
});

/* ---------- expose ---------- */
window.sendWhatsApp = sendWhatsApp;
