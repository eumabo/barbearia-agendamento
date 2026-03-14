import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBook: () => void;
}

const HeroSection = ({ onBook }: HeroSectionProps) => {
  return (
    <> 
    <section className="max-w-6xl mx-auto px-6 py-[15vh] min-h-[70vh] grid lg:grid-cols-2 items-center gap-12">

       <div>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="text-5xl md:text-7xl lg:text-8xl font-serif text-balance leading-[0.9] mb-8 text-foreground -ml-12"
    >
      Precisão em <br /> cada movimento.
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="text-muted-foreground text-lg md:text-xl max-w-md mb-10 font-sans -mt-4"
    >
      A arte da navalha, no seu tempo. Agende seu horário com praticidade.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="-ml-10"
    >
      <Button variant="hero" size="xl" onClick={onBook}>
        Agendar agora
      </Button>
    </motion.div>

  </div>

  <div className="hidden lg:flex items-center justify-center">
    <img
      src="/logo.png"
      alt="Logo da barbearia"
      className="w-[320px] h-auto object-contain -mt-24"
    />
  </div>

</section>

<footer className="w-full text-center py-6 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">
  DEV.BY Guilherme. 2026 • eumabo® Digital Millennium Copyright Act
</footer>


</>
);
};

export default HeroSection;
