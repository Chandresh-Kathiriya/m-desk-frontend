import {
    INVENTORY_LIST_REQUEST, INVENTORY_LIST_SUCCESS, INVENTORY_LIST_FAIL,
    INVENTORY_UPDATE_REQUEST, INVENTORY_UPDATE_SUCCESS, INVENTORY_UPDATE_FAIL, INVENTORY_UPDATE_RESET
  } from '../../actions/admin/inventoryActions';
  
  export const inventoryListReducer = (state = { inventory: [] }, action: any) => {
    switch (action.type) {
      case INVENTORY_LIST_REQUEST:
        return { loading: true, inventory: [] };
      case INVENTORY_LIST_SUCCESS:
        return { loading: false, inventory: action.payload };
      case INVENTORY_LIST_FAIL:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export const inventoryUpdateReducer = (state = {}, action: any) => {
    switch (action.type) {
      case INVENTORY_UPDATE_REQUEST:
        return { loading: true };
      case INVENTORY_UPDATE_SUCCESS:
        return { loading: false, success: true };
      case INVENTORY_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      case INVENTORY_UPDATE_RESET:
        return {};
      default:
        return state;
    }
  };