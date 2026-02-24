-- Pastikan RLS aktif
ALTER TABLE data_lembur ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama agar tidak bentrok
DROP POLICY IF EXISTS "Izin_Penuh_Pajar" ON data_lembur;

-- Buat policy baru yang mengizinkan SELECT (Melihat) dan INSERT (Menambah)
CREATE POLICY "Akses_Penuh_Pajar" 
ON public.data_lembur 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
