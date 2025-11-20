// Supabase Initialization
const SUPABASE_URL = 'https://erabbaphqueanoddsoqh.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4';

const tableName = 'callproperty';
const sellerTable = 'sellers';
const rentTable = 'rentinfo';
const RENT_BUCKET = 'rent-attachments';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentEditingId = null;

// FETCH BUYERS OR SELLERS
async function fetchData(query = '', table = tableName) {
  let { data, error } = await supabaseClient.from(table).select('*');

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

  const tableBody =
    table === sellerTable
      ? document.getElementById('seller-table-body')
      : document.getElementById('data-table-body');

  tableBody.innerHTML = '';

  if (data.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="10">No matching properties found.</td></tr>';
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement('tr');

    tr.innerHTML =
      table === sellerTable
        ? `
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.email}</td>
      <td>${row.location}</td>
      <td>${row.property}</td>
      <td>${row.source}</td>
      <td>${row.selling_price || ''}</td>
      <td>${row.status}</td>
      <td>${row.notes}</td>
      <td>
        <button class="edit" onclick="editProperty(${row.id}, '${table}')">Edit</button>
        <button class="delete" onclick="deleteProperty(${row.id}, '${table}')">Delete</button>
      </td>`
        : `
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.email}</td>
      <td>${row.location}</td>
      <td>${row.property}</td>
      <td>${row.source}</td>
      <td>${row.followup || ''}</td>
      <td>${row.status}</td>
      <td>${row.notes}</td>
      <td>
        <button class="edit" onclick="editProperty(${row.id}, '${table}')">Edit</button>
        <button class="delete" onclick="deleteProperty(${row.id}, '${table}')">Delete</button>
      </td>
      `;

    tableBody.appendChild(tr);
  });
}

// ADD & UPDATE BUYER/SELLER
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const listingType = document.getElementById('listingType').value;
  const selectedTable = listingType === 'seller' ? sellerTable : tableName;

  const formData =
    listingType === 'seller'
      ? {
          name: name.value,
          phone: phone.value,
          email: email.value,
          location: location.value,
          property: property.value,
          source: source.value,
          selling_price: followUp.value, // using same input but renamed meaning
          status: status.value,
          notes: notes.value
        }
      : {
          name: name.value,
          phone: phone.value,
          email: email.value,
          location: location.value,
          property: property.value,
          source: source.value,
          followup: followUp.value,
          status: status.value,
          notes: notes.value
        };

  let error;

  if (currentEditingId) {
    ({ error } = await supabaseClient
      .from(selectedTable)
      .update(formData)
      .eq('id', currentEditingId));

    currentEditingId = null;
  } else {
    ({ error } = await supabaseClient.from(selectedTable).insert([formData]));
  }

  if (error) {
    alert('❌ Error saving record: ' + error.message);
    return;
  }

  resetForm();

  if (listingType === 'seller') {
    fetchData('', sellerTable);
    showPage('sellerPage');
  } else {
    fetchData('', tableName);
    showPage('tablePage');
  }
});

// RESET FORM
function resetForm() {
  document.getElementById('addForm').reset();
}

// EDIT
async function editProperty(id, tableUsed) {
  const { data, error } = await supabaseClient
    .from(tableUsed)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    alert('❌ Error loading record: ' + error.message);
    return;
  }

  name.value = data.name;
  phone.value = data.phone;
  email.value = data.email;
  location.value = data.location;
  property.value = data.property;
  source.value = data.source;

  if (tableUsed === sellerTable) {
    followUp.value = data.selling_price || '';
    listingType.value = 'seller';
  } else {
    followUp.value = data.followup || '';
    listingType.value = 'buyer';
  }

  status.value = data.status;
  notes.value = data.notes;

  currentEditingId = id;
  showPage('formPage');
}

// DELETE
async function deleteProperty(id, tableUsed) {
  if (!confirm("Delete this?")) return;

  const { error } = await supabaseClient
    .from(tableUsed)
    .delete()
    .eq("id", id);

  if (error) {
    alert("❌ Error deleting: " + error.message);
    return;
  }

  fetchData('', tableUsed);
}

// SEARCH
function searchProperties() {
  const q = searchInput.value;
  fetchData(q, tableName);
}

// PAGE SWITCHER
function showPage(pageId) {
  document.querySelectorAll('.page').forEach((p) => (p.style.display = 'none'));
  document.getElementById(pageId).style.display = 'block';
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  fetchData('', sellerTable);
  showPage('tablePage');
});


