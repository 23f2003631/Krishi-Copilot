-- =============================================================================
-- Tier 2 Tables: Growers, Retailers, Inventory Snapshots (Day 2)
-- =============================================================================

CREATE TABLE IF NOT EXISTS growers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  territory_id TEXT,
  language TEXT NOT NULL,
  device_type TEXT NOT NULL,
  crop TEXT,
  farm_size_acres FLOAT,
  whatsapp_opt_in BOOLEAN DEFAULT true,
  last_engagement_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id TEXT UNIQUE NOT NULL,
  territory_id TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id TEXT REFERENCES retailers(retailer_id),
  product TEXT NOT NULL,
  sku TEXT,
  stock_status TEXT NOT NULL,
  stock_cover_days INT,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Seed: Retailers (20 across 5 territories)
-- =============================================================================
INSERT INTO retailers (retailer_id, territory_id, district, tehsil, name) VALUES
('RTL_0091','TER_001','Kanpur Nagar','Kanpur_Nagar_T023','Sharma Agri Inputs'),
('RTL_0092','TER_001','Kanpur Nagar','Kanpur_Nagar_T023','Kisan Seva Kendra'),
('RTL_0093','TER_001','Kanpur Nagar','Kanpur_Nagar_T023','Gupta Seeds & Pesticides'),
('RTL_0094','TER_001','Kanpur Nagar','Kanpur_Nagar_T023','Patel Crop Care'),
('RTL_0112','TER_001','Kanpur Nagar','Kanpur_Nagar_T023','Village Agro Store'),
('RTL_0201','TER_021','Sikar','Sikar_T011','Rajasthan Krishi Bhavan'),
('RTL_0202','TER_021','Sikar','Sikar_T011','Shekhawati Agro Centre'),
('RTL_0203','TER_021','Sikar','Sikar_T011','Jaipur Seeds Sikar'),
('RTL_0204','TER_021','Sikar','Sikar_T011','Meena Fertilizers'),
('RTL_0205','TER_021','Sikar','Sikar_T011','Kisan Mitra Store'),
('RTL_0301','TER_031','Hooghly','Hooghly_T005','Bengal Agri Solutions'),
('RTL_0302','TER_031','Hooghly','Hooghly_T005','Kolkata Krishi Supply'),
('RTL_0303','TER_031','Hooghly','Hooghly_T005','Dutta Seeds & Sprays'),
('RTL_0304','TER_031','Hooghly','Hooghly_T005','Ghosh Agro Depot'),
('RTL_0401','TER_041','Ratlam','Ratlam_T008','MP Kisan Centre'),
('RTL_0402','TER_041','Ratlam','Ratlam_T008','Malwa Agri Inputs'),
('RTL_0403','TER_041','Ratlam','Ratlam_T008','Ratlam Seeds Store'),
('RTL_0501','TER_051','Yavatmal','Yavatmal_T012','Maharashtra Crop Care'),
('RTL_0502','TER_051','Yavatmal','Yavatmal_T012','Vidarbha Agro Traders'),
('RTL_0503','TER_051','Yavatmal','Yavatmal_T012','Deshmukh Fertilizers')
ON CONFLICT (retailer_id) DO NOTHING;

