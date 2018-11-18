import XIVAPI from './XIVAPI';

class ServerList
{
    constructor()
    {
        this.localeStorageKey = 'server';
        this.localeStorageDcKey = 'dc';
        this.localeStorageDcServersKey = 'dc_servers';
        this.defaultServer = 'Phoenix';
        this.ui = $('.server-select-box');
        this.serverToDc = {};
        this.dcToServers = {}
    };

    /**
     * Populates the server drop down
     */
    setServerList()
    {
        XIVAPI.getServerList(response => {
            this.dcToServers = response;

            // loop through each data center
            response.forEach((servers, dataCenter) => {
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
        });
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
        localStorage.setItem(this.localeStorageDcServersKey, this.dcToServers[dc].join(','));

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

            // reload page
            location.reload();
        });
    }
}

export default new ServerList;
