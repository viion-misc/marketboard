import XIVAPI from './XIVAPI';
import Icon from './Icon';

class MarketPricing
{
    constructor()
    {
        this.view      = $('.item-market-ui');
        this.uiInfo    = $('.item-info');
        this.uiPrices  = $('.market-item-prices');
        this.uiHistory = $('.market-item-history');
    }

    renderPrices(itemId, callback)
    {
        const server = localStorage.getItem('server');

        this.view.addClass('on');
        this.uiPrices.html('<div class="loading">loading</div>');

        XIVAPI.getItemPrices(itemId, server, response => {
            this.uiPrices.html('<h2>Current Prices</h2>');

            let html = [];
            html.push(`<tr><th width="25%">Total</th><th width="25%">Unit</th><th>Quantity</th><th>HQ</th><th>Town</th></tr>`);

            // render prices
            if (response.Prices.length > 0) {
                response.Prices.forEach((price, i) => {
                    html.push(`
                        <tr>
                            <td>${numeral(price.PriceTotal).format('0,0')}</td>
                            <td>${numeral(price.PricePerUnit).format('0,0')}</td>
                            <td>${price.Quantity}</td>
                            <td align="center">${price.IsHQ ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png" class="hq">' : ''}</td>
                            <td align="right"><img src="${Icon.get(price.Town.Icon)}"></td>
                        </tr>
                    `);
                });
            } else {
                html.push(`<tr><td colspan="5">None for sale! Check back later</td></tr>`);
            }

            this.uiPrices.append(`<table>${html.join('')}</table>`);

            if (typeof callback !== 'undefined') {
                callback();
            }
        });

        // render item info
        XIVAPI.getItem(itemId, item => {
            let html = [];

            // todo - wtb template engine..
            html.push(`<img src="${Icon.get(item.Icon2x)}">`);
            html.push(`<div>`);
            html.push(`<h1 class="rarity-${item.Rarity}">${item.Name}</h1>`);
            if (item.ClassJobCategory) {
                html.push(`
                    <p>Item Level: ${item.LevelItem} - Level ${item.LevelEquip} ${item.ClassJobCategory.Name}</p>
                    <p>${item.ItemUICategory.Name} - ${item.ItemKind.Name}</p>
                `);
            } else {
                html.push(`
                    <p>${item.ItemSearchCategory.Name} - ${item.ItemKind.Name}</p>
                `);
            }
            html.push('</div>');

            // render info
            this.uiInfo.html(html.join(''));
        });
    }

    renderHistory(itemId)
    {
        const server = localStorage.getItem('server');
        this.uiHistory.html('<div class="loading">loading</div>');

        XIVAPI.getItemPriceHistory(itemId, server, response => {
            this.uiHistory.html('<h2>History</h2>');

            let html = [];
            html.push(`<tr><th width="25%">Total</th><th width="25%">Unit</th><th>Quantity</th><th>HQ</th><th>Date</th></tr>`);

            // render prices
            response.History.forEach((price, i) => {
                html.push(`
                    <tr>
                        <td>${numeral(price.PriceTotal).format('0,0')}</td>
                        <td>${numeral(price.PricePerUnit).format('0,0')}</td>
                        <td>${price.Quantity}</td>
                        <td align="center">${price.IsHQ ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png" class="hq">' : ''}</td>
                        <td align="right">${moment.unix(price.PurchaseDate).fromNow()}</td>
                    </tr>
                `);
            });

            this.uiHistory.append(`<table>${html.join('')}</table>`);
        });
    }
}

export default new MarketPricing;
