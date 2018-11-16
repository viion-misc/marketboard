import XIVAPI from './XIVAPI';
import Icon from './Icon';

class MarketPricing
{
    constructor()
    {
        this.uiInfo    = $('.item-info');
        this.uiPrices  = $('.market-item-prices');
        this.uiHistory = $('.market-item-history');
    }

    renderPrices(itemId)
    {
        const server = localStorage.getItem('server');
        this.uiPrices.html('<div class="loading">loading</div>');

        XIVAPI.getItemPrices(itemId, server, response => {
            this.uiPrices.html('<h2>Current Prices</h2>');

            // render info
            this.uiInfo.html(
                `<img src="${Icon.get(response.Item.Icon)}">
                 <h1 class="rarity-${response.Item.Rarity}">${response.Item.Name}</h1>
                `
            );

            let html = [];
            html.push(`<tr><th width="25%">Total</th><th width="25%">Unit</th><th>Quantity</th><th>HQ</th><th>Town</th></tr>`);

            // render prices
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

            this.uiPrices.append(`<table>${html.join('')}</table>`);
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
