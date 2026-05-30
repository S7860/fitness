"use client";
import { useState, useMemo, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
}
interface Supplement { name: string; tier: string; tc: string; timing: string; dose: string; why: string; brand: string; evidence: string; }
interface RuleGroups { training: string[]; nutrition: string[]; lifestyle: string[]; }
interface FAQItem { q: string; a: string; }

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#F3F4F6",
  surface: "rgba(255,255,255,0.75)",
  surfaceSolid: "#FFFFFF",
  surfaceAlt: "rgba(243,244,246,0.7)",
  border: "rgba(226,232,240,0.9)",
  borderHover: "rgba(203,213,225,0.95)",
  text: "#0B1220",
  textMuted: "#4B5563",
  textDim: "#9CA3AF",
  blue: "#2563EB",
  green: "#16A34A",
  red: "#DC2626",
  amber: "#D97706",
  purple: "#7C3AED",
  teal: "#0D9488",
  indigo: "#4338CA",
};

// ─── SCIENTIFIC EVIDENCE BASE (shown in Research tab) ─────────────────────────
const SCIENCE = [
  {
    title: "Wide-Grip Lat Pulldown → Back Width (V-Taper)",
    citation: "Andersen et al., J Strength Cond Res (2014); EMG analysis (NCBI, 2025)",
    finding: "Wide-grip pronated pulldowns produce significantly greater upper latissimus dorsi activation vs. narrow or neutral grips. EMG studies on 40 trained males (2025) confirm wide-grip pronated pulls as the superior V-taper builder due to upper lat fiber targeting.",
    application: "5×8–10 wide-grip lat pulldowns on Pull Day. Priority #1 exercise for your goal.",
    badge: "EMG Confirmed", color: T.blue,
  },
  {
    title: "Weekly Volume Dose-Response for Hypertrophy",
    citation: "Schoenfeld et al., J Sports Sci (2017); Sports Medicine meta-analysis (2025)",
    finding: "A landmark meta-analysis of 15+ studies found a clear dose-response: 10+ sets/week/muscle group produces superior hypertrophy vs. fewer sets. Each additional set yields ~0.38% more muscle growth (Schoenfeld 2017), with diminishing returns above ~20 sets.",
    application: "Back: 21 sets/week. Shoulders: 13 sets/week. Both are in the optimal 10–20 range. Excessive volume (old plan: 88/100 fatigue on Pull Day) reduces quality of mechanical tension.",
    badge: "Meta-Analysis", color: T.green,
  },
  {
    title: "Training Frequency: 2× Per Week Superiority",
    citation: "Schoenfeld et al., J Sports Med (2016); Grgic et al., ScienceDirect (2018)",
    finding: "Training a muscle group twice per week produces significantly greater hypertrophy than once per week even when total weekly volume is equated. Distributing sets across sessions allows better per-set quality.",
    application: "The Push/Pull/Lower split hits each major muscle group twice per week through secondary involvement, satisfying this frequency requirement without adding sessions.",
    badge: "Meta-Analysis", color: T.purple,
  },
  {
    title: "Pallof Press → Deep Core / Transverse Abdominis",
    citation: "Physical Therapy (Sharma et al., 2019); Int J Sports Phys Ther (2023, PMC)",
    finding: "Anti-rotation exercises like the Pallof Press are superior for activating deep stabilizers (transverse abdominis, multifidus) vs. crunch/rotation exercises. A 2025 RCT found Pallof Press builds foundational stability and preferentially targets internal obliques — the muscles responsible for the cinched-waist look.",
    application: "Replaced Bicycle Crunches on Wed core day. TVA development creates the illusion of a narrower waist far more effectively than oblique hypertrophy from rotation exercises.",
    badge: "RCT Verified", color: T.teal,
  },
  {
    title: "Walking Lunges > Leg Extension for Compound Goals",
    citation: "Aniceto et al., ResearchGate (2021); ACE EMG Study; PLOS ONE (2020)",
    finding: "EMG research confirms walking lunges activate gluteus maximus, gluteus medius, and biceps femoris to a significantly greater degree than back squats and leg presses. Lunges show higher glute med activation due to unilateral hip stabilization forces. Leg extensions only activate knee extensors in isolation.",
    application: "With squats + leg press already on Thursday, leg extensions were redundant knee-extension isolation. Walking lunges add multi-joint glute/hamstring stimulus, higher metabolic cost, and greater total caloric expenditure per set.",
    badge: "EMG Study", color: T.amber,
  },
  {
    title: "HIIT → EPOC and Visceral Fat Loss",
    citation: "NIH/PMC EPOC Study (2024); Randomized controlled trial, NCBI (2018)",
    finding: "HIIT generates significantly greater EPOC (excess post-exercise oxygen consumption) than MICT, increasing lipid oxidation during recovery. A randomized controlled trial showed HIIT is superior to steady-state cardio for reducing visceral/abdominal fat specifically. Research in Nature (2024) confirms HIIT outperforms steady-state cardio for belly and visceral fat reduction while preserving muscle.",
    application: "Friday HIIT (30s max sprint / 60s walk × 8 rounds) positioned post-lifting for maximum EPOC. This is your primary weekly belly-fat attack.",
    badge: "RCT + NIH", color: T.red,
  },
  {
    title: "Zone 2 Incline Walking → Fat Oxidation Peak",
    citation: "Journal of Sports Sciences (fat oxidation at 60–65% VO2max); Cell Metabolism (2024)",
    finding: "Fat oxidation rates peak at approximately 60–65% VO2max — exactly Zone 2 intensity. Incline treadmill walking elevates metabolic cost without raising intensity above Zone 2. A 2024 Cell Metabolism study found 12 weeks of Zone 2 training increases mitochondrial density 40–60%, creating a superior long-term fat-burning metabolism.",
    application: "Zone 2 incline walks on Mon/Wed/Sat. The combination of Zone 2 (max fat %) + HIIT on Fri (max caloric afterburn) covers both ends of the fat-loss cardio spectrum.",
    badge: "Journal of Sports Sciences", color: T.indigo,
  },
  {
    title: "Trap Volume Reduction → V-Taper Optimization",
    citation: "Visual anatomy / training structure analysis",
    finding: "The upper trapezius inserts at the base of the skull and across the upper back. Excessive upper trap hypertrophy visually narrows the neck-shoulder junction, reducing the V-taper illusion. Deadlifts and rows already provide sufficient trap stimulus as secondary movers (which is appropriate for your goal).",
    application: "Removed dedicated Dumbbell Shrugs from Pull Day. Trap volume via deadlifts and rows is ~9–12 sets/week indirect stimulus — sufficient for functional development without visual narrowing of the V-taper.",
    badge: "Applied Anatomy", color: T.amber,
  },
];

