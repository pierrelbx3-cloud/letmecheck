const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A';

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fonctions de Base de Données (API du client) ---

/**
 * Lit toutes les lignes et colonnes d'une table.
 * @param {string} tableName Le nom de la table à interroger.
 */
async function fetchAllData(tableName) {
    console.log(`Tentative de lecture de la table: ${tableName}`);
    try {
        const { data, error } = await supabase
            .from(tableName) 
            .select('*'); 

        if (error) {
            console.error('🚫 Erreur lors de la récupération des données:', error.message);
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
            console.error('🚫 Erreur lors de l\'insertion:', error.message);
            return { data: null, error: error };
        }

        console.log(`✅ Ligne insérée avec succès:`, data);
        return { data: data, error: null };
    } catch (err) {
        console.error('Erreur inattendue:', err);
        return { data: null, error: err };
    }
}

/**
 * Exécute une fonction stockée (Stored Procedure) définie dans votre base de données.
 * @param {string} functionName Le nom de la fonction PostgreSQL.
 * @param {object} params Les arguments à passer à la fonction.
 */
async function executeRpc(functionName, params = {}) {
    console.log(`Tentative d'exécution de la fonction RPC: ${functionName}`, params);
    try {
        const { data, error } = await supabase.rpc(functionName, params);

        if (error) {
            console.error(`🚫 Erreur lors de l'appel RPC de ${functionName}:`, error.message);
            return { data: null, error: error };
        }

        console.log(`✅ Fonction RPC '${functionName}' exécutée:`, data);
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
            e.preventDefault(); 
            
            const queryText = queryInput.value.trim().toLowerCase();
            resultsOutput.textContent = "[ Exécution en cours... ]";
            errorDisplay.style.display = 'none';

            let result = { data: null, error: { message: "Format de requête non supporté. Utilisez SELECT ou une fonction RPC." } };

            // 1. Détection et exécution de la requête SELECT
            const selectMatch = queryText.match(/select\s+(.+)\s+from\s+(\w+)/);
            if (selectMatch) {
                const columns = selectMatch[1].trim();
                const table = selectMatch[2].trim();
                
                const { data, error } = await supabase.from(table).select(columns);
                result = { data, error };
            }
            // 2. Détection et exécution de l'appel RPC (fonction)
            // Permet d'appeler une fonction PostgreSQL (ex: 'rpc nom_fonction')
            else if (queryText.startsWith('rpc ')) {
                const parts = queryText.substring(4).trim().split(' ');
                const functionName = parts[0];
                
                // Note: Ici, on ne gère pas les paramètres complexes pour rester simple.
                // Pour appeler, tapez simplement "RPC nom_de_la_fonction" dans le champ.
                result = await executeRpc(functionName);
            }

            // 3. Affichage des résultats
            if (result.error) {
                errorDisplay.textContent = `🚫 Erreur: ${result.error.message}`;
                errorDisplay.style.display = 'block';
                resultsOutput.textContent = JSON.stringify(result.error, null, 2);
            } else {
                resultsOutput.textContent = JSON.stringify(result.data, null, 2);
                errorDisplay.style.display = 'none';
            }
        });
    }
    
    // --- Ligne de test au chargement ---
    // Décommenter l'une ou l'autre pour tester la connexion au chargement de la page
    // fetchAllData('hangars'); 
    // executeRpc('votre_fonction_de_test'); // Exemple d'appel RPC (si définie)
});
