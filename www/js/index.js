// ============================================
// KALKULATOR MBG - MAIN APPLICATION
// ============================================

// Konstanta aplikasi
const APP_CONFIG = {
    ISI_PER_IKAT: 5,
    APP_NAME: 'Kalkulator MBG',
    APP_VERSION: '1.0.0',
    STORAGE_KEY: 'dataMBG'
};

// State management
let dataMBG = [];
let isEditing = false;
let editIndex = null;
let modalCallback = null;

// DOM Elements
const dom = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    loadData();
    setupEventListeners();
    showWelcomeMessage();
});

function initializeDOM() {
    // Cache DOM elements untuk performa
    dom.namaInput = document.getElementById('namaSekolah');
    dom.besarInput = document.getElementById('porsiBesar');
    dom.kecilInput = document.getElementById('porsiKecil');
    dom.dataContainer = document.getElementById('dataContainer');
    dom.dataCount = document.getElementById('dataCount');
    dom.totalContainer = document.getElementById('totalContainer');
    dom.storageInfo = document.getElementById('storageInfo');
    dom.toast = document.getElementById('toast');
    dom.toastMessage = document.getElementById('toastMessage');
    dom.modal = document.getElementById('confirmModal');
    dom.modalTitle = document.getElementById('modalTitle');
    dom.modalMessage = document.getElementById('modalMessage');
    dom.modalConfirm = document.getElementById('modalConfirm');
    dom.modalCancel = document.getElementById('modalCancel');
    
    // Button references
    dom.btnSimpan = document.getElementById('btnSimpan');
    dom.btnReset = document.getElementById('btnReset');
    dom.btnHapusSemua = document.getElementById('btnHapusSemua');
    dom.btnExportHTML = document.getElementById('btnExportHTML');
    dom.btnExportPDF = document.getElementById('btnExportPDF');
    dom.btnPrint = document.getElementById('btnPrint');
    dom.btnShare = document.getElementById('btnShare');
}

function loadData() {
    try {
        const savedData = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
        dataMBG = savedData ? JSON.parse(savedData) : [];
        updateStorageInfo();
        render();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading saved data', 'error');
        dataMBG = [];
    }
}

function setupEventListeners() {
    // Form submission
    dom.btnSimpan.addEventListener('click', tambahData);
    dom.btnReset.addEventListener('click', resetForm);
    dom.btnHapusSemua.addEventListener('click', confirmHapusSemua);
    
    // Export & Actions
    dom.btnExportHTML.addEventListener('click', exportHTML);
    dom.btnExportPDF.addEventListener('click', exportPDF);
    dom.btnPrint.addEventListener('click', printReport);
    dom.btnShare.addEventListener('click', shareReport);
    
    // Modal buttons
    dom.modalConfirm.addEventListener('click', function() {
        if (modalCallback) modalCallback();
        hideModal();
    });
    
    dom.modalCancel.addEventListener('click', hideModal);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            tambahData();
        }
        
        if (e.key === 'Escape') {
            resetForm();
        }
        
        if (e.key === 'Enter' && (e.target === dom.namaInput || 
                                  e.target === dom.besarInput || 
                                  e.target === dom.kecilInput)) {
            tambahData();
        }
    });
    
    // Close modal on outside click
    dom.modal.addEventListener('click', function(e) {
        if (e.target === dom.modal) {
            hideModal();
        }
    });
}

function showWelcomeMessage() {
    if (!localStorage.getItem('welcomeShown')) {
        showToast(`Selamat datang di ${APP_CONFIG.APP_NAME}!`, 'info');
        localStorage.setItem('welcomeShown', 'true');
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

function saveToStorage() {
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(dataMBG));
        updateStorageInfo();
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('Error saving data to storage', 'error');
        return false;
    }
}

function updateStorageInfo() {
    const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY) || '[]';
    const size = new Blob([data]).size;
    const kb = (size / 1024).toFixed(2);
    dom.storageInfo.innerHTML = `<i class="fas fa-database"></i> Storage: ${kb} KB`;
}

// ============================================
// FORM HANDLING
// ============================================

