import { createStore, applyMiddleware } from 'redux';
import thunk  from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';

// Hydrate state from local storage if the danpm install react-bootstrap bootstrapta exists
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo') as string)
  : null;

const adminInfoFromStorage = localStorage.getItem('adminInfo')
  ? JSON.parse(localStorage.getItem('adminInfo') as string)
  : null;

// Set up the initial state tree
const initialState: any = {
  userAuth: {
    userInfo: userInfoFromStorage,
    isAuthenticated: !!userInfoFromStorage,
  },
  adminAuth: {
    adminInfo: adminInfoFromStorage,
    isAuthenticated: !!adminInfoFromStorage,
  },
};

const middleware = [thunk];

// Create the store
const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;