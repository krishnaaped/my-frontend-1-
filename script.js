// Update with your actual Worker URL
const workerURL = 'https://my-inventory-worker.username.workers.dev';

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

// Function to display inventory data in a table with an edit button
function displayInventory(inventory) {
  const inventoryContainer = document.getElementById('inventoryContainer');
  if (!inventory.length) {
    inventoryContainer.innerHTML = "<p>No inventory data available.</p>";
    return;
  }
  let table = `<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Date</th>
        <th>Store ID</th>
        <th>Product ID</th>
        <th>Category</th>
        <th>Region</th>
        <th>Inventory Level</th>
        <th>Units Sold</th>
        <th>Demand Forecast</th>
        <th>Weather Condition</th>
        <th>Holiday/Promotion</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>`;
  inventory.forEach(item => {
    table += `<tr>
                <td>${item.key || ""}</td>
                <td>${item["Date"] || ""}</td>
                <td>${item["Store ID"] || ""}</td>
                <td>${item["Product ID"] || ""}</td>
                <td>${item["Category"] || ""}</td>
                <td>${item["Region"] || ""}</td>
                <td>${item["Inventory Level"] || ""}</td>
                <td>${item["Units Sold"] || ""}</td>
                <td>${item["Demand Forecast"] || ""}</td>
                <td>${item["Weather Condition"] || ""}</td>
                <td>${item["Holiday/Promotion"] || ""}</td>
                <td><button onclick="editRecord('${item.key}')">Edit</button></td>
              </tr>`;
  });
  table += "</tbody></table>";
  inventoryContainer.innerHTML = table;
}

// Function to edit a record using a prompt (for simplicity)
async function editRecord(key) {
  const currentData = prompt("Enter new JSON data for record with key " + key + " (must be valid JSON):");
  if (!currentData) return;
  try {
    const updatedData = JSON.parse(currentData);
    const response = await fetch(workerURL + "?key=" + encodeURIComponent(key), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const resultText = await response.text();
    showToast(resultText);
    fetchInventory();
  } catch (error) {
    showToast("Error updating record: " + error.message, true);
  }
}

// Function to show toast notifications
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = isError ? 'red' : 'green';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Load inventory on page load
fetchInventory();
