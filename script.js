// CONFIG SUPABASE
const SUPABASE_URL = 'https://synhvvaolrjxdcbyozld.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmh2dmFvbHJqeGRjYnlvemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njg4NzEsImV4cCI6MjA4NTU0NDg3MX0.GSEfz8HVd49uEWXd70taR6FUv243VrFJKn6KlsZW-aQ'; 

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Inisialisasi Dropdown Bulan (History)
function buatOpsiBulan() {
    const select = document.getElementById('pilihPeriode');
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const skrg = new Date();
    
    for (let i = -6; i <= 1; i++) {
        let d = new Date(skrg.getFullYear(), skrg.getMonth() + i, 1);
        let opsi = document.createElement('option');
        opsi.value = JSON.stringify({ bulan: d.getMonth(), tahun: d.getFullYear() });
        opsi.text = `${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
        
        if (i === 0) opsi.selected = true; 
        select.appendChild(opsi);
    }
}

// 2. Logika Range Cut-Off 16 - 15
function dapatkanRange(bulan, tahun) {
    const start = new Date(tahun, bulan - 1, 16);
    const end = new Date(tahun, bulan, 15);
    return {
        startStr: start.toISOString().split('T')[0],
        endStr: end.toISOString().split('T')[0]
    };
}

// 3. Rumus TUL
function hitungTUL(jam) {
    if (jam === 8) return 16;
    if (jam <= 0) return 0;
    return jam <= 1 ? jam * 1.5 : 1.5 + (jam - 1) * 2;
}

// 4. Tambah Data (Nama selalu Pajar Ardianto)
async function tambahData() {
    const nama = document.getElementById('nama').value; // Mengambil "Pajar Ardianto"
    const tanggal = document.getElementById('tanggal').value;
    const durasi = parseFloat(document.getElementById('durasi').value);
    const btn = document.getElementById('btnSimpan');

    if (!tanggal || isNaN(durasi)) return alert("Mohon lengkapi Tanggal dan Durasi!");

    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const { error } = await _supabase.from('data_lembur').insert([{ 
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

// 5. Render Data ke Tabel
async function renderData() {
    const dropdownValue = document.getElementById('pilihPeriode').value;
    if(!dropdownValue) return;
    
    const dropdown = JSON.parse(dropdownValue);
    const { startStr, endStr } = dapatkanRange(dropdown.bulan, dropdown.tahun);

    const { data, error } = await _supabase
        .from('data_lembur')
        .select('*')
        .gte('tanggal', startStr)
        .lte('tanggal', endStr)
        .order('tanggal', { ascending: false });
    
    if (error) return console.error(error);

    document.getElementById('labelPeriode').innerText = `${startStr} s/d ${endStr}`;
    const tbody = document.querySelector('#tabelLembur tbody');
    tbody.innerHTML = '';
    
    let total = 0;
    data.forEach(item => {
        total += item.tul;
        tbody.innerHTML += `<tr>
            <td>${item.tanggal}</td>
            <td>${item.nama}</td>
            <td>${item.durasi}j</td>
            <td><strong>${item.tul}</strong></td>
            <td><button class="btn-delete" onclick="hapusData(${item.id})">Hapus</button></td>
        </tr>`;
    });
    document.getElementById('totalTULBesar').innerText = total.toFixed(1);
}

async function hapusData(id) {
    if (confirm("Hapus data?")) {
        await _supabase.from('data_lembur').delete().eq('id', id);
        renderData();
    }
}

window.onload = () => {
    buatOpsiBulan();
    renderData();
};
