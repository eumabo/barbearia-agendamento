import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import HeroSection from "@/components/HeroSection";
import ServiceSelection, { type Service } from "@/components/ServiceSelection";
import BarberSelection, { type Barber } from "@/components/BarberSelection";
import DateTimeSelection from "@/components/DateTimeSelection";
import ConfirmationForm from "@/components/ConfirmationForm";
import SuccessScreen from "@/components/SuccessScreen";
import { Button } from "@/components/ui/button";


import logo from "@logo.png";


type Step = "hero" | "service" | "barber" | "datetime" | "confirm" | "success";

const stepOrder: Step[] = ["hero", "service", "barber", "datetime", "confirm", "success"];

const slideVariants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const Index = () => {
  const [step, setStep] = useState<Step>("hero");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const goBack = useCallback(() => {
    const idx = stepOrder.indexOf(step);
    if (idx > 1) setStep(stepOrder[idx - 1]);
    else setStep("hero");
  }, [step]);

  const reset = useCallback(() => {
    setStep("hero");
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate(null);
    setSelectedTime(null);
  }, []);

  const handleConfirm = useCallback((_name: string, _phone: string) => {
    // In a real app, send to backend
    setTimeout(() => setStep("success"), 600);
  }, []);

  const canProceed = () => {
    switch (step) {
      case "service": return !!selectedService;
      case "barber": return !!selectedBarber;
      case "datetime": return !!selectedDate && !!selectedTime;
      default: return false;
    }
  };

  const nextStep = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1 && canProceed()) {
      setStep(stepOrder[idx + 1]);
    }
  };

  if (step === "hero") {
    return <HeroSection onBook={() => setStep("service")} />;
  }

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-6">
        <SuccessScreen onReset={reset} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans">
          Corte & Ofício
        </span>
        <div className="w-10" />
      </div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === "service" && (
              <ServiceSelection selected={selectedService} onSelect={(s) => { setSelectedService(s); }} />
            )}
            {step === "barber" && (
              <BarberSelection selected={selectedBarber} onSelect={(b) => { setSelectedBarber(b); }} />
            )}
            {step === "datetime" && (
              <DateTimeSelection
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={setSelectedDate}
                onSelectTime={setSelectedTime}
              />
            )}
            {step === "confirm" && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-5 rounded-xl bg-card shadow-card space-y-3">
                  <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block">
                    Resumo
                  </span>

                <div className="w-[400px] h-[200px] flex items-center justify-center">
                  <img
                    src="/logo.png"
                     alt="Barbearia Du Marcin"
                       className="w-full h-full object-contain"
                       />
                     </div>


                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Serviço</span>
                    <span className="text-foreground font-medium">{selectedService?.nome} · R$ {selectedService?.preco}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Profissional</span>
                    <span className="text-foreground font-medium">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Data</span>
                    <span className="text-foreground font-medium capitalize">
                      {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: ptBR })} · {selectedTime}
                    </span>
                  </div>
                </div>
                <ConfirmationForm
               onConfirm={handleConfirm}
               isSubmitting={false}
               selectedService={selectedService}
               selectedBarber={selectedBarber}
               selectedDate={selectedDate}
               selectedTime={selectedTime}
              />

              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar (sticky on mobile) */}
      {step !== "confirm" && (
        <div className="sticky bottom-0 pt-4 pb-6 bg-background/80 backdrop-blur-md mt-6">
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={!canProceed()}
            onClick={nextStep}
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
