import XIVAPI from './XIVAPI';
import MarketPricing from './MarketPricing';
import MarketCategoryStock from './MarketCategoryStock';
import Icon from './Icon';

class Search
{
    constructor()
    {
        this.ui = $('.search');
        this.results = $('.search-results');
        this.home = $('.home');

        this.searchTimer = null;
        this.searchTypeDelay = 300;
        this.searchMinimumLength = 2;
        this.searchString = '';
    }

    watch()
    {
        this.ui.on('keyup', 'input', event => {
            this.search();
        });

        this.ui.on('change', 'input', event => {
            this.search();
        });

        // watch for clicking of an item
        this.ui.on('click', 'button', event => {
            const data = $(event.currentTarget).attr('id').split(',');

            // hide results
            this.results.removeClass('on');

            // show market category and show pricing
            MarketPricing.renderHistory(data[0]);
            MarketPricing.renderPrices(data[0]);
            MarketCategoryStock.listCategoryStock(data[1], () => {
                // set ui selected elements
                $(`.market-categories button#${data[1]}`).addClass('on');
                $(`.market-category-stock button#${data[0]}`).addClass('on');
            });

            // move to top
            window.scrollTo(0,0);
        })
    }

    search()
    {
        const string = this.ui.find('input').val().trim();

        // do not re-search if the string is the same
        if (string === this.searchString) {
            return;
        }

        // if search string below minimum, cancel
        if (string.length < this.searchMinimumLength) {
            this.results.html('');
            return;
        }

        this.searchString = string;

        // hide the "home" page
        this.home.removeClass('on');

        // show the results
        this.results.addClass('on');
        this.results.html('<div class="loading">Searching</div>');

        // clear any previous search so we don't spam
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
            // search XIVAPI
            XIVAPI.search(string, response => {
                this.results.html(`<div class="search-results-info">Results: ${response.Pagination.ResultsTotal} (Max: 50)</div>`);

                // render results
                response.Results.forEach((item, i) => {
                    this.results.append(
                        `<button id="${item.ID},${item.ItemSearchCategory.ID}" class="rarity-${item.Rarity}">
                            <img src="${Icon.get(item.Icon)}"> <em>${item.LevelItem}</em> ${item.Name}
                            <span>${item.ItemSearchCategory.Name}</span>
                        </button>`
                    )
                });
            });
        }, this.searchTypeDelay);
    }
}

export default new Search;
