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

document.getElementById('clearBtn').addEventListener('click', async () => {
  // Send a DELETE request to clear all inventory from KV
  try {
    const response = await fetch(workerURL, { method: 'DELETE' });
    const resultText = await response.text();
    showToast(resultText);
    fetchInventory(); // Refresh the inventory display
  } catch (error) {
    showToast("Error clearing inventory: " + error.message, true);
  }
});

// Function to fetch inventory data from the Worker
async function fetchInventory() {
  try {
    const response = await fetch(workerURL, { method: 'GET' });
    if (!response.ok) throw new Error("Failed to fetch inventory");

    const inventory = await response.json();
    console.log("Fetched Inventory Data:", inventory); // ✅ Debugging log

    displayInventory(inventory);
    showToast("Inventory refreshed.");
  } catch (error) {
    showToast("Error fetching inventory: " + error.message, true);
  }
}


// Dynamically generate the inventory table with an edit button for each record
function displayInventory(inventory) {
  const inventoryContainer = document.getElementById('inventoryContainer');
  if (!inventory.length) {
    inventoryContainer.innerHTML = "<p>No inventory data available.</p>";
    return;
  }
  
  // Dynamically get all keys from the first record
  const headers = Object.keys(inventory[0]);
  // Append an "Actions" header for the edit button
  headers.push("Actions");
  
  let table = `<table>
    <thead>
      <tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr>
    </thead>
    <tbody>`;
  
  inventory.forEach(item => {
    table += `<tr>`;
    // For each header except "Actions", display the value
    headers.slice(0, -1).forEach(header => {
      table += `<td>${item[header] || "N/A"}</td>`;
    });
    // Append an Edit button in the last column
    table += `<td><button onclick="editRecord('${item.key}')">Edit</button></td>`;
    table += `</tr>`;
  });
  
  table += `</tbody></table>`;
  inventoryContainer.innerHTML = table;
}

// Function to edit a record
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
