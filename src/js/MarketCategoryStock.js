import XIVAPI from './XIVAPI';
import MarketPricing from './MarketPricing';
import Icon from './Icon';

class MarketCategoryStock
{
    constructor()
    {
        this.ui = $('.market-category-stock');
    }

    listCategoryStock(categoryId)
    {
        const server = localStorage.getItem('server');

        this.ui.html('<div class="loading">loading</div>');

        XIVAPI.getCategoryListings(categoryId, server, response => {
            this.ui.html('');

            // render stock
            response.forEach((stock, i) => {
                this.ui.append(
                    `<button id="${stock.Item.ID}" class="rarity-${stock.Item.Rarity}">
                        <img src="${Icon.get(stock.Item.Icon)}">
                        <div>${stock.Item.Name}</div>
                        <span>${stock.Quantity}</span> 
                    </button>`
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

            // move to top
            window.scrollTo(0,0);

            MarketPricing.renderPrices(itemId);
            MarketPricing.renderHistory(itemId);
        });
    }
}

export default new MarketCategoryStock;
