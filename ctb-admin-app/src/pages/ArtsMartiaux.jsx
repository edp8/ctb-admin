import { useEffect, useMemo, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

import {
  getAdminCatalog,
  createAdminActivity,
  updateAdminActivity,
  deleteAdminActivity,

  createAdminActivityType,
  // updateAdminActivityType, // (pas utilisé ici)
  // deleteAdminActivityType, // (pas utilisé ici)

  createAdminLocation,
  updateAdminLocation,
  deleteAdminLocation, // ✅ AJOUTE ceci dans lib/api si absent

  createAdminSlot,
  updateAdminSlot,
  deleteAdminSlot,

  createAdminCatalogSession,
  updateAdminCatalogSession,
  deleteAdminCatalogSession,
} from "../lib/api";

/** ========= Style: version Arts Martiaux (bleu) ========= */
const COLOR_BASE = "#0B5FA6";
const COLOR_ACCENT = "#2FA8FF";
const FALLBACK_THUMB = "/assets/images/arts/martial.jpg";

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
  background: linear-gradient(180deg, rgba(11, 95, 166, 0.95), rgba(47, 168, 255, 0.95));
  box-shadow: 0 14px 35px rgba(11, 95, 166, 0.22);
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

function slugify(str = "") {
  return String(str)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function typeLabel(key) {
  return key === "group" ? "En groupe" : "Privée";
}

function ensureType(activity, key) {
  const found = (activity.types || []).find((t) => t.key === key);
  if (found) return found;

  return {
    id: null,
    key,
    label: key === "group" ? "Cours de groupe" : "Séance privée",
    locations: [],
  };
}

function ensureLocation(typeObj) {
  return {
    id: null,
    key: "main",
    name: "",
    external: false,
    flexible: typeObj?.key === "private",
    link: "",
    phone: "",
    exactLocation: "",
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

    activeTypeKey: "group",     // souvent plus logique en arts martiaux
    activeLocationIdx: 0,       // ✅ option sélectionnée

    types: [
      {
        id: null,
        key: "group",
        label: "Cours de groupe",
        order: 0,
        locations: [ensureLocation({ key: "group" })],
      },
      {
        id: null,
        key: "private",
        label: "Séance privée",
        order: 0,
        locations: [ensureLocation({ key: "private" })],
      },
    ],
  };
}

/** ================= Component ================= */

export default function AdminMartialArtsCatalogPage() {
  const navigate = useNavigate();
  const DOMAIN = "arts-martiaux";

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ ok: "", error: "" });

  const [form, setForm] = useState(emptyActivityForm());

  // ✅ mémoires pour sync delete/create/update
  const originalLocationIdsRef = useRef({}); // { [typeId]: string[] }
  const originalSlotsRef = useRef({});       // { [locationId]: string[] }
  const originalSessionsRef = useRef({});    // { [locationId]: string[] }

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
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return arr.filter((a) => {
      if (!q) return true;

      const types = a?.types || [];
      const anyMatch = (a.name || "").toLowerCase().includes(q) || (a.slug || "").toLowerCase().includes(q);

      const typeMatch = types.some((t) => {
        const locs = t?.locations || [];
        return (
          (t?.key || "").toLowerCase().includes(q) ||
          locs.some((l) => (l?.name || "").toLowerCase().includes(q))
        );
      });

      return anyMatch || typeMatch;
    });
  }, [activities, query]);

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
  };

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const setActiveTypeKey = (key) =>
    setForm((p) => ({ ...p, activeTypeKey: key, activeLocationIdx: 0 }));

  const setActiveLocationIdx = (idx) =>
    setForm((p) => ({ ...p, activeLocationIdx: idx }));

  const getActiveTypeLoc = () => {
    const t =
      (form.types || []).find((x) => x.key === form.activeTypeKey) ||
      form.types?.[0];

    const locs = t?.locations || [];
    const safeIdx = Math.max(0, Math.min(form.activeLocationIdx ?? 0, locs.length - 1));
    const loc = locs[safeIdx] || locs[0];

    return { t, loc, locIdx: safeIdx, locs };
  };

  const active = useMemo(() => getActiveTypeLoc(), [form]);

  // ---------- Mutateurs qui pointent sur (type actif + option active) ----------
  const setLocField = (field, value) => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      next.types[tIdx].locations = next.types[tIdx].locations || [];
      if (!next.types[tIdx].locations.length) next.types[tIdx].locations = [ensureLocation(next.types[tIdx])];

      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, next.types[tIdx].locations.length - 1));
      next.types[tIdx].locations[lIdx][field] = value;
      return next;
    });
  };

  const addLocationOption = () => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      next.types[tIdx].locations = next.types[tIdx].locations || [];
      next.types[tIdx].locations.push(ensureLocation(next.types[tIdx]));
      next.activeLocationIdx = next.types[tIdx].locations.length - 1;
      return next;
    });
  };

  const removeLocationOption = () => {
    const { t, locIdx } = active;
    if (!t) return;
    if ((t.locations || []).length <= 1) return;

    const ok = window.confirm("Supprimer cette option ?");
    if (!ok) return;

    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      const locs = next.types[tIdx].locations || [];
      const rmIdx = Math.max(0, Math.min(locIdx, locs.length - 1));
      locs.splice(rmIdx, 1);

      next.types[tIdx].locations = locs;
      next.activeLocationIdx = Math.max(0, rmIdx - 1);
      return next;
    });
  };

  const addSession = () => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      next.types[tIdx].locations = next.types[tIdx].locations || [];
      if (!next.types[tIdx].locations.length) next.types[tIdx].locations = [ensureLocation(next.types[tIdx])];

      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, next.types[tIdx].locations.length - 1));
      const loc = next.types[tIdx].locations[lIdx];

      loc.sessions = loc.sessions || [];
      loc.sessions.push({
        id: null,
        publicId: `new-${Date.now()}`,
        label: "Forfait",
        price: 0,
        durationMinutes: null,
        durationText: null,
        order: loc.sessions.length,
      });

      return next;
    });
  };

  const updateSession = (sessIdx, field, value) => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      const locs = next.types[tIdx].locations || [];
      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, locs.length - 1));
      const loc = locs[lIdx];
      if (!loc?.sessions?.[sessIdx]) return p;

      loc.sessions[sessIdx][field] = value;
      return next;
    });
  };

  const removeSession = (sessIdx) => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      const locs = next.types[tIdx].locations || [];
      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, locs.length - 1));
      const loc = locs[lIdx];
      if (!loc) return p;

      loc.sessions = loc.sessions || [];
      loc.sessions.splice(sessIdx, 1);
      loc.sessions = loc.sessions.map((s, i) => ({ ...s, order: i }));
      return next;
    });
  };

  const addSlot = () => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      next.types[tIdx].locations = next.types[tIdx].locations || [];
      if (!next.types[tIdx].locations.length) next.types[tIdx].locations = [ensureLocation(next.types[tIdx])];

      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, next.types[tIdx].locations.length - 1));
      const loc = next.types[tIdx].locations[lIdx];

      loc.slots = loc.slots || [];
      loc.slots.push({ id: null, day: "Mardi", time: "19:00" });
      return next;
    });
  };

  const updateSlot = (slotIdx, field, value) => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      const locs = next.types[tIdx].locations || [];
      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, locs.length - 1));
      const loc = locs[lIdx];
      if (!loc?.slots?.[slotIdx]) return p;

      loc.slots[slotIdx][field] = value;
      return next;
    });
  };

  const removeSlot = (slotIdx) => {
    setForm((p) => {
      const next = structuredClone(p);
      const tIdx = next.types.findIndex((x) => x.key === next.activeTypeKey);
      if (tIdx === -1) return p;

      const locs = next.types[tIdx].locations || [];
      const lIdx = Math.max(0, Math.min(next.activeLocationIdx ?? 0, locs.length - 1));
      const loc = locs[lIdx];
      if (!loc) return p;

      loc.slots = loc.slots || [];
      loc.slots.splice(slotIdx, 1);
      return next;
    });
  };

  // ---------- Open Create / Edit ----------
  const openCreate = () => {
    setMode("create");
    setForm(emptyActivityForm());
    setStatus({ ok: "", error: "" });
    setOpen(true);
  };

  const openEdit = (activity) => {
    setMode("edit");

    const tGroup = ensureType(activity, "group");
    const tPrivate = ensureType(activity, "private");

    // on garde *toutes* les locations
    const normalizeType = (t) => ({
      ...t,
      locations: (t?.locations || []).map((l) => ({
        ...l,
        slots: l?.slots || [],
        sessions: l?.sessions || [],
      })),
    });

    const types = [normalizeType(tGroup), normalizeType(tPrivate)];

    const firstExistingTypeKey = (activity?.types?.[0]?.key) || "group";

    const formNext = {
      ...emptyActivityForm(),
      ...activity,
      activeTypeKey: firstExistingTypeKey,
      activeLocationIdx: 0,
      types,
    };

    setForm(formNext);

    // ✅ snapshot des ids (pour delete)
    for (const t of (formNext.types || [])) {
      if (t?.id) {
        originalLocationIdsRef.current[t.id] = (t.locations || []).map(l => l.id).filter(Boolean);

        for (const l of (t.locations || [])) {
          if (l?.id) {
            originalSlotsRef.current[l.id] = (l.slots || []).map(s => s.id).filter(Boolean);
            originalSessionsRef.current[l.id] = (l.sessions || []).map(s => s.id).filter(Boolean);
          }
        }
      }
    }

    setStatus({ ok: "", error: "" });
    setOpen(true);
  };

  // ---------- Sync helpers ----------
  const normalizeSlots = (loc) =>
    (loc?.slots || [])
      .map((s) => ({
        id: s.id ?? null,
        day: String(s.day ?? "").trim(),
        time: String(s.time ?? "").trim(),
      }))
      .filter((s) => s.day && s.time);

  const normalizeSessions = (loc) =>
    (loc?.sessions || [])
      .map((s, i) => ({
        id: s.id ?? null,
        publicId: String(s.publicId || `sess-${i}`).trim(),
        label: String(s.label ?? "").trim(),
        price: Number(s.price) || 0,
        durationMinutes: s.durationMinutes === "" ? null : (Number(s.durationMinutes) || null),
        durationText: s.durationText ?? null,
        order: Number.isFinite(Number(s.order)) ? Number(s.order) : i,
      }))
      .filter((s) => s.label && s.publicId);

  async function syncSlots(locationId, loc) {
    const originalIds = originalSlotsRef.current[locationId] || [];
    const current = normalizeSlots(loc);

    const currentIds = current.map((s) => s.id).filter(Boolean);
    const toDelete = originalIds.filter((id) => !currentIds.includes(id));

    for (const s of current) {
      if (!s.id) await createAdminSlot(locationId, { day: s.day, time: s.time });
      else await updateAdminSlot(s.id, { day: s.day, time: s.time });
    }
    for (const id of toDelete) await deleteAdminSlot(id);

    originalSlotsRef.current[locationId] = current.map((s) => s.id).filter(Boolean);
  }

  async function syncSessions(locationId, loc) {
    const originalIds = originalSessionsRef.current[locationId] || [];
    const current = normalizeSessions(loc);

    const currentIds = current.map((s) => s.id).filter(Boolean);
    const toDelete = originalIds.filter((id) => !currentIds.includes(id));

    for (const s of current) {
      if (!s.id) {
        await createAdminCatalogSession(locationId, {
          publicId: s.publicId,
          label: s.label,
          price: s.price,
          durationMinutes: s.durationMinutes,
          durationText: s.durationText,
          order: s.order,
        });
      } else {
        await updateAdminCatalogSession(s.id, {
          publicId: s.publicId,
          label: s.label,
          price: s.price,
          durationMinutes: s.durationMinutes,
          durationText: s.durationText,
          order: s.order,
        });
      }
    }

    for (const id of toDelete) await deleteAdminCatalogSession(id);

    originalSessionsRef.current[locationId] = current.map((s) => s.id).filter(Boolean);
  }

  async function syncLocationsForType(typeId, locs) {
    const originalLocIds = originalLocationIdsRef.current[typeId] || [];
    const currentLocIds = (locs || []).map((l) => l.id).filter(Boolean);
    const toDeleteLocs = originalLocIds.filter((id) => !currentLocIds.includes(id));

    // delete removed locations
    for (const locId of toDeleteLocs) {
      await deleteAdminLocation(locId);
      delete originalSlotsRef.current[locId];
      delete originalSessionsRef.current[locId];
    }

    // create/update all current locations + children
    const ensuredIds = [];

    for (const l of (locs || [])) {
      const payload = {
        key: (l.key || "main").trim(),
        name: (l.name || "").trim(),
        external: !!l.external,
        flexible: !!l.flexible,
        link: (l.link || "").trim() || null,
        phone: (l.phone || "").trim() || null,
        exactLocation: (l.exactLocation || "").trim() || null,

        pricingTitleOverride: (l.pricingTitleOverride || "").trim() || null,
        pricingDescription1: (l.pricingDescription1 || "").trim() || null,
        pricingDescription2: (l.pricingDescription2 || "").trim() || null,
        pricingSubtext: (l.pricingSubtext || "").trim() || null,
        pricingHidden: !!l.pricingHidden,
      };

      let locationId = l.id;

      if (!locationId) {
        const createdRes = await createAdminLocation(typeId, payload);
        const created = createdRes?.data || createdRes;
        locationId = created?.id;

        originalSlotsRef.current[locationId] = [];
        originalSessionsRef.current[locationId] = [];
      } else {
        console.log("exactLocation payload =", payload.exactLocation);
        await updateAdminLocation(locationId, payload);
      }

      ensuredIds.push(locationId);

      await syncSlots(locationId, l);
      await syncSessions(locationId, l);
    }

    originalLocationIdsRef.current[typeId] = ensuredIds;
  }

  // ---------- Save ----------
  const handleSave = async () => {
    setStatus({ ok: "", error: "" });

    if (!form.name.trim()) {
      setStatus({ ok: "", error: "⚠️ Le nom est requis." });
      return;
    }

    // au moins 1 type avec au moins 1 option nommée
    const hasAnyNamedOption = (form.types || []).some((t) =>
      (t.locations || []).some((l) => (l.name || "").trim())
    );
    if (!hasAnyNamedOption) {
      setStatus({ ok: "", error: "⚠️ Ajoute au moins une option (nom) dans un type." });
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        // 1) create activity
        const createdActivityRes = await createAdminActivity(DOMAIN, {
          slug: slugify(form.name),
          name: form.name.trim(),
          image: form.image || "",
        });

        const createdActivity = createdActivityRes?.data || createdActivityRes;
        const activityId = createdActivity?.id;

        // 2) create types that have content, then create locations + children
        for (const t of (form.types || [])) {
          const locs = (t.locations || []).filter((l) => (l.name || "").trim());

          if (!locs.length) continue; // skip empty type

          const createdTypeRes = await createAdminActivityType(activityId, {
            key: t.key,
            label: t.key === "group" ? "Cours de groupe" : "Séance privée",
          });

          const createdType = createdTypeRes?.data || createdTypeRes;
          const typeId = createdType?.id;

          // create locations + children (no delete needed in create)
          for (const l of locs) {
            const createdLocRes = await createAdminLocation(typeId, {
              key: (l.key || "main").trim(),
              name: (l.name || "").trim(),
              external: !!l.external,
              flexible: !!l.flexible,
              link: (l.link || "").trim() || null,
              phone: (l.phone || "").trim() || null,
              exactLocation: (l.exactLocation || "").trim() || null,

              pricingTitleOverride: (l.pricingTitleOverride || "").trim() || null,
              pricingDescription1: (l.pricingDescription1 || "").trim() || null,
              pricingDescription2: (l.pricingDescription2 || "").trim() || null,
              pricingSubtext: (l.pricingSubtext || "").trim() || null,
              pricingHidden: !!l.pricingHidden,
            });

            const createdLoc = createdLocRes?.data || createdLocRes;
            const locationId = createdLoc?.id;

            for (const s of normalizeSlots(l)) {
              await createAdminSlot(locationId, { day: s.day, time: s.time });
            }

            for (const s of normalizeSessions(l)) {
              await createAdminCatalogSession(locationId, {
                publicId: s.publicId,
                label: s.label,
                price: s.price,
                durationMinutes: s.durationMinutes,
                durationText: s.durationText,
                order: s.order,
              });
            }
          }
        }

        setStatus({ ok: "✅ Activité créée.", error: "" });
      } else {
        // EDIT
        await updateAdminActivity(form.id, { name: form.name.trim() });

        // pour chaque type : s'il existe -> sync locations
        // si type id manquant mais contenu => on le crée puis on sync
        for (const t of (form.types || [])) {
          const locs = (t.locations || []).filter((l) => (l.name || "").trim());
          const hasContent = locs.length > 0;

          let typeId = t.id;

          if (!typeId && hasContent) {
            const createdTypeRes = await createAdminActivityType(form.id, {
              key: t.key,
              label: t.key === "group" ? "Cours de groupe" : "Séance privée",
            });
            const createdType = createdTypeRes?.data || createdTypeRes;
            typeId = createdType?.id;

            originalLocationIdsRef.current[typeId] = [];
          }

          if (!typeId) continue; // type absent + pas de contenu => skip

          // sync locations + slots + sessions
          await syncLocationsForType(typeId, locs);
        }

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

  // preview basé sur l’option active
  const preview = useMemo(() => pricingPreviewModel({ actName: form.name, loc: active.loc }), [form.name, active.loc]);

  return (
    <Page>
      <Header>
        <Title>Catalogue des offres – Arts martiaux</Title>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PrimaryButton onClick={openCreate}>+ Ajouter une activité</PrimaryButton>
          <BackButton onClick={() => navigate("/dashboard")}>← Tableau de bord</BackButton>
        </div>
      </Header>

      <SmallInfo>
        Vous pouvez <strong>ajouter</strong>, <strong>modifier</strong> ou <strong>supprimer</strong> des offres d'activités (cours, stages, offres spéciales, etc.)
      </SmallInfo>

      <Toolbar>
        <Input
          placeholder="Rechercher (nom, type, option)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Toolbar>

      {/* ===== LISTE (aperçu compact) ===== */}
      {loading ? (
        <SmallInfo>Chargement...</SmallInfo>
      ) : err ? (
        <StatusText $error>⚠️ {err}</StatusText>
      ) : (
        <Content>
          {filtered.map((a) => {
            const types = a?.types || [];

            // flatten: chaque "offre" = location, rattachée à un type
            const offers = types.flatMap((t) =>
              (t?.locations || []).map((l) => ({
                typeKey: t?.key,
                typeLabel: typeLabel(t?.key),
                loc: l,
              }))
            );

            return (
              <Card key={a.id} style={{ gap: 8, padding: 14 }}>
                {/* Header activité */}
                <CardTop style={{ alignItems: "center" }}>
                  <Thumb
                    src={a.image || FALLBACK_THUMB}
                    alt={a.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_THUMB;
                    }}
                    style={{ width: 54, height: 46 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CardTitle style={{ fontSize: 18 }}>{a.name}</CardTitle>
                    <Meta style={{ marginTop: 2 }}>
                      <span>
                        <strong>Types:</strong>{" "}
                        {(types || []).map((t) => typeLabel(t.key)).join(" + ") || "—"}
                      </span>
                      <span>
                        <strong>Offres:</strong> {offers.length}
                      </span>
                    </Meta>
                  </div>
                </CardTop>

                <Divider style={{ margin: "10px 0" }} />

                {/* Offres (locations) */}
                {offers.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {offers.map(({ typeLabel, loc }, i) => {
                      const slots = loc?.slots || [];
                      const sessions = (loc?.sessions || []).slice().sort((x, y) => (x.order ?? 0) - (y.order ?? 0));

                      return (
                        <div
                          key={loc?.id || `${a.id}-offer-${i}`}
                          style={{
                            border: "1px solid #eee",
                            borderRadius: 12,
                            padding: 10,
                            background: "#fff",
                          }}
                        >
                          {/* Titre offre */}
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, gap: 10, flexWrap: "wrap" }}>
                            <div style={{ color: COLOR_BASE, fontSize: 13 }}>
                              {loc?.name?.trim() ? loc.name : `Offre ${i + 1}`}
                            </div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              {typeLabel}
                            </div>
                          </div>

                          {/* Slots + Forfaits en 2 colonnes compactes */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                              marginTop: 8,
                            }}
                          >
                            {/* Slots */}
                            {slots.length ? (
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 6 }}>
                                  Plage horaire
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {slots.slice(0, 4).map((s, idx) => (
                                    <div
                                      key={s.id || idx}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        padding: "6px 8px",
                                        borderRadius: 10,
                                        border: "1px solid #f0f0f0",
                                        background: "#fafafa",
                                        fontSize: 12,
                                      }}
                                    >
                                      <span >{s.day || "—"}</span>
                                      <span style={{ color: "#666" }}>{s.time || "—"}</span>
                                    </div>
                                  ))}
                                  {slots.length > 4 && (
                                    <div style={{ fontSize: 12, color: "#777" }}>
                                      +{slots.length - 4} autres…
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}

                            {/* Forfaits */}
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 6 }}>
                                Forfaits
                              </div>

                              {sessions.length ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {sessions.slice(0, 4).map((s, idx) => (
                                    <div
                                      key={s.id || idx}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        padding: "6px 8px",
                                        borderRadius: 10,
                                        border: "1px solid #f0f0f0",
                                        background: "#fafafa",
                                        fontSize: 12,
                                      }}
                                    >
                                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {s.label || "—"}
                                      </span>
                                      <span style={{ color: "#666" }}>
                                        {s.price ?? "—"}$
                                      </span>
                                    </div>
                                  ))}
                                  {sessions.length > 4 && (
                                    <div style={{ fontSize: 12, color: "#777" }}>
                                      +{sessions.length - 4} autres…
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ fontSize: 12, color: "#777" }}>—</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#777" }}>Aucune offre.</div>
                )}

                <ActionsRow style={{ marginTop: 6 }}>
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
                {mode === "create" ? "Ajouter une activité (Arts martiaux)" : "Modifier l’activité"}
              </ModalTitle>
              <BackButton onClick={closeModal}>Fermer</BackButton>
            </ModalHeader>

            {/* ===== Activité ===== */}
            <Grid2>
              <Label>
                Nom
                <FieldInput
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </Label>

              <Label>
                Type à éditer
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["group", "private"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActiveTypeKey(k)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: `1px solid ${form.activeTypeKey === k ? COLOR_BASE : "#ddd"}`,
                        background: form.activeTypeKey === k ? `${COLOR_BASE}15` : "white",
                        cursor: "pointer",
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      {k === "group" ? "Groupe" : "Privée"}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                  Astuce: tu peux gérer les deux types (ex: Ninjutsu groupe + privé) dans la même activité.
                </div>
              </Label>
            </Grid2>

            <Divider />

            {/* ===== OPTION liée aux plages horaires ===== */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 900, color: COLOR_BASE }}>
                Option (offre et lieu)
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <PrimaryButton type="button" onClick={addLocationOption}>
                  + Ajouter une option
                </PrimaryButton>
                {(active.locs || []).length > 1 && (
                  <BtnDelete type="button" onClick={removeLocationOption}>
                    Supprimer l’option
                  </BtnDelete>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {(active.locs || []).map((l, idx) => {
                const selected = idx === (form.activeLocationIdx ?? 0);
                return (
                  <button
                    key={l.id || `${idx}-${l.key || "loc"}`}
                    type="button"
                    onClick={() => setActiveLocationIdx(idx)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: `1px solid ${selected ? COLOR_BASE : "#ddd"}`,
                      background: selected ? `${COLOR_ACCENT}` : `${COLOR_BASE}15`,
                      cursor: "pointer",
                      fontWeight: 900,
                      fontSize: 13,
                    }}
                  >
                    {(l.name || "").trim() ? l.name : `Option ${idx + 1}`}
                  </button>
                );
              })}
            </div>

            <Grid2 style={{ marginTop: 12 }}>
              <Label>
                Nom de l’option
                <FieldInput
                  value={active.loc?.name ?? ""}
                  onChange={(e) => setLocField("name", e.target.value)}
                  placeholder="ex: Cours à Rock-Forest"
                />
              </Label>

              <Label>
                Adresse exacte
                <FieldInput
                  value={active.loc?.exactLocation ?? ""}
                  onChange={(e) => setLocField("exactLocation", e.target.value)}
                  placeholder="ex: 123 Rue X, bureau 4"
                />
              </Label>
            </Grid2>

            <Divider />

            {/* ===== Slots ===== */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900, color: COLOR_BASE }}>Plages horaires</div>
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
                        placeholder="Mardi"
                        value={s.day ?? ""}
                        onChange={(e) => updateSlot(idx, "day", e.target.value)}
                      />
                    </Label>

                    <Label>
                      Heure
                      <FieldInput
                        style={{ width: 160 }}
                        placeholder="19:00"
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

            {/* ===== Tarifs + Sessions ===== */}
            <Grid2>
              <div>
                <div style={{ fontWeight: 900, color: COLOR_BASE, marginBottom: 10 }}>
                  Carte de tarifs
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
                            placeholder="ex: Cours illimités + 3 séances privées"
                            value={s.label ?? ""}
                            onChange={(e) => updateSession(idx, "label", e.target.value)}
                          />
                        </Label>

                        <Label>
                          Prix
                          <FieldInput
                            style={{ width: 120 }}
                            type="number"
                            placeholder="250"
                            value={s.price ?? ""}
                            onChange={(e) => updateSession(idx, "price", Number(e.target.value))}
                          />
                        </Label>

                        <Label>
                          Durée (min)
                          <FieldInput
                            style={{ width: 150 }}
                            type="number"
                            placeholder="60"
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

            {/* ===== Live preview ===== */}
            <div style={{ fontWeight: 900, color: COLOR_BASE, marginBottom: 8 }}>
              Live preview du site
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