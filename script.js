// Replace this URL with your actual Cloudflare Worker endpoint
const workerURL = 'https://my-inventory-worker.yourusername.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const refreshBtn = document.getElementById('refreshBtn');
  const uploadMessage = document.getElementById('uploadMessage');
  const inventoryContainer = document.getElementById('inventoryContainer');

  // Handle CSV upload form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
      showToast("Please select a CSV file to upload.", true);
      return;
    }
    try {
      const csvData = await file.text();
      uploadMessage.textContent = "Uploading...";
      const response = await fetch(workerURL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csvData
      });
      const resultText = await response.text();
      uploadMessage.textContent = resultText;
      showToast("CSV uploaded successfully!");
      // Refresh inventory after upload
      fetchInventory();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      uploadMessage.textContent = "Error uploading CSV.";
      showToast("Error uploading CSV.", true);
    }
  });

  // Refresh button to fetch inventory data
  refreshBtn.addEventListener('click', () => {
    fetchInventory();
  });

  // Function to fetch inventory data from the Worker (GET request)
  async function fetchInventory() {
    try {
      inventoryContainer.innerHTML = "Loading inventory...";
      const response = await fetch(workerURL, { method: 'GET' });
      const text = await response.text();
      
      // Attempt to parse JSON, if possible, otherwise display plain text.
      try {
        const inventory = JSON.parse(text);
        inventoryContainer.innerHTML = generateInventoryTable(inventory);
      } catch (err) {
        // If not JSON, show plain text in a preformatted block.
        inventoryContainer.innerHTML = `<pre>${text}</pre>`;
      }
      showToast("Inventory refreshed.");
    } catch (error) {
      console.error("Error fetching inventory:", error);
      inventoryContainer.innerHTML = "Error fetching inventory.";
      showToast("Error fetching inventory.", true);
    }
  }

  // Generate an HTML table from inventory data (assumes an array of objects)
  function generateInventoryTable(inventory) {
    if (!Array.isArray(inventory) || inventory.length === 0) {
      return "<p>No inventory data available.</p>";
    }
    let table = '<table><thead><tr><th>Key</th><th>Store</th><th>Product</th><th>Count</th></tr></thead><tbody>';
    inventory.forEach(item => {
      // Expect each item to have key, store, product, and count properties.
      table += `<tr>
                  <td>${item.key || ''}</td>
                  <td>${item.store || ''}</td>
                  <td>${item.product || ''}</td>
                  <td>${item.count || ''}</td>
                </tr>`;
    });
    table += '</tbody></table>';
    return table;
  }

  // Toast notification for user feedback
  function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.8)';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Optionally, load inventory on page load
  fetchInventory();
});
