import supabaseClient from '../config/supabaseConfig.js';

class SupabaseService {
    constructor() {
        this.supabase = supabaseClient;
        console.log('SupabaseService initialized with existing client');
    }

    // Basic Supabase service with no authentication or leaderboard functionality
    // Add your custom Supabase methods here as needed
    
    /**
     * Fetch all records from a table
     * @param {string} tableName - The name of the table
     * @param {string} columns - Columns to select (default: *)
     * @returns {Promise} - The query result
     */
    async getAll(tableName, columns = '*') {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select(columns);
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    
    /**
     * Fetch records from a table with a filter
     * @param {string} tableName - The name of the table
     * @param {object} filters - Object containing column:value pairs to filter by
     * @param {string} columns - Columns to select (default: *)
     * @returns {Promise} - The query result
     */
    async getFiltered(tableName, filters, columns = '*') {
        try {
            let query = this.supabase.from(tableName).select(columns);
            
            // Apply all filters
            Object.entries(filters).forEach(([column, value]) => {
                query = query.eq(column, value);
            });
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            throw error;
        }
    }
    
    /**
     * Fetch a single record by ID
     * @param {string} tableName - The name of the table
     * @param {number|string} id - The ID of the record
     * @param {string} columns - Columns to select (default: *)
     * @returns {Promise} - The query result
     */
    async getById(tableName, id, columns = '*') {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select(columns)
                .eq('id', id)
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error fetching record with ID ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Fetch records with pagination and sorting
     * @param {string} tableName - The name of the table
     * @param {number} page - Page number (starts at 1)
     * @param {number} pageSize - Number of records per page
     * @param {string} orderColumn - Column to order by
     * @param {boolean} ascending - Order direction (true for ascending)
     * @param {string} columns - Columns to select (default: *)
     * @returns {Promise} - The query result
     */
    async getPaginated(tableName, page = 1, pageSize = 10, orderColumn = 'id', ascending = true, columns = '*') {
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            
            const { data, error, count } = await this.supabase
                .from(tableName)
                .select(columns, { count: 'exact' })
                .order(orderColumn, { ascending })
                .range(from, to);
                
            if (error) throw error;
            
            return {
                data,
                pagination: {
                    page,
                    pageSize,
                    total: count,
                    pages: Math.ceil(count / pageSize)
                }
            };
        } catch (error) {
            console.error('Error fetching paginated data:', error);
            throw error;
        }
    }

    /**
     * Fetch all records from the poli_quest_tabel
     * @param {string} columns - Columns to select (default: *)
     * @returns {Promise} - The query result with all poli_quest_tabel data
     */
    async getPoliQuestData(columns = '*') {
        try {
            return await this.getAll('poli_quest_tabel', columns);
        } catch (error) {
            console.error('Error fetching poli_quest_tabel data:', error);
            throw error;
        }
    }

    /**
     * Fetch specific columns from a table
     * @param {string} tableName - The name of the table
     * @param {string} columnsString - Comma-separated list of columns to select
     * @returns {Promise} - The query result with only the specified columns
     */
    async getSpecificColumns(tableName, columnsString) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select(columnsString);
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error fetching specific columns (${columnsString}) from ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * Fetch specific columns from poli_quest_tabel
     * @param {string} columnsString - Comma-separated list of columns to select
     * @returns {Promise} - The query result with only the specified columns
     */
    async getPoliQuestColumns(columnsString) {
        try {
            return await this.getSpecificColumns('poli_quest_tabel', columnsString);
        } catch (error) {
            console.error(`Error fetching specific columns (${columnsString}) from poli_quest_tabel:`, error);
            throw error;
        }
    }

    /**
     * Insert one or more rows into a table
     * @param {string} tableName - The name of the table
     * @param {object|array} data - Single object or array of objects to insert
     * @param {boolean} returnData - Whether to return the inserted data
     * @returns {Promise} - The query result
     */
    async insertData(tableName, data, returnData = true) {
        try {
            let query = this.supabase.from(tableName).insert(data);
            
            if (returnData) {
                query = query.select();
            }
            
            const { data: result, error } = await query;
            
            if (error) throw error;
            return result;
        } catch (error) {
            console.error('Error inserting data:', error);
            throw error;
        }
    }
    
    /**
     * Insert or update (upsert) one or more rows in a table
     * @param {string} tableName - The name of the table
     * @param {object|array} data - Single object or array of objects to upsert
     * @param {boolean} returnData - Whether to return the upserted data
     * @returns {Promise} - The query result
     */
    async upsertData(tableName, data, returnData = true) {
        try {
            let query = this.supabase.from(tableName).upsert(data);
            
            if (returnData) {
                query = query.select();
            }
            
            const { data: result, error } = await query;
            
            if (error) throw error;
            return result;
        } catch (error) {
            console.error('Error upserting data:', error);
            throw error;
        }
    }
    
    /**
     * Update rows in a table that match the given filters
     * @param {string} tableName - The name of the table
     * @param {object} updateData - Data to update
     * @param {object} filters - Object containing column:value pairs to filter by
     * @param {boolean} returnData - Whether to return the updated data
     * @returns {Promise} - The query result
     */
    async updateData(tableName, updateData, filters, returnData = true) {
        try {
            let query = this.supabase.from(tableName).update(updateData);
            
            // Apply all filters
            Object.entries(filters).forEach(([column, value]) => {
                query = query.eq(column, value);
            });
            
            if (returnData) {
                query = query.select();
            }
            
            const { data: result, error } = await query;
            
            if (error) throw error;
            return result;
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }
    
    /**
     * Delete rows from a table that match the given filters
     * @param {string} tableName - The name of the table
     * @param {object} filters - Object containing column:value pairs to filter by
     * @returns {Promise} - The query result
     */
    async deleteData(tableName, filters) {
        try {
            let query = this.supabase.from(tableName).delete();
            
            // Apply all filters
            Object.entries(filters).forEach(([column, value]) => {
                query = query.eq(column, value);
            });
            
            const { error } = await query;
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            throw error;
        }
    }
    
    /**
     * Subscribe to database changes for a specific table
     * @param {string} tableName - The name of the table
     * @param {string} event - Event type ('INSERT', 'UPDATE', 'DELETE', or '*')
     * @param {function} callback - Callback function to handle changes
     * @param {string} filter - Optional filter expression (e.g., 'column_name=eq.value')
     * @returns {object} - The subscription channel object
     */
    subscribeToChanges(tableName, event = '*', callback, filter = null) {
        const channelName = `${tableName}-${event}-${Date.now()}`;
        
        const options = {
            event: event,
            schema: 'public',
            table: tableName
        };
        
        if (filter) {
            options.filter = filter;
        }
        
        const channel = this.supabase.channel(channelName)
            .on(
                'postgres_changes',
                options,
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();
            
        return channel;
    }
    
    /**
     * Subscribe to changes in the poli_quest_tabel
     * @param {string} event - Event type ('INSERT', 'UPDATE', 'DELETE', or '*')
     * @param {function} callback - Callback function to handle changes
     * @param {string} filter - Optional filter expression
     * @returns {object} - The subscription channel object
     */
    subscribeToPoliQuestChanges(event = '*', callback, filter = null) {
        return this.subscribeToChanges('poli_quest_tabel', event, callback, filter);
    }

    /**
     * Save player data (nickname, BSC address, score)
     * @param {object} playerData - Object containing nick_name, bsc_adress, and score
     * @returns {Promise} - The query result with additional status info
     */
    async savePlayerData(playerData) {
        try {
            // Insert new entry regardless of duplicates
            // Remove the timestamp field that was causing the error
            const { data, error } = await this.supabase
                .from('poli_quest_tabel')
                .insert({
                    nick_name: playerData.nick_name,
                    bsc_adress: playerData.bsc_adress,
                    score: playerData.score
                    // timestamp field removed since it doesn't exist in the database
                })
                .select();
                
            if (error) throw error;
            
            console.log('Successfully saved player data, including potential duplicates');
            
            return {
                data,
                status: 'success',
                message: 'Score saved successfully'
            };
        } catch (error) {
            console.error('Error saving player data:', error);
            throw error;
        }
    }

    /**
     * Get player data by nickname or BSC address
     * @param {string} nickName - Player's nickname
     * @param {string} bscAddress - Player's BSC address
     * @returns {Promise} - The query result with player data
     */
    async getPlayerData(nickName, bscAddress) {
        try {
            const { data, error } = await this.supabase
                .from('poli_quest_tabel')
                .select('*')
                .or(`nick_name.eq.${nickName},bsc_adress.eq.${bscAddress}`);
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching player data:', error);
            throw error;
        }
    }

    /**
     * Update player's score if the new score is higher than their current score
     * @param {string} nickName - Player's nickname
     * @param {string} bscAddress - Player's BSC address
     * @param {number} newScore - New score value
     * @returns {Promise} - The query result
     */
    async updateHighScore(nickName, bscAddress, newScore) {
        try {
            // Always create a new entry with the new score
            return await this.savePlayerData({
                nick_name: nickName, 
                bsc_adress: bscAddress, 
                score: newScore
            });
        } catch (error) {
            console.error('Error updating high score:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export default new SupabaseService();
