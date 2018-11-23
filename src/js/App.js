import '../scss/App.scss';

import Polyfills from './Polyfills';
import ServerList from './ServerList';
import MarketCategories from './MarketCategories';
import MarketPricing from "./MarketPricing";
import MarketCategoryStock from "./MarketCategoryStock";
import Search from './Search';
import WishList from './WishList';

let preloadItem = [];

// check for hash
if (window.location.hash) {
    preloadItem = window.location.hash.replace('#', '').split(',');
    localStorage.setItem(ServerList.localeStorageKey, preloadItem[0]);
}

// language
let language = localStorage.getItem('language');
if (language === null || language === '') {
    language = 'en';
}

localStorage.setItem('language', language);

$('.language button').on('click', event => {
    localStorage.setItem('language', $(event.currentTarget).attr('id'));
    location.reload();
});


// server dropdown list
ServerList.setServerList();
ServerList.watchForSelection();

// market categories
MarketCategories.render();

// Search
Search.watch();

// Wishlist!
WishList.watch();
WishList.render();

// cheeky
// todo - put this somewhere proper and stop being lazy
$('html').on('click', '.market-category-toggle', event => {
    const $ui = $('.market-category-stock-ui');
    $ui.toggleClass('mini');
    $(event.currentTarget).toggleClass('right');
});


// check for hash
if (window.location.hash) {
    preloadItem = window.location.hash.replace('#', '').split(',');
    localStorage.setItem(ServerList.localeStorageKey, preloadItem[0]);

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
}
