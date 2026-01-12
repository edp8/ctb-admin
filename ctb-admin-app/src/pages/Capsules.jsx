import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  getAdminCapsules,
  createAdminCapsule,
  updateAdminCapsule,
  deleteAdminCapsule,
  getCapsuleUploadUrl,
  getThumbnailUploadUrl,
} from "../lib/api";

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
  max-width: 1100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
  flex-wrap: wrap;
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

const PrimaryButton = styled.button`
  background: linear-gradient(90deg, ${COLOR_BASE}, ${COLOR_ACCENT});
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
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

const SmallInfo = styled.p`
  width: 100%;
  max-width: 1100px;
  font-size: 13px;
  color: #555;
  margin: 0 0 16px 0;
  line-height: 20px;
`;

const Toolbar = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const Input = styled.input`
  width: 100%;
  max-width: 420px;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  font-size: 14px;
  min-width: 0;
  &:focus {
    outline: none;
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 2px ${COLOR_ACCENT}40;
  }
`;

const Select = styled.select`
  width: 260px;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  font-size: 14px;
  min-width: 0;
  &:focus {
    outline: none;
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 2px ${COLOR_ACCENT}40;
  }
`;

const Content = styled.section`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: ${fadeIn} 0.35s ease;
`;

const CardTop = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const Thumb = styled.img`
  width: 110px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  background: #f3f3f3;
  border: 1px solid #eee;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: ${COLOR_ACCENT};
`;

const Meta = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
`;

const Button = styled.button`
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  &:hover { transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

const BtnEdit = styled(Button)`
  background: ${COLOR_BASE}15;
  color: ${COLOR_BASE};
  border: 1px solid ${COLOR_BASE}40;
`;

const BtnDelete = styled(Button)`
  background: #ffecec;
  color: #c0392b;
  border: 1px solid #f3b6b6;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 50;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 760px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
  padding: 16px;

  max-height: 85vh;
  overflow: auto;

  * { box-sizing: border-box; }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${COLOR_BASE};
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #444;
`;

const FieldInput = styled.input`
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  font-size: 14px;
  min-width: 0;
  &:focus {
    outline: none;
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 2px ${COLOR_ACCENT}40;
  }
`;

const FieldSelect = styled.select`
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  font-size: 14px;
  min-width: 0;
  &:focus {
    outline: none;
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 2px ${COLOR_ACCENT}40;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 110px;
  min-width: 0;
  &:focus {
    outline: none;
    border-color: ${COLOR_ACCENT};
    box-shadow: 0 0 0 2px ${COLOR_ACCENT}40;
  }
`;

const StatusText = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${({ $error }) => ($error ? "#c0392b" : "#2e7d32")};
`;

function typeLabel(t) {
  return t === "audio" ? "Audio" : "Vidéo";
}

function emptyForm() {
  return {
    title: "",
    description: "",
    category: "",
    type: "video",
    duration: "",
    price: "",
    date: new Date().toISOString().slice(0, 10),

    // ⚠️ Caché à l’admin (mais requis backend)
    s3Key: "",

    // Affiché uniquement comme preview (image de présentation)
    thumbnail: "",
  };
}

async function uploadToS3PresignedPUT({ url, file }) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error("Upload S3 échoué");
}

