import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    modo: "ENTREGA" as "ENTREGA" | "RETIRADA",
    formaPagamento: "Dinheiro" as "Dinheiro" | "Credito" | "Debito" | "Pix" | "Vale refeicao" | "Alimentacao",
    endereco: {
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      cep: "",
    },
  });

  if (items.length === 0) {
    navigate("/menu");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .insert({
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
        })
        .select()
        .single();

      if (clienteError) throw clienteError;

      // Obter próximo número de pedido
      const { data: numeroData, error: numeroError } = await supabase
        .rpc("next_pedido_numero");

      if (numeroError) throw numeroError;

      // Criar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          cliente_id: clienteData.id,
          numero: numeroData,
          subtotal: total,
          total: total,
          forma_pagamento: formData.formaPagamento,
          modo: formData.modo,
          endereco: formData.modo === "ENTREGA" ? formData.endereco : null,
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Criar itens do pedido
      const itensData = items.map((item) => ({
        pedido_id: pedidoData.id,
        produto_id: item.id,
        nome_produto: item.nome,
        categoria: item.categoria,
        preco_unitario: item.preco,
        qtd: item.quantidade,
      }));

      const { error: itensError } = await supabase
        .from("itens_pedido")
        .insert(itensData);

      if (itensError) throw itensError;

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${numeroData} foi registrado.`,
      });

      clearCart();
      navigate("/");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o pedido.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-center">
            Finalizar Pedido
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        required
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        required
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Modo de Entrega</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.modo}
                      onValueChange={(value) => {
                        console.log("Modo alterado para:", value);
                        setFormData({ ...formData, modo: value as "ENTREGA" | "RETIRADA" });
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ENTREGA" id="entrega" />
                        <Label htmlFor="entrega">Entrega</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="RETIRADA" id="retirada" />
                        <Label htmlFor="retirada">Retirada</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {formData.modo === "ENTREGA" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Endereço de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="rua">Rua</Label>
                        <Input
                          id="rua"
                          required
                          value={formData.endereco.rua}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: { ...formData.endereco, rua: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="numero">Número</Label>
                          <Input
                            id="numero"
                            required
                            value={formData.endereco.numero}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endereco: { ...formData.endereco, numero: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="bairro">Bairro</Label>
                          <Input
                            id="bairro"
                            required
                            value={formData.endereco.bairro}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endereco: { ...formData.endereco, bairro: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            required
                            value={formData.endereco.cidade}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endereco: { ...formData.endereco, cidade: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cep">CEP</Label>
                          <Input
                            id="cep"
                            required
                            value={formData.endereco.cep}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endereco: { ...formData.endereco, cep: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.formaPagamento}
                      onValueChange={(value) => {
                        console.log("Forma de pagamento alterada para:", value);
                        setFormData({ ...formData, formaPagamento: value as any });
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Dinheiro" id="dinheiro" />
                        <Label htmlFor="dinheiro">Dinheiro</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pix" id="pix" />
                        <Label htmlFor="pix">Pix</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Credito" id="credito" />
                        <Label htmlFor="credito">Cartão de Crédito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Debito" id="debito" />
                        <Label htmlFor="debito">Cartão de Débito</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Processando..." : "Confirmar Pedido"}
                </Button>
              </form>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantidade}x {item.nome}
                      </span>
                      <span className="font-semibold">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
