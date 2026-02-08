// ============================================
// KALKULATOR MBG - CORE FUNCTIONALITY
// ============================================

const APP_CONFIG = {
    ISI_PER_IKAT: 5,
    STORAGE_KEY: 'dataMBG',
    APP_NAME: 'Kalkulator MBG',
    DEVELOPER: 'Fiqih Dimas',
    VERSION: 'v1.0.0'
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
    btnExportHTML: document.getElementById('btnExportHTML'),
    btnExportPDF: document.getElementById('btnExportPDF'),
    btnPrint: document.getElementById('btnPrint'),
    btnShare: document.getElementById('btnShare'),
    storageInfo: document.getElementById('storageInfo'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    confirmModal: document.getElementById('confirmModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalMessage: document.getElementById('modalMessage'),
    modalCancel: document.getElementById('modalCancel'),
    modalConfirm: document.getElementById('modalConfirm')
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    showPopupDeveloper();
    updateStorageInfo();
});

// ============================================
// FUNGSI UTILITAS
// ============================================

function showToast(message, type = 'success') {
    elements.toast.className = `toast show toast-${type}`;
    elements.toastMessage.textContent = message;
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function showConfirm(title, message, onConfirm) {
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    elements.confirmModal.classList.add('show');
    
    const handleConfirm = () => {
        onConfirm();
        elements.confirmModal.classList.remove('show');
        cleanup();
    };
    
    const handleCancel = () => {
        elements.confirmModal.classList.remove('show');
        cleanup();
    };
    
    const cleanup = () => {
        elements.modalConfirm.removeEventListener('click', handleConfirm);
        elements.modalCancel.removeEventListener('click', handleCancel);
    };
    
    elements.modalConfirm.addEventListener('click', handleConfirm, { once: true });
    elements.modalCancel.addEventListener('click', handleCancel, { once: true });
}

function updateStorageInfo() {
    const dataSize = JSON.stringify(dataMBG).length;
    const sizeInKB = (dataSize / 1024).toFixed(2);
    elements.storageInfo.innerHTML = `<i class="fas fa-database"></i> Storage: ${sizeInKB} KB`;
}

// ============================================
// FUNGSI DATA
// ============================================

function loadData() {
    const savedData = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    dataMBG = savedData ? JSON.parse(savedData) : [];
    render();
}

function saveData() {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(dataMBG));
    updateStorageInfo();
}

function setupEventListeners() {
    elements.btnSimpan.addEventListener('click', tambahData);
    elements.btnReset.addEventListener('click', resetForm);
    elements.btnHapusSemua.addEventListener('click', () => {
        showConfirm('Hapus Semua Data', 
                   `Anda akan menghapus ${dataMBG.length} data sekolah. Tindakan ini tidak dapat dibatalkan.`,
                   hapusSemua);
    });
    elements.btnExportHTML.addEventListener('click', exportHTML);
    elements.btnExportPDF.addEventListener('click', exportPDF);
    elements.btnPrint.addEventListener('click', printReport);
    elements.btnShare.addEventListener('click', shareData);
    
    // Close modal when clicking outside
    elements.confirmModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmModal) {
            elements.confirmModal.classList.remove('show');
        }
    });
}

function tambahData() {
    const nama = elements.namaInput.value.trim();
    const besar = parseInt(elements.besarInput.value) || 0;
    const kecil = parseInt(elements.kecilInput.value) || 0;
    
    if (!nama) {
        showToast('Nama sekolah harus diisi!', 'error');
        elements.namaInput.focus();
        return;
    }
    
    if (besar < 0 || kecil < 0) {
        showToast('Porsi tidak boleh negatif!', 'error');
        return;
    }
    
    const data = {
        id: Date.now(),
        nama: nama,
        besar: besar,
        kecil: kecil,
        tanggal: new Date().toLocaleDateString('id-ID')
    };
    
    if (isEditing) {
        dataMBG[editIndex] = data;
        isEditing = false;
        editIndex = null;
        elements.btnSimpan.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
        showToast('Data berhasil diperbarui!', 'success');
    } else {
        dataMBG.push(data);
        showToast('Data berhasil ditambahkan!', 'success');
    }
    
    saveData();
    render();
    resetForm();
}

