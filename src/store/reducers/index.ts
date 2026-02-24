import { combineReducers } from 'redux';
import { userAuthReducer } from './user/authReducer';
import { adminAuthReducer } from './admin/authReducer';
import { 
  productListReducer, 
  productDetailsReducer, 
  productCreateReducer, 
  productUpdateReducer, 
  productDeleteReducer 
} from './admin/productReducers';
import {
    categoryListReducer,
    categoryDetailsReducer,
    categoryCreateReducer,
    categoryUpdateReducer,
    categoryDeleteReducer,
  } from './admin/categoryReducers';
import { 
  masterDataListReducer, 
  masterDataCreateReducer,
  masterDataUpdateReducer
} from './admin/masterDataReducers';
import { inventoryListReducer, inventoryUpdateReducer } from './admin/inventoryReducers';
import { storefrontProductListReducer } from './storefront/productReducers';

const rootReducer = combineReducers({
  userAuth: userAuthReducer,
  adminAuth: adminAuthReducer,
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productDelete: productDeleteReducer,
  categoryList: categoryListReducer,
  categoryDetails: categoryDetailsReducer,
  categoryCreate: categoryCreateReducer,
  categoryUpdate: categoryUpdateReducer,
  categoryDelete: categoryDeleteReducer,
  masterDataList: masterDataListReducer,
  masterDataCreate: masterDataCreateReducer,
  masterDataUpdate: masterDataUpdateReducer,
  inventoryList: inventoryListReducer,
  inventoryUpdate: inventoryUpdateReducer,
  storefrontProductList: storefrontProductListReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;