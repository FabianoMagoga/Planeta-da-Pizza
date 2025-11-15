import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

type Produto = {
  id: string;
  nome: string;
  categoria: "Pizza Salgadas" | "Pizza Doces" | "Bebida";
  preco: number;
  ativo: boolean;
};

const Menu = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
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

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categorias = ["Pizza Salgadas", "Pizza Doces", "Bebida"];

  const getProdutosPorCategoria = (categoria: string) => {
    return produtos.filter((p) => p.categoria === categoria);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Nosso Cardápio
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore nossos deliciosos sabores cósmicos
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {categorias.map((categoria) => {
                const produtosCategoria = getProdutosPorCategoria(categoria);
                if (produtosCategoria.length === 0) return null;

                return (
                  <section key={categoria}>
                    <h2 className="text-3xl font-bold mb-8 text-center">
                      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {categoria}
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {produtosCategoria.map((produto) => (
                        <ProductCard key={produto.id} produto={produto} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Menu;
