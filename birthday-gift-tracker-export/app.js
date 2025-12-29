// Birthday Gift Tracker - Standalone Version
// All data stored in localStorage

// ============================================
// DATA MANAGEMENT
// ============================================

// Initialize or get data from localStorage
function getData(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// STATE MANAGEMENT
// ============================================

let state = {
    currentView: 'dashboard',
    currentKidId: null,
    currentYear: new Date().getFullYear(),
    showYearPicker: false
};

// ============================================
// KID FUNCTIONS
// ============================================

function getKids() {
    return getData('kids', []);
}

function saveKids(kids) {
    setData('kids', kids);
}

function addKid(kidData) {
    const kids = getKids();
    const newKid = {
        id: generateId(),
        ...kidData,
        created_at: new Date().toISOString()
    };
    kids.push(newKid);
    saveKids(kids);
    return newKid;
}

function updateKid(kidId, updates) {
    const kids = getKids();
    const index = kids.findIndex(k => k.id === kidId);
    if (index !== -1) {
        kids[index] = { ...kids[index], ...updates };
        saveKids(kids);
        return kids[index];
    }
    return null;
}

function deleteKid(kidId) {
    const kids = getKids().filter(k => k.id !== kidId);
    saveKids(kids);
    
    // Also delete all gifts for this kid
    const gifts = getGifts().filter(g => g.kid_id !== kidId);
    saveGifts(gifts);
}

function getKid(kidId) {
    return getKids().find(k => k.id === kidId);
}

// ============================================
// GIFT FUNCTIONS
// ============================================

function getGifts() {
    return getData('gifts', []);
}

function saveGifts(gifts) {
    setData('gifts', gifts);
}

function addGift(giftData) {
    const gifts = getGifts();
    const newGift = {
        id: generateId(),
        ...giftData,
        created_at: new Date().toISOString()
    };
    gifts.push(newGift);
    saveGifts(gifts);
    return newGift;
}

function updateGift(giftId, updates) {
    const gifts = getGifts();
    const index = gifts.findIndex(g => g.id === giftId);
    if (index !== -1) {
        gifts[index] = { ...gifts[index], ...updates };
        saveGifts(gifts);
        return gifts[index];
    }
    return null;
}

function deleteGift(giftId) {
    const gifts = getGifts().filter(g => g.id !== giftId);
    saveGifts(gifts);
}

function getGiftsForKid(kidId) {
    return getGifts()
        .filter(g => g.kid_id === kidId)
        .sort((a, b) => b.year - a.year);
}

function getChristmasGift(kidId, year) {
    return getGifts().find(g => 
        g.kid_id === kidId && 
        g.occasion === 'christmas' && 
        g.year === year
    );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateAge(birthdayStr) {
    const birthday = new Date(birthdayStr);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return Math.max(0, age);
}

function calculateDaysUntilBirthday(birthdayStr) {
    const birthday = new Date(birthdayStr);
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return daysUntil;
}

function formatBirthday(birthdayStr) {
    const date = new Date(birthdayStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================
// UI FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}

function openModal(content) {
    document.getElementById('modal').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

// ============================================
// DASHBOARD VIEW
// ============================================

function showDashboard() {
    state.currentView = 'dashboard';
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('christmasView').style.display = 'none';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('showDashboardBtn').style.display = 'none';
    document.getElementById('showChristmasBtn').style.display = 'inline-flex';
    renderDashboard();
}

function renderDashboard() {
    const kids = getKids();
    const kidsGrid = document.getElementById('kidsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (kids.length === 0) {
        kidsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        document.getElementById('upcomingBirthdays').style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Render upcoming birthdays
    renderUpcomingBirthdays();
    
    // Render kids grid
    kidsGrid.innerHTML = kids.map((kid, index) => {
        const age = calculateAge(kid.birthday);
        const daysUntil = calculateDaysUntilBirthday(kid.birthday);
        const birthdayFormatted = formatBirthday(kid.birthday);
        
        return `
            <div class="kid-card" onclick="showKidProfile('${kid.id}')">
                <div class="kid-photo">
                    ${kid.photo ? `<img src="${kid.photo}" alt="${kid.name}">` : '🎈'}
                </div>
                <div class="kid-info">
                    <div class="kid-name">${kid.name}</div>
                    <div class="kid-details">
                        <span>📅 ${birthdayFormatted}</span>
                        <span class="badge badge-age">Age ${age}</span>
                        ${daysUntil <= 30 ? `<span class="badge badge-countdown">${daysUntil === 0 ? '🎂 Today!' : `${daysUntil}d`}</span>` : ''}
                    </div>
                </div>
                <button class="delete-btn" onclick="event.stopPropagation(); confirmDeleteKid('${kid.id}', '${kid.name}')">
                    🗑️
                </button>
            </div>
        `;
    }).join('');
}

function renderUpcomingBirthdays() {
    const kids = getKids();
    const upcoming = kids
        .map(kid => ({
            ...kid,
            daysUntil: calculateDaysUntilBirthday(kid.birthday),
            age: calculateAge(kid.birthday)
        }))
        .filter(kid => kid.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);
    
    const banner = document.getElementById('upcomingBirthdays');
    const list = document.getElementById('birthdayList');
    
    if (upcoming.length === 0) {
        banner.style.display = 'none';
        return;
    }
    
    banner.style.display = 'flex';
    list.innerHTML = upcoming.map(kid => `
        <div>📅 <strong>${kid.name}</strong> - ${kid.daysUntil === 0 ? 'Today!' : `in ${kid.daysUntil} days`} (turns ${kid.age + 1})</div>
    `).join('');
}

// ============================================
// CHRISTMAS CHECKLIST VIEW
// ============================================

function showChristmas() {
    state.currentView = 'christmas';
    state.currentYear = new Date().getFullYear();
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('christmasView').style.display = 'block';
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('showDashboardBtn').style.display = 'inline-flex';
    document.getElementById('showChristmasBtn').style.display = 'none';
    renderChristmas();
}

function renderChristmas() {
    document.getElementById('currentYear').textContent = state.currentYear;
    
    const kids = getKids();
    const kidsWithGifts = kids.map(kid => ({
        ...kid,
        hasGift: !!getChristmasGift(kid.id, state.currentYear),
        gift: getChristmasGift(kid.id, state.currentYear),
        age: calculateAge(kid.birthday)
    }));
    
    const completed = kidsWithGifts.filter(k => k.hasGift).length;
    const total = kids.length;
    
    // Update progress
    document.getElementById('progressText').textContent = `${completed} of ${total} completed`;
    const progressPercent = total > 0 ? (completed / total) * 100 : 0;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    
    // Render checklist
    const checklistItems = document.getElementById('checklistItems');
    checklistItems.innerHTML = kidsWithGifts.map(kid => `
        <div class="checklist-item ${kid.hasGift ? 'completed' : ''}">
            <div class="checkbox ${kid.hasGift ? 'checked' : ''}" onclick="toggleChristmasGift('${kid.id}')">
                ${kid.hasGift ? '✓' : ''}
            </div>
            <div class="checklist-info" onclick="showKidProfile('${kid.id}')">
                <div class="checklist-name ${kid.hasGift ? 'completed' : ''}">${kid.name}</div>
                <span class="badge badge-age">Age ${kid.age}</span>
                ${kid.gift && kid.gift.gift_name !== 'To be decided' ? `<div style="font-size: 0.9rem; margin-top: 0.25rem;">Gift: ${kid.gift.gift_name}</div>` : ''}
            </div>
            <a class="view-link" onclick="showKidProfile('${kid.id}')">View Details</a>
        </div>
    `).join('');
}

function changeYear(delta) {
    state.currentYear += delta;
    renderChristmas();
}

function toggleYearPicker() {
    state.showYearPicker = !state.showYearPicker;
    const picker = document.getElementById('yearPicker');
    picker.style.display = state.showYearPicker ? 'block' : 'none';
}

function jumpToYear() {
    const input = document.getElementById('customYear');
    const year = parseInt(input.value);
    if (year >= 2000 && year <= 2200) {
        state.currentYear = year;
        state.showYearPicker = false;
        document.getElementById('yearPicker').style.display = 'none';
        input.value = '';
        renderChristmas();
    } else {
        showToast('Please enter a year between 2000 and 2200', 'error');
    }
}

function toggleChristmasGift(kidId) {
    const existingGift = getChristmasGift(kidId, state.currentYear);
    
    if (existingGift) {
        deleteGift(existingGift.id);
        const kid = getKid(kidId);
        showToast(`Removed Christmas gift for ${kid.name}`);
    } else {
        addGift({
            kid_id: kidId,
            occasion: 'christmas',
            year: state.currentYear,
            gift_name: 'To be decided',
            date_given: ''
        });
        const kid = getKid(kidId);
        showToast(`Added Christmas gift for ${kid.name}`);
    }
    
    renderChristmas();
}

// ============================================
// KID PROFILE VIEW
// ============================================

function showKidProfile(kidId) {
    state.currentKidId = kidId;
    const kid = getKid(kidId);
    
    if (!kid) {
        showToast('Kid not found', 'error');
        showDashboard();
        return;
    }
    
    state.currentView = 'profile';
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('christmasView').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
    document.getElementById('showDashboardBtn').style.display = 'inline-flex';
    document.getElementById('showChristmasBtn').style.display = 'none';
    
    renderKidProfile(kid);
}

function renderKidProfile(kid) {
    const age = calculateAge(kid.birthday);
    const birthdayFormatted = new Date(kid.birthday).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    const gifts = getGiftsForKid(kid.id);
    
    const content = `
        <div>
            <div style="background: var(--card); border: 2px solid var(--border); border-radius: 1rem; padding: 1.5rem; box-shadow: 4px 4px 0px 0px var(--shadow); margin-bottom: 2rem;">
                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                    <div style="width: 192px; height: 192px; border: 2px solid var(--border); border-radius: 0.75rem; overflow: hidden; background: var(--secondary); opacity: 0.2; display: flex; align-items: center; justify-content: center; font-size: 4rem; flex-shrink: 0;">
                        ${kid.photo ? `<img src="${kid.photo}" alt="${kid.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '🎈'}
                    </div>
                    <div style="flex: 1; min-width: 250px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${kid.name}</h2>
                                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                                    <span>📅 ${birthdayFormatted}</span>
                                    <span class="badge badge-age">Age ${age}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="icon-btn" onclick="showEditKidModal('${kid.id}')" title="Edit">✏️</button>
                                <button class="delete-btn" onclick="confirmDeleteKid('${kid.id}', '${kid.name}')" title="Delete">🗑️</button>
                            </div>
                        </div>
                        ${kid.interests ? `
                            <div style="background: var(--success); opacity: 0.1; border: 2px solid var(--border); border-radius: 0.5rem; padding: 1rem;">
                                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Interests & Wishlist 💚</h3>
                                <p style="white-space: pre-wrap;">${kid.interests}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="font-size: 2rem;">Gift History 🎁</h2>
                <button class="candy-button bg-primary" onclick="showAddGiftModal('${kid.id}')">➕ Add Gift</button>
            </div>
            
            ${gifts.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">🎁</div>
                    <h3>No gifts recorded yet!</h3>
                    <p>Start tracking gifts for birthdays and Christmas</p>
                    <button class="candy-button bg-accent" onclick="showAddGiftModal('${kid.id}')">Add First Gift</button>
                </div>
            ` : `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                    ${gifts.map(gift => `
                        <div style="background: var(--card); border: 2px solid var(--border); border-radius: 0.75rem; padding: 1rem; box-shadow: 4px 4px 0px 0px var(--shadow); position: relative;">
                            <div style="position: absolute; top: 1rem; right: 1rem; background: ${gift.occasion === 'birthday' ? 'var(--primary)' : 'var(--success)'}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 2px solid var(--border); font-size: 0.75rem; font-weight: 700;">
                                ${gift.occasion === 'birthday' ? '🎂' : '🎄'} ${gift.occasion === 'birthday' ? 'Birthday' : 'Christmas'} ${gift.year}
                            </div>
                            <div style="width: 100%; height: 192px; border: 2px solid var(--border); border-radius: 0.5rem; overflow: hidden; margin-bottom: 1rem; background: var(--secondary); opacity: 0.2; display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                                ${gift.photo ? `<img src="${gift.photo}" alt="${gift.gift_name}" style="width: 100%; height: 100%; object-fit: cover;">` : '🎁'}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem;">
                                <div style="flex: 1; min-width: 0;">
                                    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${gift.gift_name}</h3>
                                    ${gift.date_given ? `<div style="font-size: 0.9rem; opacity: 0.7;">📅 ${new Date(gift.date_given).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>` : ''}
                                </div>
                                <button class="delete-btn" onclick="confirmDeleteGift('${gift.id}', '${gift.gift_name}')" style="width: 32px; height: 32px;">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
    
    document.getElementById('profileContent').innerHTML = content;
}

// ============================================
// MODALS
// ============================================

function showAddKidModal() {
    const content = `
        <div class="modal-header">
            <h2 class="modal-title">Add New Kid 🎈</h2>
            <button class="close-btn" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="event.preventDefault(); saveKid();">
            <div class="form-group">
                <label>Photo (optional)</label>
                <input type="file" id="kidPhoto" accept="image/*" onchange="previewPhoto('kidPhoto', 'kidPhotoPreview')">
                <label for="kidPhoto" class="file-input-label">📸 Upload Photo</label>
                <div id="kidPhotoPreview" class="photo-preview" style="display:none;"></div>
            </div>
            <div class="form-group">
                <label>Name *</label>
                <input type="text" id="kidName" class="form-input" required placeholder="Enter kid's name">
            </div>
            <div class="form-group">
                <label>Birthday *</label>
                <input type="date" id="kidBirthday" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Interests & Wishlist (optional)</label>
                <textarea id="kidInterests" class="form-input" placeholder="What are they into? Any gift ideas?"></textarea>
            </div>
            <button type="submit" class="candy-button bg-primary" style="width: 100%;">Add Kid 🎉</button>
        </form>
    `;
    openModal(content);
}

function showEditKidModal(kidId) {
    const kid = getKid(kidId);
    if (!kid) return;
    
    const content = `
        <div class="modal-header">
            <h2 class="modal-title">Edit ${kid.name} ✏️</h2>
            <button class="close-btn" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="event.preventDefault(); saveKid('${kidId}');">
            <div class="form-group">
                <label>Photo (optional)</label>
                <input type="file" id="kidPhoto" accept="image/*" onchange="previewPhoto('kidPhoto', 'kidPhotoPreview')">
                <label for="kidPhoto" class="file-input-label">📸 Change Photo</label>
                ${kid.photo ? `<div id="kidPhotoPreview" class="photo-preview"><img src="${kid.photo}"></div>` : '<div id="kidPhotoPreview" class="photo-preview" style="display:none;"></div>'}
            </div>
            <div class="form-group">
                <label>Name *</label>
                <input type="text" id="kidName" class="form-input" required value="${kid.name}">
            </div>
            <div class="form-group">
                <label>Birthday *</label>
                <input type="date" id="kidBirthday" class="form-input" required value="${kid.birthday}">
            </div>
            <div class="form-group">
                <label>Interests & Wishlist (optional)</label>
                <textarea id="kidInterests" class="form-input">${kid.interests || ''}</textarea>
            </div>
            <button type="submit" class="candy-button bg-primary" style="width: 100%;">Save Changes ✨</button>
        </form>
    `;
    openModal(content);
}

function showAddGiftModal(kidId) {
    const currentYear = new Date().getFullYear();
    const kid = getKid(kidId);
    
    const content = `
        <div class="modal-header">
            <h2 class="modal-title">Add Gift 🎁</h2>
            <button class="close-btn" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="event.preventDefault(); saveGift('${kidId}');">
            <div class="form-group">
                <label>Photo (optional)</label>
                <input type="file" id="giftPhoto" accept="image/*" onchange="previewPhoto('giftPhoto', 'giftPhotoPreview')">
                <label for="giftPhoto" class="file-input-label">📸 Upload Photo</label>
                <div id="giftPhotoPreview" class="photo-preview" style="display:none;"></div>
            </div>
            <div class="form-group">
                <label>Gift Name *</label>
                <input type="text" id="giftName" class="form-input" required placeholder="What did you give?">
            </div>
            <div class="form-group">
                <label>Occasion *</label>
                <div style="display: flex; gap: 1rem;">
                    <button type="button" id="occasionBirthday" class="candy-button bg-primary" style="flex: 1;" onclick="selectOccasion('birthday')">🎂 Birthday</button>
                    <button type="button" id="occasionChristmas" class="candy-button" style="flex: 1; background: var(--card);" onclick="selectOccasion('christmas')">🎄 Christmas</button>
                </div>
                <input type="hidden" id="giftOccasion" value="birthday">
            </div>
            <div class="form-group">
                <label>Year *</label>
                <input type="number" id="giftYear" class="form-input" value="${currentYear}" min="2000" max="2200" required>
            </div>
            <div class="form-group">
                <label>Date Given (optional)</label>
                <input type="date" id="giftDate" class="form-input">
            </div>
            <button type="submit" class="candy-button bg-primary" style="width: 100%;">Add Gift 🎁</button>
        </form>
    `;
    openModal(content);
}

function selectOccasion(occasion) {
    document.getElementById('giftOccasion').value = occasion;
    const birthdayBtn = document.getElementById('occasionBirthday');
    const christmasBtn = document.getElementById('occasionChristmas');
    
    if (occasion === 'birthday') {
        birthdayBtn.className = 'candy-button bg-primary';
        christmasBtn.className = 'candy-button';
        christmasBtn.style.background = 'var(--card)';
    } else {
        christmasBtn.className = 'candy-button bg-success';
        birthdayBtn.className = 'candy-button';
        birthdayBtn.style.background = 'var(--card)';
    }
}

function previewPhoto(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveKid(kidId = null) {
    const name = document.getElementById('kidName').value;
    const birthday = document.getElementById('kidBirthday').value;
    const interests = document.getElementById('kidInterests').value;
    const photoInput = document.getElementById('kidPhoto');
    
    const kidData = { name, birthday, interests };
    
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            kidData.photo = e.target.result;
            saveKidData(kidId, kidData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        if (kidId) {
            const existingKid = getKid(kidId);
            kidData.photo = existingKid.photo;
        }
        saveKidData(kidId, kidData);
    }
}

function saveKidData(kidId, kidData) {
    if (kidId) {
        updateKid(kidId, kidData);
        showToast(`${kidData.name} updated successfully! ✨`);
        showKidProfile(kidId);
    } else {
        addKid(kidData);
        showToast(`${kidData.name} added successfully! 🎉`);
        showDashboard();
    }
    closeModal();
}

function saveGift(kidId) {
    const name = document.getElementById('giftName').value;
    const occasion = document.getElementById('giftOccasion').value;
    const year = parseInt(document.getElementById('giftYear').value);
    const date = document.getElementById('giftDate').value;
    const photoInput = document.getElementById('giftPhoto');
    
    const giftData = {
        kid_id: kidId,
        gift_name: name,
        occasion: occasion,
        year: year,
        date_given: date
    };
    
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            giftData.photo = e.target.result;
            saveGiftData(kidId, giftData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveGiftData(kidId, giftData);
    }
}

function saveGiftData(kidId, giftData) {
    addGift(giftData);
    showToast('Gift added successfully! 🎁');
    closeModal();
    if (state.currentView === 'profile') {
        showKidProfile(kidId);
    } else if (state.currentView === 'christmas') {
        renderChristmas();
    }
}

function confirmDeleteKid(kidId, kidName) {
    if (confirm(`Are you sure you want to delete ${kidName}? This will also delete all their gifts.`)) {
        deleteKid(kidId);
        showToast(`${kidName} deleted successfully`);
        showDashboard();
    }
}

function confirmDeleteGift(giftId, giftName) {
    if (confirm(`Are you sure you want to delete this gift?`)) {
        deleteGift(giftId);
        showToast('Gift deleted successfully');
        if (state.currentView === 'profile') {
            showKidProfile(state.currentKidId);
        }
    }
}

// ============================================
// DARK MODE
// ============================================

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('darkModeToggle').innerHTML = isDark ? '<span class="icon">☀️</span>' : '<span class="icon">🌙</span>';
}

function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark');
        document.getElementById('darkModeToggle').innerHTML = '<span class="icon">☀️</span>';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    
    // Setup event listeners
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('addKidBtn').addEventListener('click', showAddKidModal);
    document.getElementById('showDashboardBtn').addEventListener('click', showDashboard);
    document.getElementById('showChristmasBtn').addEventListener('click', showChristmas);
    
    // Show initial view
    showDashboard();
    
    console.log('Birthday Gift Tracker loaded! 🎁');
    console.log('Total kids:', getKids().length);
    console.log('Total gifts:', getGifts().length);
});
