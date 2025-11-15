const SUPABASE_URL = 'https://nsbbemlzhpyngeorvrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYmJlbWx6aHB5bmdlb3J2cnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA0OTEsImV4cCI6MjA3Njc3NjQ5MX0.5MhJ98Q8SJQ3OwvzZZ9xcsg8C9FdYrvnFcRdsfatC7A';

// Initialisation du client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fonctions de Base de Données (CRUD) ---

/**
 * 📚 READ : Lit les lignes et colonnes spécifiées d'une table.
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
            throw error;
        }
        console.log(`✅ Données de la table '${tableName}' reçues.`);
        return { data: data, error: null };
        
    } catch (error) {
        console.error(`🚫 Erreur Supabase pour ${tableName}:`, error.message);
        return { data: null, error: error };
    }
}

/**
 * ➕ CREATE : Insère une nouvelle ligne dans une table.
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
            throw error;
        }
        console.log(`✅ Ligne insérée avec succès.`);
        return { data: data, error: null };

    } catch (error) {
        console.error('🚫 Erreur lors de l\'insertion:', error.message);
        return { data: null, error: error };
    }
}

/**
 * ✏️ UPDATE : Modifie des lignes basées sur une condition 'WHERE' simple.
 * @param {string} tableName Le nom de la table cible.
 * @param {object} updates L'objet contenant les valeurs à mettre à jour.
 * @param {string} column La colonne pour la condition WHERE (ex: 'id').
 * @param {any} value La valeur pour la condition WHERE (ex: 5).
 */
async function updateRow(tableName, updates, column, value) {
    console.log(`Tentative de mise à jour de la table: ${tableName} (WHERE ${column} = ${value})`, updates);

    try {
        const { data, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq(column, value) // Condition WHERE
            .select();

        if (error) {
            throw error;
        }
        console.log(`✅ Ligne(s) mise(s) à jour.`);
        return { data: data, error: null };

    } catch (error) {
        console.error('🚫 Erreur lors de la mise à jour:', error.message);
        return { data: null, error: error };
    }
}

/**
 * 🗑️ DELETE : Supprime des lignes basées sur une condition 'WHERE' simple.
 * @param {string} tableName Le nom de la table cible.
 * @param {string} column La colonne pour la condition WHERE (ex: 'id').
 * @param {any} value La valeur pour la condition WHERE (ex: 10).
 */
async function deleteRow(tableName, column, value) {
    console.log(`Tentative de suppression dans la table: ${tableName} (WHERE ${column} = ${value})`);

    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(column, value); // Condition WHERE

        if (error) {
            throw error;
        }
        console.log(`✅ Ligne(s) supprimée(s).`);
        // La méthode delete ne retourne pas les données supprimées par défaut
        return { data: { status: 'Success' }, error: null };

    } catch (error) {
        console.error('🚫 Erreur lors de la suppression:', error.message);
        return { data: null, error: error };
    }
}


// --- GESTION DE L'INTERFACE UTILISATEUR ET ÉVÉNEMENTS ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Scripts chargés. Testeur de requêtes prêt.");
    
    const form = document.getElementById('query-form');
    const queryInput = document.getElementById('sql-query');
    const resultsOutput = document.getElementById('results-output');
    const errorDisplay = document.getElementById('error-display');

    // Fonction utilitaire pour afficher les résultats ou les erreurs
    function displayResult(result) {
        if (result.error) {
            errorDisplay.textContent = `🚫 Erreur: ${result.error.message || result.error}`;
            errorDisplay.style.display = 'block';
            resultsOutput.textContent = JSON.stringify(result.error, null, 2);
        } else {
            errorDisplay.style.display = 'none';
            resultsOutput.textContent = JSON.stringify(result.data, null, 2);
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const queryText = queryInput.value.trim();
            const lowerQuery = queryText.toLowerCase();
            
            resultsOutput.textContent = "[ Exécution en cours... ]";
            errorDisplay.style.display = 'none';

            let result = { data: null, error: { message: "Format de requête non supporté. Utilisez SELECT, INSERT, UPDATE, ou DELETE." } };

            // --- Logique d'exécution (Détection du type de requête) ---
            
            if (lowerQuery.startsWith('select')) {
                // EXÉCUTION SELECT
                const match = lowerQuery.match(/select\s+(.+)\s+from\s+(\w+)/);
                if (match) {
                    result = await fetchTableData(match[2].trim(), match[1].trim());
                }
            } else if (lowerQuery.startsWith('insert')) {
                // EXÉCUTION INSERT (Format très simplifié : INSERT INTO table {json})
                // Nécessite une entrée JSON valide après INTO table
                const match = queryText.match(/INSERT\s+INTO\s+(\w+)\s*(\{.*\})/i);
                if (match) {
                    try {
                        const table = match[1].trim();
                        // Tente de parser l'objet JSON (deuxième groupe capturant)
                        const rowObject = JSON.parse(match[2].trim()); 
                        result = await insertNewRow(table, rowObject);
                    } catch (e) {
                        result.error.message = `Erreur de formatage JSON ou de syntaxe INSERT: ${e.message}`;
                    }
                }
            } else if (lowerQuery.startsWith('update')) {
                // EXÉCUTION UPDATE (Format très simplifié : UPDATE table SET {json} WHERE col=val)
                const match = queryText.match(/UPDATE\s+(\w+)\s+SET\s*(\{.*\})\s+WHERE\s+(\w+)\s*=\s*([^\s;]+)/i);
                if (match) {
                    try {
                        const table = match[1].trim();
                        const updates = JSON.parse(match[2].trim());
                        const column = match[3].trim();
                        // Supprime les guillemets si présents
                        const value = match[4].trim().replace(/^['"]|['"]$/g, ''); 
                        result = await updateRow(table, updates, column, value);
                    } catch (e) {
                        result.error.message = `Erreur de formatage JSON ou de syntaxe UPDATE: ${e.message}`;
                    }
                }
            } else if (lowerQuery.startsWith('delete')) {
                // EXÉCUTION DELETE (Format très simplifié : DELETE FROM table WHERE col=val)
                const match = lowerQuery.match(/delete\s+from\s+(\w+)\s+where\s+(\w+)\s*=\s*([^\s;]+)/);
                if (match) {
                    const table = match[1].trim();
                    const column = match[2].trim();
                    // Supprime les guillemets si présents
                    const value = match[3].trim().replace(/^['"]|['"]$/g, '');
                    result = await deleteRow(table, column, value);
                }
            }

            // 3. Affichage des résultats
            displayResult(result);
        });
    }
    
    // Test de connexion initial : Lecture de la table 'hangars' au chargement
    fetchTableData('hangars', 'id, nom_hangar').then(displayResult);
});
