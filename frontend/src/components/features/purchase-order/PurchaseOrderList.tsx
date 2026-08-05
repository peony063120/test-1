import OrderList from '@/components/common/Orders/OrderList'; import { purchaseOrderApi } from '@/api/endpoints/purchase-order.api';
export default () => <OrderList title="Đơn nhập hàng" keyName="purchase-orders" list={() => purchaseOrderApi.list()} path="/purchase-orders" />;
