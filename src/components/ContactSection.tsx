import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", date: "", time: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thank you!", description: "We will get back to you as soon as possible." });
    setForm({ firstName: "", lastName: "", email: "", phone: "", date: "", time: "", notes: "" });
  };

  return (
    <section id="contact" className="py-20 bg-cream">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-4">Contact Us</h2>
        <p className="text-muted-foreground text-center mb-10">For inquiries or to book our catering services, please reach out to us.</p>
        <form onSubmit={handleSubmit} className="space-y-4 bg-background rounded-lg p-8 shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-maroon-dark">Send Message</Button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
