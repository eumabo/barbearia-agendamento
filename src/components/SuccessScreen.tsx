import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  onReset: () => void;
}

const SuccessScreen = ({ onReset }: SuccessScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center py-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-8"
      >
        <Check className="w-7 h-7 text-accent-foreground" />
      </motion.div>

      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
        Reservado.
      </h2>
      <p className="text-muted-foreground font-sans max-w-sm">
        Seu horário foi reservado. Enviamos os detalhes para seu WhatsApp.
      </p>

      <Button variant="ghost" className="mt-10 text-muted-foreground" onClick={onReset}>
        Agendar outro horário
      </Button>
    </motion.div>
  );
};

export default SuccessScreen;