// ─── OPTIMIZED WORKOUT DATA ────────────────────────────────────────────────────
const WORKOUT_DAYS = [
  {
    key: "MON", label: "Push Day", sub: "Chest · Shoulders · Triceps",
    color: T.blue, emoji: "💪", sessionTime: "65–70 min", fatigueScore: 66,
    changes: ["Removed DB Lateral Raise Drop Set (redundant with cable raises)", "Cable Lateral Raise upgraded to 4 sets with drop set on final set"],
    overview: "Scientifically streamlined push session. Removing the redundant DB lateral raise drop set (you already have cable laterals which provide superior constant-tension lateral delt stimulus) reduces junk fatigue while the extra set on cable laterals preserves and improves weekly shoulder volume quality. Result: same stimulus, better recovery, better form on every set.",
    scienceNote: "Cable lateral raises produce constant tension through the full ROM including the bottom stretch phase — the mechanically most important region for lateral delt growth (stretch-mediated hypertrophy). DB raises lose tension at the bottom. One cable exercise done with full ROM is superior to one cable + one DB version of the same movement.",
    warmup: [
      "Arm Circles — 30 sec forward, 30 sec backward",
      "Band Pull-Aparts — 2 × 15",
      "Incline Push-Ups — 2 × 12",
      "Light DB Lateral Raises — 2 × 12 @ 5 lb (activation only)",
    ],
    exercises: [
      {
        name: "Flat Dumbbell Bench Press", priority: "A+", muscle: "Sternal Pectoralis Major, Anterior Delt, Triceps",
        sets: 3, reps: "8–10", rest: "2–3 min", startW: "45 lb DBs", w8: "60 lb", w16: "75 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Flat DB press allows greater pec ROM vs. barbell due to independent arm movement. Research confirms 3×8–10 at high effort (RIR 1–2) is optimal for chest hypertrophy.",
        form: [
          "Lie flat on the bench, feet packed firmly into the floor to create full-body tension.",
          "Lower DBs to mid-chest with elbows at 45° — NOT 90° — to protect the rotator cuff.",
          "Press upward and slightly inward, squeezing the chest hard at peak contraction.",
          "Control the eccentric for a full 2–3 seconds. This is where muscle damage occurs.",
        ],
        mistakes: ["Bouncing at the bottom using momentum", "Elbows flaring to 90° (rotator cuff risk)", "Not squeezing at the top contraction"],
        tip: "Imagine trying to squeeze your armpits together as you press up. This cue activates the sternal pec head maximally.",
        advanced: "Week 9+: Add a 3-second pause at the absolute bottom of the movement.",
        beginner: "Focus on a stable, balanced path before adding weight.",
      },
      {
        name: "Incline Dumbbell Press", priority: "A", muscle: "Clavicular Pectoralis Major (Upper Chest)",
        sets: 3, reps: "10", rest: "2 min", startW: "35 lb DBs", w8: "45 lb", w16: "60 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Stretch-mediated hypertrophy research (Pedrosa et al., 2022) shows training in a lengthened position produces superior muscle growth. The 30–35° incline maximizes upper chest stretch.",
        form: [
          "Set bench to exactly 30–35°. Above 45° recruits anterior delts instead of upper chest.",
          "Lower DBs to UPPER chest (clavicle level), not mid-chest.",
          "Full lockout at top. Squeeze upper chest hard for 1 second.",
          "Lower slowly — resist the descent for 2–3 seconds.",
        ],
        mistakes: ["Bench angle above 45° (shifts to shoulder exercise)", "Shortening the range of motion at the bottom"],
        tip: "Stretch-mediated hypertrophy research proves maximizing the deep bottom stretch yields superior upper chest mass vs. partial ROM.",
        advanced: "Week 9+: Drop set on final set — full weight × 8, drop 30%, × 8 more.",
        beginner: "Machine incline press for first 2 weeks if DBs feel unstable.",
      },
      {
        name: "Overhead Barbell Press (OHP)", priority: "A", muscle: "Anterior Deltoids, Lateral Delts, Core Stabilizers",
        sets: 3, reps: "6–8", rest: "2–3 min", startW: "65 lb bar", w8: "85 lb", w16: "115 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "OHP is the primary compound shoulder movement. Heavy pressing builds anterior + lateral delt thickness. Research confirms 6–8 rep range at ~80% 1RM is optimal for strength-hypertrophy crossover.",
        form: [
          "Brace your core as hard as you can before every single rep — this protects your lower back.",
          "Press the bar straight up. The bar path arcs slightly back once it passes your nose.",
          "Full lockout at top — arms completely straight.",
          "Lower under control. Do NOT let your lower back arch excessively.",
        ],
        mistakes: ["Lower back arching excessively (lower ab weakness)", "Incomplete lockout at top"],
        tip: "'Push the floor away with your feet' while pressing. This full-body tension cue makes you immediately stronger.",
        advanced: "Week 9+: 1-second pause on the collarbone before each press.",
        beginner: "Smith machine OHP for first 3 weeks.",
      },
      {
        name: "Cable Lateral Raise — Single Arm", priority: "A★", muscle: "Lateral Deltoid (Primary Width Builder)",
        sets: 4, reps: "12–15 each side (final set: drop set)", rest: "90s", startW: "10 lb/side", w8: "20 lb", w16: "30 lb",
        isNew: false, isModified: true,
        scienceBasis: "Cables maintain tension through the FULL range — including the crucial bottom stretch where DBs go slack. The bottom stretch position activates the lateral delt motor pool even at sub-maximal loads. UPGRADED to 4 sets. Final set: do your normal weight × 12, immediately drop 40%, × 12 more.",
        form: [
          "Stand sideways to cable. Cable at lowest position. 15° forward lean.",
          "Raise arm to shoulder height. Lead with your ELBOW, not your hand.",
          "Cable crosses body on the way up — this is what creates constant tension through the FULL range.",
          "Final set only: drop 40% weight immediately after completing normal reps. No rest.",
        ],
        mistakes: ["Swinging weight up with momentum (reduces tension on the muscle)", "Raising above shoulder level"],
        tip: "Cables are scientifically superior to DBs for lateral delts because of constant tension at the bottom — the position where the muscle receives the most stretch stimulus.",
        advanced: "Week 9+: 1-second isometric hold at top of every rep on working sets.",
        beginner: "Start with lightest available weight to perfect elbow-led path.",
      },
      {
        name: "Tricep Dips (Parallel Bars)", priority: "B", muscle: "All 3 Tricep Heads, Lower Chest",
        sets: 3, reps: "10–12", rest: "2 min", startW: "Bodyweight", w8: "BW + 10 lb", w16: "BW + 25 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Compound tricep movement hitting all three heads simultaneously. Weighted dips are the squat of arm training. Progressive overload potential is extremely high compared to isolation movements.",
        form: [
          "Parallel bars. Slight forward lean (15–20°) for more chest involvement; stay upright for pure tricep.",
          "Lower until upper arms are parallel to the floor — DO NOT go deeper.",
          "Drive back up to full lockout. Squeeze triceps hard at the top.",
        ],
        mistakes: ["Going too deep past parallel (shoulder impingement risk)", "Elbows flaring too wide"],
        tip: "Dips are the ultimate compound arm builder. Heavy weighted dips build more arm mass than any isolation movement.",
        advanced: "Week 9+: Weighted dips with a dip belt.",
        beginner: "Bench dips with feet on the floor.",
      },
      {
        name: "Tricep Rope Pushdown", priority: "B", muscle: "Triceps Lateral Head (Outer Definition)",
        sets: 3, reps: "12–15", rest: "90s", startW: "30 lb", w8: "50 lb", w16: "70 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Isolation finisher targeting the lateral tricep head which creates the visible 'horseshoe' definition. Rope allows wrist supination at the bottom for maximum lateral head contraction.",
        form: [
          "Cable at highest position. Rope attachment. Slight forward lean over the cable.",
          "Elbows PINNED to sides — they are the fixed axis and must NEVER move.",
          "Push rope down AND apart at bottom — split rope ends outward as far as possible.",
        ],
        mistakes: ["Elbows drifting forward as weight increases", "Not splitting the rope apart at bottom"],
        tip: "Consciously flex the tricep as hard as you can at full extension — the rope split is what enables this.",
        advanced: "Week 9+: 2-second pause at the bottom of each rep.",
        beginner: "Start light and establish the elbow-anchor position first.",
      },
    ],
    cardio: { type: "Incline Treadmill Walk", duration: "20–25 min", intensity: "3.0–3.5 mph / 8–12% incline", timing: "Post-lifting", why: "Zone 2 post-lifting burns fat from depleted glycogen stores. Fat oxidation peaks at 60–65% VO2max (Zone 2). Research: fat oxidation rates are highest at this exact intensity window (Journal of Sports Sciences)." },
    cooldown: ["Chest doorframe stretch 30s each side", "Cross-body shoulder stretch 30s each side", "Tricep overhead stretch 30s each side", "Deep breathing 2 min"],
  },
  {
    key: "TUE", label: "Pull Day", sub: "Back Width · Thickness · Biceps (Priority Session)",
    color: T.green, emoji: "🏋️", sessionTime: "65–70 min", fatigueScore: 72,
    changes: [
      "Wide-Grip Lat Pulldown upgraded from 4 to 5 sets — primary V-taper driver",
      "REMOVED: Dumbbell Shrug — upper trap hypertrophy narrows the V-taper visually",
    ],
    overview: "Your most important session scientifically validated. Back development creates the V-taper that makes your waist look dramatically smaller. CRITICAL CHANGE: Shrugs removed entirely. Upper trap hypertrophy actually NARROWS the neck-shoulder junction visually, undermining the V-taper effect. Your deadlifts and rows provide 9–12 indirect trap sets per week — more than sufficient for functional development. Lat pulldowns upgraded to 5 sets as the primary width driver.",
    scienceNote: "Schoenfeld's 2017 meta-analysis confirms a dose-response relationship: more quality sets produce more growth. By reducing fatigue (removing shrugs) and adding one quality lat pulldown set, you get MORE productive volume on your key exercise with better recovery between sets. The 88/100 fatigue score in your original plan meant your later sets were generating minimal hypertrophic stimulus.",
    warmup: [
      "Dead Hangs — 3 × 20 sec (decompresses spine, activates lat stretch)",
      "Band Pull-Aparts — 2 × 20",
      "Light Lat Pulldown — 2 × 15 @ 50% working weight",
      "Cat-Cow Spinal Mobility — 10 reps",
    ],
    exercises: [
      {
        name: "Conventional Deadlift", priority: "A+", muscle: "Full Posterior Chain — Lats, Traps, Spinal Erectors, Glutes, Hamstrings",
        sets: 3, reps: "5", rest: "3 min", startW: "165 lb", w8: "195 lb", w16: "245 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Produces the largest anabolic hormone response (testosterone + GH) of any exercise. Builds full posterior chain thickness. EMG studies confirm simultaneous lat, trap, glute, and hamstring activation.",
        form: [
          "Bar positioned directly over mid-foot. Grip shoulder-width. Arms vertical when viewed from the front.",
          "SETUP SEQUENCE: 1) brace core hard 2) chest up 3) shoulders slightly back and down.",
          "Think LEG PRESS — push the floor away while keeping the bar in contact with your shins.",
          "Stand tall at lockout. Do NOT hyperextend your lower back at the top.",
        ],
        mistakes: ["Rounding the lower back (most dangerous mistake)", "Jerking the weight off the floor"],
        tip: "Think of the deadlift as a LEG PRESS, not a back pull. You are pushing the floor away. This mental cue immediately improves form.",
        advanced: "Week 9+: Dead-stop resets — bar completely on the floor with full setup between each rep.",
        beginner: "Elevated blocks (bar starts at knee height) or Romanian deadlifts only.",
      },
      {
        name: "Wide-Grip Lat Pulldown", priority: "A+", muscle: "Latissimus Dorsi — Width and V-Taper",
        sets: 5, reps: "8–10", rest: "2 min", startW: "100 lb", w8: "125 lb", w16: "160 lb",
        isNew: false, isModified: true,
        scienceBasis: "UPGRADED TO 5 SETS. Andersen et al. (2014) confirmed wide-grip pronated pulldowns produce significantly greater upper lat activation vs. other grips. 2025 EMG study of 40 trained males confirms this is the #1 V-taper exercise. Wide grip engages the upper lat fibers which create the broad shoulder-to-narrow-waist silhouette.",
        form: [
          "Grip bar 6–8 inches OUTSIDE shoulder width with an overhand (pronated) grip.",
          "Lean back 15–20°. This angle aligns the pull vector with the lat fiber direction.",
          "Drive your ELBOWS DOWN toward your hip pockets — not your hands down to your chest.",
          "Let the bar rise ALL THE WAY back up for a full lat STRETCH at the top. Do not cut the ROM short.",
        ],
        mistakes: ["Pulling behind the neck (cervical spine risk)", "Using biceps to pull instead of driving elbows down", "Not achieving full stretch at the top"],
        tip: "'Put my elbows in my back pockets.' This single cue is responsible for more V-taper development than any other technique cue in back training.",
        advanced: "Week 9+: 2-second isometric pause at full contraction (bar at upper chest).",
        beginner: "Assisted pull-up machine with same wide-grip hand placement.",
      },
      {
        name: "Barbell Bent-Over Row", priority: "A", muscle: "Rhomboids, Mid-Traps, Lower Lats (Thickness)",
        sets: 3, reps: "8–10", rest: "2 min", startW: "75 lb", w8: "110 lb", w16: "145 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Horizontal pulling builds mid-back THICKNESS — the depth of the back that makes it look 3D. The lat pulldown builds WIDTH; the row builds THICKNESS. Both are required for a complete back.",
        form: [
          "Hinge forward 45–60° from vertical. Knees slightly bent. Core RIGID throughout.",
          "Pull bar to LOWER ABDOMEN (navel area) — this targets mid-back thickness.",
          "Control the descent for 2 full seconds — feel the mid-back stretch at the bottom.",
          "Keep your torso angle CONSTANT. No rocking up and down.",
        ],
        mistakes: ["Torso rocking up/down using momentum to complete reps", "Rounded lower back", "Pulling to the upper chest (shifts to upper traps, not mid-back)"],
        tip: "Pulling to the belly button targets mid-back thickness. Pulling toward the lower ribs shifts emphasis to width. Know which you are training.",
        advanced: "Week 9+: Pendlay Row — bar rests completely on the floor between every rep for a dead-stop reset.",
        beginner: "Chest-supported dumbbell row (eliminates lower back fatigue as limiting factor).",
      },
      {
        name: "Seated Cable Row (Alternating Grip)", priority: "B", muscle: "Lower Lats (V-Grip) / Upper Back (Wide Grip)",
        sets: 3, reps: "10–12", rest: "90s", startW: "100 lb", w8: "120 lb", w16: "150 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Seated cable row removes spinal loading, allowing true muscular failure safely. Alternating grips between sessions ensures both lower and upper lat development. This is a volume accumulation exercise — use the freed-up energy (from removing shrugs) here.",
        form: [
          "Sit TALL. Full forward lean at the start to spread shoulder blades apart — this ensures a full lat stretch.",
          "Row handle to lower abdomen. Drive ELBOWS back past your torso at peak contraction.",
          "ALTERNATING WEEKS: Close V-Grip (Week A) = lower lats. Wide Overhand (Week B) = upper back.",
          "Return slowly — 2-second eccentric.",
        ],
        mistakes: ["Leaning way back using body momentum", "Not achieving full shoulder blade protraction at the start"],
        tip: "The cable row is your insurance for back thickness. Because it removes spinal loading, you can take it closer to true failure than a barbell row.",
        advanced: "Week 9+: 3-second negative phase on every rep.",
        beginner: "Machine row.",
      },
      {
        name: "Cable Rope Face Pull", priority: "A★", muscle: "Posterior Deltoid, Rotator Cuff, Mid-Traps",
        sets: 3, reps: "15–20", rest: "60s", startW: "30 lb", w8: "45 lb", w16: "55 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Face pulls are the single most important exercise for long-term shoulder health. They directly counteract the internal rotation pattern created by heavy pressing. The posterior delt also contributes to the 3D shoulder appearance. NEVER skip this.",
        form: [
          "Cable at eye/head height. Rope attachment.",
          "Pull rope directly to your FACE. Elbows go HIGH and WIDE (goal post / W-shape position).",
          "Pull the rope ends apart at maximum contraction — externally rotate at the peak.",
          "Keep your torso still. This is a shoulder/upper back exercise, not a rowing exercise.",
        ],
        mistakes: ["Pulling to the neck or chest (wrong muscle target)", "Elbows staying low (recruits lats instead of rear delts)", "Torso swinging back"],
        tip: "This is your primary shoulder health insurance. The heavy pressing you do on Monday creates anterior delt dominance. Face pulls fix the imbalance and build the 3D rear delt that makes shoulders look complete from all angles.",
        advanced: "Week 9+: High-rep finisher — 25 reps with a lighter weight after the working sets.",
        beginner: "Start with a very light weight (10–15 lb) and focus entirely on the elbow position.",
      },
      {
        name: "Incline Dumbbell Curl", priority: "A", muscle: "Biceps Long Head (Maximum Stretch Position)",
        sets: 3, reps: "10–12", rest: "90s", startW: "15 lb DBs", w8: "25 lb DBs", w16: "35 lb DBs",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Pedrosa et al. (2022) demonstrated stretch-mediated hypertrophy — training muscles in a lengthened position produces superior growth. The incline position places the bicep long head in a maximally stretched position (arm behind the torso), triggering this superior growth stimulus.",
        form: [
          "Set bench to 45–60° incline. Sit back so your arms hang STRAIGHT DOWN and BEHIND your body line.",
          "Curl up — elbows remain pinned BEHIND your torso throughout the entire movement.",
          "Lower with a FULL 3-second eccentric all the way to complete arm extension — don't cut it short.",
        ],
        mistakes: ["Elbows drifting forward (removes the key stretched position)", "Not reaching full extension at the bottom (defeats the purpose)"],
        tip: "The stretch at the bottom is the entire point of this exercise. The uncomfortable stretch is exactly where the growth stimulus is occurring.",
        advanced: "Week 9+: Superset with standing Hammer Curls (no rest between).",
        beginner: "Seated DB curl on a flat bench first until shoulder mobility allows the incline position.",
      },
      {
        name: "Dumbbell Hammer Curl", priority: "A", muscle: "Brachialis (Arm Frontal Thickness)",
        sets: 3, reps: "10–12", rest: "90s", startW: "20 lb DBs", w8: "35 lb DBs", w16: "45 lb DBs",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "The brachialis sits underneath the bicep. Growing it physically pushes the bicep upward, making arms look thicker from the front. Neutral grip (palms facing each other) places the bicep in a mechanically disadvantaged position, forcing brachialis to take primary load.",
        form: [
          "NEUTRAL GRIP — palms facing each other throughout. Do not rotate your wrist.",
          "Elbows stay fixed at your sides. Only forearms move.",
          "Full extension at bottom. Squeeze hard at top.",
        ],
        mistakes: ["Rotating the wrist to supinate mid-curl (defeats the purpose)", "Body swinging to complete the rep"],
        tip: "Growing the brachialis underneath the bicep creates visible arm thickness from the front — the single most effective strategy for bigger-looking arms.",
        advanced: "Week 9+: Cross-body hammer curls for a different angle.",
        beginner: "Seated alternating hammer curls.",
      },
    ],
    cardio: { type: "Stationary Bike (Moderate Pace)", duration: "15 min", intensity: "Level 6–8 / 75–80 RPM", timing: "Post-lifting only", why: "Concentric-only cycling flushes lactic acid from the back and arms without adding spinal compression from running. Short duration prevents catabolism of back muscle gains just made." },
    cooldown: ["Lat hang stretch 2 × 30 sec (critical — decompresses spine after deadlifts)", "Child's pose 60 sec", "Upper back foam roll 2 min"],
  },
  {
    key: "WED", label: "Cardio + Core", sub: "Zone 2 Fat Burn · Core Stability · Active Recovery",
    color: T.amber, emoji: "🔥", sessionTime: "45–55 min", fatigueScore: 38,
    changes: [
      "ADDED: Pallof Press — replaces Bicycle Crunch (superior TVA/deep core activation — research confirmed)",
      "Bicycle Crunch REMOVED — oblique hypertrophy can widen the waist visually",
    ],
    overview: "Maximum fat burning day. Zone 2 incline walking is your primary weapon — fat oxidation peaks at 60–65% VO2max (exactly Zone 2 intensity). The core session has been scientifically optimized: Bicycle Crunches removed because oblique hypertrophy from rotation exercises can WIDEN the waist visually. Pallof Press added — anti-rotation training builds the transverse abdominis (TVA), which acts as a corset muscle. A strong TVA creates the cinched-waist look by physically pulling the abdominal wall inward.",
    scienceNote: "International Journal of Environmental Research and Public Health (systematic review): core stability exercises (Pallof Press category) are superior to rotation exercises for activating deep internal obliques. Physical Therapy (Sharma et al., 2019): anti-rotational exercises improve deep core activation significantly beyond crunch-type exercises.",
    warmup: ["5-min slow treadmill walk", "Hip circles 10 each direction", "Bird-Dogs 3 × 10", "Cat-Cow 10 reps"],
    exercises: [
      {
        name: "Incline Treadmill Walk (Zone 2 — 35 min)", priority: "A+", muscle: "Full-Body Fat Oxidation, Mitochondrial Development",
        sets: 1, reps: "35–40 min continuous", rest: "—", startW: "3.2 mph / 10% incline", w8: "3.5 mph / 12%", w16: "3.8 mph / 15%",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Fat oxidation rates peak at 60–65% VO2max (Zone 2). Journal of Sports Sciences confirms this is the intensity that maximizes fat as fuel. Cell Metabolism (2024): 12 weeks Zone 2 increases mitochondrial density 40–60%, making your body a better fat-burning machine 24/7, not just during exercise.",
        form: [
          "Maintain 60–70% of your max heart rate. You should be able to speak 3–5 words before needing to breathe.",
          "DO NOT hold the handrails — reduces calorie burn by 20–30% and defeats the purpose.",
          "Head up, shoulders back, natural arm swing.",
          "Body takes 10–15 minutes to fully ramp up fat oxidation — the last 20 minutes of this walk burn the most fat.",
        ],
        mistakes: ["Holding the rails at steep incline (massive calorie reduction)", "Going too fast into an anaerobic zone (shifts away from fat burning)"],
        tip: "Zone 2 is the only intensity where fat supplies the majority of the fuel. Above Zone 2, carbohydrates take over. The incline raises caloric cost while keeping intensity in Zone 2.",
        advanced: "Week 9+: Add a 10–15 lb weighted vest.",
        beginner: "Start at 6% incline and increase by 2% each week.",
      },
      {
        name: "Ab Wheel Rollout", priority: "A★", muscle: "Anti-Extension Core — Rectus Abdominis, Transverse Abdominis",
        sets: 3, reps: "8–10", rest: "60s", startW: "From knees", w8: "12 reps from knees", w16: "Standing partial rollouts",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Anti-extension core training (resisting spinal hyperextension) builds the deep anterior chain in a way that directly carries over to protecting the lower back under heavy deadlifts and squats. This is also a high-activation TVA exercise.",
        form: [
          "Kneel on floor. Core BRACED as hard as possible before you start rolling.",
          "Roll forward SLOWLY — your lower back must NEVER sag. The moment it does, stop.",
          "Pull back by CURLING your torso — think of bringing your hips to your ribcage.",
          "The goal is CORE control, not how far you can roll.",
        ],
        mistakes: ["Lower back collapsing/sagging (spinal risk — STOP immediately if this happens)", "Moving too fast through the movement"],
        tip: "This exercise is your biggest spinal protection investment. Heavy deadlifts and squats create significant lower back demands — a strong anti-extension core is the difference between a long training career and a herniated disc.",
        advanced: "Week 9+: Full standing rollouts.",
        beginner: "Roll only 12–18 inches forward at first. Increase range over weeks.",
      },
      {
        name: "Plank Hold", priority: "A", muscle: "Global Isometric Core Stabilization",
        sets: 3, reps: "45–60 sec", rest: "60s", startW: "Bodyweight", w8: "75s", w16: "90s (+ 25 lb plate on back)",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Isometric core training maintains intra-abdominal pressure which directly strengthens the TVA. The plank also trains the rectus abdominis in a lengthened position — research confirms this produces superior muscle activation vs. shortened (crunch) positions.",
        form: [
          "Elbows directly under shoulders. Perfectly straight line from heels to head.",
          "Squeeze GLUTES and ABS simultaneously — both must be active.",
          "Breathe normally throughout — do not hold your breath.",
        ],
        mistakes: ["Hips sagging (not a plank — it's a lower back strain)", "Hips piking up (removes the core challenge)"],
        tip: "Actively 'pull your elbows toward your toes' — this engagement cue spikes core activation dramatically above simply holding the position.",
        advanced: "Week 9+: 25 lb plate placed on your mid-back.",
        beginner: "Drop knees to the ground. Still enormously effective.",
      },
      {
        name: "Cable Crunch (Weighted)", priority: "A", muscle: "Rectus Abdominis — Hypertrophy Training",
        sets: 3, reps: "15–20", rest: "60s", startW: "35 lb", w8: "50 lb", w16: "70 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Cable crunches apply progressive overload to the rectus abdominis — the only way to make the ab muscles physically thicker and larger. Bodyweight crunches cannot produce meaningful hypertrophy after the first few weeks. Weighted ab training is the same principle as any other muscle group.",
        form: [
          "Kneel facing cable machine. Hold rope at sides of your head.",
          "Crunch DOWN and FORWARD simultaneously — round your back like a shrimp.",
          "Hips stay LOCKED over your knees — do NOT sit back onto your heels as you crunch.",
          "Contract the abs fully at the bottom. Resist the return for 2 seconds.",
        ],
        mistakes: ["Pulling with arms/lats instead of crunching", "Sitting back onto heels (makes it a hip hinge, not an ab exercise)"],
        tip: "Cable crunches are weighted ab work — the only way to build physically thicker abs. Pair this with your caloric deficit and you will see definition within 8–12 weeks.",
        advanced: "Week 9+: 3-second eccentric (resist the return to starting position).",
        beginner: "Floor crunches with a plate on your chest.",
      },
      {
        name: "Pallof Press", priority: "A★", muscle: "Transverse Abdominis, Internal Obliques, Multifidus",
        sets: 3, reps: "12 each side", rest: "45s", startW: "20 lb", w8: "30 lb", w16: "40 lb",
        isNew: true, isModified: false, isRemoved: false,
        scienceBasis: "REPLACES BICYCLE CRUNCHES. Research confirmed: Pallof Press (anti-rotation) builds the TVA and deep internal obliques — the muscles responsible for the cinched-waist appearance. Systematic review (Int J Environ Res Public Health): core stability exercises like Pallof Press are superior for activating deep internal obliques vs. rotation exercises. Critical advantage: anti-rotation training does NOT bulk up the obliques (bicycle crunches do), preventing waist widening.",
        form: [
          "Set cable to chest height. Stand sideways to the machine, feet shoulder-width apart.",
          "Hold the handle with both hands at your chest. Step away to create tension.",
          "BRACE your core as hard as possible — squeeze EVERYTHING.",
          "Press your hands straight out in front of you and HOLD for 2 seconds. Resist the cable pulling you sideways.",
          "Return slowly to chest. The further you extend, the harder your core works.",
        ],
        mistakes: ["Letting your torso rotate toward the cable (defeats the purpose)", "Not bracing the core before pressing out", "Standing too close (not enough tension)"],
        tip: "The Pallof Press trains the TVA as a corset — it physically pulls the abdominal wall inward. A strong TVA creates the cinched-waist appearance that makes your entire midsection look narrower and tighter.",
        advanced: "Week 9+: Pallof Press with a staggered stance, then try kneeling on one knee.",
        beginner: "Stand closer to the cable to reduce the rotational force.",
      },
      {
        name: "Dead Bug", priority: "B", muscle: "Deep Transverse Abdominis, Lumbo-Pelvic Control",
        sets: 3, reps: "10 each side (slow)", rest: "45s", startW: "Bodyweight", w8: "4-sec tempo", w16: "With light DBs in hands",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Dead bug is the gold standard for lumbo-pelvic stability — keeping the lower back neutral while the limbs create destabilizing forces. PMC published sports physical therapy review (2023) includes Dead Bug in the highest-tier core stability interventions.",
        form: [
          "Lie on your back. Arms straight up. Knees bent to 90°.",
          "Press your lower back INTO the floor — this must stay in contact with the floor for THE ENTIRE SET.",
          "Slowly lower your opposite arm and leg toward the floor simultaneously.",
          "Return to start before moving the other side. Take 3–4 seconds for each lowering.",
        ],
        mistakes: ["Lower back arching off the floor (completely defeats the exercise)", "Moving too quickly through reps"],
        tip: "The ENTIRE utility of Dead Bug is in keeping your lower back pressed to the ground. If it lifts, shorten your range of motion.",
        advanced: "Week 9+: Add resistance band around feet.",
        beginner: "Lower only the heel (bent knee) rather than the full straight leg.",
      },
    ],
    cardio: { type: "Outdoor Walk (Step Goal) + Zone 2 Walk", duration: "10,000 steps total today", intensity: "Brisk / conversational pace", timing: "Spread through day — lunch break, evening walk", why: "Wednesday = maximum fat-burning day. Incline treadmill (peak fat oxidation intensity) + 10,000 daily steps = largest caloric deficit of the week without any muscle catabolism." },
    cooldown: ["Cobra pose 60s (spinal extension after flexion-dominant core work)", "Seated hamstring stretch 30s each side", "Hip flexor stretch 30s each side"],
  },
  {
    key: "THU", label: "Lower Body Matrix", sub: "Quads · Hamstrings · Glutes · Calves",
    color: T.purple, emoji: "🦵", sessionTime: "65–75 min", fatigueScore: 80,
    changes: [
      "REMOVED: Leg Extension — redundant with squats + leg press (knee extension already double-covered)",
      "ADDED: Walking Lunges — EMG research confirms superior glute activation vs. squats; higher metabolic cost",
    ],
    overview: "Training legs releases the largest testosterone and growth hormone surge of the week — this anabolic response accelerates fat loss ACROSS your entire body for 24–48 hours. Critical change: Leg Extensions removed because you already have two knee-dominant exercises (back squat + leg press). Adding Walking Lunges gives you unilateral glute/hamstring work that research confirms activates the gluteus maximus and medius significantly MORE than squats, plus a substantially higher metabolic cost per set.",
    scienceNote: "ACE EMG Study & ResearchGate (2021): Lunges activate the gluteus maximus more than back squats when standardized. PLOS ONE (2020): Walking lunges show highest gluteus medius EMG activity of all tested exercises due to unilateral stabilization forces. Greater glute activation = more total muscle fiber recruitment = more calories burned per set. Leg press + lunge covers both stable quad-dominant work and unstable glute-dominant work — the complete lower body stimulus.",
    warmup: ["Leg Swings 15 each direction", "BW Deep Squats 2 × 15", "Glute Bridges 2 × 15", "Hip Flexor Stretch 30s each side"],
    exercises: [
      {
        name: "Barbell Back Squat", priority: "A+", muscle: "Quadriceps, Glutes, Core, Entire Lower Body",
        sets: 3, reps: "6–8", rest: "3 min", startW: "95 lb", w8: "145 lb", w16: "195 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "The squat is the most potent anabolic exercise in existence. Research consistently confirms squats produce the largest hormonal responses (testosterone, GH, IGF-1) of any movement. This hormonal cascade accelerates fat loss and muscle gain system-wide.",
        form: [
          "High bar on upper traps. Feet shoulder-width. Toes pointed out 15–30°.",
          "Brace core as if you're about to be punched. Hinge hips and knees simultaneously.",
          "Descend until thighs are PARALLEL or BELOW — depth activates the glutes maximally.",
          "Drive knees OUT over toes throughout. Never let knees cave inward.",
        ],
        mistakes: ["Knees caving inward (valgus collapse — serious injury risk)", "Heels rising off the floor (ankle mobility issue — work on it)", "Quarter-squatting (not activating glutes)"],
        tip: "Squats produce the largest anabolic hormone response of any exercise. More testosterone released = faster fat loss across your entire body for 24–48 hours afterward.",
        advanced: "Week 9+: 2-second pause at the bottom of every rep.",
        beginner: "Goblet squat with a dumbbell to learn depth and pattern.",
      },
      {
        name: "Romanian Deadlift (RDL)", priority: "A", muscle: "Hamstrings (Lengthened Position), Glutes, Spinal Erectors",
        sets: 3, reps: "8–10", rest: "2 min", startW: "75 lb", w8: "115 lb", w16: "155 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "RDL trains the hamstrings in their lengthened position through hip hinge — the most important stimulus for hamstring hypertrophy. Paired with the leg curl (knee flexion), you get complete hamstring development from both functional angles.",
        form: [
          "Stand with bar at hip level. Maintain a SLIGHT knee bend that stays constant throughout.",
          "HINGE at hips — push them BACKWARD. Lower back stays completely flat throughout.",
          "Bar drags down your thighs. Feel the hamstrings loading like a stretched rubber band.",
          "Stop when you feel a deep hamstring stretch — around mid-shin for most people.",
        ],
        mistakes: ["Rounding the lower back at the bottom (most common, most dangerous)", "Bending the knees too much (turns it into a conventional deadlift)"],
        tip: "The hamstring stretch at the bottom is exactly where muscle growth is stimulated. Control the descent with full focus — this is the money zone.",
        advanced: "Week 9+: Single-leg RDL with DBs for unilateral strength and balance.",
        beginner: "DB Romanian deadlift with lighter load to learn the hip hinge pattern.",
      },
      {
        name: "High Box Step-Up", priority: "A+", muscle: "Gluteus Maximus, Quadriceps",
        sets: 3, reps: "8–10 each leg", rest: "2 min", startW: "Bodyweight", w8: "20 lb DBs", w16: "40 lb DBs",
        isNew: true, isModified: false, isRemoved: false,
        scienceBasis: "Neto et al. (2020) systematic review confirms step-ups elicit the highest gluteus maximus activation (>100% MVIC) of all exercises tested, outperforming both back squats and hip thrusts. It also removes spinal loading and the awkward setup of the barbell hip thrust.",
        form: [
          "Use a box/bench height where your working thigh is exactly parallel to the floor.",
          "Drive strictly through the HEEL of the elevated foot. Do not push off the bottom foot.",
          "Stand tall at the top, squeezing the glute.",
          "CRITICAL: Lower yourself on a slow, strict 3-second count. This eccentric phase creates the mechanical tension needed for growth.",
        ],
        mistakes: ["Pushing off the bottom leg (steals the work from the target glute)", "Dropping down fast instead of controlling the negative descent"],
        tip: "Imagine your bottom foot is 'dead' or resting on eggshells. 100% of the lifting force must come from the leg on the box.",
        advanced: "Week 9+: Hold heavy dumbbells or a kettlebell in the goblet position.",
        beginner: "Lower the box height to a standard stair-step height to build unilateral stability first.",
      },
      {
        name: "Leg Press (Machine)", priority: "B", muscle: "Quadriceps, Glutes — High Stability",
        sets: 3, reps: "10–12", rest: "90s", startW: "180 lb", w8: "270 lb", w16: "360 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "The machine stability of the leg press allows quad training to absolute failure safely — something the free squat cannot do as safely. This makes it the perfect complement: squats for hormonal response and neural drive, leg press for high-volume quad accumulation.",
        form: [
          "Feet shoulder-width on the platform.",
          "Lower sled until knees reach 90°. Push through MID-FOOT and heels.",
          "Do NOT fully lock out your knees at the top — maintain slight bend to keep tension on the muscle.",
          "Controlled descent — 2 seconds down.",
        ],
        mistakes: ["Lower back peeling off the pad at the bottom (dangerously loads the lumbar spine)", "Short range of motion (reduces stimulus)"],
        tip: "The safety of the machine means you can and should push your quads to true failure here. This is where quad hypertrophy gets done at high volume.",
        advanced: "Week 9+: 4-second eccentric (lower for 4 seconds, press normally).",
        beginner: "This machine is naturally beginner-friendly due to stability.",
      },
      {
        name: "Walking Lunges (Barbell or DBs)", priority: "A", muscle: "Gluteus Maximus, Gluteus Medius, Quads, Hamstrings, Core",
        sets: 3, reps: "12 steps each leg", rest: "90s", startW: "BW or 15 lb DBs", w8: "25 lb DBs", w16: "40 lb DBs",
        isNew: true, isModified: false, isRemoved: false,
        scienceBasis: "REPLACES LEG EXTENSION. EMG research (ResearchGate 2021, PLOS ONE 2020, ACE study): Walking lunges activate the gluteus maximus MORE than back squats and show the highest gluteus medius activation of all tested exercises. The unilateral nature creates lateral hip stabilization forces that bilateral exercises cannot replicate. Higher metabolic cost per set than leg extensions. Complete hip extension + knee flexion in one movement.",
        form: [
          "Stand tall. Take a big step forward, lowering your back knee toward the floor.",
          "Front thigh should reach parallel to the floor. Back knee stops 1–2 inches off the floor.",
          "Drive off your FRONT HEEL to step through — do not push off the back toe.",
          "Maintain an upright torso. Do NOT lean forward excessively.",
        ],
        mistakes: ["Short steps (reduces ROM and glute stretch)", "Front knee caving inward", "Leaning forward at the torso"],
        tip: "Each step forward is essentially a single-leg squat. The glute medius works hardest in the split-stance position — this is exactly the muscle that creates hip width and contributes to the lower body V-taper.",
        advanced: "Week 9+: Bulgarian split squats (rear foot elevated) for greater ROM.",
        beginner: "Stationary forward lunges before progressing to walking.",
      },
      {
        name: "Lying or Seated Leg Curl", priority: "B", muscle: "Hamstrings — Knee Flexion Component",
        sets: 3, reps: "12–15", rest: "60s", startW: "50 lb", w8: "75 lb", w16: "105 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "RDL trains hamstrings through hip extension (lengthened position). The leg curl trains through knee flexion. Research shows these are distinct activation patterns requiring both movements for complete hamstring development.",
        form: [
          "Align your knee joint with the machine's pivot point.",
          "Curl legs all the way — heels toward glutes. Achieve FULL contraction.",
          "Lower SLOWLY — 3-second eccentric. This is where hamstring damage occurs and growth is triggered.",
        ],
        mistakes: ["Hips rising off the pad (reduces hamstring isolation)", "Fast uncontrolled eccentric (wastes the best part of the exercise)"],
        tip: "The 3-second eccentric on the leg curl is your secret weapon for hamstring development. Most people rush this phase and miss 50% of the stimulus.",
        advanced: "Week 9+: Single-leg curl for bilateral symmetry.",
        beginner: "Full range of motion at light weight to establish the movement pattern.",
      },
      {
        name: "Seated Calf Raise", priority: "C", muscle: "Gastrocnemius, Soleus",
        sets: 3, reps: "15–20", rest: "60s", startW: "30 lb", w8: "60 lb", w16: "90 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Calves require time under tension and full ROM, not just heavy weight. The seated position shifts emphasis to the soleus (the deeper calf muscle). Calves respond to high frequency and full ROM.",
        form: [
          "FULL range — all the way up onto the ball of your foot, then all the way down BELOW the platform.",
          "Pause 2 full seconds at the bottom stretch — this kills momentum and forces the calf to work.",
          "Squeeze 1 full second at peak contraction at the top.",
        ],
        mistakes: ["Bouncing rapidly (momentum removes the calf from the equation)", "Partial range (only short fibers get worked)"],
        tip: "Calves respond to time under tension more than weight. The 2-second pause at the bottom is the non-negotiable technique element.",
        advanced: "Week 9+: Add standing calf raises to hit the gastrocnemius from a different knee angle.",
        beginner: "Bodyweight on a stair step to learn full ROM.",
      },
    ],
    cardio: { type: "None (CNS Recovery Focus)", duration: "0 min", intensity: "Complete rest from cardio", timing: "None", why: "Leg day generates the highest systemic fatigue of the week. Recovery is the priority. Squats, lunges, and deadlifts are metabolically very taxing — adding cardio would blunt the hormonal and muscle-building response." },
    cooldown: ["Standing quad stretch 45s each leg", "Seated hamstring reach 60s", "Hip flexor stretch 45s each side", "Glute figure-4 stretch 45s each side"],
  },
  {
    key: "FRI", label: "HIIT + Metabolic Conditioning", sub: "Core Finisher · Sprint Intervals · Belly Fat Priority",
    color: T.red, emoji: "⚡", sessionTime: "55–65 min", fatigueScore: 68,
    changes: [
      "REMOVED: Reverse Cable Fly — rear delts are fully hit on Tuesday; redundant at end of week",
      "REDUCED: Cable Chest Fly to 2 sets — maintenance volume only (Mon already handled primary chest work)",
      "ADDED: Friday Ab Circuit — replaces isolation work with high-caloric-cost core finisher",
      "HIIT is the PRIMARY focus — moved to centerpiece of the session",
    ],
    overview: "Friday is your most important fat-loss session of the week. HIIT sprints post-lifting trigger EPOC (excess post-exercise oxygen consumption) — your metabolism stays elevated for 18–24 hours after. Critical restructure: isolation work at the end of a heavy week generates mostly junk volume (fatigued muscles cannot produce sufficient mechanical tension). Replacing the rear delt flies with an ab circuit adds caloric cost, strengthens the core before HIIT, and sets up a better sprint session.",
    scienceNote: "NIH/PMC (2024): HIIT produces significantly greater EPOC and lipid oxidation than MICT (moderate-intensity continuous training) in obese males specifically. RCT (NCBI, 2018): HIIT reduced abdominal visceral fat more effectively than both sprint intervals and steady-state cardio in overweight subjects. Performing HIIT after lifting (depleted glycogen) means the body reaches fat-burning sooner during the sprint session.",
    warmup: ["Scapular Push-Ups 2 × 12", "Dynamic Chest Openers 15 reps", "Light Jog 3 min"],
    exercises: [
      {
        name: "Cable Chest Fly (Maintenance)", priority: "B", muscle: "Sternal Pectoralis Major",
        sets: 2, reps: "12–15", rest: "90s", startW: "15 lb/side", w8: "25 lb/side", w16: "35 lb/side",
        isNew: false, isModified: true,
        scienceBasis: "REDUCED to 2 sets (was 3). Monday already provided 3 primary chest exercises. Friday chest work is purely maintenance volume — enough to signal the muscle but not enough to cause significant fatigue heading into the HIIT session. 2 sets is scientifically sufficient for weekly volume maintenance.",
        form: [
          "Set pulleys to shoulder height. Staggered stance for stability.",
          "Bring hands together in a wide, arcing movement — elbows slightly bent throughout.",
          "Squeeze your chest hard at the midline contact point. Hold 1 second.",
        ],
        mistakes: ["Pressing instead of flying (changes the muscle target)", "Bending elbows excessively"],
        tip: "Visualize wrapping your arms around a large barrel. This cue maintains the slight elbow bend and pec-stretch at the top.",
        advanced: "Week 9+: 2-second hold at midline.",
        beginner: "Pec Deck machine.",
      },
      {
        name: "Leaning Cable Lateral Raise", priority: "A", muscle: "Lateral Deltoid (3D Width)",
        sets: 3, reps: "12–15 each side", rest: "60s", startW: "10 lb", w8: "15 lb", w16: "25 lb",
        isNew: true, isModified: false, isRemoved: false,
        scienceBasis: "The Arnold Press heavily over-trains the anterior delt, increasing impingement risk. The lateral delt is responsible for the '3D' broad look and recovers exceptionally fast. Hitting it twice a week (Mon + Fri) with constant cable tension provides optimal volume without front-delt fatigue.",
        form: [
          "Hold a sturdy pole with your non-working hand, leaning away until your arm is fully straight. Cable at the lowest setting.",
          "Raise the cable out to the side, leading with the elbow.",
          "Stop at shoulder height. Maintain constant tension at the bottom — don't let the weight stack touch.",
          "Control the eccentric descent for a full 2 seconds."
        ],
        mistakes: ["Standing straight up (leaning creates a mechanically superior resistance curve)", "Using body momentum to swing the weight up"],
        tip: "The lean changes the resistance profile, applying maximum tension when the muscle is fully contracted at the top. This is the biological secret to capping the lateral head.",
        advanced: "Week 9+: 1.5 reps (full rep, half rep down, full rep up = 1 rep).",
        beginner: "Standard standing cable lateral raise if the leaning setup feels unstable.",
      },
      {
        name: "Overhead Tricep Extension", priority: "B", muscle: "Triceps Long Head (Overhead Stretch Position)",
        sets: 3, reps: "12–15", rest: "60s", startW: "20 lb", w8: "35 lb", w16: "50 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Overhead position places the tricep long head in a stretched position — the same stretch-mediated hypertrophy principle. The long head is undertrained by pushdowns alone (which don't stretch it). Weekly arm volume is optimized with this addition.",
        form: [
          "Cable rope or single DB. Grip overhead with elbows pointing forward.",
          "Lower the load BEHIND your skull until elbows reach 90° — feel the full tricep stretch.",
          "Press to full lockout overhead. Elbows point forward, NOT outward.",
        ],
        mistakes: ["Elbows flaring outward to the sides (removes long head stretch)", "Truncated range — not going deep enough behind the head"],
        tip: "The overhead position is essential for the tricep long head. Pushdowns cannot fully stretch this muscle head. The stretch is where the growth occurs.",
        advanced: "Week 9+: Single-arm unilateral cable extension for symmetry.",
        beginner: "Seated DB overhead extension to reduce lower back demand.",
      },
      {
        name: "EZ Bar Curl", priority: "B", muscle: "Biceps Brachii (Peak Contraction)",
        sets: 3, reps: "10–12", rest: "60s", startW: "35 lb", w8: "55 lb", w16: "75 lb",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "The EZ bar reduces wrist strain vs. straight bar while maintaining supinated bicep activation. Friday EZ curls complete weekly bicep volume — the incline DB curl on Tuesday hits the stretch; this hits the peak contraction. Both positions are required for complete bicep development.",
        form: [
          "Stand tall. Underhand/supinated grip on the outer curves of the EZ bar.",
          "Elbows PINNED to your flanks — they should not drift forward.",
          "Curl smoothly to a full squeeze at the top. Hold 1 second.",
        ],
        mistakes: ["Hips swinging back to use momentum", "Elbows drifting forward past the torso"],
        tip: "Contract your triceps consciously at the bottom of each rep. This ensures a fully stretched starting position for the bicep and maximizes the ROM.",
        advanced: "Week 9+: Mechanical drop set (preacher → incline → standing in one extended set).",
        beginner: "Alternating DB curls.",
      },
      {
        name: "Friday Ab Circuit (Pre-HIIT Finisher)", priority: "A", muscle: "Core — All Planes",
        sets: 3, reps: "1 round per set: Plank 60s → Ab Wheel 10 reps → Pallof Press 10/side", rest: "60s between rounds", startW: "Bodyweight", w8: "Add weight to rollout", w16: "Weighted plank",
        isNew: true, isModified: false, isRemoved: false,
        scienceBasis: "REPLACES REVERSE CABLE FLY. Pre-HIIT core circuit serves dual purpose: 1) additional core volume for fat loss 2) activates deep stabilizers before sprint intervals (research shows core pre-activation improves sprint mechanics and reduces lower back strain during high-intensity running). Higher caloric cost than isolation flies with added functional benefit.",
        form: [
          "ROUND: Start with 60s plank → immediately roll out ab wheel 10 reps → immediately Pallof Press 10/side.",
          "Rest 60 seconds. That is ONE set. Repeat 3 times.",
          "Move between exercises with no rest within a round.",
          "Focus on quality core tension throughout — this is about activation, not speed.",
        ],
        mistakes: ["Rushing through the circuit and losing core tension quality", "Taking rest within a round"],
        tip: "Performing core activation before HIIT sprints means your deep stabilizers are pre-recruited. This translates directly to better sprint mechanics, more power output, and less lower back fatigue during your sprint intervals.",
        advanced: "Week 9+: Add a 4th exercise — cable crunch × 15.",
        beginner: "Reduce each element: 45s plank, 6 rollouts, 8 Pallof press.",
      },
      {
        name: "HIIT Treadmill Sprints — PRIMARY FOCUS", priority: "A+", muscle: "Full-Body Metabolic — Visceral Fat Targeting",
        sets: 8, reps: "8 rounds: 30s max sprint / 60s walk", rest: "Walk interval IS the rest", startW: "Sprint: 7–8 mph / Walk: 3 mph", w8: "Sprint: 9 mph", w16: "Sprint: 10 mph",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "This is your #1 belly fat weapon. NIH/PMC (2024): HIIT generates significantly greater EPOC and lipid oxidation than MICT post-exercise in males. RCT (NCBI, 2018): HIIT reduced visceral/abdominal fat significantly more than steady-state cardio. The EPOC effect keeps metabolism elevated for 18–24 hours after the session. CRITICAL: Perform AFTER lifting — depleted glycogen from lifting means the body reaches fat-burning metabolism sooner during sprints.",
        form: [
          "DO NOT start HIIT before lifting. Post-lifting glycogen depletion is essential for maximum fat burn.",
          "30 SECONDS: Sprint at MAXIMUM effort — 9–10/10 RPE. This must genuinely be hard.",
          "60 SECONDS: Walk at 3 mph to partially recover (heart rate drops but stays elevated).",
          "Repeat for 8 rounds total. Total active HIIT time: 12 minutes.",
        ],
        mistakes: ["Doing HIIT before lifting (burns glycogen needed for strength work)", "Not going to true max effort on sprints (reduces EPOC significantly)", "Extending rest intervals too long"],
        tip: "The sprint phase must genuinely be at maximum effort. A comfortable 'fast jog' does not create sufficient metabolic disturbance to trigger meaningful EPOC. If you can maintain a conversation during the sprint, you are not going hard enough.",
        advanced: "Week 9+: Increase to 10 rounds or add a 15° incline to the sprint.",
        beginner: "Start at 6 rounds and reduce sprint speed to match perceived effort.",
      },
    ],
    cardio: { type: "HIIT Treadmill Sprints (see exercise above)", duration: "15 min total (8 rounds active)", intensity: "30s MAX / 60s walk — 90–100% max effort on sprints", timing: "Final exercise of the session — always post-lifting", why: "HIIT post-lifting + EPOC = 18–24 hour fat-burning elevation. Research (Nature, 2024) confirms HIIT is more effective than steady-state cardio for reducing belly and visceral fat specifically." },
    cooldown: ["Cross-body shoulder stretch 45s each side", "Doorway chest stretch 30s", "Hip flexor stretch 30s each side", "Slow walk 3 min to bring HR down safely"],
  },
  {
    key: "SAT", label: "Active Recovery", sub: "Mobility Flow · Blood Clearance · CNS Reset",
    color: T.teal, emoji: "🧘", sessionTime: "30–45 min", fatigueScore: 20,
    changes: [],
    overview: "Light non-fatiguing movement to improve range of motion, clear metabolic waste products from the week's training, and down-regulate the nervous system. This session actively improves your performance on Monday.",
    scienceNote: "Active recovery at low intensity (Zone 1 — below 55% max HR) increases blood flow to muscles, accelerating metabolite clearance without creating additional training stress.",
    warmup: ["10-min relaxed outdoor or treadmill walk"],
    exercises: [
      {
        name: "Dynamic Mobility & Yoga Flow", priority: "A", muscle: "Full-Body Mobility — All Joints",
        sets: 1, reps: "25 min continuous", rest: "—", startW: "Unweighted", w8: "Deeper holds", w16: "Sustainable baseline",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Parasympathetic nervous system activation via slow, controlled movement reduces cortisol and promotes anabolic hormone balance. Research confirms active recovery accelerates metabolite clearance vs. complete rest.",
        form: [
          "Cycle smoothly: Child's Pose → Cobra → Downward Dog → World's Greatest Stretch → Hip Flexor Stretch.",
          "Hold each position 30–45 seconds. Focus on breathing — slow nasal inhale, longer exhale.",
          "Do NOT push into painful ranges — stay at the edge of comfort.",
        ],
        mistakes: ["Forcing painful ranges (causes injury on recovery day)", "Holding breath during stretches"],
        tip: "This session shifts your body into a parasympathetic (rest-and-repair) state. The deep breathing is as important as the stretching. Take it seriously — it directly improves Monday's performance.",
        advanced: "Week 9+: Deepen each hold by 10 seconds.",
        beginner: "Use yoga blocks to modify any position.",
      },
      {
        name: "Optional Outdoor Zone 1 Walk", priority: "B", muscle: "Cardiovascular — Light Clearance",
        sets: 1, reps: "20–30 min", rest: "—", startW: "2.0–2.5 mph", w8: "2.5 mph", w16: "2.5 mph",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Zone 1 walking (below 55% max HR) increases muscle blood flow without adding training stress. Morning sunlight exposure also resets circadian rhythm, improves sleep quality (critical for GH production and recovery), and stimulates Vitamin D synthesis.",
        form: ["Relaxed, natural walking stride. Focus on posture.", "Outdoors in morning sunlight is optimal.", "Should feel completely effortless — this is NOT exercise."],
        mistakes: ["Accelerating into an aerobic pace (crosses into Zone 2 — more fatiguing than intended)"],
        tip: "Morning sunlight within 30 minutes of waking resets your circadian rhythm. Better circadian rhythm = better sleep = more growth hormone released at night = more fat burned while sleeping.",
        advanced: "Week 9+: Light weighted vest.",
        beginner: "15-minute loop.",
      },
    ],
    cardio: { type: "Outdoor Recovery Walk", duration: "20–30 min", intensity: "Zone 1 — fully conversational", timing: "Morning preferred", why: "Low-intensity Zone 1 movement promotes baseline systemic blood circulation and accelerates muscle tissue repair by increasing nutrient delivery to damaged muscle fibers." },
    cooldown: ["Full-Body Static Stretching — 15 min. Focus on hip flexors, lats, chest, and calves — the most compressed muscles from the week."],
  },
  {
    key: "SUN", label: "Rest + Meal Prep", sub: "Systemic Decompression · Nutritional Architecture",
    color: T.textDim, emoji: "🍳", sessionTime: "0 min", fatigueScore: 0,
    changes: [],
    overview: "Absolute physical rest. Muscle is built during recovery, not in the gym. The training stimulus from Monday through Friday triggers the adaptation — Sunday's rest is when that adaptation actually occurs. Dedicate this time to nutritional logistics that determine your entire week's compliance.",
    scienceNote: "Growth hormone is primarily secreted during deep sleep (stages 3–4). Without adequate sleep and rest, the anabolic response to training is blunted significantly. Sunday rest also ensures full CNS recovery for maximum Monday Push Day performance.",
    warmup: [],
    exercises: [
      {
        name: "Weekly Meal Prep Protocol", priority: "A+", muscle: "Nutritional Consistency — The Foundation",
        sets: 1, reps: "90 min", rest: "—", startW: "Kitchen", w8: "Optimized workflow", w16: "Automated habit",
        isNew: false, isModified: false, isRemoved: false,
        scienceBasis: "Research on dietary adherence consistently shows that meal preparation is the single highest-impact behavior for maintaining a protein target and caloric deficit. Compliance with 185g+ protein target is impossible without pre-cooked meals available.",
        form: [
          "PROTEIN: Batch-cook 1.0–1.2 kg of chicken/beef/shrimp. Season with different spice profiles for variety.",
          "EGGS: Hard-boil 12 eggs. Store unpeeled in fridge — they last 1 week.",
          "CARBS: Cook large batch of basmati rice, quinoa, or lentils in a rice cooker.",
          "SNACKS: Portion roasted chana, almonds, yogurt containers into travel-ready portions.",
        ],
        mistakes: ["Skipping meal prep (this is the single biggest predictor of week-long dietary failure)"],
        tip: "Sunday meal prep compliance is the most important habit in this entire plan. A 90-minute investment prevents 5 days of poor food decisions. Your fat loss goals are won or lost in this kitchen session.",
        advanced: "Week 9+: Diversify spice and cuisine profiles to prevent palate fatigue.",
        beginner: "Master chicken, rice, and boiled eggs first. Add variety at week 5.",
      },
    ],
    cardio: { type: "Passive Recovery", duration: "0 min", intensity: "Complete rest", timing: "All day", why: "Total rest allows CNS recovery and peak growth hormone secretion during sleep. This ensures maximum power output on Monday's Push Day." },
    cooldown: ["Organize weekly training logs and track progressive overload", "Target 8-hour sleep window tonight — this is the most anabolic thing you can do"],
  },
];

