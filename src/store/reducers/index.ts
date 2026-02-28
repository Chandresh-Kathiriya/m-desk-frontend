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
import { contactCreateReducer, contactDeleteReducer, contactListReducer, contactUpdateReducer } from './admin/contactReducers';
import { settingsDetailsReducer, settingsUpdateReducer } from './admin/settingsReducers';
import { userInvoiceByOrderReducer, userInvoiceDetailsReducer, userInvoiceDownloadReducer, userInvoiceListReducer } from './user/invoiceReducers';
import { invoiceListReducer, invoiceDetailsReducer, adminInvoiceByOrderReducer, invoiceDownloadReducer } from './admin/invoiceReducers';
import { purchaseBillReducer, purchaseConfirmReducer, purchaseCreateReducer, purchaseDetailsReducer, purchaseListReducer } from './admin/purchaseReducers';

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
  invoiceList: invoiceListReducer,
  settingsDetails: settingsDetailsReducer,
  settingsUpdate: settingsUpdateReducer,
  userInvoiceByOrder: userInvoiceByOrderReducer,
  userInvoiceDetails: userInvoiceDetailsReducer,
  invoiceDetails: invoiceDetailsReducer,
  userInvoiceList: userInvoiceListReducer,
  adminInvoiceByOrder: adminInvoiceByOrderReducer,
  invoiceDownload: invoiceDownloadReducer,
  userInvoiceDownload: userInvoiceDownloadReducer,
  contactCreate: contactCreateReducer,
  contactUpdate: contactUpdateReducer,
  contactDelete: contactDeleteReducer,
  purchaseCreate: purchaseCreateReducer,
  purchaseDetails: purchaseDetailsReducer,
  purchaseConfirm: purchaseConfirmReducer,
  purchaseBill: purchaseBillReducer,
  purchaseList: purchaseListReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;