function editData(index) {
    const data = dataMBG[index];
    elements.namaInput.value = data.nama;
    elements.besarInput.value = data.besar;
    elements.kecilInput.value = data.kecil;
    
    isEditing = true;
    editIndex = index;
    elements.btnSimpan.innerHTML = '<i class="fas fa-edit"></i> Update Data';
    
    // Scroll ke form
    document.getElementById('inputSection').scrollIntoView({ behavior: 'smooth' });
    elements.namaInput.focus();
    showToast('Edit mode aktif. Perbarui data dan klik Update.', 'info');
}

function hapusData(index) {
    const namaSekolah = dataMBG[index].nama;
    showConfirm('Hapus Data', 
               `Hapus data "${namaSekolah}"?`,
               () => {
                   dataMBG.splice(index, 1);
                   saveData();
                   render();
                   showToast('Data berhasil dihapus!', 'success');
               });
}

function hapusSemua() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk dihapus', 'info');
        return;
    }
    
    dataMBG = [];
    saveData();
    render();
    showToast('Semua data berhasil dihapus!', 'success');
}

function resetForm() {
    elements.namaInput.value = '';
    elements.besarInput.value = '';
    elements.kecilInput.value = '';
    elements.namaInput.focus();
    
    if (isEditing) {
        isEditing = false;
        editIndex = null;
        elements.btnSimpan.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
    }
}

