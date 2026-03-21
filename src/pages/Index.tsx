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
import { useToast } from "@/hooks/use-toast";
import { createAppointment, dateToDb } from "@/lib/booking";

type Step = "hero" | "service" | "barber" | "datetime" | "confirm" | "success";

const stepOrder: Step[] = ["hero", "service", "barber", "datetime", "confirm", "success"];

const slideVariants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const Index = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("hero");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(false);
  }, []);

  const handleConfirm = useCallback(
    async (name: string, phone: string) => {
      if (isSubmitting) return;

      if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
        toast({
          title: "Dados incompletos",
          description: "Selecione serviço, barbeiro, data e horário antes de confirmar.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
      await createAppointment({
  barber_id: selectedBarber.id,
  barber_name: selectedBarber.name,
  date: dateToDb(selectedDate),
  time: selectedTime,
  customer_name: name,
  customer_phone: phone,
  service_name: selectedService.nome,
  notes: null,
});

        setStep("success");
      } catch (error: any) {
        toast({
          title: "Não foi possível agendar",
          description: error?.message || "Tente novamente em alguns segundos.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, selectedService, selectedBarber, selectedDate, selectedTime, toast]
  );

  const canProceed = () => {
    switch (step) {
      case "service":
        return !!selectedService;
      case "barber":
        return !!selectedBarber;
      case "datetime":
        return !!selectedDate && !!selectedTime;
      default:
        return false;
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
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans">
          Corte &amp; Ofício
        </span>

        <div className="w-10" />
      </div>

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
              <ServiceSelection
                selected={selectedService}
                onSelect={(s) => {
                  setSelectedService(s);
                }}
              />
            )}

            {step === "barber" && (
              <BarberSelection
                selected={selectedBarber}
                onSelect={(b) => {
                  setSelectedBarber(b);
                }}
              />
            )}

            {step === "datetime" && (
              <DateTimeSelection
                barberId={selectedBarber?.id}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={setSelectedDate}
                onSelectTime={setSelectedTime}
              />
            )}

            {step === "confirm" &&
              selectedService &&
              selectedBarber &&
              selectedDate &&
              selectedTime && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-card shadow-card space-y-3">
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block">
                      Resumo
                    </span>

                    <div className="flex justify-between text-sm font-sans gap-4">
                      <span className="text-muted-foreground">Serviço</span>
                      <span className="text-foreground font-medium text-right">
                        {selectedService.nome} · R$ {selectedService.preco}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-sans gap-4">
                      <span className="text-muted-foreground">Profissional</span>
                      <span className="text-foreground font-medium text-right">
                        {selectedBarber.name}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-sans gap-4">
                      <span className="text-muted-foreground">Data</span>
                      <span className="text-foreground font-medium capitalize text-right">
                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })} · {selectedTime}
                      </span>
                    </div>
                  </div>

                  <ConfirmationForm
                    onConfirm={handleConfirm}
                    isSubmitting={isSubmitting}
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