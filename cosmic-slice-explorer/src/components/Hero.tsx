import { Button } from "@/components/ui/button";
import heroCosmic from "@/assets/hero-cosmic-pizza.jpg";

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background stars effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(250_60%_25%_/_0.3)_0%,_transparent_70%)]" />
      
      {/* Hero image */}
      <div className="absolute inset-0 opacity-30">
        <img 
          src={heroCosmic} 
          alt="Pizza cósmica" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-slow">
            Universo da Pizza
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-foreground/90 leading-relaxed">
            Aqui, o sabor é tão grande quanto o próprio cosmos.
          </p>
          
          <p className="text-lg md:text-xl mb-12 text-muted-foreground max-w-3xl mx-auto">
            No centro do nosso universo está o <span className="text-primary font-semibold">Sol</span>, 
            o coração do menu, irradiando calor, energia e muitas delícias. 
            Ao redor dele, orbitam os planetas — cada um com uma experiência única para o seu paladar.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 glow-sun bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            Explorar o Menu
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
