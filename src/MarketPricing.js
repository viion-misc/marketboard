import XIVAPI from './XIVAPI';

class MarketPricing
{
    constructor()
    {
        this.uiPrices = $('.market-item-prices');
        this.uiHistory = $('.market-item-history');
    }

    renderPrices(itemId)
    {
        const server = localStorage.getItem('server');
        this.uiPrices.html('<p>loading prices...</p>');

        XIVAPI.getItemPrices(itemId, server, response => {
            this.uiPrices.html('');

            // render prices
            response.Prices.forEach((price, i) => {
                this.uiPrices.append(
                    `<div>Total Cost: ${price.Quantity}x${price.PricePerUnit} = ${price.PriceTotal}</div>`
                );
            });
        });
    }

    renderHistory(itemId)
    {
        const server = localStorage.getItem('server');
        this.uiHistory.html('<p>loading history...</p>');

        XIVAPI.getItemPriceHistory(itemId, server, response => {
            this.uiHistory.html('');

            // render prices
            response.History.forEach((price, i) => {
                this.uiHistory.append(
                    `<div>Historic Purchase: ${price.Quantity} x ${price.PricePerUnit} = ${price.PriceTotal} @ ${price.PurchaseDate}</div>`
                );
            });
        });
    }
}

export default new MarketPricing;
