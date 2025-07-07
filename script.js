document.getElementById('csvFiles').addEventListener('change', handleCSVFiles);
document.getElementById('compareBtn').addEventListener('click', handleCompare);

let mainCSVRows = [];

function handleCSVFiles(event) {
  const files = event.target.files;
  const allRows = [];

  let filesProcessed = 0;

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const rows = content.trim().split('\n').map(row => row.split(','));
      allRows.push(...rows.slice(1)); // Ignora cabecera
      filesProcessed++;

      if (filesProcessed === files.length) {
        mainCSVRows = allRows;
        populateColumnSelector(rows[0]);
      }
    };
    reader.readAsText(file);
  }
}

function populateColumnSelector(headers) {
  const select = document.getElementById('columnIndexSelect');
  select.innerHTML = '';
  headers.forEach((col, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${idx} - ${col}`;
    select.appendChild(opt);
  });
  document.getElementById('columnSelector').style.display = 'block';
}

function handleCompare() {
  const selectedIndex = parseInt(document.getElementById('columnIndexSelect').value);
  if (isNaN(selectedIndex)) {
    alert("Selecciona una columna primero.");
    return;
  }

  const comparisonFile = document.getElementById('comparisonFile').files[0];
  const manualText = document.getElementById('manualData').value.trim();
  const inputSet = new Set(mainCSVRows.map(row => row[selectedIndex]));

  if (comparisonFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const values = content.trim().split('\n').map(row => row.split(',')[0]);
      compareAndDownload(inputSet, new Set(values));
    };
    reader.readAsText(comparisonFile);
  } else if (manualText) {
    const lines = manualText.split('\n').map(line => line.trim()).filter(Boolean);
    compareAndDownload(inputSet, new Set(lines));
  } else {
    alert("Debes subir un archivo o ingresar datos manuales.");
  }
}

function compareAndDownload(set1, set2) {
  const difference = [...set1].filter(x => !set2.has(x));
  if (difference.length === 0) {
    alert("Todos los valores se repiten. No hay diferencias.");
    return;
  }

  const csvContent = "data:text/csv;charset=utf-8," + difference.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "valores_no_repetidos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
