import XIVAPI from './XIVAPI';
import MarketPricing from "./MarketPricing";
import MarketCategoryStock from "./MarketCategoryStock";

class ServerList
{
    constructor()
    {
        this.servers = {
            "Aether": [
                "Adamantoise",
                "Balmung",
                "Cactuar",
                "Coeurl",
                "Faerie",
                "Gilgamesh",
                "Goblin",
                "Jenova",
                "Mateus",
                "Midgardsormr",
                "Sargatanas",
                "Siren",
                "Zalera"
            ],
            "Chaos": [
                "Cerberus",
                "Lich",
                "Louisoix",
                "Moogle",
                "Odin",
                "Omega",
                "Phoenix",
                "Ragnarok",
                "Shiva",
                "Zodiark"
            ],
            "Elemental": [
                "Aegis",
                "Atomos",
                "Carbuncle",
                "Garuda",
                "Gungnir",
                "Kujata",
                "Ramuh",
                "Tonberry",
                "Typhon",
                "Unicorn"
            ],
            "Gaia": [
                "Alexander",
                "Bahamut",
                "Durandal",
                "Fenrir",
                "Ifrit",
                "Ridill",
                "Tiamat",
                "Ultima",
                "Valefor",
                "Yojimbo",
                "Zeromus"
            ],
            "Mana": [
                "Anima",
                "Asura",
                "Belias",
                "Chocobo",
                "Hades",
                "Ixion",
                "Mandragora",
                "Masamune",
                "Pandaemonium",
                "Shinryu",
                "Titan"
            ],
            "Primal": [
                "Behemoth",
                "Brynhildr",
                "Diabolos",
                "Excalibur",
                "Exodus",
                "Famfrit",
                "Hyperion",
                "Lamia",
                "Leviathan",
                "Malboro",
                "Ultros"
            ]
        };

        this.localeStorageKey = 'server';
        this.localeStorageDcKey = 'dc';
        this.localeStorageDcServersKey = 'dc_servers';
        this.defaultServer = 'Phoenix';
        this.ui = $('.server-select-box');
        this.serverToDc = {};
    };

    /**
     * Populates the server drop down
     */
    setServerList()
    {
        // loop through each data center
        this.servers.forEach((servers, dataCenter) => {
            // build options html
            let serverGroup = [];
            servers.forEach(server => {
                serverGroup.push(`<option value="${server}">${server}</option>`);
                this.serverToDc[server] = dataCenter;
            });

            // add options
            this.ui.append(
                `<optgroup label="${dataCenter}">${serverGroup.join('')}</optgroup>`
            );

        });

        // set users server
        this.setUserServer();
    }

    /**
     * Sets the users server in the server list
     */
    setUserServer()
    {
        let server = localStorage.getItem(this.localeStorageKey);
        server = server ? server : this.defaultServer;
        let dc = this.serverToDc[server];

        localStorage.setItem(this.localeStorageKey, server);
        localStorage.setItem(this.localeStorageDcKey, dc);
        localStorage.setItem(this.localeStorageDcServersKey, this.servers[dc].join(','));

        // select it in the server list
        this.ui.val(server);
    }

    /**
     * Watch for the user to select a different server
     */
    watchForSelection()
    {
        this.ui.on('change', event => {
            const server = $(event.currentTarget).val();
            localStorage.setItem(this.localeStorageKey, server);

            // check for hash, then we can just reload it with the new server
            if (window.location.hash) {
                let preloadItem = window.location.hash.replace('#', '').split(',');

                $('.home').removeClass('on');

                // show market category and show pricing
                MarketPricing.renderHistory(preloadItem[1]);
                MarketPricing.renderPrices(preloadItem[1]);
                MarketCategoryStock.listCategoryStock(preloadItem[2], () => {
                    // set ui selected elements
                    $(`.market-categories button#${preloadItem[2]}`).addClass('on');
                    $(`.market-category-stock button#${preloadItem[1]}`).addClass('on');
                });

                // move to top
                window.scrollTo(0,0);
            } else {
                // reload page
                location.reload();
            }
        });
    }
}

export default new ServerList;
