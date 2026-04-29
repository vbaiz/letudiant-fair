"use client";
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";

const C = {
  tomate: "#EC1F27",
  tomateDark: "#C41520",
  tomateLight: "#FFF0F1",
  piscine: "#0066CC",
  piscineLight: "#E6F0FF",
  citron: "#FCD716",
  citronLight: "#FFF9E6",
  spirit: "#FF6B35",
  menthe: "#4DB8A8",
  mentheLight: "#E0F2EF",
  pourpre: "#932D99",
  nuit: "#191829",
  blanc: "#F8F7F2",
  gray700: "#3D3D3D",
  gray500: "#6B6B6B",
  gray300: "#D4D4D4",
  gray200: "#E8E8E8",
  gray100: "#F4F4F4",
  gray50: "#FAFAFA",
};

type Step = 1 | "1b" | 2 | 3;

const DOMAINS = ["Business", "Ingénierie", "Design", "Santé", "Droit", "Sciences", "Arts", "Communication"];
const LEVELS = ["Seconde", "Première", "Terminale", "Post-bac"];
const DOMAIN_COLORS = [C.tomate, C.piscine, C.spirit, C.menthe, C.pourpre, "#00BFB3", "#E91E63", "#7A6200"];

function decodePrefill(raw: string | null): {
  email?: string; firstName?: string; lastName?: string;
  education_level?: string; btoc_id?: string
} | null {
  if (!raw) return null;
  try {
    return JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: active
                  ? `linear-gradient(135deg, ${C.tomate} 0%, ${C.tomateDark} 100%)`
                  : done ? C.nuit : "#fff",
                color: active || done ? "#fff" : C.gray500,
                border: active || done ? "none" : `1.5px solid ${C.gray200}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                boxShadow: active ? "0 4px 12px -2px rgba(236,31,39,0.30)" : "none",
                transition: "all .3s var(--ease-out)",
              }}
            >
              {done ? "✓" : n}
            </div>
            {n < total && (
              <div style={{
                flex: 1, height: 2, borderRadius: 2,
                background: n < current ? C.nuit : C.gray200,
                transition: "background .3s var(--ease-out)",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role");
  const redirectTo = searchParams.get("redirect");
  type Role = "student" | "teacher" | "exhibitor" | "parent";
  const validRoles: Role[] = ["student", "teacher", "exhibitor", "parent"];
  const role: Role = validRoles.includes(rawRole as Role) ? (rawRole as Role) : "student";
  const ROLE_HOME: Record<Role, string> = {
    student:   "/home",
    teacher:   "/teacher/dashboard",
    exhibitor: "/exhibitor/dashboard",
    parent:    "/parent/home",
  };
  const ROLE_COPY: Record<Role, { eyebrow: string; headline: string; tail: string; subtitle: string; emoji: string }> = {
    student:   { eyebrow: "Espace étudiant",   headline: "Votre",       tail: "aventure",   subtitle: "Trois étapes pour construire votre espace et explorer les 130 salons d'orientation.", emoji: "🎓" },
    teacher:   { eyebrow: "Espace enseignant", headline: "Votre",       tail: "mission",    subtitle: "Gérez vos groupes d'élèves et suivez leur engagement dans les salons L'Étudiant.", emoji: "👩‍🏫" },
    exhibitor: { eyebrow: "Espace exposant",   headline: "Votre",       tail: "stand",      subtitle: "Créez votre fiche école et suivez vos leads en temps réel pendant les salons.", emoji: "🏛️" },
    parent:    { eyebrow: "Espace parent",     headline: "Votre",       tail: "rôle",       subtitle: "Suivez l'orientation de votre enfant et validez son inscription aux salons.", emoji: "👨‍👩‍👧" },
  };

  const ROLE_COLOR: Record<Role, string> = {
    student:   C.tomate,
    teacher:   C.piscine,
    exhibitor: C.spirit,
    parent:    C.pourpre,
  };

  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [btocId, setBtocId] = useState<string | null>(null);

  useEffect(() => {
    const prefill = decodePrefill(searchParams.get("prefill"));
    if (!prefill) return;
    if (prefill.email) setEmail(prefill.email);
    if (prefill.firstName) setFirstName(prefill.firstName);
    if (prefill.lastName) setLastName(prefill.lastName);
    if (prefill.btoc_id) setBtocId(prefill.btoc_id);
    if (prefill.education_level) setLevel(prefill.education_level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getStepDot(): number {
    if (step === 1 || step === "1b") return 1;
    if (step === 2) return 2;
    return 3;
  }

  function isUnder16(): boolean {
    if (!dob) return false;
    const birth = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const adjustedAge = m < 0 || (m === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
    return adjustedAge < 16;
  }

  function handleStep1Continue() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Prénom requis";
    if (!lastName.trim()) errs.lastName = "Nom requis";
    if (!email.includes("@")) errs.email = "Email invalide";
    if (password.length < 8) errs.password = "8 caractères minimum";
    if (role === "student" && !dob) errs.dob = "Date de naissance requise";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (role !== "student") { handleFinalSubmit(); return; }
    if (isUnder16()) { setStep("1b"); } else { setStep(2); }
  }

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) => prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]);
  }

  async function handleFinalSubmit() {
    setLoading(true);
    if (role === "student") {
      const errs: Record<string, string> = {};
      if (!level) errs.level = "Choisissez votre niveau";
      if (selectedDomains.length === 0) errs.domains = "Sélectionnez au moins un domaine";
      setErrors(errs);
      if (Object.keys(errs).length > 0) { setLoading(false); return; }
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, firstName, lastName,
          dob: dob || undefined, role,
          level: level || undefined,
          domains: selectedDomains,
          parentEmail: parentEmail || undefined,
          btocId: btocId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setErrors({ submit: json.error ?? "Erreur lors de la création du compte" }); setLoading(false); return; }

      const { getSupabase } = await import("@/lib/supabase/client");
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setErrors({ submit: signInError.message }); setLoading(false); return; }
      if (role === 'student' && redirectTo && redirectTo.startsWith('/')) {
        router.push(redirectTo);
      } else {
        router.push(ROLE_HOME[role]);
      }
    } catch (err: unknown) {
      setErrors({ submit: err instanceof Error ? err.message : "Erreur lors de la création du compte" });
      setLoading(false);
    }
  }

  const accentColor = ROLE_COLOR[role];
  const totalSteps = role === "student" ? 3 : 1;

  return (
    <div className="le-auth-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
        <Logo variant="default" size="sm" />
        <a href="/login" style={{
          fontSize: 13, fontWeight: 600, color: C.gray500, textDecoration: "none",
          padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(16,24,40,0.06)", backdropFilter: "blur(10px)",
          transition: "all .2s var(--ease-out)",
        }}>
          Déjà un compte ? <strong style={{ color: C.tomate, marginLeft: 4 }}>Se connecter →</strong>
        </a>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 540px)",
          gap: 56, alignItems: "center", width: "100%", maxWidth: 1100,
        }} className="register-grid">

          {/* Left — editorial hero */}
          <div className="le-fade-in" style={{ paddingRight: 8 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: `${accentColor}14`, color: accentColor,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, animation: "lePulseDot 1.8s var(--ease-smooth) infinite" }} />
              {ROLE_COPY[role].eyebrow}
            </div>

            <h1 style={{
              margin: 0, fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 0.96, color: C.nuit,
            }}>
              {ROLE_COPY[role].headline}{" "}
              <span style={{
                fontStyle: "italic",
                background: role === "student"
                  ? `linear-gradient(135deg, ${C.tomate} 0%, ${C.spirit} 100%)`
                  : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}AA 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {ROLE_COPY[role].tail}
              </span><br />
              commence ici.
            </h1>

            <p style={{ margin: "20px 0 28px", fontSize: 17, lineHeight: 1.55, color: C.gray700, maxWidth: 460 }}>
              {ROLE_COPY[role].subtitle}
            </p>

            {/* Mini role switcher */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(Object.keys(ROLE_COLOR) as Role[]).map((r) => {
                const isActive = r === role;
                const labels: Record<Role, string> = { student: "Étudiant", teacher: "Enseignant", exhibitor: "Exposant", parent: "Parent" };
                return (
                  <a
                    key={r}
                    href={r === "student" ? "/register" : `/register?role=${r}`}
                    style={{
                      padding: "8px 14px", borderRadius: 999,
                      background: isActive ? ROLE_COLOR[r] : "#fff",
                      color: isActive ? "#fff" : C.gray700,
                      fontSize: 13, fontWeight: 600, textDecoration: "none",
                      border: `1.5px solid ${isActive ? ROLE_COLOR[r] : "var(--le-gray-200)"}`,
                      boxShadow: isActive ? `0 4px 12px -2px ${ROLE_COLOR[r]}40` : "var(--shadow-xs)",
                      transition: "all .2s var(--ease-out)",
                    }}
                  >
                    {labels[r]}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right — form card */}
          <div className="le-scale-in le-surface-elevated" style={{ padding: 36, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
            {role === "student" && <StepIndicator current={getStepDot()} total={totalSteps} />}

            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <h2 style={sectionTitleStyle}>
                  {role === "student" ? "Vos infos" : "Créer mon compte"}
                </h2>
                <p style={subtitleStyle}>
                  {role === "student"
                    ? "Toutes les informations de base pour démarrer."
                    : "Remplissez le formulaire pour activer votre espace."}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Prénom" value={firstName} onChange={setFirstName} error={errors.firstName} placeholder="Marie" />
                    <Field label="Nom" value={lastName} onChange={setLastName} error={errors.lastName} placeholder="Dupont" />
                  </div>
                  <Field label="Adresse email" type="email" value={email} onChange={setEmail} error={errors.email} placeholder="marie@exemple.fr" />
                  <Field label="Mot de passe" type="password" value={password} onChange={setPassword} error={errors.password} placeholder="8 caractères minimum" hint="Minimum 8 caractères" />
                  {role === "student" && (
                    <Field label="Date de naissance" type="date" value={dob} onChange={setDob} error={errors.dob} />
                  )}

                  {errors.submit && <ErrorBox>{errors.submit}</ErrorBox>}

                  <PrimaryButton onClick={handleStep1Continue} disabled={loading} accentColor={accentColor}>
                    {loading ? "Création…" : role === "student" ? "Continuer" : "Créer mon espace"}
                  </PrimaryButton>
                </div>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.gray500 }}>
                  Déjà un compte ?{" "}
                  <a href="/login" style={{ color: accentColor, fontWeight: 700, textDecoration: "none" }}>
                    Se connecter
                  </a>
                </p>
              </>
            )}

            {/* ── Step 1b: Age gate ── */}
            {step === "1b" && (
              <>
                <h2 style={sectionTitleStyle}>Validation parentale</h2>
                <p style={subtitleStyle}>Conformément au RGPD, un consentement parental est requis.</p>

                <div style={{
                  marginTop: 8, marginBottom: 20,
                  background: C.citronLight, border: `1px solid ${C.citron}`,
                  borderRadius: "var(--radius-md)", padding: 16,
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 20 }}>👨‍👩‍👧</span>
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: C.nuit, fontSize: 13 }}>
                      Un parent doit valider votre inscription
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: C.gray700, lineHeight: 1.55 }}>
                      Les mineurs de moins de 16 ans doivent obtenir le consentement d'un parent ou tuteur légal (CNIL/RGPD).
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Email parent / tuteur" type="email" value={parentEmail} onChange={setParentEmail} placeholder="parent@exemple.fr" />

                  <div style={{
                    background: C.gray50, borderRadius: "var(--radius-sm)",
                    padding: "12px 14px", fontSize: 12, color: C.gray700, lineHeight: 1.55,
                    border: "1px solid var(--le-gray-100)",
                  }}>
                    <strong style={{ color: C.nuit, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      🛡️ Protection des données
                    </strong>
                    <br />
                    Données traitées par L'Étudiant. Droit d'accès, rectification et suppression conformément au RGPD.
                  </div>

                  <PrimaryButton onClick={() => setStep(2)} disabled={!parentEmail.includes("@")} accentColor={accentColor}>
                    Envoyer la demande
                  </PrimaryButton>
                  <BackButton onClick={() => setStep(1)}>← Retour</BackButton>
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <h2 style={sectionTitleStyle}>Vos centres d'intérêt</h2>
                <p style={subtitleStyle}>Personnalisez votre expérience — sélectionnez les domaines qui vous intéressent.</p>

                <div style={{ marginBottom: 24 }}>
                  <div style={fieldLabelStyle}>Domaines</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {DOMAINS.map((domain, i) => {
                      const selected = selectedDomains.includes(domain);
                      const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];
                      return (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => toggleDomain(domain)}
                          style={{
                            padding: "8px 14px", borderRadius: 999,
                            border: `1.5px solid ${selected ? color : "var(--le-gray-200)"}`,
                            background: selected ? color : "#fff",
                            color: selected ? "#fff" : C.gray700,
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            transition: "all .2s var(--ease-out)",
                            boxShadow: selected ? `0 4px 12px -2px ${color}40` : "var(--shadow-xs)",
                          }}
                          onMouseEnter={e => {
                            if (selected) return;
                            e.currentTarget.style.borderColor = color;
                            e.currentTarget.style.color = color;
                          }}
                          onMouseLeave={e => {
                            if (selected) return;
                            e.currentTarget.style.borderColor = C.gray200;
                            e.currentTarget.style.color = C.gray700;
                          }}
                        >
                          {domain}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={fieldLabelStyle}>Niveau scolaire</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {LEVELS.map((l) => {
                      const selected = level === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLevel(l)}
                          style={{
                            padding: "12px", borderRadius: "var(--radius-sm)",
                            border: `1.5px solid ${selected ? C.piscine : "var(--le-gray-200)"}`,
                            background: selected ? C.piscineLight : "#fff",
                            color: selected ? C.piscine : C.gray700,
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            transition: "all .2s var(--ease-out)",
                            boxShadow: selected ? "0 2px 6px rgba(0,102,204,0.15)" : "var(--shadow-xs)",
                          }}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {errors.submit && <ErrorBox>{errors.submit}</ErrorBox>}
                  {errors.level && <ErrorBox>{errors.level}</ErrorBox>}
                  {errors.domains && <ErrorBox>{errors.domains}</ErrorBox>}
                  <PrimaryButton onClick={handleFinalSubmit} disabled={loading || selectedDomains.length === 0 || !level} accentColor={accentColor}>
                    {loading ? "Création du compte…" : "Créer mon compte"}
                  </PrimaryButton>
                  <BackButton onClick={() => setStep(1)}>← Retour</BackButton>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "20px 32px", textAlign: "center", fontSize: 12, color: C.gray500 }}>
        L'Étudiant 2026 · Vos données sont protégées (RGPD)
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 920px) {
          .register-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0, fontSize: 26, fontWeight: 800,
  letterSpacing: "-0.02em", color: C.nuit,
};

const subtitleStyle: React.CSSProperties = {
  margin: "6px 0 24px", fontSize: 14, color: C.gray500,
};

const fieldLabelStyle: React.CSSProperties = {
  marginBottom: 10, fontSize: 13, fontWeight: 600, color: C.gray700,
};

function Field({ label, type = "text", value, onChange, placeholder, error, hint }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; hint?: string;
}) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="le-input"
        style={error ? { borderColor: C.tomate } : undefined}
      />
      {error
        ? <p style={{ margin: "6px 0 0", fontSize: 12, color: C.tomate, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>⚠️ {error}</p>
        : hint && <p style={{ margin: "6px 0 0", fontSize: 12, color: C.gray500 }}>{hint}</p>
      }
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, accentColor }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; accentColor: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: 4, padding: "14px 20px",
        background: disabled
          ? C.gray300
          : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}DD 100%)`,
        color: "#fff", border: "none",
        borderRadius: "var(--radius-sm)",
        fontSize: 15, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 4px 12px -2px ${accentColor}50`,
        transition: "all .2s var(--ease-out)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 8px 20px -2px ${accentColor}66`;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 12px -2px ${accentColor}50`;
      }}
    >
      {children}{!disabled && <span>→</span>}
    </button>
  );
}

function BackButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none", border: "none", color: C.gray500,
        fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px",
        transition: "color .15s var(--ease-out)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = C.nuit }}
      onMouseLeave={(e) => { e.currentTarget.style.color = C.gray500 }}
    >
      {children}
    </button>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: "12px 14px", background: C.tomateLight, color: C.tomateDark,
      border: "1px solid rgba(236,31,39,0.20)", borderLeft: `3px solid ${C.tomate}`,
      borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span>⚠️</span>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.blanc }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.tomate}`, borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <RegisterInner />
    </Suspense>
  );
}
