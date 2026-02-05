import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ShoppingCart,
    Heart,
    Star,
    ShieldCheck,
    Truck,
    RefreshCcw,
    MapPin,
    Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { getProductById } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const result = await getProductById(id);
                if (result.success) {
                    setProduct(result.data);
                } else {
                    toast.error('Product not found');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!product) return null;

    const imageUrl = (() => {
        if (!product.image) return '/placeholder.jpg';
        if (product.image.startsWith('http')) return product.image;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001';
        const imagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
        return `${baseUrl}${imagePath}`;
    })();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-green-600 mb-8 transition-colors group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Products</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm"
                >
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 flex gap-2">
                        <Badge className="bg-white/90 text-green-700 backdrop-blur-sm border-0 shadow-sm px-3 py-1">
                            {product.category}
                        </Badge>
                        <Badge className="bg-green-600 text-white border-0 shadow-sm px-3 py-1">
                            {product.grade}
                        </Badge>
                    </div>
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col"
                >
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < (product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                                <span className="ml-2 text-sm font-medium text-gray-500">({product.rating || 4.5} Rating)</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Package className="w-4 h-4" />
                                <span>{product.stock} {product.unit || 'kg'} in stock</span>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{formatPrice(product.price)}</p>
                        {product.originalPrice > product.price && (
                            <p className="text-lg text-gray-400 line-through mt-1">{formatPrice(product.originalPrice)}</p>
                        )}
                    </div>

                    <Separator className="mb-8" />

                    <div className="space-y-6 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || 'Experience the premium quality and freshness of our hand-picked grapes. These grapes are carefully selected for their sweetness, texture, and vibrant color, ensuring you get the best nature has to offer.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Origin</p>
                                    <p className="text-sm font-bold text-gray-900">{product.origin || 'Nashik, Maharashtra'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Quality</p>
                                    <p className="text-sm font-bold text-gray-900">{product.grade} Export Grade</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features/Highlights */}
                    {product.features && product.features.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Highlights</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 rounded-xl h-12">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 text-gray-500 hover:text-green-600 font-bold transition-colors"
                                >-</button>
                                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 text-gray-500 hover:text-green-600 font-bold transition-colors"
                                >+</button>
                            </div>
                            <Button
                                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-lg rounded-xl shadow-lg shadow-green-100"
                                onClick={() => addToCart({ ...product, quantity })}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 w-12 rounded-xl p-0"
                                onClick={() => toggleWishlist(product.id || product._id)}
                            >
                                <Heart className={`w-6 h-6 ${isInWishlist(product.id || product._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </Button>
                        </div>

                        {/* Badges/Info */}
                        <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <Truck className="w-4 h-4 text-green-600" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <RefreshCcw className="w-4 h-4 text-green-600" />
                                <span>Easy Returns</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span>Quality Assured</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
