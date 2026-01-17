import { useEffect, useMemo, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

import {
  getAdminCatalog,
  createAdminActivity,
  updateAdminActivity,
  deleteAdminActivity,
  updateAdminLocation,
  createAdminSlot,
  updateAdminSlot,
  deleteAdminSlot,
} from "../lib/api";

/** ========= Style: identique Capsules ========= */
const COLOR_BASE = "#E87461";
const COLOR_ACCENT = "#EBA844";
const FALLBACK_THUMB = "/assets/images/therapies/sophrologie.jpg";

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
  &:hover { background: ${COLOR_BASE}10; }
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
  &:hover { opacity: 0.95; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
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

const Content = styled.section`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
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
  width: 60px;
  height: 50px;
  object-fit: cover;
  border-radius: 12px;
  background: #f3f3f3;
  border: 1px solid #eee;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 20px;
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

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 20px 0;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
  align-items: center;
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

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SessionRow = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const SessionLabel = styled.div`
  font-weight: 800;
  color: #333;
  font-size: 13px;
`;

const SessionMeta = styled.div`
  font-size: 12px;
  color: #666;
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
  max-width: 980px;
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
  @media (max-width: 860px) { grid-template-columns: 1fr; }
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
  margin-bottom: 10px;
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
  min-height: 90px;
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

/** ========= Pricing Preview ========= */
const PreviewWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 14px 0;
`;

const PricingCard = styled.div`
  width: 360px;
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(230, 91, 67, 0.95), rgba(194, 137, 53, 0.95));
  box-shadow: 0 14px 35px rgba(224, 83, 83, 0.25);
  color: #fff;
`;

const PTitle = styled.h4`
  margin: 2px 0 10px 0;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.2px;
`;

const PDesc = styled.div`
  text-align: center;
  font-weight: 700;
  opacity: 0.95;
  line-height: 1.35;
`;

const PItemsBox = styled.div`
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.18);
`;

const PItem = styled.div`
  text-align: center;
  font-weight: 800;
  padding: 6px 0;
`;

const PSub = styled.div`
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.9;
  text-align: center;
