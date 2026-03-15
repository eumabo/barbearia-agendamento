import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBook: () => void;
}

const HeroSection = ({ onBook }: HeroSectionProps) => {
  return (
    <> 
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">

  {/* Logo */}
  <img 
    src="/logo.png" 
    alt="Barbearia Du Marcin"
    className="w-40 mb-8"
  />

  {/* Texto */}
  <div className="max-w-xl">
    <h1 className="text-5xl font-serif mb-6">
      Precisão em <br /> cada movimento.
    </h1>

    <p className="text-gray-500 mb-8">
      A arte da navalha, no seu tempo. Agende seu horário com praticidade.
    </p>

    <button className="bg-black text-white px-8 py-4 rounded-full">
      Agendar agora
    </button>
  </div>

</section>

<footer className="w-full text-center py-6 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">
  DEV.BY Guilherme. 2026 • eumabo® Digital Millennium Copyright Act
</footer>


</>
);
};

export default HeroSection;
