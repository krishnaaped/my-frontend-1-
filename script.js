// Update with your actual Worker URL provided by Cloudflare.
const workerURL = 'https://my-inventory-worker.shubhambalgude226.workers.dev';

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];
  if (!file) {
    showToast("Please select a CSV file to upload.", true);
    return;
  }
  try {
    const csvData = await file.text();
    const response = await fetch(workerURL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csvData
    });
    const resultText = await response.text();
    showToast(resultText);
    fetchInventory();
  } catch (error) {
    showToast("Error uploading CSV: " + error.message, true);
  }
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  fetchInventory();
});

// Function to fetch inventory data from the Worker
async function fetchInventory() {
  try {
    const response = await fetch(workerURL, { method: 'GET' });
    if (!response.ok) throw new Error("Failed to fetch inventory");
    const inventory = await response.json();
    displayInventory(inventory);
    showToast("Inventory refreshed.");
  } catch (error) {
    showToast("Error fetching inventory: " + error.message, true);
  }
}

// Dynamically generate the inventory table based on CSV columns
function displayInventory(inventory) {
  const inventoryContainer = document.getElementById('inventoryContainer');
  if (!inventory.length) {
    inventoryContainer.innerHTML = "<p>No inventory data available.</p>";
    return;
  }
  // Get all keys from the first record dynamically
  const headers = Object.keys(inventory[0]);
  let table = `<table>
    <thead>
      <tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr>
    </thead>
    <tbody>`;
  inventory.forEach(item => {
    table += `<tr>${headers.map(header => `<td>${item[header] || "N/A"}</td>`).join("")}</tr>`;
  });
  table += "</tbody></table>";
  inventoryContainer.innerHTML = table;
}

// Show toast notifications for user feedback
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = isError ? 'red' : '#28a745';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Load inventory on page load
fetchInventory();
