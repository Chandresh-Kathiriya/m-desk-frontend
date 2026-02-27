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
import { storefrontProductListReducer, storefrontProductDetailsReducer } from './storefront/productReducers';
import { cartReducer } from './user/cartReducers';
import { orderListReducer, orderDetailsReducer, orderDeliverReducer } from './admin/orderReducers';
import { uploadImageReducer } from './admin/uploadReducers';
import { reviewCreateReducer, reviewUpdateReducer, reviewVoteReducer, reviewReportReducer } from './storefront/reviewReducers';
import { couponValidateReducer } from './user/couponReducers';
import { orderListMyReducer, orderCreateReducer, userOrderDetailsReducer, orderVerifyReducer, stripeIntentReducer } from './user/orderReducers';
import { discountOfferListReducer, discountCouponListReducer, discountOfferCreateReducer, discountCouponCreateReducer } from './admin/discountReducers';
import { contactListReducer } from './admin/contactReducers';

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
  storefrontProductDetails: storefrontProductDetailsReducer,
  cart: cartReducer,
  orderList: orderListReducer,
  orderDetails: orderDetailsReducer,
  orderDeliver: orderDeliverReducer,
  imageUpload: uploadImageReducer,
  orderListMy: orderListMyReducer,
  reviewCreate: reviewCreateReducer,
  reviewUpdate: reviewUpdateReducer,
  reviewVote: reviewVoteReducer,
  reviewReport: reviewReportReducer,
  orderCreate: orderCreateReducer,
  couponValidate: couponValidateReducer,
  userOrderDetails: userOrderDetailsReducer,
  orderVerify: orderVerifyReducer,
  stripeIntent: stripeIntentReducer,
  discountOfferList: discountOfferListReducer,
  discountCouponList: discountCouponListReducer,
  discountOfferCreate: discountOfferCreateReducer,
  discountCouponCreate: discountCouponCreateReducer,
  contactList: contactListReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;