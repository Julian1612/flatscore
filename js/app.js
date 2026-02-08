// --- CONFIG & STATE ---
const defaultCriteria = {
    red: ["Schimmel / Feuchtigkeit", "Miete über Budget", "Befristeter Vertrag"],
    yellow: ["Kein Keller", "Erdgeschoss", "Renovierung nötig", "Verkehrslärm"],
    green: ["Balkon / Terrasse", "Einbauküche inkl.", "Ruhige Lage", "Tageslichtbad"]
};

// --- MASCOT SPRÜCHE ---
const phrases = {
    bello: [
        "Wuff! Julia, du findest das perfekte Zuhause, ich spür das!",
        "Lass den Kopf nicht hängen! Die nächste Wohnung wird der Hammer!",
        "Ich rieche... Erfolg! Bald hast du dein TraumNest.",
        "Hey Julia, du machst das super! Wuff!",
        "Vergiss den Balkon nicht – wir brauchen frische Luft!",
        "Egal wie viele wir anschauen, wir geben nicht auf!",
        "Ein Leckerli für dich, weil du so tapfer suchst! 🦴",
        "Wallah, ich schwöre, der nächste Hund der was auf Tauschwohnung hochlädt, bekommt von mir nen fetten Haufen Scheiße auf die Türmatte!",
        "Sag mir welchen scheiß Kerl dir die Wohnung nicht gegeben hat, und bei Gott ich schöre dir, ich pinkel auf seine Türmatte!"

    ],
    cubi: [
        "Hüh! Julia, wir galoppieren direkt ins Glück!",
        "Das war nix? Egal, Hindernis überspringen und weiter!",
        "Ich brauche Auslauf, und du dein Reich. Wir schaffen das!",
        "Starke Nerven, Julia! Dein Traumstall wartet schon.",
        "Schnaub... lass dich nicht von Maklern ärgern.",
        "Positiv bleiben! Am Ende wird alles gut.",
        "Wiehern! Auf in die nächste Runde!", 
        "Wenn ich den Erfinder von Tauschwohnung treffe, dem geb ich ne ordentliche Schelle! Wer so eine scheiße Seite macht, gehört bestraft! Und wenn ich den Typen treffe, der die Wohnung nicht gegeben hat, dem geb ich auch ne Schelle! Alle kriegen ne Schelle von mir, bis du deine Wohnung hast, Julia!",
        "So eine scheiße Seite wie Tauschwohnung, kann nur ein Gottloser MANN erfunden haben!"
    ]
};

// Helper: Unique ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}

// Test Data
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

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    renderConfigLists();
    renderApartmentList();
});

// --- MASCOT LOGIC ---
function mascotClick(name) {
    const list = phrases[name];
    const randomPhrase = list[Math.floor(Math.random() * list.length)];
    const displayName = name === 'bello' ? 'Bello 🐶' : 'Cubi 🐴';
    setMascotText(`<b>${displayName}:</b> ${randomPhrase}`);
    
    const selector = name === 'bello' ? '.mascot.dog' : '.mascot.horse';
    const el = document.querySelector(selector);
    if(el) {
        el.style.transform = "scale(1.2) rotate(10deg)";
        setTimeout(() => { el.style.transform = "scale(1) rotate(0deg)"; }, 200);
    }
}

function setMascotText(text) {
    const bubble = document.getElementById('speech-text');
    if(bubble) {
        bubble.innerHTML = text;
        const container = document.querySelector('.speech-bubble');
        container.style.transform = "scale(1.05)";
        setTimeout(() => container.style.transform = "scale(1)", 150);
    }
}

// --- NAVIGATION ---
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        if(el.id !== 'mascot-feedback') el.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById('view-' + viewName).classList.add('active');
    
    if(viewName === 'list') document.getElementById('nav-list').classList.add('active');
    if(viewName === 'config') document.getElementById('nav-config').classList.add('active');

    if(viewName === 'new') {
        if(!document.getElementById('edit-id').value) {
            resetForm();
            setMascotText("Bello: Erzähl mir alles! Wir rechnen mit.");
        }
    } else if (viewName === 'list') {
        renderApartmentList();
        setMascotText("Fury: Hier ist dein Überblick, Julia.");
        document.getElementById('edit-id').value = ""; 
    } else if (viewName === 'config') {
        setMascotText("Cubi: Was ist dir wirklich wichtig?");
    }
}

