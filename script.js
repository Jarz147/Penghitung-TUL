const SUPABASE_URL = 'https://synhvvaolrjxdcbyozld.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmh2dmFvbHJqeGRjYnlvemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njg4NzEsImV4cCI6MjA4NTU0NDg3MX0.GSEfz8HVd49uEWXd70taR6FUv243VrFJKn6KlsZW-aQ'; 

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function buatOpsiBulan() {
    const select = document.getElementById('pilihPeriode');
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const skrg = new Date();
    for (let i = -6; i <= 1; i++) {
        let d = new Date(skrg.getFullYear(), skrg.getMonth() + i, 1);
        let opsi = document.createElement('option');
        opsi.value = JSON.stringify({ bulan: d.getMonth(), tahun: d.getFullYear() });
        opsi.text = `${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
        let hariIni = skrg.getDate();
        if (hariIni > 15 ? i === 1 : i === 0) opsi.selected = true;
        select.appendChild(opsi);
    }
}

function dapatkanRange(bulan, tahun) {
    const start = new Date(tahun, bulan - 1, 16);
    const end = new Date(tahun, bulan, 15);
    const f = (d) => d.toISOString().split('T')[0];
    return { startStr: f(start), endStr: f(end) };
}

function hitungTUL(jam) {
    if (jam === 8) return 16;
    return jam <= 1 ? jam * 1.5 : 1.5 + (jam - 1) * 2;
}

async function tambahData() {
    const tglEl = document.getElementById('tanggal');
    const jenisEl = document.getElementById('jenisLembur');
    const durasiEl = document.getElementById('durasi');
    const btn = document.getElementById('btnSimpan');

    if (!tglEl.value) return alert("Pilih tanggal!");

    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const { error } = await _supabase.from('data_lembur').insert([{ 
        nama: "Pajar Ardianto", 
        tanggal: tglEl.value, 
        durasi: parseFloat(durasiEl.value), 
        tul: hitungTUL(parseFloat(durasiEl.value)),
        keterangan: jenisEl.value // Kita simpan jenis lembur ke kolom keterangan
    }]);
    
    if (error) {
        alert("Gagal: " + error.message);
    } else {
        alert("Berhasil Disimpan!");
        // RESET INPUT
        tglEl.value = ""; 
        durasiEl.value = "8";
        jenisEl.selectedIndex = 0;
        renderData();
    }
    btn.disabled = false;
    btn.innerText = "Simpan Data";
}

async function renderData() {
    const dropdown = JSON.parse(document.getElementById('pilihPeriode').value);
    const { startStr, endStr } = dapatkanRange(dropdown.bulan, dropdown.tahun);
    document.getElementById('labelPeriode').innerText = `${startStr} s/d ${endStr}`;

    const { data, error } = await _supabase.from('data_lembur').select('*')
        .gte('tanggal', startStr).lte('tanggal', endStr).order('tanggal', { ascending: false });
    
    if (error) return;

    const tbody = document.querySelector('#tabelLembur tbody');
    tbody.innerHTML = '';
    let total = 0;

    data.forEach(item => {
        total += item.tul;
        tbody.innerHTML += `<tr>
            <td>${item.tanggal}</td>
            <td>${item.keterangan || '-'}</td>
            <td>${item.durasi}j</td>
            <td><strong>${item.tul}</strong></td>
            <td><button class="btn-delete" onclick="hapusData(${item.id})">Hapus</button></td>
        </tr>`;
    });
    document.getElementById('totalTULBesar').innerText = total.toFixed(1);
}

async function hapusData(id) {
    if (confirm("Hapus?")) { await _supabase.from('data_lembur').delete().eq('id', id); renderData(); }
}

window.onload = () => { buatOpsiBulan(); renderData(); };
