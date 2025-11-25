/*************************************************************
 *  SUPABASE INITIALIZATION
 *************************************************************/
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";
const RENT_TABLE = "rentinfo";
const RENT_BUCKET = "rent-attachments";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentEditingId = null;


/*************************************************************
 *  FETCH BUYER / SELLER
 *************************************************************/
async function fetchData(query = "", table = BUYER_TABLE) {
  const { data, error } = await supabaseClient
    .from(table)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return alert("❌ Failed to load data: " + error.message);
  }

  let filtered = data;

  if (query) {
    const q = query.toLowerCase();
    filtered = data.filter((row) =>
      (row.name || "").toLowerCase().includes(q) ||
      (row.location || "").toLowerCase().includes(q) ||
      (row.status || "").toLowerCase().includes(q)
    );
  }

  const tableBody =
    table === SELLER_TABLE
      ? document.getElementById("seller-table-body")
      : document.getElementById("data-table-body");

  tableBody.innerHTML = "";

  if (!filtered.length) {
    tableBody.innerHTML = `<tr><td colspan="10">No records found</td></tr>`;
    return;
  }

  filtered.forEach((row) => {
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


/*************************************************************
 *  ADD / EDIT BUYER + SELLER
 *************************************************************/
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const listingType = listingType.value;
  const selectedTable = listingType === "seller" ? SELLER_TABLE : BUYER_TABLE;

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
    ({ error } = await supabaseClient.from(selectedTable).insert([formData]));
  }

  if (error) {
    return alert("❌ Error saving: " + error.message);
  }

  document.getElementById("addForm").reset();
  fetchData("", selectedTable);
  showPage(selectedTable === SELLER_TABLE ? "sellerPage" : "tablePage");
});


/*************************************************************
 *  EDIT BUYER/SELLER
 *************************************************************/
async function editProperty(id, tableUsed) {
  const { data, error } = await supabaseClient
    .from(tableUsed)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return alert("❌ Error loading record");

  name.value = data.name;
  phone.value = data.phone;
  email.value = data.email;
  location.value = data.location;
  property.value = data.property;
  source.value = data.source;
  followUp.value = data.followup;
  status.value = data.status;
  notes.value = data.notes;

  listingType.value = tableUsed === SELLER_TABLE ? "seller" : "buyer";

  currentEditingId = id;
  showPage("formPage");
}


/*************************************************************
 *  DELETE BUYER/SELLER
 *************************************************************/
async function deleteProperty(id, tableUsed) {
  if (!confirm("Delete this record?")) return;

  const { error } = await supabaseClient.from(tableUsed).delete().eq("id", id);

  if (error) return alert("❌ Error deleting");

  fetchData("", tableUsed);
}


/*************************************************************
 * SEARCH
 *************************************************************/
function searchProperties() {
  fetchData(searchInput.value, BUYER_TABLE);
}


/*************************************************************
 * PAGE SWITCH
 *************************************************************/
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  document.getElementById(pageId).style.display = "block";
}


/*************************************************************
 * INITIAL LOAD
 *************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  fetchData("", SELLER_TABLE);
  fetchRentData();
  showPage("tablePage");
});


/*************************************************************
 * RENT SECTION
 *************************************************************/
async function fetchRentData() {
  const tbody = document.getElementById("rent-table-body");
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from(RENT_TABLE)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    tbody.innerHTML = "<tr><td colspan='8'>Failed to load rent data</td></tr>";
    return;
  }

  if (!data.length) {
    tbody.innerHTML = "<tr><td colspan='8'>No rent records found</td></tr>";
    return;
  }

  tbody.innerHTML = "";

  data.forEach((row) => {
    let due = row.due_date || row.rent_due_date || "";

    let attachmentHtml = "";
    if (row.attachment_path) {
      const url = supabaseClient.storage
        .from(RENT_BUCKET)
        .getPublicUrl(row.attachment_path).data.publicUrl;
      attachmentHtml = `<a href="${url}" target="_blank">View</a>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.tenant_name || ""}</td>
      <td>${row.property_address || ""}</td>
      <td>${row.monthly_rent || ""}</td>
      <td>${due}</td>
      <td>${row.tenant_contact || ""}</td>
      <td>${row.status || ""}</td>
      <td>${attachmentHtml}</td>
      <td>
        <button onclick="editRent(${row.id})">Edit</button>
        <button onclick="deleteRent(${row.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


/*************************************************************
 * ADD / UPDATE RENT
 *************************************************************/
document.getElementById("rentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const tenantNameVal = document.getElementById("tenantName").value;
  const propertyAddressVal = document.getElementById("propertyAddress").value;
  const monthlyRentVal = document.getElementById("monthlyRent").value;
  const rentDueDateVal = document.getElementById("rentDueDate").value;
  const tenantContactVal = document.getElementById("tenantContact").value;

  let attachmentPath = null;
  const fileInput = document.getElementById("rentAttachment");

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const safeName =
      "rent_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

    const upload = await supabaseClient.storage
      .from(RENT_BUCKET)
      .upload(safeName, file);

    if (upload.error) {
      return alert("❌ Failed to upload attachment");
    }

    attachmentPath = upload.data.path;
  }

  const rentRecord = {
    tenant_name: tenantNameVal,
    property_address: propertyAddressVal,
    monthly_rent: monthlyRentVal,
    due_date: rentDueDateVal,
    tenant_contact: tenantContactVal,
    attachment_path: attachmentPath,
  };

  const editEl = document.getElementById("rentEditId");

  if (editEl && editEl.value) {
    const { error } = await supabaseClient
      .from(RENT_TABLE)
      .update(rentRecord)
      .eq("id", editEl.value);

    if (error) return alert("❌ Failed to update rent");

    editEl.remove();
  } else {
    const { error } = await supabaseClient
      .from(RENT_TABLE)
      .insert([rentRecord]);

    if (error) return alert("❌ Failed to save rent");
  }

  document.getElementById("rentForm").reset();
  fetchRentData();
  showPage("rentPage");
});


/*************************************************************
 * EDIT RENT
 *************************************************************/
async function editRent(id) {
  const { data, error } = await supabaseClient
    .from(RENT_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return alert("❌ Failed to load rent record");

  document.getElementById("tenantName").value = data.tenant_name;
  document.getElementById("propertyAddress").value = data.property_address;
  document.getElementById("monthlyRent").value = data.monthly_rent;
  document.getElementById("rentDueDate").value = data.due_date;
  document.getElementById("tenantContact").value = data.tenant_contact;

  let hidden = document.getElementById("rentEditId");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = "rentEditId";
    document.getElementById("rentForm").appendChild(hidden);
  }
  hidden.value = id;

  showPage("addRentPage");
}


/*************************************************************
 * DELETE RENT
 *************************************************************/
async function deleteRent(id) {
  if (!confirm("Delete this rent record?")) return;

  const { error } = await supabaseClient
    .from(RENT_TABLE)
    .delete()
    .eq("id", id);

  if (error) return alert("❌ Failed to delete rent");

  fetchRentData();
}