// ─── NUTRITION DATA ────────────────────────────────────────────────────────────
const MEALS = [
  { id: "breakfast", label: "Breakfast", time: "5:30–6:30 AM", icon: "☀️", color: T.amber, note: "Your 2 daily chais with 2% milk are fully accounted for in these daily totals. Break the fast with protein-first within the eating window.", options: [
    { name: "Masala Scrambled Eggs + Jasmine Rice", tag: "🇵🇰 Desi Classic", cal: 390, pro: 24, time: "12 min", diff: "Easy", desc: "Spiced desi scrambled eggs over leftover jasmine rice.", ing: ["3 large eggs", "¾ cup cooked jasmine rice", "½ onion diced", "1 tomato chopped", "1 green chili sliced", "1 tsp oil", "Cumin + turmeric + coriander"], steps: [{s:"Sauté",d:"Oil, cumin seeds, onion, chili, tomato. Cook until tomato breaks down and oil separates."},{s:"Eggs",d:"Add whisked eggs. Scramble on LOW heat until just set — do not overcook."}], notes: "Prep rice the night before. Cold rice reheats in 60 seconds.", swap: "No rice → 2 rice cakes. Or add an extra egg for 28g protein." },
    { name: "Smoked Salmon + Egg Scramble", tag: "🐟 Omega-3 Focus", cal: 355, pro: 38, time: "10 min", diff: "Easy", desc: "Pre-cooked smoked salmon = 38g protein with zero cooking time.", ing: ["2 whole eggs + 2 egg whites", "80g smoked salmon", "¾ cup jasmine rice", "1 tsp butter", "Black pepper"], steps: [{s:"Scramble",d:"Whisk eggs and whites. Cook very gently in butter on low heat."},{s:"Fold",d:"Remove from heat. Fold in smoked salmon strips — residual heat warms it."}], notes: "Smoked salmon vacuum packs last weeks unopened. Open 30 min before eating.", swap: "Canned tuna drained + squeeze of lemon." },
    { name: "Greek Yogurt Power Bowl", tag: "🌍 Zero Cook", cal: 310, pro: 24, time: "3 min", diff: "Zero", desc: "Zero cooking. Highest protein-per-minute ratio of any breakfast option.", ing: ["1 cup PLAIN Greek yogurt (not flavored)", "1 banana", "20 almonds", "½ tsp honey"], steps: [{s:"Combine",d:"Layer yogurt in bowl. Add sliced banana. Top with almonds and a drizzle of honey."}], notes: "PLAIN Greek yogurt only — flavored versions can contain 15–25g added sugar.", swap: "Berries instead of banana for lower sugar. Add 1 scoop whey for 42g protein." },
    { name: "High-Protein Overnight Oats", tag: "🥣 Prep Ahead", cal: 340, pro: 32, time: "5 min prep", diff: "Zero", desc: "Prep the night before. Grab from fridge and eat in 60 seconds.", ing: ["½ cup rolled oats", "1 scoop whey protein (vanilla)", "½ cup 2% milk", "1 tbsp chia seeds", "½ banana"], steps: [{s:"Mix",d:"Combine all in a jar. Stir. Refrigerate overnight. Eat cold in the morning."}], notes: "Eat cold directly from the jar.", swap: "Plain Greek yogurt instead of whey for a different texture." },
    { name: "Desi Omelet + Sprouted Toast", tag: "🍞 High Fiber", cal: 290, pro: 26, time: "10 min", diff: "Easy", desc: "Onion-tomato-chili omelet with high-fiber sprouted/Ezekiel bread.", ing: ["1 whole egg + 4 egg whites", "¼ onion", "1 small tomato", "Cilantro + green chili", "2 slices Ezekiel/sprouted bread"], steps: [{s:"Omelet",d:"Whisk eggs, fold in diced onion, tomato, chili, cilantro. Cook on medium."},{s:"Toast",d:"Toast bread simultaneously. Serve together."}], notes: "Sprouted/Ezekiel bread has superior amino acid profile vs. regular bread. Find in health food section.", swap: "1 whole wheat roti (120 cal, 4g protein) instead of bread." },
    { name: "Moong Dal Chilla (Lentil Pancakes)", tag: "🌱 Plant Power", cal: 320, pro: 22, time: "15 min", diff: "Medium", desc: "High-protein savory lentil pancakes. Soak dal overnight.", ing: ["½ cup moong dal (soaked overnight, blended to batter)", "50g low-fat paneer crumbled", "Handful spinach", "Spices", "1 tsp oil"], steps: [{s:"Pour",d:"Pour batter on hot non-stick pan. Spread thin."},{s:"Fill & flip",d:"Add crumbled paneer and spinach before flipping. Cook through."}], notes: "Soak dal overnight for easy blending in the morning.", swap: "Besan (chickpea flour) instead of dal — ready without soaking." },
  ]},
  { id: "lunch", label: "Lunch", time: "12:00–1:00 PM", icon: "🍱", color: T.green, note: "Pack from Sunday prep. Reheat in 90 seconds at work. Rice-based high protein meals are the foundation of midday energy.", options: [
    { name: "Chicken Karahi (Batch Cooked)", tag: "🇵🇰 Batch Prep", cal: 460, pro: 48, time: "Cook Batch: 30 min Sunday", diff: "Easy", desc: "Cook Sunday. Eat Mon–Wed lunches. Thighs reheat far better than breasts.", ing: ["200g chicken thighs", "2 tomatoes + 1 onion", "Cumin + coriander + chili + garlic-ginger paste", "¾ cup basmati"], steps: [{s:"Sear",d:"Brown chicken in small amount of oil."},{s:"Bhunna",d:"Add onion, then tomatoes and spices. Cook until oil separates. This step is essential — do not rush."}], notes: "Thighs reheat in microwave without drying out. Breasts become rubbery.", swap: "Beef, lamb, or paneer as protein base." },
    { name: "Teriyaki Salmon Bowl", tag: "🇯🇵 Omega-3 Rich", cal: 520, pro: 46, time: "20 min", diff: "Easy", desc: "Restaurant-quality in 20 minutes. Teriyaki glaze takes 2 minutes to make.", ing: ["170g salmon fillet (skin-on)", "1 cup jasmine rice", "2 tbsp low-sodium soy sauce", "1 tsp honey", "Sesame seeds", "Scallions"], steps: [{s:"Sear",d:"Skin side down in dry pan, medium-high heat. 4 min. Flip 2 min."},{s:"Glaze",d:"Mix soy + honey. Pour in pan, bubble 30 seconds, spoon over salmon."}], notes: "Reheat max 60 seconds in microwave — salmon dries out quickly.", swap: "Chicken thigh or jumbo shrimp for same glaze." },
    { name: "Keema Matar (Lean Ground Beef)", tag: "🥩 Natural Creatine", cal: 480, pro: 42, time: "25 min", diff: "Medium", desc: "93% lean ground beef is a natural source of creatine and complete protein.", ing: ["170g 93% lean ground beef", "½ cup peas", "1 onion + 2 tomatoes", "All the spices", "¾ cup basmati rice"], steps: [{s:"Brown",d:"Break and brown beef over high heat. Drain excess fat if any."},{s:"Simmer",d:"Add onion, tomatoes, spices. Add peas. Simmer 10 min."}], notes: "93% lean beef is optimal. 80/20 contains too much saturated fat for daily eating.", swap: "Ground chicken or turkey for lower fat." },
    { name: "Tandoori Chicken Wrap", tag: "🌯 Portable", cal: 380, pro: 45, time: "10 min (assembly)", diff: "Easy", desc: "Batch cook tandoori chicken Sunday. Assemble in 5 minutes for office.", ing: ["150g grilled tandoori chicken (batch cooked)", "1 low-carb or whole-wheat wrap", "Mint yogurt chutney", "Shredded lettuce and tomato"], steps: [{s:"Assemble",d:"Lay out wrap. Layer greens, then chicken slices. Add chutney. Roll tight."}], notes: "Pack chutney separately to prevent soggy wrap.", swap: "Grilled shrimp or canned tuna for a different protein." },
    { name: "Chickpea & Grilled Chicken Salad", tag: "🥗 High Volume", cal: 410, pro: 43, time: "10 min", diff: "Easy", desc: "Enormous volume — very filling despite lower calories. Great on low-hunger days.", ing: ["150g chicken breast grilled", "½ cup boiled chickpeas", "Cucumber + cherry tomatoes + red onion", "Lemon juice + 1 tsp olive oil + cumin"], steps: [{s:"Chop",d:"Dice chicken and vegetables."},{s:"Toss",d:"Mix everything with lemon juice, olive oil, salt, cumin."}], notes: "Chickpeas are high in fiber — they dramatically extend satiety.", swap: "Grilled halloumi for a vegetarian version." },
    { name: "Haleem (High-Protein Lentil Stew)", tag: "🍲 Comfort Recovery", cal: 430, pro: 38, time: "Batch cook Sunday", diff: "Medium", desc: "Lentil and meat stew. Extremely satiating due to viscous soluble fiber.", ing: ["1.5 cups chicken or beef haleem (homemade)", "Fresh ginger sliced", "Lime squeeze", "Cilantro to garnish"], steps: [{s:"Reheat",d:"Microwave 2 min, stir, 1 more min."},{s:"Garnish",d:"Top generously with ginger, lime, and cilantro."}], notes: "Haleem's viscous fiber triggers the strongest satiety signals of any Pakistani dish.", swap: "Chicken corn soup as a lighter alternative." },
  ]},
  { id: "snack", label: "PM Snack", time: "3:30–4:00 PM", icon: "☕", color: T.amber, note: "This is your second chai. Pair it with protein to prevent a glucose crash before your evening workout.", options: [
    { name: "Chai + Boiled Eggs + Roasted Chana", tag: "🇵🇰 Performance Fuel", cal: 285, pro: 22, time: "0 min prep", diff: "Zero", desc: "Your existing afternoon habit, scientifically optimized.", ing: ["2 pre-boiled eggs (peeled morning of)", "30g roasted chana (desk snack)", "1 cup chai (½ cup 2% milk, no sugar or 1 tsp max)"], steps: [{s:"Eat",d:"Pre-peel boiled eggs each morning. Keep chana in desk drawer."}], notes: "This snack perfectly bridges lunch and post-workout dinner protein timing.", swap: "15 almonds instead of chana if unavailable." },
    { name: "Protein Shake + Almonds", tag: "⚡ Fast Track", cal: 265, pro: 30, time: "1 min", diff: "Zero", desc: "Fastest protein hit in any situation.", ing: ["1 scoop whey protein (unflavored or vanilla)", "250ml water or 2% milk", "15 almonds"], steps: [{s:"Shake",d:"Shake protein vigorously for 30 seconds. Eat almonds alongside."}], notes: "Water = faster absorption. Milk = slower + adds calories. Choose based on your timing.", swap: "3 boiled eggs for a whole-food alternative." },
    { name: "Greek Yogurt + Cucumber Tzatziki", tag: "🥒 Fresh & Light", cal: 120, pro: 17, time: "3 min", diff: "Easy", desc: "Very low calorie, high protein dip. Highly hydrating.", ing: ["¾ cup plain Greek yogurt", "½ cucumber sliced", "1 garlic clove minced", "Fresh mint", "Salt"], steps: [{s:"Mix",d:"Stir garlic, mint, salt into yogurt. Dip cucumber slices."}], notes: "This is a great option if you're approaching your calorie ceiling for the day.", swap: "Carrot sticks instead of cucumber." },
    { name: "Edamame Pods", tag: "🌱 Complete Plant Protein", cal: 188, pro: 17, time: "2 min", diff: "Zero", desc: "One of the only complete plant proteins. Easy to keep at work.", ing: ["1 cup frozen edamame in pod", "Sea salt + optional chili flakes"], steps: [{s:"Microwave",d:"Microwave in bag 2–3 min. Sprinkle salt. Pop pods directly into mouth."}], notes: "Keep frozen bags at work. They keep for months.", swap: "Roasted makhana for an Indian alternative." },
    { name: "Cottage Cheese + Pineapple", tag: "🍍 Casein + Enzymes", cal: 110, pro: 14, time: "1 min", diff: "Zero", desc: "Casein protein from cottage cheese digests slowly. Pineapple contains bromelain which aids protein digestion.", ing: ["½ cup low-fat cottage cheese (paneer)", "¼ cup fresh pineapple cubed"], steps: [{s:"Mix",d:"Combine in a bowl. Eat slowly."}], notes: "Use low-fat or light cottage cheese to hit calorie targets.", swap: "Diced peaches or mango instead of pineapple." },
    { name: "Beef Biltong / Quality Jerky", tag: "🥩 Zero Prep", cal: 140, pro: 22, time: "0 min", diff: "Zero", desc: "Pure protein, zero prep. Ideal for travel or back-to-back meetings.", ing: ["40g high-quality beef biltong or jerky"], steps: [{s:"Eat",d:"Check label: <5g sugar, >20g protein per 50g serving."}], notes: "NOT gas station jerky. Buy proper biltong or low-sugar jerky from a health store.", swap: "Protein bar (check: >20g protein, <10g sugar)." },
  ]},
  { id: "dinner", label: "Dinner", time: "6:30–7:30 PM", icon: "🍽️", color: T.red, note: "Eat within 60 min of finishing training. Always include vegetables. This is your largest protein meal of the day.", options: [
    { name: "Honey Garlic Salmon + Rice + Broccoli", tag: "🌍 Post-Workout Priority", cal: 570, pro: 48, time: "22 min", diff: "Easy", desc: "Restaurant quality in 22 minutes. Omega-3s reduce post-workout inflammation.", ing: ["200g salmon fillet (skin-on)", "1 cup jasmine rice", "2 cups broccoli (steamed)", "2 tbsp soy sauce + 1 tsp honey + 3 garlic cloves", "1 tsp butter"], steps: [{s:"Sear",d:"Salmon skin-side down on medium-high heat, 4 min. Flip, 2 min."},{s:"Glaze",d:"Add soy/honey/garlic mixture. Baste fish. Cook broccoli in microwave 3 min."}], notes: "Skin-on salmon is cheaper and the skin contains additional omega-3s.", swap: "Chicken breast (cook 7 min/side on medium heat)." },
    { name: "Prawn Masala + Basmati", tag: "🇵🇰 High Protein Classic", cal: 490, pro: 45, time: "25 min", diff: "Medium", desc: "Classic Pakistani jhinga masala. Shrimp is one of the highest protein-per-calorie foods available.", ing: ["250g large shrimp (deveined)", "1 cup basmati rice", "2 tomatoes + 1 onion", "Cumin, coriander, garam masala, turmeric, chili"], steps: [{s:"Bhunna",d:"Cook onion until golden. Add spices. Add tomatoes. Cook until oil separates — this step cannot be rushed."},{s:"Shrimp",d:"Add shrimp. Cook exactly 2 min each side. Overcooking makes them rubbery."}], notes: "Oil separation is the sign the masala is ready. Do not add shrimp before this.", swap: "Chicken, beef, or paneer with the identical masala." },
    { name: "Chicken Tikka Skewers + Quinoa", tag: "🍢 Max Protein", cal: 510, pro: 54, time: "20 min (marinated)", diff: "Medium", desc: "Highest protein option. Quinoa is a complete protein grain.", ing: ["200g chicken breast", "Tikka masala paste + plain yogurt (marinade)", "¾ cup quinoa (cooked)", "Side salad"], steps: [{s:"Marinate",d:"Ideally overnight. Minimum 2 hours."},{s:"Cook",d:"Air fryer 200°C for 15 min OR grill pan, 4 min each side."}], notes: "Quinoa contains all essential amino acids — superior to basmati for protein.", swap: "Extra-firm tofu marinated in same tikka paste for vegetarian version." },
    { name: "Paneer Bhurji + 1 Whole Wheat Roti", tag: "🧀 Veg Comfort", cal: 440, pro: 30, time: "15 min", diff: "Easy", desc: "Scrambled paneer — rich in calcium and casein protein. Satisfying comfort meal.", ing: ["150g low-fat paneer crumbled", "½ bell pepper + ½ onion", "1 tomato", "1 whole wheat roti (120 cal, 4g protein)"], steps: [{s:"Scramble",d:"Crumble paneer. Sauté onion, bell pepper, tomato with spices. Add paneer, cook 3 min."}], notes: "Use LOW-FAT paneer to hit calorie targets. Full-fat paneer adds ~100 extra calories.", swap: "Egg bhurji (3 whole eggs) for a higher protein version." },
    { name: "Lean Beef Seekh Kebabs + Roasted Veg", tag: "🥩 Iron Rich", cal: 460, pro: 42, time: "25 min", diff: "Medium", desc: "Baked lean kebabs. Red meat provides natural creatine and highest bioavailable iron.", ing: ["2 lean beef seekh kebabs (93% lean mince)", "Mint chutney", "1 cup roasted cauliflower + zucchini"], steps: [{s:"Form",d:"Form kebabs Sunday. Refrigerate on skewers."},{s:"Bake",d:"400°F for 18–20 min. Roast veg on same tray."}], notes: "Form kebabs on Sunday to save time during the week.", swap: "Chicken seekh kebabs for a leaner option." },
    { name: "Lemon Herb Baked Cod + Sweet Potato", tag: "🐟 Ultra Lean", cal: 390, pro: 48, time: "30 min", diff: "Easy", desc: "Lowest calorie, highest protein-per-calorie dinner option. One pan, easy cleanup.", ing: ["250g white fish (cod, tilapia, or haddock)", "200g sweet potato (cubed)", "Asparagus or broccoli", "Lemon + olive oil + herbs + garlic"], steps: [{s:"Prep",d:"Everything on one sheet pan."},{s:"Bake",d:"400°F for 15–20 min. Fish is done when it flakes with a fork."}], notes: "White fish is the highest protein-to-calorie ratio of any food — 48g protein for only 390 calories.", swap: "Jumbo shrimp for an even faster cooking time (10 min)." },
  ]},
  { id: "closing", label: "Closing Snack", time: "8:30–9:00 PM", icon: "🌙", color: T.blue, note: "Eating window CLOSES by 9:30 PM. Slow-digesting protein only. This feeds your muscles while you sleep.", options: [
    { name: "Dahi + Walnuts", tag: "🇵🇰 Overnight Casein", cal: 210, pro: 12, time: "1 min", diff: "Zero", desc: "Casein from dahi digests over 6+ hours — feeds muscles throughout the night.", ing: ["1 cup plain dahi (not fruit yogurt)", "15–20 walnuts", "Pinch of cinnamon"], steps: [{s:"Combine",d:"Pour dahi in bowl. Top with walnuts. Eat slowly."}], notes: "Nothing after 9:30 PM. Cinnamon may modestly improve insulin sensitivity overnight.", swap: "2 boiled eggs for a higher protein option." },
    { name: "Cottage Cheese + Almonds", tag: "🥛 Optimal Pre-Sleep", cal: 220, pro: 25, time: "1 min", diff: "Zero", desc: "Research shows cottage cheese before bed measurably improves overnight muscle protein synthesis.", ing: ["¾ cup low-fat cottage cheese", "10 almonds"], steps: [{s:"Eat",d:"Combine in bowl. Eat slowly. This is medicine, not indulgence."}], notes: "Cottage cheese is arguably the best pre-sleep food for muscle retention and growth.", swap: "Plain Greek yogurt." },
    { name: "Haldi Doodh (Turmeric Milk)", tag: "🌙 Anti-Inflammatory", cal: 180, pro: 20, time: "5 min", diff: "Easy", desc: "Anti-inflammatory. Promotes deep sleep through tryptophan in milk.", ing: ["1 cup warm 2% milk", "½ tsp turmeric", "Pinch black pepper (required)", "½ scoop unflavored casein or whey"], steps: [{s:"Warm",d:"Heat milk. Whisk in turmeric, black pepper, and protein powder until smooth."}], notes: "Black pepper is REQUIRED — it contains piperine which makes turmeric 2000× more bioavailable.", swap: "Just warm milk + protein powder if you dislike the turmeric flavor." },
    { name: "Casein Protein Pudding", tag: "🍮 Protein Dessert", cal: 120, pro: 24, time: "2 min", diff: "Zero", desc: "Kills the sweet tooth completely. Pure protein, zero fat, zero sugar if using plain casein.", ing: ["1 scoop casein protein powder", "Splash of almond milk (3–4 tbsp only)"], steps: [{s:"Mix",d:"Stir protein with just enough liquid to create a thick pudding-like consistency. Refrigerate 5 min."}], notes: "Must use CASEIN, not whey. Whey won't thicken. Works with any casein flavor.", swap: "Plain dahi + cocoa powder + sweetener for a chocolate mousse version." },
  ]},
];

