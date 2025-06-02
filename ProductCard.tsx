import { Plus } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { useCart } from "./CartContext";
import { ProductWithCategory } from "./schema";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-square w-full overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl || "/api/placeholder/300/300"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {product.name}
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="text-xl font-bold text-red-600 dark:text-red-400">
          ₦{Number(product.price).toLocaleString()}
        </span>
        <Button
          onClick={handleAddToCart}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}