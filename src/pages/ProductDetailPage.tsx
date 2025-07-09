import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, Product } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
      setImageError(false);
    } catch (error: any) {
      setError('Product not found');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      addItem(product, quantity);
      // Show success feedback
      setTimeout(() => setAddingToCart(false), 1000);
    } catch (error) {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get product images with proper fallback
  const getProductImages = () => {
    const images: string[] = [];
    
    // First, try to get images from the images array
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      images.push(...product.images.filter(img => typeof img === 'string' && img.trim() !== ''));
    }
    
    // Then, add the main image_url if it exists and isn't already in the array
    if (product?.image_url && !images.includes(product.image_url)) {
      images.unshift(product.image_url);
    }
    
    // If no images found, use placeholder
    if (images.length === 0) {
      images.push('https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg');
    }
    
    return images;
  };

  const images = getProductImages();

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
    setImageError(false);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    setImageError(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-foreground">Products</Link>
          {product.categories && (
            <>
              <span className="mx-2">/</span>
              <span className="hover:text-foreground">{product.categories.name}</span>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50 flex items-center justify-center">
            {imageError ? (
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm">Image not available</p>
              </div>
            ) : (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                onError={handleImageError}
                onLoad={() => setImageError(false)}
              />
            )}
            
            {/* Navigation arrows for multiple images */}
            {images.length > 1 && !imageError && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setImageError(false);
                  }}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors bg-gray-50 ${
                    selectedImage === index ? 'border-primary' : 'border-muted'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="text-center text-sm text-muted-foreground">
              {selectedImage + 1} of {images.length}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.categories && (
                <Badge variant="secondary">{product.categories.name}</Badge>
              )}
              {product.inventory_count <= 5 && product.inventory_count > 0 && (
                <Badge variant="destructive">Only {product.inventory_count} left!</Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(4.8) 124 reviews</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.compare_at_price}
                  </span>
                  <Badge className="bg-red-100 text-red-800">
                    Save {discountPercentage}%
                  </Badge>
                </>
              )}
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.inventory_count, quantity + 1))}
                  disabled={quantity >= product.inventory_count}
                >
                  +
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.inventory_count} available
              </span>
            </div>

            {product.inventory_count === 0 ? (
              <Alert>
                <AlertDescription>
                  This product is currently out of stock.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1"
                  variant="outline"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {addingToCart ? 'Added!' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <Separator />

          {/* Product Features */}
          <div className="space-y-4">
            <h3 className="font-semibold">Why Choose This Product?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Free Shipping</h4>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Secure Payment</h4>
                  <p className="text-xs text-muted-foreground">100% secure checkout</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <RotateCcw className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Easy Returns</h4>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">SKU:</span>
                <span className="ml-2">{product.sku || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2">{product.categories?.name || 'Uncategorized'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Availability:</span>
                <span className="ml-2">
                  {product.inventory_count > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Added:</span>
                <span className="ml-2">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
        <div className="text-center py-8 text-muted-foreground">
          Related products will be displayed here
        </div>
      </div>
    </div>
  );
}