import OrderList from '@/components/common/Orders/OrderList'; import { salesOrderApi } from '@/api/endpoints/sales-order.api';
export default () => <OrderList title="Đơn bán hàng" keyName="sales-orders" list={() => salesOrderApi.list()} path="/sales-orders" />;
