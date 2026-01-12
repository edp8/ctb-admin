// src/pages/QuotesPage.jsx
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { getQuotes, updateQuote } from "../lib/api";

const COLOR_BASE = "#E87461";
const COLOR_ACCENT = "#EBA844";

const fadeIn = keyframes`
  from { opacity:0; transform: translateY(10px); }
  to { opacity:1; transform: translateY(0); }
`;

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
  max-width: 960px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
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

const Content = styled.section`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: ${fadeIn} 0.4s ease;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${COLOR_ACCENT};
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #444;
`;

const TextArea = styled.textarea`
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 70px;
  transition: border-color 0.2s, box-shadow 0.2s;
  &::placeholder {
    color: #aaa;
    font-style: italic;
  }
  &:focus {
    outline: none;
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 2px ${COLOR_ACCENT}40;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const SaveButton = styled.button`
  background: linear-gradient(90deg, ${COLOR_BASE}, ${COLOR_ACCENT});
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusText = styled.span`
  font-size: 13px;
  color: ${({ $error }) => ($error ? "#c0392b" : "#2e7d32")};
`;

const SmallInfo = styled.p`
  width: 100%;
  max-width: 960px;
  font-size: 13px;
  color: #555;
  margin: 0 0 20px 0;
  line-height: 20px;
`;

// Configuration des sections de pensées
const QUOTE_SECTIONS = [
  { key: "home", label: "Page Principale" },
  { key: "therapiesAlternatives", label: "Thérapies Alternatives" },
  { key: "sophrologie", label: "Sophrologie" },
  { key: "respirationConsciente", label: "Respiration consciente" },
  { key: "relationAide", label: "Relation d'aide" },
  { key: "soinsEnergetiques", label: "Soins énergétiques" },
  { key: "reiki", label: "Reiki" },
  { key: "developpementPersonnel", label: "Développement personnel" },
  { key: "consultationEntreprise", label: "Consultation entreprise" },
];

export default function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState({});

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const { data } = await getQuotes();

        const initial = {};
        QUOTE_SECTIONS.forEach(({ key }) => {
          initial[key] = {
            current: data[key] || "",
            draft: "",
            status: "idle",
            errorMessage: "",
          };
        });
        setQuotes(initial);
      } catch (err) {
        console.error("Erreur chargement pensées:", err);

        const fallback = {};
        QUOTE_SECTIONS.forEach(({ key }) => {
          fallback[key] = {
            current: "",
            draft: "",
            status: "error",
            errorMessage: "Impossible de charger la pensée actuelle.",
          };
        });
        setQuotes(fallback);
      }
    }

    fetchQuotes();
  }, []);

  const handleChangeDraft = (key, value) => {
    setQuotes((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { current: "", status: "idle", errorMessage: "" }),
        draft: value,
        status: "idle",
        errorMessage: "",
      },
    }));
  };

  const handleSave = async (key) => {
    const item = quotes[key];
    if (!item) return;

    const newText = item.draft.trim();

    if (!newText) {
      setQuotes((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: "error",
          errorMessage: "La pensée ne peut pas être vide.",
        },
      }));
      return;
    }

    setQuotes((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: "saving", errorMessage: "" },
    }));

    try {
      await updateQuote(key, newText);

      setQuotes((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          current: newText,
          draft: "",
          status: "success",
          errorMessage: "",
        },
      }));
    } catch (err) {
      console.error("Erreur sauvegarde pensée:", err);

      setQuotes((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: "error",
          errorMessage: "Une erreur est survenue, veuillez réessayer.",
        },
      }));
    }
  };

  return (
    <Page>
      <Header>
        <Title>Pensées – Gestion du contenu</Title>
        <BackButton onClick={() => navigate("/dashboard")}>
          ← Tableau de bord
        </BackButton>
      </Header>

      <SmallInfo>
        Modifiez les pensées affichées sur les différentes pages du site. Gardez
        la longueur à 1-2 phrases maximum, sinon le visuel n'est pas garantie.
        Écrivez la nouvelle pensée, puis cliquez sur{" "}
        <strong>Publier la pensée</strong>.
      </SmallInfo>

      <Content>
        {QUOTE_SECTIONS.map(({ key, label }) => {
          const item = quotes[key] || {
            current: "",
            draft: "",
            status: "idle",
            errorMessage: "",
          };
          const isSaving = item.status === "saving";
          const isSuccess = item.status === "success";
          const isError = item.status === "error";

          return (
            <Card key={key}>
              <CardTitle>{label}</CardTitle>

              <Label>
                <TextArea
                  value={item.draft}
                  onChange={(e) => handleChangeDraft(key, e.target.value)}
                  placeholder={
                    item.current
                      ? `Pensée actuelle : ${item.current}`
                      : "Aucune pensée enregistrée pour l'instant."
                  }
                />
              </Label>

              <ActionsRow>
                <SaveButton onClick={() => handleSave(key)} disabled={isSaving}>
                  {isSaving ? "Publication..." : "Publier la pensée"}
                </SaveButton>

                {isSuccess && (
                  <StatusText>✅ Pensée mise à jour avec succès.</StatusText>
                )}

                {isError && (
                  <StatusText $error>
                    ⚠ {item.errorMessage || "Erreur lors de la mise à jour."}
                  </StatusText>
                )}
              </ActionsRow>
            </Card>
          );
        })}
      </Content>
    </Page>
  );
}