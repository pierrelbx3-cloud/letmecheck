const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A';

// 1. Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Fonction de lecture des données et d'affichage des résultats
async function fetchTableData(tableName) {
    const resultsOutput = document.getElementById('results-output');
    const errorDisplay = document.getElementById('error-display');
    
    // Affichage initial
    resultsOutput.textContent = `[ Tentative de lecture de la table '${tableName}'... ]`;
    errorDisplay.style.display = 'none';

    try {
        const { data, error } = await supabase
            .from(tableName) 
            .select('*'); 

        if (error) {
            // Affiche l'erreur dans la zone d'erreur et la console
            errorDisplay.textContent = `🚫 Erreur Supabase pour ${tableName}: ${error.message}`;
            errorDisplay.style.display = 'block';
            resultsOutput.textContent = JSON.stringify(error, null, 2);
            console.error('Erreur:', error.message);
            return;
        }

        // Affiche les données JSON formatées dans la zone de résultats
        resultsOutput.textContent = JSON.stringify(data, null, 2);
        console.log(`✅ Données de la table '${tableName}' reçues:`, data);
        
    } catch (err) {
        // Gère les erreurs inattendues (réseau, JS)
        errorDisplay.textContent = `🚫 Erreur inattendue: ${err.message}`;
        errorDisplay.style.display = 'block';
        resultsOutput.textContent = "[ ERREUR FATALE ]";
        console.error('Erreur inattendue:', err);
    }
}

// 3. Exécution d'un test au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Lance la requête pour la table 'hangars' au chargement de la page.
    fetchTableData('hangars'); 
});