// ─── SUPPLEMENTS ──────────────────────────────────────────────────────────────
const SUPPS: Supplement[] = [
  { name: "Whey Protein Isolate", tier: "Essential", tc: T.red, timing: "Within 60 min post-workout", dose: "1 scoop (25g protein)", why: "Fastest-absorbing complete protein. Research confirms post-workout protein intake (0–60 min window) maximizes muscle protein synthesis. Isolate (vs. concentrate) is lower in lactose and fat — better for body composition.", evidence: "Phillips & Van Loon (2011), J Sports Sci; Schoenfeld & Aragon (2018)", brand: "Optimum Nutrition Gold Standard Whey Isolate." },
  { name: "Creatine Monohydrate", tier: "Essential", tc: T.red, timing: "Daily — any consistent time (timing is not critical)", dose: "5g daily — no loading phase needed", why: "Most researched supplement in existence. Meta-analyses consistently confirm 5–15% strength increase and enhanced high-intensity performance. Directly supports progressive overload — the driver of all muscle growth and fat loss benefits. Also improves cognitive function.", evidence: "Branch (2003), Int J Sport Nutr; Lanhers et al. (2017) meta-analysis", brand: "Pure monohydrate, unflavored, micronized (Creapure® certified is the gold standard)." },
  { name: "Omega-3 Fish Oil", tier: "High Priority", tc: T.amber, timing: "With any whole meal (improves absorption)", dose: "2–3 g combined EPA+DHA daily (typically 2–3 caps)", why: "Reduces exercise-induced inflammation significantly. Research shows omega-3s increase muscle protein synthesis and reduce DOMS. Also reduces visceral fat and improves insulin sensitivity — directly supporting belly fat loss goals.", evidence: "Smith et al. (2011), Am J Clin Nutr; McGlory et al. (2014)", brand: "Enteric-coated capsules prevent fish burps. Look for 1g EPA+DHA per gram of oil." },
  { name: "Vitamin D3 + K2 + Zinc", tier: "High Priority", tc: T.amber, timing: "With dinner (fat-soluble — needs dietary fat for absorption)", dose: "Vitamin D3: 4000–5000 IU / K2: 100mcg / Zinc: 15mg", why: "South Asian skin melanin significantly reduces UV-triggered D3 synthesis — clinical deficiency is extremely common. D3 is essential for testosterone production, bone density, immune function, and fat metabolism. Zinc is critical for testosterone synthesis and recovery. K2 ensures D3 calcium gets deposited in bones (not arteries).", evidence: "Pilz et al. (2011) Horm Metab Res (D3 + testosterone); Prasad et al. (1996) Nutrition (Zinc)", brand: "Combined D3+K2 formulas from Life Extension, Thorne, or Sports Research. Separate zinc if needed." },
];

