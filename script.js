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
