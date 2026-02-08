// --- STATE MANAGEMENT ---
const defaultCriteria = {
    red: ["Schimmel / Feuchtigkeit", "Miete über Budget", "Befristeter Vertrag"],
    yellow: ["Kein Keller", "Erdgeschoss", "Renovierung nötig", "Verkehrslärm"],
    green: ["Balkon / Terrasse", "Einbauküche inkl.", "Ruhige Lage", "Tageslichtbad"]
};

// HELPER: Unique ID Generator
function generateId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}

// TEST DATA
const testDataTemplate = [
    {
        facts: { street: "Sonnenallee 1", zip: "10115", city: "Berlin", size: "85", rooms: "3", floor: "4. OG", date: "2026-03-01", cold: "1200", warm: "1450", deposit: "3600", link: "", contactName: "Fr. Glück", contactInfo: "030 123456", notes: "Traumwohnung! Hell, Dielenboden." },
        criteria: { red: [], yellow: [], green: ["Balkon / Terrasse", "Einbauküche inkl.", "Ruhige Lage", "Tageslichtbad"] },
        counts: { r: 0, y: 0, g: 4 }, 
        timestamp: new Date().toLocaleDateString()
    }
];

let criteria = JSON.parse(localStorage.getItem('myCriteriaV2')) || defaultCriteria;
let storedApts = localStorage.getItem('myApartmentsV2');
let apartments = storedApts ? JSON.parse(storedApts) : [];

if (!storedApts && apartments.length === 0) {
    loadTestData(true); 
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderConfigLists();
    renderApartmentList();
});

// --- NAVIGATION ---
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        if(el.id !== 'mascot-feedback') el.classList.remove('active');
    });
    document.querySelectorAll('.btn-nav').forEach(el => el.classList.remove('active'));

    document.getElementById('view-' + viewName).classList.add('active');
    document.getElementById('nav-' + viewName).classList.add('active');

    if(viewName === 'new') {
        if(!document.getElementById('edit-id').value) {
            resetForm();
            setMascotText("Bello: Okay, alles auf Null. Erzähl mir von der Wohnung!");
        }
    } else if (viewName === 'list') {
        renderApartmentList();
        setMascotText("Fury: Hier ist deine Übersicht. Tippe auf eine Karte für mehr Details.");
        document.getElementById('edit-id').value = "";
    } else if (viewName === 'config') {
        setMascotText("Bello: Hier kannst du einstellen, was wir suchen!");
    }
}

function setMascotText(text) {
    document.getElementById('speech-text').innerText = text;
}

