// =================================================================
// 1. CONFIGURATION SUPABASE (INCHANGÉE)
// =================================================================

const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Clé Anon lue :", SUPABASE_ANON_KEY); 
// Elle doit afficher la longue chaîne de caractères sans espaces autour.
// =================================================================
// 2. GESTION DES ÉVÉNEMENTS & INITIALISATION 🚀
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger les TC Holders et les Services (Modèles chargés par cascade)
    loadTcHolders(); 
    loadServices();
    
    // 2. Écouter le changement sur le TC Holder pour déclencher le filtrage des Modèles
    const tcHolderSelect = document.getElementById('tc-holder-select');
    if (tcHolderSelect) {
        // Le sélecteur de Modèle doit exister dans votre HTML
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
            modelSelect.disabled = true; // Désactivé par défaut
        }
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
// 3A. CHARGEMENT DES TC HOLDERS (Étape 1 de la cascade)
// =================================================================

async function loadTcHolders() {
    const select = document.getElementById('tc-holder-select');
    if (!select) return console.error("Sélecteur 'tc-holder-select' introuvable.");

    // Récupération des valeurs uniques de la colonne tc_holder
    const { data: tcHolders, error } = await supabase
        .from('type_avion')
        .select('tc_holder', { distinct: true })
        .order('tc_holder');

    if (error) {
        console.error("Erreur chargement TC Holders:", error);
        select.innerHTML = '<option value="">Erreur de chargement</option>';
        return;
    }
    
    // Remplissage de la liste
    select.innerHTML = '<option value="">Sélectionner un TC Holder...</option>';
    if (tcHolders) {
        // Utilisation du nom de colonne 'tc_holder' de la table type_avion
        tcHolders.forEach(d => {
            const option = document.createElement('option');
            option.value = d.tc_holder;
            option.textContent = d.tc_holder;
            select.appendChild(option);
        });
    }
}


// =================================================================
// 3B. FILTRAGE DES MODÈLES (Étape 2 de la cascade) ✈️
// =================================================================

async function filterModelsByTcHolder() {
    const tcHolder = document.getElementById('tc-holder-select').value;
    const modelSelect = document.getElementById('model-select');
    
    if (!modelSelect) return console.error("Sélecteur 'model-select' introuvable.");

    modelSelect.innerHTML = ''; 
    modelSelect.disabled = true; 

    if (!tcHolder) {
        modelSelect.innerHTML = '<option value="">Sélectionner un TC Holder d\'abord</option>';
        return;
    }

    // Récupérer les Modèles d'Avion ('type_avion') filtrés par le TC Holder
    const { data: models, error: modelError } = await supabase
        .from('type_avion')
        .select('model_avion, id_type') // Nous avons besoin du modèle et de l'ID pour le futur (si nécessaire)
        .eq('tc_holder', tcHolder) // Appliquer le filtre
        .order('model_avion');

    if (modelError) {
        console.error("Erreur chargement Modèles filtrés:", modelError);
        modelSelect.innerHTML = '<option value="">Erreur de chargement des modèles</option>';
        return;
    }
    
    // Remplissage du select des Modèles
    modelSelect.innerHTML = '<option value="">Sélectionner un modèle...</option>';
    if (models) {
        models.forEach(m => {
            const option = document.createElement('option');
            // La valeur envoyée à SQL sera la chaîne de caractères du modèle ('p_model')
            option.value = m.model_avion; 
            option.textContent = m.model_avion;
            modelSelect.appendChild(option);
        });
        modelSelect.disabled = false; // Activer la liste des modèles
    }
}


// =================================================================
// 3C. CHARGEMENT DES SERVICES (INCHANGÉ)
// =================================================================

