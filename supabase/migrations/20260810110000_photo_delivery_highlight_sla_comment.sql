-- Align column comment with live waiver SLA (highlight = 1–2 weeks, not 3 days).
comment on column public.tour_bookings.highlight_photos_delivered is
  'Highlight album delivered (business SLA: within 1–2 weeks of trip end).';
