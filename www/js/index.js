// ============================================
// KALKULATOR MBG - CORE FUNCTIONALITY
// ============================================

const APP_CONFIG = {
    ISI_PER_IKAT: 5,
    STORAGE_KEY: 'dataMBG'
};

let dataMBG = [];
let isEditing = false;
let editIndex = null;

// DOM Elements
const elements = {
    namaInput: document.getElementById('namaSekolah'),
    besarInput: document.getElementById('porsiBesar'),
    kecilInput: document.getElementById('porsiKecil'),
    dataContainer: document.getElementById('dataContainer'),
    dataCount: document.getElementById('dataCount'),
    totalContainer: document.getElementById('totalContainer'),
    btnSimpan: document.getElementById('btnSimpan'),
    btnReset: document.getElementById('btnReset'),
    btnHapusSemua: document.getElementById('btnHapusSemua'),
    btnExportHTML: document.getElementById('btnExportHTML')
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    dataMBG = savedData ? JSON.parse(savedData) : [];
    render();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(dataMBG));
}

// Setup event listeners
function setupEventListeners() {
    elements.btnSimpan.addEventListener('click', tambahData);
    elements.btnReset.addEventListener('click', resetForm);
    elements.btnHapusSemua.addEventListener('click', hapusSemua);
    elements.btnExportHTML.addEventListener('click', exportHTML);
}

// Add/Edit data
function tambahData() {
    const nama = elements.namaInput.value.trim();
    const besar = parseInt(elements.besarInput.value) || 0;
    const kecil = parseInt(elements.kecilInput.value) || 0;
    
    if (!nama) {
        alert('Nama sekolah harus diisi!');
        return;
    }
    
    const data = {
        id: Date.now(),
        nama: nama,
        besar: besar,
        kecil: kecil
    };
    
    if (isEditing) {
        dataMBG[editIndex] = data;
        isEditing = false;
        editIndex = null;
        elements.btnSimpan.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
        alert('Data berhasil diupdate!');
    } else {
        dataMBG.push(data);
        alert('Data berhasil ditambahkan!');
    }
    
    saveData();
    render();
    resetForm();
}

// Edit data
function editData(index) {
    const data = dataMBG[index];
    elements.namaInput.value = data.nama;
    elements.besarInput.value = data.besar;
    elements.kecilInput.value = data.kecil;
    
    isEditing = true;
    editIndex = index;
    elements.btnSimpan.innerHTML = '<i class="fas fa-edit"></i> Update Data';
}

// Delete data
function hapusData(index) {
    if (confirm(`Hapus data "${dataMBG[index].nama}"?`)) {
        dataMBG.splice(index, 1);
        saveData();
        render();
        alert('Data berhasil dihapus!');
    }
}

// Delete all data
function hapusSemua() {
    if (dataMBG.length === 0) {
        alert('Tidak ada data untuk dihapus');
        return;
    }
    
    if (confirm(`Hapus semua data (${dataMBG.length} sekolah)?`)) {
        dataMBG = [];
        saveData();
        render();
        alert('Semua data berhasil dihapus!');
    }
}

// Reset form
function resetForm() {
    elements.namaInput.value = '';
    elements.besarInput.value = '';
    elements.kecilInput.value = '';
    elements.namaInput.focus();
}

// Render data list
function render() {
    // Update count
    elements.dataCount.textContent = dataMBG.length;
    
    // Render data list
    if (dataMBG.length === 0) {
        elements.dataContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>Belum ada data</h3>
                <p>Tambahkan data sekolah menggunakan form di atas</p>
            </div>
        `;
        renderTotal();
        return;
    }
    
    let html = '';
    let totalBesar = 0;
    let totalKecil = 0;
    
    dataMBG.forEach((data, index) => {
        const besarIkat = Math.floor(data.besar / APP_CONFIG.ISI_PER_IKAT);
        const besarOmpreng = data.besar % APP_CONFIG.ISI_PER_IKAT;
        const kecilIkat = Math.floor(data.kecil / APP_CONFIG.ISI_PER_IKAT);
        const kecilOmpreng = data.kecil % APP_CONFIG.ISI_PER_IKAT;
        
        totalBesar += data.besar;
        totalKecil += data.kecil;
        
        html += `
            <div class="data-item">
                <div class="data-header">
                    <div class="data-title">
                        <i class="fas fa-school"></i> ${data.nama}
                    </div>
                    <div class="data-actions">
                        <button class="action-btn edit-btn" onclick="editData(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="hapusData(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="data-content">
                    <div class="data-column">
                        <div class="data-label">Porsi Besar</div>
                        <div class="data-value">${data.besar}</div>
                        <div class="data-detail">
                            <span>Ikat: ${besarIkat}</span>
                            <span>Ompreng: ${besarOmpreng}</span>
                        </div>
                    </div>
                    <div class="data-column">
                        <div class="data-label">Porsi Kecil</div>
                        <div class="data-value">${data.kecil}</div>
                        <div class="data-detail">
                            <span>Ikat: ${kecilIkat}</span>
                            <span>Ompreng: ${kecilOmpreng}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    elements.dataContainer.innerHTML = html;
    renderTotal(totalBesar, totalKecil);
}

// Render total
function renderTotal(totalBesar = 0, totalKecil = 0) {
    const besarIkat = Math.floor(totalBesar / APP_CONFIG.ISI_PER_IKAT);
    const besarOmpreng = totalBesar % APP_CONFIG.ISI_PER_IKAT;
    const kecilIkat = Math.floor(totalKecil / APP_CONFIG.ISI_PER_IKAT);
    const kecilOmpreng = totalKecil % APP_CONFIG.ISI_PER_IKAT;
    
    elements.totalContainer.innerHTML = `
        <div class="total-grid">
            <div class="total-item">
                <div class="total-label">Porsi Besar</div>
                <div class="total-value">${totalBesar}</div>
                <div class="total-detail">
                    <span>Ikat: ${besarIkat}</span>
                    <span>Ompreng: ${besarOmpreng}</span>
                </div>
            </div>
            <div class="total-item">
                <div class="total-label">Porsi Kecil</div>
                <div class="total-value">${totalKecil}</div>
                <div class="total-detail">
                    <span>Ikat: ${kecilIkat}</span>
                    <span>Ompreng: ${kecilOmpreng}</span>
                </div>
            </div>
        </div>
        <div class="info-text">
            <i class="fas fa-info-circle"></i> 1 ikat = ${APP_CONFIG.ISI_PER_IKAT} porsi
        </div>
    `;
}

// Export HTML
function exportHTML() {
    if (dataMBG.length === 0) {
        alert('Tidak ada data untuk diexport');
        return;
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Laporan MBG</h2>
    <table>
        <tr><th>Sekolah</th><th>Besar</th><th>Kecil</th></tr>
        ${dataMBG.map(data => `
        <tr>
            <td>${data.nama}</td>
            <td>${data.besar}</td>
            <td>${data.kecil}</td>
        </tr>
        `).join('')}
    </table>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan_mbg.html';
    a.click();
    
    alert('Laporan berhasil diexport!');
}

// Make functions available globally
window.editData = editData;
window.hapusData = hapusData;