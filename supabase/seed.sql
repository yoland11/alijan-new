INSERT INTO service_categories (name, slug, sort_order)
VALUES
  ('كوشات', 'koshat', 10),
  ('تصوير', 'photography', 20),
  ('ألبومات', 'albums', 30),
  ('تجهيزات تخرج', 'graduation', 40),
  ('بحوث', 'research', 50),
  ('توزيعات', 'distributions', 60),
  ('هدايا', 'gifts', 70)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO accounts (name, type, balance)
VALUES
  ('الصندوق', 'asset', 0),
  ('ماستر كارد', 'asset', 0),
  ('زين كاش', 'asset', 0),
  ('آسيا حوالة', 'asset', 0),
  ('مصرف', 'asset', 0),
  ('مصاريف', 'expense', 0),
  ('إيرادات', 'income', 0)
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  is_active = true;

WITH palette(color_name, color_hex, sort_order) AS (
  VALUES
    ('أسود', '#000000', 1),
    ('أبيض', '#FFFFFF', 2),
    ('ذهبي', '#D4AF37', 3),
    ('ذهبي هادئ', '#C9A84C', 4),
    ('فضي', '#C0C0C0', 5),
    ('رمادي', '#808080', 6),
    ('رمادي داكن', '#2F2F2F', 7),
    ('أحمر', '#D32F2F', 8),
    ('عنابي', '#800020', 9),
    ('وردي', '#E91E63', 10),
    ('وردي فاتح', '#F8BBD0', 11),
    ('بنفسجي', '#7B1FA2', 12),
    ('ليلكي', '#B39DDB', 13),
    ('أزرق', '#1976D2', 14),
    ('أزرق ملكي', '#0D47A1', 15),
    ('أزرق سماوي', '#81D4FA', 16),
    ('فيروزي', '#00ACC1', 17),
    ('تركواز', '#40E0D0', 18),
    ('أخضر', '#388E3C', 19),
    ('أخضر زمردي', '#009B77', 20),
    ('أخضر زيتوني', '#808000', 21),
    ('نعناعي', '#98FF98', 22),
    ('أصفر', '#FDD835', 23),
    ('خردلي', '#D4A017', 24),
    ('برتقالي', '#F57C00', 25),
    ('خوخي', '#FFCBA4', 26),
    ('بني', '#795548', 27),
    ('بيج', '#F5F5DC', 28),
    ('كريمي', '#FFFDD0', 29),
    ('عاجي', '#FFFFF0', 30),
    ('شمبانيا', '#F7E7CE', 31),
    ('نحاسي', '#B87333', 32),
    ('برونزي', '#CD7F32', 33),
    ('أحمر كرزي', '#C21807', 34),
    ('كحلي', '#001F3F', 35),
    ('موف', '#C8A2C8', 36),
    ('لافندر', '#E6E6FA', 37),
    ('فوشيا', '#FF00FF', 38),
    ('زيتي فاتح', '#A3B18A', 39),
    ('ذهبي وردي', '#B76E79', 40)
)
INSERT INTO product_colors (product_id, color_name, color_hex, sort_order)
SELECT NULL, color_name, color_hex, sort_order
FROM palette p
WHERE NOT EXISTS (
  SELECT 1
  FROM product_colors pc
  WHERE pc.product_id IS NULL
    AND lower(pc.color_hex) = lower(p.color_hex)
);

INSERT INTO settings (
  whatsapp_url,
  instagram_url,
  facebook_url,
  maps_url,
  store_address,
  phone_numbers,
  wrapping_price,
  delivery_fee
)
VALUES (
  'https://wa.me/9647725762520',
  'https://www.instagram.com/koshat_alijan',
  'https://www.facebook.com/share/16vQwtxQPW',
  'https://maps.app.goo.gl/fQAHibh6uYp6HwTx9',
  'طوزخورماتو | شارع العام | مقابل دوز مول',
  '["07729000122", "07725762520"]'::jsonb,
  0,
  0
);

INSERT INTO admin_users (full_name, username, password_hash, role, is_active)
VALUES (
  'المدير الأساسي',
  'admin',
  'scrypt$16384$8$1$uC6kZ217jEk8Kf7yTg_Qiw$_NQo6MiDeHvEy8toEyT8JzLv1859bI-NHs419ibQrWPeIr3IofasxMsA7ida1572nqD4eyr5fIvPFaFXEb4ffA',
  'owner',
  true
)
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = 'owner',
  is_active = true;

WITH owner_user AS (
  SELECT id FROM admin_users WHERE username = 'admin'
),
permissions(permission_key) AS (
  VALUES
    ('view_orders'),
    ('create_order'),
    ('edit_order'),
    ('delete_order'),
    ('change_order_status'),
    ('manage_products'),
    ('manage_services'),
    ('manage_customers'),
    ('manage_inventory'),
    ('manage_accounting'),
    ('create_receipt_voucher'),
    ('create_payment_voucher'),
    ('create_transfer_voucher'),
    ('manage_delivery'),
    ('manage_portfolio'),
    ('manage_reviews'),
    ('manage_settings'),
    ('manage_employees'),
    ('print_invoices'),
    ('view_dashboard')
)
INSERT INTO admin_permissions (user_id, permission_key, allowed)
SELECT owner_user.id, permissions.permission_key, true
FROM owner_user
CROSS JOIN permissions
ON CONFLICT (user_id, permission_key) DO UPDATE SET allowed = true;

NOTIFY pgrst, 'reload schema';