// --- CONFIG LISTS (CHIPS) ---
function renderConfigLists() {
    ['red', 'yellow', 'green'].forEach(type => {
        const listEl = document.getElementById('list-' + type);
        listEl.innerHTML = '';
        criteria[type].forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item}</span><button class="delete-chip" onclick="deleteCriterion('${type}', ${index})">✕</button>`;
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

// --- FORM MANAGEMENT (FIXED INTERACTION) ---
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
            // Build Elements manually for better Event handling
            const label = document.createElement('label');
            label.className = 'check-item';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = type;
            input.value = item;
            
            if (checkedSet.has(item)) {
                input.checked = true;
                label.classList.add('selected');
            }
            
            // The Fix: Click anywhere on label toggles class
            input.addEventListener('change', () => {
                if(input.checked) label.classList.add('selected');
                else label.classList.remove('selected');
            });

            // Prevent text selection
            label.appendChild(input);
            label.appendChild(document.createTextNode(item));
            div.appendChild(label);
        });
        container.appendChild(div);
    };
    createSection("🔴 Dealbreaker", "red", criteria.red, "b-red");
    createSection("🟡 Kompromisse", "yellow", criteria.yellow, "b-yellow");
    createSection("🟢 Wünsche", "green", criteria.green, "b-green");
}

function editApartment(id) {
    const apt = apartments.find(a => a.id === id);
    if(!apt) return;

    switchView('new');
    document.getElementById('edit-id').value = apt.id;
    setMascotText("Bello: Wir polieren das Inserat auf!");

    const f = apt.facts;
    const mapping = ['street', 'zip', 'city', 'size', 'rooms', 'floor', 'date', 'cold', 'warm', 'deposit', 'nk', 'heat', 'link', 'notes'];
    mapping.forEach(key => {
        const el = document.getElementById('f-' + key);
        if(el) el.value = f[key] || "";
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

// --- SCORE ---
function calculateScore(reds, yellows, greens) {
    if (reds > 0) return 0;
    let score = 50 + (greens * 10) - (yellows * 10);
    if (score > 100) score = 100;
    if (score < 0) score = 0;
    return score;
}

function calculateAndSave() {
    const editId = document.getElementById('edit-id').value;
    const facts = {};
    const mapping = ['street', 'zip', 'city', 'size', 'rooms', 'floor', 'date', 'cold', 'warm', 'deposit', 'nk', 'heat', 'link', 'notes'];
    mapping.forEach(key => facts[key] = document.getElementById('f-' + key).value);
    facts.contactName = document.getElementById('f-contact-name').value;
    facts.contactInfo = document.getElementById('f-contact-info').value;

    const cRed = getChecked('red');
    const cYellow = getChecked('yellow');
    const cGreen = getChecked('green');
    
    let message = "Gespeichert!";
    if(cRed.length > 0) message = "Fury schnaubt: Rote Flagge! Aber gut, dass wir es gesehen haben.";
    else if (cGreen.length > cYellow.length) message = "Bello bellt: Juhu! Das sieht nach einem Treffer aus, Julia!";

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

// --- VERDICT ---
function getVerdict(score, reds) {
    if (reds > 0 || score === 0) return { text: "⛔️ K.O.", bg: "#ffebee", col: "#c62828", bar: "#ef5350" };
    if (score <= 40) return { text: "⚠️ Risiko", bg: "#fff3e0", col: "#e65100", bar: "#ff9800" };
    if (score <= 60) return { text: "⚖️ Okay", bg: "#f5f5f5", col: "#616161", bar: "#b2bec3" };
    if (score <= 80) return { text: "👍 Gut", bg: "#e8f5e9", col: "#2e7d32", bar: "#66bb6a" };
    return { text: "🏆 Traum", bg: "#e3f2fd", col: "#0984e3", bar: "#00e676" };
}

// --- FILTER & RENDER ---
let currentFilter = 'all';

function setFilter(type) {
    currentFilter = type;
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('.btn-filter');
    if(type==='all') btns[0].classList.add('active');
    if(type==='top') btns[1].classList.add('active');
    if(type==='ok') btns[2].classList.add('active');
    if(type==='flop') btns[3].classList.add('active');
    renderApartmentList();
}

function renderApartmentList() {
    const container = document.getElementById('apartments-container');
    const emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    const filtered = apartments.filter(apt => {
        const score = calculateScore(apt.counts.r, apt.counts.y, apt.counts.g);
        const reds = apt.counts.r;
        if (currentFilter === 'all') return true;
        if (currentFilter === 'top') return score > 60 && reds === 0;
        if (currentFilter === 'ok') return score > 0 && score <= 60 && reds === 0;
        if (currentFilter === 'flop') return reds > 0 || score === 0;
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
        card.style.borderLeft = `5px solid ${verdict.bar}`;

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

// --- MODAL DELETE ---
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

function loadTestData(silent = false) {
    const newTestApts = testDataTemplate.map(t => ({...t, id: generateId() + Math.random()}));
    apartments.push(...newTestApts);
    localStorage.setItem('myApartmentsV2', JSON.stringify(apartments));
    renderApartmentList();
    if(!silent) {
        switchView('list');
        setMascotText("Cubi: Ich habe dir ein Beispiel zum Testen gebracht!");
    }
}