// ─── RULES ────────────────────────────────────────────────────────────────────
const RULES: RuleGroups = {
  training: [
    "Tuesday Pull Day is non-negotiable — it builds the V-taper that is your #1 aesthetic goal",
    "Progressive overload every session — even +2.5 lb counts. Track every session in your phone notes",
    "Form first, weight second — always. One bad rep under too much weight costs more than it gains",
    "Warm-up is 8 minutes minimum — skipping it costs months of setbacks from preventable injuries",
    "Face pulls at the end of EVERY session — shoulder health protects the entire program",
    "Never train the same muscle group on consecutive days — 48h minimum recovery between sessions",
    "The final 2 reps of every working set should be genuinely difficult (RIR 1–2)",
    "Deload every 8 weeks: reduce load by 20% for one full week — this is when strength actually consolidates",
    "Log every single lift — you cannot progressively overload what you cannot track",
    "Sleep is when muscle is built — 7–8 hours is as important as training",
    "Back exercises: always achieve full lat stretch at the top. Cutting ROM cuts your gains by 40%+",
    "Lat pulldown: 5 sets every Tuesday. This is your single most important exercise for your goal",
  ],
  nutrition: [
    "Hit 185g+ protein daily — this is non-negotiable. Fat loss without sufficient protein = muscle loss",
    "Close eating window by 9:30 PM every night without exception",
    "Drink 3–4L water daily — hydration directly affects strength, metabolism, and appetite regulation",
    "Sunday meal prep: 90 minutes prevents 5 days of bad decisions. This is the most important habit",
    "Rice portions: ¾–1 cup cooked at lunch, ¾ cup at dinner — these are measured, not eyeballed",
    "Your 2 daily chais with 2% milk are fully built into the daily calorie totals",
    "Eat vegetables at every dinner — fiber controls appetite and feeds gut bacteria",
    "Healthy fats ≠ body fat. Eat almonds, walnuts, salmon, olive oil — they support testosterone",
    "Never go more than 5 hours without protein during waking hours — triggers muscle preservation",
    "One roti is 120 cal / 4g protein — perfectly compatible. One paratha/week is fine",
    "One social meal per week is not only acceptable — it is necessary for long-term compliance",
    "Never try to 'make up' for a bad eating day by cutting heavily the next day — it backfires",
  ],
  lifestyle: [
    "7–8 hours sleep = growth hormone peaks + cortisol normalizes = maximum fat burning overnight",
    "10,000 steps daily burns 350–400 extra calories — over a week that is significant",
    "Chronic stress → elevated cortisol → belly fat storage. Manage stress as seriously as training",
    "Progress photos every 2 weeks — scale weight is misleading. Measure waist with a tape monthly",
    "Scale fluctuates 2–5 lbs daily from water, sodium, food weight. Weigh weekly, same conditions",
    "Morning sunlight within 30 min of waking resets circadian rhythm and improves sleep quality",
    "South Asian skin requires more sun exposure OR supplementation for adequate Vitamin D3",
    "Alcohol impairs muscle protein synthesis for 24–72 hours. Limit to truly rare occasions",
    "Timeline: 1–2 inches off waist by Week 8. Dramatic visible change by Week 16–20",
    "You are 2 weeks in — the first 4 weeks build the foundation. Visible changes accelerate from Week 6",
    "The plan works for exactly ONE reason: consistency. Not perfection — consistency",
  ],
};

