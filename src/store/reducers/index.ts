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

const rootReducer = combineReducers({
  userAuth: userAuthReducer,
  adminAuth: adminAuthReducer,
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productDelete: productDeleteReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;