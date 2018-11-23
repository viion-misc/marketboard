import MarketPricing from "./MarketPricing";
import MarketCategoryStock from "./MarketCategoryStock";
import XIVAPI from "./XIVAPI";
import Icon from "./Icon";

class WishList
{
    constructor()
    {
        this.html = $('html');
        this.ui = $('.wishlist .items');
        this.open = false;
    }
    watch()
    {
        this.html.on('click', '.wishlist button.toggle', event => {
            this.open = true;
            this.ui.toggleClass('open');
        });

        this.html.on('click', '.wishlist-btn', event => {
            // close wishlist
            this.open = false;
            this.ui.removeClass('open');


            const data = $(event.currentTarget).attr('id').split(',');

            $('.home').removeClass('on');

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
        });
    }

    render()
    {
        const wishlist = localStorage.getItem('wishlist');

        console.log(wishlist);

        if (wishlist === null || wishlist === '') {
            return;
        }

        this.ui.html('');

        XIVAPI.getItemList(wishlist, response => {
            response.Results.forEach((item, i) => {
                this.ui.append(`
                    <button class="wishlist-btn" id="${item.ID},${item.ItemSearchCategory.ID}">
                    <img src="${Icon.get(item.Icon)}"> ${item.Name}
                    </button>
                `);
            });
        })

    }

    toggle(itemId)
    {
        let wishlist = localStorage.getItem('wishlist');
        if (wishlist === null) {
            wishlist = "";
        }

        wishlist = wishlist.split(',');

        let index = wishlist.indexOf(itemId);

        if (index > -1) {
            console.log('remove');
            delete wishlist[index];
        } else {
            console.log('add');
            wishlist.push(itemId);
        }

        wishlist = wishlist.filter(Boolean);
        localStorage.setItem('wishlist', wishlist.join(','));
        this.render();
    }
}

export default new WishList;
