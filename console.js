const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A'; 

// 1. Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Fonction de lecture paramétrable
/**
 * Lit toutes les lignes et colonnes d'une table spécifiée.
 * @param {string} tableName Le nom de la table à interroger (ex: 'hangars', 'vols', etc.).
 */
async function fetchTableData(tableName) {
    try {
        console.log(`Tentative de lecture de la table: ${tableName}`);
        
        // Utilisation du paramètre tableName pour interroger n'importe quelle table
        const { data, error } = await supabase
            .from(tableName) 
            .select('*'); 

        if (error) {
            console.error(`🚫 Erreur Supabase lors de la lecture de ${tableName}:`, error.message);
            return;
        }

        console.log(`✅ Données de la table '${tableName}' reçues:`, data);
        return data;
        
    } catch (err) {
        console.error('Erreur inattendue:', err);
    }
}

// 3. Exécution des tests au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Exemples d'appels pour afficher les données :
    fetchTableData('hangars'); // Pour afficher la table 'hangars'
    // fetchTableData('vols');   // Décommenter pour tester une autre table
});
