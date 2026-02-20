<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nesh Property CRM – Financial Tools</title>

<style>
body{
  font-family: Arial, sans-serif;
  background:#eef2f7;
  margin:0;
  padding:20px;
}

.container{
  max-width:900px;
  margin:auto;
  background:white;
  padding:20px;
  border-radius:10px;
  box-shadow:0 6px 18px rgba(0,0,0,0.08);
}

h2{ text-align:center; color:#003366; }

.nav{
  display:flex;
  gap:10px;
  margin-bottom:15px;
}

.nav button{
  flex:1;
  padding:10px;
  border:none;
  background:#003366;
  color:white;
  cursor:pointer;
  border-radius:6px;
}

.section{ display:none; }

.active{ display:block; }

input{
  width:100%;
  padding:8px;
  margin:6px 0 12px;
  border:1px solid #ccc;
  border-radius:6px;
}

button.primary{ background:#003366; color:white; }
button.green{ background:#28a745; color:white; }
button.whatsapp{ background:#25D366; color:white; }

.card{
  background:#f7f9fc;
  padding:12px;
  border-radius:6px;
  margin-top:10px;
}
.result-line{
  display:flex;
  justify-content:space-between;
}
.total{
  font-weight:bold;
  font-size:16px;
  color:#003366;
}
</style>
</head>

<body>

<div class="container">

<h2>Nesh Property CRM – Financial Tools</h2>

<div class="nav">
  <button onclick="showTab('clients')">Clients</button>
  <button onclick="showTab('dsr')">DSR</button>
  <button onclick="showTab('cost')">Cost Calculator</button>
</div>

<!-- CLIENTS -->
<div id="clients" class="section active">
  <h3>Clients</h3>
  <p>Your CRM client list here...</p>
</div>

<!-- DSR -->
<div id="dsr" class="section">
  <h3>DSR Tool</h3>
  <p>Paste your DSR calculator here later.</p>
</div>

<!-- COST CALCULATOR -->
<div id="cost" class="section">

<h3>Property Cost Calculator</h3>

<label>Client Name</label>
<input type="text" id="clientName">

<label>Client Phone</label>
<input type="text" id="clientPhone">

<label>Property Price (RM)</label>
<input type="number" id="price">

<label>Loan Margin (%)</label>
<input type="number" id="margin" value="90">

<button class="primary" onclick="calculate()">Calculate</button>
<button class="green" onclick="generatePDF()">Generate PDF</button>
<button class="whatsapp" onclick="sendWhatsApp()">Send WhatsApp</button>

<div id="output"></div>

</div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<script>

function showTab(id){
  document.querySelectorAll('.section').forEach(sec=>sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

let reportText="";

function formatRM(num){
  return "RM " + num.toLocaleString(undefined,{minimumFractionDigits:2});
}

function calculate(){

let price = +price.value;
let margin = +margin.value;
if(!price){ alert("Enter property price"); return; }

let loan = price*(margin/100);
let down = price-loan;
let spaLegal = price*0.01;
let loanLegal = loan*0.01;
let sst = (spaLegal+loanLegal)*0.08;

let spaStamp = price<=100000?price*0.01:
price<=500000?1000+(price-100000)*0.02:
price<=1000000?9000+(price-500000)*0.03:
24000+(price-1000000)*0.04;

let mot = spaStamp;
let loanStamp = loan*0.005;
let totalCash = down+spaLegal+loanLegal+sst+spaStamp+mot+loanStamp;

output.innerHTML=`
<div class="card">
<div class="result-line"><span>Loan Amount</span><span>${formatRM(loan)}</span></div>
<div class="result-line"><span>Downpayment</span><span>${formatRM(down)}</span></div>
</div>

<div class="card">
<div class="result-line"><span>SPA Legal</span><span>${formatRM(spaLegal)}</span></div>
<div class="result-line"><span>Loan Legal</span><span>${formatRM(loanLegal)}</span></div>
<div class="result-line"><span>SST</span><span>${formatRM(sst)}</span></div>
</div>

<div class="card">
<div class="result-line"><span>SPA Stamp</span><span>${formatRM(spaStamp)}</span></div>
<div class="result-line"><span>MOT Stamp</span><span>${formatRM(mot)}</span></div>
<div class="result-line"><span>Loan Stamp</span><span>${formatRM(loanStamp)}</span></div>
</div>

<div class="card total">
Total Cash Needed: ${formatRM(totalCash)}
</div>
`;

reportText = `
Nesh Property Cost Report

Client: ${clientName.value}
Total Cash Needed: ${formatRM(totalCash)}
`;
}

function generatePDF(){
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.setFillColor(0,51,102);
doc.rect(0,0,210,30,"F");
doc.setTextColor(255,255,255);
doc.setFontSize(16);
doc.text("Nesh Property",105,15,null,null,"center");
doc.setFontSize(11);
doc.text("Property Cost Report",105,23,null,null,"center");

doc.setTextColor(0,0,0);
doc.text(reportText,14,45);

doc.save("Nesh_Property_Cost_Report.pdf");
}

function sendWhatsApp(){
let phone = clientPhone.value.replace(/^0/,"60");
window.open(`https://wa.me/${phone}?text=${encodeURIComponent(reportText)}`,'_blank');
}

</script>

</body>
</html>



