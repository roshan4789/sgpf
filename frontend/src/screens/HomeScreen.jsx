import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading Products...</div>;

  return (
    <div className="container mx-auto p-4 mt-5">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Latest Products</h1>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            
            {/* Clickable Image */}
            <Link to={`/product/${product._id}`}>
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover object-center"
              />
            </Link>

            <div className="p-4">
              <Link to={`/product/${product._id}`}>
                <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 truncate">
                  {product.name}
                </h2>
              </Link>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                {product.countInStock > 0 ? (
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-green-600 bg-green-200">
                      In Stock
                    </span>
                ) : (
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-red-600 bg-red-200">
                      Out of Stock
                    </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;