import '../scss/App.scss';

import Polyfills from './Polyfills';
import ServerList from './ServerList';
import MarketCategories from './MarketCategories';
import Search from './Search';
import WishList from './WishList';

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
