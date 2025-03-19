document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];
  if (!file) return;
  
  // Read the file as text
  const csvData = await file.text();
  
  // Send the CSV to your Worker (replace the URL with your actual Worker subdomain)
  const response = await fetch('https://my-inventory-worker.yourusername.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: csvData
  });
  
  const resultText = await response.text();
  document.getElementById('result').textContent = resultText;
});

