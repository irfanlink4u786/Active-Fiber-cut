async function fetchSheetData() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const table = document.getElementById('data-table');
  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');

  // Show loading, hide table and errors
  loading.style.display = 'block';
  loading.textContent = 'Loading...';
  table.style.display = 'none';
  error.style.display = 'none';

  try {
    // 1. Make the fetch request
    const response = await fetch('/api/sheet-data');

    // 2. 🔥 CRITICAL FIX: If status is NOT 2xx, throw an error WITHOUT parsing JSON
    if (!response.ok) {
      // Try to get the error message from the response, but safely fallback to status text
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        // Attempt to parse error JSON (in case your backend sends structured errors)
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (_) {
        // If parsing fails, just use the status text (prevents the "Unexpected token" crash)
        // We'll keep the default errorMessage
      }
      
      throw new Error(errorMessage);
    }

    // 3. Only parse JSON here if the response was OK (status 200)
    let data;
    try {
      data = await response.json();
    } catch (_) {
      throw new Error('Server returned invalid JSON. Please check your API endpoint.');
    }

    // 4. Validate the data structure
    const { headers, data: rows } = data;
    if (!rows || rows.length === 0) {
      loading.textContent = 'No data found in the sheet.';
      return;
    }

    // 5. Build the table
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    tbody.innerHTML = rows.map(row => 
      `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
    ).join('');

    // 6. Show table, hide loading
    loading.style.display = 'none';
    table.style.display = 'table';
    error.style.display = 'none';

  } catch (err) {
    // 7. Catch ANY error (network failures, thrown errors, etc.)
    loading.style.display = 'none';
    table.style.display = 'none';
    error.textContent = '❌ Error: ' + err.message;
    error.style.display = 'block';
    
    // Log the full error to the browser console for debugging
    console.error('Fetch error:', err);
  }
}

// Run the function when the page loads
fetchSheetData();