// ─── FAQS ─────────────────────────────────────────────────────────────────────
const FAQS: FAQItem[] = [
  { q: "Why did you remove the shrugs? Won't that hurt my traps?", a: "The shrugs were removed because upper trap hypertrophy works against your V-taper goal. Thick upper traps visually narrow the neck-shoulder junction, making the top of the V wider but in the wrong place. Your deadlifts (3×5) and barbell rows (3×8–10) provide 9–12 sets of indirect trap stimulus per week — sufficient for functional development without the aesthetic downside. Your traps will develop well from compound pulling, just not to a degree that narrows your V-taper." },
  { q: "Why am I not losing weight on the scale?", a: "Body weight fluctuates 2–5 lbs daily from water retention, sodium, food volume, and hydration. The scale is a terrible tool for tracking fat loss in the short term. Instead: measure your waist with a tape monthly, take progress photos every 2 weeks, and assess how your clothes fit. You may be building muscle simultaneously while losing fat — your body weight stays similar but your physique transforms dramatically. Trust the process for 8 weeks before drawing conclusions." },
  { q: "My chest/belly fat isn't moving — why?", a: "Chest and belly fat are hormonally the LAST fat deposits to reduce in males (they respond to testosterone and cortisol more than other areas). This is biology, not a failure of the plan. The solution is: maintain your caloric deficit consistently + build chest and shoulder muscle underneath the fat, which physically lifts and reshapes the area. By month 2–3 you will begin seeing real change; by month 4 it is dramatic. The fat was deposited over years — 8 weeks of consistent work shows the trajectory, not the final result." },
  { q: "Can I eat roti, paratha, or biryani?", a: "Absolutely. 1 whole wheat roti = ~120 cal, 4g protein. Factor it into your daily total by reducing rice at that meal. 1 paratha = 200–250 cal — fine once a week. Biryani: the protein from the meat is excellent; the issue is the oil and the refined white rice. Have it occasionally at social events and don't stress it. One meal per week of 'off-plan' food has zero meaningful impact on a 16-week program." },
  { q: "What if I miss a workout?", a: "Continue from the next scheduled session. Do NOT double up to compensate. One missed session costs functionally nothing over a 16-week program — the compound effect of 15 great sessions vastly outweighs 1 missed one. The worst response to a missed session is trying to train harder the next day, which leads to overtraining and potentially missing more sessions." },
  { q: "How wide will my back actually get?", a: "With proper progressive overload on 5×8–10 lat pulldowns, visible lat development begins at week 6–8. By week 16 with consistent overload, the V-taper is unmistakable. The lats are a large muscle group that responds quickly to dedicated training. The critical variable is progressive overload — if you are lifting the same weight in week 16 as week 2, the stimulus is not sufficient. Aim to add 5 lb every 2–3 weeks on the lat pulldown." },
  { q: "Is Pakistani food compatible with this plan?", a: "Pakistani food is exceptionally compatible. Daal (excellent fiber + protein), eggs (complete protein), chicken karahi (high protein, manageable fat), dahi (casein protein), desi vegetables — all outstanding. The three issues with traditional Pakistani eating are: too much oil (halve the oil in every recipe), too many rotis (1 is fine, 3 is too many carbohydrates), and sugar in chai (reduce to ½ tsp or zero). Your cultural food tradition supports this plan very well." },
  { q: "Why is Pallof Press better than Bicycle Crunches?", a: "Bicycle crunches are a rotation exercise that primarily develops the external obliques. Oblique hypertrophy (muscle growth) can actually WIDEN your waist visually. The Pallof Press is an anti-rotation exercise that builds the transverse abdominis (TVA) — the deep corset muscle that wraps around your entire midsection. A strong, activated TVA physically pulls the abdominal wall inward, creating the cinched-waist appearance. Research confirms anti-rotation exercises are superior for TVA activation (systematic review, Int J Environ Res Public Health)." },
  { q: "Why Walking Lunges instead of Leg Extensions?", a: "You already had two knee-dominant exercises — back squat and leg press — both heavily loading the quadriceps through knee extension. Adding a third knee extension isolation exercise (leg extension) was redundant volume on the same movement pattern. Walking lunges replace this with: superior glute activation (EMG-confirmed to exceed squats for gluteus maximus and medius), hip extension pattern (missing from your session), unilateral balance demands, and significantly higher metabolic cost per set. They deliver more stimulus across more muscles in the same time." },
];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const GlassCard = ({ children, elevated = false, className = "", style = {}, ...rest }: GlassCardProps) => (
  <div
    className={className}
    style={{
      background: elevated ? "rgba(255,255,255,0.92)" : T.surface,
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: `1px solid ${T.border}`,
      borderRadius: "18px",
      boxShadow: elevated
        ? "0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px rgba(15,23,42,0.08)"
        : "0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 8px rgba(15,23,42,0.04)",
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const SectionLabel = ({ text, color = T.textDim }: { text: string; color?: string }) => (
  <div className="font-mono text-[10px] tracking-[0.2em] uppercase font-semibold mb-3" style={{ color }}>
    {text}
  </div>
);

const TagPill = ({ text, color }: { text: string; color: string }) => (
  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide whitespace-nowrap" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
    {text}
  </span>
);

const StatTile = ({ value, label, color }: { value: ReactNode; label: string; color?: string }) => (
  <GlassCard className="p-3.5 text-center">
    <div className="font-mono text-base font-bold leading-tight" style={{ color }}>{value}</div>
    <div className="font-mono text-[9px] font-semibold uppercase tracking-wider mt-1" style={{ color: T.textDim }}>{label}</div>
  </GlassCard>
);

const ChangeBadge = ({ type }: { type: "new" | "modified" | "removed" }) => {
  const cfg = {
    new: { label: "NEW", color: T.green },
    modified: { label: "UPDATED", color: T.blue },
    removed: { label: "REMOVED", color: T.red },
  }[type];
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide" style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
};

const FatigueBar = ({ score, color }: { score: number; color: string }) => {
  const label = score === 0 ? "Rest" : score < 30 ? "Low" : score < 60 ? "Moderate" : score < 80 ? "High" : "Peak";
  const barColor = score === 0 ? T.textDim : score < 30 ? T.green : score < 60 ? T.amber : score < 80 ? color : T.red;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textDim }}>Session Fatigue Load</span>
        <span className="font-mono text-xs font-bold" style={{ color: barColor }}>{score}/100 · {label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.15)" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}80, ${barColor})` }}
        />
      </div>
    </div>
  );
};

const formatInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} style={{ color: T.text }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} style={{ color: T.textMuted }}>{part.slice(1, -1)}</em>;
    return part;
  });
};

const formatAIResponse = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold mt-4 mb-2" style={{ color: T.text }}>{formatInline(line.replace('### ', ''))}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-base font-extrabold mt-5 mb-2" style={{ color: T.text }}>{formatInline(line.replace('## ', ''))}</h2>;
    const lm = line.match(/^(\d+\.|-|\*)\s+/);
    if (lm) return <div key={i} className="flex gap-2.5 mb-2 pl-1"><span className="font-bold min-w-[16px]" style={{ color: T.blue }}>{lm[0].trim()}</span><span className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{formatInline(line.slice(lm[0].length))}</span></div>;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <div key={i} className="mb-1.5 leading-relaxed text-sm" style={{ color: T.textMuted }}>{formatInline(line)}</div>;
  });
};

