import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus,
  Truck, Shield, RotateCcw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../Context/UserContext';
import { toast } from 'react-hot-toast';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColorTemp, setSelectedColorTemp] = useState('3000K');
  const [selectedBodyColor, setSelectedBodyColor] = useState('White');
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceType, setSelectedPriceType] = useState('threeInOne');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        setProduct(data);

        if (data?.variants?.[0]?.colorTemperature?.[0]) {
          setSelectedColorTemp(data.variants[0].colorTemperature[0]);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (id) getProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      if (window.confirm('You need to login to add items to cart. Would you like to login now?')) {
        navigate('/login', { state: { from: `/products/${id}` } });
      }
      return;
    }

    if (getStockStatus() === 'out-of-stock') {
      toast.error('This product is currently out of stock');
      return;
    }

    try {
      setAddingToCart(true);

      const cartItem = {
        productId: id,
        variantIndex: selectedVariant,
        colorTemperature: selectedPriceType === 'custom' ? selectedColorTemp : null,
        bodyColor: selectedBodyColor,
        priceType: selectedPriceType,
        quantity,
        price: getCurrentPrice()
      };

      const response = await fetch('http://localhost:5000/api/cart', {  // Changed endpoint from '/ad' to '/add'
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
        position: 'bottom-right',
        duration: 3000,
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart')
        }
      });
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      if (window.confirm('You need to login to proceed. Would you like to login now?')) {
        navigate('/login', { state: { from: `/products/${id}` } });
      }
      return;
    }

    try {
      await handleAddToCart();
      navigate('/checkout');
    } catch (err) {
      console.error('Error in buy now:', err);
    }
  };

  const getCurrentPrice = () => {
    const price = currentVariant?.price;
    switch (selectedPriceType) {
      case 'threeInOne': return price?.threeInOne || 0;
      case 'tAndD': return price?.tAndD || 0;
      case 'custom': return price?.custom || 0;
      default: return price?.threeInOne || 0;
    }
  };

  const getStockStatus = () => currentVariant?.stock?.status;
  const getStockQuantity = () => currentVariant?.stock?.quantity || 0;

  const nextImage = () => {
    const images = currentVariant?.images || [];
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = currentVariant?.images || [];
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-20 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-20 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="font-bold">Notice: </strong>
          <span>Product not found</span>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
              {currentVariant.images.length > 0 ? (
                <>
                  <img
                    src={currentVariant.images[currentImageIndex].url}
                    alt={product.productName}
                    className="w-full h-96 sm:h-[500px] object-cover"
                  />
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {currentVariant.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-amber-600' : 'bg-white bg-opacity-60'}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-96 sm:h-[500px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No images available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentVariant.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {currentVariant.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`bg-white rounded-lg overflow-hidden shadow-sm border-2 transition-all ${index === currentImageIndex ? 'border-amber-600' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={image.url} alt={`View ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.productName}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className={`text-sm px-2 py-1 rounded-full ${getStockStatus() !== 'out-of-stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {getStockStatus() === 'in-stock' ? `${getStockQuantity()} in stock` :
                    getStockStatus() === 'low-stock' ? 'Low stock' : 'Out of stock'}
                </span>
              </div>
              <p className="text-gray-600 text-lg mb-6">{product.description || 'No description available'}</p>
            </div>

            {/* Variant Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Select Wattage</h3>
                <div className="grid grid-cols-3 gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVariant(index);
                        setCurrentImageIndex(0);
                      }}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${selectedVariant === index
                        ? 'border-amber-600 bg-amber-50 text-amber-800'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      <div className="font-semibold">{variant.watt}</div>
                      <div className="text-xs text-gray-600">{variant.dimensions}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Light Configuration</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      value="threeInOne"
                      checked={selectedPriceType === 'threeInOne'}
                      onChange={(e) => setSelectedPriceType(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-gray-700">3-in-1 (Multiple Color Temperatures)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      value="tAndD"
                      checked={selectedPriceType === 'tAndD'}
                      onChange={(e) => setSelectedPriceType(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-gray-700">Tunable & Dimming</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      value="custom"
                      checked={selectedPriceType === 'custom'}
                      onChange={(e) => setSelectedPriceType(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-gray-700">Custom Configuration</span>
                  </label>
                </div>
              </div>

              {/* Color Temperature Selection */}
              {selectedPriceType === 'custom' && currentVariant.colorTemperature.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Color Temperature</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {currentVariant.colorTemperature.map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setSelectedColorTemp(temp)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${selectedColorTemp === temp
                          ? 'border-amber-600 bg-amber-50 text-amber-800'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="font-semibold">{temp}</div>
                        <div className="text-xs text-gray-600">
                          {temp === '3000K' ? 'Warm White' : temp === '4000K' ? 'Natural White' : 'Cool White'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Body Color Selection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Body Color</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedBodyColor(product.bodyColour)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedBodyColor === product.bodyColour
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {product.bodyColour}
                  </button>
                </div>
              </div>
            </div>

            {/* Price and Quantity */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-slate-900">₹{getCurrentPrice()?.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedPriceType === 'custom' && `${selectedColorTemp} • `}
                    {currentVariant.watt} • {product.bodyColour}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 bg-gray-50 rounded-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    disabled={quantity >= getStockQuantity()}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={getStockStatus() === 'out-of-stock' || addingToCart}
                  className={`flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${(getStockStatus() === 'out-of-stock' || addingToCart) ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                  {addingToCart ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Truck className="text-amber-600" size={24} />
                <div>
                  <div className="font-semibold text-slate-900">Free Delivery</div>
                  <div className="text-sm text-gray-600">On orders above ₹2000</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Shield className="text-amber-600" size={24} />
                <div>
                  <div className="font-semibold text-slate-900">5 Year Warranty</div>
                  <div className="text-sm text-gray-600">Manufacturer guarantee</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <RotateCcw className="text-amber-600" size={24} />
                <div>
                  <div className="font-semibold text-slate-900">Easy Returns</div>
                  <div className="text-sm text-gray-600">30-day return policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;