import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        modo: "ENTREGA",
        formaPagamento: "Dinheiro",
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
    const handleSubmit = async (e) => {
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
            if (clienteError)
                throw clienteError;
            // Obter próximo número de pedido
            const { data: numeroData, error: numeroError } = await supabase
                .rpc("next_pedido_numero");
            if (numeroError)
                throw numeroError;
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
            if (pedidoError)
                throw pedidoError;
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
            if (itensError)
                throw itensError;
            toast({
                title: "Pedido realizado com sucesso!",
                description: `Seu pedido #${numeroData} foi registrado.`,
            });
            clearCart();
            navigate("/");
        }
        catch (error) {
            console.error("Erro ao criar pedido:", error);
            toast({
                title: "Erro",
                description: "Não foi possível finalizar o pedido.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen", children: [_jsx(Header, {}), _jsx("main", { className: "pt-24 pb-16", children: _jsxs("div", { className: "container mx-auto px-4 max-w-4xl", children: [_jsx("h1", { className: "text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-center", children: "Finalizar Pedido" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-8", children: [_jsx("div", { className: "md:col-span-2", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Dados Pessoais" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "nome", children: "Nome Completo" }), _jsx(Input, { id: "nome", required: true, value: formData.nome, onChange: (e) => setFormData({ ...formData, nome: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cpf", children: "CPF" }), _jsx(Input, { id: "cpf", required: true, value: formData.cpf, onChange: (e) => setFormData({ ...formData, cpf: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "telefone", children: "Telefone" }), _jsx(Input, { id: "telefone", required: true, value: formData.telefone, onChange: (e) => setFormData({ ...formData, telefone: e.target.value }) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Modo de Entrega" }) }), _jsx(CardContent, { children: _jsxs(RadioGroup, { value: formData.modo, onValueChange: (value) => {
                                                                console.log("Modo alterado para:", value);
                                                                setFormData({ ...formData, modo: value });
                                                            }, children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "ENTREGA", id: "entrega" }), _jsx(Label, { htmlFor: "entrega", children: "Entrega" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "RETIRADA", id: "retirada" }), _jsx(Label, { htmlFor: "retirada", children: "Retirada" })] })] }) })] }), formData.modo === "ENTREGA" && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Endere\u00E7o de Entrega" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "rua", children: "Rua" }), _jsx(Input, { id: "rua", required: true, value: formData.endereco.rua, onChange: (e) => setFormData({
                                                                            ...formData,
                                                                            endereco: { ...formData.endereco, rua: e.target.value },
                                                                        }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "numero", children: "N\u00FAmero" }), _jsx(Input, { id: "numero", required: true, value: formData.endereco.numero, onChange: (e) => setFormData({
                                                                                    ...formData,
                                                                                    endereco: { ...formData.endereco, numero: e.target.value },
                                                                                }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "bairro", children: "Bairro" }), _jsx(Input, { id: "bairro", required: true, value: formData.endereco.bairro, onChange: (e) => setFormData({
                                                                                    ...formData,
                                                                                    endereco: { ...formData.endereco, bairro: e.target.value },
                                                                                }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "cidade", children: "Cidade" }), _jsx(Input, { id: "cidade", required: true, value: formData.endereco.cidade, onChange: (e) => setFormData({
                                                                                    ...formData,
                                                                                    endereco: { ...formData.endereco, cidade: e.target.value },
                                                                                }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cep", children: "CEP" }), _jsx(Input, { id: "cep", required: true, value: formData.endereco.cep, onChange: (e) => setFormData({
                                                                                    ...formData,
                                                                                    endereco: { ...formData.endereco, cep: e.target.value },
                                                                                }) })] })] })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Forma de Pagamento" }) }), _jsx(CardContent, { children: _jsxs(RadioGroup, { value: formData.formaPagamento, onValueChange: (value) => {
                                                                console.log("Forma de pagamento alterada para:", value);
                                                                setFormData({ ...formData, formaPagamento: value });
                                                            }, children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "Dinheiro", id: "dinheiro" }), _jsx(Label, { htmlFor: "dinheiro", children: "Dinheiro" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "Pix", id: "pix" }), _jsx(Label, { htmlFor: "pix", children: "Pix" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "Credito", id: "credito" }), _jsx(Label, { htmlFor: "credito", children: "Cart\u00E3o de Cr\u00E9dito" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "Debito", id: "debito" }), _jsx(Label, { htmlFor: "debito", children: "Cart\u00E3o de D\u00E9bito" })] })] }) })] }), _jsx(Button, { type: "submit", className: "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90", size: "lg", disabled: loading, children: loading ? "Processando..." : "Confirmar Pedido" })] }) }), _jsx("div", { children: _jsxs(Card, { className: "sticky top-24", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Resumo do Pedido" }) }), _jsxs(CardContent, { className: "space-y-4", children: [items.map((item) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: [item.quantidade, "x ", item.nome] }), _jsxs("span", { className: "font-semibold", children: ["R$ ", (item.preco * item.quantidade).toFixed(2)] })] }, item.id))), _jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "flex justify-between text-xl font-bold", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { className: "text-primary", children: ["R$ ", total.toFixed(2)] })] }) })] })] }) })] })] }) }), _jsx(Footer, {})] }));
};
export default Checkout;
//# sourceMappingURL=Checkout.js.map