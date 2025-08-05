// pages/AdminProductPage.jsx (no external UI dependencies, all modals/logic inline)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Edit, ChevronDown, ChevronUp,
  Image as ImageIcon, X, Check, AlertTriangle, Battery, Menu
} from 'lucide-react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
const API_URL = 'https://krishna-lighting-backend.onrender.com/api/products';

const getStockStatus = (quantity, threshold) => {
  if (quantity <= 0) return 'out-of-stock';
  if (quantity <= threshold) return 'low-stock';
  return 'in-stock';
};

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // UI states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // product object
  const [expandedProduct, setExpandedProduct] = useState(null);

  // For add/edit product modal forms:
  const emptyVariant = {
    watt: '',
    dimensions: '',
    cutout: '',
    beamAngle: '',
    colorTemperature: [],
    images: [],
    cri: '',
    price: { 'threeInOne': 0, 'tAndD': 0, custom: 0 },
    stock: { quantity: 0, threshold: 10, status: 'out-of-stock' }
  };
  const [newProduct, setNewProduct] = useState({
    _id: '',
    productName: '',
    bodyColour: '',
    material: '',
    variants: [JSON.parse(JSON.stringify(emptyVariant))]
  });
  const [variantUploadFiles, setVariantUploadFiles] = useState([[]]);
  const [tempColorTemp, setTempColorTemp] = useState('');

  const fetchProducts = async (pg = 1) => {
    setFetching(true);
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}?page=${pg}&limit=10`);
      setProducts(res.data.products);
      setPage(res.data.currentPage);
      setPages(res.data.pages);

      setProducts((p) => p); setPage(1); setPages(1);
    } finally {
      setFetching(false);
      setLoading(false)
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const getStockStatusColor = (status) => (
    status === 'in-stock'
      ? 'bg-green-100 text-green-800'
      : status === 'low-stock'
        ? 'bg-yellow-100 text-yellow-800'
        : status === 'out-of-stock'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
  );

  const getStockStatusIcon = (status) => (
    status === 'in-stock' ? <Check className="w-4 h-4" />
      : status === 'low-stock' ? <AlertTriangle className="w-4 h-4" />
        : <Battery className="w-4 h-4" />
  );
  const handleAddProduct = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('productName', newProduct.productName);
    formData.append('bodyColour', newProduct.bodyColour);
    formData.append('material', newProduct.material);

    // Deep copy of variants to safely transform
    let variantsCopy = JSON.parse(JSON.stringify(newProduct.variants));

    variantsCopy.forEach((variant, idx) => {
      // Reset images; backend will re-attach based on upload
      variant.images = [];

      // Ensure price fields are numbers
      variant.price = {
        threeInOne: Number(variant.price.threeInOne),
        tAndD: Number(variant.price.tAndD),
        custom: Number(variant.price.custom),
      };

      // Ensure stock fields are numbers and set status
      variant.stock.quantity = Number(variant.stock.quantity);
      variant.stock.threshold = Number(variant.stock.threshold);
      variant.stock.status = getStockStatus(variant.stock.quantity, variant.stock.threshold);
    });

    // Attach variants JSON to form
    formData.append('variants', JSON.stringify(variantsCopy));

    // ✅ Attach variant images using dynamic field names like variantImages_0, variantImages_1
    variantUploadFiles.forEach((fileArray, variantIndex) => {
      fileArray.forEach((file) => {
        if (file) {
          formData.append(`variantImages_${variantIndex}`, file);
        }
      });
    });

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdProduct = response.data;

      // Refresh product list
      await fetchProducts();

      // Reset form state
      setIsAddOpen(false);
      setNewProduct({
        productName: '',
        bodyColour: '',
        material: '',
        variants: [JSON.parse(JSON.stringify(emptyVariant))],
      });
      setVariantUploadFiles([[]]);
      setTempColorTemp('');

    } catch (error) {
      // Detailed error handling
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Something went wrong on the server.';
        if (status === 400) {
          alert(`Validation error: ${message}`);
        } else if (status === 413) {
          alert('File too large. Please upload a smaller file.');
        } else {
          alert(`Server error (${status}): ${message}`);
        }
      } else if (error.request) {
        alert('No response from server. Please check your internet connection.');
      } else {
        alert(`Error: ${error.message}`);
      }

      console.error('Add product failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setLoading(true)
    await axios.delete(`${API_URL}/${id}`);
    await fetchProducts();
    setProducts(products.filter(p => (p._id || p.id) !== id));
    setLoading(false)
  };
  const handleUpdateProduct = async () => {
    setLoading(true);
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('productName', editingProduct.productName);
    formData.append('bodyColour', editingProduct.bodyColour);
    formData.append('material', editingProduct.material);

    const editVariantsCopy = JSON.parse(JSON.stringify(editingProduct.variants));

    editVariantsCopy.forEach((variant, idx) => {
      // ✅ Ensure all images are objects with url and public_id
      variant.images = variant.images.map((img) => {
        if (typeof img === 'string') {
          return {
            url: img,
            public_id: '', // placeholder, since existing may not include this
          };
        } else if (typeof img === 'object' && img.url) {
          return {
            url: img.url,
            public_id: img.public_id || '',
          };
        }
        return img;
      });

      // ✅ Ensure price fields are numeric
      variant.price = {
        threeInOne: Number(variant.price.threeInOne),
        tAndD: Number(variant.price.tAndD),
        custom: Number(variant.price.custom),
      };

      // ✅ Stock & status
      variant.stock.quantity = Number(variant.stock.quantity);
      variant.stock.threshold = Number(variant.stock.threshold);
      variant.stock.status = getStockStatus(
        variant.stock.quantity,
        variant.stock.threshold
      );
    });

    // ✅ Add updated variant data to FormData
    formData.append('variants', JSON.stringify(editVariantsCopy));

    // ✅ Upload new images as dynamic fields: variantImages_0, variantImages_1, etc.
    variantUploadFiles.forEach((fileArray, variantIndex) => {
      fileArray.forEach((file) => {
        if (file) {
          formData.append(`variantImages_${variantIndex}`, file);
        }
      });
    });

    try {
      await axios.put(`${API_URL}/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await fetchProducts();

      // ✅ Update local state and cleanup
      setProducts(
        products.map((p) =>
          (p._id || p.id) === (editingProduct._id || editingProduct.id)
            ? editingProduct
            : p
        )
      );

      setEditingProduct(null);
      setVariantUploadFiles([[]]);
      setTempColorTemp('');
    } catch (e) {
      alert('Failed to update product');
      console.error('Update error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandProduct = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handleImageUpload = (e, variantIndex, modalType) => {
    const files = Array.from(e.target.files);
    let fileArr = [...(modalType === 'add' ? variantUploadFiles : variantUploadFiles)];
    fileArr[variantIndex] = files;
    setVariantUploadFiles(fileArr);

    if (modalType === 'add') {
      const updated = [...newProduct.variants];
      updated[variantIndex].images = [
        ...updated[variantIndex].images, ...files
      ];
      setNewProduct({ ...newProduct, variants: updated });
    } else if (modalType === 'edit') {
      const updated = [...editingProduct.variants];
      updated[variantIndex].images = [
        ...updated[variantIndex].images, ...files
      ];
      setEditingProduct({ ...editingProduct, variants: updated });
    }
  };

  const handleRemoveImage = (variantIndex, imgIndex, modalType) => {
    if (modalType === 'add') {
      const updated = [...newProduct.variants];
      updated[variantIndex].images.splice(imgIndex, 1);
      setNewProduct({ ...newProduct, variants: updated });
    } else if (modalType === 'edit') {
      const updated = [...editingProduct.variants];
      updated[variantIndex].images.splice(imgIndex, 1);
      setEditingProduct({ ...editingProduct, variants: updated });
    }
  };

  const handleAddVariant = (modalType) => {
    if (modalType === 'add') {
      setNewProduct({
        ...newProduct,
        variants: [...newProduct.variants, JSON.parse(JSON.stringify(emptyVariant))]
      });
      setVariantUploadFiles([...variantUploadFiles, []]);
    } else if (modalType === 'edit') {
      setEditingProduct({
        ...editingProduct,
        variants: [...editingProduct.variants, JSON.parse(JSON.stringify(emptyVariant))]
      });
      setVariantUploadFiles([...variantUploadFiles, []]);
    }
  };

  const handleRemoveVariant = (modalType, variantIdIdx) => {
    if (modalType === 'add') {
      setNewProduct({
        ...newProduct,
        variants: newProduct.variants.filter((v, i) => i !== variantIdIdx)
      });
      setVariantUploadFiles(variantUploadFiles.filter((v, i) => i !== variantIdIdx));
    } else if (modalType === 'edit') {
      setEditingProduct({
        ...editingProduct,
        variants: editingProduct.variants.filter((v, i) => i !== variantIdIdx)
      });
      setVariantUploadFiles(variantUploadFiles.filter((v, i) => i !== variantIdIdx));
    }
  };

  const handleAddColorTemp = (variantIndex, modalType) => {
    if (!tempColorTemp.trim()) return;
    if (modalType === 'add') {
      const updated = [...newProduct.variants];
      updated[variantIndex].colorTemperature.push(tempColorTemp);
      setNewProduct({ ...newProduct, variants: updated });
    }
    if (modalType === 'edit') {
      const updated = [...editingProduct.variants];
      updated[variantIndex].colorTemperature.push(tempColorTemp);
      setEditingProduct({ ...editingProduct, variants: updated });
    }
    setTempColorTemp('');
  };

  const handleRemoveColorTemp = (variantIndex, temp, modalType) => {
    if (modalType === 'add') {
      const updated = [...newProduct.variants];
      updated[variantIndex].colorTemperature =
        updated[variantIndex].colorTemperature.filter(t => t !== temp);
      setNewProduct({ ...newProduct, variants: updated });
    }
    if (modalType === 'edit') {
      const updated = [...editingProduct.variants];
      updated[variantIndex].colorTemperature =
        updated[variantIndex].colorTemperature.filter(t => t !== temp);
      setEditingProduct({ ...editingProduct, variants: updated });
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-white text-lg font-medium">Loading...</span>
          </div>
        </div>
      )}
      <AdminSidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />


      <div className="flex flex-col flex-1 w-full">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                className="lg:hidden text-gray-500 hover:text-gray-600 mr-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">Krishna Lighting</div>
              </div>
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content/List */}
        <main className="p-4 sm:p-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className=" flex justify-between p-4 sm:p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">All Products</h3>
              <button
                onClick={() => { setIsAddOpen(true); setVariantUploadFiles([[]]); }}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </button>
            </div>
            <div>
              {fetching ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : products.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No products found. Add your first product.
                </div>
              ) : (
                products.map(product => (
                  <div key={product._id || product.id} className="border-b p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                        <p className="text-sm text-gray-500">{product.bodyColour} | {product.material}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingProduct(product); setVariantUploadFiles([[]]); }}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id || product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleExpandProduct(product._id || product.id)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          {
                            expandedProduct === (product._id || product.id) ?
                              <ChevronUp className="w-5 h-5" /> :
                              <ChevronDown className="w-5 h-5" />
                          }
                        </button>
                      </div>
                    </div>
                    {expandedProduct === (product._id || product.id) && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h5 className="font-medium text-gray-700 mb-2">Variants:</h5>
                        <div className="space-y-4">
                          {product.variants.map((variant, vIdx) => (
                            <div key={variant._id || variant.id || vIdx} className="bg-gray-50 p-3 rounded">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Watt</p>
                                  <p>{variant.watt}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Dimensions</p>
                                  <p>{variant.dimensions}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Cutout</p>
                                  <p>{variant.cutout}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Beam Angle</p>
                                  <p>{variant.beamAngle}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Color Temp</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {variant.colorTemperature.map((temp, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {temp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">CRI</p>
                                  <p>{variant.cri}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-500">Prices</p>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-xs text-gray-500">3IN1</p>
                                    <p className="font-medium">₹{variant.price['threeInOne']}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-xs text-gray-500">T&D</p>
                                    <p className="font-medium">₹{variant.price['tAndD']}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-xs text-gray-500">Custom</p>
                                    <p className="font-medium">₹{variant.price.custom}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-500">Stock</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-xs text-gray-500">Qty</p>
                                    <p className="font-medium">{variant.stock.quantity}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(variant.stock.status)}`}>
                                      {getStockStatusIcon(variant.stock.status)}
                                      <span className="ml-1">{variant.stock.status.replace('-', ' ')}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {variant.images?.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-500">Images</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {variant.images.map((img, index) => {
                                      const isFile = img instanceof File;
                                      const imageUrl = isFile
                                        ? URL.createObjectURL(img)
                                        : typeof img === "string"
                                          ? img
                                          : img?.url; // for Cloudinary objects

                                      return (
                                        <img
                                          key={index}
                                          src={imageUrl}
                                          alt="variant"
                                          className="w-20 h-20 object-cover"
                                        />
                                      );
                                    })}

                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Pagination (if you want) */}
            <div className="p-4 flex justify-end gap-2 text-sm">
              <button disabled={page <= 1} onClick={() => fetchProducts(page - 1)} className="px-2">Prev</button>
              <span>{page}/{pages}</span>
              <button disabled={page >= pages} onClick={() => fetchProducts(page + 1)} className="px-2">Next</button>
            </div>
          </div>
        </main>
      </div>

      {isAddOpen && (
        <ProductModal
          title="Add Product"
          product={newProduct}
          setProduct={setNewProduct}
          close={() => setIsAddOpen(false)}
          submit={handleAddProduct}
          variantUploadFiles={variantUploadFiles}
          setVariantUploadFiles={setVariantUploadFiles}
          tempColorTemp={tempColorTemp}
          setTempColorTemp={setTempColorTemp}
          handleAddVariant={() => handleAddVariant('add')}
          handleRemoveVariant={idx => handleRemoveVariant('add', idx)}
          handleImageUpload={(e, idx) => handleImageUpload(e, idx, 'add')}
          handleRemoveImage={(variantIdx, imgIdx) => handleRemoveImage(variantIdx, imgIdx, 'add')}
          handleAddColorTemp={(idx) => handleAddColorTemp(idx, 'add')}
          handleRemoveColorTemp={(idx, temp) => handleRemoveColorTemp(idx, temp, 'add')}
        />
      )}

      {editingProduct && (
        <ProductModal
          title="Edit Product"
          product={editingProduct}
          setProduct={setEditingProduct}
          close={() => setEditingProduct(null)}
          submit={handleUpdateProduct}
          variantUploadFiles={variantUploadFiles}
          setVariantUploadFiles={setVariantUploadFiles}
          tempColorTemp={tempColorTemp}
          setTempColorTemp={setTempColorTemp}
          handleAddVariant={() => handleAddVariant('edit')}
          handleRemoveVariant={idx => handleRemoveVariant('edit', idx)}
          handleImageUpload={(e, idx) => handleImageUpload(e, idx, 'edit')}
          handleRemoveImage={(variantIdx, imgIdx) => handleRemoveImage(variantIdx, imgIdx, 'edit')}
          handleAddColorTemp={(idx) => handleAddColorTemp(idx, 'edit')}
          handleRemoveColorTemp={(idx, temp) => handleRemoveColorTemp(idx, temp, 'edit')}
        />
      )}
    </div>
  );
}

function ProductModal({
  title, product, setProduct, close, submit,
  tempColorTemp, setTempColorTemp,
  handleAddVariant, handleRemoveVariant,
  handleImageUpload, handleRemoveImage,
  handleAddColorTemp, handleRemoveColorTemp
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={close} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-6 space-y-6">
            {/* Product fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" value={product.productName}
                  onChange={e => setProduct({ ...product, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Colour</label>
                <input type="text" value={product.bodyColour}
                  onChange={e => setProduct({ ...product, bodyColour: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <input type="text" value={product.material}
                  onChange={e => setProduct({ ...product, material: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            {/* Variants */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Variants</h4>
                <button onClick={handleAddVariant}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Variant
                </button>
              </div>
              <div className="space-y-6">
                {product.variants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Variant {variantIndex + 1}</h5>
                      {product.variants.length > 1 && (
                        <button
                          onClick={() => handleRemoveVariant(variantIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Watt</label>
                        <input type="text" value={variant.watt}
                          onChange={e => {
                            const updated = [...product.variants];
                            updated[variantIndex].watt = e.target.value;
                            setProduct({ ...product, variants: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                        <input type="text" value={variant.dimensions}
                          onChange={e => {
                            const updated = [...product.variants];
                            updated[variantIndex].dimensions = e.target.value;
                            setProduct({ ...product, variants: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cutout</label>
                        <input type="text" value={variant.cutout}
                          onChange={e => {
                            const updated = [...product.variants];
                            updated[variantIndex].cutout = e.target.value;
                            setProduct({ ...product, variants: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beam Angle</label>
                        <input type="text" value={variant.beamAngle}
                          onChange={e => {
                            const updated = [...product.variants];
                            updated[variantIndex].beamAngle = e.target.value;
                            setProduct({ ...product, variants: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CRI</label>
                        <input type="text" value={variant.cri}
                          onChange={e => {
                            const updated = [...product.variants];
                            updated[variantIndex].cri = e.target.value;
                            setProduct({ ...product, variants: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                    </div>
                    {/* Color Temperature */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color Temperature</label>
                      <div className="flex">
                        <input type="text" value={tempColorTemp}
                          onChange={e => setTempColorTemp(e.target.value)}
                          placeholder="e.g. 3000K"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                        />
                        <button
                          onClick={() => handleAddColorTemp(variantIndex)}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                        >Add</button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {variant.colorTemperature.map((temp, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {temp}
                            <button
                              onClick={() => handleRemoveColorTemp(variantIndex, temp)}
                              className="ml-1 text-blue-500 hover:text-blue-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Stock */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                          <input type="number"
                            value={variant.stock.quantity}
                            onChange={e => {
                              const updated = [...product.variants];
                              updated[variantIndex].stock.quantity = Number(e.target.value);
                              updated[variantIndex].stock.status =
                                getStockStatus(Number(e.target.value), updated[variantIndex].stock.threshold);
                              setProduct({ ...product, variants: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Low Stock Threshold</label>
                          <input type="number"
                            value={variant.stock.threshold}
                            onChange={e => {
                              const updated = [...product.variants];
                              updated[variantIndex].stock.threshold = Number(e.target.value);
                              updated[variantIndex].stock.status =
                                getStockStatus(updated[variantIndex].stock.quantity, Number(e.target.value));
                              setProduct({ ...product, variants: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Prices */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prices</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">3IN1</label>
                          <input type="number" value={variant.price['threeInOne']}
                            onChange={e => {
                              const updated = [...product.variants];
                              updated[variantIndex].price['threeInOne'] = Number(e.target.value);
                              setProduct({ ...product, variants: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">T&D</label>
                          <input type="number" value={variant.price['tAndD']}
                            onChange={e => {
                              const updated = [...product.variants];
                              updated[variantIndex].price['tAndD'] = Number(e.target.value);
                              setProduct({ ...product, variants: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Custom</label>
                          <input type="number" value={variant.price.custom}
                            onChange={e => {
                              const updated = [...product.variants];
                              updated[variantIndex].price.custom = Number(e.target.value);
                              setProduct({ ...product, variants: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Images (upload and preview) */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                      <div className="flex items-center">
                        <label className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                          <ImageIcon className="w-5 h-5 mr-2 text-gray-500" /> Upload Images
                          <input
                            type="file"
                            multiple
                            onChange={e => handleImageUpload(e, variantIndex)}
                            className="sr-only"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {variant.images.map((img, index) => {
                            const isFile = img instanceof File;
                            const imageUrl = isFile
                              ? URL.createObjectURL(img)
                              : typeof img === "string"
                                ? img
                                : img?.url;

                            return (
                              <div key={index} className="relative w-20 h-20">
                                <img
                                  src={imageUrl}
                                  alt="variant"
                                  className="w-full h-full object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(variantIndex, index)}
                                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* End modal fields */}
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              onClick={close}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >Cancel</button>
            <button
              onClick={submit}
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >{title.includes('Edit') ? 'Update' : 'Add'} Product</button>
          </div>
        </div>
      </div>
    </div>
  );
}
