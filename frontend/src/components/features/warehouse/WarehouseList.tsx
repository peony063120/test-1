import CrudPage from '@/components/common/Crud/CrudPage';
import { warehouseApi, type Warehouse, type WarehousePayload } from '@/api/endpoints/warehouse.api';

const WarehouseList = () => <CrudPage<Warehouse, WarehousePayload> title="Kho hàng" resourceKey="warehouses" service={warehouseApi} nameOf={(row) => row.name} fields={[{ name: 'name', label: 'Tên kho', required: true }, { name: 'code', label: 'Mã kho' }, { name: 'address', label: 'Địa chỉ' }, { name: 'phone', label: 'Số điện thoại' }]} />;
export default WarehouseList;
