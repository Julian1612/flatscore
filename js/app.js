// --- CONFIG & STATE ---
const defaultCriteria = {
    red: ["Schimmel", "Miete zu hoch", "Befristet", "Keine Heizung"],
    yellow: ["Kein Keller", "Erdgeschoss", "Teppichboden", "Verkehrslärm"],
    green: ["Balkon / Terrasse", "Einbauküche", "Badewanne", "Südausrichtung"]
};

// --- MASCOT PHRASES (Jetzt mit Aufmunterung!) ---
const phrases = {
    bello: [
        "Wuff! Nicht den Kopf hängen lassen, die nächste wird super!",
        "Ich rieche... ein Schnäppchen! Bald!",
        "Vergiss den Balkon nicht! Wuff!",
        "Hey, atme durch. Wir finden dein neues Zuhause!",
        "Platz für mein Körbchen? Das wird schon!",
        "Lass uns das Bad checken, vielleicht gibt's eine Wanne!"
    ],
    cubi: [
        "Wiehern! Nur nicht aufgeben, Partner!",
        "Ich brauche Auslauf, und du eine tolle Wohnung. Packen wir's an!",
        "Hüh! Die Miete ist hoch, aber wir reiten weiter!",
        "Kein Aufzug? Egal, wir schaffen das!",
        "Schnaub... lass dich nicht unterkriegen!",
        "Achte auf die Nebenkosten, aber verliere nicht den Mut!"
    ]
};

// Helper: Unique ID
function generateId() { return Date.now() + Math.floor(Math.random() * 10000); }

// Test Data
const testDataTemplate = [
    {
        facts: { street: "Regenbogenweg 12", zip: "12345", city: "Glückstadt", size: "75", rooms: "3", floor: "2. OG", date: "sofort", cold: "950", warm: "1150", deposit: "2800", contactName: "Fr. Sonnenschein", contactInfo: "0171 123456", notes: "Super hell, tolle Nachbarn!" },
        criteria: { red: [], yellow: [], green: ["Balkon / Terrasse", "Einbauküche", "Südausrichtung"] },
        counts: { r: 0, y: 0, g: 3 }, 
        timestamp: new Date().toLocaleDateString()
    }
];

let criteria = JSON.parse(localStorage.getItem('myCriteriaV2')) || defaultCriteria;
let storedApts = localStorage.getItem('myApartmentsV2');
let apartments = storedApts ? JSON.parse(storedApts) : [];

if (!storedApts && apartments.length === 0) { loadTestData(true); }

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    renderConfigLists();
    renderApartmentList();
});

// --- MASCOT INTERACTION ---
function mascotClick(name) {
    const list = phrases[name];
    const randomPhrase = list[Math.floor(Math.random() * list.length)];
    setMascotText(`<b>${name === 'bello' ? 'Bello' : 'Cubi'}:</b> ${randomPhrase}`);
    
    // Animation
    const selector = name === 'bello' ? '.mascot.dog' : '.mascot.horse';
    const el = document.querySelector(selector);
    if(el) {
        el.style.transform = "scale(1.2) rotate(10deg)";
        setTimeout(() => { el.style.transform = "scale(1) rotate(0deg)"; }, 200);
    }
}

function setMascotText(text) {
    const bubble = document.getElementById('speech-text');
    if(bubble) bubble.innerHTML = text;
}

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
            setMascotText("Füll die Felder aus, wir rechnen mit!");
        }
    } else if (viewName === 'list') {
        renderApartmentList();
        setMascotText("Hier sind deine Fundstücke.");
        document.getElementById('edit-id').value = "";
    } else if (viewName === 'config') {
        setMascotText("Hier kannst du deine Wünsche anpassen.");
    }
}

