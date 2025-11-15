import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pizza, Cake, Coffee } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
const ProductCard = ({ produto }) => {
    const { addItem } = useCart();
    const handleAddToCart = () => {
        console.log("Botão clicado - tentando adicionar produto:", produto);
        addItem(produto);
    };
    const getIcon = () => {
        switch (produto.categoria) {
            case "Pizza Salgadas":
                return _jsx(Pizza, { className: "h-12 w-12 text-primary" });
            case "Pizza Doces":
                return _jsx(Cake, { className: "h-12 w-12 text-accent" });
            case "Bebida":
                return _jsx(Coffee, { className: "h-12 w-12 text-secondary" });
            default:
                return _jsx(Pizza, { className: "h-12 w-12 text-primary" });
        }
    };
    return (_jsxs(Card, { className: "group hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20", children: [_jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col items-center text-center space-y-4", children: [_jsx("div", { className: "p-4 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors", children: getIcon() }), _jsx("h3", { className: "text-xl font-semibold text-foreground group-hover:text-primary transition-colors", children: produto.nome })] }) }), _jsxs(CardFooter, { className: "flex flex-col items-center space-y-3", children: [_jsxs("div", { className: "text-3xl font-bold text-primary", children: ["R$ ", produto.preco.toFixed(2)] }), _jsx(Button, { className: "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity", size: "lg", onClick: handleAddToCart, children: "Adicionar ao Pedido" })] })] }));
};
export default ProductCard;
//# sourceMappingURL=ProductCard.js.map