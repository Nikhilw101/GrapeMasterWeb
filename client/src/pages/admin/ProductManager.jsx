import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Eye,
    EyeOff,
    Loader,
    Image as ImageIcon,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    bulkDeleteProducts,
    bulkUpdateProducts
} from '@/services/admin.service';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'Red',
        image: '',
        stock: '',
        unit: 'kg',
        origin: 'Nashik',
        grade: 'A+',
        features: []
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const result = await getProducts(true);
            if (result.success) {
                setProducts(result.data);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: parseFloat(formData.originalPrice) || 0,
                stock: parseInt(formData.stock),
                isActive: true
            };

            if (editingProduct) {
                const result = await updateProduct(editingProduct._id, payload);
                if (result.success) {
                    toast.success('Product updated successfully');
                    fetchProducts();
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                }
            } else {
                const result = await createProduct(payload);
                if (result.success) {
                    toast.success('Product created successfully');
                    fetchProducts();
                    setIsAddModalOpen(false);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const result = await deleteProduct(id);
            if (result.success) {
                toast.success('Product deleted successfully');
                fetchProducts();
            }
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const result = await toggleProductStatus(id);
            if (result.success) {
                toast.success('Product status updated');
                fetchProducts();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };


    const toggleSelection = (id) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(pid => pid !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedProducts.length === 0) return;

        if (!window.confirm(`Are you sure you want to ${action} ${selectedProducts.length} items?`)) return;

        try {
            setIsLoading(true);
            let result;
            if (action === 'delete') {
                result = await bulkDeleteProducts(selectedProducts);
            } else {
                result = await bulkUpdateProducts(selectedProducts, action);
            }

            if (result.success) {
                toast.success(`Bulk ${action} successful`);
                fetchProducts();
                setSelectedProducts([]);
                setIsSelectionMode(false);
            }
        } catch (error) {
            toast.error(`Bulk ${action} failed`);
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            image: product.image,
            stock: product.stock,
            unit: product.unit,
            origin: product.origin || 'Nashik',
            grade: product.grade || 'A+',
            features: product.features || []
        });
        setIsAddModalOpen(true);
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            category: 'Red',
            image: '',
            stock: '',
            unit: 'kg',
            origin: 'Nashik',
            grade: 'A+',
            features: []
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500">Manage your product inventory</p>
                </div>
                <div className="flex gap-2">
                    {isSelectionMode ? (
                        <>
                            <Button variant="outline" onClick={() => {
                                setIsSelectionMode(false);
                                setSelectedProducts([]);
                            }}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={selectedProducts.length === 0}
                                onClick={() => handleBulkAction('delete')}
                            >
                                Delete ({selectedProducts.length})
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={selectedProducts.length === 0}
                                onClick={() => handleBulkAction('activate')}
                            >
                                Activate
                            </Button>
                            <Button
                                className="bg-gray-600 hover:bg-gray-700"
                                disabled={selectedProducts.length === 0}
                                onClick={() => handleBulkAction('deactivate')}
                            >
                                Deactivate
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                            Select Items
                        </Button>
                    )}
                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Red">Red</option>
                                            <option value="Green">Green</option>
                                            <option value="Black">Black</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Grade</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                        >
                                            <option value="A++">A++ (Premium)</option>
                                            <option value="A+">A+ (Export)</option>
                                            <option value="A">A (Standard)</option>
                                            <option value="B">B (Economy)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Origin</label>
                                        <Input
                                            value={formData.origin}
                                            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                            placeholder="e.g. Nashik"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Original Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Stock</label>
                                        <Input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Unit</label>
                                        <Input
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="e.g. kg, pack"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product Image</label>
                                    <div className="space-y-3">
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(url) => setFormData({ ...formData, image: url })}
                                        />
                                        {/* Fallback URL input */}
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-xs">OR</span>
                                            </div>
                                            <Input
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="Paste image URL directly..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : (editingProduct ? 'Update Product' : 'Create Product')}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search products..."
                    className="border-0 focus-visible:ring-0 px-0 text-base"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layout
                            className={`bg-white rounded-xl border ${product.isActive ? 'border-gray-100' : 'border-red-100 bg-red-50/30'} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group`}
                        >
                            <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={(() => {
                                            if (!product.image) return '/placeholder.jpg';
                                            if (product.image.startsWith('http')) return product.image;
                                            const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001';
                                            const imagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
                                            return `${baseUrl}${imagePath}`;
                                        })()}
                                        alt={product.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/400x400?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Selection Overlay */}
                                {isSelectionMode && (
                                    <div className="absolute top-3 left-3 z-10">
                                        <div
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${selectedProducts.includes(product._id) ? 'bg-green-600 border-green-600 shadow-sm' : 'bg-white/90 border-gray-300 backdrop-blur-sm'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(product._id);
                                            }}
                                        >
                                            {selectedProducts.includes(product._id) && <div className="w-2.5 h-2.5 bg-white rounded-[2px]" />}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white border-0">
                                                <MoreVertical className="w-4 h-4 text-gray-700" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => openEditModal(product)} className="cursor-pointer">
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(product._id)} className="cursor-pointer">
                                                {product.isActive ? (
                                                    <>
                                                        <EyeOff className="w-4 h-4 mr-2" /> Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4 mr-2" /> Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600" onClick={() => handleDelete(product._id)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Badges */}
                                <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                                    {!product.isActive && (
                                        <span className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            Inactive
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${product.grade.includes('A') ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-white'}`}>
                                        {product.grade}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start gap-3 mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 leading-tight text-base mb-1" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{product.category} • {product.origin}</p>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <span className="block font-bold text-green-700 text-lg">₹{product.price}</span>
                                        {product.originalPrice > product.price && (
                                            <span className="block text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50 mt-3">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                        <Package className="w-3.5 h-3.5 text-gray-600" />
                                        <span className="font-medium text-gray-700">{product.stock} {product.unit}</span>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${product.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {product.stock === 0 ? 'Out of Stock' : (product.stock < 10 ? 'Low Stock' : 'In Stock')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No products found</p>
                </div>
            )}
        </div>
    );
}
