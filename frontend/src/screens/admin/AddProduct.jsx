import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  // 1. State for form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(''); // Stores the URL from Cloudinary
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false); // Shows "Uploading..." spinner

  // 2. Image Upload Handler (Crucial for Speed)
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // NOTE: You need a separate backend route '/api/upload' that handles 
      // the actual Cloudinary upload and returns the URL. 
      // Alternatively, you can upload directly to Cloudinary from here (Unsigned Upload).
      const { data } = await axios.post('/api/upload', formData, config);

      setImage(data); // Set the returned Cloudinary URL
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert('Image upload failed!');
    }
  };

  // 3. Final Form Submission
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${userInfo.token}`, // Add this when you implement Auth
        },
      };

      await axios.post(
        '/api/products',
        { name, price, image, category, description },
        config
      );

      alert('Product Added Successfully!');
      // Optional: Redirect to product list
      // navigate('/admin/productlist'); 
      
    } catch (error) {
      alert('Error creating product');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
      
      <form onSubmit={submitHandler} className="space-y-4">
        
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            placeholder="Enter product name"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
          <input
            type="number"
            placeholder="Enter price"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <div className="flex items-center gap-4 mt-1">
            <input
              type="text"
              placeholder="Image URL"
              className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-100"
              value={image}
              readOnly
            />
            <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition">
              <span>Choose File</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={uploadFileHandler} 
              />
            </label>
          </div>
          {uploading && <p className="text-sm text-blue-500 mt-1">Uploading image...</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            placeholder="Electronics, Clothing, etc."
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            placeholder="Enter product description"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Create Product
        </button>

      </form>
    </div>
  );
};

export default AddProduct;