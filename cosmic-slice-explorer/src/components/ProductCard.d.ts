type Produto = {
    id: string;
    nome: string;
    categoria: "Pizza Salgadas" | "Pizza Doces" | "Bebida";
    preco: number;
};
interface ProductCardProps {
    produto: Produto;
}
declare const ProductCard: ({ produto }: ProductCardProps) => any;
export default ProductCard;
//# sourceMappingURL=ProductCard.d.ts.map