import {
  MASTER_DATA_LIST_REQUEST, MASTER_DATA_LIST_SUCCESS, MASTER_DATA_LIST_FAIL,
  MASTER_DATA_CREATE_REQUEST, MASTER_DATA_CREATE_SUCCESS, MASTER_DATA_CREATE_FAIL, MASTER_DATA_CREATE_RESET,
  MASTER_DATA_UPDATE_REQUEST, MASTER_DATA_UPDATE_SUCCESS, MASTER_DATA_UPDATE_FAIL, MASTER_DATA_UPDATE_RESET,
  MASTER_DATA_TABS_REQUEST, MASTER_DATA_TABS_SUCCESS, MASTER_DATA_TABS_FAIL,
  MASTER_DATA_TAB_CREATE_REQUEST, MASTER_DATA_TAB_CREATE_SUCCESS, MASTER_DATA_TAB_CREATE_FAIL, MASTER_DATA_TAB_CREATE_RESET,
  MASTER_DATA_TAB_DELETE_RESET,
  MASTER_DATA_TAB_DELETE_FAIL,
  MASTER_DATA_TAB_DELETE_SUCCESS,
  MASTER_DATA_TAB_DELETE_REQUEST
} from '../../constants/admin/masterDataConstants';

export const masterDataListReducer = (state = {}, action: any) => {
  switch (action.type) {
      case MASTER_DATA_LIST_REQUEST: 
          return { ...state, loading: true }; // Keep existing data while loading
          
      case MASTER_DATA_LIST_SUCCESS: 
          return { 
              ...state, // <--- THE FIX: This saves the previously loaded tabs!
              loading: false, 
              [action.payload.type]: action.payload.data 
          };
          
      case MASTER_DATA_LIST_FAIL: 
          return { ...state, loading: false, error: action.payload };
          
      default: 
          return state;
  }
};

export const masterDataCreateReducer = (state = {}, action: any) => {
  switch (action.type) {
      case MASTER_DATA_CREATE_REQUEST: return { loading: true };
      case MASTER_DATA_CREATE_SUCCESS: return { loading: false, success: true };
      case MASTER_DATA_CREATE_FAIL: return { loading: false, error: action.payload };
      case MASTER_DATA_CREATE_RESET: return {};
      default: return state;
  }
};

export const masterDataUpdateReducer = (state = {}, action: any) => {
  switch (action.type) {
      case MASTER_DATA_UPDATE_REQUEST: return { loading: true };
      case MASTER_DATA_UPDATE_SUCCESS: return { loading: false, success: true };
      case MASTER_DATA_UPDATE_FAIL: return { loading: false, error: action.payload };
      case MASTER_DATA_UPDATE_RESET: return {};
      default: return state;
  }
};

export const masterDataTabsReducer = (state = { tabs: [] }, action: any) => {
  switch (action.type) {
      case MASTER_DATA_TABS_REQUEST: return { loading: true, tabs: [] };
      case MASTER_DATA_TABS_SUCCESS: return { loading: false, tabs: action.payload };
      case MASTER_DATA_TABS_FAIL: return { loading: false, error: action.payload };
      default: return state;
  }
};

export const masterDataTabCreateReducer = (state = {}, action: any) => {
  switch (action.type) {
      case MASTER_DATA_TAB_CREATE_REQUEST: return { loading: true };
      case MASTER_DATA_TAB_CREATE_SUCCESS: return { loading: false, success: true, tab: action.payload };
      case MASTER_DATA_TAB_CREATE_FAIL: return { loading: false, error: action.payload };
      case MASTER_DATA_TAB_CREATE_RESET: return {};
      default: return state;
  }
};

export const masterDataTabDeleteReducer = (state = {}, action: any) => {
  switch (action.type) {
      case MASTER_DATA_TAB_DELETE_REQUEST:
          return { loading: true };
      case MASTER_DATA_TAB_DELETE_SUCCESS:
          return { loading: false, success: true };
      case MASTER_DATA_TAB_DELETE_FAIL:
          return { loading: false, error: action.payload };
      case MASTER_DATA_TAB_DELETE_RESET:
          return {};
      default:
          return state;
  }
};