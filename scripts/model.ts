/**
 * Created by etay on 23/07/2017.
 */
namespace Stoker.model {
  let stocks = [];
  let content = {};
  let changePresentation = {};

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

  export function getState() {
    return state;
  }

  export function init(screensEnum, changeEnum) {
    content = screensEnum;
    changePresentation = changeEnum;
  }

}
