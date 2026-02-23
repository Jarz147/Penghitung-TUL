const SUPABASE_URL = 'https://synhvvaolrjxdcbyozld.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmh2dmFvbHJqeGRjYnlvemxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTAzNDMsImV4cCI6MjA1NTkyNjM0M30.nUe84WvI8r1_v9_m7_v_v_v_v_v_v_v_v_v_v_v_v'; 

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function hitungTUL(jam) {
    if (jam === 8) return 16;
    if (jam <= 0) return 0;
    return jam <= 1 ? jam * 1.5 : 1.5 + (jam - 1) * 2;
}

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
    return { startStr: start.toISOString().split('T')[0], endStr: end.toISOString().split('T')[0] };
}

async function tambahData() {
    const nama = document.getElementById('nama').value;
    const tanggal = document.getElementById('tanggal').value;
    const durasi = parseFloat(document.getElementById('durasi').value);
    if (!nama || !tanggal || isNaN(durasi)) return alert("Isi semua!");

    const { error } = await _supabase.from('data_lembur').insert([{ nama, tanggal, durasi, tul: hitungTUL(durasi) }]);
    if (error) alert(error.message);
    else { document.getElementById('durasi').value = ''; renderData(); }
}

async function renderData() {
    const { startStr, endStr } = getPeriode();
    const { data } = await _supabase.from('data_lembur').select('*').gte('tanggal', startStr).lte('tanggal', endStr).order('tanggal', { ascending: false });
    
    document.getElementById('labelPeriode').innerText = `Periode: ${startStr} - ${endStr}`;
    const tbody = document.querySelector('#tabelLembur tbody');
    tbody.innerHTML = '';
    let total = 0;
    data?.forEach(item => {
        total += item.tul;
        tbody.innerHTML += `<tr><td>${item.tanggal}</td><td>${item.nama}</td><td>${item.durasi}</td><td>${item.tul}</td><td><button class="btn-delete" onclick="hapusData(${item.id})">X</button></td></tr>`;
    });
    document.getElementById('totalTULBesar').innerText = total.toFixed(1);
}

async function hapusData(id) {
    if (confirm("Hapus?")) { await _supabase.from('data_lembur').delete().eq('id', id); renderData(); }
}

window.onload = renderData;
