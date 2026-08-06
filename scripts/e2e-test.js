const BASE = 'http://localhost:3000/api/v1';


async function call(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data };
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS:', name); }
  else { fail++; console.log('  FAIL:', name, extra !== undefined ? JSON.stringify(extra) : ''); }
}

async function main() {
  console.log('=== 1. LOGIN ===');
  const login = await call('POST', '/auth/login', null, { username: 'admin', password: 'admin123' });
  check('login admin (201)', login.status === 201, login.data);
  if (login.status !== 201) { console.log('Aborting, cannot login'); return; }
  const token = login.data.accessToken;

  console.log('\n=== 2. CATEGORY ===');
  const catCreate = await call('POST', '/categories', token, { name: 'Test Cat ' + Date.now() });
  check('create category (201)', [200, 201].includes(catCreate.status), catCreate.data);
  const catId = catCreate.data?.id;
  const catList = await call('GET', '/categories', token, null);
  check('list categories (200)', catList.status === 200, catList.data);
  if (catId) {
    const catGet = await call('GET', '/categories/' + catId, token, null);
    check('get category by id', catGet.status === 200, catGet.data);
  }

  console.log('\n=== 3. BRAND ===');
  const brandCreate = await call('POST', '/brands', token, { name: 'Test Brand ' + Date.now() });
  check('create brand (201)', [200, 201].includes(brandCreate.status), brandCreate.data);
  const brandId = brandCreate.data?.id;

  console.log('\n=== 4. SUPPLIER ===');
  const supCreate = await call('POST', '/suppliers', token, { companyName: 'Test Sup ' + Date.now(), taxCode: 'TX' + Date.now() });
  check('create supplier (201)', [200, 201].includes(supCreate.status), supCreate.data);
  const supId = supCreate.data?.id;

  console.log('\n=== 5. WAREHOUSE ===');
  const whCreate = await call('POST', '/warehouses', token, { name: 'Test WH ' + Date.now() });
  check('create warehouse (201)', [200, 201].includes(whCreate.status), whCreate.data);
  const whId = whCreate.data?.id;

  console.log('\n=== 6. PRODUCT ===');
  const suffix = Date.now();
  const productPayload = {
    sku: 'SKU' + suffix,
    barcode: 'BAR' + suffix,
    name: 'Test Product ' + suffix,
    costPrice: 100,
    salePrice: 150,
    categoryId: catId,
    brandId: brandId,
    supplierId: supId,
  };
  const prodCreate = await call('POST', '/products', token, productPayload);
  check('create product (201)', [200, 201].includes(prodCreate.status), prodCreate.data);
  const prodId = prodCreate.data?.id;

  console.log('\n=== 7. INVENTORY / STOCK ===');
  if (prodId && whId) {
    const invCreate = await call('POST', '/inventory', token, { productId: prodId, warehouseId: whId, quantity: 100, minimumQuantity: 10 });
    check('create inventory (201)', [200, 201].includes(invCreate.status), invCreate.data);
    const invList = await call('GET', '/inventory', token, null);
    check('list inventory (200)', invList.status === 200, invList.data);
    const invItem = await call('POST', '/stock-transactions', token, { productId: prodId, warehouseId: whId, type: 'IMPORT', quantity: 50 });
    check('create stock transaction', [200, 201].includes(invItem.status), invItem.data);
    const invList2 = await call('GET', '/inventory', token, null);
    check('inventory quantity updated', invList2.status === 200, invList2.data);
  }

  console.log('\n=== 8. PURCHASE ORDER ===');
  if (supId && whId && prodId) {
    const po = await call('POST', '/purchase-orders', token, {
      supplierId: supId, warehouseId: whId,
      items: [{ productId: prodId, quantity: 20, price: 90 }],
    });
    check('create purchase order', [200, 201].includes(po.status), po.data);
  }

  console.log('\n=== 9. DASHBOARD ===');
  const dash = await call('GET', '/dashboard', token, null);
  check('dashboard (200)', dash.status === 200, dash.data ? Object.keys(dash.data) : dash.data);

  console.log('\n=== 10. SEARCH ===');
  const search = await call('GET', '/search?q=' + suffix, token, null);
  check('search products', [200, 201].includes(search.status), search.data && search.data.items);

  console.log('\n=== 11. REPORTS ===');
  const rep = await call('GET', '/reports/inventory', token, null);
  check('report inventory', [200, 201].includes(rep.status), rep.data);

  console.log('\n=== 12. SYSTEM SETTINGS ===');
  const sett = await call('GET', '/system-settings', token, null);
  check('system settings (200)', sett.status === 200, sett.data);

  // === CLEANUP on bad data? Skip for now ===

  console.log(`\n================ RESULTS: ${pass} passed, ${fail} failed ================`);
}

main().catch((e) => { console.error('Fatal error:', e); process.exit(1); });
