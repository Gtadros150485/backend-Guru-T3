import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductsPage.module.scss';
import { apiService } from '../services/api';
import AddProductModal from '../components/products/AddProductModal';
import Toast from '../components/ui/Toast';

interface Product {
  id: number;
  name: string;
  category: string;
  vendor: string;
  article: string;
  rating: number;
  price: number;
  imageUrl?: string;
  quantity?: number;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const itemsPerPage = 20;

  useEffect(() => {
    loadProducts();
  }, [searchQuery, sortBy, sortOrder, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const params: any = {
        skip,
        limit: itemsPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (sortBy) {
        params.sort_by = sortBy;
        params.sort_order = sortOrder;
      }

      const data = await apiService.getProducts(params);
      setProducts(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Ошибка загрузки товаров', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await apiService.createProduct(productData);
      showToast('Товар успешно добавлен!', 'success');
      setShowAddModal(false);
      loadProducts();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Ошибка при добавлении товара', 'error');
    }
  };

  const handleCreateOrder = async (productId: number) => {
    try {
      await apiService.createOrder({ product_id: productId, quantity: 1 });
      showToast('Заказ успешно создан!', 'success');
      loadProducts();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Ошибка при создании заказа', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const renderStockIndicator = (quantity?: number) => {
    if (!quantity) return <div className={styles.stockEmpty}></div>;
    if (quantity < 5) return <div className={styles.stockLow}></div>;
    if (quantity < 10) return <div className={styles.stockMedium}></div>;
    return <div className={styles.stockFull}></div>;
  };

  return (
    <div className={styles.productsPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Экран авторизации</h1>
        <div className={styles.headerIcons}>
          <button className={styles.iconBtn}>🌐</button>
          <button className={styles.iconBtn}>
            <span className={styles.badge}>10</span>
            🔔
          </button>
          <button className={styles.iconBtn}>✉️</button>
          <button className={styles.iconBtn} onClick={handleLogout}>⚙️</button>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.topBar}>
          <h2 className={styles.pageTitle}>Товары</h2>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Найти"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.actionsBar}>
          <h3 className={styles.sectionTitle}>Все позиции</h3>
          <div className={styles.actions}>
            <button className={styles.refreshBtn} onClick={loadProducts}>
              🔄
            </button>
            <button className={styles.filterBtn}>
              ☰
            </button>
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
              <span className={styles.addIcon}>⊕</span>
              Добавить
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          {loading && (
            <div className={styles.loadingBar}>
              <div className={styles.loadingProgress}></div>
            </div>
          )}

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleAllProducts}
                  />
                </th>
                <th onClick={() => handleSort('name')} className={styles.sortable}>
                  Наименование {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('vendor')} className={styles.sortable}>
                  Вендор {sortBy === 'vendor' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('article')} className={styles.sortable}>
                  Артикул {sortBy === 'article' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('rating')} className={styles.sortable}>
                  Оценка {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('price')} className={styles.sortable}>
                  Цена, ₽ {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Количество</th>
                <th className={styles.actionsHeader}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={selectedProducts.includes(product.id) ? styles.selected : ''}
                >
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.productName}>
                      <div className={styles.productImage}></div>
                      <div>
                        <div className={styles.name}>{product.name}</div>
                        <div className={styles.category}>{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>{product.vendor}</td>
                  <td>{product.article}</td>
                  <td>
                    <span className={product.rating < 3.5 ? styles.ratingLow : styles.rating}>
                      {product.rating}/5
                    </span>
                  </td>
                  <td className={styles.price}>
                    {product.price.toLocaleString('ru-RU')} .00
                  </td>
                  <td>
                    {renderStockIndicator(product.quantity)}
                  </td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleCreateOrder(product.id)}
                      title="Создать заказ"
                    >
                      +
                    </button>
                    <button className={styles.actionBtnSecondary} title="Подробнее">
                      ○
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Показано 1-20 из 120
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {[1, 2, 3, 4, 5].map(page => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ProductsPage;
