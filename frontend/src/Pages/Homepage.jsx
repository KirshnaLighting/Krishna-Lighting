import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, Phone, Mail, Clock, Star, ShoppingCart, Eye, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const KrishnaLightingHomepage = () => {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5000/api/products/');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Transform the API data to match our component's expected format
        const transformedProducts = data.products.map(product => {
          // Use the first variant for display
          const firstVariant = product.variants[0];
          const firstImage = firstVariant.images[0]?.url || '';
          
          return {
            id: product._id,
            name: product.productName,
            price: firstVariant.price.threeInOne, // Using threeInOne price as default
            originalPrice: Math.round(firstVariant.price.threeInOne * 1.2), // Adding 20% as original price
            image: firstImage,
            rating: 4.5, // Default rating since not in API
            reviews: Math.floor(Math.random() * 100) + 20, // Random reviews count
            bodyColour: product.bodyColour,
            material: product.material
          };
        });
        
        const shuffled = [...transformedProducts].sort(() => 0.5 - Math.random());
        setBestSellers(shuffled.slice(0, 4));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        toast.error('Failed to load products');

        const fallbackData = [
          {
            id: 1,
            name: "Premium LED Chandelier",
            price: 15999,
            originalPrice: 19999,
            image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop",
            rating: 4.8,
            reviews: 124
          },
          {
            id: 2,
            name: "Modern Pendant Light",
            price: 3499,
            originalPrice: 4999,
            image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop",
            rating: 4.7,
            reviews: 89
          },
          {
            id: 3,
            name: "Designer Table Lamp",
            price: 2299,
            originalPrice: 3199,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            rating: 4.9,
            reviews: 156
          },
          {
            id: 4,
            name: "Crystal Wall Sconce",
            price: 5799,
            originalPrice: 7499,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
            rating: 4.6,
            reviews: 73
          }
        ];
        const shuffled = [...fallbackData].sort(() => 0.5 - Math.random());
        setBestSellers(shuffled.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price).replace('₹', '₹');
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('bglight.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Illuminate Your Space with
            <span className="text-amber-400 block">Premium Lighting</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Discover our exclusive collection of modern and traditional lighting solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Best Sellers</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our most popular lighting solutions trusted by thousands of customers
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      {calculateDiscount(product.originalPrice, product.price)}% OFF
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="bg-white text-slate-900 p-2 rounded-full hover:bg-amber-400 hover:text-white transition-colors"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => {
                            toast.success(`${product.name} added to cart`);
                          }}
                          className="bg-white text-slate-900 p-2 rounded-full hover:bg-amber-400 hover:text-white transition-colors"
                        >
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{product.name}</h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {product.bodyColour} • {product.material}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/products")}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Visit Our Showroom Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Visit Our Showroom</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience our complete lighting collection in person at our state-of-the-art showroom
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 bg-gray-300 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d230.3016516966309!2d72.92314671471813!3d22.548173909813112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4f58ca481ffb%3A0x310b06a9429c25a6!2sKrishna%20lighting!5e0!3m2!1sen!2sin!4v1753534118815!5m2!1sen!2sin"
                  width="600"
                  height="600"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Krishna Lighting Location"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-amber-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Address</h4>
                    <p className="text-gray-600">
                      Krishna lighting,<br /> F.F Shreeji Darshan Complex Karamsad Chowkdi ,<br />
                      near ISCON Temple, Vallabh Vidyanagar,<br />
                      Gujarat 388120
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="text-amber-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-gray-600">+91 87654 32109</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-amber-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                    <p className="text-gray-600">info@krishnalighting.com</p>
                    <p className="text-gray-600">sales@krishnalighting.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="text-amber-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Opening Hours</h4>
                    <p className="text-gray-600">Monday - Saturday: 10:00 AM - 8:00 PM</p>
                    <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="https://maps.google.com?q=Krishna+lighting,+F.F+Shreeji+Darshan+Complex+Karamsad+Chowkdi,+near+ISCON+Temple,+Vallabh+Vidyanagar,+Gujarat+388120"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default KrishnaLightingHomepage;