function tambahData() {
    // Get form values
    const nama = dom.namaInput.value.trim();
    const besar = parseInt(dom.besarInput.value) || 0;
    const kecil = parseInt(dom.kecilInput.value) || 0;
    
    // Validation
    if (!nama) {
        showToast('Nama sekolah harus diisi!', 'error');
        dom.namaInput.focus();
        return;
    }
    
    if (besar < 0 || kecil < 0) {
        showToast('Porsi tidak boleh negatif!', 'error');
        return;
    }
    
    if (isNaN(besar) || isNaN(kecil)) {
        showToast('Porsi harus berupa angka!', 'error');
        return;
    }
    
    // Create data object
    const data = {
        id: Date.now(),
        nama: nama,
        besar: besar,
        kecil: kecil,
        tanggal: new Date().toISOString()
    };
    
    if (isEditing && editIndex !== null) {
        // Update existing data
        dataMBG[editIndex] = data;
        showToast('Data berhasil diupdate!', 'success');
        isEditing = false;
        editIndex = null;
    } else {
        // Add new data
        dataMBG.push(data);
        showToast('Data berhasil ditambahkan!', 'success');
    }
    
    // Save and render
    saveToStorage();
    render();
    resetForm();
    
    // Scroll to data section
    document.getElementById('dataSection').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function editData(index) {
    const data = dataMBG[index];
    
    // Fill form with data
    dom.namaInput.value = data.nama;
    dom.besarInput.value = data.besar;
    dom.kecilInput.value = data.kecil;
    
    // Set editing state
    isEditing = true;
    editIndex = index;
    
    // Update UI
    dom.btnSimpan.innerHTML = '<i class="fas fa-edit"></i> Update Data';
    dom.btnSimpan.classList.add('btn-warning');
    dom.btnSimpan.classList.remove('btn-primary');
    
    showToast('Edit mode aktif. Ubah data dan klik Update.', 'info');
    dom.namaInput.focus();
}

function hapusData(index) {
    showModal(
        'Hapus Data',
        `Apakah Anda yakin ingin menghapus data "${dataMBG[index].nama}"?`,
        function() {
            dataMBG.splice(index, 1);
            saveToStorage();
            render();
            showToast('Data berhasil dihapus!', 'success');
        }
    );
}

function confirmHapusSemua() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk dihapus', 'warning');
        return;
    }
    
    showModal(
        'Hapus Semua Data',
        `Anda akan menghapus semua data (${dataMBG.length} sekolah). Tindakan ini tidak dapat dibatalkan.`,
        function() {
            dataMBG = [];
            saveToStorage();
            render();
            showToast('Semua data berhasil dihapus!', 'success');
        }
    );
}

function resetForm() {
    dom.namaInput.value = '';
    dom.besarInput.value = '';
    dom.kecilInput.value = '';
    
    // Reset editing state
    isEditing = false;
    editIndex = null;
    
    // Reset button
    dom.btnSimpan.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
    dom.btnSimpan.classList.remove('btn-warning');
    dom.btnSimpan.classList.add('btn-primary');
    
    dom.namaInput.focus();
    showToast('Form telah direset', 'info');
}

// ============================================
// RENDERING
// ============================================

function render() {
    renderDataList();
    renderTotal();
    updateDataCount();
}

