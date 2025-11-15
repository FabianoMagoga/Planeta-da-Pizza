-- Tipo enum para categorias de produtos
CREATE TYPE categoria_produto AS ENUM ('Pizza Salgadas', 'Pizza Doces', 'Bebida');

-- Tipo enum para formas de pagamento
CREATE TYPE forma_pagamento AS ENUM ('Dinheiro', 'Credito', 'Debito', 'Pix', 'Vale refeicao', 'Alimentacao');

-- Tipo enum para modo de pedido
CREATE TYPE modo_pedido AS ENUM ('ENTREGA', 'RETIRADA');

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria categoria_produto NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  descontos DECIMAL(10,2) NOT NULL DEFAULT 0,
  promocoes_aplicadas TEXT[] DEFAULT ARRAY[]::TEXT[],
  taxa_entrega DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento forma_pagamento NOT NULL,
  modo modo_pedido NOT NULL,
  endereco JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE public.itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  qtd INTEGER NOT NULL CHECK (qtd > 0),
  nome_produto TEXT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  categoria categoria_produto NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar sequence para número de pedido
CREATE SEQUENCE pedido_numero_seq START 1;

-- Função para gerar próximo número de pedido
CREATE OR REPLACE FUNCTION next_pedido_numero()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1 INTO next_num FROM public.pedidos;
  RETURN next_num;
END;
$$;

-- Enable RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acesso público para sistema de pedidos online
-- (Vamos adicionar autenticação depois para área admin)

-- Clientes: todos podem ler e criar
CREATE POLICY "Todos podem visualizar clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Todos podem criar clientes" ON public.clientes FOR INSERT WITH CHECK (true);

-- Produtos: todos podem ler produtos ativos
CREATE POLICY "Todos podem visualizar produtos ativos" ON public.produtos FOR SELECT USING (ativo = true);
CREATE POLICY "Admins podem gerenciar produtos" ON public.produtos FOR ALL USING (true);

-- Pedidos: todos podem criar e visualizar seus pedidos
CREATE POLICY "Todos podem visualizar pedidos" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Todos podem criar pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);

-- Itens: seguem os pedidos
CREATE POLICY "Todos podem visualizar itens" ON public.itens_pedido FOR SELECT USING (true);
CREATE POLICY "Todos podem criar itens" ON public.itens_pedido FOR INSERT WITH CHECK (true);

-- Inserir produtos iniciais
INSERT INTO public.produtos (nome, categoria, preco, ativo) VALUES
-- Pizzas Salgadas
('4 Queijos', 'Pizza Salgadas', 47.90, true),
('5 Queijos', 'Pizza Salgadas', 47.90, true),
('Americana', 'Pizza Salgadas', 47.90, true),
('Atum', 'Pizza Salgadas', 47.90, true),
('Brócolis', 'Pizza Salgadas', 47.90, true),
('Calabresa', 'Pizza Salgadas', 42.90, true),
('Calabresa com Cheddar', 'Pizza Salgadas', 47.90, true),
('Calabresa com Queijo', 'Pizza Salgadas', 47.90, true),
('Chicago', 'Pizza Salgadas', 47.90, true),
('Doritos', 'Pizza Salgadas', 47.90, true),
('Frango com Bacon', 'Pizza Salgadas', 43.90, true),
('Frango com Catupiry', 'Pizza Salgadas', 47.90, true),
('Frango com Catupiry e Bacon', 'Pizza Salgadas', 50.90, true),
('Frango com Cheddar', 'Pizza Salgadas', 42.90, true),
('La Bonissima', 'Pizza Salgadas', 47.90, true),
('Moda da Casa', 'Pizza Salgadas', 54.90, true),
('Moda do Chefe', 'Pizza Salgadas', 49.90, true),
('Mussarela', 'Pizza Salgadas', 39.90, true),
('Portuguesa', 'Pizza Salgadas', 47.90, true),
('Strogonoff', 'Pizza Salgadas', 47.90, true),
('Toscana', 'Pizza Salgadas', 47.90, true),

-- Bebidas
('Água Mineral 500ml', 'Bebida', 4.00, true),
('Cerveja 600ml', 'Bebida', 12.50, true),
('Cerveja Lata', 'Bebida', 6.50, true),
('Cerveja Long Neck', 'Bebida', 8.50, true),
('Refrigerante 1L', 'Bebida', 12.00, true),
('Refrigerante 2L', 'Bebida', 14.00, true),
('Refrigerante 600ml', 'Bebida', 8.00, true),
('Refrigerante Lata', 'Bebida', 6.00, true),
('Suco 300ml - Sabores', 'Bebida', 7.50, true),

-- Pizzas Doces
('Pizza Doce (Banana Caramelizada)', 'Pizza Doces', 44.90, true),
('Pizza Doce (Beijinho)', 'Pizza Doces', 32.90, true),
('Pizza Doce (Chocolate)', 'Pizza Doces', 39.90, true),
('Pizza Doce (Chocolate com Banana)', 'Pizza Doces', 45.90, true),
('Pizza Doce (Chocolate com Morango)', 'Pizza Doces', 47.90, true),
('Pizza Doce (Confete)', 'Pizza Doces', 40.90, true),
('Pizza Doce (Cream Cookies)', 'Pizza Doces', 50.90, true),
('Pizza Doce (Doce de Leite)', 'Pizza Doces', 34.90, true),
('Pizza Doce (Prestigio)', 'Pizza Doces', 46.90, true),
('Pizza Doce (Romeu e Julieta)', 'Pizza Doces', 45.90, true);