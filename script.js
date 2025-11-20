// Supabase Initialization
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";
// Rent table name (ensure this exists in your Supabase project)
const RENT_TABLE = "rentinfo";
// Storage bucket where rent attachments are stored
const RENT_BUCKET = "rent-attachments";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentEditingId = null;

// FETCH DATA (BUYER or SELLER)
async function fetchData(query = "", table = BUYER_TABLE) {
  let { data, error } = await supabaseClient.from(table).select("*");

  if (error) {
    alert("❌ Failed to load data: " + error.message);
    return;
  }

  // Search filter
  if (query) {
    data = data.filter((row) =>
      row.name.toLowerCase().includes(query.toLowerCase()) ||
      row.location.toLowerCase().includes(query.toLowerCase()) ||
      row.status.toLowerCase().includes(query.toLowerCase())
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
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.email}</td>
      <td>${row.location}</td>
      <td>${row.property}</td>
      <td>${row.source}</td>
      <td>${row.followup || ""}</td>
      <td>${row.status}</td>
      <td>${row.notes}</td>
      <td>
        <button onclick="editProperty(${row.id}, '${table}')">Edit</button>
        <button onclick="deleteProperty(${row.id}, '${table}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// ADD OR UPDATE RECORD
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const listingType = document.getElementById("listingType").value;
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
    alert("❌ Error saving record: " + error.message);
    return;
  }

  resetForm();
  fetchData("", selectedTable);
  showPage(listingType === "seller" ? "sellerPage" : "tablePage");
});

// RESET FORM
function resetForm() {
  document.getElementById("addForm").reset();
}

// EDIT RECORD
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

  name.value = data.name;
  phone.value = data.phone;
  email.value = data.email;
  location.value = data.location;
  property.value = data.property;
  source.value = data.source;
  followUp.value = data.followup || "";
  status.value = data.status;
  notes.value = data.notes;

  listingType.value = tableUsed === SELLER_TABLE ? "seller" : "buyer";

  currentEditingId = id;
  showPage("formPage");
}

// DELETE
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

// SEARCH
function searchProperties() {
  fetchData(searchInput.value, BUYER_TABLE);
}

// PAGE SWITCHER
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  document.getElementById(pageId).style.display = "block";
}

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  fetchData("", SELLER_TABLE);
  // load rent records into the rent table view
  fetchRentData();
  showPage("tablePage");
});

// Fetch rent records and render into #rent-table-body
async function fetchRentData() {
  const tbody = document.getElementById("rent-table-body");
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from(RENT_TABLE)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Failed to load rent data:", error.message);
    tbody.innerHTML = '<tr><td colspan="8">Failed to load rent data.</td></tr>';
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No rent records found.</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  data.forEach((row) => {
    const tr = document.createElement('tr');

    // Format date if present
    let due = row.due_date || row.rent_due_date || '';

    // Attachment handling: try to build a public URL from storage
    let attachmentHtml = '';
    if (row.attachment_path) {
      try {
        const res = supabaseClient.storage.from(RENT_BUCKET).getPublicUrl(row.attachment_path);
        const publicUrl = res?.data?.publicUrl || res?.publicURL || '';
        if (publicUrl) {
          attachmentHtml = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer">View</a>`;
        } else {
          attachmentHtml = 'Stored';
        }
      } catch (e) {
        attachmentHtml = '';
      }
    }

    tr.innerHTML = `
      <td>${row.tenant_name || ''}</td>
      <td>${row.property_address || row.property || ''}</td>
      <td>${row.monthly_rent || ''}</td>
      <td>${due}</td>
      <td>${row.tenant_contact || ''}</td>
      <td>${row.status || ''}</td>
      <td>${attachmentHtml}</td>
      <td>
        <button onclick="editRent(${row.id})">Edit</button>
        <button onclick="deleteRent(${row.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Handle rent form submission: insert or update rent record and upload attachment
document.getElementById('rentForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const tenantName = document.getElementById('tenantName')?.value || '';
  const propertyAddress = document.getElementById('propertyAddress')?.value || '';
  const monthlyRent = document.getElementById('monthlyRent')?.value || '';
  const rentDueDate = document.getElementById('rentDueDate')?.value || '';
  const tenantContact = document.getElementById('tenantContact')?.value || '';
  const fileInput = document.getElementById('rentAttachment');

  let attachmentPath = null;

  // If a file is selected, upload to storage
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = `rent_${Date.now()}_${safeName}`;
    try {
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from(RENT_BUCKET)
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        alert('❌ File upload failed: ' + uploadError.message);
        return;
      }

      attachmentPath = uploadData?.path || filePath;
    } catch (err) {
      alert('❌ File upload exception: ' + err.message);
      return;
    }
  }

  const rentRecord = {
    tenant_name: tenantName,
    property_address: propertyAddress,
    monthly_rent: monthlyRent,
    due_date: rentDueDate,
    tenant_contact: tenantContact,
  };
  if (attachmentPath) rentRecord.attachment_path = attachmentPath;

  // Check if editing
  const editIdEl = document.getElementById('rentEditId');
  if (editIdEl && editIdEl.value) {
    const id = editIdEl.value;
    const { error } = await supabaseClient.from(RENT_TABLE).update(rentRecord).eq('id', id);
    if (error) {
      alert('❌ Failed to update rent record: ' + error.message);
      return;
    }
    alert('✅ Rent record updated');
    // remove edit id
    editIdEl.remove();
  } else {
    const { error } = await supabaseClient.from(RENT_TABLE).insert([rentRecord]);
    if (error) {
      alert('❌ Failed to save rent record: ' + error.message);
      return;
    }
    alert('✅ Rent record saved');
  }

  // reset form and refresh list
  document.getElementById('rentForm').reset();
  fetchRentData();
  showPage('rentPage');
});

// Edit rent record - loads data into rent form and shows the add/edit page
async function editRent(id) {
  const { data, error } = await supabaseClient.from(RENT_TABLE).select('*').eq('id', id).single();
  if (error) {
    alert('❌ Failed to load rent record: ' + error.message);
    return;
  }

  // Populate fields (assumes form fields exist on the Add Rent page)
  document.getElementById('tenantName').value = data.tenant_name || '';
  document.getElementById('propertyAddress').value = data.property_address || data.property || '';
  document.getElementById('monthlyRent').value = data.monthly_rent || '';
  document.getElementById('rentDueDate').value = data.due_date || data.rent_due_date || '';
  document.getElementById('tenantContact').value = data.tenant_contact || '';

  // store editing id in a hidden field for form submit handling (create if missing)
  let hidden = document.getElementById('rentEditId');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'rentEditId';
    document.getElementById('rentForm').appendChild(hidden);
  }
  hidden.value = id;

  showPage('addRentPage');
}

// Delete rent record
async function deleteRent(id) {
  if (!confirm('Are you sure you want to delete this rent record?')) return;
  const { error } = await supabaseClient.from(RENT_TABLE).delete().eq('id', id);
  if (error) {
    alert('❌ Failed to delete rent record: ' + error.message);
    return;
  }
  alert('✅ Rent record deleted');
  fetchRentData();
}


