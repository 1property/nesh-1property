<!-- crm.html -->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Real Estate CRM</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Supabase (needed by script.js) -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background: #f6f7fb;
    }

    header h1 {
      text-align: center;
      margin: 18px 0 6px;
      font-weight: 600;
    }

    .table-wrapper {
      background: #fff;
      padding: 14px;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
    }

    .card-ghost {
      background: transparent;
      box-shadow: none;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    /* smaller table on narrow screens */
    @media (max-width: 768px) {
      .table-responsive {
        font-size: 0.95rem;
      }
    }
  </style>
</head>

<body>

  <!-- CRM Password Protection -->
  <script>
    (function () {
      const allowedPassword = "12345";

      // Check if user has access
      if (!sessionStorage.getItem("crm_access")) {
        let attempts = 3; // limit attempts to 3
        let input = null;

        while (attempts > 0) {
          input = prompt(`Enter password to access CRM (Attempts left: ${attempts}):`);

          // User clicked cancel
          if (input === null) {
            alert("Access canceled. Redirecting to Home.");
            window.location.href = "index.html";
            return;
          }

          if (input === allowedPassword) {
            sessionStorage.setItem("crm_access", "true");
            break; // exit loop
          } else {
            attempts--;
            alert("❌ Wrong password!");
          }
        }

        if (attempts === 0) {
          alert("❌ Too many failed attempts! Redirecting to Home.");
          window.location.href = "index.html";
        }
      }
    })();
  </script>

  <header>
    <h1>Real Estate CRM System</h1>
    <div class="text-center text-muted mb-2">Manage Buyers, Sellers and Renters — powered by Supabase</div>
  </header>

  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
    <div class="container">
      <a class="navbar-brand fw-semibold" href="#">🏡 Real Estate CRM</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto gap-2">
          <a class="nav-link cursor-pointer" href="index.html">Home</a>
          <li class="nav-item"><a class="nav-link cursor-pointer" data-target="buyerPage">Buyer List</a></li>
          <li class="nav-item"><a class="nav-link cursor-pointer" data-target="sellerPage">Seller List</a></li>
          <li class="nav-item"><a class="nav-link cursor-pointer" data-target="rentPage">Renter List</a></li>
          <a class="nav-link cursor-pointer" href="loancrm.html">Loan CRM</a>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container mb-5">

    <!-- LIST: BUYERS -->
    <section id="buyerPage" class="page">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="m-0">Buyer List</h4>
        <div class="d-flex gap-2">
          <input class="form-control form-control-sm" id="searchBuyer" placeholder="Search...">
          <button class="btn btn-primary btn-sm" id="btnOpenAddBuyer">Add Buyer</button>
        </div>
      </div>

      <div class="table-wrapper table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Location</th>
              <th>Property</th>
              <th>Source</th>
              <th>Follow-Up</th>
              <th>Status</th>
              <th>Notes</th>
              <th style="min-width:140px">Actions</th>
            </tr>
          </thead>
          <tbody id="buyer-table-body"></tbody>
        </table>
      </div>
    </section>

    <!-- LIST: SELLERS -->
    <section id="sellerPage" class="page d-none">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="m-0">Seller List</h4>
        <div class="d-flex gap-2">
          <input class="form-control form-control-sm" id="searchSeller" placeholder="Search...">
          <button class="btn btn-primary btn-sm" id="btnOpenAddSeller">Add Seller</button>
        </div>
      </div>

      <div class="table-wrapper table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Location</th>
              <th>Property</th>
              <th>Source</th>
              <th>Follow-Up</th>
              <th>Status</th>
              <th>Notes</th>
              <th style="min-width:140px">Actions</th>
            </tr>
          </thead>
          <tbody id="seller-table-body"></tbody>
        </table>
      </div>
    </section>

    <!-- LIST: RENT -->
    <section id="rentPage" class="page d-none">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="m-0">Renter List</h4>
        <div class="d-flex gap-2">
          <input class="form-control form-control-sm" id="searchRent" placeholder="Search...">
          <button class="btn btn-primary btn-sm" id="btnOpenAddRent">Add Renter</button>
        </div>
      </div>

      <div class="table-wrapper table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Tenant Name</th>
              <th>Property</th>
              <th>Rent (RM)</th>
              <th>Due Date</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Attachment</th>
              <th style="min-width:140px">Actions</th>
            </tr>
          </thead>
          <tbody id="rent-table-body"></tbody>
        </table>
      </div>
    </section>

  </main>

  <!-- MODAL: Add/Edit Buyer -->
  <div class="modal fade" id="buyerModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form id="buyerForm" class="needs-validation" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="buyerModalTitle">Add Listing</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="buyerRecordId" />
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Listing Type</label>
                <select class="form-select" required disabled="true">
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Name</label>
                <input id="buyer_name" type="text" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone</label>
                <input id="buyer_phone" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input id="buyer_email" type="email" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Location</label>
                <input id="buyer_location" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Property</label>
                <input id="buyer_property" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Source</label>
                <input id="buyer_source" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Follow-Up</label>
                <input id="buyer_followUp" type="date" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <input id="buyer_status" type="text" class="form-control">
              </div>
              <div class="col-12">
                <label class="form-label">Notes</label>
                <textarea id="buyer_notes" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="saveBuyerBtn" type="submit" class="btn btn-primary">Save Buyer</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL: Add/Edit Seller -->
  <div class="modal fade" id="sellerModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form id="sellerForm" class="needs-validation" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="sellerModalTitle">Add Seller</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="sellerRecordId" />
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Listing Type</label>
                <select class="form-select" required disabled="true">
                  <option value="buyer">Seller</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Name</label>
                <input id="seller_name" type="text" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone</label>
                <input id="seller_phone" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input id="seller_email" type="email" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Location</label>
                <input id="seller_location" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Property</label>
                <input id="seller_property" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Source</label>
                <input id="seller_source" type="text" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Follow-Up</label>
                <input id="seller_followUp" type="date" class="form-control">
              </div>
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <input id="seller_status" type="text" class="form-control">
              </div>
              <div class="col-12">
                <label class="form-label">Notes</label>
                <textarea id="seller_notes" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="saveSellerBtn" type="submit" class="btn btn-primary">Save Seller</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL: Add/Edit Rent -->
  <div class="modal fade" id="rentModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form id="rentForm" class="needs-validation" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="rentModalTitle">Add Renter</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="rentEditId">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Tenant Name</label>
                <input id="tenantName" type="text" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Property Address</label>
                <input id="propertyAddress" type="text" class="form-control" required>
              </div>
              <div class="col-md-4">
                <label class="form-label">Monthly Rent (RM)</label>
                <input id="monthlyRent" type="number" class="form-control" required>
              </div>
              <div class="col-md-4">
                <label class="form-label">Due Date</label>
                <input id="rentDueDate" type="date" class="form-control" required>
              </div>
              <div class="col-md-4">
                <label class="form-label">Tenant Contact</label>
                <input id="tenantContact" type="text" class="form-control">
              </div>
              <div class="col-12">
                <label class="form-label">Attachment</label>
                <input id="rentAttachment" type="file" class="form-control" accept="image/*,application/pdf">
                <div class="form-text">Optional. Max 20MB</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
            <button id="saveRentBtn" type="submit" class="btn btn-primary">Save Rent</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL: Confirm Delete -->
  <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center p-4">
          <p id="confirmDeleteText" class="mb-3">Delete item?</p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toasts (top-right) -->
  <div class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
    <div id="toastContainer"></div>
  </div>

  <!-- Bootstrap + App script -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js" defer></script>
</body>

</html>



