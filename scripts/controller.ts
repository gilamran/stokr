/**
 * Created by etay on 18/07/2017.
 */
(function () {

  const changePresentationEnum = {
    'percentage': 0,
    'change': 1,
    'capital': 2,
    'length': 3
  };
  const contentEnum = {
    'search': 0,
    'stocks': 1,
    'filter': 2,
    'settings': 3,
    'refresh' : 4,
    'length': 5
  };

  window.Stoker = window.Stoker || {};
  const view = window.Stoker.view;
  const model = window.Stoker.model;
  let state = model.getState();

  // public

  function addStock(stockSymbol) {
    let requestedStocksArray = state.ui.requestedStocks.slice();
    requestedStocksArray.push(stockSymbol);
    updateUIStateProperty('requestedStocks', requestedStocksArray);

    let searchResults = state.ui.searchResults.slice();
    let searchResultsWithoutChosen = searchResults.filter(el => el.symbol !== stockSymbol);
    updateUIStateProperty('searchResults', searchResultsWithoutChosen);

    refreshData();
  }

  function removeStock(stockSymbol) {
    let stockIndex = state.data.findIndex(stock => stock.Symbol === stockSymbol);
    let requestedStocksArray = state.ui.requestedStocks.slice();
    requestedStocksArray.splice(stockIndex,1);
    updateUIStateProperty('requestedStocks', requestedStocksArray);
    refreshData();
  }

  function shiftStocks(stockSymbol, direction) {
    let stocksIndexes = findSwitchedStocksIndexes(stockSymbol, direction, state.data);
    let requestedStocksArray = state.ui.requestedStocks.slice();
    shiftStocksInArray(state.data, stocksIndexes.current, stocksIndexes.switch);
    shiftStocksInArray(requestedStocksArray, stocksIndexes.current, stocksIndexes.switch);
    let newState = updateUIStateProperty('requestedStocks', requestedStocksArray);

    view.renderHtmlPage(newState);
  }

  function toggleChange() {
    let newState = updateUIStateProperty('change', (state.ui.change + 1) % changePresentationEnum.length);
    view.renderHtmlPage(newState);
  }

  function updateScreen(screenId) {
    initializeData();
    let newState = updateUIStateProperty('screen', screenId);

    view.renderHtmlPage(newState);
  }

  function refreshData() {
    const state = model.getState();

    fetchStocks(state.ui.requestedStocks)
      .then(updateData)
      .then(() => view.renderHtmlPage(state));
  }

  function filterStocks(filteredFields) {
    const name = filteredFields['name'].toLowerCase();
    const gain = filteredFields['gain'].toLowerCase();
    const from = parseFloat(filteredFields['from']);
    const to = parseFloat(filteredFields['to']);

    if (!(name || gain !== 'all' || from || to)) {
      return state.data;
    }

    const percentChange = stock => parseFloat(stock.realtime_chg_percent);
    const namePredicate = stock => (!name || stock.Name.toLowerCase().includes(name));
    const gainPredicate = stock => (gain === 'all' ||
    gain === 'positive' && percentChange(stock) >= 0 ||
    gain === 'negative' && percentChange(stock) < 0);

    const fromPredicate = stock => (!from && from !== 0 || percentChange(stock) >= from);
    const toPredicate = stock => (!to && to !== 0 || percentChange(stock) < to);

    updateFilterInputs(name, gain, from, to);
    return state.data.filter(stock => namePredicate(stock) && gainPredicate(stock) && fromPredicate(stock) && toPredicate(stock));
  }

  function searchStocks(searchFieldValue) {
    return  fetch(`http://localhost:7000/search?q=${searchFieldValue}`)
      .then(response => response.json())
      .then(data => data.ResultSet.Result ? data.ResultSet.Result : [] )
      .then(data => Array.isArray(data) ? data : [data]);
  }

  function updateUIStateProperty(key, value) {
    const state = model.getState();

    if (state.ui[key] !== value) {
      state.ui[key] = value;
      localStorage.ui = JSON.stringify(state.ui);
    }

    return state;
  }

  // private

  function syncWithLocalStorage(state) {
    if (localStorage.ui) {
      state.ui = JSON.parse(localStorage.ui);
    }
    return state;
  }

  function findSwitchedStocksIndexes(stockSymbol, direction, stocks) {
    let currentStockIndex = stocks.findIndex(stock => stock.Symbol === stockSymbol);
    let switchStockIndex = (direction === 'up') ? currentStockIndex - 1 : currentStockIndex + 1;

    return {
      'current' : currentStockIndex,
      'switch' : switchStockIndex
    };
  }

  function shiftStocksInArray(stockArray, currentIndex, switchIndex) {
    let tempStock = stockArray[currentIndex];
    stockArray[currentIndex] = stockArray[switchIndex];
    stockArray[switchIndex] = tempStock;
  }

  function updateData(data) {
    const state = model.getState();
    state.data = data;
  }

  function updateFilterInputs(name, gain, from, to) {
    let stringFrom = isNaN(from) ? '' : from;
    let stringTo = isNaN(to) ? '' : to;
    updateUIStateProperty('filter', {name: name, gain: gain, from: stringFrom, to: stringTo});
  }

  function fetchStocks(requestedStocks) {
    //using stocks.json mock file.
    // return stocks = fetch("/stokr/mocks/stocks.json")
    //   .then(response => response.json());

    return  fetch(`http://localhost:7000/quotes?q=${requestedStocks}`)
      .then(response => response.json())
      .then(data => data.query.results ? data.query.results.quote : [] )
      .then(data => Array.isArray(data) ? data : [data]);
  }

  function initializeData() {
    state.data = model.getState().data;
    updateFilterInputs('', 'all', '', '');
  }

  function init() {
    const state = syncWithLocalStorage(model.getState());
    view.init(contentEnum, changePresentationEnum);
    model.init(contentEnum, changePresentationEnum);

    view.getHashValue() === 'search' ? updateScreen(contentEnum.search) : view.renderHtmlPage(state);

    refreshData();
    setInterval(refreshData, 600000);
  }

  window.Stoker.controller = {
    shiftStocks,
    toggleChange,
    updateScreen,
    filterStocks,
    refreshData,
    removeStock,
    updateUIStateProperty,
    searchStocks,
    addStock
  };

  init();
})();


