import { FormEvent, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import type { Barber } from "@/components/BarberSelection";
import {
  TIME_SLOTS,
  cancelAppointment,
  checkIsAdmin,
  createAdminBlock,
  dateToDb,
  fetchAdminAppointments,
  fetchBusySlots,
  getAdminSession,
  signInAdmin,
  signOutAdmin,
  type AppointmentRow,
} from "@/lib/Booking";

const Admin = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dateToDb(new Date()));
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [busyTimes, setBusyTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [blockNotes, setBlockNotes] = useState("");

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === selectedBarberId) ?? null,
    [barbers, selectedBarberId]
  );

  async function loadBarbers() {
    const { data, error } = await supabase.from("Barbeiros").select("*").eq("ativo", true);
    if (error) throw error;
    const formatted = (data ?? []).map((barber: any) => ({
      id: String(barber.id),
      name: barber.nome,
      initials: barber.nome
        .split(" ")
        .map((word: string) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    }));
    setBarbers(formatted);
    if (!selectedBarberId && formatted[0]) setSelectedBarberId(formatted[0].id);
  }

  async function refreshAgenda() {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [rows, slotRows] = await Promise.all([
        fetchAdminAppointments(selectedDate),
        selectedBarberId ? fetchBusySlots(selectedBarberId, selectedDate) : Promise.resolve([]),
      ]);
      setAppointments(rows);
      setBusyTimes(slotRows.map((row) => row.appointment_time));
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agenda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        await loadBarbers();
        const session = await getAdminSession();
        if (session) {
          const admin = await checkIsAdmin();
          setIsAdmin(admin);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setSessionChecked(true);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    refreshAgenda();
  }, [isAdmin, selectedDate, selectedBarberId]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await signInAdmin(email, password);
      const admin = await checkIsAdmin();
      if (!admin) {
        await signOutAdmin();
        throw new Error("Esse usuário não está liberado como admin.");
      }
      setIsAdmin(true);
      toast({ title: "Login realizado", description: "Painel administrativo liberado." });
    } catch (error: any) {
      toast({ title: "Não foi possível entrar", description: error.message, variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setIsAdmin(false);
  };

  const handleBlockSlot = async (time: string) => {
    if (!selectedBarber) return;
    try {
      await createAdminBlock({
        barber_id: selectedBarber.id,
        barber_name: selectedBarber.name,
        appointment_date: selectedDate,
        appointment_time: time,
        notes: blockNotes || "Bloqueado pelo administrador",
      });
      setBlockNotes("");
      toast({ title: "Horário bloqueado", description: `${time} bloqueado com sucesso.` });
      await refreshAgenda();
    } catch (error: any) {
      toast({ title: "Não foi possível bloquear", description: error.message, variant: "destructive" });
    }
  };

  const handleCancel = async (id: string, status: string) => {
    try {
      await cancelAppointment(id);
      toast({
        title: status === "bloqueado" ? "Horário liberado" : "Agendamento cancelado",
        description: status === "bloqueado" ? "O horário voltou a ficar disponível." : "O horário foi liberado para nova reserva.",
      });
      await refreshAgenda();
    } catch (error: any) {
      toast({ title: "Não foi possível alterar", description: error.message, variant: "destructive" });
    }
  };

  const barberAppointments = appointments.filter((item) => item.barber_id === selectedBarberId && item.status !== "cancelado");

  if (!sessionChecked) {
    return <div className="min-h-screen grid place-items-center">Carregando painel...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 shadow-card">
          <div>
            <h1 className="text-2xl font-semibold">Admin da barbearia</h1>
            <p className="text-sm text-muted-foreground mt-1">Entre com o usuário admin cadastrado no Supabase Auth.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" variant="hero" size="xl">Entrar</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Painel administrativo</h1>
            <p className="text-muted-foreground">Bloqueie horários, libere horários e cancele agendamentos.</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sair</Button>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 h-fit">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barber">Barbeiro</Label>
              <select
                id="barber"
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>{barber.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observação do bloqueio</Label>
              <Input id="notes" value={blockNotes} onChange={(e) => setBlockNotes(e.target.value)} placeholder="Ex: almoço, curso, folga" />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Bloquear horário manualmente</p>
                <p className="text-xs text-muted-foreground">Só os horários livres aparecem disponíveis para bloqueio.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const occupied = busyTimes.includes(time);
                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={occupied ? "secondary" : "outline"}
                      disabled={occupied}
                      className="text-xs"
                      onClick={() => handleBlockSlot(time)}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Agenda do dia</h2>
                <p className="text-sm text-muted-foreground capitalize">{format(new Date(`${selectedDate}T00:00:00`), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
              </div>
              <Button type="button" variant="outline" onClick={refreshAgenda} disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>

            <div className="space-y-3">
              {barberAppointments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Nenhum agendamento ou bloqueio para esse barbeiro nessa data.
                </div>
              ) : (
                barberAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{appointment.appointment_time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === "bloqueado" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm"><strong>Cliente:</strong> {appointment.customer_name}</p>
                      <p className="text-sm"><strong>Serviço:</strong> {appointment.service_name}</p>
                      <p className="text-sm"><strong>WhatsApp:</strong> {appointment.customer_phone}</p>
                      {appointment.notes && <p className="text-sm"><strong>Obs:</strong> {appointment.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="destructive" onClick={() => handleCancel(appointment.id, appointment.status)}>
                        {appointment.status === "bloqueado" ? "Liberar" : "Cancelar"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
