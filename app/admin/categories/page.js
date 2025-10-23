"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { CldImage } from 'next-cloudinary';
import withAdminAuth from '../../components/withAdminAuth';

function CategoriesAdmin() {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        sortOrder: 0,
        isActive: true
    });
    const [subcategoryFormData, setSubcategoryFormData] = useState({
        name: '',
        description: '',
        image: '',
        categoryId: '',
        order: 0,
        isActive: true
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const response = await fetch('/api/subcategories?includeInactive=true');
            if (response.ok) {
                const data = await response.json();
                setSubcategories(data.subcategories || []);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const handleSubmitSubcategory = async (e) => {
        e.preventDefault();
        
        if (!subcategoryFormData.name || !subcategoryFormData.categoryId) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Upload image if new file is selected
            let imageUrl = subcategoryFormData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    return;
                }
            }

            const subcategoryData = {
                ...subcategoryFormData,
                image: imageUrl
            };
            
            const url = editingSubcategory 
                ? `/api/subcategories/${editingSubcategory._id}` 
                : '/api/subcategories';
            
            const method = editingSubcategory ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subcategoryData),
            });

            if (response.ok) {
                await fetchSubcategories();
                resetSubcategoryForm();
                setShowSubcategoryForm(false);
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to save subcategory');
            }
        } catch (error) {
            console.error('Error saving subcategory:', error);
            setError('Failed to save subcategory: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubcategory = (subcategory) => {
        setEditingSubcategory(subcategory);
        setSubcategoryFormData({
            name: subcategory.name,
            description: subcategory.description || '',
            image: subcategory.image || '',
            categoryId: subcategory.category._id || subcategory.category,
            order: subcategory.order || 0,
            isActive: subcategory.isActive
        });
        setImageFile(null);
        setImagePreview('');
        setShowSubcategoryForm(true);
    };

    const handleDeleteSubcategory = async (subcategory) => {
        if (!confirm(`Are you sure you want to delete "${subcategory.name}"?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/subcategories/${subcategory._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchSubcategories();
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete subcategory');
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            setError('Failed to delete subcategory');
        } finally {
            setLoading(false);
        }
    };

    const resetSubcategoryForm = () => {
        setSubcategoryFormData({
            name: '',
            description: '',
            image: '',
            categoryId: '',
            order: 0,
            isActive: true
        });
        setEditingSubcategory(null);
        setImageFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.image && !imageFile) {
            setError('Please select an image for the category');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Upload image if new file is selected
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    return; // uploadImage already set error
                }
            }

            const categoryData = {
                ...formData,
                image: imageUrl
            };
            
            const url = editingCategory 
                ? `/api/categories/${editingCategory.slug}` 
                : '/api/categories';
            
            const method = editingCategory ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });

            if (response.ok) {
                await fetchCategories();
                resetForm();
                setShowForm(false);
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            setError('Failed to save category: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            image: category.image,
            sortOrder: category.sortOrder,
            isActive: category.isActive
        });
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    const handleDelete = async (category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/categories/${category.slug}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchCategories();
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: '',
            sortOrder: 0,
            isActive: true
        });
        setEditingCategory(null);
        setImageFile(null);
        setImagePreview('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }

            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            return result.imageUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Failed to upload image: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Categories & Subcategories</h1>
                        <p className="text-gray-600">Manage product categories and subcategories</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'subcategories' && (
                            <button
                                onClick={() => {
                                    resetSubcategoryForm();
                                    setShowSubcategoryForm(true);
                                }}
                                className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                            >
                                Add Subcategory
                            </button>
                        )}
                        {activeTab === 'categories' && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                            >
                                Add Category
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'categories'
                                    ? 'border-[#8B6B4C] text-[#8B6B4C]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Categories ({categories.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('subcategories')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'subcategories'
                                    ? 'border-[#8B6B4C] text-[#8B6B4C]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Subcategories ({subcategories.length})
                        </button>
                    </nav>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Category Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                                    </h2>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            placeholder="e.g., Diamond Rings"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            placeholder="Brief description of this category"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Image *
                                        </label>
                                        
                                        {/* Image Preview */}
                                        {(imagePreview || formData.image) && (
                                            <div className="mb-3">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Category preview"
                                                        className="w-48 h-36 object-cover rounded-lg border"
                                                    />
                                                ) : (
                                                    <CldImage
                                                        src={formData.image}
                                                        width={192}
                                                        height={144}
                                                        alt="Category preview"
                                                        className="rounded-lg object-cover border"
                                                    />
                                                )}
                                                <div className="mt-2 space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageFile(null);
                                                            setImagePreview('');
                                                            setFormData({ ...formData, image: '' });
                                                        }}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* File Input */}
                                        <div className="mt-2">
                                            <input
                                                type="file"
                                                id="categoryImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="categoryImage"
                                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B6B4C]"
                                            >
                                                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                {imageFile || formData.image ? 'Change Image' : 'Select Image'}
                                            </label>
                                            <p className="mt-1 text-sm text-gray-500">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sort Order
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.sortOrder}
                                            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                                        />
                                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || uploadingImage}
                                            className="flex-1 py-2 px-4 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subcategory Form Modal */}
                {showSubcategoryForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                                    </h2>
                                    <button
                                        onClick={() => setShowSubcategoryForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitSubcategory} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parent Category *
                                        </label>
                                        <select
                                            value={subcategoryFormData.categoryId}
                                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.filter(cat => cat.isActive).map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subcategory Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={subcategoryFormData.name}
                                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            placeholder="e.g., Engagement Rings"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={subcategoryFormData.description}
                                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                                            rows="3"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            placeholder="Brief description of this subcategory"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subcategory Image
                                        </label>
                                        
                                        {(imagePreview || subcategoryFormData.image) && (
                                            <div className="mb-3">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Subcategory preview"
                                                        className="w-48 h-36 object-cover rounded-lg border"
                                                    />
                                                ) : subcategoryFormData.image ? (
                                                    <CldImage
                                                        src={subcategoryFormData.image}
                                                        width={192}
                                                        height={144}
                                                        alt="Subcategory preview"
                                                        className="rounded-lg object-cover border"
                                                    />
                                                ) : null}
                                                <div className="mt-2 space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageFile(null);
                                                            setImagePreview('');
                                                            setSubcategoryFormData({ ...subcategoryFormData, image: '' });
                                                        }}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <input
                                                type="file"
                                                id="subcategoryImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="subcategoryImage"
                                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                {imageFile || subcategoryFormData.image ? 'Change Image' : 'Select Image'}
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sort Order
                                        </label>
                                        <input
                                            type="number"
                                            value={subcategoryFormData.order}
                                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, order: parseInt(e.target.value) || 0 })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="subcategoryActive"
                                            checked={subcategoryFormData.isActive}
                                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                                        />
                                        <label htmlFor="subcategoryActive" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || uploadingImage}
                                            className="flex-1 py-2 px-4 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Saving...' : (editingSubcategory ? 'Update' : 'Create')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowSubcategoryForm(false)}
                                            className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                {activeTab === 'categories' && (loading && !showForm ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {categories.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                                <p className="text-gray-500 mb-4">Get started by creating your first category</p>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(true);
                                    }}
                                    className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                                >
                                    Add First Category
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Products
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <CldImage
                                                            src={category.image}
                                                            width={48}
                                                            height={48}
                                                            alt={category.name}
                                                            className="rounded-lg object-cover mr-4"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {category.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Sort: {category.sortOrder}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {category.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {category.productsCount || 0} products
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        category.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-[#8B6B4C] hover:text-[#7A5D42] mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {/* Subcategories List */}
                {activeTab === 'subcategories' && (loading && !showSubcategoryForm ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {subcategories.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories yet</h3>
                                <p className="text-gray-500 mb-4">Create your first subcategory to organize products better</p>
                                <button
                                    onClick={() => {
                                        resetSubcategoryForm();
                                        setShowSubcategoryForm(true);
                                    }}
                                    className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                                >
                                    Add First Subcategory
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subcategory
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Parent Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {subcategories.map((subcategory) => (
                                            <tr key={subcategory._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {subcategory.image && (
                                                            <CldImage
                                                                src={subcategory.image}
                                                                width={48}
                                                                height={48}
                                                                alt={subcategory.name}
                                                                className="rounded-lg object-cover mr-4"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {subcategory.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Order: {subcategory.order}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {subcategory.category?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                                        {subcategory.description || 'No description'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        subcategory.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {subcategory.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEditSubcategory(subcategory)}
                                                        className="text-[#8B6B4C] hover:text-[#7A5D42] mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubcategory(subcategory)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

export default withAdminAuth(CategoriesAdmin);