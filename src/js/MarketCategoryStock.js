import XIVAPI from './XIVAPI';
import MarketPricing from './MarketPricing';
import Icon from './Icon';

class MarketCategoryStock
{
    constructor()
    {
        this.view = $('.market-category-stock-ui');
        this.ui = $('.market-category-stock');
        this.active = false;
    }

    listCategoryStock(categoryId, callback)
    {
        if (this.active) {
            return;
        }

        const server = localStorage.getItem('server');

        this.view.addClass('on');
        this.ui.html('<div class="loading"><img src="http://xivapi.com/mb/loading.svg"></div>');
        this.active = true;

        XIVAPI.getCategoryListings(categoryId, server, response => {
            this.active = false;
            this.ui.html('');

            if (response.Error) {
                this.ui.html(`<div class="error">Error: ${response.Debug.Note}</div>`);
                return;
            }

            // render stock
            response.Results.forEach((item, i) => {
                this.ui.append(
                    `<button id="${item.ID}" class="rarity-${item.Rarity}">
                        <div><span><img src="http://xivapi.com/mb/loading.svg" class="lazy" data-src="${Icon.get(item.Icon)}"></span></div>
                        <div>(${item.LevelItem}) ${item.Name}</div>
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