// --- CONFIG LOGIC ---
function renderConfigLists() {
    ['red', 'yellow', 'green'].forEach(type => {
        const listEl = document.getElementById('list-' + type);
        listEl.innerHTML = '';
        criteria[type].forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item}</span><button class="btn-icon" style="background:#ffebee; color:red; width:30px; height:30px;" onclick="deleteCriterion('${type}', ${index})">✕</button>`;
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

// --- FORM LOGIC ---
function resetForm() {
    document.getElementById('edit-id').value = "";
    document.querySelectorAll('#view-new input, #view-new textarea').forEach(i => { if(i.type !== "hidden") i.value = ''; });
    loadEvaluationForm([]);
}

function loadEvaluationForm(checkedItems = []) {
    const container = document.getElementById('evaluation-form');
    container.innerHTML = '';
    const checkedSet = new Set(checkedItems || []);

    const createSection = (title, type, items, cssClass) => {
        if(items.length === 0) return;
        const div = document.createElement('div');
        div.className = `form-card glass-card ${cssClass}`;
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
    createSection("🔴 No-Gos", "red", criteria.red, "b-red");
    createSection("🟡 Kompromisse", "yellow", criteria.yellow, "b-yellow");
    createSection("🟢 Must-Haves", "green", criteria.green, "b-green");
}

function editApartment(id) {
    const apt = apartments.find(a => a.id === id);
    if(!apt) return;
    switchView('new');
    document.getElementById('edit-id').value = apt.id;
    setMascotText("Bearbeitungs-Modus! Ändere, was du willst.");
    
    const f = apt.facts;
    // Basic fields mapping
    const ids = ['street', 'zip', 'city', 'size', 'rooms', 'floor', 'date', 'cold', 'warm', 'deposit', 'nk', 'heat', 'link', 'notes'];
    ids.forEach(x => {
        const el = document.getElementById('f-' + x);
        if(el) el.value = f[x] || "";
    });
    document.getElementById('f-contact-name').value = f.contactName || "";
    document.getElementById('f-contact-info').value = f.contactInfo || "";

    let allChecked = [];
    if(apt.criteria) {
        allChecked = [...(apt.criteria.red||[]), ...(apt.criteria.yellow||[]), ...(apt.criteria.green||[])];
    }
    loadEvaluationForm(allChecked);
}

function cancelEdit() { switchView('list'); }

// --- SCORE LOGIC ---
function calculateScore(reds, yellows, greens) {
    if (reds > 0) return 0;
    let score = 50 + (greens * 10) - (yellows * 10);
    return Math.max(0, Math.min(100, score));
}

function calculateAndSave() {
    const editId = document.getElementById('edit-id').value;
    const facts = {};
    const ids = ['street', 'zip', 'city', 'size', 'rooms', 'floor', 'date', 'cold', 'warm', 'deposit', 'nk', 'heat', 'link', 'notes'];
    ids.forEach(x => facts[x] = document.getElementById('f-' + x).value);
    facts.contactName = document.getElementById('f-contact-name').value;
    facts.contactInfo = document.getElementById('f-contact-info').value;

    const cRed = getChecked('red');
    const cYellow = getChecked('yellow');
    const cGreen = getChecked('green');
    
    let message = "Gespeichert!";
    if(cRed.length > 0) message = "Cubi schnaubt: Rote Flagge! K.O.";
    else if (cGreen.length > cYellow.length) message = "Bello bellt: Das sieht gut aus!";

    const aptData = {
        id: editId ? parseInt(editId) : generateId(),
        facts: facts,
        criteria: { red: cRed, yellow: cYellow, green: cGreen },
        counts: { r: cRed.length, y: cYellow.length, g: cGreen.length },
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

function getChecked(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

// --- RENDER LIST ---
let currentFilter = 'all';
function setFilter(type) {
    currentFilter = type;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    // Simple logic to highlight correct button
    const btns = document.querySelectorAll('.btn-filter');
    if(type==='all') btns[0].classList.add('active');
    if(type==='top') btns[1].classList.add('active');
    if(type==='ok') btns[2].classList.add('active');
    if(type==='flop') btns[3].classList.add('active');
    renderApartmentList();
}

function getVerdict(score, reds) {
    if (reds > 0 || score === 0) return { text: "⛔️ K.O.", bg: "#ffebee", col: "#c62828", bar: "#ff7675" };
    if (score <= 40) return { text: "⚠️ Risiko", bg: "#fff3e0", col: "#e65100", bar: "#ffeaa7" };
    if (score <= 60) return { text: "⚖️ Okay", bg: "#f5f5f5", col: "#616161", bar: "#b2bec3" };
    if (score <= 80) return { text: "👍 Gut", bg: "#e8f5e9", col: "#2e7d32", bar: "#55efc4" };
    return { text: "🏆 Traum", bg: "#e3f2fd", col: "#0984e3", bar: "#74b9ff" };
}

function renderApartmentList() {
    const container = document.getElementById('apartments-container');
    const emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    const filtered = apartments.filter(apt => {
        const score = calculateScore(apt.counts.r, apt.counts.y, apt.counts.g);
        if (currentFilter === 'all') return true;
        if (currentFilter === 'top') return score > 60 && apt.counts.r === 0;
        if (currentFilter === 'ok') return score > 0 && score <= 60 && apt.counts.r === 0;
        if (currentFilter === 'flop') return apt.counts.r > 0 || score === 0;
        return true;
    });

    if(filtered.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(apt => {
        const score = calculateScore(apt.counts.r, apt.counts.y, apt.counts.g);
        const verdict = getVerdict(score, apt.counts.r);
        const f = apt.facts;
        
        const card = document.createElement('div');
        card.className = `apt-card`;
        
        // Google Maps Link
        const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(f.street + ' ' + f.zip + ' ' + f.city)}`;

        card.innerHTML = `
            <div class="apt-header">
                <div>
                    <div class="apt-title">${f.street}</div>
                    <div class="apt-address">${f.zip} ${f.city}</div>
                </div>
                <div>
                    <button onclick="editApartment(${apt.id})" style="font-size:1.2rem;">✏️</button>
                    <button onclick="askDelete(${apt.id})" style="font-size:1.2rem;">🗑️</button>
                </div>
            </div>

            <div class="apt-meta">
                <span>🚪 ${f.rooms} Zi.</span>
                <span>📐 ${f.size} m²</span>
            </div>

            <div class="fact-grid">
                <div><strong>${f.cold} €</strong><br>Kalt</div>
                <div style="color:#6c5ce7;"><strong>${f.warm} €</strong><br>Warm</div>
                <div><strong>${f.deposit} €</strong><br>Kaution</div>
            </div>

            <div class="score-container">
                <div class="score-bar" style="width: ${score}%; background: ${verdict.bar};"></div>
                <div class="score-text">${score}% Match</div>
            </div>
            
            <div class="verdict-box" style="background:${verdict.bg}; color:${verdict.col};">
                ${verdict.text}
            </div>

            <div class="action-links">
                <a href="${mapUrl}" target="_blank" class="link-btn btn-map">📍 Karte</a>
                ${f.link ? `<a href="${f.link}" target="_blank" class="link-btn btn-ad">🔗 Inserat</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- DELETE ---
let deleteId = null;
function askDelete(id) { deleteId = id; document.getElementById('delete-modal').classList.add('active'); }
function closeModal() { deleteId = null; document.getElementById('delete-modal').classList.remove('active'); }
function confirmDelete() {
    if(deleteId) {
        apartments = apartments.filter(a => a.id !== deleteId);
        localStorage.setItem('myApartmentsV2', JSON.stringify(apartments));
        renderApartmentList();
        if(document.getElementById('edit-id').value == deleteId) resetForm();
        closeModal();
    }
}

function loadTestData(silent) {
    const newData = testDataTemplate.map(t => ({...t, id: generateId() + Math.random()}));
    apartments.push(...newData);
    localStorage.setItem('myApartmentsV2', JSON.stringify(apartments));
    renderApartmentList();
    if(!silent) { switchView('list'); setMascotText("Demo-Daten geladen!"); }
}