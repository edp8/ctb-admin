// src/pages/Newsletter.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../lib/api";

// 🎨 Palette
const COLOR_BASE = "#E87461";
const COLOR_ACCENT = "#EBA844";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const Page = styled.main`
  font-family: "system-ui", sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, ${COLOR_BASE}10, ${COLOR_ACCENT}20);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  animation: ${fadeIn} 0.5s ease;
`;

const Header = styled.header`
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  color: ${COLOR_BASE};
  font-weight: 600;
  font-size: 26px;
  margin: 0;
`;

const BackButton = styled.button`
  background: none;
  border: 2px solid ${COLOR_BASE};
  color: ${COLOR_BASE};
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s;
  &:hover {
    background: ${COLOR_BASE}10;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
`;

const FilterButton = styled.button`
  background: ${({ active }) =>
    active
      ? `linear-gradient(90deg, ${COLOR_BASE}, ${COLOR_ACCENT})`
      : "white"};
  color: ${({ active }) => (active ? "white" : COLOR_BASE)};
  border: 2px solid ${COLOR_BASE};
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: all 0.25s;
`;

const Card = styled.section`
  width: 100%;
  max-width: 800px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 20px;
  animation: ${fadeIn} 0.4s ease;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SubTitle = styled.h3`
  color: ${COLOR_ACCENT};
  font-size: 18px;
  margin: 0;
`;

const CopyButton = styled.button`
  background: linear-gradient(90deg, ${COLOR_ACCENT}, ${COLOR_BASE});
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
  &:hover {
    opacity: 0.9;
    transform: scale(1.03);
  }
`;

const EmailBox = styled.div`
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
`;

const Message = styled.p`
  text-align: center;
  color: ${({ type }) =>
    type === "error" ? "crimson" : type === "muted" ? "#777" : COLOR_BASE};
`;

// --- Component ---
export default function Newsletter() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [activeList, setActiveList] = useState(
    localStorage.getItem("newsletter_filter") || "all"
  );

  async function fetchList(type = "all") {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get(`/admin/newsletter/${type}`);
      const list = (data.items || []).map((x) => x.email);
      setEmails(list);
      setActiveList(type);
      localStorage.setItem("newsletter_filter", type);
    } catch (e) {
      console.error("Erreur chargement infolettre:", e);
      setErr("Erreur lors du chargement de la liste.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList(activeList);
  }, []);

  const copyToClipboard = () => {
    if (!emails.length) return;
    navigator.clipboard.writeText(emails.join(", "));
    toast.success("Liste copiée dans le presse-papiers !");
  };

  return (
    <Page>
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      <Header>
        <Title>Infolettre – Abonnés</Title>
        <BackButton onClick={() => navigate("/dashboard")}>
          ← Tableau de bord
        </BackButton>
      </Header>

      <FilterBar>
        {[
          { key: "all", label: "Tous les abonnés" },
          { key: "arts", label: "Arts martiaux" },
          { key: "therapy", label: "Thérapies alternatives" },
        ].map((b) => (
          <FilterButton
            key={b.key}
            active={activeList === b.key}
            disabled={loading}
            onClick={() => fetchList(b.key)}
          >
            {b.label}
          </FilterButton>
        ))}
      </FilterBar>

      <Card>
        {loading ? (
          <Message>Chargement...</Message>
        ) : err ? (
          <Message type="error">{err}</Message>
        ) : emails.length ? (
          <>
            <CardHeader>
              <SubTitle>{emails.length} abonnés</SubTitle>
              <CopyButton onClick={copyToClipboard}>Copier</CopyButton>
            </CardHeader>
            <EmailBox>{emails.join(", ")}</EmailBox>
          </>
        ) : (
          <Message type="muted">Aucun abonné trouvé.</Message>
        )}
      </Card>
    </Page>
  );
}