`;

/** ================= Helpers ================= */

function ensureType(activity, key) {
  const found = (activity.types || []).find((t) => t.key === key);
  if (found) return found;

  // fallback minimal
  return {
    id: null,
    key,
    label: key === "group" ? "Cours de groupe" : "Séance privée",
    locations: [],
  };
}

function ensureLocation(typeObj) {
  const l0 = typeObj?.locations?.[0];
  if (l0) return l0;

  return {
    id: null,
    key: "main",
    name: "",
    external: false,
    flexible: typeObj?.key === "private",
    link: "",
    phone: "",
    pricingTitleOverride: "",
    pricingDescription1: "",
    pricingDescription2: "",
    pricingSubtext: "",
    pricingHidden: false,
    slots: [],
    sessions: [],
  };
}

function pricingPreviewModel({ actName, loc }) {
  const title = loc?.pricingTitleOverride || actName || "Titre";
  const d1 = loc?.pricingDescription1 ?? "";
  const d2 = loc?.pricingDescription2 ?? "";
  const sub = loc?.pricingSubtext ?? "";
  const items = Array.isArray(loc?.sessions) ? loc.sessions : [];
  return { title, d1, d2, sub, items };
}

function emptyActivityForm() {
  return {
    id: null,
    slug: "",
    name: "",
    image: "",
    order: 0,

    // UI selection : group|private
    activeTypeKey: "private",

    types: [
      {
        id: null,
        key: "private",
        label: "Séance privée",
        order: 0,
        locations: [ensureLocation({ key: "private" })],
      },
      {
        id: null,
        key: "group",
        label: "Cours de groupe",
        order: 0,
        locations: [ensureLocation({ key: "group" })],
      },
    ],
  };
}

/** ================= Component ================= */

export default function AdminTherapiesCatalogPage() {
  const navigate = useNavigate();
  const DOMAIN = "therapies";

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ ok: "", error: "" });

  const [form, setForm] = useState(emptyActivityForm());

  const originalSlotsRef = useRef({});

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await getAdminCatalog(DOMAIN);
      setCatalog(data);
    } catch (e) {
      console.error("[Admin Catalog] load error:", e);
      setErr("Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const activities = catalog?.activities || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = [...activities];

    // garder order DB
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return arr.filter((a) => {
      if (!q) return true;
      const t0 = a?.types?.[0];
      const l0 = t0?.locations?.[0];
      return (
        (a.name || "").toLowerCase().includes(q) ||
        (a.slug || "").toLowerCase().includes(q) ||
        (t0?.key || "").toLowerCase().includes(q) ||
        (l0?.name || "").toLowerCase().includes(q)
      );
    });
  }, [activities, query]);

  const openCreate = () => {
    setMode("create");
    setForm(emptyActivityForm());
    setStatus({ ok: "", error: "" });
    setOpen(true);
  };

  const openEdit = (activity) => {
    setMode("edit");

    const tPrivate = ensureType(activity, "private");
    const tGroup = ensureType(activity, "group");

    const formNext = {
      ...emptyActivityForm(),
      ...activity,
      // si activity a 1 seul type en DB, on le prend comme “actif”
      activeTypeKey: activity?.types?.[0]?.key || "private",
      types: [
        {
          ...tPrivate,
          locations: [(tPrivate?.locations || []).map((l) => ({ ...l, slots: l?.slots || [], sessions: l?.sessions || [] }))[0] || ensureLocation({ key: "private" })],
        },
        {
          ...tGroup,
          locations: [(tGroup?.locations || []).map((l) => ({ ...l, slots: l?.slots || [], sessions: l?.sessions || [] }))[0] || ensureLocation({ key: "group" })],
        },
      ],
    };

    setForm(formNext);
    const activeKey = formNext.activeTypeKey;
    const t = (formNext.types || []).find(x => x.key === activeKey) || formNext.types?.[0];
    const l = t?.locations?.[0];

    if (l?.id) {
      originalSlotsRef.current[l.id] = (l.slots || [])
        .map(s => s.id)
        .filter(Boolean);
    }
    setStatus({ ok: "", error: "" });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
  };

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const setActiveTypeKey = (key) => setForm((p) => ({ ...p, activeTypeKey: key }));

  const getActiveTypeLoc = () => {
    const t = (form.types || []).find((x) => x.key === form.activeTypeKey) || form.types?.[0];
    const loc = t?.locations?.[0];
    return { t, loc };
  };

  const setLocField = (field, value) => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      if (!next.types[idx].locations?.length) next.types[idx].locations = [ensureLocation(next.types[idx])];
      next.types[idx].locations[0][field] = value;
      return next;
    });
  };

  const addSession = () => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      if (!next.types[idx].locations?.length) next.types[idx].locations = [ensureLocation(next.types[idx])];

      const sessions = next.types[idx].locations[0].sessions || [];
      sessions.push({
        id: null,
        publicId: `new-${Date.now()}`,
        label: "Séance de 1h",
        price: 80,
        durationMinutes: 60,
        durationText: null,
        order: sessions.length,
      });
      next.types[idx].locations[0].sessions = sessions;
      return next;
    });
  };

  const updateSession = (sessIdx, field, value) => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      const sessions = next.types[idx].locations?.[0]?.sessions || [];
      if (!sessions[sessIdx]) return p;
      sessions[sessIdx][field] = value;
      next.types[idx].locations[0].sessions = sessions;
      return next;
    });
  };

  const removeSession = (sessIdx) => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      next.types[idx].locations?.[0]?.sessions?.splice(sessIdx, 1);
      return next;
    });
  };

  const addSlot = () => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      if (!next.types[idx].locations?.length) next.types[idx].locations = [ensureLocation(next.types[idx])];

      const slots = next.types[idx].locations[0].slots || [];
      slots.push({ id: null, day: "Lundi", time: "09:00" });
      next.types[idx].locations[0].slots = slots;
      return next;
    });
  };

  const updateSlot = (slotIdx, field, value) => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      const slots = next.types[idx].locations?.[0]?.slots || [];
      if (!slots[slotIdx]) return p;
      slots[slotIdx][field] = value;
      next.types[idx].locations[0].slots = slots;
      return next;
    });
  };

  const removeSlot = (slotIdx) => {
    setForm((p) => {
      const next = structuredClone(p);
      const idx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (idx === -1) return p;
      next.types[idx].locations?.[0]?.slots?.splice(slotIdx, 1);
      return next;
    });
  };

  const handleSave = async () => {
    setStatus({ ok: "", error: "" });

    if (!form.name.trim()) {
      setStatus({ ok: "", error: "⚠️ Le nom est requis." });
      return;
    }

    const { t, loc } = getActiveTypeLoc();
    if (!t) {
      setStatus({ ok: "", error: "⚠️ Type invalide." });
      return;
    }

    if (!(loc?.name || "").trim()) {
      setStatus({ ok: "", error: "⚠️ Location.name est requis." });
      return;
    }

    setSaving(true);
    try {
      // ✅ slug/image/order : gérés backend => NON modifiables ici
      // On envoie uniquement le minimum éditable.
      const payload = {
        name: form.name.trim(),
        // on envoie seulement le type sélectionné (plus simple)
        types: [
          {
            key: t.key,
            label: t.key === "group" ? "Cours de groupe" : "Séance privée",
            locations: [
              {
                // location key optionnel (mais pratique)
                key: (loc?.key || "main").trim(),
                name: loc.name.trim(),
                external: !!loc.external,
                flexible: !!loc.flexible,
                link: loc.link || "",
                phone: loc.phone || "",

                slots: (loc.slots || []).map((s) => ({
                  id: s.id ?? null,
                  day: String(s.day ?? "").trim(),
                  time: String(s.time ?? "").trim(),
                })),

                pricingTitleOverride: loc.pricingTitleOverride ?? "",
                pricingDescription1: loc.pricingDescription1 ?? "",
                pricingDescription2: loc.pricingDescription2 ?? "",
                pricingSubtext: loc.pricingSubtext ?? "",
                pricingHidden: !!loc.pricingHidden,

                sessions: (loc.sessions || []).map((s, i) => ({
                  id: s.id ?? null,
                  publicId: s.publicId || `sess-${i}`,
                  label: s.label ?? "",
                  price: Number(s.price) || 0,
                  durationMinutes: Number(s.durationMinutes) || null,
                  durationText: s.durationText ?? null,
                  order: Number(s.order) || i,
                })),
              },
            ],
          },
        ],
      };

      if (mode === "create") {
        await createAdminActivity(DOMAIN, payload);
        setStatus({ ok: "✅ Activité créée.", error: "" });
      } else {
        // 1) update nom activité
        await updateAdminActivity(form.id, { name: form.name.trim() });

        // 2) update location (lieu)
        const locationId = loc?.id;
        if (!locationId) throw new Error("Location introuvable (id manquant) en mode edit.");

        await updateAdminLocation(locationId, {
          key: (loc?.key || "main").trim(),
          name: loc.name.trim(),
          external: !!loc.external,
          flexible: !!loc.flexible,
          link: loc.link || null,
          phone: loc.phone || null,
          exactLocation: loc.exactLocation || null,

          pricingTitleOverride: loc.pricingTitleOverride ?? null,
          pricingDescription1: loc.pricingDescription1 ?? null,
          pricingDescription2: loc.pricingDescription2 ?? null,
          pricingSubtext: loc.pricingSubtext ?? null,
          pricingHidden: !!loc.pricingHidden,
        });

        // 3) sync slots (create/update/delete)
        const originalIds = originalSlotsRef.current[locationId] || [];
        const currentSlots = (loc?.slots || [])
          .map(s => ({
            id: s.id ?? null,
            day: (s.day ?? "").trim(),
            time: (s.time ?? "").trim(),
          }))
          .filter(s => s.day && s.time); // ignore lignes vides

        const currentIds = currentSlots.map(s => s.id).filter(Boolean);

        // deletions (ids présents avant, plus présents maintenant)
        const toDelete = originalIds.filter(id => !currentIds.includes(id));

        // creates / updates
        for (const s of currentSlots) {
          if (!s.id) {
            await createAdminSlot(locationId, { day: s.day, time: s.time });
          } else {
            await updateAdminSlot(s.id, { day: s.day, time: s.time });
          }
        }

        // delete
        for (const id of toDelete) {
          await deleteAdminSlot(id);
        }

        // refresh ref pour prochains edits
        originalSlotsRef.current[locationId] = currentSlots.map(s => s.id).filter(Boolean);

        setStatus({ ok: "✅ Activité mise à jour.", error: "" });
      }

      await refresh();
      setOpen(false);
    } catch (e) {
      console.error("[Admin Catalog] save error:", e);
      setStatus({ ok: "", error: e?.message || "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (activity) => {
    const ok = window.confirm(`Supprimer "${activity.name}" ?`);
    if (!ok) return;

    try {
      await deleteAdminActivity(activity.id);
      await refresh();
    } catch (e) {
      console.error("[Admin Catalog] delete error:", e);
      alert("Erreur lors de la suppression.");
    }
  };

  const active = useMemo(() => getActiveTypeLoc(), [form]);
  const preview = pricingPreviewModel({ actName: form.name, loc: active.loc });

  const typeLabel = (key) => (key === "group" ? "En groupe" : "Privée");

  return (
    <Page>
      <Header>
        <Title>Catalogue des offres – Thérapies</Title>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PrimaryButton onClick={openCreate}>+ Ajouter une activité</PrimaryButton>
          <BackButton onClick={() => navigate("/dashboard")}>← Tableau de bord</BackButton>
        </div>
      </Header>

      <SmallInfo>
        Vous pouvez <strong>ajouter</strong>, <strong>modifier</strong>, <strong>masquer</strong> ou <strong>supprimer</strong> des offres d'activités payantes (séance privée, atelier, formation, etc.)
      </SmallInfo>

      <Toolbar>
        <Input
          placeholder="Rechercher (nom, type, endroit)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Toolbar>

      {loading ? (
        <SmallInfo>Chargement...</SmallInfo>
      ) : err ? (
        <StatusText $error>⚠️ {err}</StatusText>
      ) : (
        <Content>
          {filtered.map((a) => {
            const t0 = a?.types?.[0];
            const l0 = t0?.locations?.[0];
            const sessions = l0?.sessions || [];
            const slots = l0?.slots || [];

            return (
              <Card key={a.id}>
                <CardTop>
                  <Thumb
                    src={a.image || FALLBACK_THUMB}
                    alt={a.name}
                    onError={(e) => { e.currentTarget.src = FALLBACK_THUMB; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CardTitle>{a.name}</CardTitle>
                    <Meta>
                      <span><strong>Type:</strong> {typeLabel(t0?.key || "private")}</span>
                      <span><strong>Endroit:</strong> {l0?.name || "—"}</span>
                    </Meta>
                  </div>
                </CardTop>

                <Divider />

                {slots.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontWeight: 800, color: COLOR_BASE }}>Plage horaire</div>

                    <SessionList>
                      {slots.slice(0, 4).map((s, idx) => (
                        <SessionRow key={s.id || idx}>
                          <SessionLabel>{(s.day || "—")}</SessionLabel>
                          <SessionMeta>{(s.time || "—")}</SessionMeta>
                        </SessionRow>
                      ))}
                      {slots.length > 4 && (
                        <div style={{ fontSize: 12, color: "#777" }}>
                          +{slots.length - 4} autres…
                        </div>
                      )}
                    </SessionList>
                    <Divider />
                  </div>
                ) : (
                  <></>
                )}


                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontWeight: 800, color: COLOR_BASE }}>Forfaits</div>
                  {sessions.length ? (
                    <SessionList>
                      {sessions.slice(0, 4).map((s, idx) => (
                        <SessionRow key={s.id || idx}>
                          <SessionLabel>{s.label || "—"}</SessionLabel>
                          <SessionMeta>
                            {s.price ?? "—"}$ •{" "}
                            {s.durationMinutes ? `${s.durationMinutes} min` : (s.durationText || "—")}
                          </SessionMeta>
                        </SessionRow>
                      ))}
                      {sessions.length > 4 && (
                        <div style={{ fontSize: 12, color: "#777" }}>
                          +{sessions.length - 4} autres…
                        </div>
                      )}
                    </SessionList>
                  ) : (
                    <div style={{ fontSize: 13, color: "#777" }}>Aucune session.</div>
                  )}
                </div>

                <ActionsRow>
                  <BtnEdit onClick={() => openEdit(a)}>Modifier</BtnEdit>
                  <BtnDelete onClick={() => handleDelete(a)}>Supprimer</BtnDelete>
                </ActionsRow>
              </Card>
            );
          })}
        </Content>
      )}

      {open && (
        <ModalOverlay onMouseDown={closeModal}>
          <Modal onMouseDown={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {mode === "create" ? "Ajouter une activité (Thérapies)" : "Modifier l’activité"}
              </ModalTitle>
              <BackButton onClick={closeModal}>Fermer</BackButton>
            </ModalHeader>

            {/* ===== Activité (slug/image/order read-only) ===== */}
            <Grid2>
              <Label>
                Nom
                <FieldInput
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </Label>

              <Label>
                Type (groupe / privée)
                <FieldSelect
                  value={form.activeTypeKey}
                  onChange={(e) => setActiveTypeKey(e.target.value)}
                >
                  <option value="private">Privée</option>
                  <option value="group">En groupe</option>
                </FieldSelect>
              </Label>

              <Label>
                Ville / Quartier
                <FieldInput
                  value={active.loc?.name ?? ""}
                  onChange={(e) => setLocField("name", e.target.value)}
                />
              </Label>

              <Label>
                Adresse exacte
                <FieldInput
                  value={active.loc?.exactLocation ?? ""}
                  onChange={(e) => setLocField("exactLocation", e.target.value)}
                  placeholder="ex: 123 Rue X, bureau 4, étage 2"
                />
              </Label>

            </Grid2>

            <Divider />

            {/* ===== Location + Overrides + Sessions (même niveau) ===== */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900, color: COLOR_BASE }}>Plage horaire</div>
              <PrimaryButton type="button" onClick={addSlot}>
                + Ajouter une plage
              </PrimaryButton>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {(active.loc?.slots || []).map((s, idx) => (
                <div key={s.id || idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Label>
                      Jour
                      <FieldInput
                        placeholder="Lundi"
                        value={s.day ?? ""}
                        onChange={(e) => updateSlot(idx, "day", e.target.value)}
                      />
                    </Label>

                    <Label>
                      Heure
                      <FieldInput
                        style={{ width: 160 }}
                        placeholder="09:00"
                        value={s.time ?? ""}
                        onChange={(e) => updateSlot(idx, "time", e.target.value)}
                      />
                    </Label>

                    <BtnDelete type="button" onClick={() => removeSlot(idx)}>
                      Supprimer
                    </BtnDelete>
                  </div>
                </div>
              ))}

              {!active.loc?.slots?.length && (
                <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
                  Aucune plage horaire.
                </div>
              )}
            </div>

            <Divider />

            <Grid2>
              {/* Colonne gauche */}
              <div>

                <div style={{ fontWeight: 900, color: COLOR_BASE, marginBottom: 10 }}>
                  Tarifs
                </div>

                <Label>
                  Titre de la carte
                  <FieldInput
                    value={active.loc?.pricingTitleOverride ?? ""}
                    onChange={(e) => setLocField("pricingTitleOverride", e.target.value)}
                  />
                </Label>

                <Label>
                  Premier sous-titre
                  <FieldInput
                    value={active.loc?.pricingDescription1 ?? ""}
                    onChange={(e) => setLocField("pricingDescription1", e.target.value)}
                  />
                </Label>

                <Label>
                  Deuxième sous-titre
                  <FieldInput
                    value={active.loc?.pricingDescription2 ?? ""}
                    onChange={(e) => setLocField("pricingDescription2", e.target.value)}
                  />
                </Label>

                <Label>
                  Note en sous-texte
                  <TextArea
                    value={active.loc?.pricingSubtext ?? ""}
                    onChange={(e) => setLocField("pricingSubtext", e.target.value)}
                  />
                </Label>

                <Label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!active.loc?.pricingHidden}
                      onChange={(e) => setLocField("pricingHidden", e.target.checked)}
                    />
                    <span style={{ fontSize: 13, color: "#555" }}>
                      Masquer cette carte tarif
                    </span>
                  </div>
                </Label>
              </div>

              {/* Colonne droite: Sessions */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, color: COLOR_BASE }}>Forfaits</div>
                  <PrimaryButton type="button" onClick={addSession}>
                    + Ajouter un forfait
                  </PrimaryButton>
                </div>

                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(active.loc?.sessions || []).map((s, idx) => (
                    <div key={s.id || idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Label>
                          Nom du forfait
                          <FieldInput
                            placeholder="Label"
                            value={s.label ?? ""}
                            onChange={(e) => updateSession(idx, "label", e.target.value)}
                          />
                        </Label>
                        <Label>
                          Prix
                          <FieldInput
                            style={{ width: 120 }}
                            type="number"
                            placeholder="20"
                            value={s.price ?? ""}
                            onChange={(e) => updateSession(idx, "price", Number(e.target.value))}
                          />
                        </Label>
                        <Label>
                          Durée (min)
                          <FieldInput
                            style={{ width: 150 }}
                            type="number"
                            placeholder="120"
                            value={s.durationMinutes ?? ""}
                            onChange={(e) => updateSession(idx, "durationMinutes", Number(e.target.value))}
                          />
                        </Label>
                        <BtnDelete type="button" onClick={() => removeSession(idx)}>
                          Supprimer
                        </BtnDelete>
                      </div>
                    </div>
                  ))}

                  {!active.loc?.sessions?.length && (
                    <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
                      Aucune session.
                    </div>
                  )}
                </div>
              </div>
            </Grid2>

            <Divider />

            {/* ===== Live preview en bas ===== */}
            <div style={{ fontWeight: 900, color: COLOR_BASE, marginBottom: 8 }}>
              Live preview (site)
            </div>

            <PreviewWrap>
              <PricingCard>
                <PTitle>{preview.title || "—"}</PTitle>
                <PDesc>{preview.d1 || "\u00A0"}</PDesc>
                <PDesc style={{ marginTop: 6 }}>{preview.d2 || "\u00A0"}</PDesc>

                <PItemsBox>
                  {(preview.items || []).length ? (
                    preview.items.map((it, idx) => (
                      <PItem key={idx}>
                        {(it.label || "—")} : {it.price ?? "—"} $
                      </PItem>
                    ))
                  ) : (
                    <PItem style={{ opacity: 0.85 }}>—</PItem>
                  )}
                </PItemsBox>

                {!!preview.sub && <PSub>{preview.sub}</PSub>}
              </PricingCard>
            </PreviewWrap>

            <ActionsRow style={{ marginTop: 14 }}>
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