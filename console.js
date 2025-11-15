const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A';

// 1. Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Fonction unique pour lire n'importe quelle table
/**
 * Lit toutes les lignes et colonnes d'une table spécifiée.
 * @param {string} tableName Le nom de la table à interroger.
 */
async function fetchTableData(tableName) {
    console.log(`Tentative de lecture de la table: ${tableName}`);
    
    try {
        const { data, error } = await supabase
            .from(tableName) 
            .select('*'); 

        if (error) {
            console.error(`🚫 Erreur Supabase pour ${tableName}:`, error.message);
            return;
        }

        console.log(`✅ Données de la table '${tableName}' reçues:`, data);
        return data;
        
    } catch (err) {
        console.error('Erreur inattendue:', err);
    }
}

// 3. Exécution d'un test au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Appelez ici la table que vous voulez tester.
    fetchTableData('hangars'); 
});
