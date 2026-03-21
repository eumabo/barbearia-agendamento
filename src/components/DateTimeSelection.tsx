import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { TIME_SLOTS, dateToDb, fetchBusySlots } from "@/lib/booking";
import { cn } from "@/lib/utils";

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  barberId?: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string | null) => void;
}

const DateTimeSelection = ({
  selectedDate,
  selectedTime,
  barberId,
  onSelectDate,
  onSelectTime,
}: DateTimeSelectionProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [busyTimes, setBusyTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [today] = useState(() => startOfDay(new Date()));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      addDays(today, weekOffset * 7 + i)
    );
  }, [weekOffset, today]);

  function isPastTimeSlot(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate.getTime() <= Date.now();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBusySlots() {
      if (!selectedDate || !barberId) {
        setBusyTimes([]);
        return;
      }

      setLoadingSlots(true);

      try {
        const rows = await fetchBusySlots(barberId, dateToDb(selectedDate));

        if (!cancelled) {
          const occupied = rows
            .filter(
              (row) =>
                row.status === "confirmado" || row.status === "bloqueado"
            )
            .map((row) => row.appointment_time);

          setBusyTimes(occupied);

          if (
            selectedTime &&
            (occupied.includes(selectedTime) ||
              isPastTimeSlot(selectedDate, selectedTime))
          ) {
            onSelectTime(null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar horários ocupados:", error);
        if (!cancelled) setBusyTimes([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    loadBusySlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, barberId, selectedTime, onSelectTime]);

  return (
    <div>
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-6">
        Data e horário
      </span>

      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm font-sans text-muted-foreground capitalize">
          {format(days[0], "MMMM yyyy", { locale: ptBR })}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset(weekOffset + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-8">
        {days.map((day, i) => {
          const isPastDay = day < today;
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              whileTap={isPastDay ? undefined : { scale: 0.95 }}
              onClick={() => !isPastDay && onSelectDate(day)}
              data-selected={isSelected}
              disabled={isPastDay}
              className={cn(
                "flex flex-col items-center py-3 rounded-lg transition-all",
                isPastDay
                  ? "opacity-50 cursor-not-allowed bg-muted"
                  : "hover:bg-secondary data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
              )}
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
              </span>

              <span className="text-sm font-sans font-medium mt-0.5">
                {format(day, "d")}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block">
              Horários disponíveis
            </span>

            {loadingSlots && (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> atualizando
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((time, i) => {
              const isBusy = busyTimes.includes(time);
              const isPastTime = selectedDate
                ? isPastTimeSlot(selectedDate, time)
                : false;
              const isDisabled = isBusy || isPastTime || loadingSlots;

              return (
                <motion.button
                  key={time}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  whileTap={isDisabled ? undefined : { scale: 0.95 }}
                  onClick={() => !isDisabled && onSelectTime(time)}
                  data-selected={selectedTime === time}
                  disabled={isDisabled}
                  className={cn(
                    "py-3 text-sm font-sans tabular-nums rounded-lg border transition-all",
                    isDisabled
                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                      : "border-border bg-card hover:bg-secondary data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=true]:border-accent"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {(isBusy || isPastTime) && <Lock className="w-3.5 h-3.5" />}
                    {time}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DateTimeSelection;