// 1. KONFIGURASI SUPABASE
const SUPABASE_URL = 'https://synhvvaolrjxdcbyozld.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmh2dmFvbHJqeGRjYnlvemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njg4NzEsImV4cCI6MjA4NTU0NDg3MX0.GSEfz8HVd49uEWXd70taR6FUv243VrFJKn6KlsZW-aQ'; 

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. FUNGSI PEMBUAT OPSI BULAN (DROPDOWN HISTORY)
function buatOpsiBulan() {
    const select = document.getElementById('pilihPeriode');
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const skrg = new Date();
    
    select.innerHTML = ''; // Bersihkan opsi lama

    // Tampilkan 6 bulan ke belakang hingga 1 bulan ke depan
    for (let i = -6; i <= 1; i++) {
        let d = new Date(skrg.getFullYear(), skrg.getMonth() + i, 1);
        let opsi = document.createElement('option');
        opsi.value = JSON.stringify({ bulan: d.getMonth(), tahun: d.getFullYear() });
        opsi.text = `${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
        
        // Pilih bulan berjalan secara otomatis berdasarkan cut-off
        // Jika hari ini > tanggal 15, maka otomatis pilih periode bulan depan
        let hariIni = skrg.getDate();
        if (i === 0 && hariIni <= 15) opsi.selected = true;
        if (i === 1 && hariIni > 15) opsi.selected = true;
        
        select.appendChild(opsi);
    }
}

// 3. LOGIKA RANGE CUT-OFF (16 Bulan Lalu s/d 15 Bulan Terpilih)
function dapatkanRange(bulan, tahun) {
    // Start: Tanggal 16 di bulan sebelumnya
    const start = new Date(tahun, bulan - 1, 16);
    // End: Tanggal 15 di bulan yang dipilih
    const end = new Date(tahun, bulan, 15);
    
    // Fungsi pembantu agar format tanggal tidak bergeser karena zona waktu
    const formatTanggal = (d) => {
        let m = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let y = d.getFullYear();
        if (m.length < 2) m = '0' + m;
        if (day.length < 2) day = '0' + day;
        return [y, m, day].join('-');
    };

    return {
        startStr: formatTanggal(start),
        endStr: formatTanggal(end)
    };
}

// 4. RUMUS TUL (Sesuai Permintaan)
function hitungTUL(jam) {
    if (jam === 8) return 16;
    if (jam <= 0) return 0;
    // Jam pertama 1.5, jam berikutnya kali 2
    return jam <= 1 ? jam * 1.5 : 1.5 + (jam - 1) * 2;
}

// 5. FUNGSI TAMBAH DATA
async function tambahData() {
    const nama = document.getElementById('nama').value;
    const tanggal = document.getElementById('tanggal').value;
    const durasi = parseFloat(document.getElementById('durasi').value);
    const btn = document.getElementById('btnSimpan');

    if (!tanggal) return alert("Silakan pilih tanggal terlebih dahulu!");

    btn.disabled = true;
    btn.innerText = "Proses Simpan...";

    const { error } = await _supabase.from('data_lembur').insert([{ 
        nama: nama, 
        tanggal: tanggal, 
        durasi: durasi, 
        tul: hitungTUL(durasi) 
    }]);
    
    if (error) {
        alert("Gagal menyimpan ke database: " + error.message);
    } else {
        alert("Data Pajar Berhasil Disimpan!");
        renderData();
    }
    btn.disabled = false;
    btn.innerText = "Simpan Data";
}

// 6. FUNGSI TAMPILKAN DATA (RENDER)
async function renderData() {
    const dropdownEl = document.getElementById('pilihPeriode');
    if (!dropdownEl.value) return;

    const selected = JSON.parse(dropdownEl.value);
    const { startStr, endStr } = dapatkanRange(selected.bulan, selected.tahun);

    // Update label periode di UI
    document.getElementById('labelPeriode').innerText = `${startStr} s/d ${endStr}`;

    const { data, error } = await _supabase
        .from('data_lembur')
        .select('*')
        .gte('tanggal', startStr)
        .lte('tanggal', endStr)
        .order('tanggal', { ascending: false });
    
    if (error) {
        console.error("Error ambil data:", error.message);
        return;
    }

    const tbody = document.querySelector('#tabelLembur tbody');
    tbody.innerHTML = '';
    
    let totalTUL = 0;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data pada periode ini.</td></tr>';
    } else {
        data.forEach(item => {
            totalTUL += item.tul;
            tbody.innerHTML += `
                <tr>
                    <td>${item.tanggal}</td>
                    <td>${item.nama}</td>
                    <td>${item.durasi} Jam</td>
                    <td><strong>${item.tul}</strong></td>
                    <td><button class="btn-delete" onclick="hapusData(${item.id})">Hapus</button></td>
                </tr>`;
        });
    }
    
    // Tampilkan total dengan 1 angka di belakang koma
    document.getElementById('totalTULBesar').innerText = totalTUL.toFixed(1);
}

// 7. FUNGSI HAPUS DATA
async function hapusData(id) {
    if (confirm("Yakin ingin menghapus data lembur ini?")) {
        const { error } = await _supabase.from('data_lembur').delete().eq('id', id);
        if (error) alert("Gagal menghapus: " + error.message);
        renderData();
    }
}

// 8. JALANKAN SAAT HALAMAN DIBUKA
window.onload = () => {
    buatOpsiBulan();
    renderData();
};
