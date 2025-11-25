// Supabase Initialization
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";

// Load data
document.addEventListener("DOMContentLoaded", () => {
  fetchData("", BUYER_TABLE);
  fetchData("", SELLER_TABLE);
  fetchRentData?.();
  showPage("tablePage");
});

// Fetch Data
async function fetchData(query = "", table = BUYER_TABLE) {
  let { data, error } = await supabaseClient.from(table).select("*");

  if (error) {
    console.error(error);
    return;
  }

  if (query) {
    data = data.filter(r =>
      (r.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (r.location || "").toLowerCase().includes(query.toLowerCase()) ||
      (r.status || "").toLowerCase().includes(query.toLowerCase())
    );
  }

  const tableBody = table === SELLER_TABLE
    ? document.getElementById("seller-table-body")
    : document.getElementById("data-table-body");

  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="10">No Records Found</td></tr>`;
    return;
  }

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
        <button onclick="editProperty(${row.id}, '${table}')">Edit</button>
        <button onclick="deleteProperty(${row.id}, '${table}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Add or Update record
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const listingType = document.getElementById("listingType").value;
  const selectedTable = listingType === "seller" ? SELLER_TABLE : BUYER_TABLE;

  const formData = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    location: document.getElementById("location").value,
    property: document.getElementById("property").value,
    source: document.getElementById("source").value,
    followup: document.getElementById("followUp").value,
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value
  };

  let error;

  if (recordId.value) {
    ({ error } = await supabaseClient
      .from(selectedTable)
      .update(formData)
      .eq("id", recordId.value));
  } else {
    ({ error } = await supabaseClient.from(selectedTable).insert([formData]));
  }

  if (error) {
    alert("❌ Error saving: " + error.message);
    return;
  }

  recordId.value = "";
  document.getElementById("addForm").reset();
  fetchData("", selectedTable);
  showPage(listingType === "seller" ? "sellerPage" : "tablePage");
});

// Edit record
async function editProperty(id, tableUsed) {
  const { data, error } = await supabaseClient
    .from(tableUsed)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("❌ Error loading: " + error.message);
    return;
  }

  recordId.value = id;
  document.getElementById("name").value = data.name || "";
  document.getElementById("phone").value = data.phone || "";
  document.getElementById("email").value = data.email || "";
  document.getElementById("location").value = data.location || "";
  document.getElementById("property").value = data.property || "";
  document.getElementById("source").value = data.source || "";
  document.getElementById("followUp").value = data.followup || "";
  document.getElementById("status").value = data.status || "";
  document.getElementById("notes").value = data.notes || "";

  listingType.value = tableUsed === SELLER_TABLE ? "seller" : "buyer";
  showPage("formPage");
}

// Delete
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

// Page switcher
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}