// --- CONFIGURATION LOGIC ---
function renderConfigLists() {
    ['red', 'yellow', 'green'].forEach(type => {
        const listEl = document.getElementById('list-' + type);
        listEl.innerHTML = '';
        criteria[type].forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item}</span><button class="btn-delete" onclick="deleteCriterion('${type}', ${index})">✕</button>`;
            listEl.appendChild(li);
        });
    });
    localStorage.setItem('myCriteriaV2', JSON.stringify(criteria));
}

function addCriterion(type) {
    const input = document.getElementById('input-' + type);
    const val = input.value.trim();
    if(val) {
        criteria[type].push(val);
        input.value = '';
        renderConfigLists();
    }
}

function deleteCriterion(type, index) {
    criteria[type].splice(index, 1);
    renderConfigLists();
}

// --- FORM MANAGEMENT ---
function resetForm() {
    document.getElementById('edit-id').value = "";
    document.getElementById('form-header').innerText = "Neue Wohnung anlegen";
    document.querySelectorAll('#view-new input').forEach(i => { if(i.type !== "hidden") i.value = ''; });
    document.getElementById('f-notes').value = '';
    loadEvaluationForm([]);
}

function loadEvaluationForm(checkedItems = []) {
    const container = document.getElementById('evaluation-form');
    container.innerHTML = '';
    const checkedSet = new Set(checkedItems || []);

    const createSection = (title, type, items, cssClass) => {
        if(items.length === 0) return;
        const div = document.createElement('div');
        div.className = `form-section ${cssClass}`;
        div.innerHTML = `<h3>${title}</h3>`;
        items.forEach(item => {
            const isChecked = checkedSet.has(item) ? 'checked' : '';
            const label = document.createElement('label');
            label.className = 'check-item';
            label.innerHTML = `<input type="checkbox" name="${type}" value="${item}" ${isChecked}> ${item}`;
            div.appendChild(label);
        });
        container.appendChild(div);
    };
    createSection("🔴 Dealbreaker Check", "red", criteria.red, "b-red");
    createSection("🟡 Nachteile Check", "yellow", criteria.yellow, "b-yellow");
    createSection("🟢 Vorteile Check", "green", criteria.green, "b-green");
}

function editApartment(id) {
    const apt = apartments.find(a => a.id === id);
    if(!apt) return;

    switchView('new');
    document.getElementById('edit-id').value = apt.id;
    document.getElementById('form-header').innerText = "Wohnung bearbeiten";
    setMascotText("Fury: Wir korrigieren das. Sei präzise!");

    const f = apt.facts;
    document.getElementById('f-street').value = f.street;
    document.getElementById('f-zip').value = f.zip;
    document.getElementById('f-city').value = f.city;
    document.getElementById('f-size').value = f.size;
    document.getElementById('f-rooms').value = f.rooms;
    document.getElementById('f-floor').value = f.floor;
    document.getElementById('f-date').value = f.date;
    document.getElementById('f-cold').value = f.cold;
    document.getElementById('f-warm').value = f.warm;
    document.getElementById('f-deposit').value = f.deposit;
    document.getElementById('f-nk').value = f.nk || "";
    document.getElementById('f-heat').value = f.heat || "";
    document.getElementById('f-link').value = f.link;
    document.getElementById('f-contact-name').value = f.contactName;
    document.getElementById('f-contact-info').value = f.contactInfo;
    document.getElementById('f-notes').value = f.notes;

    let allChecked = [];
    if(apt.criteria) {
        allChecked = [...(apt.criteria.red||[]), ...(apt.criteria.yellow||[]), ...(apt.criteria.green||[])];
    }
    loadEvaluationForm(allChecked);
}

function cancelEdit() { switchView('list'); }

// --- SCORE CALCULATION (0-100%) ---
function calculateScore(reds, yellows, greens) {
    if (reds > 0) return 0;
    let score = 50 + (greens * 10) - (yellows * 10);
    if (score > 100) score = 100;
    if (score < 0) score = 0;
    return score;
}

function calculateAndSave() {
    const editId = document.getElementById('edit-id').value;
    const facts = {
        street: document.getElementById('f-street').value || "Unbekannte Straße",
        zip: document.getElementById('f-zip').value,
        city: document.getElementById('f-city').value,
        size: document.getElementById('f-size').value,
        rooms: document.getElementById('f-rooms').value,
        floor: document.getElementById('f-floor').value,
        date: document.getElementById('f-date').value,
        cold: document.getElementById('f-cold').value,
        warm: document.getElementById('f-warm').value,
        deposit: document.getElementById('f-deposit').value,
        nk: document.getElementById('f-nk').value,
        heat: document.getElementById('f-heat').value,
        link: document.getElementById('f-link').value,
        contactName: document.getElementById('f-contact-name').value,
        contactInfo: document.getElementById('f-contact-info').value,
        notes: document.getElementById('f-notes').value
    };

    const checkedRed = getCheckedValues('red');
    const checkedYellow = getCheckedValues('yellow');
    const checkedGreen = getCheckedValues('green');
    const redsCount = checkedRed.length;
    
    let message = "Gespeichert!";
    if(redsCount > 0) message = "Fury: Das ist ein K.O.! Score ist 0.";
    else message = "Bello: Alles gespeichert! Schau dir den Score an.";

    const aptData = {
        id: editId ? parseInt(editId) : generateId(),
        facts: facts,
        criteria: { red: checkedRed, yellow: checkedYellow, green: checkedGreen },
        counts: { r: redsCount, y: checkedYellow.length, g: checkedGreen.length },
        timestamp: new Date().toLocaleDateString()
    };

    if (editId) {
        const index = apartments.findIndex(a => a.id == editId);
        if(index !== -1) apartments[index] = aptData;
    } else {
        apartments.unshift(aptData);
    }

    localStorage.setItem('myApartmentsV2', JSON.stringify(apartments));
    switchView('list');
    setMascotText(message);
}

function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

// --- VERDICT & COLOR ---
function getVerdict(score, reds) {
    if (reds > 0 || score === 0) return { text: "⛔️ K.O. / DURCHGEFALLEN", bg: "#ffebee", col: "#c62828", bar: "#c62828" };
    if (score <= 40) return { text: "⚠️ RISIKOREICH (Zu viele Nachteile)", bg: "#fff3e0", col: "#e65100", bar: "#ff9800" };
    if (score <= 60) return { text: "⚖️ DURCHSCHNITT (Okay)", bg: "#f5f5f5", col: "#616161", bar: "#9e9e9e" };
    if (score <= 80) return { text: "👍 GUT (Empfehlung)", bg: "#e8f5e9", col: "#2e7d32", bar: "#4caf50" };
    return { text: "🏆 TRAUMHAFT (Exzellent!)", bg: "#b9f6ca", col: "#1b5e20", bar: "#00c853" };
}

// --- FILTER LOGIC ---
let currentFilter = 'all';

function setFilter(type) {
    currentFilter = type;
    
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    
    const buttons = document.querySelectorAll('.btn-filter');
    if(type === 'all') buttons[0].classList.add('active');
    if(type === 'top') buttons[1].classList.add('active');
    if(type === 'ok') buttons[2].classList.add('active');
    if(type === 'flop') buttons[3].classList.add('active');

    renderApartmentList();
}

// --- MODAL DELETE LOGIC ---
let pendingDeleteId = null; 

function askDelete(id) {
    pendingDeleteId = id; 
    document.getElementById('delete-modal').classList.add('active'); 
}

function closeModal() {
    pendingDeleteId = null; 
    document.getElementById('delete-modal').classList.remove('active'); 
}

function confirmDelete() {
    if (pendingDeleteId) {
        apartments = apartments.filter(a => a.id !== pendingDeleteId);
        localStorage.setItem('myApartmentsV2', JSON.stringify(apartments));
        renderApartmentList();
        
        if(document.getElementById('edit-id').value == pendingDeleteId) {
            resetForm();
        }
        
        closeModal();
    }
}

// --- RENDER ---
function renderApartmentList() {
    const container = document.getElementById('apartments-container');
    const emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    if(apartments.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    // 1. FILTERN
    const filteredList = apartments.filter(apt => {
        const score = calculateScore(apt.counts.r, apt.counts.y, apt.counts.g);
        const reds = apt.counts.r;

        if (currentFilter === 'all') return true;
        if (currentFilter === 'top') return score > 60 && reds === 0;
        if (currentFilter === 'ok') return score > 0 && score <= 60 && reds === 0;
        if (currentFilter === 'flop') return reds > 0 || score === 0;
        return true;
    });

    if(filteredList.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#999; margin-top:40px;">
            In dieser Kategorie gibt es (noch) keine Wohnungen.
        </div>`;
        return;
    }

    // 2. RENDERN
    filteredList.forEach(apt => {
        const score = calculateScore(apt.counts.r, apt.counts.y, apt.counts.g);

        const card = document.createElement('div');
        const verdict = getVerdict(score, apt.counts.r);
        card.className = `apt-card`;
        card.style.borderLeftColor = verdict.bar;

        const f = apt.facts;
        const fullAddress = `${f.street}, ${f.zip} ${f.city}`;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
        const contactStr = [f.contactName, f.contactInfo].filter(Boolean).join(' • ');

        card.innerHTML = `
            <div class="apt-header">
                <div>
                    <div class="apt-title">${f.street}</div>
                    <div style="font-size:0.9rem; color:#555;">${f.zip} ${f.city}</div>
                </div>
                <div>
                    <button class="btn-edit" onclick="editApartment(${apt.id})">✏️</button>
                    <button class="btn-delete" onclick="askDelete(${apt.id})">🗑️</button>
                </div>
            </div>
            <div class="apt-meta">
                ${f.rooms ? `<span>🚪 ${f.rooms} Zi.</span>` : ''}
                ${f.size ? `<span>📐 ${f.size} m²</span>` : ''}
                ${f.floor ? `<span>🏢 ${f.floor}</span>` : ''}
                ${f.date ? `<span>📅 ab ${f.date}</span>` : ''}
            </div>
            <div class="fact-grid">
                <div class="fact-item"><strong>Kalt</strong> ${f.cold ? f.cold + ' €' : '-'}</div>
                <div class="fact-item" style="color:#333; font-weight:bold; background:#fffeb0;"><strong>Warm</strong> ${f.warm ? f.warm + ' €' : '-'}</div>
                <div class="fact-item"><strong>Kaution</strong> ${f.deposit ? f.deposit + ' €' : '-'}</div>
            </div>
            ${contactStr ? `<div style="margin:10px 0; font-size:0.9rem;">📞 ${contactStr}</div>` : ''}
            
            <div class="score-container">
                <div class="score-bar" style="width: ${score}%; background: ${verdict.bar};"></div>
                <div class="score-text">${score}% Match</div>
            </div>

            <div class="verdict-box" style="background:${verdict.bg}; color:${verdict.col}; margin-top:5px;">
                ${verdict.text}
            </div>

            <div class="count-summary">
                 <span>🟢 ${apt.counts.g}</span> • 
                 <span>🟡 ${apt.counts.y}</span> • 
                 <span>🔴 ${apt.counts.r} No-Gos</span>
            </div>
            
            <div class="action-links">
                <a href="${mapUrl}" target="_blank" class="link-btn" style="background:#f0f0f0; color:#333;">📍 Karte</a>
                ${f.link ? `<a href="${f.link}" target="_blank" class="link-btn">🔗 Zum Inserat</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function loadTestData(silent = false) {
    const newTestApts = testDataTemplate.map(t => ({
        ...t, 
        id: generateId() + Math.random() 
    }));

    apartments.push(...newTestApts);
    localStorage.setItem('myApartmentsV2', JSON.stringify(apartments));
    renderApartmentList();
    if(!silent) {
        switchView('list');
        setMascotText("Bello: Ich habe dir Beispiele in die Liste gepackt!");
    }
}