import XIVAPI from './XIVAPI';
import WishList from './WishList';
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
        this.uiServers = $('.market-item-dc');
        this.pricePerDcTimeout = null;
        this.active = false;
    }

    renderPrices(itemId, callback)
    {
        if (this.active) {
            return;
        }

        const server = localStorage.getItem('server');

        this.active = true;
        this.view.addClass('on');
        this.uiPrices.html('<div class="loading"><img src="http://xivapi.com/mb/loading.svg"></div>');
        this.uiServers.html('<button class="market-item-dc-btn">Show Cross World Prices</button>');
        this.uiInfo.html('<div class="loading">loading...</div>');
        $('.market-item-dc').hide();

        clearTimeout(this.pricePerDcTimeout);
        XIVAPI.getItemPrices(itemId, server, response => {
            this.active = false;
            this.uiPrices.html('<h2>Current Prices</h2>');

            let html = [];
            html.push(`<tr><th width="1%">#</th><th width="25%">Total</th><th width="25%">Unit</th><th>QTY</th><th>HQ</th><th width="25%">Retainer</th><th width="25%">Crafter</th></tr>`);

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
                            <td class="price">${numeral(price.PriceTotal).format('0,0')}</td>
                            <td class="price">${numeral(price.PricePerUnit).format('0,0')}</td>
                            <td>${price.Quantity}</td>
                            <td align="center">${price.IsHQ ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png" class="hq">' : ''}</td>
                            <td align="right">
                                <span>${price.RetainerName}</span>
                                <img src="${Icon.get(price.Town.Icon)}">
                            </td>
                            <td>
                                <span>${price.CraftSignature}</span>
                            </td>
                        </tr>
                    `);

                    if (cheapest === -1 || price.PriceTotal < cheapest) {
                        cheapest = price.PriceTotal;
                        cheapestId = i;
                    }

                    if (expensive === -1 || price.PriceTotal > expensive) {
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

            $('.market-item-dc').show();
        });

        // render item info
        XIVAPI.getItem(itemId, item => {
            let html = [];
            window.location.hash = `#${server},${item.ID},${item.ItemSearchCategory.ID}`;

            html.push(`<button class="refresh-listing">Refresh</button>`);
            html.push(`<button class="add-to-wishlist"><img src="https://xivapi.com/mb/heart-regular_light.svg" height="18">Wish List</button>`);

            // todo - wtb template engine..
            html.push(`<img src="${Icon.get(item.Icon)}">`);
            html.push(`<div>`);
            html.push(`<h1 class="rarity-${item.Rarity}">${item.Name}</h1>`);

            if (item.ClassJobCategory.Name) {
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

            // on clicking to load all prices across servers
            $('.refresh-listing').unbind('click');
            $('.refresh-listing').on('click', () => {
                this.renderPrices(itemId, callback);
                this.renderHistory(itemId, callback);
            });

            // on clicking to load all prices across servers
            $('.add-to-wishlist').unbind('click');
            $('.add-to-wishlist').on('click', () => {
                WishList.toggle(itemId);
            });
        });

        // watch clicking on "show more"
        this.uiPrices.on('click', '.show-more', () => {
            this.uiPrices.find('.max-size').addClass('off');
        });

        // on clicking to load all prices across servers
        $('.market-item-dc-btn').unbind('click');
        $('.market-item-dc-btn').on('click', () => {
            this.renderPricesForDc(itemId);
        });
    }

    renderPricesForDc(itemId)
    {
        this.uiServers.html(`<div class="loading">
            <img src="http://xivapi.com/mb/loading.svg"></div>
            <small>Just a few seconds... <span></span></small>
        `);

        clearTimeout(this.pricePerDcTimeout);
        this.pricePerDcTimeout = setTimeout(() => {
            const dc      =  localStorage.getItem(ServerList.localeStorageDcKey);
            const servers = localStorage.getItem(ServerList.localeStorageDcServersKey).split(',');
            const pricePerServer = {};

            this.uiServers.find('span').html(`0 / ${servers.length}`);

            // grab prices for each server
            servers.forEach((server, i) => {
                XIVAPI.getItemPrices(itemId, server, response => {
                    if (response.Error) {
                        pricePerServer[server] = false;
                    } else {
                        pricePerServer[server] = response.Prices;
                        this.uiServers.find('span').html(`${Object.keys(pricePerServer).length} / ${servers.length}`);
                    }

                    // once we have all prices, render them
                    if (Object.keys(pricePerServer).length === servers.length) {
                        this.renderPricePerServer(pricePerServer, dc);
                    }
                });
            });
        }, 500);
    }

    renderPricePerServer(prices, dc)
    {
        this.uiServers.html(`<div class="market-item-prices-dc"></div>`);

        const html = [];
        html.push('<table>');
        html.push(`
            <tr>
                <th class="sortable" width="25%">Server</th>
                <th class="sortable" width="5%">QTY</th>
                <th class="sortable">Max/Unit</th>
                <th class="sortable">Max Total</th>
                <th class="sortable">Min/Unit</th>
                <th class="sortable">Min Total</th>
            </tr>
        `);

        let cheapest = -1;
        let cheapestId = 0;
        let cheapestHq = false;
        let expensive = -1;
        let expensiveId = 0;
        let expensiveHq = false;

        prices.forEach((prices, server) => {
            if (prices !== false) {
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
                        cheapestHq = price.IsHQ;
                    }

                    if (expensive === -1 || price.PriceTotal > expensive) {
                        expensive = price.PriceTotal;
                        expensiveId = server;
                        expensiveHq = price.IsHQ;
                    }
                });

                if (serverInfo.Quantity > 0) {
                    html.push(`
                        <tr id="price-per-server-${server}">
                            <td data-sort="${serverInfo.Server}" class="title">${serverInfo.Server}</td>
                            <td data-sort="${serverInfo.Quantity}">${serverInfo.Quantity}</td>
                            <td data-sort="${serverInfo.MaxPricePerUnit}">${numeral(serverInfo.MaxPricePerUnit).format('0,0')}</td>
                            <td data-sort="${serverInfo.MaxPriceTotal}" class="price">${numeral(serverInfo.MaxPriceTotal).format('0,0')}</td>
                            <td data-sort="${serverInfo.MinPricePerUnit}">${numeral(serverInfo.MinPricePerUnit).format('0,0')}</td>
                            <td data-sort="${serverInfo.MinPriceTotal}"class="price">${numeral(serverInfo.MinPriceTotal).format('0,0')}</td>
                        </tr>
                    `);
                } else {
                    html.push(`
                        <tr id="price-per-server-${server}">
                            <td>${server}</td>
                            <td colspan="5"><small>None for sale</small></td>
                        </tr>
                    `);
                }
            } else {
                html.push(`
                    <tr id="price-per-server-${server}">
                        <td>${server}</td>
                        <td colspan="5"><small>Server not supported :(</small></td>
                    </tr>
                `);
            }
        });

        html.push('</table>');

        this.uiServers.find('.market-item-prices-dc').html(`<h2>Prices Per Server (${dc})</h2>`);

        // highlight the cheapest row
        if (cheapest > -1) {
            this.uiServers.find('.market-item-prices-dc')
                .append(`<div class="market-item-prices-cheap">
                    <div>
                        <strong>(MIN)</strong> ${cheapestId} &nbsp; 
                        <img src="https://raw.githubusercontent.com/viion/marketboard/master/favicon.png" height="16">
                        <span>${numeral(cheapest).format('0,0')} ${cheapestHq ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png">' : ''}</span>
                    </div>
                    <div>
                        <strong>(MAX)</strong> ${expensiveId} &nbsp; 
                        <img src="https://raw.githubusercontent.com/viion/marketboard/master/favicon.png" height="16">
                        <span>${numeral(expensive).format('0,0')} ${expensiveHq ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png">' : ''}</span>
                    </div>
                </div>`);
        }

        // show pricing table
        this.uiServers.find('.market-item-prices-dc').append(html.join(''));

        // highlight min and max
        if (cheapest > -1) {
            this.uiServers.find(`#price-per-server-${cheapestId}`).addClass('cheapest');

            if (cheapestId !== expensiveId) {
                this.uiServers.find(`#price-per-server-${expensiveId}`).addClass('expensive');
            }
        }

        this.uiServers.find('.market-item-prices-dc').append('<div class="sort-info">Click on a column heading to sort the listings.</div>');

        this.addSortableHeaders();
    }

    addSortableHeaders()
    {
        const getCellValue = (tr, idx) => tr.children[idx].dataset.sort;

        const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
                v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

        // do the work...
        document.querySelectorAll('th.sortable').forEach(th => th.addEventListener('click', (() => {
            const table = th.closest('table');
            Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
                .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
                .forEach(tr => table.appendChild(tr) );
        })));
    }

    renderHistory(itemId, callback)
    {
        const server = localStorage.getItem('server');
        this.uiHistory.html('<div class="loading"><img src="http://xivapi.com/mb/loading.svg"></div>');

        XIVAPI.getItemPriceHistory(itemId, server, response => {
            this.uiHistory.html('<h2>History</h2>');
            this.uiHistory.append('<div class="market-item-history-extra"></div>');

            let html = [];
            html.push(`<tr><th>#</th><th width="25%">Total</th><th width="25%">Unit</th><th>QTY</th><th>HQ</th><th>Date</th></tr>`);

            // render prices
            if (response.History.length > 0) {
                response.History.forEach((price, i) => {
                    html.push(`
                        <tr>
                            <td width="1%">${i+1}</td>
                            <td class="price">${numeral(price.PriceTotal).format('0,0')}</td>
                            <td class="price">${numeral(price.PricePerUnit).format('0,0')}</td>
                            <td>${price.Quantity}</td>
                            <td align="center">${price.IsHQ ? '<img src="https://raw.githubusercontent.com/viion/marketboard/master/hq.png" class="hq">' : ''}</td>
                            <td align="right">${moment.unix(price.PurchaseDate).format('Do MMM, HH:mm:ss')}</td>
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

            this.uiHistory.append('<br><br><small>Cheapest based on total purchased price.</small>');
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
        const $ui = this.uiHistory.find('.market-item-history-extra');
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
            statistics.PriceTotalSalesKeys.push(moment.unix(price.PurchaseDate).format('Do MMM, HH:mm'));
            statistics.PriceTotalSalesValues.push(price.PriceTotal);
            statistics.PricePerUnitSalesKeys.push(moment.unix(price.PurchaseDate).format('Do MMM, HH:mm'));
            statistics.PricePerUnitSalesValues.push(price.PricePerUnit);
        });

        // calculate statistics
        statistics.PriceTotalAvg = statistics.PriceTotalTotal / statistics.PriceTotalAvgArr.length;
        statistics.PriceUnitAvg = statistics.PriceUnitTotal / statistics.PriceUnitAvgArr.length;

        // show stats graph
        $ui.html(`<div class="market-item-history-chart"><canvas id="price-history" width="620" height="240"></canvas></div>`);
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
                maintainAspectRatio: false,
                animation: false,
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

        // show some statz
        $ui.after(`
            <div class="market-item-history-stats">
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
            </div>
        `);
    }
}

export default new MarketPricing;
