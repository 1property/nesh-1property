/*************************************************************
 *  script.js - Minimal, compatible version for your HTML
 *************************************************************/

/* Supabase config */
const SUPABASE_URL = "https://erabbaphqueanoddsoqh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWJiYXBocXVlYW5vZGRzb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDQ5MTMsImV4cCI6MjA1OTQyMDkxM30._o0s404jR_FrJcEEC-7kQIuV-9T2leBe1QfUhXpcmG4";

const BUYER_TABLE = "callproperty";
const SELLER_TABLE = "sellers";
const RENT_TABLE = "rentinfo";
const RENT_BUCKET = "rent-attachments";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Helper: safe getElement ---------- */
function $id(id) {
  return document.getElementById(id);
}

/* ---------- FETCH BUYER / SELLER ---------- */
/**
 * fetchData(query, table)
 * - query: string to filter (client-side)
 * - table: BUYER_TABLE or SELLER_TABLE
 */
async function fetchData(query = "", table = BUYER_TABLE) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("fetchData error:", error);
      alert("❌ Failed to load data: " + error.message);
      return;
    }

    const list = Array.isArray(data) ? data : [];

    // client-side filter (keeps your existing simple search behavior)
    const q = (query || "").toLowerCase().trim();
    const filtered = q
      ? list.filter((r) =>
          (
            (r.name || "") +
            " " +
            (r.location || "") +
            " " +
            (r.status || "")
          )
            .toLowerCase()
            .includes(q)
        )
      : list;

    const tableBody =
      table === SELLER_TABLE ? $id("seller-table-body") : $id("data-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="10">No records found</td></tr>`;
      return;
    }

    filtered.forEach((row) => {
      const tr = document.createElement("tr");

      // Keep exactly the columns your HTML expects
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
  } catch (err) {
    console.error("fetchData exception:", err);
    alert("❌ Failed to load data (exception). See console.");
  }
}

/* ---------- ADD / UPDATE BUYER + SELLER ---------- */
$id("addForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  try {
    // read values safely from DOM
    const listingTypeVal = $id("listingType").value;
    const selectedTable = listingTypeVal === "seller" ? SELLER_TABLE : BUYER_TABLE;

    const formData = {
      name: $id("name").value || "",
      phone: $id("phone").value || "",
      email: $id("email").value || "",
      location: $id("location").value || "",
      property: $id("property").value || "",
      source: $id("source").value || "",
      followup: $id("followUp").value || null, // matches your Supabase column name
      status: $id("status").value || "",
      notes: $id("notes").value || "",
    };

    const recordIdEl = $id("recordId");
    const recordId = recordIdEl ? recordIdEl.value : "";

    let result;
    if (recordId) {
      result = await supabaseClient.from(selectedTable).update(formData).eq("id", recordId);
    } else {
      result = await supabaseClient.from(selectedTable).insert([formData]);
    }

    if (result.error) {
      console.error("save error:", result.error);
      return alert("❌ Error saving: " + result.error.message);
    }

    // clear form + recordId
    if (recordIdEl) recordIdEl.value = "";
    $id("addForm").reset();

    // refresh both lists (keeps UI consistent)
    fetchData("", BUYER_TABLE);
    fetchData("", SELLER_TABLE);

    // show appropriate page
    showPage(selectedTable === SELLER_TABLE ? "sellerPage" : "tablePage");
  } catch (err) {
    console.error("save exception:", err);
    alert("❌ Failed to save (exception). See console.");
  }
});

/* ---------- EDIT BUYER/SELLER ---------- */
async function editProperty(id, tableUsed) {
  try {
    const { data, error } = await supabaseClient.from(tableUsed).select("*").eq("id", id).single();
    if (error) {
      console.error("editProperty error:", error);
      return alert("❌ Error loading record: " + (error.message || ""));
    }
    // populate fields
    if ($id("recordId")) $id("recordId").value = id;
    if ($id("name")) $id("name").value = data.name || "";
    if ($id("phone")) $id("phone").value = data.phone || "";
    if ($id("email")) $id("email").value = data.email || "";
    if ($id("location")) $id("location").value = data.location || "";
    if ($id("property")) $id("property").value = data.property || "";
    if ($id("source")) $id("source").value = data.source || "";
    if ($id("followUp")) $id("followUp").value = data.followup || "";
    if ($id("status")) $id("status").value = data.status || "";
    if ($id("notes")) $id("notes").value = data.notes || "";
    if ($id("listingType")) $id("listingType").value = tableUsed === SELLER_TABLE ? "seller" : "buyer";

    showPage("formPage");
  } catch (err) {
    console.error("editProperty exception:", err);
    alert("❌ Error loading record (exception). See console.");
  }
}

/* Make editProperty global so onclick="" works from generated buttons */
window.editProperty = editProperty;

/* ---------- DELETE BUYER/SELLER ---------- */
async function deleteProperty(id, tableUsed) {
  if (!confirm("Delete this record?")) return;
  try {
    const { error } = await supabaseClient.from(tableUsed).delete().eq("id", id);
    if (error) {
      console.error("deleteProperty error:", error);
      return alert("❌ Error deleting: " + error.message);
    }
    fetchData("", tableUsed);
  } catch (err) {
    console.error("deleteProperty exception:", err);
    alert("❌ Failed to delete (exception). See console.");
  }
}
window.deleteProperty = deleteProperty;

