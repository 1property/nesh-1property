// Supabase Initialization
const SUPABASE_URL = 'https://erabbaphqueanoddsoqh.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4';
const tableName = 'callproperty';
const sellerTable = 'sellers';
// Rent table and storage bucket used for rent attachments
const rentTable = 'rentinfo';
const RENT_BUCKET = 'rent-attachments';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentEditingId = null; // Track the current editing ID

// Fetch data from Supabase and populate the table
async function fetchData(query = '', table = tableName) {
  let { data, error } = await supabaseClient.from(table).select('*');

  if (error) {
    alert('❌ Failed to load data: ' + error.message);
    return;
  }

  if (query) {
    // Filter the data based on the search query
    data = data.filter((row) => {
      return (
        row.name.toLowerCase().includes(query.toLowerCase()) ||
        row.location.toLowerCase().includes(query.toLowerCase()) ||
        row.status.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  const tableBody =
    table === sellerTable
      ? document.getElementById('seller-table-body')
      : document.getElementById('data-table-body');

  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (data.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="10">No matching properties found.</td></tr>';
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.email}</td>
      <td>${row.location}</td>
      <td>${row.property}</td>
      <td>${row.source}</td>
      <td>${row.followup || ''}</td>
      <td>${row.status}</td>
      <td>${row.notes}</td>
      <td>${row.followup || ''}</td>
      <td>
        <button class="edit" onclick="editProperty(${row.id}, '${table}')">Edit</button>
        <button class="delete" onclick="deleteProperty(${row.id}, '${table}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// ✅ Handle form submission for both adding and updating properties (Buyer/Seller)
document
  .getElementById('addForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const listingType = document.getElementById('listingType').value; // buyer or seller
    const selectedTable =
      listingType === 'seller' ? sellerTable : tableName;

    const formData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      location: document.getElementById('location').value,
      property: document.getElementById('property').value,
      source: document.getElementById('source').value,
      followup: document.getElementById('followUp').value,
      status: document.getElementById('status').value,
      notes: document.getElementById('notes').value,
    };

    let error;

    if (currentEditingId) {
      // Update existing record
      ({ error } = await supabaseClient
        .from(selectedTable)
        .update(formData)
        .eq('id', currentEditingId));
      if (!error) {
        alert(
          `✅ ${
            listingType === 'seller' ? 'Seller' : 'Buyer'
          } updated successfully!`
        );
      }
      currentEditingId = null;
    } else {
      // Insert new record
      ({ error } = await supabaseClient
        .from(selectedTable)
        .insert([formData]));
      if (!error) {
        alert(
          `✅ ${
            listingType === 'seller' ? 'Seller' : 'Buyer'
          } added successfully!`
        );
      }
    }

    if (error) {
      alert('❌ Error saving record: ' + error.message);
    }

    resetForm();
    if (listingType === 'seller') {
      fetchData('', sellerTable);
    } else {
      fetchData('', tableName);
    }
    showPage('tablePage');
  });

// Reset form fields after add or update
function resetForm() {
  document.getElementById('name').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('location').value = '';
  document.getElementById('property').value = '';
  document.getElementById('source').value = '';
  document.getElementById('followUp').value = '';
  document.getElementById('status').value = '';
  document.getElementById('notes').value = '';
}

// Handle rent form submission: upload attachment to Supabase Storage and save rent record
document.getElementById('rentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const tenantName = document.getElementById('tenantName').value;
  const propertyAddress = document.getElementById('propertyAddress').value;
  const monthlyRent = document.getElementById('monthlyRent').value;
  const rentDueDate = document.getElementById('rentDueDate').value;
  const tenantContact = document.getElementById('tenantContact').value;
  const fileInput = document.getElementById('rentAttachment');

  let attachmentPath = null;

  // Upload file if selected
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const ext = file.name.split('.').pop();
    const fileName = `rent_${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(RENT_BUCKET)
      .upload(fileName, file);

    if (uploadError) {
      alert('❌ File upload failed: ' + uploadError.message + '\nMake sure the bucket "' + RENT_BUCKET + '" exists and is configured.');
      return;
    }

    attachmentPath = uploadData?.path || null;
  }

  // Prepare rent record (adjust column names to match your DB schema)
  const rentRecord = {
    tenant_name: tenantName,
    property_address: propertyAddress,
    monthly_rent: monthlyRent,
    due_date: rentDueDate,
    tenant_contact: tenantContact,
    attachment_path: attachmentPath,
  };

  const { error: insertError } = await supabaseClient.from(rentTable).insert([rentRecord]);
  if (insertError) {
    alert('❌ Failed to save rent record: ' + insertError.message);
    return;
  }

  alert('✅ Rent information saved successfully.');
  document.getElementById('rentForm').reset();
  fetchRentData();
});

// Fetch rent records and populate rent table
async function fetchRentData() {
  const { data, error } = await supabaseClient.from(rentTable).select('*').order('id', { ascending: false });
  const tbody = document.getElementById('rent-table-body');
  if (error) {
    console.error('Failed to fetch rents:', error.message);
    if (tbody) tbody.innerHTML = '<tr><td colspan="7">Failed to load rent data.</td></tr>';
    return;
  }
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No rent records found.</td></tr>';
    return;
  }

  data.forEach((row) => {
    // Try to build a public URL for the attachment if present
    let publicUrl = '';
    if (row.attachment_path) {
      try {
        const res = supabaseClient.storage.from(RENT_BUCKET).getPublicUrl(row.attachment_path);
        publicUrl = res?.data?.publicUrl || res?.publicURL || '';
      } catch (e) {
        publicUrl = '';
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.tenant_name || ''}</td>
      <td>${row.property_address || ''}</td>
      <td>${row.monthly_rent || ''}</td>
      <td>${row.due_date || ''}</td>
      <td>${row.tenant_contact || ''}</td>
      <td>${row.status || ''}</td>
      <td>
        ${publicUrl ? `<a href="${publicUrl}" target="_blank">Attachment</a>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Edit property
async function editProperty(id, tableUsed = tableName) {
  const { data, error } = await supabaseClient
    .from(tableUsed)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    alert('Error loading data for editing: ' + error.message);
    return;
  }

  // Populate form fields
  document.getElementById('name').value = data.name;
  document.getElementById('phone').value = data.phone;
  document.getElementById('email').value = data.email;
  document.getElementById('location').value = data.location;
  document.getElementById('property').value = data.property;
  document.getElementById('source').value = data.source;
  document.getElementById('followUp').value = data.followup;
  document.getElementById('status').value = data.status;
  document.getElementById('notes').value = data.notes;
  document.getElementById('listingType').value =
    tableUsed === sellerTable ? 'seller' : 'buyer';

  currentEditingId = id;
  showPage('formPage');
}

// Delete property
async function deleteProperty(id, tableUsed = tableName) {
  const confirmDelete = confirm('Are you sure you want to delete this record?');
  if (confirmDelete) {
    const { error } = await supabaseClient
      .from(tableUsed)
      .delete()
      .eq('id', id);
    if (error) {
      alert('❌ Failed to delete: ' + error.message);
    } else {
      alert('✅ Record deleted!');
      fetchData('', tableUsed);
    }
  }
}

// Search function
function searchProperties() {
  const query = document.getElementById('searchInput').value;
  fetchData(query);
}

// Show pages
function showPage(pageId) {
  document.querySelectorAll('.page').forEach((page) => {
    page.style.display = 'none';
  });
  document.getElementById(pageId).style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  fetchRentData();
  showPage('tablePage');
});


