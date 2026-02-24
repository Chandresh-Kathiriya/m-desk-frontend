import {
    MASTER_DATA_LIST_REQUEST, MASTER_DATA_LIST_SUCCESS, MASTER_DATA_LIST_FAIL,
    MASTER_DATA_CREATE_REQUEST, MASTER_DATA_CREATE_SUCCESS, MASTER_DATA_CREATE_FAIL, MASTER_DATA_CREATE_RESET,
    MASTER_DATA_DELETE_REQUEST, MASTER_DATA_DELETE_SUCCESS, MASTER_DATA_DELETE_FAIL,
    MASTER_DATA_UPDATE_REQUEST, MASTER_DATA_UPDATE_SUCCESS, MASTER_DATA_UPDATE_FAIL, MASTER_DATA_UPDATE_RESET
  } from '../../constants/admin/masterDataConstants';
  
  // State holds buckets for all our master data
  const initialState = {
    brands: [],
    colors: [],
    sizes: [],
    styles: [],
    loading: false,
    error: null,
  };
  
  export const masterDataListReducer = (state = initialState, action: any) => {
    switch (action.type) {
      case MASTER_DATA_LIST_REQUEST:
        return { ...state, loading: true };
      case MASTER_DATA_LIST_SUCCESS:
        // Dynamically update the correct bucket (e.g., state.brands = action.payload.data)
        return { 
          ...state, 
          loading: false, 
          [action.payload.dataType]: action.payload.data 
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