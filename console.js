const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A';

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fonctions de Base de Données (Lecture uniquement) ---

/**
 * Lit les lignes et colonnes spécifiées d'une table.
 * @param {string} tableName Le nom de la table cible.
 * @param {string} columns Les colonnes à sélectionner (ex: '*', 'id, nom').
 */
async function fetchTableData(tableName, columns = '*') {
    console.log(`Tentative de lecture de la table: ${tableName} (Colonnes: ${columns})`);
    
    try {
        const { data, error } = await supabase
            .from(tableName) 
            .select(columns); 

        if (error) {
            console.error(`🚫 Erreur Supabase pour ${tableName}:`, error.message);
            // Retourne un objet d'erreur standard
            return { data: null, error: error }; 
        }

        console.log(`✅ Données de la table '${tableName}' reçues:`, data);
        return { data: data, error: null };
        
    } catch (err) {
        console.error('Erreur inattendue:', err);
        // Retourne une erreur inattendue
        return { data: null, error: { message: `Erreur inattendue: ${err.message}` } };
    }
}


// --- GESTION DE L'INTERFACE UTILISATEUR ET ÉVÉNEMENTS ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Scripts chargés. Écoute du formulaire démarrée.");
    
    const form = document.getElementById('query-form');
    const queryInput = document.getElementById('sql-query');
    const resultsOutput = document.getElementById('results-output');
    const errorDisplay = document.getElementById('error-display');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const queryText = queryInput.value.trim().toLowerCase();
            
            resultsOutput.textContent = "[ Exécution en cours... ]";
            errorDisplay.style.display = 'none';

            let result = { data: null, error: { message: "Format de requête non supporté. Utilisez 'SELECT colonnes FROM table'." } };

            // 1. Détection et exécution de la requête SELECT
            // Le regex recherche: SELECT [une ou plusieurs choses] FROM [un mot]
            const selectMatch = queryText.match(/select\s+(.+)\s+from\s+(\w+)/);

            if (selectMatch) {
                const columns = selectMatch[1].trim(); 
                const table = selectMatch[2].trim();   
                
                // Exécution de la requête en utilisant la fonction réutilisable
                result = await fetchTableData(table, columns);
            }

            // 2. Affichage des résultats
            if (result.error) {
                errorDisplay.textContent = `🚫 Erreur: ${result.error.message}`;
                errorDisplay.style.display = 'block';
                // Afficher l'objet d'erreur dans la zone de sortie
                resultsOutput.textContent = JSON.stringify(result.error, null, 2); 
            } else {
                // Afficher les données JSON formatées
                resultsOutput.textContent = JSON.stringify(result.data, null, 2);
                errorDisplay.style.display = 'none';
            }
        });
    }
    
    // --- Test de connexion initial au chargement (Optionnel) ---
    // Vous pouvez décommenter cette ligne pour vérifier la connexion immédiatement
    // fetchTableData('hangars', 'id, nom_hangar'); 
});
