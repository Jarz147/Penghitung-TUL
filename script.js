const SUPABASE_URL = 'https://synhvvaolrjxdcbyozld.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmh2dmFvbHJqeGRjYnlvemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njg4NzEsImV4cCI6MjA4NTU0NDg3MX0.GSEfz8HVd49uEWXd70taR6FUv243VrFJKn6KlsZW-aQ'; 

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Konfigurasi user dan PIN sederhana (PIN = NPK)
const USERS = [
    { nama: 'Arif Mustaqim', pin: '18170203' },
    { nama: 'Muhammad Yusuf bin mahmud', pin: '18120023' },
    { nama: 'Dikdik abdul aziz', pin: '18160165' },
    { nama: 'Wawan Gianto', pin: '18130057' },
    { nama: 'Aryo Setioko', pin: '18160166' },
    { nama: 'Wisnu Ernandi', pin: '18190283' },
    { nama: 'Nur Rohmat', pin: '18140079' },
    { nama: 'Budi Irawan', pin: '18160167' },
    { nama: 'Pajar Ardianto', pin: '18200317' },
    { nama: 'Iwan Prasetyo', pin: '18210362' },
    { nama: 'Azkia Rasya Ikbar', pin: '18220408' },
    { nama: 'Irwan Bagustian', pin: '18230476' },
    { nama: 'Randika Septian', pin: '18230468' },
    { nama: 'Achmad Shobirin', pin: '18200329' },
];

let currentUser = null;

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
    // Format tanggal pakai waktu lokal (bukan UTC) supaya tidak mundur 1 hari
    const f = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    return { startStr: f(start), endStr: f(end) };
}

function hitungTUL(jam) {
    if (jam === 8) return 16;
    return jam <= 1 ? jam * 1.5 : 1.5 + (jam - 1) * 2;
}

async function tambahData() {
    const namaEl = document.getElementById('nama');
    const tglEl = document.getElementById('tanggal');
    const jenisEl = document.getElementById('jenisLembur');
    const detailEl = document.getElementById('detailPekerjaan');
    const durasiEl = document.getElementById('durasi');
    const btn = document.getElementById('btnSimpan');

    if (!tglEl.value) return alert("Pilih tanggal!");

    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const { error } = await _supabase.from('data_lembur').insert([{ 
        nama: namaEl.value, 
        tanggal: tglEl.value, 
        durasi: parseFloat(durasiEl.value), 
        tul: hitungTUL(parseFloat(durasiEl.value)),
        keterangan: detailEl.value 
            ? `${jenisEl.value} - ${detailEl.value}` 
            : jenisEl.value
    }]);
    
    if (error) {
        alert("Gagal: " + error.message);
    } else {
        alert("Berhasil Disimpan!");
        // RESET INPUT
        tglEl.value = ""; 
        durasiEl.value = "8";
        jenisEl.selectedIndex = 0;
        if (detailEl) detailEl.value = "";
        renderData();
    }
    btn.disabled = false;
    btn.innerText = "Simpan Data";
}

