// Global state
let currentPendingFile = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadProgressContainer = document.getElementById('upload-progress-container');
const uploadingFilename = document.getElementById('uploading-filename');
const uploadingPercent = document.getElementById('uploading-percent');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const filesTableBody = document.getElementById('files-table-body');
const logsTableBody = document.getElementById('logs-table-body');

// Stats DOM Elements
const statTotalFiles = document.getElementById('stat-total-files');
const statBlockedDuplicates = document.getElementById('stat-blocked-duplicates');
const statStorageSaved = document.getElementById('stat-storage-saved');
const storedCountTag = document.getElementById('stored-count');

// Modal DOM Elements
const exactDupModal = document.getElementById('exact-dup-modal');
const nearDupModal = document.getElementById('near-dup-modal');
const forceUploadBtn = document.getElementById('force-upload-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupDragAndDrop();
});

// --- API and Data Fetching ---
async function loadDashboardData() {
    try {
        await Promise.all([
            fetchStoredFiles(),
            fetchStats(),
            fetchDuplicateLogs()
        ]);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showToast("Failed to refresh dashboard data", "error");
    }
}

async function fetchStoredFiles() {
    const response = await fetch('/api/files');
    const files = await response.json();
    
    storedCountTag.textContent = `${files.length} File${files.length !== 1 ? 's' : ''}`;
    
    if (files.length === 0) {
        filesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty-state">
                    <div class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                    </div>
                    <p>No files securely stored yet. Upload a file to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filesTableBody.innerHTML = files.map(file => `
        <tr id="file-row-${file.id}">
            <td class="font-medium" title="${escapeHtml(file.filename)}">${escapeHtml(file.filename)}</td>
            <td>${formatBytes(file.file_size)}</td>
            <td><span class="category-pill ${file.category}">${escapeHtml(file.category)}</span></td>
            <td><code>${file.sha256_hash.substring(0, 8)}...${file.sha256_hash.substring(56)}</code></td>
            <td>${formatDate(file.upload_date)}</td>
            <td class="text-right">
                <div class="action-buttons">
                    <button class="btn-icon download" onclick="downloadFile(${file.id})" title="Download File">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteFile(${file.id})" title="Delete File">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function fetchStats() {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    statTotalFiles.textContent = stats.total_files;
    statBlockedDuplicates.textContent = stats.blocked_duplicates;
    statStorageSaved.textContent = formatBytes(stats.storage_saved_bytes);
}

async function fetchDuplicateLogs() {
    const response = await fetch('/api/duplicates');
    const logs = await response.json();
    
    if (logs.length === 0) {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty-state">
                    <div class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <p>Duplicate prevention history is clear. Storage efficiency is fully optimized.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    logsTableBody.innerHTML = logs.map(log => `
        <tr>
            <td>${formatDate(log.timestamp)}</td>
            <td class="font-medium" title="${escapeHtml(log.filename)}">${escapeHtml(log.filename)}</td>
            <td>${formatBytes(log.file_size)}</td>
            <td><span class="dup-badge ${log.duplicate_type}">${escapeHtml(log.duplicate_type)} Duplicate</span></td>
            <td><strong>${(log.similarity_score * 100).toFixed(1)}%</strong></td>
            <td title="${escapeHtml(log.target_file_name || 'Deleted file')}">${escapeHtml(log.target_file_name || 'Deleted file')}</td>
            <td class="highlight-green">+ ${formatBytes(log.file_size)}</td>
        </tr>
    `).join('');
}

// --- Drag and Drop File Handlers ---
function setupDragAndDrop() {
    // Click triggers file open dialog
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0]);
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

// --- File Upload Logic ---
function handleFileUpload(file, bypassNearDuplicate = false) {
    currentPendingFile = file;
    
    // UI Reset for progress bar
    uploadingFilename.textContent = file.name;
    uploadingPercent.textContent = "0%";
    uploadProgressBar.style.width = "0%";
    uploadProgressContainer.classList.remove('hidden');
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bypass_near_duplicate', bypassNearDuplicate ? 'true' : 'false');
    
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            uploadingPercent.textContent = `${percentComplete}%`;
            uploadProgressBar.style.width = `${percentComplete}%`;
        }
    });
    
    xhr.onload = async () => {
        uploadProgressContainer.classList.add('hidden');
        fileInput.value = ''; // Reset input element
        
        if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText);
            
            if (result.status === 'duplicate') {
                // Handle duplicate detection results
                await loadDashboardData(); // Update logs/stats immediately
                
                if (result.duplicate_type === 'exact') {
                    // Exact Duplicate blocked
                    showExactDupModal(file.name, file.size, result.existing_file);
                } else if (result.duplicate_type === 'near') {
                    // Near-Duplicate warning (NLP or Image)
                    showNearDupModal(file, result.similarity, result.existing_file);
                }
            } else if (result.status === 'success') {
                showToast(`Successfully uploaded "${file.name}"`);
                await loadDashboardData();
            }
        } else {
            console.error("Upload error response:", xhr.responseText);
            showToast("An error occurred during file upload", "error");
        }
    };
    
    xhr.onerror = () => {
        uploadProgressContainer.classList.add('hidden');
        fileInput.value = '';
        showToast("Network connection error. Upload failed.", "error");
    };
    
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
}

// --- Actions and Modals ---
function showExactDupModal(filename, size, existingFile) {
    document.getElementById('exact-file-name').textContent = filename;
    document.getElementById('exact-existing-name').textContent = existingFile.filename;
    document.getElementById('exact-file-size').textContent = formatBytes(size);
    document.getElementById('exact-file-hash').textContent = existingFile.sha256_hash;
    
    openModal('exact-dup-modal');
}

function showNearDupModal(file, similarity, existingFile) {
    // Set match score
    const percentStr = `${(similarity * 100).toFixed(1)}%`;
    document.getElementById('near-match-score').textContent = percentStr;
    document.getElementById('near-match-bar').style.width = percentStr;
    
    // Set Uploading File details
    document.getElementById('near-upload-name').textContent = file.name;
    document.getElementById('near-upload-size').textContent = formatBytes(file.size);
    
    const mime = file.type || 'unknown';
    let cat = 'Other';
    if (mime.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) cat = 'Text';
    if (mime.startsWith('image/')) cat = 'Image';
    document.getElementById('near-upload-cat').textContent = cat;
    
    // Set Matching Stored File details
    document.getElementById('near-existing-name').textContent = existingFile.filename;
    document.getElementById('near-existing-size').textContent = formatBytes(existingFile.file_size);
    document.getElementById('near-existing-cat').textContent = existingFile.category;
    
    // Set bypass trigger button
    forceUploadBtn.onclick = () => {
        closeModal('near-dup-modal');
        if (currentPendingFile) {
            handleFileUpload(currentPendingFile, true);
        }
    };
    
    openModal('near-dup-modal');
}

function cancelNearUpload() {
    closeModal('near-dup-modal');
    showToast("Upload canceled. Storage redundancy avoided.", "success");
    currentPendingFile = null;
}

function downloadFile(fileId) {
    window.location.href = `/api/download/${fileId}`;
}

async function deleteFile(fileId) {
    if (confirm("Are you sure you want to delete this file from secure storage?")) {
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast("File deleted successfully");
                await loadDashboardData();
            } else {
                showToast(result.detail || "Failed to delete file", "error");
            }
        } catch (error) {
            showToast("Network error deleting file", "error");
        }
    }
}

// Modal Toggle Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

// --- General Utility Helpers ---
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    // SQLite timestamps default to UTC strings like '2026-08-04 13:29:13'
    // Split and build a nicer format
    try {
        const parts = dateString.split(' ');
        if (parts.length >= 2) {
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].split(':');
            
            // Build local date
            const d = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1]),
                parseInt(timeParts[2].split('.')[0])
            );
            
            return d.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}
