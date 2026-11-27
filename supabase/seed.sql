-- =============================================================================
-- Nusantara Indah Property - Supabase Permissions, RLS Policies & Seed Data
-- Copy & paste seluruh script ini ke Supabase SQL Editor lalu klik "Run".
-- Script bersifat idempotent (aman dijalankan ulang).
-- =============================================================================

-- 1. Pastikan hak akses role anon & authenticated ke tabel public.properties
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.properties TO authenticated;

-- 2. Aktifkan Row Level Security (RLS) & atur policy tabel public.properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
CREATE POLICY "Public can view properties"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
CREATE POLICY "Authenticated users can insert properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.properties;
CREATE POLICY "Authenticated users can update properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete properties" ON public.properties;
CREATE POLICY "Authenticated users can delete properties"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. Policy Storage untuk bucket "property-images" (public read, admin authenticated write)
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
CREATE POLICY "Authenticated users can update property images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;
CREATE POLICY "Authenticated users can delete property images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

-- 4. Seed data properti awal dari data/properties.ts
INSERT INTO public.properties (
  slug,
  title,
  location,
  price,
  type,
  status,
  bedrooms,
  bathrooms,
  land_area,
  building_area,
  description,
  features,
  images,
  is_featured
)
VALUES
  (
    'cluster-sukamukti-islamic-tipe-36',
    'Cluster Sukamukti Islamic - Tipe 36',
    'Katapang, Bandung, Jawa Barat',
    400000000,
    'Cluster Sukamukti Islamic',
    'DIJUAL',
    2,
    1,
    60,
    36,
    'Pilihan cerdas bagi keluarga modern. Menghadirkan tata ruang yang efisien, fungsional, dan mudah dirawat di tengah lingkungan tenang.',
    ARRAY[
      'Lantai Keramik berkualitas',
      'Kusen Kayu Manglid',
      'Dinding Bata Merah',
      'Pondasi Batu Belah',
      'Besi Struktur 10 SNI',
      'Rangka Atap Baja Ringan',
      'Listrik 1300 Watt',
      'Mesin Air Submersible + Toren Air 300L'
    ],
    ARRAY[
      '/images/Cluster-Sukamukti-Islamic-type36/Area-luar-depan-rumah.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Area-tengah.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Area-tengah-view-1.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Area-tengah-view-2.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Area-toilet.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Kamar-1.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Kamar-2-view.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Loundry-Area.jpeg',
      '/images/Cluster-Sukamukti-Islamic-type36/Loundry-area-view-2.jpeg'
    ],
    true
  ),
  (
    'cluster-sukamukti-islamic-tipe-45',
    'Cluster Sukamukti Islamic - Tipe 45',
    'Katapang, Bandung, Jawa Barat',
    500000000,
    'Cluster Sukamukti Islamic',
    'DIJUAL',
    2,
    1,
    72,
    45,
    'Simbol kemapanan dengan suasana lingkungan Islami yang menenangkan. Tipe 45 menawarkan ruang fungsional yang lebih luas, dirancang khusus untuk kenyamanan keluarga dan nilai investasi yang terus bertumbuh.',
    ARRAY[
      'Lantai Granit elegan',
      'Kusen Kayu Manglid',
      'Dinding Bata Merah',
      'Pondasi Batu Belah',
      'Besi Struktur 10 SNI',
      'Rangka Atap Baja Ringan',
      'Listrik 1300 Watt',
      'Mesin Air Submersible + Toren Air 300L'
    ],
    ARRAY[
      '/images/Cluster-Sukamukti-Islamic-type45/Tampak-Depan-Rumah.png',
      '/images/Cluster-Sukamukti-Islamic-type45/Tampak-Ruang-Tengah-(1).png',
      '/images/Cluster-Sukamukti-Islamic-type45/Tampak-Ruang-Tengah.png',
      '/images/Cluster-Sukamukti-Islamic-type45/Tampak-Kamar.png',
      '/images/Cluster-Sukamukti-Islamic-type45/Ruang-Dapur.png',
      '/images/Cluster-Sukamukti-Islamic-type45/Tampak-Dapur.png'
    ],
    false
  ),
  (
    'villa-resik',
    'Villa Resik',
    'Buahbatu, Bandung, Jawa Barat',
    600000000,
    'Villa Resik',
    'TERJUAL',
    2,
    2,
    72,
    60,
    'Mahakarya arsitektur modern yang memadukan efisiensi tata ruang dengan teknologi pintar (smart home).',
    ARRAY[
      'Smart Door Lock System',
      'Pondasi Batu Belah',
      'Besi Struktur 10 SNI',
      'Dinding Bata Merah',
      'Rangka Atap Baja Ringan',
      'Listrik 1300 Watt',
      'Mesin Air Submersible'
    ],
    ARRAY[
      '/images/villa-resik/tampak-depan-rumah.png',
      '/images/villa-resik/ruang-tamu-modern-minimalist-bawah-tangga.png',
      '/images/villa-resik/ruang-keluarga-atas-modern-minimalist.png',
      '/images/villa-resik/kamar-tidur.png',
      '/images/villa-resik/dapur-modern-minimalist.png',
      '/images/villa-resik/toilet.png'
    ],
    true
  ),
  (
    'taman-katapang-indah',
    'Taman Indah Katapang',
    'Katapang, Bandung, Jawa Barat',
    700000000,
    'Taman Indah Katapang',
    'DIJUAL',
    2,
    2,
    84,
    70,
    'Rumah ideal berkonsep asri di lingkungan yang aman dan 100% bebas banjir. Dirancang dengan ruang yang lapang, aksesibilitas strategis.',
    ARRAY[
      '2 Kamar Tidur',
      '1 Kamar Mandi',
      'Pondasi Batu Belah',
      'Besi Struktur 10 SNI',
      'Dinding Bata Merah',
      'Rangka Atap Baja Ringan',
      'Listrik 1300 Watt',
      'Mesin Air Submersible'
    ],
    ARRAY[
      '/images/taman-katapang-indah/rumah-tampak-depan.png',
      '/images/taman-katapang-indah/ruang-tamu.jpg',
      '/images/taman-katapang-indah/kamar-tidur.jpg',
      '/images/taman-katapang-indah/dapur-estetik.jpg',
      '/images/taman-katapang-indah/ruang-kerja.jpg',
      '/images/taman-katapang-indah/balkon-lantai-2.jpg',
      '/images/taman-katapang-indah/kamar-open-view.jpg'
    ],
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  price = EXCLUDED.price,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  bedrooms = EXCLUDED.bedrooms,
  bathrooms = EXCLUDED.bathrooms,
  land_area = EXCLUDED.land_area,
  building_area = EXCLUDED.building_area,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  images = EXCLUDED.images,
  is_featured = EXCLUDED.is_featured;
