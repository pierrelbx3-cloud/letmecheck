// =================================================================
// 1. CONFIGURATION SUPABASE (À REMPLACER)
// =================================================================

// IMPORTANT : Remplacez ces valeurs par celles de votre projet Supabase.
// Vous les trouverez dans les paramètres de votre projet, sous 'API Settings'.
const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A'; 

// Initialisation du client Supabase
// Ceci crée une instance que nous utiliserons pour toutes les communications API.
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// =================================================================
// 2. RÉCUPÉRATION DES ÉLÉMENTS DU DOM
// =================================================================

const form = document.getElementById('query-form');
const queryTextarea = document.getElementById('sql-query');
const resultsOutput = document.getElementById('results-output');
const errorDisplay = document.getElementById('error-display');


// =================================================================
// 3. FONCTION UTILITAIRE
// =================================================================

// Fonction pour formater le résultat de l'API en JSON lisible
const formatJson = (data) => JSON.stringify(data, null, 2);


// =================================================================
// 4. GESTIONNAIRE D'ÉVÉNEMENT (Exécution de la Requête)
// =================================================================

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = queryTextarea.value.trim();
    
    // ... vérifications et affichage 'Executing...' ...

    try {
        // *** Remplacement du code de simulation par l'appel RPC réel ***
        const { data, error } = await supabase.rpc('execute_test_query', { 
             p_query: query // Le nom du paramètre (p_query) doit correspondre à la fonction SQL
        });
        
        // -----------------------------------------------------------------

        if (error) {
            errorDisplay.textContent = 'SQL Error: ' + error.message;
            errorDisplay.style.display = 'block';
            resultsOutput.textContent = formatJson(error);
        } else {
            // Affiche les données retournées (qui sont déjà au format JSON)
            resultsOutput.textContent = formatJson(data);
        }

    } catch (e) {
        // ... gestion des erreurs client ...
    }
});

// Exemple de données de recherche (ces valeurs viendraient de vos formulaires HTML)
const AIRCRAFT_ID = 1; // ID du modèle d'avion (ex: A320)
const SERVICE_ID = 5;  // ID du service (ex: C-Check)
const START_DATE = new Date('2025-12-01').toISOString();
const END_DATE = new Date('2025-12-15').toISOString();

async function runSearch() {
    const { data, error } = await supabase.rpc('search_available_slots', {
        p_aircraft_id: AIRCRAFT_ID,
        p_service_id: SERVICE_ID,
        p_start_date: START_DATE,
        p_end_date: END_DATE
    });

    if (error) {
        console.error("Erreur de recherche :", error);
        // Affichez l'erreur dans la zone de résultats de votre console de test
    } else {
        console.log("Slots disponibles trouvés :", data);
        // C'est le résultat final à afficher à l'utilisateur
        // Vous devrez parcourir ce tableau pour générer la liste de résultats HTML.
    }
}

// runSearch(); // Décommentez pour exécuter

// Assurez-vous que l'objet 'supabase' est déjà initialisé ici !
document.addEventListener('DOMContentLoaded', () => {
    // 1. Charger les listes déroulantes
    loadDropdowns();
    
    // 2. Écouter la soumission du formulaire
    document.getElementById('search-form').addEventListener('submit', handleSearch);
});

// --- ÉTAPE 1 : Chargement des données initiales ---

async function loadDropdowns() {
    // A. Charger les Modèles d'Avion
    const { data: models, error: modelError } = await supabase
        .from('type_avion') // Nom de votre table de modèles d'avion
        .select('id_type, model');

    if (models) {
        const select = document.getElementById('model-select');
        models.forEach(m => {
            const option = document.createElement('option');
            // Mettez à jour 'id_type' et 'model' si les noms de colonnes sont différents
            option.value = m.id_type;
            option.textContent = m.model;
            select.appendChild(option);
        });
    }

    // B. Charger les Services
    const { data: services, error: serviceError } = await supabase
        .from('services') // Nom de votre table de services
        .select('id, service_type'); // Utilisez 'id' et 'service_type' (selon votre correction)

    if (services) {
        const select = document.getElementById('service-select');
        services.forEach(s => {
            const option = document.createElement('option');
            // Mettez à jour 'id' et 'service_type' si les noms de colonnes sont différents
            option.value = s.id;
            option.textContent = s.service_type;
            select.appendChild(option);
        });
    }
}


