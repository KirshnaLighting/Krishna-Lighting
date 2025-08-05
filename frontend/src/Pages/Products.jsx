import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Menu, X, Search, Filter, Grid, List, Star, ShoppingCart, Eye, Heart, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/UserContext';
import { toast } from 'react-hot-toast';

const KrishnaLightingProducts = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://krishna-lighting-backend.onrender.com/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data.products || data); // Handle both formats
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleAddToCart = async (productId, variantIndex = 0) => {
    if (!user) {
      if (window.confirm('You need to login to add items to cart. Would you like to login now?')) {
        navigate('/login', { state: { from: '/products' } });
      }
      return;
    }

    try {
      
      const product = products.find(p => p._id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const variant = product.variants[variantIndex] || {};
      const price = variant.price?.threeInOne || 0;

      const cartItem = {
        productId,
        variantIndex,
        priceType: 'threeInOne',
        quantity: 1,
        price
      };

      const response = await fetch('https://krishna-lighting-backend.onrender.com/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
        },
        body: JSON.stringify(cartItem)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }

      toast.success(`${product.productName} added to cart!`, {
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart')
        }
      });
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    }
  };

  // Transform API data to match your frontend structure
  const transformedProducts = useMemo(() => {
    return products.map(product => {
      const firstVariant = product.variants[0] || {};
      const firstImage = firstVariant.images?.[0]?.url || 'https://via.placeholder.com/400';

      return {
        id: product._id,
        name: product.productName,
        price: firstVariant.price?.threeInOne || 0,
        originalPrice: (firstVariant.price?.threeInOne || 0) * 1.2,
        image: firstImage,
        rating: 4.5,
        reviews: 10,
        inStock: firstVariant.stock?.status !== 'out-of-stock',
        isNew: new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        description: `${product.productName} made of ${product.material}`,
        productData: product
      };
    });
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = transformedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all';
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.productData.createdAt) - new Date(a.productData.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, priceRange, sortBy, transformedProducts]);

  const ProductCard = ({ product }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold">New</span>
            )}
            {product.originalPrice > product.price && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <button className="bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all">
              <Heart size={20} className="text-gray-600 hover:text-red-500 transition-colors" />
            </button>
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold">Out of Stock</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white text-slate-900 p-3 rounded-full hover:bg-amber-400 hover:text-white transition-colors"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(product.rating) ? "text-amber-400 fill-current" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ProductListItem = ({ product }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex">
      <div className="relative w-48 flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold">New</span>
          )}
          {product.originalPrice > product.price && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-slate-900 px-3 py-1 rounded text-sm font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(product.rating) ? "text-amber-400 fill-current" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors"
              >
                <Eye size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading and error states remain the same...
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Our Products</h1>
              <p className="text-gray-600 mt-1">Discover our complete collection of premium lighting solutions</p>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden p-2 text-gray-600"
                >
                  <SlidersHorizontal size={20} />
                </button>
              </div>

              <div className={`space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => setPriceRange([0, 500])}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        Under ₹500
                      </button>
                      <button
                        onClick={() => setPriceRange([500, 1000])}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        ₹500 - ₹1000
                      </button>
                      <button
                        onClick={() => setPriceRange([1000, 5000])}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        Above ₹1000
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange([0, 50000]);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600 hover:text-slate-900'
                      }`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-600 hover:text-slate-900'
                      }`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {filteredProducts.map(product => (
                  viewMode === 'grid'
                    ? <ProductCard key={product.id} product={product} />
                    : <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-2 bg-amber-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KrishnaLightingProducts;