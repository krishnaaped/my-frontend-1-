const workerURL = 'https://my-inventory-worker.username.workers.dev';  // Update with correct Worker URL

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

async function fetchInventory() {
  try {
    const response = await fetch(workerURL, { method: 'GET' });
    if (!response.ok) throw new Error("Failed to fetch inventory");
    
    const inventory = await response.json();
    displayInventory(inventory);
    showToast("Inventory updated.");
  } catch (error) {
    showToast("Error fetching inventory: " + error.message, true);
  }
}

function displayInventory(inventory) {
  const inventoryContainer = document.getElementById('inventoryContainer');
  if (!inventory.length) {
    inventoryContainer.innerHTML = "<p>No inventory data available.</p>";
    return;
  }

  let table = '<table><tr><th>Key</th><th>Store</th><th>Product</th><th>Count</th></tr>';
  inventory.forEach(item => {
    table += `<tr>
                <td>${item.key}</td>
                <td>${item.store}</td>
                <td>${item.product}</td>
                <td>${item.count}</td>
              </tr>`;
  });
  table += '</table>';
  inventoryContainer.innerHTML = table;
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = isError ? 'red' : 'green';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('refreshBtn').addEventListener('click', fetchInventory);

// Load inventory on page load
fetchInventory();
