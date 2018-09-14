import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
//import '@fortawesome/fontawesome-free/css/regular.min.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AnyAction, applyMiddleware, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './Main';
import AutoIntlProvider from '../components/intl/AutoIntlProvider';
import { Types } from '../utilities/Types';
import { availableThemes } from '../reducers/settings';
import { Settings } from '../utilities/Settings';
import appReducer from '../reducers/index';
import { RootState } from '../reducers/index';
import { UserProfile } from '../reducers/profileStore';
import { PaginatorAction, MultiPaginatorAction } from '../reducers/createPaginator';
import ApiClient from '../network/ApiClient';
import ChannelEventStream from '../components/general/ChannelEventStream';
import { embedlyMiddleware } from '../reducers/embedlyStore';
import * as Actions from '../actions/Actions';
import { ConversationManager } from './managers/ConversationManager';
require('jquery/dist/jquery');
require('popper.js/dist/umd/popper');
require('bootstrap/dist/js/bootstrap');
require('../utilities/Extensions');

const loggingMiddleware = store => next => action => {
  console.log('DISPATCHING => ', action);
  let result = next(action);
  console.log('NEXT STATE => ', store.getState());
  return result;
};
const applyTheme = (themeIndex: number) => {
  let theme = availableThemes[themeIndex];
  let selector = theme.selector;
  let root = document.querySelector(':root');
  root.className = selector;
};
const themeSwitcherMiddleware = store => next => action => {
  let result = next(action);
  if (action.type === Types.SET_THEME) {
    let state = store.getState() as RootState;
    applyTheme(state.settings.theme);
  }
  return result;
};
const paginationMiddleware = store => next => action => {
  let result = next(action);
  if (action.type === Types.REQUEST_PAGE) {
    var endpoint:string = null
    var limit:number = 0
    var offset:number = 0
    if ("pagingId" in action.payload)
    {

      let a = action as MultiPaginatorAction;
      endpoint = a.meta.endpoint(a.payload.pagingId)
      limit = a.meta.pageSize
      offset = a.payload.offset
    }
    else 
    {
      let a = action as PaginatorAction;
      endpoint = a.meta.endpoint
      limit = a.meta.pageSize
      offset = a.payload.offset
    }
    ApiClient.getPage(endpoint , limit, offset,  (data, status, error) => {
        let receivePageAction = ( offset: number, results: any[], total: number, error:string): PaginatorAction =>
        ({
            type: Types.RECEIVE_PAGE,
            payload: { ...action.payload,
                offset,
                results,
                total,
                error
            },
            meta: action.meta
        });
        let results = data ? data.results || [] : []
        let count = data ? data.count || 0 : 0
        store.dispatch(
            receivePageAction(action.payload.offset, results, count, error)
        );
      }
    );
  }
  return result;
};
var middleWares = [loggingMiddleware, paginationMiddleware, embedlyMiddleware];
if (Settings.supportsTheming) {
  middleWares.push(themeSwitcherMiddleware);
}
const store = createStore(appReducer, applyMiddleware(...middleWares));
window.store = store 
window.socket = document.createElement("div")
//managers
ConversationManager.setup()


export const getProfileById = (id: number): UserProfile => {
  let s = store.getState();
  if (s.profile.id == id) return s.profile;
  return s.profileStore.byId[id];
};
export const getProfileByUsername = (name: string): UserProfile => {
  let s = store.getState();
  if (s.profile.username == name) return s.profile;
  let keys = Object.keys( s.profileStore.byId);
  let k = keys.find(k => s.profileStore.byId[k].username == name)
  if(k)
  {
    return s.profileStore.byId[k]
  }
};

const persistor = persistStore(store, {}, () => {
  //rehydrate complete
  if (Settings.supportsTheming) {
    let themeIndex = store.getState().settings.theme || 0;
    applyTheme(themeIndex);
  }
});
ReactDOM.render(
  <Provider store={store}>
    <>
      <ChannelEventStream />
      <PersistGate loading={null} persistor={persistor}>
        <AutoIntlProvider>
          <Main />
        </AutoIntlProvider>
      </PersistGate>
    </>
  </Provider>,
  document.getElementById('app-root')
);
export default store;
