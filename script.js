// =================================================================
// 1. CONFIGURATION SUPABASE (À VÉRIFIER)
// =================================================================

// Les URLs et clés sont conservées, assurez-vous qu'elles sont correctes et valides.
const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A'; 

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// =================================================================
// 2. GESTION DES ÉVÉNEMENTS & INITIALISATION
// =================================================================

// L'événement se déclenche quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger les listes déroulantes (Modèles et Services)
    loadDropdowns();
    
    // 2. Écouter la soumission du formulaire de recherche
    // L'ID du formulaire doit être 'search-form' comme dans votre HTML
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    } else {
        console.error("Erreur: Le formulaire d'ID 'search-form' est introuvable.");
    }
    
    // NOTE : L'écouteur 'change' pour filterServicesByAircraft a été retiré,
    // car vous souhaitez afficher tous les services.
});

// =================================================================
// 2. GESTION DES ÉVÉNEMENTS & INITIALISATION (MODIFIÉ)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger les TC Holders et les Services (Modèles chargés plus tard)
    loadTcHolders(); 
    loadServices(); // Remplacé par une fonction plus claire
    
    // 2. Écouter le changement sur le TC Holder pour filtrer les Modèles
    const tcHolderSelect = document.getElementById('tc-holder-select');
    if (tcHolderSelect) {
        tcHolderSelect.addEventListener('change', filterModelsByTcHolder);
    }

    // 3. Écouter la soumission du formulaire de recherche
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    } else {
        console.error("Erreur: Le formulaire d'ID 'search-form' est introuvable.");
    }
});


// =================================================================
// 3A. CHARGEMENT DES TC HOLDERS (NOUVEAU) 🏆
// =================================================================

async function loadTcHolders() {
    const select = document.getElementById('tc-holder-select');
    
    // Tentative d'utiliser la fonction RPC, sinon requête directe
    const { data: tcHolders, error } = await supabase.rpc('get_distinct_tc_holders');

    if (error) {
        console.error("Erreur chargement TC Holders (RPC):", error);
        // Si la RPC échoue, essayez la requête directe (plus robuste si la fonction n'est pas créée)
        const { data: directData, error: directError } = await supabase
            .from('aircrafts')
            .select('tc_holder', { distinct: true })
            .order('tc_holder');
        
        if (directError) {
            console.error("Erreur chargement TC Holders (Direct):", directError);
            select.innerHTML = '<option value="">Erreur de chargement</option>';
            return;
        }
        tcHolders = directData.map(d => d.tc_holder); // Extraction des valeurs
    }
    
    // Remplissage de la liste
    select.innerHTML = '<option value="">Sélectionner un TC Holder...</option>';
    if (tcHolders && tcHolders.length > 0) {
        // La réponse RPC (si utilisée) renvoie directement des chaînes de caractères (TEXT)
        tcHolders.forEach(tc => {
            const option = document.createElement('option');
            // Assurez-vous que la valeur et le texte sont corrects
            const holderName = typeof tc === 'object' && tc.tc_holder ? tc.tc_holder : tc;
            option.value = holderName;
            option.textContent = holderName;
            select.appendChild(option);
        });
    }
}


// =================================================================
// 3B. FILTRAGE DES MODÈLES (NOUVEAU) ✈️
// =================================================================

