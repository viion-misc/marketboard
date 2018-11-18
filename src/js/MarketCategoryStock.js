import XIVAPI from './XIVAPI';
import MarketPricing from './MarketPricing';
import Icon from './Icon';

class MarketCategoryStock
{
    constructor()
    {
        this.view = $('.market-category-stock-ui');
        this.ui = $('.market-category-stock');
    }

    listCategoryStock(categoryId, callback)
    {
        const server = localStorage.getItem('server');

        this.view.addClass('on');
        this.ui.html('<div class="loading"><img src="http://xivapi.com/mb/loading.svg"></div>');

        XIVAPI.getCategoryListings(categoryId, server, response => {
            this.ui.html('');

            // render stock
            response.forEach((stock, i) => {
                this.ui.append(
                    `<button id="${stock.Item.ID}" class="rarity-${stock.Item.Rarity}">
                        <div><span><img src="http://xivapi.com/mb/loading.svg" class="lazy" data-src="${Icon.get(stock.Item.Icon2x ? stock.Item.Icon2x : stock.Item.Icon)}"></span></div>
                        <div>${stock.Item.Name}</div>
                        <span>${stock.Quantity}</span> 
                    </button>`
                );
            });

            // watch for selection
            this.watchForSelection();

            // set lazy loading
            new LazyLoad({ elements_selector: ".lazy" });

            if (typeof callback !== 'undefined') {
                callback();
            }
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

            // add visual "on"
            this.ui.find('button.on').removeClass('on');
            $(event.currentTarget).addClass('on');
        });
    }
}

export default new MarketCategoryStock;
