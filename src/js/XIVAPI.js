class XIVAPI
{
    get(endpoint, queries, callback) {
        loading = true;

        queries = queries ? queries : {};
        queries.language = localStorage.getItem('language');

        let query = Object.keys(queries)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queries[k]))
            .join('&');

        endpoint = endpoint +'?'+ query;

        fetch (`https://xivapi.com${endpoint}`, { mode: 'cors' })
            .then(response => response.json())
            .then(data => {
                loading = false;
                callback(data);
            })
    }

    /**
     * Search for an item
     */
    search(string, callback) {
        let params = {
            indexes: 'item',
            filters: 'ItemSearchCategory.ID>=1',
            columns: 'ID,Icon,Name,LevelItem,Rarity,ItemSearchCategory.Name,ItemSearchCategory.ID,ItemKind.Name',
            string:  string.trim(),
            limit:   50,
        };

        this.get(`/search`, params, callback);
    }

    /**
     * Return information about an item
     */
    getItem(itemId, callback) {
        this.get(`/Item/${itemId}`, {
            columns: 'ID,Name,Icon,ItemSearchCategory.Name,ItemSearchCategory.ID,Rarity,ItemUICategory.Name,ItemKind.Name,LevelItem,LevelEquip,ClassJobCategory.Name'
        }, callback);
    }

    getItemList(ids, callback) {
        this.get(`/Item`, {
            ids: ids,
            columns: 'ID,Icon,Name,ItemSearchCategory.ID',
        }, callback);
    }

    /**
     * Get the current prices for an item on a specific server
     */
    getItemPrices(itemId, server, callback) {
        const queries = {
            columns: 'Prices,Updated',
        };

        this.get(`/market/${server}/item/${itemId}`, queries, callback);
    }

    /**
     * Get the current price history for an item on a specific server
     */
    getItemPriceHistory(itemId, server, callback) {
        const queries = {
            columns: 'History'
        };

        this.get(`/market/${server}/item/${itemId}`, queries, callback);
    }

    /**
     * Get category stock listing for a specific server
     */
    getCategoryListings(categoryId, server, callback) {
        const queries = {
            indexes: 'item',
            filters: `ItemSearchCategory.ID=${categoryId}`,
            columns: 'ID,Name,Icon,Rarity,LevelItem',
            limit: 1000,
            sort_field: 'LevelItem',
            sort_order: 'desc'
        };

        this.get(`/search`, queries, callback);
    }

    /**
     * Get Market Board search categories
     */
    getSearchCategories(callback) {
        this.get('/market/categories', {}, callback);
    }

    /**
     * Get a list of servers grouped by their data center
     */
    getServerList(callback) {
        this.get('/servers/dc', {}, callback);
    }
}

export default new XIVAPI;
