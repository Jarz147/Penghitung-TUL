// 1. KONFIGURASI SUPABASE (MENGGUNAKAN KEY TERBARU)
const SUPABASE_URL = 'https://synhvvaolrjxdcbyozld.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmh2dmFvbHJqeGRjYnlvemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njg4NzEsImV4cCI6MjA4NTU0NDg3MX0.GSEfz8HVd49uEWXd70taR6FUv243VrFJKn6KlsZW-aQ'; 

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. RUMUS TUL (8 Jam = 16, Selain itu Jam 1 x 1.5 & Jam Berikutnya x 2)
function hitungTUL(jam) {
    if (jam === 8) return 16;
    if (jam <= 0) return 0;
    return jam <= 1 ? jam * 1.5 : 1.5 + (jam - 1) * 2;
}

// 3. LOGIKA RANGE PERIODE (TANGGAL 16 - 15)
function getPeriode() {
    const sekarang = new Date();
    let start, end;
    if (sekarang.getDate() >= 16) {
        start = new Date(sekarang.getFullYear(), sekarang.getMonth(), 16);
        end = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 15);
    } else {
        start = new Date(sekarang.getFullYear(), sekarang.getMonth() - 1, 16);
        end = new Date(sekarang.getFullYear(), sekarang.getMonth(), 15);
    }
    return {
        startStr: start.toISOString().split('T')[0],
        endStr: end.toISOString().split('T')[0]
    };
}

// 4. FUNGSI SIMPAN DATA
async function tambahData() {
    const nama = document.getElementById('nama').value;
    const tanggal = document.getElementById('tanggal').value;
    const durasi = parseFloat(document.getElementById('durasi').value);
    const btn = document.getElementById('btnSimpan');

    if (!nama || !tanggal || isNaN(durasi)) {
        alert("Harap lengkapi semua data!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const { error } = await _supabase
        .from('data_lembur')
        .insert([{ 
            nama: nama, 
            tanggal: tanggal, 
            durasi: durasi, 
            tul: hitungTUL(durasi) 
        }]);

    if (error) {
        alert("Gagal: " + error.message);
    } else {
        document.getElementById('durasi').value = '';
        renderData();
    }
    btn.disabled = false;
    btn.innerText = "Simpan Data";
}

// 5. FUNGSI TAMPILKAN DATA & HITUNG TOTAL
async function renderData() {
    const { startStr, endStr } = getPeriode();
    const tbody = document.querySelector('#tabelLembur tbody');
    const totalDisplay = document.getElementById('totalTULBesar');
    document.getElementById('labelPeriode').innerText = `Periode: ${startStr} s/d ${endStr}`;

    const { data, error } = await _supabase
        .from('data_lembur')
        .select('*')
        .gte('tanggal', startStr)
        .lte('tanggal', endStr)
        .order('tanggal', { ascending: false });

    if (error) return console.error(error);

    tbody.innerHTML = '';
    let grandTotal = 0;

    data.forEach(item => {
        grandTotal += item.tul;
        const row = `<tr>
            <td>${item.tanggal}</td>
            <td>${item.nama}</td>
            <td>${item.durasi}j</td>
            <td><strong>${item.tul}</strong></td>
            <td><button class="btn-delete" onclick="hapusData(${item.id})">Hapus</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });

    totalDisplay.innerText = grandTotal.toFixed(1);
}

// 6. FUNGSI HAPUS DATA
async function hapusData(id) {
    if (confirm("Yakin ingin menghapus data ini?")) {
        await _supabase.from('data_lembur').delete().eq('id', id);
        renderData();
    }
}

// Jalankan fungsi tampilkan data saat halaman dimuat
window.onload = renderData;
