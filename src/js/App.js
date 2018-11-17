import '../scss/App.scss';

import Polyfills from './Polyfills';
import ServerList from './ServerList';
import MarketCategories from './MarketCategories';
import Search from './Search';

// server dropdown list
ServerList.setServerList();
ServerList.watchForSelection();

// market categories
MarketCategories.render();

// Search
Search.watch();
