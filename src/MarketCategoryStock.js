import XIVAPI from './XIVAPI';
import MarketPricing from './MarketPricing';

class MarketCategoryStock
{
    constructor()
    {
        this.ui = $('.market-category-stock');
    }

    listCategoryStock(categoryId)
    {
        const server = localStorage.getItem('server');

        this.ui.html('<p>loading...</p>');

        XIVAPI.getCategoryListings(categoryId, server, response => {
            this.ui.html('');

            // render stock
            response.forEach((stock, i) => {
                this.ui.append(
                    `<button id="${stock.Item.ID}">(${stock.Quantity}) ${stock.Item.Name}</button>`
                );
            });

            // watch for selection
            this.watchForSelection()
        });
    }

    watchForSelection()
    {
        this.ui.on('click', 'button', event => {
            const itemId = $(event.currentTarget).attr('id');

            MarketPricing.renderPrices(itemId);
            MarketPricing.renderHistory(itemId);
        });
    }
}

export default new MarketCategoryStock;