async function loadServices() {
    const { data: services, error: serviceError } = await supabase
        .from('services') 
        .select('id_service, description');

    if (serviceError) console.error("Erreur chargement Services:", serviceError);

    if (services) {
        const select = document.getElementById('service-select');
        if (!select) return console.error("Sélecteur 'service-select' introuvable.");
        
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
// 4. GESTIONNAIRE DE RECHERCHE (VERSION FINALE AVEC GESTION D'ERREUR)
// =================================================================

async function handleSearch(event) {
    event.preventDefault();
    const output = document.getElementById('results-output');
    output.innerHTML = '<p>Recherche en cours...</p>';

    // Déclaration des variables (déjà présent dans votre code)
    const tcHolder = document.getElementById('tc-holder-select').value;
    const model = document.getElementById('model-select').value; 
    const serviceId = document.getElementById('service-select').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
console.log("TC Holder envoyé :", `'${tcHolder}'`);
console.log("Modèle envoyé :", `'${model}'`);
console.log("Service ID envoyé :", parseInt(serviceId));
console.log(`Debut: ${startTimestamp}`); // '2025-11-16T00:00:00.000Z'
console.log(`Fin: ${endTimestamp}`);
    
    if (!tcHolder || !model || !serviceId || !startDate || !endDate) {
        output.innerHTML = '<p style="color: orange;">Veuillez remplir tous les champs avant de lancer la recherche.</p>';
        return;
    }
    
    const startTimestamp = `${startDate}T00:00:00.000Z`;
    const endTimestamp = `${endDate}T23:59:59.999Z`;

    try {
        // 🚨 APPEL RPC ET ATTENTE DE LA RÉPONSE
        const { data, error } = await supabase.rpc('search_available_slots', {
            p_tc_holder: tcHolder,
            p_model: model, 
            p_service_id: parseInt(serviceId),
            p_start_date_text: startTimestamp, 
            p_end_date_text: endTimestamp      
        });

        // 🚨 GESTION DE LA RÉPONSE DU SERVEUR
        if (error) {
            output.innerHTML = `<p style="color: red;">❌ Erreur SQL RPC : Code ${error.code} - ${error.message}</p>`;
            console.error("Détails de l'erreur RPC retournée par le serveur:", error);
        } else {
            // ✅ SUCCÈS : Afficher les résultats
            displayResults(data, output);
        }

    } catch (e) {
        // Gestion des erreurs réseau ou JavaScript non gérées
        output.innerHTML = `<p style="color: red;">❌ Erreur de connexion (Timeout ou autre). Voir la console.</p>`;
        console.error("Erreur de connexion/timeout:", e);
    }
}
// =================================================================
// 5. AFFICHAGE DES RÉSULTATS (CORRIGÉ) 📊
// =================================================================

function displayResults(data, outputElement) {
    
    // 1. Filtrer les éléments nuls/indéfinis et mapper pour extraire la bonne clé.
    // Utilisation de ?. (optional chaining) pour éviter l'erreur si l'élément est mal formé.
    const finalData = data
        .map(item => item?.available_slot_data) // Tente d'accéder à available_slot_data, retourne undefined si item est null
        .filter(item => item !== undefined && item !== null); // Retire les undefined/null du tableau final

    if (finalData.length === 0) {
        outputElement.innerHTML = '<p class="no-results">Désolé, aucun slot disponible pour ces critères (TC Holder, Modèle, Service et Date) dans les hangars compatibles.</p>';
        return;
    }

    let html = `
        <p><strong>${finalData.length} slot(s) disponible(s) trouvé(s) :</strong></p>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Hangar</th>
                    <th>Ville</th>
                    <th>Type de Slot</th>
                    <th>Agrément</th>
                    <th>ID Slot</th>
                </tr>
            </thead>
            <tbody>
    `;

    finalData.forEach(item => {
        html += `
            <tr>
                <td>${item.nom_hangar}</td> 
                <td>${item.ville}</td>
                <td>${item.slot_type}</td>
                <td>${item.hangar_agrement}</td>
                <td>${item.slot_id}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    outputElement.innerHTML = html;
}
