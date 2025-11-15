export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "13.0.5";
    };
    public: {
        Tables: {
            clientes: {
                Row: {
                    cpf: string;
                    created_at: string;
                    id: string;
                    nome: string;
                    telefone: string | null;
                };
                Insert: {
                    cpf: string;
                    created_at?: string;
                    id?: string;
                    nome: string;
                    telefone?: string | null;
                };
                Update: {
                    cpf?: string;
                    created_at?: string;
                    id?: string;
                    nome?: string;
                    telefone?: string | null;
                };
                Relationships: [];
            };
            itens_pedido: {
                Row: {
                    categoria: Database["public"]["Enums"]["categoria_produto"];
                    created_at: string;
                    id: string;
                    nome_produto: string;
                    pedido_id: string;
                    preco_unitario: number;
                    produto_id: string;
                    qtd: number;
                };
                Insert: {
                    categoria: Database["public"]["Enums"]["categoria_produto"];
                    created_at?: string;
                    id?: string;
                    nome_produto: string;
                    pedido_id: string;
                    preco_unitario: number;
                    produto_id: string;
                    qtd: number;
                };
                Update: {
                    categoria?: Database["public"]["Enums"]["categoria_produto"];
                    created_at?: string;
                    id?: string;
                    nome_produto?: string;
                    pedido_id?: string;
                    preco_unitario?: number;
                    produto_id?: string;
                    qtd?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "itens_pedido_pedido_id_fkey";
                        columns: ["pedido_id"];
                        isOneToOne: false;
                        referencedRelation: "pedidos";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "itens_pedido_produto_id_fkey";
                        columns: ["produto_id"];
                        isOneToOne: false;
                        referencedRelation: "produtos";
                        referencedColumns: ["id"];
                    }
                ];
            };
            pedidos: {
                Row: {
                    cliente_id: string | null;
                    created_at: string;
                    descontos: number;
                    endereco: Json | null;
                    forma_pagamento: Database["public"]["Enums"]["forma_pagamento"];
                    id: string;
                    modo: Database["public"]["Enums"]["modo_pedido"];
                    numero: number;
                    promocoes_aplicadas: string[] | null;
                    subtotal: number;
                    taxa_entrega: number;
                    total: number;
                };
                Insert: {
                    cliente_id?: string | null;
                    created_at?: string;
                    descontos?: number;
                    endereco?: Json | null;
                    forma_pagamento: Database["public"]["Enums"]["forma_pagamento"];
                    id?: string;
                    modo: Database["public"]["Enums"]["modo_pedido"];
                    numero: number;
                    promocoes_aplicadas?: string[] | null;
                    subtotal?: number;
                    taxa_entrega?: number;
                    total?: number;
                };
                Update: {
                    cliente_id?: string | null;
                    created_at?: string;
                    descontos?: number;
                    endereco?: Json | null;
                    forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"];
                    id?: string;
                    modo?: Database["public"]["Enums"]["modo_pedido"];
                    numero?: number;
                    promocoes_aplicadas?: string[] | null;
                    subtotal?: number;
                    taxa_entrega?: number;
                    total?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "pedidos_cliente_id_fkey";
                        columns: ["cliente_id"];
                        isOneToOne: false;
                        referencedRelation: "clientes";
                        referencedColumns: ["id"];
                    }
                ];
            };
            produtos: {
                Row: {
                    ativo: boolean;
                    categoria: Database["public"]["Enums"]["categoria_produto"];
                    created_at: string;
                    id: string;
                    nome: string;
                    preco: number;
                };
                Insert: {
                    ativo?: boolean;
                    categoria: Database["public"]["Enums"]["categoria_produto"];
                    created_at?: string;
                    id?: string;
                    nome: string;
                    preco: number;
                };
                Update: {
                    ativo?: boolean;
                    categoria?: Database["public"]["Enums"]["categoria_produto"];
                    created_at?: string;
                    id?: string;
                    nome?: string;
                    preco?: number;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            next_pedido_numero: {
                Args: never;
                Returns: number;
            };
        };
        Enums: {
            categoria_produto: "Pizza Salgadas" | "Pizza Doces" | "Bebida";
            forma_pagamento: "Dinheiro" | "Credito" | "Debito" | "Pix" | "Vale refeicao" | "Alimentacao";
            modo_pedido: "ENTREGA" | "RETIRADA";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof DatabaseWithoutInternals;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof DatabaseWithoutInternals;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export declare const Constants: {
    readonly public: {
        readonly Enums: {
            readonly categoria_produto: readonly ["Pizza Salgadas", "Pizza Doces", "Bebida"];
            readonly forma_pagamento: readonly ["Dinheiro", "Credito", "Debito", "Pix", "Vale refeicao", "Alimentacao"];
            readonly modo_pedido: readonly ["ENTREGA", "RETIRADA"];
        };
    };
};
export {};
//# sourceMappingURL=types.d.ts.map