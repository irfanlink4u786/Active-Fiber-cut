async function fetchSheetData() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const table = document.getElementById('data-table');
  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');

  try {
    const response = await fetch('/api/sheet-data');
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to fetch data');
    }
    const { headers, data } = await response.json();

    if (!data || data.length === 0) {
      loading.textContent = 'No data found in the sheet.';
      return;
    }

    // Build table header
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

    // Build table body
    tbody.innerHTML = data.map(row => 
      `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
    ).join('');

    loading.style.display = 'none';
    table.style.display = 'table';
    error.style.display = 'none';

  } catch (err) {
    loading.style.display = 'none';
    error.textContent = 'Error: ' + err.message;
    error.style.display = 'block';
  }
}

fetchSheetData();
