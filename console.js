// Remplacez ces valeurs par VOS clés Supabase
// **ATTENTION :** Ces clés (anon public key) sont visibles par l'utilisateur final 
// et doivent être utilisées pour des opérations de "lecture" sécurisées.
// Pour les opérations sensibles, utilisez des fonctions Edge ou le serveur.
const SUPABASE_URL = 'VOTRE_URL_SUPABASE_ICI'; // Ex: 'https://xyz123abc.supabase.co'
const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIQUE_ICI'; 

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
      .from(tableName) // Remplacez 'votre_table' par le nom de la table que vous voulez lire
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
