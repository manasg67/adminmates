import { Star, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  badge?: "best-seller" | "new" | "sale"
}

export function ProductCard({
  name,
  description,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  badge,
}: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      {badge && (
        <Badge
          className={`absolute right-2 top-2 z-10 ${
            badge === "best-seller"
              ? "bg-accent text-accent-foreground"
              : badge === "new"
                ? "bg-secondary text-secondary-foreground"
                : "bg-destructive text-destructive-foreground"
          }`}
        >
          {badge === "best-seller" ? "Best Seller" : badge === "new" ? "New Arrival" : "Sale"}
        </Badge>
      )}

      <CardContent className="p-4">
        <div className="aspect-square relative bg-muted rounded-lg mb-3 overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">({reviewCount})</span>
        </div>

        <h3 className="font-semibold text-foreground mb-1 line-clamp-2 leading-tight">{name}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">{description}</p>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
