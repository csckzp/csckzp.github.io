document.addEventListener('DOMContentLoaded', function() {
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            const table = document.createElement('table');
            const rows = data.split('\n');

            rows.forEach(row => {
                const tr = document.createElement('tr');
                const cells = row.split(',');

                cells.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell.trim();
                    tr.appendChild(td);
                });

                table.appendChild(tr);
            });

            document.body.appendChild(table);
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
});