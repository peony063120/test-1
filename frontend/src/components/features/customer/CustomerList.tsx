import CrudPage from '@/components/common/Crud/CrudPage';
import { customerApi, type Customer, type CustomerPayload } from '@/api/endpoints/customer.api';
const CustomerList = () => <CrudPage<Customer, CustomerPayload> title="Khách hàng" resourceKey="customers" service={customerApi} nameOf={(row) => row.name} fields={[{ name: 'name', label: 'Tên khách hàng', required: true }, { name: 'phone', label: 'Số điện thoại' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'address', label: 'Địa chỉ' }]} />;
export default CustomerList;
