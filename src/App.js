import Polyfills from './Polyfills';
import ServerList from './ServerList';
import MarketCategories from './MarketCategories';

// server dropdown list
ServerList.setServerList();
ServerList.watchForSelection();

// market categories
MarketCategories.render();
