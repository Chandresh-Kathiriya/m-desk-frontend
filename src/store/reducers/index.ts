import { combineReducers } from 'redux';
import { userAuthReducer } from './user/authReducer';
import { adminAuthReducer } from './admin/authReducer';
import {
  productListReducer,
  productDetailsReducer,
  productCreateReducer,
  productUpdateReducer,
  productDeleteReducer,
  productListAdminReducer
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
  masterDataUpdateReducer,
  masterDataTabsReducer,
  masterDataTabCreateReducer,
  masterDataTabDeleteReducer
} from './admin/masterDataReducers';
import { inventoryListReducer, inventoryUpdateReducer } from './admin/inventoryReducers';
import { storefrontProductListReducer, storefrontProductDetailsReducer, storefrontSimilarProductsReducer } from './storefront/productReducers';
import { cartReducer } from './user/cartReducers';
import { orderListReducer, orderDetailsReducer, orderDeliverReducer, orderCreateManualReducer, orderPayManualReducer } from './admin/orderReducers';
import { uploadImageReducer } from './admin/uploadReducers';
import { reviewCreateReducer, reviewUpdateReducer, reviewVoteReducer, reviewReportReducer, reviewDeleteReducer } from './storefront/reviewReducers';
import { couponValidateReducer } from './user/couponReducers';
import { orderListMyReducer, orderCreateReducer, userOrderDetailsReducer, orderVerifyReducer, stripeIntentReducer } from './user/orderReducers';
import { discountOfferListReducer, discountCouponListReducer, discountOfferCreateReducer, discountCouponCreateReducer } from './admin/discountReducers';
import { contactCreateReducer, contactDeleteReducer, contactListReducer, contactUpdateReducer } from './admin/contactReducers';
import { settingsDetailsReducer, settingsUpdateReducer } from './admin/settingsReducers';
import { userInvoiceByOrderReducer, userInvoiceDetailsReducer, userInvoiceDownloadReducer, userInvoiceListReducer } from './user/invoiceReducers';
import { invoiceListReducer, invoiceDetailsReducer, adminInvoiceByOrderReducer, invoiceDownloadReducer } from './admin/invoiceReducers';
import { purchaseCreateReducer, purchaseDetailsReducer, purchaseListReducer, purchaseReceiveReducer } from './admin/purchaseReducers';
import { billListReducer, billDownloadReducer, billDetailsReducer } from './admin/billReducers';
import { paymentCreateReducer } from './admin/paymentReducers';
import {
  reportSalesProductsReducer,
  reportPurchasesProductsReducer,
  reportSalesCustomersReducer,
  reportPurchasesVendorsReducer
} from './admin/reportReducers';
import { userCreateReducer, userListReducer } from './admin/userReducers';
import { userUpdateProfileReducer, userDetailsReducer } from './user/userReducers';
import { adminUpdateProfileReducer, adminDetailsReducer } from './admin/adminReducer';
import { publicFiltersReducer } from './storefront/filterReducers';

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
  masterDataTabs: masterDataTabsReducer,
  masterDataTabCreate: masterDataTabCreateReducer,
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
  reviewDelete: reviewDeleteReducer,
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
  purchaseReceive: purchaseReceiveReducer,
  purchaseList: purchaseListReducer,
  billList: billListReducer,
  billDownload: billDownloadReducer,
  billDetails: billDetailsReducer,
  paymentCreate: paymentCreateReducer,
  reportSalesProducts: reportSalesProductsReducer,
  reportPurchasesProducts: reportPurchasesProductsReducer,
  reportSalesCustomers: reportSalesCustomersReducer,
  reportPurchasesVendors: reportPurchasesVendorsReducer,
  userList: userListReducer,
  productListAdmin: productListAdminReducer,
  orderCreateManual: orderCreateManualReducer,
  orderPayManual: orderPayManualReducer,
  publicFilters: publicFiltersReducer,
  storefrontSimilarProducts: storefrontSimilarProductsReducer,
  userCreate: userCreateReducer,
  masterDataTabDelete: masterDataTabDeleteReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  adminDetails: adminDetailsReducer,
  adminUpdateProfile: adminUpdateProfileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;