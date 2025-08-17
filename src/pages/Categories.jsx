import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined categories with images and descriptions
  const categoryDetails = {
    'electronics': {
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3',
      description: 'Latest gadgets and electronic devices'
    },
    'fashion': {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3',
      description: 'Trendy clothing and accessories'
    },
    'home-appliances': {
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3',
      description: 'Quality appliances for your home'
    },
    'smartphones': {
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?ixlib=rb-4.0.3',
      description: 'Latest smartphones and accessories'
    },
    'laptops': {
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3',
      description: 'Powerful laptops and notebooks'
    },
    'furniture': {
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?ixlib=rb-4.0.3',
      description: 'Stylish furniture for your home'
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await API.products.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await API.products.getByCategory(category);
      if (response.success) {
        // Make sure we're using the correct data structure
        const productsList = Array.isArray(response.data) ? response.data : 
                           Array.isArray(response.data.products) ? response.data.products : [];
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Shop by Categories</h1>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => (
          <div
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105 ${
              selectedCategory === category ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <img
              src={categoryDetails[category]?.image || `https://source.unsplash.com/800x600/?${category}`}
              alt={category}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
              <h3 className="text-xl font-semibold text-white capitalize">
                {typeof category === 'string' ? category.replace(/-/g, ' ') : category}
              </h3>
              <p className="text-sm text-gray-200">
                {categoryDetails[category]?.description || `Explore our ${typeof category === 'string' ? category.replace(/-/g, ' ') : category} collection`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      {selectedCategory && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 capitalize">
            {selectedCategory.replace('-', ' ')} Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
