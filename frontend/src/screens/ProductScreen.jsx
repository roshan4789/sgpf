import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductScreen = () => {
  const { id } = useParams(); // Get the ID from the URL (e.g., /product/123)
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch Product Details on Load
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. The Razorpay Payment Handler
  const checkoutHandler = async () => {
    try {
      // A. Create Order on Backend
      const { data: { data: order } } = await axios.post("/api/payment/orders", {
        amount: product.price, // Send the product price
      });

      // B. Configure Razorpay Options
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID_HERE", // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "My E-Commerce Store",
        description: `Purchase of ${product.name}`,
        image: "https://your-logo-url.com/logo.png",
        order_id: order.id, 
        handler: async function (response) {
          // C. Verify Payment on Backend
          try {
            const verifyUrl = "/api/payment/verify";
            const { data } = await axios.post(verifyUrl, response);
            alert("Payment Successful! Order Placed.");
            // Here you would typically save the order to your 'Orders' database
          } catch (error) {
            alert("Payment verification failed");
          }
        },
        theme: {
          color: "#2563EB", // Matches the Tailwind Blue button
        },
      };

      // C. Open the Popup
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with the payment.");
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl">Loading Product...</div>;

  return (
    <div className="container mx-auto mt-10 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Image */}
        <div className="flex justify-center items-start">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full max-w-lg rounded-lg shadow-lg object-cover" 
          />
        </div>

        {/* Right Column: Details & Action */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="border-b pb-4">
            <p className="text-gray-600 text-lg">Category: {product.category}</p>
            <p className="text-gray-500 mt-4">{product.description}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 text-lg font-semibold">Price:</span>
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-700 text-lg font-semibold">Status:</span>
              <span className={`text-lg font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={checkoutHandler}
              disabled={product.countInStock === 0}
              className={`w-full py-4 rounded-lg text-white font-bold text-lg transition duration-300 
                ${product.countInStock > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {product.countInStock > 0 ? 'BUY NOW' : 'OUT OF STOCK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;