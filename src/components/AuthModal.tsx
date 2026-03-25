import { useState } from "react";
import { X, Eye, EyeOff, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  onClose: () => void;
}

const STAFF_ROLES = ["sales_rep", "operations_manager", "catering_manager", "admin", "business_owner"];

const AuthModal = ({ onClose }: AuthModalProps) => {
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  // ── Step 1 — choose type ──────────────────────────────────────────────────
  const [step, setStep] = useState<"choose" | "customer" | "staff">("choose");

  // ── Customer tabs ─────────────────────────────────────────────────────────
  const [tab, setTab]                             = useState<"signin" | "create">("signin");
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In
  const [signInEmail, setSignInEmail]             = useState("");
  const [signInPassword, setSignInPassword]       = useState("");
  const [signInError, setSignInError]             = useState("");
  const [signInSuccess, setSignInSuccess]         = useState("");

  // Create Account
  const [firstName, setFirstName]                 = useState("");
  const [lastName, setLastName]                   = useState("");
  const [createEmail, setCreateEmail]             = useState("");
  const [phone, setPhone]                         = useState("");
  const [countryCode, setCountryCode]             = useState("+1");
  const [createPassword, setCreatePassword]       = useState("");
  const [confirmPassword, setConfirmPassword]     = useState("");
  const [createError, setCreateError]             = useState("");
  const [createSuccess, setCreateSuccess]         = useState("");

  // ── Staff login ───────────────────────────────────────────────────────────
  const [staffEmail, setStaffEmail]               = useState("");
  const [staffPassword, setStaffPassword]         = useState("");
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffError, setStaffError]               = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCustomerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    if (!signInEmail || !signInPassword) { setSignInError("Please fill in all fields."); return; }
    try {
      const user = await signIn(signInEmail, signInPassword);
      if (STAFF_ROLES.includes(user.role)) {
        // staff accidentally used customer login → redirect
        onClose();
        navigate("/sales/dashboard");
        return;
      }
      setSignInSuccess("Signed in successfully!");
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setSignInError(err.message);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!firstName || !lastName || !createEmail || !createPassword || !confirmPassword) {
      setCreateError("Please fill in all fields."); return;
    }
    if (createPassword !== confirmPassword) { setCreateError("Passwords do not match."); return; }
    if (createPassword.length < 8) { setCreateError("Password must be at least 8 characters."); return; }
    try {
      await signUp({
        firstName, lastName,
        email:    createEmail,
        phone:    phone ? `${countryCode}${phone}` : undefined,
        password: createPassword,
        role:     "customer",
      });
      setCreateSuccess("Account created! You are now signed in.");
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    if (!staffEmail || !staffPassword) { setStaffError("Please fill in all fields."); return; }
    try {
      const user = await signIn(staffEmail, staffPassword);
      if (!STAFF_ROLES.includes(user.role)) {
        setStaffError("This account does not have staff access."); return;
      }
      onClose();
      // redirect based on role
      if (["sales_rep", "operations_manager", "catering_manager"].includes(user.role)) {
        navigate("/sales/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "business_owner") {
        navigate("/owner/dashboard");
      }
    } catch (err: any) {
      setStaffError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white border border-border rounded-full p-1 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* ── Step 1 — Choose type ── */}
        {step === "choose" && (
          <div className="p-8">
            <h2 className="font-display font-bold text-primary text-xl text-center mb-2">Welcome</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">How would you like to sign in?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep("customer")}
                className="flex flex-col items-center gap-3 border-2 border-border rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-foreground">Customer</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Place an order</p>
                </div>
              </button>

              <button
                onClick={() => setStep("staff")}
                className="flex flex-col items-center gap-3 border-2 border-border rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-foreground">Staff</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Operations access</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2a — Customer ── */}
        {step === "customer" && (
          <>
            <div className="grid grid-cols-2 border-b border-border">
              {(["signin", "create"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`py-4 text-sm font-semibold transition-colors ${
                    tab === t ? "border-b-2 border-primary text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {t === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Back */}
              <button onClick={() => setStep("choose")}
                className="text-xs text-muted-foreground hover:text-primary mb-4 flex items-center gap-1">
                ← Back
              </button>

              {tab === "signin" && (
                <form onSubmit={handleCustomerSignIn} className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground mb-1 block">Email</label>
                    <Input type="email" placeholder="Enter your email"
                      value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-foreground mb-1 block">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                        value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {signInError   && <p className="text-xs text-red-500">{signInError}</p>}
                  {signInSuccess && <p className="text-xs text-green-600">{signInSuccess}</p>}
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              )}

              {tab === "create" && (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-foreground mb-1 block">First Name</label>
                      <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1 block">Last Name</label>
                      <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-foreground mb-1 block">Email</label>
                    <Input type="email" placeholder="Enter your email"
                      value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-foreground mb-1 block">Phone <span className="text-muted-foreground text-xs">(optional)</span></label>
                    <div className="flex gap-2">
                      <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                        className="border border-input rounded-md px-2 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary w-20">
                        {["+1","+44","+91","+61","+971"].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <Input type="tel" placeholder="Phone number" value={phone}
                        onChange={(e) => setPhone(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-foreground mb-1 block">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Min 8 characters"
                        value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-foreground mb-1 block">Confirm Password</label>
                    <div className="relative">
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {createError   && <p className="text-xs text-red-500">{createError}</p>}
                  {createSuccess && <p className="text-xs text-green-600">{createSuccess}</p>}
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </div>
          </>
        )}

        {/* ── Step 2b — Staff ── */}
        {step === "staff" && (
          <div className="p-6">
            <button onClick={() => setStep("choose")}
              className="text-xs text-muted-foreground hover:text-primary mb-4 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="font-display font-bold text-primary text-lg mb-1">Staff Login</h2>
            <p className="text-xs text-muted-foreground mb-5">Operations, sales and management access</p>

            <form onSubmit={handleStaffSignIn} className="space-y-4">
              <div>
                <label className="text-sm text-foreground mb-1 block">Email</label>
                <Input type="email" placeholder="Staff email"
                  value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-foreground mb-1 block">Password</label>
                <div className="relative">
                  <Input type={showStaffPassword ? "text" : "password"} placeholder="Password"
                    value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {staffError && <p className="text-xs text-red-500">{staffError}</p>}
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;