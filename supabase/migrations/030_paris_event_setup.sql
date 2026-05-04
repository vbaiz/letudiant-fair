-- ─────────────────────────────────────────────────────────────────────────────
-- 030_paris_event_setup.sql
-- Phase 1: Complete the "Salon Étudiant Paris 2026" event record.
--
-- Sets:
--   • is_active  = true   (surfaces it as the next upcoming event)
--   • is_virtual = false  (physical event)
--   • entry_qr   = JSON payload for the entry QR scan
--
-- Real event ID: 5efe4822-839f-4d6c-b986-5d0761a0d85a
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.events
SET
  is_active  = true,
  is_virtual = false,
  entry_qr   = '{"type":"entry","eventId":"5efe4822-839f-4d6c-b986-5d0761a0d85a"}',
  updated_at = now()
WHERE id = '5efe4822-839f-4d6c-b986-5d0761a0d85a';
