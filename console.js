const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
// Attention : La clé ANON est visible ici. C'est normal pour les tests front-end,
// mais elle ne permet l'accès qu'aux tables avec des politiques RLS appropriées.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A'; 

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fonctions de Base de Données Utilisées par l'Interface ---

/**
 * Lit toutes les lignes et colonnes d'une table.
 * @param {string} tableName Le nom de la table à interroger.
 */
async function fetchAllData(tableName) {
    console.log(`Tentative de lecture de la table: ${tableName}`);
    
    try {
        const { data, error } = await supabase
            // CORRECTION CLÉ : Utiliser la variable 'tableName' pour la rendre réutilisable
            .from(tableName) 
            .select('*'); 

        if (error) {
            console.error('Erreur lors de la récupération des données:', error.message);
            return { data: null, error: error };
        }

        console.log(`✅ Données de la table '${tableName}' reçues:`, data);
        return { data: data, error: null };

    } catch (err) {
        console.error('Erreur inattendue:', err);
        return { data: null, error: err };
    }
}

/**
 * Insère une nouvelle ligne dans une table.
 * @param {string} tableName Le nom de la table cible.
 * @param {object} rowObject L'objet contenant les données à insérer.
 */
async function insertNewRow(tableName, rowObject) {
    console.log(`Tentative d'insertion dans la table: ${tableName}`, rowObject);

    try {
        const { data, error } = await supabase
            .from(tableName)
            .insert(rowObject)
            .select();

        if (error) {
            console.error('Erreur lors de l\'insertion:', error.message);
            return { data: null, error: error };
        }

        console.log(`✅ Ligne insérée avec succès:`, data);
        return { data: data, error: null };

    } catch (err) {
        console.error('Erreur inattendue:', err);
        return { data: null, error: err };
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
            e.preventDefault(); // Empêche le rechargement de la page
            
            const queryText = queryInput.value.trim().toLowerCase();
            const resultsOutput = document.getElementById('results-output');
            
            resultsOutput.textContent = "[ Exécution en cours... ]";
            errorDisplay.style.display = 'none';

            // Une solution simple pour simuler une requête SELECT avec l'API Supabase JS
            // (Note : L'API ne gère pas directement les chaînes SQL brutes pour les SELECTs)
            const selectMatch = queryText.match(/select\s+(.+)\s+from\s+(\w+)/);

            if (selectMatch) {
                const columns = selectMatch[1].trim(); 
                const table = selectMatch[2].trim();   
                
                // Exécution de la requête de lecture (SELECT)
                const { data, error } = await supabase.from(table).select(columns);

                if (error) {
                    errorDisplay.textContent = `🚫 Erreur Supabase: ${error.message}`;
                    errorDisplay.style.display = 'block';
                    resultsOutput.textContent = JSON.stringify(error, null, 2);
                } else {
                    resultsOutput.textContent = JSON.stringify(data, null, 2);
                    errorDisplay.style.display = 'none';
                }
            } else {
                // Si la requête ne correspond pas au format SELECT * FROM table
                errorDisplay.textContent = "Format de requête SQL non supporté par le testeur (utilisez SELECT colonnes FROM table).";
                errorDisplay.style.display = 'block';
                resultsOutput.textContent = "[ Échec de l'analyse de la requête ]";
            }
        });
    }
    
    // --- Ligne de test automatique (Optionnel : Décommenter pour un test au chargement) ---
    // fetchAllData('hangars'); 
});
