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

  // Mock data for demonstration (replace with real API call)
  const mockProducts: Product[] = [
    { id: 1, name: 'USB Флэшкарта 16GB', category: 'Аксессуары', vendor: 'Samsung', article: 'RCH45Q1A', rating: 4.3, price: 48652 },
    { id: 2, name: 'Утюг Braun TexStyle 9', category: 'Бытовая техника', vendor: 'TexStyle', article: 'DFCHQ1A', rating: 4.9, price: 4233 },
    { id: 3, name: 'Смартфон Apple iPhone 17', category: 'Телефоны', vendor: 'Apple', article: 'GUYHD2-X4', rating: 4.7, price: 88652 },
    { id: 4, name: 'Игровая консоль PlayStation 5', category: 'Игровые приставки', vendor: 'Sony', article: 'HT45Q21', rating: 4.1, price: 56236 },
    { id: 5, name: 'Фен Dyson Supersonic Nural', category: 'Электроника', vendor: 'Dyson', article: 'FJHHGF-CR4', rating: 3.3, price: 48652 },
    { id: 6, name: 'Наушники Sony WH-1000XM5', category: 'Аксессуары', vendor: 'Sony', article: 'WH1000XM5', rating: 4.8, price: 32450 },
    { id: 7, name: 'Ноутбук Lenovo ThinkPad', category: 'Компьютеры', vendor: 'Lenovo', article: 'TP-X1-C10', rating: 2.5, price: 125000 },
    { id: 8, name: 'Клавиатура Logitech MX Keys', category: 'Аксессуары', vendor: 'Logitech', article: 'MX-KEYS-920', rating: 4.6, price: 12500 },
  ];

  useEffect(() => {
    loadProducts();
  }, [searchQuery, sortBy, sortOrder, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredProducts = [...mockProducts];

      // Search filter
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.article.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sorting
      if (sortBy) {
        filteredProducts.sort((a, b) => {
          let aVal = a[sortBy as keyof Product];
          let bVal = b[sortBy as keyof Product];

          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();

          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      setProducts(filteredProducts);
      setTotalPages(Math.ceil(filteredProducts.length / 20));
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

  const handleAddProduct = (product: any) => {
    showToast('Товар успешно добавлен!', 'success');
    setShowAddModal(false);
    // In real app, reload products from API
    loadProducts();
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

  return (
    <div className={styles.productsPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Товары (Desktop)</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Выйти
        </button>
      </header>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h2 className={styles.pageTitle}>Товары</h2>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Найти"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <h3 className={styles.sectionTitle}>Все позиции</h3>
          <div className={styles.actions}>
            <button className={styles.refreshBtn} onClick={loadProducts}>
              🔄
            </button>
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
              <span className={styles.addIcon}>+</span>
              Добавить
            </button>
          </div>
        </div>

        {/* Table */}
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
                <th className={styles.actionsCell}>Действия</th>
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
                    <span className={product.rating < 3 ? styles.ratingLow : styles.rating}>
                      {product.rating}/5
                    </span>
                  </td>
                  <td className={styles.price}>
                    {product.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.actionBtn}>+</button>
                    <button className={styles.actionBtnSecondary}>○</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ProductsPage;
