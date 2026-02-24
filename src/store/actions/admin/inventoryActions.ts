import axios from 'axios';

// Constants
export const INVENTORY_LIST_REQUEST = 'INVENTORY_LIST_REQUEST';
export const INVENTORY_LIST_SUCCESS = 'INVENTORY_LIST_SUCCESS';
export const INVENTORY_LIST_FAIL = 'INVENTORY_LIST_FAIL';

export const INVENTORY_UPDATE_REQUEST = 'INVENTORY_UPDATE_REQUEST';
export const INVENTORY_UPDATE_SUCCESS = 'INVENTORY_UPDATE_SUCCESS';
export const INVENTORY_UPDATE_FAIL = 'INVENTORY_UPDATE_FAIL';
export const INVENTORY_UPDATE_RESET = 'INVENTORY_UPDATE_RESET';

// Actions
export const listInventory = () => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: INVENTORY_LIST_REQUEST });
    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

    const { data } = await axios.get('/api/inventory', config);
    dispatch({ type: INVENTORY_LIST_SUCCESS, payload: data.inventory });
  } catch (error: any) {
    dispatch({ type: INVENTORY_LIST_FAIL, payload: error.response?.data?.message || error.message });
  }
};

export const adjustStock = (sku: string, quantityToAdd: number, reason: string, notes: string) => async (dispatch: any, getState: any) => {
    try {
      dispatch({ type: INVENTORY_UPDATE_REQUEST });
      const { adminAuth: { adminInfo } } = getState();
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
  
      // Now we are passing the full payload!
      await axios.put('/api/inventory/adjust', { sku, quantityToAdd, reason, notes }, config);
      
      dispatch({ type: INVENTORY_UPDATE_SUCCESS });
    } catch (error: any) {
      dispatch({ type: INVENTORY_UPDATE_FAIL, payload: error.response?.data?.message || error.message });
    }
  };