import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

const COLOR_BASE = "#E87461";
const COLOR_ACCENT = "#EBA844";

/* Motion */
const rise = keyframes`
  from { opacity:0; transform: translateY(10px) scale(0.98); }
  to   { opacity:1; transform: translateY(0)    scale(1); }
`;
const glow = keyframes`
  0% { box-shadow: 0 10px 40px rgba(0,0,0,.15), 0 0 0 rgba(0,0,0,0); }
  100% { box-shadow: 0 10px 40px rgba(0,0,0,.18), 0 0 30px ${COLOR_ACCENT}25; }
`;

/* Layout */
const Wrap = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    radial-gradient(1100px 500px at 10% 90%, ${COLOR_BASE}22 0%, transparent 60%),
    radial-gradient(900px 500px at 90% 10%, ${COLOR_ACCENT}22 0%, transparent 60%),
    linear-gradient(135deg, ${COLOR_BASE}10, ${COLOR_ACCENT}18);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji";
`;

const Card = styled.section`
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 18px;
  padding: 28px;
  animation: ${rise} .5s ease both, ${glow} 1.2s ease .2s both;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 24px;
  color: ${COLOR_BASE};
  text-align: center;
  font-weight: 700;
  letter-spacing: .2px;
`;

const Subtitle = styled.p`
  margin: 0 0 22px 0;
  text-align: center;
  color: #5b5b5b;
  font-size: 14px;
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Row = styled.div`
  display: grid;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #444;
`;

const InputWrap = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 92%;
  border: 1px solid #e6e6e6;
  background: rgba(255,255,255,0.72);
  border-radius: 10px;
  padding: 12px 14px;
  outline: none;
  font-size: 14px;
  transition: border-color .2s, box-shadow .2s;
  &:focus {
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 3px ${COLOR_ACCENT}33;
    background: white;
  }
`;

const Toggle = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  translate: 0 -50%;
  padding: 6px 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: ${COLOR_BASE};
  font-size: 12px;
  font-weight: 600;
  &:hover { color: ${COLOR_ACCENT}; }
`;

const RowInline = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

const Checkbox = styled.input`
  width: 16px; height: 16px; margin-right: 8px;
  accent-color: ${COLOR_ACCENT};
`;

const Remember = styled.label`
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; color: #444;
`;

const Button = styled.button`
  margin-top: 4px;
  width: 100%;
  border: none;
  background: linear-gradient(90deg, ${COLOR_BASE}, ${COLOR_ACCENT});
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: .2px;
  cursor: pointer;
  transition: transform .08s ease, opacity .2s ease, filter .2s ease;
  &:hover { opacity: .95; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .6; cursor: default; filter: grayscale(.1); }
`;

const Footer = styled.footer`
  margin-top: 14px; text-align: center; color: #777; font-size: 12px;
`;

const Small = styled.small`
  color: #777;
`;

/* Component */
export default function Login() {
  const navigate = useNavigate();
  const { login, token, loading } = useAuth();

  const [email, setEmail] = useState(() => localStorage.getItem("ctb_last_email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem("ctb_last_email"));

  // Si déjà connecté, va direct au dashboard
  useEffect(() => {
    if (token && !loading) navigate("/dashboard", { replace: true });
  }, [token, loading, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;

    // micro validation
    if (!email || !password) {
      toast.error("Veuillez entrer votre courriel et mot de passe.");
      return;
    }

    setBusy(true);
    try {
      await login(email.trim(), password);
      if (remember) localStorage.setItem("ctb_last_email", email.trim());
      else localStorage.removeItem("ctb_last_email");
      toast.success("Connexion réussie !");
      // petit délai pour laisser voir le toast
      setTimeout(() => navigate("/dashboard", { replace: true }), 200);
    } catch (err) {
      console.error("[Login] error:", err);
      toast.error("Échec de connexion. Vérifiez vos identifiants.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Wrap>
      <Toaster position="top-center" toastOptions={{ duration: 2200 }} />
      <Card>
        <Title>Centre Thérapeutique du Bien-Être</Title>
        <Subtitle>Accédez à votre espace administrateur</Subtitle>

        <Form onSubmit={onSubmit}>
          <Row>
            <Label htmlFor="email">Courriel</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="Entrez votre email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </Row>

          <Row>
            <Label htmlFor="password">Mot de passe</Label>
            <InputWrap>
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <Toggle
                type="button"
                aria-label={showPw ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPw((v) => !v)}
                tabIndex={0}
              >
                {showPw ? "Cacher" : "Voir"}
              </Toggle>
            </InputWrap>
          </Row>

          <RowInline>
            <Remember>
              <Checkbox
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Se souvenir du courriel
            </Remember>
            <Small>&nbsp;</Small>
          </RowInline>

          <Button type="submit" disabled={busy}>
            {busy ? "Connexion..." : "Se connecter"}
          </Button>
        </Form>

        <Footer>
        </Footer>
      </Card>
    </Wrap>
  );
}