async function renderData() {
    const namaEl = document.getElementById('nama');
    const dropdown = JSON.parse(document.getElementById('pilihPeriode').value);
    const { startStr, endStr } = dapatkanRange(dropdown.bulan, dropdown.tahun);
    document.getElementById('labelPeriode').innerText = `${startStr} s/d ${endStr}`;

    const { data, error } = await _supabase.from('data_lembur').select('*')
        .eq('nama', namaEl.value)
        .gte('tanggal', startStr)
        .lte('tanggal', endStr)
        .order('tanggal', { ascending: false });
    
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

function isKlasemenTerbuka() {
    const el = document.getElementById('viewKlasemen');
    return el && el.style.display !== 'none';
}

function onPeriodeChanged() {
    renderData();
    if (isKlasemenTerbuka()) {
        tampilkanGrafik();
    }
}

function bukaKlasemen() {
    const app = document.getElementById('appSection');
    if (app) app.classList.add('container--wide');
    document.getElementById('viewInput').style.display = 'none';
    const headerStats = document.getElementById('headerStats');
    if (headerStats) headerStats.style.display = 'none';
    document.getElementById('viewKlasemen').style.display = 'block';
    const btn = document.getElementById('btnKlasemen');
    if (btn) btn.style.display = 'none';
    tampilkanGrafik();
}

function tutupKlasemen() {
    const app = document.getElementById('appSection');
    if (app) app.classList.remove('container--wide');
    document.getElementById('viewInput').style.display = 'block';
    const headerStats = document.getElementById('headerStats');
    if (headerStats) headerStats.style.display = 'block';
    document.getElementById('viewKlasemen').style.display = 'none';
    const btn = document.getElementById('btnKlasemen');
    if (btn) btn.style.display = 'block';
    if (chartLembur) {
        chartLembur.destroy();
        chartLembur = null;
    }
}

let chartLembur = null;

async function tampilkanGrafik() {
    const dropdown = JSON.parse(document.getElementById('pilihPeriode').value);
    const { startStr, endStr } = dapatkanRange(dropdown.bulan, dropdown.tahun);

    const { data, error } = await _supabase
        .from('data_lembur')
        .select('nama, tul')
        .gte('tanggal', startStr)
        .lte('tanggal', endStr);

    if (error) {
        alert('Gagal mengambil data grafik: ' + error.message);
        return;
    }

    const totalsMap = {};
    (data || []).forEach((row) => {
        const n = row.nama;
        totalsMap[n] = (totalsMap[n] || 0) + Number(row.tul);
    });
    const aggregated = Object.entries(totalsMap)
        .map(([nama, total_tul]) => ({ nama, total_tul }))
        .sort((a, b) => b.total_tul - a.total_tul);

    if (aggregated.length === 0) {
        alert('Tidak ada data lembur di periode ini.');
        return;
    }

    const batasAtasEl = document.getElementById('batasAtasGrafik');
    const limitEl = document.getElementById('limitGrafik');
    const batasAtas = batasAtasEl && batasAtasEl.value ? parseFloat(batasAtasEl.value) : null;
    const limit = limitEl && limitEl.value ? parseFloat(limitEl.value) : null;

    const labels = aggregated.map((item) => item.nama);
    const totals = aggregated.map((item) => item.total_tul);

    const ctx = document.getElementById('grafikLembur').getContext('2d');

    if (chartLembur) {
        chartLembur.destroy();
    }

    chartLembur = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Total TUL',
                    data: totals,
                    backgroundColor: 'rgba(37, 99, 235, 0.6)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1,
                },
                ...(limit !== null
                    ? [
                          {
                              label: 'Limit',
                              type: 'line',
                              data: labels.map(() => limit),
                              borderColor: 'rgba(239, 68, 68, 1)',
                              borderWidth: 2,
                              pointRadius: 0,
                              fill: false,
                          },
                      ]
                    : []),
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 35,
                        autoSkip: false,
                        font: { size: 10 },
                    },
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: batasAtas || undefined,
                },
            },
        },
    });
}

async function hapusData(id) {
    if (confirm("Hapus?")) { await _supabase.from('data_lembur').delete().eq('id', id); renderData(); }
}

function syncUserToForm() {
    const namaSelect = document.getElementById('nama');
    if (!namaSelect || !currentUser) return;
    namaSelect.value = currentUser.nama;
    namaSelect.disabled = true;
}

function handleLogin() {
    const nama = document.getElementById('loginNama').value;
    const pin = document.getElementById('loginPin').value;

    const user = USERS.find((u) => u.nama === nama && u.pin === pin);
    if (!user) {
        alert('Nama atau PIN salah.');
        return;
    }

    currentUser = { nama: user.nama };
    localStorage.setItem('currentUserNama', currentUser.nama);

    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';

    syncUserToForm();
    renderData();
}

window.onload = () => {
    buatOpsiBulan();

    const savedNama = localStorage.getItem('currentUserNama');
    if (savedNama) {
        const user = USERS.find((u) => u.nama === savedNama);
        if (user) {
            currentUser = { nama: user.nama };
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('appSection').style.display = 'block';
            syncUserToForm();
            renderData();
            return;
        }
    }

    // Jika belum login, hanya tampilkan form login
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('appSection').style.display = 'none';
};
