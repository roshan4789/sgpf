import React, { useState } from 'react';
import api from '../../services/api';

const AddProduct = () => {
  // 1. State for form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(''); // Stores the URL from Cloudinary
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false); // Shows "Uploading..." spinner

  // 2. Image Upload Handler (Enhanced with validation and error handling)
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert('Please select a file');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await api.post(`/upload`, formData, config);

      // Handle both old string format and new object format
      const imagePath = typeof data === 'string' ? data : (data.path || data.url || data);
      let fullImageUrl;

      if (imagePath.startsWith('http')) {
        fullImageUrl = imagePath;
      } else {
        // Assume relative path works or backend returns correct relative path
        // If path starts with /, it's relative to root.
        fullImageUrl = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      }

      setImage(fullImageUrl);
      alert('Image uploaded successfully!');
      console.log('Upload successful:', fullImageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Image upload failed!';
      alert(errorMessage);
    } finally {
      setUploading(false);
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

      await api.post(
        '/products',
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
          <div className="space-y-3 mt-1">
            {/* Image Preview */}
            {image && (
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={image}
                  alt="Product preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    console.error('Image failed to load:', image);
                    e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                  }}
                />
                <span className="text-sm text-green-600 font-medium">✓ Image uploaded</span>
              </div>
            )}

            {/* Upload Controls */}
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Image URL"
                className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                <span>Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={uploadFileHandler}
                  accept="image/*"
                />
              </label>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-blue-500 mt-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Uploading image...
              </div>
            )}
          </div>
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