/* ---------- SEARCH HELPERS ---------- */
function searchProperties() {
  const q = ($id("searchInput") && $id("searchInput").value) || "";
  fetchData(q, BUYER_TABLE);
}
window.searchProperties = searchProperties;

function searchSellers() {
  const q = ($id("searchSeller") && $id("searchSeller").value) || "";
  fetchData(q, SELLER_TABLE);
}
window.searchSellers = searchSellers;

/* ---------- PAGE SWITCH ---------- */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  const el = $id(pageId);
  if (el) el.style.display = "block";
}
window.showPage = showPage;

/* ---------- RENT SECTION ---------- */
async function fetchRentData(query = "") {
  try {
    const tbody = $id("rent-table-body");
    if (!tbody) return;

    const { data, error } = await supabaseClient
      .from(RENT_TABLE)
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("fetchRentData error:", error);
      tbody.innerHTML = "<tr><td colspan='8'>Failed to load rent data</td></tr>";
      return;
    }

    let list = Array.isArray(data) ? data : [];
    const q = (query || "").toLowerCase().trim();
    if (q) {
      list = list.filter((r) =>
        (
          (r.tenant_name || "") +
          " " +
          (r.property_address || "") +
          " " +
          (r.status || "")
        )
          .toLowerCase()
          .includes(q)
      );
    }

    if (!list.length) {
      tbody.innerHTML = "<tr><td colspan='8'>No rent records found</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    list.forEach((row) => {
      let due = row.due_date || "";
      let attachmentHtml = "";
      if (row.attachment_path) {
        try {
          const url = supabaseClient.storage.from(RENT_BUCKET).getPublicUrl(row.attachment_path).data.publicUrl;
          attachmentHtml = `<a href="${url}" target="_blank">View</a>`;
        } catch (e) {
          attachmentHtml = "";
        }
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
  } catch (err) {
    console.error("fetchRentData exception:", err);
    $id("rent-table-body").innerHTML = "<tr><td colspan='8'>Failed to load rent data (exception)</td></tr>";
  }
}
window.fetchRentData = fetchRentData;

/* rent search wrapper */
function searchRentData() {
  const q = ($id("searchRent") && $id("searchRent").value) || "";
  fetchRentData(q);
}
window.searchRentData = searchRentData;

/* ADD / UPDATE RENT */
$id("rentForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const tenantNameVal = $id("tenantName").value || "";
    const propertyAddressVal = $id("propertyAddress").value || "";
    const monthlyRentVal = $id("monthlyRent").value || "";
    const rentDueDateVal = $id("rentDueDate").value || "";
    const tenantContactVal = $id("tenantContact").value || "";

    let attachmentPath = null;
    const fileInput = $id("rentAttachment");
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const safeName = "rent_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const upload = await supabaseClient.storage.from(RENT_BUCKET).upload(safeName, file);
      if (upload.error) {
        console.error("upload error:", upload.error);
        return alert("❌ Failed to upload attachment: " + upload.error.message);
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

    const editEl = $id("rentEditId");
    if (editEl && editEl.value) {
      const { error } = await supabaseClient.from(RENT_TABLE).update(rentRecord).eq("id", editEl.value);
      if (error) {
        console.error("update rent error:", error);
        return alert("❌ Failed to update rent: " + error.message);
      }
      editEl.remove();
    } else {
      const { error } = await supabaseClient.from(RENT_TABLE).insert([rentRecord]);
      if (error) {
        console.error("insert rent error:", error);
        return alert("❌ Failed to save rent: " + error.message);
      }
    }

    $id("rentForm").reset();
    fetchRentData();
    showPage("rentPage");
  } catch (err) {
    console.error("rent save exception:", err);
    alert("❌ Failed to save rent (exception). See console.");
  }
});

/* EDIT RENT */
async function editRent(id) {
  try {
    const { data, error } = await supabaseClient.from(RENT_TABLE).select("*").eq("id", id).single();
    if (error) {
      console.error("editRent error:", error);
      return alert("❌ Failed to load rent record: " + (error.message || ""));
    }

    $id("tenantName").value = data.tenant_name || "";
    $id("propertyAddress").value = data.property_address || "";
    $id("monthlyRent").value = data.monthly_rent || "";
    $id("rentDueDate").value = data.due_date || "";
    $id("tenantContact").value = data.tenant_contact || "";

    let hidden = $id("rentEditId");
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "rentEditId";
      $id("rentForm").appendChild(hidden);
    }
    hidden.value = id;

    showPage("addRentPage");
  } catch (err) {
    console.error("editRent exception:", err);
    alert("❌ Failed to load rent (exception). See console.");
  }
}
window.editRent = editRent;

/* DELETE RENT */
async function deleteRent(id) {
  if (!confirm("Delete rent?")) return;
  try {
    await supabaseClient.from(RENT_TABLE).delete().eq("id", id);
    fetchRentData();
  } catch (err) {
    console.error("deleteRent exception:", err);
    alert("❌ Failed to delete rent (exception). See console.");
  }
}
window.deleteRent = deleteRent;

/* ---------- INITIAL LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // initial population
  fetchData();
  fetchData("", SELLER_TABLE);
  fetchRentData();
  showPage("tablePage");
});





