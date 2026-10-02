DELETE FROM tasks_food WHERE user_id IS NULL;
INSERT INTO tasks_food (id, user_id, condition_key, name, tip, icon, display_order) VALUES 
('preset_1', NULL, 'general', '8 Glasses Water (2.5L+)', 'Essential for cellular hydration & metabolic function.', '💧', 0),
('preset_5', NULL, 'general', 'Avoid Sugary Sodas & Drinks', 'Eliminates empty calories and blood sugar spikes.', '🛑', 4),
('preset_7', NULL, 'digestion', 'Fennel/Cumin Water Post-Meal', 'Cools gastric heat and relaxes intestinal smooth muscle.', '💧', 0),
('preset_8', NULL, 'digestion', '5-10m Vajrasana After Meals', 'Directs blood flow straight to digestive viscera.', '🧘', 1),
('preset_9', NULL, 'digestion', 'Chew Food 25x & Gentle Walk', 'Amylase enzymes in saliva pre-digest complex carbohydrates.', '🚶', 2),
('preset_10', NULL, 'digestion', 'Avoid Fried & Spicy Foods', 'Spicy lipids relax lower esophageal sphincter triggering reflux.', '🛑', 3),
('preset_12', NULL, 'digestion', 'Avoid Chilled Sodas & Ice Water', 'Cold fluids quench digestive fire (Agni) and slow breakdown.', '🛑', 5),
('preset_14', NULL, 'weight', '1 Glass Water 20m Before Meals', 'Primes gastric volume preventing unintended overeating.', '💧', 1),
('preset_16', NULL, 'weight', 'Avoid Sugary Drinks & Sweets', 'Liquid sucrose causes rapid insulin surges driving abdominal fat storage.', '🛑', 3),
('preset_19', NULL, 'stress', '4-7-8 Breathing Circle (Morning & Night)', 'Directly activates the vagus nerve to reduce heart rate and adrenaline.', '🧘', 0),
('preset_24', NULL, 'stress', 'Avoid Rushed or Stressful Meals', 'Eating under sympathetic stress shuts down mesenteric digestive blood flow.', '🛑', 5),
('preset_27', NULL, 'sleep', 'Relaxing Book & Warm Milk/Tea', 'Prepares psychological cue that daytime cognitive striving has ended.', '📖', 2),
('preset_33', NULL, 'joints', 'Turmeric Milk & Walnuts', 'Curcumin and plant omega-3s downregulate inflammatory cytokines.', '🌿', 2),
('preset_37', NULL, 'sugar_bp', '35m Brisk Walking (Post-Meals)', 'Skeletal muscle contractions pull glucose from bloodstream without requiring insulin.', '🏃', 0),
('preset_38', NULL, 'sugar_bp', 'High-Fiber Oats & Methi Water', 'Viscous soluble mucilage slows carbohydrate digestion and enzymatic hydrolysis.', '🥗', 1),
('preset_39', NULL, 'sugar_bp', '10m 4-7-8 Breathing to Lower BP', 'Suppresses sympathetic vasomotor tone, yielding measurable reductions in systolic pressure.', '🧘', 2),
('preset_40', NULL, 'sugar_bp', 'Avoid Refined Sugar & Pastries', 'High glycemic carbohydrates exhaust pancreatic beta cells and elevate HbA1c.', '🛑', 3);

DELETE FROM tasks_exercise WHERE user_id IS NULL;
INSERT INTO tasks_exercise (id, user_id, condition_key, name, tip, icon, display_order) VALUES 
('preset_2', NULL, 'general', '30m Active Exercise or Walk', 'Strengthens cardiovascular endurance & elevates mood.', '🏃‍♂️', 1),
('preset_13', NULL, 'weight', '40m Brisk Walk & Squats', 'Accelerates daily caloric expenditure and boosts resting metabolism.', '🏃', 0),
('preset_20', NULL, 'stress', '25m Gentle Nature Walk or Yoga', 'Down-regulates amygdala stress reactivity and releases endorphins.', '🌳', 1),
('preset_31', NULL, 'joints', '5-Min Stretch Timer 2x Daily', 'Decompresses trapezius tension and cervical vertebrae.', '⏱️', 0),
('preset_32', NULL, 'joints', '25m Flat Ground Walk / Swim', 'Pumps synovial fluid through cartilage without joint pounding.', '🏊', 1);

