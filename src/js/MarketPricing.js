import XIVAPI from './XIVAPI';
import ServerList from './ServerList';
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
            html.push(`<tr><th width="1%">#</th><th width="25%">Total</th><th width="25%">Unit</th><th>Quantity</th><th>HQ</th><th>Town</th></tr>`);

            let cheapest = -1;
            let cheapestId = 0;
            let expensive = -1;
            let expensiveId = 0;

            // render prices
            if (response.Prices.length > 0) {
                response.Prices.forEach((price, i) => {
                    html.push(`
                        <tr id="price-row-${i}">
                            <td>${i+1}</td>
                            <td>${numeral(price.PriceTotal).format('0,0')}</td>
                            <td>${numeral(price.PricePerUnit).format('0,0')}</td>
                            <td>${price.Quantity}</td>
                            <td align="center">${price.IsHQ ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png" class="hq">' : ''}</td>
                            <td align="right"><img src="${Icon.get(price.Town.Icon)}"></td>
                        </tr>
                    `);

                    if (cheapest === -1 || price.PriceTotal < cheapest) {
                        cheapest = price.PriceTotal;
                        cheapestId = i;
                    }

                    if (expensive === -1 || price.PriceTotal < expensive) {
                        expensive = price.PriceTotal;
                        expensiveId = i;
                    }
                });
            } else {
                html.push(`<tr><td colspan="6">None for sale! Check back later</td></tr>`);
            }

            this.uiPrices.append(`<div class="market-item-prices-cheap">
                    <div>
                        <strong>(MIN)</strong> #${cheapestId+1} &nbsp; 
                        <img src="https://raw.githubusercontent.com/viion/marketboard/master/favicon.png" height="16">
                        <span>${numeral(cheapest).format('0,0')}</span>
                    </div>
                    <div>
                        <strong>(MAX)</strong> #${expensiveId+1} &nbsp; 
                        <img src="https://raw.githubusercontent.com/viion/marketboard/master/favicon.png" height="16">
                        <span>${numeral(expensive).format('0,0')}</span>
                    </div>
                </div>`);

            this.uiPrices.append(`<div class="max-size"><table>${html.join('')}</table><button class="show-more">Show All (${response.Prices.length})</button></div>`);

            // highlight the cheapest row
            if (cheapest > -1) {
                this.uiPrices.find(`#price-row-${cheapestId}`).addClass('cheapest');

                if (expensiveId !== cheapestId) {
                    this.uiPrices.find(`#price-row-${expensiveId}`).addClass('expensive');
                }
            }

            // if the height of the price list is below 400px, don't include the max-height view.
            if (this.uiPrices.height() < 400) {
                this.uiPrices.find('.max-size').addClass('off');
            }

            // fire any callbacks
            if (typeof callback !== 'undefined') {
                callback();
            }

            // time per dc
            this.uiPrices.append('<div class="market-item-prices-dc"><div class="loading">Loading Price Per Server</div></div>');
            setTimeout(() => {
                const servers = localStorage.getItem(ServerList.localeStorageDcServersKey).split(',');
                const dc      =  localStorage.getItem(ServerList.localeStorageDcKey);
                const pricePerServer = {};

                // grab prices for each server
                servers.forEach((server, i) => {
                    XIVAPI.getItemPrices(itemId, server, response => {
                        pricePerServer[server] = response.Prices;

                        // once we have all prices, render them
                        if (Object.keys(pricePerServer).length === servers.length) {
                            this.renderPricePerServer(pricePerServer, dc);
                        }
                    });
                });
            }, 25);
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

        // watch clicking on "show more"
        this.uiPrices.on('click', '.show-more', () => {
            this.uiPrices.find('.max-size').addClass('off');
        });
    }

    renderPricePerServer(prices, dc)
    {
        const html = [];
        html.push('<table>');
        html.push(`
            <tr>
                <th width="25%">Server</th>
                <th width="5%">Quantity</th>
                <th>Max/Unit</th>
                <th>Max Total</th>
                <th>Min/Unit</th>
                <th>Min Total</th>
            </tr>
        `);

        let cheapest = -1;
        let cheapestId = 0;
        let expensive = -1;
        let expensiveId = 0;

        prices.forEach((prices, server) => {
            const serverInfo = {
                Server: server,
                Quantity: prices.length,
                MaxPricePerUnit: 0,
                MaxPriceTotal: 0,
                MinPricePerUnit: 0,
                MinPriceTotal: 0,
            };

            prices.forEach((price, i) => {
                if (serverInfo.MaxPricePerUnit === 0 || serverInfo.MaxPricePerUnit < price.PricePerUnit) {
                    serverInfo.MaxPricePerUnit = price.PricePerUnit;
                }

                if (serverInfo.MinPricePerUnit === 0 || serverInfo.MinPricePerUnit > price.PricePerUnit) {
                    serverInfo.MinPricePerUnit = price.PricePerUnit;
                }

                if (serverInfo.MaxPriceTotal === 0 || serverInfo.MaxPriceTotal < price.PriceTotal) {
                    serverInfo.MaxPriceTotal = price.PriceTotal;
                }

                if (serverInfo.MinPriceTotal === 0 || serverInfo.MinPriceTotal > price.PriceTotal) {
                    serverInfo.MinPriceTotal = price.PriceTotal;
                }

                if (cheapest === -1 || price.PriceTotal < cheapest) {
                    cheapest = price.PriceTotal;
                    cheapestId = server;
                }

                if (expensive === -1 || price.PriceTotal > expensive) {
                    expensive = price.PriceTotal;
                    expensiveId = server;
                }
            });

            if (serverInfo.Quantity > 0) {
                html.push(`
                    <tr id="price-per-server-${server}">
                        <td>${serverInfo.Server}</td>
                        <td>${serverInfo.Quantity}</td>
                        <td>${numeral(serverInfo.MaxPricePerUnit).format('0,0')}</td>
                        <td>${numeral(serverInfo.MaxPriceTotal).format('0,0')}</td>
                        <td>${numeral(serverInfo.MinPricePerUnit).format('0,0')}</td>
                        <td>${numeral(serverInfo.MinPriceTotal).format('0,0')}</td>
                    </tr>
                `);
            } else {
                html.push(`
                    <tr id="price-per-server-${server}">
                        <td>${serverInfo.Server}</td>
                        <td colspan="5"><small>None for sale</small></td>
                    </tr>
                `);
            }
        });

        html.push('</table>');

        this.uiPrices.find('.market-item-prices-dc').html(`<h2>Prices Per Server (${dc})</h2>`);

        // highlight the cheapest row
        if (cheapest > -1) {
            this.uiPrices.find('.market-item-prices-dc')
                .append(`<div class="market-item-prices-cheap">
                    <div>
                        <strong>(MIN)</strong> ${cheapestId} &nbsp; 
                        <img src="https://raw.githubusercontent.com/viion/marketboard/master/favicon.png" height="16">
                        <span>${numeral(cheapest).format('0,0')}</span>
                    </div>
                    <div>
                        <strong>(MAX)</strong> ${expensiveId} &nbsp; 
                        <img src="https://raw.githubusercontent.com/viion/marketboard/master/favicon.png" height="16">
                        <span>${numeral(expensive).format('0,0')}</span>
                    </div>
                </div>`);
        }

        // show pricing table
        this.uiPrices.find('.market-item-prices-dc').append(html.join(''));

        // highlight min and max
        if (cheapest > -1) {
            this.uiPrices.find(`#price-per-server-${expensiveId}`).addClass('expensive');

            if (cheapestId !== expensiveId) {
                this.uiPrices.find(`#price-per-server-${cheapestId}`).addClass('cheapest');
            }
        }
    }

    renderHistory(itemId, callback)
    {
        const server = localStorage.getItem('server');
        this.uiHistory.html('<div class="loading">loading</div>');

        XIVAPI.getItemPriceHistory(itemId, server, response => {
            this.uiHistory.html('<h2>History</h2>');
            this.uiHistory.append('<div class="market-item-history-stats"></div>');

            let html = [];
            html.push(`<tr><th>#</th><th width="25%">Total</th><th width="25%">Unit</th><th>Quantity</th><th>HQ</th><th>Date</th></tr>`);

            // render prices
            if (response.History.length > 0) {
                response.History.forEach((price, i) => {
                    html.push(`
                        <tr>
                            <td width="1%">${i+1}</td>
                            <td>${numeral(price.PriceTotal).format('0,0')}</td>
                            <td>${numeral(price.PricePerUnit).format('0,0')}</td>
                            <td>${price.Quantity}</td>
                            <td align="center">${price.IsHQ ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png" class="hq">' : ''}</td>
                            <td align="right">${moment.unix(price.PurchaseDate).fromNow(true)}</td>
                        </tr>
                    `);
                });
            } else {
                html.push(`<tr><td colspan="6">Item has never sold! Is it rare?</td></tr>`);
            }

            this.uiHistory.append(`<div class="max-size"><table>${html.join('')}</table><button class="show-more">Show All (${response.History.length})</button></div>`);

            // if the height of the price list is below 400px, don't include the max-height view.
            if (this.uiHistory.height() < 400) {
                this.uiHistory.find('.max-size').addClass('off');
            }

            // fire any callbacks
            if (typeof callback !== 'undefined') {
                callback();
            }

            // fire statistics
            this.renderHistoryStatistics(response.History);
        });

        // watch clicking on "show more"
        this.uiHistory.on('click', '.show-more', () => {
            this.uiHistory.find('.max-size').addClass('off');
        });
    }

    renderHistoryStatistics(history)
    {
        //
        // High, Low, Avg
        //
        const $ui = this.uiHistory.find('.market-item-history-stats');
        const statistics = {
            PriceTotalLow:    0,
            PriceTotalHigh:   0,
            PriceTotalAvg:    0,
            PriceTotalTotal:  0,
            PriceTotalAvgArr: [],

            PriceUnitLow:    0,
            PriceUnitHigh:   0,
            PriceUnitAvg:    0,
            PriceUnitTotal:  0,
            PriceUnitAvgArr: [],

            PriceTotalSalesKeys: [],
            PriceTotalSalesValues: [],
            PricePerUnitSalesKeys: [],
            PricePerUnitSalesValues: [],
        };

        history.forEach((price, i) => {
            //
            // Price Total
            //
            if (statistics.PriceTotalLow === 0 || statistics.PriceTotalLow > price.PriceTotal) {
                statistics.PriceTotalLow = price.PriceTotal;
            }

            if (statistics.PriceTotalHigh === 0 || statistics.PriceTotalHigh < price.PriceTotal) {
                statistics.PriceTotalHigh = price.PriceTotal;
            }

            statistics.PriceTotalAvgArr.push(price.PriceTotal);
            statistics.PriceTotalTotal += price.PriceTotal;

            //
            // Price Unit
            //
            if (statistics.PriceUnitLow === 0 || statistics.PriceUnitLow > price.PricePerUnit) {
                statistics.PriceUnitLow = price.PricePerUnit;
            }

            if (statistics.PriceUnitHigh === 0 || statistics.PriceUnitHigh < price.PricePerUnit) {
                statistics.PriceUnitHigh = price.PricePerUnit;
            }

            statistics.PriceUnitAvgArr.push(price.PricePerUnit);
            statistics.PriceUnitTotal += price.PricePerUnit;

            //
            // chart
            //
            statistics.PriceTotalSalesKeys.push(moment.unix(price.PurchaseDate).fromNow(true));
            statistics.PriceTotalSalesValues.push(price.PriceTotal);
            statistics.PricePerUnitSalesKeys.push(moment.unix(price.PurchaseDate).fromNow(true));
            statistics.PricePerUnitSalesValues.push(price.PricePerUnit);
        });

        // calculate statistics
        statistics.PriceTotalAvg = statistics.PriceTotalTotal / statistics.PriceTotalAvgArr.length;
        statistics.PriceUnitAvg = statistics.PriceUnitTotal / statistics.PriceUnitAvgArr.length;

        // show some statz
        $ui.html(`
            <div>
                <h4>PRICE TOTAL</h4>
                <div>
                    <div><h3>LOW</h3>${numeral(statistics.PriceTotalLow).format('0,0')}</div>
                    <div><h3>HIGH</h3>${numeral(statistics.PriceTotalHigh).format('0,0')}</div>
                    <div><h3>AVG</h3>${numeral(statistics.PriceTotalAvg).format('0,0')}</div>
                </div>
            </div>
            <div>
                <h4>PRICE UNIT</h4>
                <div>
                    <div><h3>LOW</h3>${numeral(statistics.PriceUnitLow).format('0,0')}</div>
                    <div><h3>HIGH</h3>${numeral(statistics.PriceUnitHigh).format('0,0')}</div>
                    <div><h3>AVG</h3>${numeral(statistics.PriceUnitAvg).format('0,0')}</div>
                </div>
            </div>
        `);

        // show stats graph
        $ui.after(`<div class="market-item-history-chart"><canvas id="price-history" width="620" height="240"></canvas></div>`);
        new Chart(document.getElementById("price-history").getContext('2d'), {
            type: 'line',
            data: {
                labels: statistics.PricePerUnitSalesKeys.reverse(),
                datasets: [{
                    label: 'Price Per Unit Sales',
                    data: statistics.PricePerUnitSalesValues.reverse(),
                    backgroundColor: 'rgba(80, 80, 80, 0.2)',
                    borderColor: 'rgba(220, 120, 255, 1)',
                    borderWidth: 2,
                }]
            },
            options: {
                tooltips: {
                    position: 'nearest',
                    intersect: false
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            zeroLineColor: 'rgba(87,35,162,1)',
                        },
                        ticks: {
                            beginAtZero: true,
                            //steps: 10,
                            //stepValue: 5,
                        }
                    }]
                }
            }
        });
    }
}

export default new MarketPricing;