export default function CapsulesPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ ok: "", error: "" });

  // fichiers visibles à l’admin
  const [mediaFile, setMediaFile] = useState(null); // mp4 / mp3
  const [thumbFile, setThumbFile] = useState(null); // image/*

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await getAdminCapsules();
      setItems(data?.items || data || []);
    } catch (e) {
      console.error("[Admin Capsules] load error:", e);
      setErr("Impossible de charger les capsules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((c) => (filterType === "all" ? true : c.type === filterType))
      .filter((c) => {
        if (!q) return true;
        return (
          (c.title || "").toLowerCase().includes(q) ||
          (c.category || "").toLowerCase().includes(q)
        );
      });
  }, [items, query, filterType]);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setMediaFile(null);
    setThumbFile(null);
    setStatus({ ok: "", error: "" });
    setOpen(true);
  };

  const openEdit = (capsule) => {
    setMode("edit");
    setEditingId(capsule.id);

    // ✅ On garde s3Key caché (utile si on ne remplace pas le fichier)
    setForm({
      title: capsule.title || "",
      description: capsule.description || "",
      category: capsule.category || "",
      type: capsule.type || "video",
      duration: capsule.duration || "",
      price: capsule.price ?? "",
      date: capsule.date
        ? String(capsule.date).slice(0, 10)
        : new Date().toISOString().slice(0, 10),

      thumbnail: capsule.thumbnail || "",
      s3Key: capsule.s3Key || "",
    });

    setMediaFile(null);
    setThumbFile(null);
    setStatus({ ok: "", error: "" });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
  };

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    if (!form.title.trim()) return "Le titre est requis.";
    if (!form.description.trim()) return "La description est requise.";
    if (!form.category.trim()) return "La catégorie est requise.";
    if (!form.type) return "Le type est requis.";
    if (!form.duration.trim()) return "La durée est requise.";
    if (form.price === "" || Number.isNaN(Number(form.price))) return "Le prix est invalide.";
    if (!form.date) return "La date est requise.";

    // ✅ Création: on exige le fichier capsule (puisqu’on ne montre pas s3Key)
    if (mode === "create" && !mediaFile) {
      return "Veuillez choisir le fichier de la capsule (audio/vidéo).";
    }

    // ✅ Édition: si on ne change pas le fichier, on garde l’ancien s3Key (caché)
    if (mode === "edit" && !mediaFile && !form.s3Key) {
      return "Fichier capsule manquant (s3Key introuvable).";
    }

    return "";
  };

  const handleSave = async () => {
    setStatus({ ok: "", error: "" });

    const v = validate();
    if (v) {
      setStatus({ ok: "", error: v });
      return;
    }

    setSaving(true);
    try {
      let s3Key = form.s3Key; // caché
      let thumbnail = form.thumbnail; // affiché comme preview

      // 1) Upload capsule si un nouveau fichier est choisi
      if (mediaFile) {
        const { data } = await getCapsuleUploadUrl({
          filename: mediaFile.name,
          contentType: mediaFile.type,
        });
        await uploadToS3PresignedPUT({ url: data.url, file: mediaFile });
        s3Key = data.key; // ✅ clé S3 générée par le backend
      }

      // 2) Upload image de présentation si choisie
      if (thumbFile) {
        const { data } = await getThumbnailUploadUrl({
          filename: thumbFile.name,
          contentType: thumbFile.type,
        });
        await uploadToS3PresignedPUT({ url: data.url, file: thumbFile });

        // Selon ton backend: soit publicUrl, soit key
        // Ici on privilégie publicUrl si dispo.
        thumbnail = data.publicUrl || thumbnail || "";
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        type: form.type,
        duration: form.duration.trim(),
        price: Number(form.price),
        date: form.date,

        // requis backend
        s3Key,

        // image preview
        thumbnail: thumbnail || null,
      };

      if (mode === "create") {
        await createAdminCapsule(payload);
        setStatus({ ok: "✅ Capsule créée.", error: "" });
      } else {
        await updateAdminCapsule(editingId, payload);
        setStatus({ ok: "✅ Capsule mise à jour.", error: "" });
      }

      await refresh();
      setOpen(false);
    } catch (e) {
      console.error("[Admin Capsules] save error:", e);
      setStatus({ ok: "", error: "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (capsule) => {
    const ok = window.confirm(
      `Supprimer la capsule "${capsule.title}" ?\n\n⚠️ (Le backend devrait aussi supprimer le fichier dans S3.)`
    );
    if (!ok) return;

    try {
      await deleteAdminCapsule(capsule.id);
      await refresh();
    } catch (e) {
      console.error("[Admin Capsules] delete error:", e);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <Page>
      <Header>
        <Title>Capsules – Gestion du contenu</Title>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PrimaryButton onClick={openCreate}>+ Ajouter une capsule</PrimaryButton>
          <BackButton onClick={() => navigate("/dashboard")}>← Tableau de bord</BackButton>
        </div>
      </Header>

      <SmallInfo>
        Vous pouvez <strong>ajouter</strong>, <strong>modifier</strong> et <strong>supprimer</strong> des capsules.
        <br />
      </SmallInfo>

      <Toolbar>
        <Input
          placeholder="Rechercher (titre ou catégorie)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Tous (audio + vidéo)</option>
          <option value="video">Vidéos</option>
          <option value="audio">Audios</option>
        </Select>
      </Toolbar>

      {loading ? (
        <SmallInfo>Chargement...</SmallInfo>
      ) : err ? (
        <StatusText $error>⚠️ {err}</StatusText>
      ) : (
        <Content>
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardTop>
                <Thumb
                  src={c.thumbnail || "https://via.placeholder.com/220x160?text=Capsule"}
                  alt={c.title}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <CardTitle>{c.title}</CardTitle>
                  <Meta>
                    <span><strong>Type:</strong> {typeLabel(c.type)}</span>
                    <span><strong>Catégorie:</strong> {c.category || "—"}</span>
                    <span><strong>Durée:</strong> {c.duration || "—"}</span>
                    <span><strong>Prix:</strong> {c.price ?? "—"}$</span>
                  </Meta>
                </div>
              </CardTop>

              <div style={{ fontSize: 13, color: "#555", lineHeight: "18px" }}>
                {c.description}
              </div>

              <ActionsRow>
                <BtnEdit onClick={() => openEdit(c)}>Modifier</BtnEdit>
                <BtnDelete onClick={() => handleDelete(c)}>Supprimer</BtnDelete>
              </ActionsRow>
            </Card>
          ))}
        </Content>
      )}

      {open && (
        <ModalOverlay onMouseDown={closeModal}>
          <Modal onMouseDown={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {mode === "create" ? "Ajouter une capsule" : "Modifier la capsule"}
              </ModalTitle>
              <BackButton onClick={closeModal}>Fermer</BackButton>
            </ModalHeader>

            <Grid2>
              <Label>
                Titre
                <FieldInput value={form.title} onChange={(e) => onChange("title", e.target.value)} />
              </Label>

              <Label>
                Catégorie
                <FieldInput value={form.category} onChange={(e) => onChange("category", e.target.value)} />
              </Label>

              <Label>
                Type
                <FieldSelect value={form.type} onChange={(e) => onChange("type", e.target.value)}>
                  <option value="video">Vidéo</option>
                  <option value="audio">Audio</option>
                </FieldSelect>
              </Label>

              <Label>
                Durée (ex: 12m30s)
                <FieldInput value={form.duration} onChange={(e) => onChange("duration", e.target.value)} />
              </Label>

              <Label>
                Prix (ex: 15)
                <FieldInput value={form.price} onChange={(e) => onChange("price", e.target.value)} />
              </Label>

              <Label>
                Date
                <FieldInput type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
              </Label>
            </Grid2>

            <div style={{ marginTop: 10 }}>
              <Label>
                Description
                <TextArea value={form.description} onChange={(e) => onChange("description", e.target.value)} />
              </Label>
            </div>

            <Grid2 style={{ marginTop: 10 }}>
              <Label>
                Image de présentation
                <FieldInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                />
              </Label>

              <Label>
                Fichier capsule (audio/vidéo)
                <FieldInput
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </Label>
            </Grid2>

            <SmallInfo style={{ marginTop: 10 }}>
              {mode === "create" ? (
                <>ℹ️ Pour créer une capsule, choisissez au minimum le <strong>fichier capsule</strong>.</>
              ) : (
                <>ℹ️ En modification, si vous ne choisissez pas de fichier capsule, l’ancien fichier est conservé.</>
              )}
            </SmallInfo>

            <ActionsRow style={{ marginTop: 14, alignItems: "center" }}>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                {saving ? "Sauvegarde..." : mode === "create" ? "Créer" : "Mettre à jour"}
              </PrimaryButton>

              {status.ok && <StatusText>{status.ok}</StatusText>}
              {status.error && <StatusText $error>⚠️ {status.error}</StatusText>}
            </ActionsRow>
          </Modal>
        </ModalOverlay>
      )}
    </Page>
  );
}