DELETE FROM tasks_sleep WHERE user_id IS NULL;
INSERT INTO tasks_sleep (id, user_id, condition_key, name, tip, icon, display_order) VALUES 
('preset_6', NULL, 'general', 'Avoid Screens 60m Before Bed', 'Protects natural melatonin release for restorative sleep.', '🛑', 5),
('preset_28', NULL, 'sleep', 'Strictly No Screens in Bed', 'Short-wavelength 460nm blue photons halt pineal gland melatonin secretion.', '🛑', 3),
('preset_30', NULL, 'sleep', 'Avoid Heavy Dinner Near Bedtime', 'Thermogenic digestion elevates body temperature preventing deep slow-wave delta sleep.', '🛑', 5);

DELETE FROM tasks_habits WHERE user_id IS NULL;
INSERT INTO tasks_habits (id, user_id, condition_key, name, tip, icon, display_order) VALUES 
('preset_3', NULL, 'general', 'Fresh Fruits & Colorful Veggies', 'Provides dietary fiber, vitamins A, C, and antioxidants.', '🥗', 2),
('preset_4', NULL, 'general', 'Avoid Deep-Fried & Junk Snacks', 'Prevents systemic inflammation & sluggish digestion.', '🛑', 3),
('preset_11', NULL, 'digestion', 'Avoid Lying Down Flat Within 2h', 'Gravity keeps stomach juices from leaking up the esophagus.', '🛑', 4),
('preset_15', NULL, 'weight', 'Half-Plate High-Fiber Veggies', 'Soluble and insoluble fiber slow glucose uptake and sustain satiety.', '🥗', 2),
('preset_17', NULL, 'weight', 'Avoid Late Night Snacks (By 8 PM)', 'Allows overnight 12-hour metabolic resting window for cellular autophagy.', '🛑', 4),
('preset_18', NULL, 'weight', 'Avoid Sedentary Sitting > 45m', 'Prolonged sitting suppresses lipoprotein lipase enzyme needed for lipid clearance.', '🛑', 5),
('preset_21', NULL, 'stress', 'Sip Chamomile / Mint Herbal Tea', 'Apigenin phytochemical binds to brain GABA receptors to induce tranquility.', '🍵', 2),
('preset_22', NULL, 'stress', 'Avoid Caffeine After 12:00 PM', 'Blocks adenosine receptors, keeping autonomic nervous system in hyperdrive.', '🛑', 3),
('preset_23', NULL, 'stress', 'Avoid Stressful News & Feeds', 'Prevents acute spikes in circulating cortisol and cognitive fatigue.', '🛑', 4),
('preset_25', NULL, 'sleep', '30m Morning Sunlight & Air', 'Sets suprachiasmatic biological clock for timely evening melatonin surge.', '☀️', 0),
('preset_26', NULL, 'sleep', 'Fixed Wake-Up Time Maintained', 'Anchor circadian rhythm regardless of weekday vs. weekend shifts.', '⏰', 1),
('preset_29', NULL, 'sleep', 'Avoid Caffeine After 2:00 PM', 'Pharmacological half-life leaves significant adenosine antagonism overnight.', '🛑', 4),
('preset_34', NULL, 'joints', 'Avoid Sitting > 40m Continuously', 'Sitting raises intradiscal lumbar pressure by 140% compared to standing.', '🛑', 3),
('preset_35', NULL, 'joints', 'Avoid Tech Neck / Phone Slouch', '45-degree cervical flexion exerts 49 lbs of force on upper vertebrae.', '🛑', 4),
('preset_36', NULL, 'joints', 'Avoid Sagging Soft Mattresses', 'Sagging beds torque the lumbar and thoracic column out of neutral alignment.', '🛑', 5),
('preset_41', NULL, 'sugar_bp', 'Avoid High-Sodium Chips & Pickles', 'Excess sodium expands extracellular fluid volume, directly spiking arterial pressure.', '🛑', 4),
('preset_42', NULL, 'sugar_bp', 'Avoid Skipping Daily Monitoring', 'Maintains crucial clinical awareness to prevent undetected glycemic or hypertensive events.', '🛑', 5);

