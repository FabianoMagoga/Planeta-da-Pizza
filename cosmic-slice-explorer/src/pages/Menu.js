import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
const Menu = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    useEffect(() => {
        fetchProdutos();
    }, []);
    const fetchProdutos = async () => {
        try {
            const { data, error } = await supabase
                .from("produtos")
                .select("*")
                .eq("ativo", true)
                .order("categoria", { ascending: true })
                .order("nome", { ascending: true });
            if (error)
                throw error;
            setProdutos(data || []);
        }
        catch (error) {
            console.error("Erro ao buscar produtos:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os produtos.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const categorias = ["Pizza Salgadas", "Pizza Doces", "Bebida"];
    const getProdutosPorCategoria = (categoria) => {
        return produtos.filter((p) => p.categoria === categoria);
    };
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(Header, {}), _jsx("main", { className: "pt-24 pb-16", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent", children: "Nosso Card\u00E1pio" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Explore nossos deliciosos sabores c\u00F3smicos" })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" }), _jsx("p", { className: "mt-4 text-muted-foreground", children: "Carregando produtos..." })] })) : (_jsx("div", { className: "space-y-16", children: categorias.map((categoria) => {
                                const produtosCategoria = getProdutosPorCategoria(categoria);
                                if (produtosCategoria.length === 0)
                                    return null;
                                return (_jsxs("section", { children: [_jsx("h2", { className: "text-3xl font-bold mb-8 text-center", children: _jsx("span", { className: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent", children: categoria }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: produtosCategoria.map((produto) => (_jsx(ProductCard, { produto: produto }, produto.id))) })] }, categoria));
                            }) }))] }) }), _jsx(Footer, {})] }));
};
export default Menu;
//# sourceMappingURL=Menu.js.map