function renderDataList() {
    if (dataMBG.length === 0) {
        dom.dataContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>Belum ada data</h3>
                <p>Tambahkan data sekolah menggunakan form di atas</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    dataMBG.forEach((data, index) => {
        // Calculate ikat and ompreng
        const besarIkat = Math.floor(data.besar / APP_CONFIG.ISI_PER_IKAT);
        const besarOmpreng = data.besar % APP_CONFIG.ISI_PER_IKAT;
        const kecilIkat = Math.floor(data.kecil / APP_CONFIG.ISI_PER_IKAT);
        const kecilOmpreng = data.kecil % APP_CONFIG.ISI_PER_IKAT;
        
        html += `
            <div class="data-item" data-id="${data.id}">
                <div class="data-header">
                    <div class="data-title">
                        <i class="fas fa-school"></i> ${data.nama}
                    </div>
                    <div class="data-actions">
                        <button class="action-btn edit-btn" onclick="editData(${index})" 
                                title="Edit data">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="hapusData(${index})" 
                                title="Hapus data">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="data-content">
                    <div class="data-column">
                        <div class="data-label">Porsi Besar</div>
                        <div class="data-value">${data.besar}</div>
                        <div class="data-detail">
                            <span><i class="fas fa-link"></i> Ikat: ${besarIkat}</span>
                            <span><i class="fas fa-utensils"></i> Ompreng: ${besarOmpreng}</span>
                        </div>
                    </div>
                    <div class="data-column">
                        <div class="data-label">Porsi Kecil</div>
                        <div class="data-value">${data.kecil}</div>
                        <div class="data-detail">
                            <span><i class="fas fa-link"></i> Ikat: ${kecilIkat}</span>
                            <span><i class="fas fa-utensil-spoon"></i> Ompreng: ${kecilOmpreng}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    dom.dataContainer.innerHTML = html;
}

function renderTotal() {
    let totalBesar = 0;
    let totalKecil = 0;
    
    dataMBG.forEach(data => {
        totalBesar += data.besar;
        totalKecil += data.kecil;
    });
    
    const besarIkat = Math.floor(totalBesar / APP_CONFIG.ISI_PER_IKAT);
    const besarOmpreng = totalBesar % APP_CONFIG.ISI_PER_IKAT;
    const kecilIkat = Math.floor(totalKecil / APP_CONFIG.ISI_PER_IKAT);
    const kecilOmpreng = totalKecil % APP_CONFIG.ISI_PER_IKAT;
    
    dom.totalContainer.innerHTML = `
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

function updateDataCount() {
    dom.dataCount.textContent = dataMBG.length;
}

// ============================================
// EXPORT & SHARING
// ============================================

function exportHTML() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk diexport', 'warning');
        return;
    }
    
    // Calculate totals
    let totalBesar = 0, totalKecil = 0;
    dataMBG.forEach(data => {
        totalBesar += data.besar;
        totalKecil += data.kecil;
    });
    
    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan MBG - ${new Date().toLocaleDateString('id-ID')}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f7ff;
            color: #2563eb;
        }
        .total-row {
            background-color: #eff6ff;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .info-box {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN MBG</h1>
        <p>Tanggal: ${new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</p>
        <p>Waktu: ${new Date().toLocaleTimeString('id-ID')}</p>
    </div>
    
    <div class="info-box">
        <p><strong>Total Sekolah:</strong> ${dataMBG.length}</p>
        <p><strong>Total Porsi Besar:</strong> ${totalBesar}</p>
        <p><strong>Total Porsi Kecil:</strong> ${totalKecil}</p>
        <p><strong>Konversi:</strong> 1 ikat = ${APP_CONFIG.ISI_PER_IKAT} porsi</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Sekolah</th>
                <th>Porsi Besar</th>
                <th>Ikat</th>
                <th>Ompreng</th>
                <th>Porsi Kecil</th>
                <th>Ikat</th>
                <th>Ompreng</th>
            </tr>
        </thead>
        <tbody>
            ${dataMBG.map((data, index) => {
                const besarIkat = Math.floor(data.besar / APP_CONFIG.ISI_PER_IKAT);
                const besarOmpreng = data.besar % APP_CONFIG.ISI_PER_IKAT;
                const kecilIkat = Math.floor(data.kecil / APP_CONFIG.ISI_PER_IKAT);
                const kecilOmpreng = data.kecil % APP_CONFIG.ISI_PER_IKAT;
                
                return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${data.nama}</td>
                    <td>${data.besar}</td>
                    <td>${besarIkat}</td>
                    <td>${besarOmpreng}</td>
                    <td>${data.kecil}</td>
                    <td>${kecilIkat}</td>
                    <td>${kecilOmpreng}</td>
                </tr>
                `;
            }).join('')}
            
            <tr class="total-row">
                <td colspan="2"><strong>TOTAL</strong></td>
                <td>${totalBesar}</td>
                <td>${Math.floor(totalBesar / APP_CONFIG.ISI_PER_IKAT)}</td>
                <td>${totalBesar % APP_CONFIG.ISI_PER_IKAT}</td>
                <td>${totalKecil}</td>
                <td>${Math.floor(totalKecil / APP_CONFIG.ISI_PER_IKAT)}</td>
                <td>${totalKecil % APP_CONFIG.ISI_PER_IKAT}</td>
            </tr>
        </tbody>
    </table>
    
    <div class="footer">
        <p><i>Dokumen ini dihasilkan oleh ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}</i></p>
        <p><i>Developed by Fiqih Dimas</i></p>
        <p><i>${window.location.href || 'Local Application'}</i></p>
    </div>
</body>
</html>`;
    
    // Create and download file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_MBG_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Laporan HTML berhasil diexport!', 'success');
}

function exportPDF() {
    showToast('Fitur PDF export memerlukan Cordova plugin', 'info');
    // Untuk implementasi lengkap, butuh cordova-plugin-file-opener2
}

function printReport() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk dicetak', 'warning');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Cetak Laporan MBG</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h1 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #333; padding: 8px; text-align: center; }
                th { background-color: #f0f0f0; }
                @media print {
                    body { padding: 0; margin: 0; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>LAPORAN MBG</h1>
            <p style="text-align: center;">
                Tanggal: ${new Date().toLocaleDateString('id-ID')}
            </p>
            <table>
                <tr>
                    <th>No</th>
                    <th>Sekolah</th>
                    <th>Besar</th>
                    <th>Kecil</th>
                </tr>
                ${dataMBG.map((data, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${data.nama}</td>
                    <td>${data.besar}</td>
                    <td>${data.kecil}</td>
                </tr>
                `).join('')}
            </table>
            <div style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; margin: 5px;">
                    🖨️ Cetak
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; margin: 5px;">
                    ❌ Tutup
                </button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function shareReport() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk dibagikan', 'warning');
        return;
    }
    
    // Calculate totals
    let totalBesar = 0, totalKecil = 0;
    dataMBG.forEach(data => {
        totalBesar += data.besar;
        totalKecil += data.kecil;
    });
    
    const shareText = 
        `📊 Laporan MBG\n` +
        `📅 ${new Date().toLocaleDateString('id-ID')}\n` +
        `🏫 ${dataMBG.length} Sekolah\n` +
        `🍽️ Porsi Besar: ${totalBesar}\n` +
        `🥄 Porsi Kecil: ${totalKecil}\n` +
        `🔗 1 ikat = ${APP_CONFIG.ISI_PER_IKAT} porsi\n\n` +
        `Dihasilkan oleh ${APP_CONFIG.APP_NAME}\n` +
        `Developed by Fiqih Dimas`;
    
    // Try Web Share API first
    if (navigator.share) {
        navigator.share({
            title: 'Laporan MBG',
            text: shareText,
            url: window.location.href
        })
        .then(() => showToast('Berhasil dibagikan!', 'success'))
        .catch(err => {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        });
    } else {
        // Fallback to clipboard
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('Teks berhasil disalin ke clipboard!', 'success'))
        .catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Teks berhasil disalin!', 'success');
        });
}

// ============================================
// UI COMPONENTS (Toast & Modal)
// ============================================

function showToast(message, type = 'success') {
    // Remove existing classes
    dom.toast.className = 'toast';
    
    // Add new classes
    dom.toast.classList.add(`toast-${type}`);
    dom.toast.classList.add('show');
    dom.toastMessage.textContent = message;
    
    // Update icon based on type
    const icon = dom.toast.querySelector('.toast-icon');
    if (icon) {
        switch(type) {
            case 'success': icon.className = 'fas fa-check-circle toast-icon'; break;
            case 'error': icon.className = 'fas fa-exclamation-circle toast-icon'; break;
            case 'warning': icon.className = 'fas fa-exclamation-triangle toast-icon'; break;
            case 'info': icon.className = 'fas fa-info-circle toast-icon'; break;
        }
    }
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        dom.toast.classList.remove('show');
    }, 3000);
}

function showModal(title, message, callback) {
    dom.modalTitle.textContent = title;
    dom.modalMessage.textContent = message;
    modalCallback = callback;
    dom.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    dom.modal.classList.remove('show');
    modalCallback = null;
    document.body.style.overflow = '';
}

// ============================================
// WINDOW EXPORTS (untuk onclick di HTML)
// ============================================

// Export fungsi yang dipanggil dari onclick di HTML
window.tambahData = tambahData;
window.editData = editData;
window.hapusData = hapusData;
window.resetForm = resetForm;
window.confirmHapusSemua = confirmHapusSemua;
window.exportHTML = exportHTML;
window.exportPDF = exportPDF;
window.printReport = printReport;
window.shareReport = shareReport;

// ============================================
// CORDOVA SPECIFIC FUNCTIONS
// ============================================

// Fungsi yang akan dipanggil saat Cordova ready
function onDeviceReady() {
    console.log('Cordova device ready');
    
    // Add Cordova specific features here
    if (typeof cordova !== 'undefined') {
        showToast('Aplikasi siap digunakan!', 'success');
        
        // Back button handler for Android
        document.addEventListener('backbutton', function(e) {
            e.preventDefault();
            showToast('Tekan kembali lagi untuk keluar', 'info');
            
            // Double tap to exit
            setTimeout(() => {
                document.removeEventListener('backbutton', arguments.callee);
            }, 2000);
        }, false);
    }
}

// Event listener untuk Cordova
if (typeof cordova !== 'undefined') {
    document.addEventListener('deviceready', onDeviceReady, false);
}

// ============================================
// DEBUG & DEVELOPMENT HELPERS
// ============================================

// Untuk debugging di console
window.appDebug = {
    getData: () => dataMBG,
    clearData: () => {
        dataMBG = [];
        saveToStorage();
        render();
        showToast('Data cleared for debugging', 'warning');
    },
    addSampleData: () => {
        const samples = [
            { nama: 'SDN 01 Jakarta', besar: 23, kecil: 17 },
            { nama: 'SDN 02 Bandung', besar: 18, kecil: 12 },
            { nama: 'SDN 03 Surabaya', besar: 32, kecil: 24 }
        ];
        
        samples.forEach(sample => {
            dataMBG.push({
                id: Date.now() + Math.random(),
                ...sample,
                tanggal: new Date().toISOString()
            });
        });
        
        saveToStorage();
        render();
        showToast('Sample data added', 'info');
    }
};

console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION} initialized`);