const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto text-center">
        <div className="mb-6">
          <h3 className="text-3xl font-bold mb-2 text-primary">Universo da Pizza</h3>
          <p className="text-muted-foreground">
            Em cada fatia, uma viagem. Em cada mordida, uma nova constelação de sabores.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-foreground/80 leading-relaxed">
            Porque aqui, no Universo da Pizza, não há limite para a imaginação — nem para o apetite! 🌌🍕
          </p>
        </div>
        
        <div className="flex justify-center gap-6 mb-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Cardápio</a>
          <span>•</span>
          <a href="#" className="hover:text-primary transition-colors">Promoções</a>
          <span>•</span>
          <a href="#" className="hover:text-primary transition-colors">Contato</a>
          <span>•</span>
          <a href="#" className="hover:text-primary transition-colors">Delivery</a>
        </div>
        
        <div className="text-sm text-muted-foreground">
          © 2024 Universo da Pizza. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
