/**
 * Fungsi menghitung Tarif Upah Lembur (TUL)
 * Aturan: 
 * - 8 Jam = 16 TUL
 * - Selain itu: 1.5 (jam pertama) + ((Durasi - 1) * 2)
 */
function hitungTUL(jam) {
    if (jam === 8) return 16;
    if (jam <= 0) return 0;
    
    // Jam pertama dikali 1.5
    // Jam kedua dan seterusnya dikali 2
    if (jam <= 1) {
        return jam * 1.5;
    } else {
        return 1.5 + (jam - 1) * 2;
    }
}

function tambahData() {
    const nama = document.getElementById('nama').value;
    const tanggal = document.getElementById('tanggal').value;
    const durasiInput = document.getElementById('durasi').value;
    const durasi = parseFloat(durasiInput);

    if (!nama || !tanggal || isNaN(durasi)) {
        alert("Mohon lengkapi Nama, Tanggal, dan Durasi!");
        return;
    }

    const totalTUL = hitungTUL(durasi);
    const tbody = document.querySelector('#tabelLembur tbody');
    
    // Membuat baris baru
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatTanggal(tanggal)}</td>
        <td>${nama}</td>
        <td>${durasi} Jam</td>
        <td style="color: #27ae60; font-weight: bold;">${totalTUL.toFixed(1)}</td>
    `;

    // Menambah baris ke paling atas tabel
    tbody.prepend(row);

    // Reset input durasi saja agar nama tidak perlu ngetik ulang jika orangnya sama
    document.getElementById('durasi').value = '';
}

// Fungsi opsional agar format tanggal lebih enak dibaca (DD/MM/YYYY)
function formatTanggal(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
