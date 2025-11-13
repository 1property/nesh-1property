// ==============================
// 🔧 Supabase Initialization
// ==============================
const SUPABASE_URL = 'https://erabbaphqueanoddsoqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tables
const buyerTable = 'callproperty';
const sellerTable = 'sellerproperty';

let currentEditingId = null;

// ==============================
// 🏠 BUYER LISTING FUNCTIONS
// ==============================
async function fetchData(query = '') {
  let { data, error } = await supabaseClient.from(buyerTable).select('*');
  if (error) return alert('❌ Failed to load Buyer data: ' + error.message);

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
    notes: document.getElementById('notes').value,
  };

  if (currentEditingId) {
    const { error } = await supabaseClient.from(buyerTable).update(formData).eq('id', currentEditingId);
    if (error) alert('❌ Failed to update: ' + error.message);
    else alert('✅ Buyer updated!');
    currentEditingId = null;
  } else {
    const { error } = await supabaseClient.from(buyerTable).insert([formData]);
    if (error) alert('❌ Failed to insert: ' + error.message);
    else alert('✅ Buyer added!');
  }

  resetForm();
  fetchData();
  showPage('tablePage');
});

function resetForm() {
  ['name', 'phone', 'email', 'location', 'property', 'source', 'followUp', 'status', 'notes']
    .forEach((id) => (document.getElementById(id).value = ''));
}

async function editProperty(id) {
  const { data, error } = await supabaseClient.from(buyerTable).select('*').eq('id', id).single();
  if (error) return alert('Error loading Buyer data: ' + error.message);

  Object.entries(data).forEach(([key, value]) => {
    if (document.getElementById(key)) document.getElementById(key).value = value;
  });
  currentEditingId = id;
  showPage('formPage');
}

async function deleteProperty(id) {
  if (confirm('Are you sure you want to delete this Buyer?')) {
    const { error } = await supabaseClient.from(buyerTable).delete().eq('id', id);
    if (error) alert('❌ Failed to delete: ' + error.message);
    else {
      alert('✅ Buyer deleted!');
      fetchData();
    }
  }
}

function searchProperties() {
  const query = document.getElementById('searchInput').value;
  fetchData(query);
}

// ==============================
// 🧑‍💼 SELLER LISTING FUNCTIONS
// ==============================
async function fetchSellerData() {
  const { data, error } = await supabaseClient.from(sellerTable).select('*');
  if (error) return alert('❌ Failed to load Sellers: ' + error.message);

  const sellerBody = document.getElementById('seller-table-body');
  sellerBody.innerHTML = '';

  if (!data || data.length === 0) {
    sellerBody.innerHTML = '<tr><td colspan="6">No sellers found.</td></tr>';
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.email}</td>
      <td>${row.property}</td>
      <td>${row.location}</td>
      <td><button class="delete" onclick="deleteSeller(${row.id})">Delete</button></td>
    `;
    sellerBody.appendChild(tr);
  });
}

async function addSeller(e) {
  e.preventDefault();
  const name = document.getElementById('sellerName').value;
  const phone = document.getElementById('sellerPhone').value;
  const email = document.getElementById('sellerEmail').value;
  const property = document.getElementById('sellerProperty').value;
  const location = document.getElementById('sellerLocation').value;

  const { error } = await supabaseClient.from(sellerTable).insert([{ name, phone, email, property, location }]);
  if (error) alert('❌ Failed to save seller: ' + error.message);
  else {
    alert('✅ Seller added!');
    document.getElementById('sellerForm').reset();
    fetchSellerData();
  }
}

async function deleteSeller(id) {
  if (confirm('Are you sure you want to delete this Seller?')) {
    const { error } = await supabaseClient.from(sellerTable).delete().eq('id', id);
    if (error) alert('❌ Failed to delete Seller: ' + error.message);
    else {
      alert('✅ Seller deleted!');
      fetchSellerData();
    }
  }
}

// ==============================
// 🔄 Page Navigation
// ==============================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach((page) => (page.style.display = 'none'));
  document.getElementById(pageId).style.display = 'block';

  if (pageId === 'sellerPage') fetchSellerData();
  if (pageId === 'tablePage') fetchData();
}

// ==============================
// 🚀 Initialize
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  showPage('tablePage');
  const sellerForm = document.getElementById('sellerForm');
  if (sellerForm) sellerForm.addEventListener('submit', addSeller);
});

