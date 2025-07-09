import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get the best available image with fallback
  const getProductImage = () => {
    if (product.image_url && !imageError) {
      return product.image_url;
    }
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
        return firstImage;
      }
    }
    
    // Fallback to a reliable placeholder image
    return 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg';
  };

  return (
    <Link to={`/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
          {imageError ? (
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <p className="text-xs">No image</p>
            </div>
          ) : (
            <img
              src={getProductImage()}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">${product.price}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.compare_at_price}
                  </span>
                )}
              </div>
              {product.compare_at_price && (
                <Badge variant="secondary">
                  Save ${(product.compare_at_price - product.price).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            disabled={product.inventory_count === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.inventory_count === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}