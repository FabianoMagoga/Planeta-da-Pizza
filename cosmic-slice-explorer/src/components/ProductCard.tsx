import { Pizza, Cake, Coffee } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

type Produto = {
  id: string;
  nome: string;
  categoria: "Pizza Salgadas" | "Pizza Doces" | "Bebida";
  preco: number;
};

interface ProductCardProps {
  produto: Produto;
}

const ProductCard = ({ produto }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    console.log("Botão clicado - tentando adicionar produto:", produto);
    addItem(produto);
  };

  const getIcon = () => {
    switch (produto.categoria) {
      case "Pizza Salgadas":
        return <Pizza className="h-12 w-12 text-primary" />;
      case "Pizza Doces":
        return <Cake className="h-12 w-12 text-accent" />;
      case "Bebida":
        return <Coffee className="h-12 w-12 text-secondary" />;
      default:
        return <Pizza className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <Card className="group hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
            {getIcon()}
          </div>
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {produto.nome}
          </h3>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-3">
        <div className="text-3xl font-bold text-primary">
          R$ {produto.preco.toFixed(2)}
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          size="lg"
          onClick={handleAddToCart}
        >
          Adicionar ao Pedido
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
