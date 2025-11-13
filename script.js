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
// 3. CHARGEMENT DES LISTES DÉROULANTES (TOUT AFFICHER) 🚀
// =================================================================

async function loadDropdowns() {
    // --- A. Charger les Modèles d'Avion ('type_avion') ---
    
    const { data: models, error: modelError } = await supabase
        .from('type_avion') 
        .select('id_type, model_avion'); // Colonnes de votre table

    if (modelError) console.error("Erreur chargement Modèles:", modelError);

    if (models) {
        const select = document.getElementById('model-select');
        // Ajouter l'option par défaut
        select.innerHTML = '<option value="">Sélectionner un modèle...</option>';
        
        models.forEach(m => {
            const option = document.createElement('option');
            option.value = m.id_type;
            option.textContent = m.model_avion;
            select.appendChild(option);
        });
    }

    // --- B. Charger TOUS les Services ('services') ---
    
    const { data: services, error: serviceError } = await supabase
        .from('services') 
        .select('id_service, description'); // Colonnes de votre table

    if (serviceError) console.error("Erreur chargement Services:", serviceError);

    if (services) {
        const select = document.getElementById('service-select');
        // Ajouter l'option par défaut
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
// 4. GESTIONNAIRE DE RECHERCHE (APPEL RPC)
// =================================================================

async function handleSearch(event) {
    event.preventDefault();
    const output = document.getElementById('results-output');
    output.innerHTML = '<p>Recherche en cours...</p>';

    // Récupération des valeurs du formulaire (assurez-vous des IDs HTML)
    const aircraftId = document.getElementById('model-select').value;
    const serviceId = document.getElementById('service-select').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!aircraftId || !serviceId || !startDate || !endDate) {
        output.innerHTML = '<p style="color: orange;">Veuillez remplir tous les champs avant de lancer la recherche.</p>';
        return;
    }
    
    // Conversion des dates en format ISO 8601 UTC si les inputs sont de type 'date'
    // Nous ajoutons T00:00:00.000Z pour garantir le bon format TimeZone
    const startTimestamp = `${startDate}T00:00:00.000Z`;
    const endTimestamp = `${endDate}T23:59:59.999Z`; // Fin de journée pour inclure tout le dernier jour

    // Appel à la fonction RPC PostgreSQL (moteur de recherche)
    const { data, error } = await supabase.rpc('search_available_slot', {
        p_aircraft_id: parseInt(aircraftId), // Convertir en nombre si nécessaire
        p_service_id: parseInt(serviceId),   // Convertir en nombre si nécessaire
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
