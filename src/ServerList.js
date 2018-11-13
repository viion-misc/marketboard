import XIVAPI from './XIVAPI';

class ServerList
{
    constructor()
    {
        this.storageKey = 'server';
        this.defaultServer = 'Phoenix';
        this.serverElement = $('.server-select-box');
    }

    /**
     * Populates the server drop down
     */
    setServerList()
    {
        XIVAPI.getServerList(response => {
            // loop through each data center
            response.forEach((servers, dataCenter) => {
                // build options html
                let serverGroup = [];
                servers.forEach(server => {
                    serverGroup.push(`<option value="${server}">${server}</option>`);
                });

                // add options
                this.serverElement.append(
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
        let server = localStorage.getItem(this.storageKey);
        server = server ? server : this.defaultServer;

        // select it in the server list
        this.serverElement.val(server);
    }

    /**
     * Watch for the user to select a different server
     */
    watchForSelection()
    {
        this.serverElement.on('change', event => {
            const server = $(event.currentTarget).val();
            localStorage.setItem(this.storageKey, server);

            // reload page
            location.reload();
        });
    }
}

export default new ServerList;
