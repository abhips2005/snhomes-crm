insert into settings (key, value) values
  ('districts', '["Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha","Kottayam","Idukki","Ernakulam","Thrissur","Palakkad","Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod"]'),
  ('property_types', '["house","villa","plot","apartment","commercial"]'),
  ('whatsapp', '{"phone":"+917356565617","enabled":false}')
on conflict (key) do update set value = excluded.value;

insert into leads (request_id, name, phone, type, district, locality, pincode, property_type, budget_min, budget_max, source, status, request_status, priority, notes) values
  ('SNH-000001', 'Anjali Nair', '7356565617', 'buyer', 'Ernakulam', 'Kakkanad', '682030', 'apartment', 5500000, 8000000, 'Website', 'Matching', 'Matching', 'Hot', 'Looking for a ready-to-move apartment.'),
  ('SNH-000002', 'Rakesh Menon', '9876543210', 'seller', 'Thrissur', 'Guruvayur', '680101', 'villa', null, null, 'Website', 'Contacted', 'Contacted', 'Warm', 'Independent villa near temple route.'),
  ('SNH-000003', 'Fathima Haneef', '9123456780', 'tenant', 'Kozhikode', 'Nadakkavu', null, 'house', 18000, 28000, 'Website', 'Qualified', 'Reviewing', 'Warm', 'Family rental requirement.');

insert into properties (property_id, seller_lead_id, type, status, price, district, locality, area, pincode, description)
select 'PROP-0001', id, 'villa', 'Verified', 9200000, 'Thrissur', 'Guruvayur', '2400 sqft', '680101', 'Premium villa with road access.'
from leads where request_id = 'SNH-000002';

insert into properties (property_id, type, status, price, district, locality, area, pincode, description) values
  ('PROP-0002', 'apartment', 'Live', 6800000, 'Ernakulam', 'Kakkanad', '1450 sqft', '682030', 'Three bedroom apartment near Infopark.'),
  ('PROP-0003', 'plot', 'Pending', 3600000, 'Malappuram', 'Manjeri', '12 cent', '676121', 'Residential plot pending verification.');

insert into activities (action, entity_type, description) values
  ('Lead Created', 'lead', 'SNH-000001 created from buy/rent form'),
  ('Property Added', 'property', 'PROP-0002 imported as live listing'),
  ('Status Changed', 'lead', 'SNH-000001 moved to Matching'),
  ('Visit Scheduled', 'visit', 'Kakkanad apartment visit scheduled');
