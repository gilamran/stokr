/**
 * Created by etay on 23/07/2017.
 */

(function () {
  // view
  let content = {};
  let changePresentation = {};

  window.Stoker = window.Stoker || {};

  //private

  function renderMainContent(state) {
    if (isScreen(state.ui.screen, 'search')) {
      return renderSearchMainContent(state);
    }

    return renderStokrMainContent(state);
  }

  function renderStokrMainContent(state) {
    const ctrl = window.Stoker.controller;
    let contentString = `<main class="main-content">`;

    if (isScreen(state.ui.screen, 'filter')) {
      contentString += `${renderFilter(state.ui.filter)}`;
      contentString += `${renderStocks(ctrl.filterStocks(state.ui.filter), state.ui.change, state.ui.screen)}`;

    } else {
      contentString += `${renderStocks(state.data, state.ui.change, state.ui.screen)}`;
    }

    contentString += `</main>`;
    return contentString;
  }

  function renderSearchMainContent(state) {
    let contentString = `<main class="search-main-content">`;

    if (state.ui.searchResults.length > 0) {
      contentString += `${renderStocks(state.ui.searchResults, state.ui.change, state.ui.screen)}`;
    } else {
      contentString += `
      <div class="search-results">
        <div class="icon-search-place-holder">
        <h3>${state.ui.searchField === '' ? 'Search' : 'Not Found'}</h3>
        </div>
      </div>  
      `;
    }

    contentString += `</main>`;
    return contentString;

  }

  function renderHeader(screenId) {
    return isScreen(screenId, 'search') ? renderSearchHeader() : renderStokrHeader(screenId);
  }

  function renderSearchHeader() {
    return `
    <header class="search-header">
      <input type="text" name="search-stock" id="search-stock" autofocus>
      <a href="#" name="cancel-search" id="cancel-search">Cancel</a>
    </header>
    `;
  }

  function renderStokrHeader(screenId) {
    let searchSelected = isScreen(screenId, 'search') ? 'selected' : '';
    let filterSelected = isScreen(screenId, 'filter') ? 'selected' : '';
    let settingsSelected = isScreen(screenId, 'settings') ? 'selected' : '';

    return `
    <header class="app-header">
        <h1 class="stokr-logo">STOKR</h1>
        <nav class="nav-bar">
          <ul class="list-reset">
            <li><a href="#search" class="btn search icon-search ${searchSelected}"></a></li>
            <li><button class="btn refresh icon-refresh"></button></li>
            <li><button class="btn filter icon-filter ${filterSelected}"></button></li>
            <li><button class="btn settings icon-settings ${settingsSelected}"></button></li>
          </ul>
        </nav>
      </header>
    `;
  }

  function renderStocks(stocks, changePresentation, screenId) {
    return `
    <ul class="stock-list list-reset">
      ${stocks.map((stock, index, stocks) => {
        return renderStock(stock, index, stocks, changePresentation, screenId)
    }).join('')}
    </ul>
    `;
  }

  function renderStock(stock, index, stocks, changePresentation, screenId) {
    const isSearch = isScreen(screenId, 'search');
    return `
      <li>
        <div class="stock-naming-data">
          ${renderEdit(screenId, stock.Symbol)}
          <span class="stock-symbol">${isSearch? stock.symbol : stock.Symbol}</span>
          <span class="stock-name">(${isSearch? stock.name : stock.Name})</span>
        </div>
        ${isSearch ? renderAddStock(stock.symbol) : renderStocksNumbers(stock, index, stocks,changePresentation,screenId)}
      </li>
    `;
  }

  function renderAddStock(stockSymbol) {
    return `
      <div class="add-stock-div add-stock-move">
        <button data-symbol="${stockSymbol}" type="button" class="add-stock">+</button>
      </div>
    `;
  }

  function renderStocksNumbers(stock, index, stocks, changePresentation, screenId) {
    const change = getChangePresentation(stock, changePresentation);
    const lastTradePriceTrunced = Math.trunc(stock.realtime_price * 100) / 100;
    const changeState = parseFloat(change) >= 0 ? 'increase' : 'decrease';
    const upDisabled = index === 0 ? 'disabled' : '';
    const bottomDisabled = index === stocks.length - 1 ? 'disabled' : '';
    const hide = isScreen(screenId, 'filter') ? 'hide' : '';

    return `
      <div class="stock-numbers">
        <span class="current-price">${lastTradePriceTrunced}</span>
        <button class="daily-change ${changeState}">${change}</button>
        <div class="up-down ${hide}">
          <button data-symbol="${stock.Symbol}" class="icon-arrow ${upDisabled}" ${upDisabled}></button>
          <button data-symbol="${stock.Symbol}" class="icon-arrow icon-reverse ${bottomDisabled}" ${bottomDisabled}></button>
        </div>
      </div>    
    `;
  }

  function renderEdit(screenId, stockSymbol) {
    return !isScreen(screenId, 'settings') ? '' : `
    <div class="remove-stock" data-symbol="${stockSymbol}">
      <div class="remove-stock-line" data-symbol="${stockSymbol}"></div>
    </div>
    `;
  }

  function renderFilter(filterData) {
    let allSelected = filterData.gain === 'all' ? 'selected' : '';
    let positiveSelected = filterData.gain === 'positive' ? 'selected' : '';
    let negativeSelected = filterData.gain === 'negative' ? 'selected' : '';
    return `
    <section class="filter-section">
      <form class="filter-form">
        <div class="filter-text">
          <div>
            <label for="by-name-id">By Name</label>
            <input type="text" name="by-name" id="by-name-id" value="${filterData.name}">
          </div>
          <div>
            <label for="by-range-from-id">By Range: From</label>
            <input type="text" name="by-range-from" id="by-range-from-id" value="${filterData.from}">
          </div>
          <div>
            <label for="by-gain-id">By Gain</label>
            <select name="by-gain" id="by-gain-id" required>
              <option value="All" ${allSelected}>all</option>
              <option value="positive" ${positiveSelected}>positive</option>
              <option value="negative" ${negativeSelected}>negative</option>
            </select>
          </div>
          <div>
            <label for="by-range-to-id">By Range: To</label>
            <input type="text" name="by-range-to" id="by-range-to-id" value="${filterData.to}">
          </div>
        </div>
        <div class="submit-container">
          <button type="submit" class="filter-submit">Apply</button>
        </div>
      </form>
    </section>
    `
  }

  function isScreen(screenId, screenName) {
    const screenNameId = findScreenIdByName(screenName);
    return screenNameId === screenId;
  }

  function findScreenIdByName(screenName) {
    if (screenName === 'search') {
      return content.search;
    } else if(screenName === 'filter') {
      return content.filter;
    } else if (screenName === 'settings') {
      return content.settings;
    } else if (screenName === 'stocks') {
      return content.stocks;
    }

    return false;
  }

  function getChangePresentation(stock, changeState) {
    const stockChange = changeState;
    if (stockChange === changePresentation.percentage) {
      return (Math.trunc(stock.realtime_chg_percent * 10) / 10) + '%';
    } else if (stockChange === changePresentation.change) {
      return (Math.trunc(stock.realtime_change * 10) / 10);
    }

    return stock.MarketCapitalization;
  }

  function dispatchEvents(e) {
    const ctrl = window.Stoker.controller;
    const target = e.target;
    let targetDataSymbol = target.getAttribute('data-symbol');

    if (target.classList.contains('daily-change')) {
      ctrl.toggleChange();
    } else if (target.classList.contains('icon-reverse')) {
      ctrl.shiftStocks(targetDataSymbol, 'down');
    } else if (target.classList.contains('icon-arrow')) {
      ctrl.shiftStocks(targetDataSymbol, 'up');
    } else if (target.classList.contains('remove-stock')) {
      ctrl.removeStock(targetDataSymbol);
    } else if (target.classList.contains('add-stock')) {
      e.target.parentNode.classList.add('add-stock-animate');
      ctrl.addStock(targetDataSymbol);
    }
  }

  function dispatchHeaderEvents(e) {
    const ctrl = window.Stoker.controller;
    const target = e.target;

    if (target.classList.contains('selected')) {
      ctrl.updateScreen(content.stocks);
    } else if (target.classList.contains('filter')) {
      ctrl.updateScreen(content.filter);
    } else if (target.classList.contains('settings')) {
      ctrl.updateScreen(content.settings);
    } else if (target.classList.contains('refresh')) {
      ctrl.refreshData();
    }
  }

  function dispatchFilterEvents(e) {
    const ctrl = window.Stoker.controller;
    const target = e.target;
    const currentTarget = e.currentTarget;

    if (!target.classList.contains("filter-submit")) {
      return;
    }
    e.preventDefault();
    const filteredFields= {
      'name' : currentTarget.querySelector('#by-name-id').value,
      'gain' : currentTarget.querySelector('#by-gain-id').value,
      'from' : currentTarget.querySelector('#by-range-from-id').value,
      'to' : currentTarget.querySelector('#by-range-to-id').value
    };

    let newState = ctrl.updateUIStateProperty('filter', filteredFields);
    renderHtmlPage(newState)
  }

  function dispatchSearchEvents(e) {
    if (e.keyCode !== 13) {
      return;
    }

    const  ctrl = window.Stoker.controller;
    const searchFieldValue = e.currentTarget.querySelector('#search-stock').value;
    ctrl.updateUIStateProperty('searchField', searchFieldValue);

    ctrl.searchStocks(searchFieldValue)
      .then(searchResults => ctrl.updateUIStateProperty('searchResults', searchResults))
      .then(renderHtmlPage);
  }

  function handleHashChange() {
    const ctrl = window.Stoker.controller;
    let screenId = content.stocks;
    let hashValue = getHashValue();
    if (hashValue) {
      screenId = content[hashValue];
    } else {
      ctrl.updateUIStateProperty('searchField', '');
      ctrl.updateUIStateProperty('searchResults', []);
    }

    ctrl.updateScreen(screenId);
  }

  // public

  function getHashValue() {
    return document.location.hash.replace('#', '');
  }

  function init(screensEnum, changeEnum) {
      content = screensEnum;
      changePresentation = changeEnum;

      window.addEventListener('hashchange', handleHashChange);
  }

  function renderHtmlPage(state) {
    const rootElement = document.querySelector('.root');
    rootElement.innerHTML = renderHeader(state.ui.screen) + renderMainContent(state);
    rootElement.querySelector('.stock-list') &&  rootElement.querySelector('.stock-list').addEventListener('click', dispatchEvents);
    rootElement.querySelector('.app-header') && rootElement.querySelector('.app-header').addEventListener('click', dispatchHeaderEvents);
    rootElement.querySelector('.filter-section') && rootElement.querySelector('.filter-section').addEventListener('click', dispatchFilterEvents);
    rootElement.querySelector('.search-header') && rootElement.querySelector('.search-header').addEventListener('keypress', dispatchSearchEvents);
  }

  window.Stoker.view = {
    renderHtmlPage,
    init,
    getHashValue
  }

})();