// --- ÉTAPE 2 : Gestion de la recherche ---

async function handleSearch(event) {
    event.preventDefault();
    const output = document.getElementById('results-output');
    output.innerHTML = '<p>Recherche en cours...</p>';

    // Récupération des valeurs du formulaire
    const aircraftId = document.getElementById('model-select').value;
    const serviceId = document.getElementById('service-select').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!aircraftId || !serviceId || !startDate || !endDate) {
        output.innerHTML = '<p style="color: red;">Veuillez remplir tous les champs.</p>';
        return;
    }

    // Appel à la fonction RPC PostgreSQL que nous avons créée
    const { data, error } = await supabase.rpc('search_available_slots', {
        p_aircraft_id: aircraftId,
        p_service_id: serviceId,
        p_start_date: startDate,
        p_end_date: endDate
    });

    if (error) {
        output.innerHTML = `<p style="color: red;">Erreur SQL : ${error.message}</p>`;
    } else {
        displayResults(data, output);
    }
}

// --- ÉTAPE 3 : Affichage des résultats ---

function displayResults(data, outputElement) {
    if (data.length === 0) {
        outputElement.innerHTML = '<p>Désolé, aucun slot disponible pour ces critères.</p>';
        return;
    }

    // Crée une table pour afficher les données
    let html = `
        <p><strong>${data.length} slot(s) disponible(s) trouvé(s) :</strong></p>
        <table>
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
        // 'item' est l'objet JSON retourné par la fonction RPC
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
// --- NOUVELLE FONCTION : Filtrer les Services en fonction du Modèle d'Avion ---

async function filterServicesByAircraft() {
    const aircraftId = document.getElementById('model-select').value;
    const serviceSelect = document.getElementById('service-select');

    // Réinitialiser les options de service
    serviceSelect.innerHTML = '<option value="">Sélectionner...</option>';

    if (!aircraftId) {
        return; // Rien à faire si aucun avion n'est sélectionné
    }

    // Requête Supabase pour trouver les Services COMPATIBLES avec ce Modèle d'Avion
    // On utilise la table de jointure hangar_avion pour trouver les hangars compatibles,
    // puis on joint à hangar_service pour trouver les services offerts par ces hangars.
    
    // NOTE: C'est une requête complexe qui pourrait nécessiter une fonction RPC dédiée
    // pour de meilleures performances, mais faisons-le en deux étapes simples pour l'exemple.

    // ÉTAPE 1: Trouver les HANGARS compatibles avec ce modèle
    const { data: compatibleHangars, error: hgError } = await supabase
        .from('hangar_avion')
        .select('id_hangar')
        .eq('id_type', aircraftId);
        
    if (hgError || !compatibleHangars || compatibleHangars.length === 0) {
        console.warn("Aucun hangar compatible trouvé pour ce modèle.");
        return;
    }

    const hangarIds = compatibleHangars.map(h => h.id_hangar);
    
    // ÉTAPE 2: Trouver les SERVICES offerts par ces hangars compatibles
    const { data: compatibleServices, error: svError } = await supabase
        .from('hangar_services')
        .select(`
            service_id,
            services ( id, service_type )
        `)
        .in('hangar_id', hangarIds);

    if (svError) {
        console.error("Erreur lors du chargement des services compatibles:", svError);
        return;
    }

    // Récupérer et dédoublonner les services
    const uniqueServices = new Map();
    compatibleServices.forEach(item => {
        if (item.services) {
            uniqueServices.set(item.services.id, item.services.service_type);
        }
    });

    // Remplir la liste déroulante des services
    uniqueServices.forEach((serviceName, serviceId) => {
        const option = document.createElement('option');
        option.value = serviceId;
        option.textContent = serviceName;
        serviceSelect.appendChild(option);
    });
}

// --- AJOUTER L'ÉCOUTEUR À LA FONCTION loadDropdowns OU DOMContentLoaded ---

document.addEventListener('DOMContentLoaded', () => {
    // ... [le reste du code DOMContentLoaded] ...
    
    // AJOUTEZ CETTE LIGNE : 
    document.getElementById('model-select').addEventListener('change', filterServicesByAircraft);
});
