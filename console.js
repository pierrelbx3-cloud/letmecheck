
const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A'; 

// Initialisation du client Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fonctions de Base de Données ---

/**
 * Lit toutes les lignes d'une table et les affiche dans la console.
 * @param {string} tableName Le nom de la table à interroger.
 */
async function fetchAllData(tableName) {
  console.log(`Tentative de lecture de la table: ${tableName}`);
  
  try {
    const { data, error } = await supabase
      .from(hangars) // Remplacez 'votre_table' par le nom de la table que vous voulez lire
      .select('*'); // Sélectionne toutes les colonnes

    if (error) {
      console.error('Erreur lors de la récupération des données:', error.message);
      return;
    }

    console.log(`✅ Données de la table '${tableName}' reçues:`, data);
    // Ici, vous pourriez ajouter du code pour afficher 'data' dans l'interface HTML
    return data;

  } catch (err) {
    console.error('Erreur inattendue:', err);
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
            .select(); // Retourne les lignes insérées

        if (error) {
            console.error('Erreur lors de l\'insertion:', error.message);
            return;
        }

        console.log(`✅ Ligne insérée avec succès:`, data);
        return data;

    } catch (err) {
        console.error('Erreur inattendue:', err);
    }
}
