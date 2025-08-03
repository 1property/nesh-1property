// Supabase Initialization
const SUPABASE_URL = 'https://erabbaphqueanoddsoqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Truncated for clarity
const tableName = 'callproperty';
const rentTableName = 'rentinfo';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentEditingId = null;

// ==============================
// CRM BUYER SECTION
// ==============================

async function fetchData(query = '') {
  let { data, error } = await supabaseClient.from(tableName).select('*');
  if (error) {
    alert('❌ Failed to load data: ' + error.message);
    return;
  }

  if (query) {
    data = data.filter((row) =>
      row.name.toLowerCase().includes(query.toLowerCase()) ||
      row.location.toLowerCase().includes(query.toLowerCase()) ||
      row.status.toLowerCase().includes(query.toLowerCase())
    );
  }

  const tableBody = document.getElementById('data-table-body');
  tableBody.innerHTML = '';

  if (data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="10">No matching properties found.</td></tr>';
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
        <button class="edit" onclick="editProperty(${row.id})">Edit</button>
        <button class="delete" onclick="deleteProperty(${row.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById('addForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    location: document.getElementById('location').value,
    property: document.getElementById('property').value,
    source: document.getElementById('source').value,
    followup: document.getElementById('followUp').value,
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value
  };

  if (currentEditingId) {
    await supabaseClient.from(tableName).update(formData).eq('id', currentEditingId);
    alert('✅ Property updated!');
    currentEditingId = null;
  } else {
    await supabaseClient.from(tableName).insert([formData]);
    alert('✅ Property added!');
  }

  resetForm();
  fetchData();
  showPage('tablePage');
});

function resetForm() {
  ['name', 'phone', 'email', 'location', 'property', 'source', 'followUp', 'status', 'notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

async function editProperty(id) {
  const { data, error } = await supabaseClient.from(tableName).select('*').eq('id', id).single();
  if (error) return alert('Error: ' + error.message);

  Object.entries(data).forEach(([key, value]) => {
    const input = document.getElementById(key);
    if (input) input.value = value;
  });

  currentEditingId = id;
  showPage('formPage');
}

async function deleteProperty(id) {
  if (confirm('Are you sure you want to delete this property?')) {
    await supabaseClient.from(tableName).delete().eq('id', id);
    alert('✅ Property deleted!');
    fetchData();
  }
}

function searchProperties() {
  const query = document.getElementById('searchInput').value;
  fetchData(query);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((page) => {
    page.style.display = 'none';
  });
  document.getElementById(pageId).style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  showPage('tablePage');
});

// ==============================
// RENT MANAGEMENT SECTION
// ==============================

const rentForm = document.getElementById('rentForm');
if (rentForm) {
  rentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tenantName = document.getElementById('tenantName').value;
    const propertyAddress = document.getElementById('propertyAddress').value;
    const monthlyRent = document.getElementById('monthlyRent').value;
    const rentDueDate = document.getElementById('rentDueDate').value;
    const tenantContact = document.getElementById('tenantContact').value;

    const { error } = await supabaseClient.from(rentTableName).insert([{
      tenant_name: tenantName,
      property_address: propertyAddress,
      monthly_rent: monthlyRent,
      due_date: rentDueDate,
      contact: tenantContact,
      status: 'Active'
    }]);

    if (error) {
      alert('❌ Failed to save rent info: ' + error.message);
    } else {
      alert('✅ Rent info saved!');
      rentForm.reset();
    }
  });
}