-- =============================================================================
-- Seed: Inventory Snapshots (30 records, including 5 low/out-of-stock)
-- =============================================================================
INSERT INTO inventory_snapshots (retailer_id, product, sku, stock_status, stock_cover_days, snapshot_date) VALUES
('RTL_0091','Tilt 250 EC','SKU_TILT_250','healthy',18,'2026-02-15'),
('RTL_0092','Tilt 250 EC','SKU_TILT_250','healthy',22,'2026-02-15'),
('RTL_0093','Tilt 250 EC','SKU_TILT_250','healthy',15,'2026-02-15'),
('RTL_0094','Tilt 250 EC','SKU_TILT_250','watch',12,'2026-02-15'),
('RTL_0112','Tilt 250 EC','SKU_TILT_250','healthy',20,'2026-02-15'),
('RTL_0091','Amistar Top','SKU_AMIS_TOP','healthy',25,'2026-02-15'),
('RTL_0201','Score 250 EC','SKU_SCORE_250','low',4,'2026-02-15'),
('RTL_0202','Score 250 EC','SKU_SCORE_250','low',3,'2026-02-15'),
('RTL_0203','Score 250 EC','SKU_SCORE_250','out_of_stock',0,'2026-02-15'),
('RTL_0204','Score 250 EC','SKU_SCORE_250','low',5,'2026-02-15'),
('RTL_0205','Score 250 EC','SKU_SCORE_250','watch',8,'2026-02-15'),
('RTL_0301','Kavach 75 WP','SKU_KAVACH_75','watch',11,'2026-02-15'),
('RTL_0302','Kavach 75 WP','SKU_KAVACH_75','healthy',16,'2026-02-15'),
('RTL_0303','Kavach 75 WP','SKU_KAVACH_75','watch',9,'2026-02-15'),
('RTL_0304','Kavach 75 WP','SKU_KAVACH_75','healthy',14,'2026-02-15'),
('RTL_0401','Actara 25 WG','SKU_ACTARA_25','healthy',21,'2026-02-15'),
('RTL_0402','Actara 25 WG','SKU_ACTARA_25','healthy',19,'2026-02-15'),
('RTL_0403','Actara 25 WG','SKU_ACTARA_25','healthy',24,'2026-02-15'),
('RTL_0501','Alika','SKU_ALIKA','watch',10,'2026-02-15'),
('RTL_0502','Alika','SKU_ALIKA','healthy',17,'2026-02-15'),
('RTL_0503','Alika','SKU_ALIKA','low',6,'2026-02-15'),
('RTL_0091','Cruiser 350 FS','SKU_CRUISER','healthy',30,'2026-02-15'),
('RTL_0201','Folicur 250 EW','SKU_FOLICUR','watch',9,'2026-02-15'),
('RTL_0301','Ridomil Gold','SKU_RIDOMIL','healthy',20,'2026-02-15'),
('RTL_0401','Pegasus 500 SC','SKU_PEGASUS','healthy',18,'2026-02-15'),
('RTL_0501','Proclaim 5 SG','SKU_PROCLAIM','out_of_stock',0,'2026-02-15'),
('RTL_0092','Amistar Top','SKU_AMIS_TOP','healthy',19,'2026-02-15'),
('RTL_0202','Folicur 250 EW','SKU_FOLICUR','low',4,'2026-02-15'),
('RTL_0302','Ridomil Gold','SKU_RIDOMIL','healthy',22,'2026-02-15'),
('RTL_0402','Pegasus 500 SC','SKU_PEGASUS','healthy',16,'2026-02-15')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Seed: Growers (sample of 40 across 5 states — representative subset)
-- =============================================================================
INSERT INTO growers (grower_id, state, district, tehsil, territory_id, language, device_type, crop, farm_size_acres, whatsapp_opt_in, last_engagement_date) VALUES
('GRW_001','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','smartphone','wheat',3.2,true,'2026-01-28'),
('GRW_002','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','smartphone','wheat',4.5,true,'2026-02-02'),
('GRW_003','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','keypad','wheat',2.1,true,'2026-01-15'),
('GRW_004','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','smartphone','wheat',5.0,true,'2026-02-05'),
('GRW_005','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','smartphone','wheat',3.8,true,'2026-01-20'),
('GRW_006','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','keypad','wheat',1.5,false,NULL),
('GRW_007','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','smartphone','wheat',6.2,true,'2026-02-08'),
('GRW_008','Uttar Pradesh','Kanpur Nagar','Kanpur_Nagar_T023','TER_001','Hindi','smartphone','wheat',2.8,true,'2026-01-30'),
('GRW_011','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','smartphone','mustard',4.0,true,'2026-01-22'),
('GRW_012','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','keypad','mustard',2.5,true,'2026-01-10'),
('GRW_013','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','smartphone','mustard',3.5,true,'2026-02-01'),
('GRW_014','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','smartphone','mustard',5.5,true,'2026-01-25'),
('GRW_015','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','keypad','mustard',1.8,false,NULL),
('GRW_016','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','smartphone','mustard',4.2,true,'2026-02-03'),
('GRW_017','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','unknown','mustard',3.0,true,'2026-01-18'),
('GRW_018','Rajasthan','Sikar','Sikar_T011','TER_021','Hindi','smartphone','mustard',2.2,true,'2026-01-28'),
('GRW_021','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','smartphone','potato',2.0,true,'2026-01-20'),
('GRW_022','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','keypad','potato',1.5,true,'2026-01-08'),
('GRW_023','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','smartphone','potato',3.0,true,'2026-02-01'),
('GRW_024','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','smartphone','potato',2.8,true,'2026-01-25'),
('GRW_025','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','keypad','potato',1.2,false,NULL),
('GRW_026','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','smartphone','potato',4.1,true,'2026-02-05'),
('GRW_027','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','smartphone','potato',2.5,true,'2026-01-30'),
('GRW_028','West Bengal','Hooghly','Hooghly_T005','TER_031','Bengali','unknown','potato',1.8,true,'2026-01-15'),
('GRW_031','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','smartphone','chickpea',4.5,true,'2026-01-22'),
('GRW_032','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','smartphone','chickpea',3.8,true,'2026-02-01'),
('GRW_033','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','keypad','chickpea',2.0,true,'2026-01-12'),
('GRW_034','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','smartphone','chickpea',5.2,true,'2026-01-28'),
('GRW_035','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','smartphone','chickpea',3.5,true,'2026-02-04'),
('GRW_036','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','keypad','chickpea',1.5,false,NULL),
('GRW_037','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','smartphone','chickpea',4.0,true,'2026-01-20'),
('GRW_038','Madhya Pradesh','Ratlam','Ratlam_T008','TER_041','Hindi','smartphone','chickpea',2.8,true,'2026-01-30'),
('GRW_041','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','smartphone','cotton',5.0,true,'2026-01-18'),
('GRW_042','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','smartphone','cotton',6.5,true,'2026-02-02'),
('GRW_043','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','keypad','cotton',3.0,true,'2026-01-10'),
('GRW_044','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','smartphone','cotton',4.2,true,'2026-01-25'),
('GRW_045','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','smartphone','cotton',7.0,true,'2026-02-06'),
('GRW_046','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','keypad','cotton',2.5,false,NULL),
('GRW_047','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','smartphone','cotton',3.8,true,'2026-01-28'),
('GRW_048','Maharashtra','Yavatmal','Yavatmal_T012','TER_051','Marathi','unknown','cotton',4.5,true,'2026-01-22')
ON CONFLICT (grower_id) DO NOTHING;