async function filterModelsByTcHolder() {
    const tcHolder = document.getElementById('tc-holder-select').value;
    const modelSelect = document.getElementById('model-select');
    
    modelSelect.innerHTML = ''; // Nettoyer les options précédentes
    modelSelect.disabled = true; // Désactiver jusqu'au chargement

    if (!tcHolder) {
        modelSelect.innerHTML = '<option value="">Sélectionner un TC Holder d\'abord</option>';
        return;
    }

    // 1. Récupérer les Modèles d'Avion ('type_avion') filtrés par le TC Holder
    // NOTE: Ceci suppose que la table 'type_avion' a une colonne 'tc_holder' pour le filtrage
    // S'ils sont liés par une autre table ou une clé, cette requête doit être ajustée.
    const { data: models, error: modelError } = await supabase
        .from('type_avion') // Supposons que les modèles et TC Holder sont ici
        .select('model', { distinct: true }) // Assurez-vous d'utiliser le nom de colonne correct
        .eq('tc_holder', tcHolder) // Appliquer le filtre
        .order('model');

    if (modelError) {
        console.error("Erreur chargement Modèles filtrés:", modelError);
        modelSelect.innerHTML = '<option value="">Erreur de chargement des modèles</option>';
        return;
    }
    
    // 2. Remplissage du select des Modèles
    modelSelect.innerHTML = '<option value="">Sélectionner un modèle...</option>';
    if (models) {
        models.forEach(m => {
            const option = document.createElement('option');
            // La colonne Model est soit 'model' (si distinct: true), soit 'model_avion' si vous utilisiez type_avion
            const modelName = m.model ? m.model : m.model_avion; 
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        });
        modelSelect.disabled = false; // Activer la liste des modèles
    }
}


// =================================================================
// 3C. CHARGEMENT DES SERVICES (RENOMMÉ)
// =================================================================

async function loadServices() {
    // Code de chargement des services (inchangé)
    const { data: services, error: serviceError } = await supabase
        .from('services') 
        .select('id_service, description');

    if (serviceError) console.error("Erreur chargement Services:", serviceError);

    if (services) {
        const select = document.getElementById('service-select');
        select.innerHTML = '<option value="">Sélectionner un service...</option>';
        
        services.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id_service;
            option.textContent = s.description;
            select.appendChild(option);
        });
    }
}


// =================================================================
// 4. GESTIONNAIRE DE RECHERCHE (APPEL RPC) (MODIFIÉ)
// =================================================================

async function handleSearch(event) {
    event.preventDefault();
    const output = document.getElementById('results-output');
    output.innerHTML = '<p>Recherche en cours...</p>';

    // Récupération des NOUVELLES valeurs du formulaire (assurez-vous des IDs HTML)
    const tcHolder = document.getElementById('tc-holder-select').value;
    const model = document.getElementById('model-select').value; // Nouveau nom pour le modèle
    const serviceId = document.getElementById('service-select').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!tcHolder || !model || !serviceId || !startDate || !endDate) {
        output.innerHTML = '<p style="color: orange;">Veuillez remplir tous les champs avant de lancer la recherche.</p>';
        return;
    }
    
    const startTimestamp = `${startDate}T00:00:00.000Z`;
    const endTimestamp = `${endDate}T23:59:59.999Z`;

    // Appel à la fonction RPC PostgreSQL. Les paramètres doivent correspondre à la fonction SQL.
    const { data, error } = await supabase.rpc('search_available_slots', {
        // L'ID de l'avion n'est plus pertinent, nous filtrons par TC Holder et Model (strings)
        p_tc_holder: tcHolder,
        p_model: model, 
        p_service_id: parseInt(serviceId),
        p_start_date: startTimestamp,
        p_end_date: endTimestamp
    });

    if (error) {
        output.innerHTML = `<p style="color: red;">Erreur SQL RPC : ${error.message}. Vérifiez la console pour les détails.</p>`;
        console.error("Détails Erreur RPC:", error);
    } else {
        displayResults(data, output);
    }
}

// NOTE : La fonction displayResults() reste inchangée.

// =================================================================
// 5. AFFICHAGE DES RÉSULTATS
// =================================================================

function displayResults(data, outputElement) {
    if (data.length === 0) {
        outputElement.innerHTML = '<p class="no-results">Désolé, aucun slot disponible pour ces critères (Modèle, Service et Date) dans les hangars compatibles.</p>';
        return;
    }

    let html = `
        <p><strong>${data.length} slot(s) disponible(s) trouvé(s) :</strong></p>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Hangar</th>
                    <th>Ville</th>
                    <th>Type de Slot</th>
                    <th>ID Slot</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        html += `
            <tr>
                <td>${item.nom_hangar}</td>
                <td>${item.ville}</td>
                <td>${item.slot_type}</td>
                <td>${item.slot_id}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    outputElement.innerHTML = html;
}
