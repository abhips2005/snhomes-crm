alter table properties
  add column if not exists bedrooms int,
  add column if not exists bathrooms int,
  add column if not exists sqft numeric,
  add column if not exists land_area text,
  add column if not exists additional_notes text;
