// =================================================================
// 1. CONFIGURATION SUPABASE (À REMPLACER)
// =================================================================

// IMPORTANT : Remplacez ces valeurs par celles de votre projet Supabase.
// Vous les trouverez dans les paramètres de votre projet, sous 'API Settings'.
const SUPABASE_URL = 'VOTRE_URL_SUPABASE'; 
const SUPABASE_ANON_KEY = 'VOTRE_CLE_PUBLIQUE_ANON'; 

// Initialisation du client Supabase
// Ceci crée une instance que nous utiliserons pour toutes les communications API.
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


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
    e.preventDefault(); // Empêche le rechargement de la page par le formulaire
    
    const query = queryTextarea.value.trim();
    
    // Mise à jour de l'interface utilisateur
    resultsOutput.textContent = '[ Executing... ]';
    errorDisplay.style.display = 'none';

    if (!query) {
        errorDisplay.textContent = 'Veuillez entrer une requête SQL.';
        errorDisplay.style.display = 'block';
        resultsOutput.textContent = '';
        return;
    }

    try {
        // --- LOGIQUE SUPABASE POUR EXÉCUTER UNE REQUÊTE ---
        
        // Supabase n'offre pas de méthode directe 'query()' pour exécuter une chaîne SQL arbitraire
        // avec la clé publique (pour des raisons de sécurité RLS).
        // La meilleure façon de tester une requête SQL est d'utiliser une Fonction Postgres.

        // 🚨 IMPORTANT : Pour que cela fonctionne, vous devez créer une *Fonction Stockée* (Stored Procedure) 
        // dans votre base de données Supabase, par exemple `execute_test_query`,
        // qui prend en paramètre votre requête (string) et l'exécute.
        
        // Exemple pour appeler une fonction SQL stockée nommée 'execute_test_query' :
        const { data, error } = await supabase.rpc('execute_test_query', { 
             p_query: query // p_query est le nom que vous donnez au paramètre dans votre fonction SQL
        });
        
        // Si vous utilisez seulement des SELECT simples et que vous avez configuré des RLS, 
        // vous pourriez utiliser .from().select() mais cela ne permet pas les requêtes SQL brutes.

        // ----------------------------------------------------

        if (error) {
            errorDisplay.textContent = 'SQL Error: ' + error.message;
            errorDisplay.style.display = 'block';
            resultsOutput.textContent = formatJson(error);
        } else {
            // Afficher les données retournées
            resultsOutput.textContent = formatJson(data);
        }

    } catch (e) {
        errorDisplay.textContent = 'Execution Error (Client): ' + e.message;
        errorDisplay.style.display = 'block';
        resultsOutput.textContent = '';
    }
});