function render() {
    elements.dataCount.textContent = dataMBG.length;
    
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
                        <span style="font-size: 0.8rem; color: var(--secondary); margin-left: 8px;">
                            (${data.tanggal})
                        </span>
                    </div>
                    <div class="data-actions">
                        <button class="action-btn edit-btn" onclick="editData(${index})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="hapusData(${index})" title="Hapus">
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

// ============================================
// FUNGSI EKSPOR & AKSI (YANG DIPERBAIKI)
// ============================================

function exportHTML() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk diexport', 'error');
        return;
    }
    
    try {
        const totalBesar = dataMBG.reduce((sum, data) => sum + data.besar, 0);
        const totalKecil = dataMBG.reduce((sum, data) => sum + data.kecil, 0);
        const besarIkat = Math.floor(totalBesar / APP_CONFIG.ISI_PER_IKAT);
        const besarOmpreng = totalBesar % APP_CONFIG.ISI_PER_IKAT;
        const kecilIkat = Math.floor(totalKecil / APP_CONFIG.ISI_PER_IKAT);
        const kecilOmpreng = totalKecil % APP_CONFIG.ISI_PER_IKAT;
        
        const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan MBG - ${new Date().toLocaleDateString('id-ID')}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background: #f8fafc; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; padding: 25px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border-radius: 16px; }
        h1 { font-size: 2rem; margin-bottom: 10px; }
        .subtitle { font-size: 1.1rem; opacity: 0.9; }
        .info-bar { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .info-item { text-align: center; }
        .info-label { font-size: 0.9rem; color: #64748b; margin-bottom: 5px; }
        .info-value { font-size: 1.8rem; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin: 25px 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        th { background: #2563eb; color: white; padding: 18px 15px; text-align: left; font-weight: 600; }
        td { padding: 16px 15px; border-bottom: 1px solid #e2e8f0; }
        tr:hover { background: #f1f5f9; }
        .total-section { background: white; padding: 25px; border-radius: 12px; margin-top: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .total-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-top: 20px; }
        .total-item { text-align: center; padding: 25px; background: #f8fafc; border-radius: 10px; }
        .total-label { font-size: 0.9rem; color: #64748b; margin-bottom: 10px; }
        .total-value { font-size: 2.5rem; font-weight: 800; color: #2563eb; margin-bottom: 15px; }
        .total-detail { font-size: 0.9rem; color: #64748b; }
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 0.9rem; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; padding: 4px 10px; background: #10b981; color: white; border-radius: 20px; font-size: 0.8rem; margin-left: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-calculator"></i> Laporan Kalkulator MBG</h1>
            <div class="subtitle">Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        
        <div class="info-bar">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Total Sekolah</div>
                    <div class="info-value">${dataMBG.length}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Data</div>
                    <div class="info-value">${totalBesar + totalKecil}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Diexport pada</div>
                    <div class="info-value">${new Date().toLocaleTimeString('id-ID')}</div>
                </div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama Sekolah</th>
                    <th>Tanggal</th>
                    <th>Porsi Besar</th>
                    <th>Porsi Kecil</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${dataMBG.map((data, index) => {
                    const total = data.besar + data.kecil;
                    return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${data.nama}</strong></td>
                    <td>${data.tanggal}</td>
                    <td>${data.besar}</td>
                    <td>${data.kecil}</td>
                    <td><span class="badge">${total}</span></td>
                </tr>
                `}).join('')}
            </tbody>
        </table>
        
        <div class="total-section">
            <h2 style="margin-bottom: 20px; color: #1e293b;">Ringkasan Total</h2>
            <div class="total-grid">
                <div class="total-item">
                    <div class="total-label">Total Porsi Besar</div>
                    <div class="total-value">${totalBesar}</div>
                    <div class="total-detail">Ikat: ${besarIkat} | Ompreng: ${besarOmpreng}</div>
                </div>
                <div class="total-item">
                    <div class="total-label">Total Porsi Kecil</div>
                    <div class="total-value">${totalKecil}</div>
                    <div class="total-detail">Ikat: ${kecilIkat} | Ompreng: ${kecilOmpreng}</div>
                </div>
                <div class="total-item">
                    <div class="total-label">Grand Total</div>
                    <div class="total-value">${totalBesar + totalKecil}</div>
                    <div class="total-detail">1 ikat = ${APP_CONFIG.ISI_PER_IKAT} porsi</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Laporan ini dihasilkan oleh ${APP_CONFIG.APP_NAME} ${APP_CONFIG.VERSION}</p>
            <p>Dikembangkan oleh ${APP_CONFIG.DEVELOPER} • ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>`;
        
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
    } catch (error) {
        console.error('Export error:', error);
        showToast('Gagal mengexport: ' + error.message, 'error');
    }
}

function exportPDF() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk diexport', 'error');
        return;
    }
    
    showToast('Fitur PDF memerlukan library tambahan. Gunakan Export HTML lalu cetak sebagai PDF.', 'info');
    
    // Fallback: Buka dialog print untuk save as PDF
    setTimeout(() => {
        if (confirm('Export PDF memerlukan library jsPDF. Ingin cetak halaman sebagai PDF?')) {
            printReport();
        }
    }, 1000);
}

function printReport() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk dicetak', 'error');
        return;
    }
    
    // Buat konten untuk dicetak
    const printWindow = window.open('', '_blank');
    const totalBesar = dataMBG.reduce((sum, data) => sum + data.besar, 0);
    const totalKecil = dataMBG.reduce((sum, data) => sum + data.kecil, 0);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Laporan MBG</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #2563eb; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; }
                th { background-color: #2563eb; color: white; }
                .total { font-weight: bold; background-color: #f0f0f0; }
                .footer { text-align: center; margin-top: 40px; color: #666; }
            </style>
        </head>
        <body>
            <h1>Laporan Kalkulator MBG</h1>
            <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
            <p><strong>Total Sekolah:</strong> ${dataMBG.length}</p>
            
            <table>
                <tr>
                    <th>No</th>
                    <th>Sekolah</th>
                    <th>Porsi Besar</th>
                    <th>Porsi Kecil</th>
                    <th>Total</th>
                </tr>
                ${dataMBG.map((data, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${data.nama}</td>
                    <td>${data.besar}</td>
                    <td>${data.kecil}</td>
                    <td>${data.besar + data.kecil}</td>
                </tr>
                `).join('')}
                <tr class="total">
                    <td colspan="2"><strong>TOTAL</strong></td>
                    <td><strong>${totalBesar}</strong></td>
                    <td><strong>${totalKecil}</strong></td>
                    <td><strong>${totalBesar + totalKecil}</strong></td>
                </tr>
            </table>
            
            <div class="footer">
                <p>${APP_CONFIG.APP_NAME} ${APP_CONFIG.VERSION} - Dikembangkan oleh ${APP_CONFIG.DEVELOPER}</p>
                <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showToast('Membuka jendela cetak...', 'info');
}

function shareData() {
    if (dataMBG.length === 0) {
        showToast('Tidak ada data untuk dibagikan', 'error');
        return;
    }
    
    const totalBesar = dataMBG.reduce((sum, data) => sum + data.besar, 0);
    const totalKecil = dataMBG.reduce((sum, data) => sum + data.kecil, 0);
    const totalAll = totalBesar + totalKecil;
    
    const text = `📊 Laporan Kalkulator MBG:
🏫 Total Sekolah: ${dataMBG.length}
🍛 Porsi Besar: ${totalBesar}
🥄 Porsi Kecil: ${totalKecil}
📈 Total Semua: ${totalAll}

📱 Aplikasi: ${APP_CONFIG.APP_NAME}
👨‍💻 Developer: ${APP_CONFIG.DEVELOPER}

${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Laporan Kalkulator MBG',
            text: text,
            url: window.location.href
        })
        .then(() => showToast('Berhasil dibagikan!', 'success'))
        .catch(err => {
            console.log('Share cancelled:', err);
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('Teks disalin ke clipboard!', 'success'))
        .catch(err => {
            console.error('Copy failed:', err);
            showToast('Gagal menyalin teks', 'error');
        });
}

// ============================================
// POPUP DEVELOPER (YANG DIPERBAIKI)
// ============================================

function showPopupDeveloper() {
    // Buat elemen popup developer
    const popupHTML = `
        <div id="developerPopup" class="developer-popup show">
            <div class="popup-content">
                <button class="popup-close" onclick="closePopupDeveloper()">&times;</button>
                <div class="popup-header">
                    <div class="popup-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <h2 class="popup-title">Dikembangkan oleh</h2>
                    <div class="developer-name">${APP_CONFIG.DEVELOPER}</div>
                </div>
                <div class="popup-body">
                    <p class="popup-message">
                        <i class="fas fa-calculator"></i> ${APP_CONFIG.APP_NAME} ${APP_CONFIG.VERSION}
                        <br>
                        Aplikasi kalkulator porsi makanan bergizi untuk sekolah
                    </p>
                    <div class="popup-stats">
                        <div class="stat-item">
                            <i class="fas fa-database"></i>
                            <span>Data: ${dataMBG.length} sekolah</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-save"></i>
                            <span>Storage: ${(JSON.stringify(dataMBG).length / 1024).toFixed(2)} KB</span>
                        </div>
                    </div>
                </div>
                <div class="popup-footer">
                    <p>© ${new Date().getFullYear()} • Dibuat dengan ❤️ untuk pendidikan</p>
                </div>
            </div>
        </div>
    `;
    
    // Tambahkan CSS untuk popup
    const style = document.createElement('style');
    style.textContent = `
        .developer-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s, visibility 0.4s;
            backdrop-filter: blur(5px);
        }
        .developer-popup.show {
            opacity: 1;
            visibility: visible;
        }
        .popup-content {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 24px;
            padding: 40px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 2px solid #2563eb;
            animation: popupAppear 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            color: white;
        }
        @keyframes popupAppear {
            0% { transform: scale(0.8) translateY(30px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .popup-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .popup-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }
        .popup-header {
            margin-bottom: 30px;
        }
        .popup-icon {
            font-size: 4rem;
            color: #60a5fa;
            margin-bottom: 20px;
            text-shadow: 0 5px 15px rgba(96, 165, 250, 0.4);
        }
        .popup-title {
            font-size: 1.1rem;
            color: #cbd5e1;
            margin-bottom: 10px;
            font-weight: 300;
        }
        .developer-name {
            font-size: 2.5rem;
            font-weight: bold;
            color: #60a5fa;
            margin-bottom: 10px;
            text-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        .popup-body {
            margin-bottom: 30px;
        }
        .popup-message {
            color: #cbd5e1;
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 1.1rem;
        }
        .popup-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 25px;
        }
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .stat-item i {
            font-size: 1.5rem;
            color: #60a5fa;
        }
        .stat-item span {
            font-size: 0.9rem;
            color: #94a3b8;
        }
        .popup-footer {
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8;
            font-size: 0.9rem;
        }
    `;
    
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Auto close setelah 5 detik
    setTimeout(closePopupDeveloper, 5000);
}

function closePopupDeveloper() {
    const popup = document.getElementById('developerPopup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 400);
    }
}

// ============================================
// EKSPOS FUNGSI KE GLOBAL
// ============================================

window.editData = editData;
window.hapusData = hapusData;
window.closePopupDeveloper = closePopupDeveloper;

// ============================================
// INISIALISASI TAMBAHAN
// ============================================

// Tambah keyboard shortcut
document.addEventListener('keydown', (e) => {
    // Ctrl+S untuk simpan
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        elements.btnSimpan.click();
    }
    
    // Esc untuk reset form
    if (e.key === 'Escape' && !isEditing) {
        elements.btnReset.click();
    }
});

// Tampilkan popup developer saat klik footer
document.querySelector('.footer-info').addEventListener('click', (e) => {
    e.preventDefault();
    showPopupDeveloper();
});

// ============================================
// POPUP DEVELOPER (YANG DIPERBAIKI) - FOOTER DIHAPUS
// ============================================

function showPopupDeveloper() {
    // Hapus popup sebelumnya jika ada
    const existingPopup = document.getElementById('developerPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Buat elemen popup developer
    const popupHTML = `
        <div id="developerPopup" class="developer-popup show">
            <div class="popup-content">
                <button class="popup-close" onclick="closePopupDeveloper()">&times;</button>
                <div class="popup-header">
                    <div class="popup-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <h2 class="popup-title">Kalkulator MBG</h2>
                    <div class="developer-name">${APP_CONFIG.DEVELOPER}</div>
                </div>
                <div class="popup-body">
                    <p class="popup-message">
                        Aplikasi untuk menghitung porsi makanan bergizi di sekolah
                        <br><br>
                        <small>Versi: ${APP_CONFIG.VERSION}</small>
                    </p>
                    <div class="popup-stats">
                        <div class="stat-item">
                            <i class="fas fa-school"></i>
                            <span>${dataMBG.length} Sekolah</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calculator"></i>
                            <span>${APP_CONFIG.ISI_PER_IKAT} porsi/ikat</span>
                        </div>
                    </div>
                </div>
                <div class="popup-footer">
                    <p>© ${new Date().getFullYear()} • Dibuat dengan ❤️</p>
                </div>
            </div>
        </div>
    `;
    
    // Tambahkan CSS untuk popup (jika belum ada)
    if (!document.getElementById('popupStyle')) {
        const style = document.createElement('style');
        style.id = 'popupStyle';
        style.textContent = `
            .developer-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s, visibility 0.4s;
                backdrop-filter: blur(5px);
            }
            .developer-popup.show {
                opacity: 1;
                visibility: visible;
            }
            .popup-content {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border-radius: 24px;
                padding: 40px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                border: 2px solid #2563eb;
                animation: popupAppear 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                color: white;
            }
            @keyframes popupAppear {
                0% { transform: scale(0.8) translateY(30px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .popup-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .popup-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }
            .popup-header {
                margin-bottom: 25px;
            }
            .popup-icon {
                font-size: 3.5rem;
                color: #60a5fa;
                margin-bottom: 15px;
                text-shadow: 0 5px 15px rgba(96, 165, 250, 0.4);
            }
            .popup-title {
                font-size: 1rem;
                color: #cbd5e1;
                margin-bottom: 8px;
                font-weight: 300;
            }
            .developer-name {
                font-size: 2.2rem;
                font-weight: bold;
                color: #60a5fa;
                margin-bottom: 10px;
                text-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
            }
            .popup-body {
                margin-bottom: 25px;
            }
            .popup-message {
                color: #cbd5e1;
                line-height: 1.6;
                margin-bottom: 20px;
                font-size: 1rem;
            }
            .popup-stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 20px;
            }
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .stat-item i {
                font-size: 1.3rem;
                color: #60a5fa;
            }
            .stat-item span {
                font-size: 0.85rem;
                color: #94a3b8;
            }
            .popup-footer {
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #94a3b8;
                font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Auto close setelah 5 detik
    setTimeout(closePopupDeveloper, 5000);
}

// ============================================
// INISIALISASI - Update bagian event listener
// ============================================

// Tambah event listener untuk tombol info developer
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    showPopupDeveloper(); // Muncul otomatis saat pertama kali
    
    // Setup tombol info developer
    const devInfoBtn = document.getElementById('devInfoBtn');
    if (devInfoBtn) {
        devInfoBtn.addEventListener('click', showPopupDeveloper);
    }
});