// ─── MUSCLE RADAR CHART ───────────────────────────────────────────────────────
const MuscleRadar = ({ day, dist }: { day: { key: string; color: string }; dist: { name: string; count: number; pct: number }[] }) => {
  const axes = ["Back", "Shoulders", "Chest", "Arms", "Core", "Legs"];
  const dataMap = axes.map(a => (dist.find(d => d.name.toLowerCase().includes(a.toLowerCase()))?.count || 0));
  const cx = 50, cy = 50, r = 34;
  const mx = Math.max(...dataMap, 4);
  const pt = (v: number, i: number) => {
    const rad = (i * 60 - 90) * (Math.PI / 180);
    const rr = (v / mx) * r;
    return { x: cx + rr * Math.cos(rad), y: cy + rr * Math.sin(rad) };
  };
  const path = dataMap.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pt(v, i).x.toFixed(1)},${pt(v, i).y.toFixed(1)}`).join(' ') + ' Z';
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: "260px", margin: "0 auto", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`rg-${day.key}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={day.color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={day.color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(s => <circle key={s} cx={cx} cy={cy} r={r * s} fill="none" stroke={T.border} strokeWidth="0.3" />)}
      {axes.map((_, i) => { const ep = pt(mx, i); return <line key={i} x1={cx} y1={cy} x2={ep.x} y2={ep.y} stroke={T.border} strokeWidth="0.4" />; })}
      <path d={path} fill={`url(#rg-${day.key})`} stroke={day.color} strokeWidth="1.2" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const ep = pt(mx * 1.32, i);
        return <text key={i} x={ep.x} y={ep.y} fontSize="4.2" fontWeight={dataMap[i] > 0 ? "700" : "400"} fill={dataMap[i] > 0 ? T.text : T.textDim} textAnchor="middle" dominantBaseline="middle">{a}</text>;
      })}
    </svg>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DaedalusDashboard() {
  const [tab, setTab] = useState("training");
  const [wDay, setWDay] = useState("TUE"); // Default to Pull Day (priority)
  const [exOpen, setExOpen] = useState<string | null>(null);
  const [mSlot, setMSlot] = useState("breakfast");
  const [mOpen, setMOpen] = useState<string | null>(null);
  const [rTab, setRTab] = useState<keyof RuleGroups>("training");
  const [sOpen, setSOpen] = useState<number | null>(null);
  const [fOpen, setFOpen] = useState<number | null>(null);
  const [sciOpen, setSciOpen] = useState<number | null>(null);

  // AI Chat State
  const [apiKey, setApiKey] = useState<string>(() => {
    try { return typeof window !== "undefined" ? (localStorage.getItem("dai_api_key") || "") : ""; } catch { return ""; }
  });
  const [aiWorkoutInput, setAiWorkoutInput] = useState("");
  const [aiWorkoutResult, setAiWorkoutResult] = useState<string | null>(null);
  const [aiWorkoutLoading, setAiWorkoutLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Salaam! I'm your AI transformation coach. Ask me anything about the updated plan, nutrition, progressive overload, or how to adapt exercises. This plan is grounded in research — I can explain the science behind any decision." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

   // AI & Chat State
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("user_gemini_api_key");
  });

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // const saveKey = (k: string) => {
  //   setApiKey(k);
  //   try { if (typeof window !== "undefined") localStorage.setItem("dai_api_key", k); } catch {}
  // };
  const saveKey = (k:  string) => {
    setGeminiApiKey(k);
    if (typeof window !== "undefined") window.localStorage.setItem("user_gemini_api_key", k);
  };


  const callGemini = async (prompt: string, sys = "") => {
    if (!geminiApiKey) throw new Error("No API Key. Add in AI Coach tab.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: sys ? { parts: [{ text: sys }] } : undefined }),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || "Error");
    return d.candidates?.[0]?.content?.parts?.[0]?.text || "Error";
  };

  // const callClaude = async (prompt: string, sys: string) => {
  //   if (!apiKey) throw new Error("No API key. Add your Anthropic API key in the AI Coach tab.");
  //   const res = await fetch("https://api.anthropic.com/v1/messages", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       model: "claude-sonnet-4-20250514",
  //       max_tokens: 1000,
  //       system: sys,
  //       messages: [{ role: "user", content: prompt }],
  //     }),
  //   });
  //   const d = await res.json();
  //   if (!res.ok) throw new Error(d.error?.message || "API Error");
  //   return d.content?.[0]?.text || "No response";
  // };

  const handleWorkoutAdj = async () => {
    if (!aiWorkoutInput.trim()) return;
    setAiWorkoutLoading(true);
    const cur = WORKOUT_DAYS.find(d => d.key === wDay);
    try {
      const r = await callGemini(
        `Adapt the ${cur?.label} day for: "${aiWorkoutInput}". Keep the scientific principles intact. Include sets/reps/rest. Explain why each adaptation is made.`,
        `You are an elite transformation coach. The user is a 30yo male, 215lb, 2 weeks into a 16-week plan. Goals: wide back V-taper, 3D shoulders, belly fat loss. Be concise, scientific, and practical. Format in markdown.`
      );
      setAiWorkoutResult(r);
    } catch (e: unknown) {
      setAiWorkoutResult("Error: " + (e instanceof Error ? e.message : String(e)));
    }
    setAiWorkoutLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages(p => [...p, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const history = chatMessages.slice(-8).map(m => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`).join('\n');
      const r = await callGemini(
        `${history}\nUser: ${userMsg}`,
        `You are an elite transformation coach specializing in evidence-based training. User: 30yo male, 215lb, 2 weeks in. PLAN: Mon Push (6 exercises), Tue Pull (7 exercises — priority session), Wed Core+Cardio, Thu Lower Body (7 exercises), Fri HIIT+Core, Sat Recovery, Sun Rest. GOALS: wide back V-taper, 3D shoulders, belly/chest fat loss. CHANGES MADE: removed shrugs (V-taper reason), added Walking Lunges replacing Leg Extensions (EMG evidence), added Pallof Press replacing Bicycle Crunches (TVA research), upgraded lat pulldown to 5 sets, restructured Friday as HIIT-primary session. Be concise, scientific, practical. Use markdown. Keep responses under 250 words.`
      );
      setChatMessages(p => [...p, { role: "assistant", text: r }]);
    } catch (e: unknown) {
      setChatMessages(p => [...p, { role: "assistant", text: "Connection issue. Check your API key." }]);
    }
    setChatLoading(false);
  };

  const curDay = WORKOUT_DAYS.find(d => d.key === wDay)!;
  const curSlot = MEALS.find(s => s.id === mSlot)!;

  const muscleDist = useMemo(() => {
    if (!curDay) return [];
    const c: Record<string, number> = {}; let t = 0;
    curDay.exercises.forEach(ex => {
      const m = (ex.muscle || "").toLowerCase();
      const hits: string[] = [];
      if (m.includes("chest") || m.includes("pec")) hits.push("Chest");
      if (m.includes("shoulder") || m.includes("delt") || m.includes("lateral") || m.includes("face pull") || m.includes("rotator")) hits.push("Shoulders");
      if (m.includes("back") || m.includes("lat") || m.includes("row") || m.includes("trap") || m.includes("rhomb") || m.includes("posterior chain")) hits.push("Back");
      if (m.includes("bicep") || m.includes("tricep") || m.includes("arm") || m.includes("hammer") || m.includes("curl") || m.includes("dip") || m.includes("push") || m.includes("brachial")) hits.push("Arms");
      if (m.includes("core") || m.includes("ab") || m.includes("plank") || m.includes("rollout") || m.includes("pallof") || m.includes("dead bug") || m.includes("transverse") || m.includes("stabiliz")) hits.push("Core");
      if (m.includes("leg") || m.includes("quad") || m.includes("ham") || m.includes("glute") || m.includes("squat") || m.includes("calf") || m.includes("lunge") || m.includes("hip")) hits.push("Legs");
      if (hits.length === 0) hits.push("Other");
      hits.forEach(h => { c[h] = (c[h] || 0) + 1; t++; });
    });
    return Object.entries(c).map(([n, v]) => ({ name: n, count: v, pct: Math.round((v / t) * 100) })).sort((a, b) => b.count - a.count);
  }, [curDay]);

  const TABS = [
    { id: "training", label: "Training", emoji: "💪" },
    { id: "nutrition", label: "Nutrition", emoji: "🍱" },
    { id: "science", label: "Research", emoji: "🔬" },
    { id: "supps", label: "Supplements", emoji: "💊" },
    { id: "rules", label: "Rules", emoji: "📋" },
    { id: "faq", label: "FAQ", emoji: "❓" },
    { id: "coach", label: "AI Coach", emoji: "✨" },
  ];

  return (
    <div className="relative min-h-screen pb-24" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.011em" }}>
      {/* Background gradient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(37,99,235,0.07),transparent 60%),radial-gradient(ellipse 60% 50% at 90% 15%, rgba(124,58,237,0.05),transparent 60%),radial-gradient(ellipse 60% 50% at 50% 100%, rgba(13,148,136,0.04),transparent 60%)" }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(32px) saturate(200%)", WebkitBackdropFilter: "blur(32px) saturate(200%)", borderColor: T.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }} />
                <span className="font-mono text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: T.green }}>Scientifically Optimized · Week 2 Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg,#0B1220 0%,#4B5563 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                The Daedalus Initiative
              </h1>
              <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>30yr · 215 lb · Wide Back V-Taper · Shoulder Mass · Belly Fat Loss · 16-Week Protocol</p>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full lg:w-auto">
              <StatTile value="2,050" label="kcal" color={T.blue} />
              <StatTile value="185g+" label="Protein" color={T.green} />
              <StatTile value="16:8" label="IF Window" color={T.purple} />
              <StatTile value="6 Days" label="Weekly" color={T.amber} />
            </div>
          </div>
          <nav className="flex gap-0.5 overflow-x-auto -mx-4 px-4 pb-0.5" style={{ scrollbarWidth: "none" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setExOpen(null); setMOpen(null); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all relative flex-shrink-0"
                style={{ background: tab === t.id ? `${T.blue}12` : "transparent", color: tab === t.id ? T.blue : T.textMuted }}>
                <span>{t.emoji}</span>{t.label}
                {tab === t.id && <motion.div layoutId="tab-ul" className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: T.blue }} />}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 z-10">
        <AnimatePresence mode="wait">

          {/* ── TRAINING TAB ──────────────────────────────────────────────────── */}
          {tab === "training" && (
            <motion.div key="training" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Day selector */}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {WORKOUT_DAYS.map(d => (
                  <button key={d.key} onClick={() => { setWDay(d.key); setExOpen(null); setAiWorkoutResult(null); }}
                    className="shrink-0 py-3 px-4 text-center min-w-19 rounded-2xl transition-all"
                    style={{ background: wDay === d.key ? `${d.color}15` : T.surface, backdropFilter: "blur(20px)", border: `1px solid ${wDay === d.key ? d.color : T.border}`, boxShadow: wDay === d.key ? `0 4px 16px -4px ${d.color}35` : undefined }}>
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="font-mono text-xs font-bold" style={{ color: wDay === d.key ? d.color : T.textMuted }}>{d.key}</div>
                    <div className="text-[9px] mt-0.5 font-medium" style={{ color: T.textDim }}>{d.label.split(" ")[0]}</div>
                  </button>
                ))}
              </div>

              {curDay && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    {/* Day overview card */}
                    <GlassCard elevated className="p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: curDay.color, transform: "translate(30%,-30%)" }} />
                      <div className="relative">
                        <div className="flex flex-wrap items-baseline gap-2 mb-2">
                          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: curDay.color }}>{curDay.emoji} {curDay.label}</h2>
                          <span className="text-xs" style={{ color: T.textMuted }}>{curDay.sub}</span>
                          <span className="font-mono text-[10px] font-bold sm:ml-auto" style={{ color: T.textDim }}>⏱ {curDay.sessionTime}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: T.textMuted }}>{curDay.overview}</p>

                        {/* Science note */}
                        {curDay.scienceNote && (
                          <div className="rounded-xl p-3 mb-3" style={{ background: `${curDay.color}08`, border: `1px solid ${curDay.color}20` }}>
                            <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: curDay.color }}>🔬 Research Basis</div>
                            <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{curDay.scienceNote}</p>
                          </div>
                        )}

                        {/* Changes from previous plan */}
                        {curDay.changes.length > 0 && (
                          <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)" }}>
                            <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: T.green }}>✓ Optimized Changes vs Previous Plan</div>
                            {curDay.changes.map((c, i) => (
                              <div key={i} className="text-xs flex items-start gap-1.5 mb-1" style={{ color: T.textMuted }}>
                                <span style={{ color: T.green, flexShrink: 0 }}>→</span>{c}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t" style={{ borderColor: T.border }}>
                          <FatigueBar score={curDay.fatigueScore} color={curDay.color} />
                        </div>
                      </div>
                    </GlassCard>

                    {/* AI Workout Adjuster */}
                    <GlassCard className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <h3 className="text-sm font-bold">AI Workout Adjuster</h3>
                        <span className="text-xs ml-auto" style={{ color: T.textDim }}>Needs API Key (Coach tab)</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {["30 min only", "Lower back tight", "No barbells", "Shoulder pain", "Home workout"].map(p => (
                          <button key={p} onClick={() => setAiWorkoutInput(p)} className="text-xs py-1.5 px-3 rounded-full font-medium transition-all" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}` }}>{p}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={aiWorkoutInput} onChange={e => setAiWorkoutInput(e.target.value)} placeholder="e.g. I have a knee injury, adapt lower body..." className="flex-1 rounded-xl px-4 py-2.5 text-sm" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }} />
                        <button onClick={handleWorkoutAdj} disabled={aiWorkoutLoading || !aiWorkoutInput.trim()} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all" style={{ background: T.blue, opacity: (aiWorkoutLoading || !aiWorkoutInput.trim()) ? 0.5 : 1 }}>
                          {aiWorkoutLoading ? "..." : "Adapt"}
                        </button>
                      </div>
                      {aiWorkoutResult && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-4 text-xs overflow-hidden" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                          {formatAIResponse(aiWorkoutResult)}
                        </motion.div>
                      )}
                    </GlassCard>

                    {/* Warm-up */}
                    {curDay.warmup.length > 0 && (
                      <div>
                        <SectionLabel text="Warm-Up Protocol · 8 min (Non-Negotiable)" color={T.teal} />
                        <div className="flex flex-wrap gap-2">
                          {curDay.warmup.map((w, i) => (
                            <div key={i} className="rounded-xl py-2 px-3 text-xs font-medium flex items-center gap-1.5" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}` }}>
                              <span style={{ color: T.teal }}>→</span>{w}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercises */}
                    <div>
                      <SectionLabel text={`Exercise Program · ${curDay.exercises.length} movements`} color={curDay.color} />
                      <div className="space-y-3">
                        {curDay.exercises.map((ex, i) => {
                          const key = `${wDay}-${i}`;
                          const open = exOpen === key;
                          return (
                            <motion.div key={i} layout className="rounded-2xl overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", border: `1px solid ${open ? curDay.color : T.border}`, boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(15,23,42,0.06)" }}>
                              <button onClick={() => setExOpen(open ? null : key)} className="w-full p-4 text-left flex items-start gap-3 transition-all hover:bg-white/40">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold" style={{ background: `${curDay.color}12`, border: `1px solid ${curDay.color}28`, color: curDay.color }}>
                                  {String(i + 1).padStart(2, "0")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-sm font-bold" style={{ color: T.text }}>{ex.name}</span>
                                    {(ex as { isNew: boolean }).isNew && <ChangeBadge type="new" />}
                                    {(ex as { isModified: boolean }).isModified && <ChangeBadge type="modified" />}
                                    {ex.priority === "A+" && <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${T.red}15`, color: T.red, border: `1px solid ${T.red}25` }}>A+</span>}
                                    {ex.priority === "A★" && <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${curDay.color}15`, color: curDay.color, border: `1px solid ${curDay.color}25` }}>★ KEY</span>}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: T.textMuted }}>
                                    <span className="font-mono font-bold" style={{ color: curDay.color }}>{ex.sets}×{ex.reps}</span>
                                    <span style={{ color: T.border }}>·</span>
                                    <span className="truncate">{ex.muscle}</span>
                                    <span className="hidden sm:inline" style={{ color: T.border }}>·</span>
                                    <span className="hidden sm:inline">Rest: {ex.rest}</span>
                                  </div>
                                </div>
                                <motion.div animate={{ rotate: open ? 45 : 0 }} className="text-xl font-light flex-shrink-0 mt-1.5" style={{ color: T.textDim }}>+</motion.div>
                              </button>

                              <AnimatePresence>
                                {open && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeInOut" }} className="overflow-hidden">
                                    <div className="px-4 pb-5 border-t space-y-4 pt-4 ml-[52px]" style={{ borderColor: T.border }}>

                                      {/* Science basis */}
                                      {(ex as { scienceBasis: string }).scienceBasis && (
                                        <div className="rounded-xl p-3" style={{ background: `${T.indigo}06`, border: `1px solid ${T.indigo}18` }}>
                                          <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.indigo }}>🔬 Why This Exercise (Evidence)</div>
                                          <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{(ex as { scienceBasis: string }).scienceBasis}</p>
                                        </div>
                                      )}

                                      {/* Progression weights */}
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[["Rest Between Sets", ex.rest, T.textMuted], ["Week 1–2 Weight", ex.startW, T.textMuted], ["Week 8 Target", ex.w8, T.blue], ["Week 16 Target", ex.w16, T.green]].map(([l, v, c]) => (
                                          <div key={l} className="rounded-xl p-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                            <div className="font-mono text-[8px] font-bold uppercase tracking-wider" style={{ color: T.textDim }}>{l}</div>
                                            <div className="font-mono text-xs font-bold mt-1" style={{ color: c as string }}>{v}</div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Form cues */}
                                      <div>
                                        <SectionLabel text="Execution Cues" color={curDay.color} />
                                        <div className="space-y-2">
                                          {ex.form.map((f, fi) => (
                                            <div key={fi} className="flex gap-3 items-start">
                                              <span className="flex-shrink-0 w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center" style={{ background: `${curDay.color}15`, color: curDay.color }}>{fi + 1}</span>
                                              <span className="text-xs leading-relaxed pt-0.5" style={{ color: T.textMuted }}>{f}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Mistakes + Tip + Advanced + Beginner */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div className="rounded-xl p-3" style={{ background: `${T.red}07`, border: `1px solid ${T.red}18` }}>
                                          <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.red }}>⚠ Common Mistakes</div>
                                          {ex.mistakes.map((m, mi) => <div key={mi} className="text-xs mb-1" style={{ color: T.textMuted }}>✗ {m}</div>)}
                                        </div>
                                        <div className="rounded-xl p-3" style={{ background: `${T.blue}07`, border: `1px solid ${T.blue}18` }}>
                                          <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.blue }}>💡 Coach&apos;s Tip</div>
                                          <div className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{ex.tip}</div>
                                        </div>
                                        {ex.advanced && (
                                          <div className="rounded-xl p-3" style={{ background: `${T.purple}07`, border: `1px solid ${T.purple}18` }}>
                                            <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purple }}>↑ Advanced (Week 9+)</div>
                                            <div className="text-xs" style={{ color: T.textMuted }}>{ex.advanced}</div>
                                          </div>
                                        )}
                                        {ex.beginner && (
                                          <div className="rounded-xl p-3" style={{ background: `${T.teal}07`, border: `1px solid ${T.teal}18` }}>
                                            <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.teal }}>↓ Beginner Modification</div>
                                            <div className="text-xs" style={{ color: T.textMuted }}>{ex.beginner}</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cardio */}
                    <div>
                      <SectionLabel text="Cardio Protocol" color={T.green} />
                      <GlassCard className="p-5" style={{ borderLeft: `4px solid ${T.green}`, borderRadius: "0 18px 18px 0" }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {[["Type", curDay.cardio.type, T.text], ["Duration", curDay.cardio.duration, T.green], ["Intensity", curDay.cardio.intensity, T.textMuted], ["Timing", curDay.cardio.timing, T.textDim]].map(([l, v, c]) => (
                            <div key={l}><div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.textDim }}>{l}</div><div className="text-xs font-semibold leading-snug" style={{ color: c as string }}>{v}</div></div>
                          ))}
                        </div>
                        <div className="pt-3 border-t" style={{ borderColor: T.border }}>
                          <div className="flex items-start gap-2"><span className="text-sm">🔬</span><p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{curDay.cardio.why}</p></div>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Cooldown */}
                    <div>
                      <SectionLabel text="Cool-Down Protocol · Required" color={T.purple} />
                      <div className="flex flex-wrap gap-2">
                        {curDay.cooldown.map((c, ci) => (
                          <div key={ci} className="rounded-xl py-2 px-3 text-xs font-medium flex items-center gap-1.5" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}` }}>
                            <span style={{ color: T.purple }}>•</span>{c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-5">
                    <GlassCard className="p-5">
                      <SectionLabel text="Muscle Target Map" color={curDay.color} />
                      <MuscleRadar day={curDay} dist={muscleDist} />
                      <div className="mt-4 space-y-2">
                        {muscleDist.map(m => (
                          <div key={m.name}>
                            <div className="flex justify-between mb-1">
                              <span className="text-[11px] font-semibold" style={{ color: T.text }}>{m.name}</span>
                              <span className="font-mono text-[10px] font-bold" style={{ color: T.textDim }}>{m.pct}%</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.15)" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${curDay.color}80,${curDay.color})` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                      <SectionLabel text="Session Volume" color={T.blue} />
                      <div className="grid grid-cols-2 gap-3">
                        <div><div className="font-mono text-xl font-bold" style={{ color: curDay.color }}>{curDay.exercises.reduce((s, e) => s + e.sets, 0)}</div><div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: T.textDim }}>Total Sets</div></div>
                        <div><div className="font-mono text-xl font-bold" style={{ color: curDay.color }}>{curDay.exercises.length}</div><div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: T.textDim }}>Movements</div></div>
                      </div>
                    </GlassCard>

                    {/* Progressive overload guide */}
                    <GlassCard className="p-4">
                      <SectionLabel text="Progressive Overload Guide" color={T.green} />
                      <div className="space-y-2.5 text-xs" style={{ color: T.textMuted }}>
                        <div className="flex items-start gap-2"><span style={{ color: T.green, flexShrink: 0 }}>→</span><span>Hit top of rep range (+1 rep from last session) before adding weight</span></div>
                        <div className="flex items-start gap-2"><span style={{ color: T.blue, flexShrink: 0 }}>→</span><span>Add 5 lb (compound) or 2.5 lb (isolation) when you hit the top rep target</span></div>
                        <div className="flex items-start gap-2"><span style={{ color: T.amber, flexShrink: 0 }}>→</span><span>If you can&apos;t hit bottom of rep range: keep the weight, improve form</span></div>
                        <div className="flex items-start gap-2"><span style={{ color: T.red, flexShrink: 0 }}>→</span><span>Log every session. You cannot overload what you cannot track</span></div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── NUTRITION TAB ─────────────────────────────────────────────────── */}
          {tab === "nutrition" && (
            <motion.div key="nutrition" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile value="2,050" label="kcal Target" color={T.blue} />
                <StatTile value="185g+" label="Protein Daily" color={T.green} />
                <StatTile value="9:30 PM" label="IF Window Closes" color={T.purple} />
                <StatTile value="2×" label="Chai (Built In)" color={T.amber} />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {MEALS.map(s => (
                  <button key={s.id} onClick={() => { setMSlot(s.id); setMOpen(null); }}
                    className="flex-shrink-0 rounded-2xl py-3 px-4 text-center min-w-[90px] transition-all"
                    style={{ background: mSlot === s.id ? `${s.color}15` : T.surface, backdropFilter: "blur(20px)", border: `1px solid ${mSlot === s.id ? s.color : T.border}` }}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-xs font-bold" style={{ color: mSlot === s.id ? s.color : T.textMuted }}>{s.label}</div>
                    <div className="font-mono text-[9px] mt-0.5" style={{ color: T.textDim }}>{s.time}</div>
                  </button>
                ))}
              </div>

              {curSlot && (
                <div className="space-y-4">
                  <GlassCard className="p-4" style={{ borderLeft: `4px solid ${curSlot.color}`, borderRadius: "0 18px 18px 0" }}>
                    <p className="text-sm" style={{ color: T.textMuted }}>{curSlot.note}</p>
                  </GlassCard>

                  <div className="space-y-3">
                    {curSlot.options.map((m, i) => {
                      const open = mOpen === m.name;
                      return (
                        <GlassCard key={i} elevated={open} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex gap-1.5 flex-wrap mb-2">
                              <TagPill text={m.tag} color={curSlot.color} />
                              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: T.surfaceAlt, color: T.textDim, border: `1px solid ${T.border}` }}>{m.diff} · {m.time}</span>
                            </div>
                            <div onClick={() => setMOpen(open ? null : m.name)} className="cursor-pointer">
                              <div className="text-base font-bold mb-1" style={{ color: T.text }}>{m.name}</div>
                              <div className="text-xs mb-3" style={{ color: T.textMuted }}>{m.desc}</div>
                              <div className="flex gap-4 text-xs">
                                <div><span className="font-mono font-bold" style={{ color: T.blue }}>{m.cal}</span><span className="ml-1" style={{ color: T.textDim }}>cal</span></div>
                                <div><span className="font-mono font-bold" style={{ color: T.green }}>{m.pro}g</span><span className="ml-1" style={{ color: T.textDim }}>protein</span></div>
                              </div>
                            </div>
                          </div>
                          <AnimatePresence>
                            {open && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-4 pb-4 border-t pt-4 space-y-4" style={{ borderColor: T.border }}>
                                  <div>
                                    <SectionLabel text="Ingredients" color={curSlot.color} />
                                    <div className="flex flex-wrap gap-1.5">
                                      {m.ing.map((ig, ii) => <span key={ii} className="text-xs px-2.5 py-1 rounded-full" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMuted }}>{ig}</span>)}
                                    </div>
                                  </div>
                                  <div>
                                    <SectionLabel text="Steps" color={curSlot.color} />
                                    {m.steps.map((st, si) => (
                                      <div key={si} className="flex gap-2.5 items-start mb-2">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center" style={{ background: `${curSlot.color}15`, color: curSlot.color }}>{si + 1}</span>
                                        <div className="text-xs" style={{ color: T.textMuted }}><strong style={{ color: T.text }}>{st.s}:</strong> {st.d}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="rounded-xl p-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                      <div className="font-mono text-[9px] font-bold uppercase mb-1" style={{ color: T.textDim }}>Notes</div>
                                      <div className="text-xs" style={{ color: T.textMuted }}>{m.notes}</div>
                                    </div>
                                    <div className="rounded-xl p-3" style={{ background: `${curSlot.color}07`, border: `1px solid ${curSlot.color}18` }}>
                                      <div className="font-mono text-[9px] font-bold uppercase mb-1" style={{ color: curSlot.color }}>Swap Option</div>
                                      <div className="text-xs" style={{ color: T.textMuted }}>{m.swap}</div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── SCIENCE / RESEARCH TAB ────────────────────────────────────────── */}
          {tab === "science" && (
            <motion.div key="science" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <GlassCard className="p-5">
                <h2 className="text-base font-bold mb-2" style={{ color: T.text }}>Scientific Evidence Base</h2>
                <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>
                  Every change made to this plan is grounded in peer-reviewed research. The following summaries explain <em>why</em> each key decision was made, which study supports it, and how it applies specifically to your goals of back width, shoulder mass, and belly fat loss.
                </p>
              </GlassCard>

              <div className="space-y-3">
                {SCIENCE.map((s, i) => {
                  const open = sciOpen === i;
                  return (
                    <GlassCard key={i} elevated={open} className="overflow-hidden">
                      <button onClick={() => setSciOpen(open ? null : i)} className="w-full p-4 text-left flex justify-between items-start gap-3 transition-all hover:bg-white/40">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <TagPill text={s.badge} color={s.color} />
                          </div>
                          <div className="text-sm font-bold" style={{ color: T.text }}>{s.title}</div>
                          <div className="font-mono text-[10px] mt-1" style={{ color: T.textDim }}>{s.citation}</div>
                        </div>
                        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-lg flex-shrink-0" style={{ color: T.textDim }}>+</motion.span>
                      </button>
                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-4 pb-4 border-t pt-4 space-y-3" style={{ borderColor: T.border }}>
                              <div>
                                <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.textDim }}>Research Finding</div>
                                <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{s.finding}</p>
                              </div>
                              <div className="rounded-xl p-3" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                                <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: s.color }}>Applied to Your Plan</div>
                                <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{s.application}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── SUPPLEMENTS TAB ───────────────────────────────────────────────── */}
          {tab === "supps" && (
            <motion.div key="supps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <GlassCard className="p-5">
                <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>
                  <strong style={{ color: T.blue }}>Supplements accelerate results achieved on top of solid training and nutrition.</strong> Start with Essential tier only. Add High Priority at week 4. Never use supplements to compensate for a poor diet.
                </p>
              </GlassCard>
              <div className="space-y-3">
                {SUPPS.map((s, i) => {
                  const open = sOpen === i;
                  return (
                    <GlassCard key={i} elevated={open} className="overflow-hidden">
                      <button onClick={() => setSOpen(open ? null : i)} className="w-full p-4 text-left flex justify-between items-center gap-3 transition-all hover:bg-white/40">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1"><span className="text-sm font-bold" style={{ color: T.text }}>{s.name}</span><TagPill text={s.tier} color={s.tc} /></div>
                          <div className="text-xs font-mono" style={{ color: T.textMuted }}>{s.dose} · {s.timing}</div>
                        </div>
                        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-lg" style={{ color: T.textDim }}>+</motion.span>
                      </button>
                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-4 pb-4 border-t pt-4 space-y-3" style={{ borderColor: T.border }}>
                              <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{s.why}</p>
                              <div className="rounded-xl p-3" style={{ background: `${T.blue}07`, border: `1px solid ${T.blue}18` }}>
                                <div className="font-mono text-[9px] font-bold uppercase mb-1" style={{ color: T.blue }}>Evidence</div>
                                <div className="text-xs" style={{ color: T.textMuted }}>{s.evidence}</div>
                              </div>
                              <div className="text-xs font-mono pt-1 border-t" style={{ color: T.textDim, borderColor: T.border }}>🏷 Recommended Brand: {s.brand}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── RULES TAB ─────────────────────────────────────────────────────── */}
          {tab === "rules" && (
            <motion.div key="rules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(["training", "nutrition", "lifestyle"] as const).map((k) => {
                  const cfg = { training: [T.blue, "Training"], nutrition: [T.green, "Nutrition"], lifestyle: [T.purple, "Lifestyle"] }[k];
                  return (
                    <button key={k} onClick={() => setRTab(k)} className="rounded-xl py-2.5 px-3 text-sm font-bold capitalize transition-all" style={{ background: rTab === k ? `${cfg[0]}12` : T.surface, backdropFilter: "blur(20px)", border: `1px solid ${rTab === k ? cfg[0] : T.border}`, color: rTab === k ? cfg[0] as string : T.textMuted }}>
                      {cfg[1] as string}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2.5">
                {RULES[rTab].map((rule, i) => (
                  <GlassCard key={i} className="p-4 flex gap-3 items-start">
                    <div className="font-mono text-sm font-bold flex-shrink-0" style={{ color: T.textDim }}>{String(i + 1).padStart(2, "0")}</div>
                    <div className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{rule}</div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── FAQ TAB ───────────────────────────────────────────────────────── */}
          {tab === "faq" && (
            <motion.div key="faq" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {FAQS.map((f, i) => {
                const open = fOpen === i;
                return (
                  <GlassCard key={i} elevated={open} className="overflow-hidden">
                    <button onClick={() => setFOpen(open ? null : i)} className="w-full p-4 text-left flex justify-between items-center gap-4 hover:bg-white/40 transition-all">
                      <span className="text-sm font-bold" style={{ color: T.text }}>{f.q}</span>
                      <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-lg flex-shrink-0" style={{ color: T.textDim }}>+</motion.span>
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t pt-4" style={{ borderColor: T.border }}>
                            <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{f.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                );
              })}
            </motion.div>
          )}

          {/* ── AI COACH TAB ──────────────────────────────────────────────────── */}
          {tab === "coach" && (
            <motion.div key="coach" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <GlassCard className="p-5 space-y-3">
                <div className="flex items-center gap-2"><span className="text-lg">🔑</span><h3 className="text-sm font-bold">Anthropic API Key</h3></div>
                <p className="text-xs" style={{ color: T.textMuted }}>Enter your Anthropic API key to enable AI coaching. Stored locally in your browser only — never sent anywhere except the Anthropic API.</p>
                <div className="flex gap-2">
                  <input type="password" value={geminiApiKey  || ""}onChange={e => saveKey(e.target.value)} placeholder="sk-ant-api03-..." className="flex-1 rounded-xl px-4 py-2.5 text-sm font-mono" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }} />
                  {geminiApiKey && <button onClick={() => saveKey("")} className="rounded-xl px-4 text-sm font-semibold" style={{ background: `${T.red}12`, color: T.red, border: `1px solid ${T.red}25` }}>Clear</button>}
                </div>
                {geminiApiKey && <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: T.green }}>✓ API key saved locally</div>}
              </GlassCard>

              <GlassCard elevated className="p-0 overflow-hidden">
                <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: T.border }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: geminiApiKey ? T.green : T.textDim }} />
                  <h3 className="text-sm font-bold">AI Transformation Coach</h3>
                  {!geminiApiKey && <span className="text-xs ml-auto" style={{ color: T.red }}>Add API key to enable</span>}
                </div>
                <div style={{ height: 440, display: "flex", flexDirection: "column" }}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
                    {chatMessages.map((m, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-[85%] p-3 text-xs leading-relaxed"
                        style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", marginLeft: m.role === "user" ? "auto" : 0, background: m.role === "user" ? T.blue : T.surfaceAlt, color: m.role === "user" ? "#FFF" : T.text, borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", border: m.role === "user" ? "none" : `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
                        {m.role === "user" ? m.text : formatAIResponse(m.text)}
                      </motion.div>
                    ))}
                    {chatLoading && <div className="p-3 rounded-2xl text-xs" style={{ background: T.surfaceAlt, color: T.textDim, border: `1px solid ${T.border}` }}>Thinking...</div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-3 border-t flex gap-2" style={{ borderColor: T.border }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleChat()} placeholder={geminiApiKey ? "Ask about the plan, exercises, nutrition..." : "Add API key above to enable chat"} disabled={!geminiApiKey} className="flex-1 rounded-xl px-4 py-2.5 text-sm" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, opacity: geminiApiKey ? 1 : 0.5 }} />
                    <button onClick={handleChat} disabled={chatLoading || !chatInput.trim() || !geminiApiKey} className="rounded-xl px-5 text-sm font-semibold text-white transition-all" style={{ background: T.blue, opacity: (chatLoading || !chatInput.trim() || !geminiApiKey) ? 0.5 : 1 }}>Send</button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="relative border-t py-6 text-center z-10" style={{ borderColor: T.border }}>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.textDim }}>
          Scientifically Optimized · Evidence-Based · Built for Consistency
        </div>
        <div className="font-mono text-[9px] mt-1" style={{ color: T.textDim }}>
          Schoenfeld 2017 · Andersen 2014 · Sharma 2019 · Aniceto 2021 · NIH EPOC 2024
        </div>
      </footer>
    </div>
  );
}