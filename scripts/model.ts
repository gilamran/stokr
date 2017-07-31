/**
 * Created by etay on 23/07/2017.
 */

(function () {

  let stocks = [];
  let content = {};
  let changePresentation = {};

  window.Stoker = window.Stoker || {};
  let state = {
    ui: {
      screen: 1,
      change: 0,
      requestedStocks : ['GOOG','WIX','MSFT'],
      searchField: '',
      searchResults: [],
      filter: {
        'name' : '',
        'gain' : 'all',
        'from' : '',
        'to' : ''
      }
    },
    data: stocks
  };

  // public

  function getState() {
    return state;
  }

  function init(screensEnum, changeEnum) {
    content = screensEnum;
    changePresentation = changeEnum;
  }

  window.Stoker.model = {
    getState,
    init
  };


})();
