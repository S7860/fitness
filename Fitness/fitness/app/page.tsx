"use client";
import { useState, useMemo, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  // className, style, etc., are already included by HTMLAttributes
}

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────────────────────── */
const T = {
  bg: "#F6F7F9",
  surface: "rgba(255,255,255,0.72)",
  surfaceSolid: "#FFFFFF",
  surfaceAlt: "rgba(241,245,249,0.6)",
  border: "rgba(226,232,240,0.8)",
  borderHover: "rgba(203,213,225,0.9)",
  text: "#0B1220",
  textMuted: "#475569",
  textDim: "#94A3B8",
  blue: "#2563EB",
  green: "#16A34A",
  red: "#DC2626",
  amber: "#D97706",
  purple: "#9333EA",
  teal: "#0D9488",
};

/* ─────────────────────────────────────────────────────────────
   WORKOUT DATA — FINAL SCIENTIFICALLY OPTIMIZED SPLIT
   ───────────────────────────────────────────────────────────── */
const WORKOUT_DAYS = [
  {
    key: "MON", label: "Push Day", sub: "Chest · Shoulders · Triceps",
    color: T.blue, emoji: "💪", sessionTime: "65–75 min", fatigueScore: 74,
    overview: "Triple-checked hypertrophy sequence balancing progressive compound overloads with continuous cable tension vectors. Maximizes clavicular and sternal pec density while building dramatic shoulder-cap width.",
    warmup: [
      "Arm Circles — 30 sec forward, 30 sec backward",
      "Band Pull-Aparts — 2 × 15",
      "Incline Push-Ups — 2 × 12",
      "Light DB Lateral Raises — 2 × 15 @ 5 lb",
    ],
    exercises: [
      {
        name: "Flat Dumbbell Bench Press", priority: "A+", muscle: "Sternal Pectoralis Major, Anterior Delt, Triceps",
        sets: 3, reps: "8–10", rest: "2–3 min", startW: "45 lb DBs", w8: "60 lb", w16: "75 lb",
        form: [
          "Lie flat on the bench, feet packed and driven firmly into the floor.",
          "Lower dumbbells slowly toward the mid-chest, keeping elbows tucked at a 45-degree angle.",
          "Press upward and slightly inward, squeezing the chest at peak contraction.",
          "Control the eccentric phase for 2–3 full seconds."
        ],
        mistakes: ["Bouncing at the bottom using momentum", "Flaring elbows to 90 degrees which endangers the rotator cuffs"],
        tip: "Imagine trying to squeeze your armpits together as you press up; this enhances mind-muscle connection.",
        advanced: "Week 9+: Incorporate a 3-second pause at the absolute bottom.",
        beginner: "Focus on tracking a stable, balanced vertical path."
      },
      {
        name: "Incline Dumbbell Press", priority: "A", muscle: "Clavicular Pectoralis Major (Upper Chest)",
        sets: 3, reps: "10", rest: "2 min", startW: "35 lb DBs", w8: "45 lb", w16: "60 lb",
        form: [
          "Set bench to 30–35°. Higher shifts to shoulders; lower to mid-chest.",
          "Grip DBs with thumbs wrapped. Lower to UPPER chest.",
          "Full lockout. Squeeze chest hard 1 second at top."
        ],
        mistakes: ["Setting bench angle too steep", "Shortening the range of motion"],
        tip: "Stretch-mediated hypertrophy research proves that maximizing the deep stretch yields superior upper chest mass.",
        advanced: "Week 9+: Drop set on final set — full weight × 8, drop 30%, × 8 more.",
        beginner: "Machine chest press for first 2 weeks if DBs feel unstable."
      },
      {
        name: "Overhead Barbell Press (OHP)", priority: "A", muscle: "Anterior Deltoids, Core Framework",
        sets: 3, reps: "6–8", rest: "2–3 min", startW: "65 lb bar", w8: "85 lb", w16: "115 lb",
        form: [
          "Brace core HARD before every single rep. This protects your lower back.",
          "Press straight up — bar path arcs slightly back once it passes your nose.",
          "Full lockout at top — arms completely straight."
        ],
        mistakes: ["Lower back arching excessively", "Incomplete lockout at top"],
        tip: "'Push the floor away with your feet' while pressing. This full-body tension cue makes you immediately stronger.",
        advanced: "Week 9+: Pause for 1 second on the collarbone before pressing.",
        beginner: "Smith machine OHP for first 3 weeks."
      },
      {
        name: "Single-Arm Cable Lateral Raise", priority: "A★", muscle: "Lateral Deltoid (Primary Width Builder)",
        sets: 3, reps: "12–15 each side", rest: "90s", startW: "10 lb/side", w8: "20 lb", w16: "30 lb",
        form: [
          "Stand sideways to cable. Cable at lowest position. Slight forward lean (15°).",
          "Raise arm to shoulder height. Lead with ELBOW, not hand.",
          "Cable crosses body on the way up = constant tension through FULL range."
        ],
        mistakes: ["Swinging weight up with momentum", "Raising above shoulder level"],
        tip: "Cables are superior to dumbbells here because of constant tension at the bottom. Prioritize this above all other shoulder work.",
        advanced: "Week 9+: 1-second isometric hold at the top of every rep.",
        beginner: "Use lightest weight to perfect the elbow-led tracking."
      },
      {
        name: "Dumbbell Lateral Raise (Drop Set)", priority: "B", muscle: "Lateral Deltoid (Metabolic Finisher)",
        sets: 3, reps: "15 → 12 → 10", rest: "None between drops", startW: "20-15-10 lb", w8: "25-20-15 lb", w16: "35-25-15 lb",
        form: [
          "Start with heavy weight × 15. Immediately drop weight × 12. Immediately drop again × 10.",
          "All three drops = 1 set. Rest 90 sec between sets.",
          "Same form as cable raises: elbow leads, slight lean."
        ],
        mistakes: ["Using heavy torso swinging to cheat the load upward"],
        tip: "Slightly tilt your hands forward at the top (like pouring out a pitcher of water) to ensure absolute alignment onto the lateral delt head.",
        advanced: "Add a 5-second partial-range pump at the end of the final drop.",
        beginner: "Straight sets of 15 reps are fine for the first 4 weeks."
      },
      {
        name: "Tricep Dips", priority: "B", muscle: "All 3 Tricep Heads, Lower Chest",
        sets: 3, reps: "10–12", rest: "2 min", startW: "Bodyweight", w8: "BW + 10 lb", w16: "BW + 25 lb",
        form: [
          "Parallel bars. Slight forward lean for more chest, upright for more tricep.",
          "Lower until upper arms are parallel to floor.",
          "Drive back up to full lockout."
        ],
        mistakes: ["Going too deep (shoulder impingement risk)", "Elbows flaring too wide"],
        tip: "Dips are the ultimate compound arm builder. Heavy weighted dips build serious arm mass.",
        advanced: "Week 9+: Weighted dips with dip belt.",
        beginner: "Bench dips with feet on floor."
      },
      {
        name: "Tricep Rope Pushdown", priority: "B", muscle: "Triceps Lateral Head (Outer Definition)",
        sets: 3, reps: "12–15", rest: "90s", startW: "30 lb", w8: "50 lb", w16: "70 lb",
        form: [
          "Cable at highest position. Rope attachment. Slight forward lean.",
          "Elbows PINNED to sides — they are the axis and must NEVER move.",
          "Push rope down AND apart at bottom — split rope ends outward."
        ],
        mistakes: ["Elbows drifting forward", "Not reaching full extension at bottom"],
        tip: "Consciously flex the tricep as hard as you can at the bottom of each rep.",
        advanced: "Week 9+: 2-second pause at the bottom of the movement.",
        beginner: "Start light and learn the elbow anchor position."
      }
    ],
    cardio: { type: "Incline Treadmill Walk", duration: "20–25 min", intensity: "3.0–3.5 mph / 8–12% incline", timing: "Post-lifting", why: "Zone 2 cardio after lifting burns fat from depleted glycogen stores without catabolizing upper body muscle gains." },
    cooldown: ["Chest doorframe stretch 30s each", "Cross-body shoulder stretch 30s each", "Deep breathing 2 min"],
  },
  {
    key: "TUE", label: "Pull Day", sub: "Back Width · Thickness · Traps · Biceps",
    color: T.green, emoji: "🏋️", sessionTime: "70–80 min", fatigueScore: 88,
    overview: "Your most important session. Back development creates the V-taper that makes your waist look dramatically smaller. Rotational grips on cables eliminate lower back bottlenecks.",
    warmup: [
      "Dead Hangs — 3 × 20 sec",
      "Band Pull-Aparts / Face Pulls — 2 × 20",
      "Light Lat Pulldown — 2 × 15",
      "Cat-Cow Spinal Mobility — 10 reps",
    ],
    exercises: [
      {
        name: "Conventional Deadlift", priority: "A+", muscle: "Full Posterior Chain",
        sets: 3, reps: "5", rest: "3 min", startW: "165 lb", w8: "195 lb", w16: "245 lb",
        form: [
          "Bar over mid-foot. Grip shoulder-width. Arms vertical from front.",
          "SETUP: brace core like about to be punched → chest up → shoulders back.",
          "Leg drive: push the floor away while bar STAYS in contact with legs.",
          "Do NOT hyperextend lower back at lockout."
        ],
        mistakes: ["Rounding lower back", "Jerking the weight"],
        tip: "Think of the deadlift as a LEG PRESS — you're pushing the floor away, not pulling the bar up.",
        advanced: "Week 9+: Controlled dead-stop resets on every rep.",
        beginner: "Elevated blocks or rack pulls."
      },
      {
        name: "Wide-Grip Lat Pulldown", priority: "A", muscle: "Latissimus Dorsi (Width)",
        sets: 4, reps: "10–12", rest: "2 min", startW: "100 lb", w8: "120 lb", w16: "155 lb",
        form: [
          "Grip bar 6–8 inches outside shoulders. Lean back 15–20°.",
          "Drive ELBOWS DOWN toward hip pockets.",
          "Let bar rise all the way back up for a full lat STRETCH at top."
        ],
        mistakes: ["Pulling behind the neck", "Using biceps instead of driving elbows down"],
        tip: "'Put my elbows in my back pockets.' That cue builds the V-taper.",
        advanced: "Week 9+: 2-second isometric pause at peak contraction.",
        beginner: "Assisted pull-up machine."
      },
      {
        name: "Barbell Bent-Over Row", priority: "A", muscle: "Rhomboids, Mid-Traps, Lower Lats",
        sets: 3, reps: "8–10", rest: "2 min", startW: "75 lb", w8: "110 lb", w16: "145 lb",
        form: [
          "Hinge forward 45–60° from vertical. Knees slightly bent. Core RIGID.",
          "Pull bar to LOWER ABDOMEN to target mid-back thickness.",
          "2-sec controlled descent — feel the mid-back stretch."
        ],
        mistakes: ["Torso rocking up and down for momentum", "Rounded lower back"],
        tip: "Pulling to the belly button targets mid-back thickness. Lower ribs = width.",
        advanced: "Week 9+: Pendlay Row (bar starts on floor each rep).",
        beginner: "Chest-supported dumbbell row."
      },
      {
        name: "Seated Cable Row (Variable Grip)", priority: "B", muscle: "Lower Lats (V-Grip) or Upper Back (Wide Grip)",
        sets: 3, reps: "10–12", rest: "90s", startW: "100 lb", w8: "120 lb", w16: "150 lb",
        form: [
          "Start sitting TALL. Row handle to lower abdomen.",
          "Vary attachments: Close V-Grip (Week A) for lats, Wide Overhand (Week B) for upper back.",
          "Lean forward fully on return to spread shoulder blades apart."
        ],
        mistakes: ["Leaning way back to swing the weight"],
        tip: "The cable row removes spinal loading, allowing you to train your back to true failure safely.",
        advanced: "Week 9+: 3-second negative/eccentric phase.",
        beginner: "Machine row."
      },
      {
        name: "Cable Rope Face Pull", priority: "A★", muscle: "Posterior Deltoid, Rotator Cuff",
        sets: 3, reps: "15–20", rest: "60s", startW: "30 lb", w8: "45 lb", w16: "55 lb",
        form: [
          "Cable at head height. Pull rope to FACE.",
          "Elbows go HIGH and WIDE (goal post position).",
          "Pull hands apart at the apex of the contraction."
        ],
        mistakes: ["Pulling to neck", "Elbows staying low"],
        tip: "This is your ultimate insurance policy for shoulder health and builds the 3D rear delt.",
        advanced: "High-rep finisher with zero rest.",
        beginner: "Keep weight very light."
      },
      {
        name: "Dumbbell Shrug", priority: "B", muscle: "Upper Trapezius (Neck/Back Thickness)",
        sets: 3, reps: "15", rest: "60s", startW: "50 lb DBs", w8: "70 lb DBs", w16: "90 lb DBs",
        form: [
          "Hold heavy dumbbells at your sides with vertical spinal posture.",
          "Elevate shoulders straight up towards your ears; do not roll or rotate them.",
          "Hold the top contraction for 1 full second."
        ],
        mistakes: ["Rolling shoulders in circles", "Jerking the weight"],
        tip: "Upper trap thickness is a cornerstone of a wide, imposing back.",
        advanced: "Week 9+: Behind-the-back barbell shrug.",
        beginner: "Focus on the 1-second squeeze at the top."
      },
      {
        name: "Incline Dumbbell Curl", priority: "A", muscle: "Biceps Long Head (Maximum Stretch)",
        sets: 3, reps: "10–12", rest: "90s", startW: "15 lb DBs", w8: "25 lb DBs", w16: "35 lb DBs",
        form: [
          "Bench at 45–60° incline. Sit back with arms hanging straight DOWN and BEHIND body.",
          "Curl up — elbows stay pinned BEHIND your torso throughout.",
          "3-sec eccentric all the way to full extension."
        ],
        mistakes: ["Elbows drifting forward", "Not reaching full extension at bottom"],
        tip: "Training a muscle in an extremely stretched position triggers superior stretch-mediated hypertrophy.",
        advanced: "Week 9+: Superset with standing Hammer Curls.",
        beginner: "Seated DB curl on a flat bench."
      },
      {
        name: "Dumbbell Hammer Curl", priority: "A", muscle: "Brachialis (Arm Frontal Thickness)",
        sets: 3, reps: "10–12", rest: "90s", startW: "20 lb DBs", w8: "35 lb DBs", w16: "45 lb DBs",
        form: [
          "Hold DBs with a NEUTRAL grip (palms facing each other).",
          "Elbows stay fixed at sides — only forearms move.",
          "Full extension at bottom. Squeeze at top."
        ],
        mistakes: ["Rotating wrist to supinate during movement", "Swinging body"],
        tip: "Growing the brachialis pushes your bicep upward, making your arm look much thicker from the front.",
        advanced: "Week 9+: Cross-body hammer curls.",
        beginner: "Seated alternating hammer curls."
      }
    ],
    cardio: { type: "Stationary Bike (Moderate)", duration: "15 min", intensity: "Level 6–8 / 75–80 RPM", timing: "Post-lifting only", why: "Concentric-only movement flushes lactic acid from the core and legs without adding spinal compression." },
    cooldown: ["Lat hang stretch 2 × 30 sec", "Child's pose 60 sec", "Upper back foam roll 2 min"],
  },
  {
    key: "WED", label: "Cardio + Core", sub: "Fat Burn · Active Recovery · Core Optimization",
    color: T.amber, emoji: "🔥", sessionTime: "45–55 min", fatigueScore: 38,
    overview: "No heavy lifting. This session maximizes fat burning through sustained Zone 2 cardio while strengthening the complete abdominal wall across all functional planes.",
    warmup: ["5-min slow treadmill walk", "Hip circles 10 each direction", "Bird-Dogs 3×10"],
    exercises: [
      {
        name: "Incline Treadmill Walk (Zone 2)", priority: "A+", muscle: "Full-Body Fat Burn",
        sets: 1, reps: "35–40 min", rest: "—", startW: "3.2 mph / 10% incline", w8: "3.5 mph / 12%", w16: "3.8 mph / 15%",
        form: [
          "You should be able to hold a sentence but feel your heart working.",
          "Do NOT hold the handrails — reduces calorie burn by 20–30%.",
          "Head up, shoulders back."
        ],
        mistakes: ["Holding rails at steep incline", "Going too fast into an anaerobic zone"],
        tip: "Zone 2 cardio burns the highest PERCENTAGE of calories from fat vs any higher intensity.",
        advanced: "Week 9+: Add 10–15 lb weighted vest.",
        beginner: "Start at 6% incline."
      },
      {
        name: "Ab Wheel Rollout", priority: "A★", muscle: "Anti-Extension Core Strength",
        sets: 3, reps: "8–10", rest: "60s", startW: "From knees", w8: "12 reps", w16: "Standing partials",
        form: [
          "Kneel on floor. Core braced.",
          "Roll forward SLOWLY. Lower back must NEVER sag.",
          "Pull back by CURLING your torso, bringing abs to hips."
        ],
        mistakes: ["Lower back collapses", "Moving too fast"],
        tip: "This protects your spine from structural shear forces under heavy compound lifting.",
        advanced: "Full standing rollouts.",
        beginner: "Roll against a wall to limit range."
      },
      {
        name: "Plank Hold", priority: "A", muscle: "Isometric Global Stabilization",
        sets: 3, reps: "45–60 sec", rest: "60s", startW: "Bodyweight", w8: "75s", w16: "90s + 25lb plate",
        form: [
          "Elbows directly under shoulders. Perfectly straight line.",
          "Squeeze glutes AND abs SIMULTANEOUSLY."
        ],
        mistakes: ["Hips sagging", "Hips piking up"],
        tip: "Actively pull your elbows toward your toes to spike absolute isometric tension.",
        advanced: "Week 9+: Add a 25lb plate on your back.",
        beginner: "Knees on ground."
      },
      {
        name: "Cable Crunch", priority: "A", muscle: "Rectus Abdominis (Weighted Hypertrophy)",
        sets: 3, reps: "15–20", rest: "60s", startW: "35 lb", w8: "50 lb", w16: "70 lb",
        form: [
          "Kneel facing cable machine. Hold rope at sides of head.",
          "Crunch DOWN and forward — round your back.",
          "Hips stay locked; do not sit backward onto heels."
        ],
        mistakes: ["Pulling with arms", "Hinging at hips instead of crunching"],
        tip: "Cable crunches are weighted ab work — the ONLY way to make abs grow physically thicker.",
        advanced: "Week 9+: Add slow 3-sec eccentric.",
        beginner: "Floor crunches."
      },
      {
        name: "Bicycle Crunch", priority: "B", muscle: "Obliques, Rotational Core",
        sets: 3, reps: "20 each side", rest: "45s", startW: "Bodyweight", w8: "25 slow reps", w16: "30 reps",
        form: [
          "Rotate torso slowly to link opposite elbow to opposite knee.",
          "Fully extend the straight leg every single rep.",
          "Twist completely to feel the oblique fully contract."
        ],
        mistakes: ["Rushing", "Pulling neck forward"],
        tip: "Speed minimizes muscle work; execute sequences slow and steady. Hold the twist for 1 sec.",
        advanced: "Week 9+: Weighted Russian Twists.",
        beginner: "Partial extension crunches."
      },
      {
        name: "Dead Bug", priority: "B", muscle: "Deep Transverse Abdominis, Lumbo-Pelvic Control",
        sets: 3, reps: "12 each side", rest: "45s", startW: "Bodyweight", w8: "4-sec tempo", w16: "With light DBs",
        form: [
          "Lie on back. Arms straight up. Knees to 90°.",
          "Press lower back INTO the floor — stays in contact ENTIRE set.",
          "Slowly lower opposite arm and leg toward floor."
        ],
        mistakes: ["Lower back arching off floor", "Moving too fast"],
        tip: "The entire utility is anchored on keeping your lower back pressed to the ground.",
        advanced: "Week 9+: Add resistance band to legs.",
        beginner: "Drop only the heel down."
      }
    ],
    cardio: { type: "Outdoor Walk (Step Goal)", duration: "10,000 steps daily", intensity: "Brisk pace", timing: "Lunch break", why: "Wednesday = maximum fat-burning day. Incline walk + daily steps = huge caloric deficit with zero muscle loss." },
    cooldown: ["Cobra pose 60s", "Seated hamstring stretch 30s each"],
  },
  {
    key: "THU", label: "Lower Body Matrix", sub: "Quads · Hamstrings · Glutes · Calves",
    color: T.purple, emoji: "🦵", sessionTime: "70–80 min", fatigueScore: 92,
    overview: "Training legs releases massive amounts of testosterone and growth hormone, accelerating fat loss across your entire body. High mechanical tension combined with high stability.",
    warmup: ["Leg Swings 15 each", "BW Deep Squats 2×15", "Glute Bridges 2×15"],
    exercises: [
      {
        name: "Barbell Back Squat", priority: "A+", muscle: "Quadriceps, Glutes, Core",
        sets: 3, reps: "6–8", rest: "3 min", startW: "95 lb", w8: "145 lb", w16: "195 lb",
        form: [
          "High bar on upper traps. Feet shoulder-width. Toes out 15–30°.",
          "Brace core. Hinge hips and knees simultaneously.",
          "Descend until thighs are parallel or BELOW.",
          "Drive knees OUT over toes throughout."
        ],
        mistakes: ["Knees caving inward (valgus collapse)", "Heels rising off floor"],
        tip: "Squats produce the largest anabolic hormone response. More testosterone = faster fat loss.",
        advanced: "Week 9+: 2-sec pause at bottom.",
        beginner: "Goblet squat."
      },
      {
        name: "Romanian Deadlift (RDL)", priority: "A", muscle: "Hamstrings, Glutes",
        sets: 3, reps: "8–10", rest: "2 min", startW: "75 lb", w8: "115 lb", w16: "155 lb",
        form: [
          "Stand, bar at hip level. Slight knee bend — constant throughout.",
          "Hinge at hips — push them BACK. Lower back stays flat.",
          "Bar drags down thighs. Feel hamstrings load like a rubber band."
        ],
        mistakes: ["Rounding lower back", "Bending knees too much"],
        tip: "The hamstring stretch in RDL is where the muscle grows. Control the descent entirely.",
        advanced: "Week 9+: Single-leg RDL with DBs.",
        beginner: "DB Romanian deadlift."
      },
      {
        name: "Barbell Hip Thrust", priority: "A", muscle: "Gluteus Maximus (Peak Contraction)",
        sets: 3, reps: "10–12", rest: "2 min", startW: "95 lb", w8: "155 lb", w16: "225 lb",
        form: [
          "Upper back on bench, barbell padded across pelvis.",
          "Drive heels down, forcing hips up horizontally.",
          "Lock out parallel with a hard glute squeeze."
        ],
        mistakes: ["Hyperextending lower back at top", "Pushing from toes"],
        tip: "Strong glutes visually narrow the waist and create a V-taper appearance.",
        advanced: "Week 9+: 2-second hold at peak extension.",
        beginner: "Unweighted glute bridges."
      },
      {
        name: "Leg Press (Machine)", priority: "B", muscle: "Quadriceps, Glutes",
        sets: 3, reps: "10–12", rest: "90s", startW: "180 lb", w8: "270 lb", w16: "360 lb",
        form: [
          "Feet shoulder-width on platform.",
          "Lower until knees reach 90°. Push through MID-FOOT and heels.",
          "Do NOT fully lock knees at extension."
        ],
        mistakes: ["Lower back peeling off pad", "Short range of motion"],
        tip: "High stability allows you to drive your quads to absolute failure safely.",
        advanced: "Week 9+: 4-sec eccentric press.",
        beginner: "Machine stability makes this beginner-friendly."
      },
      {
        name: "Lying or Seated Leg Curl", priority: "B", muscle: "Hamstrings (Knee Flexion)",
        sets: 3, reps: "12–15", rest: "60s", startW: "50 lb", w8: "75 lb", w16: "105 lb",
        form: [
          "Align knee hinges with machine pivot.",
          "Curl legs all the way up — heels toward glutes.",
          "Lower SLOWLY — 3-second eccentric."
        ],
        mistakes: ["Hips rising off pad", "Fast uncontrolled eccentric"],
        tip: "RDL trains the hamstring stretch; this isolates the knee flexion function for complete development.",
        advanced: "Week 9+: Single-leg curl.",
        beginner: "Full range, light weight."
      },
      {
        name: "Leg Extension", priority: "B", muscle: "Quadriceps Isolation",
        sets: 3, reps: "12–15", rest: "60s", startW: "40 lb", w8: "65 lb", w16: "95 lb",
        form: [
          "Extend legs upward smoothly to horizontal extension.",
          "Control descent path deliberately."
        ],
        mistakes: ["Snapping weight explosively", "Lifting hips out of seat"],
        tip: "Directly isolates the quad for complete leg development and knee joint health.",
        advanced: "Week 9+: Partial reps at the end of final set.",
        beginner: "Execute slowly to establish joint confidence."
      },
      {
        name: "Seated Calf Raise", priority: "C", muscle: "Gastrocnemius, Soleus",
        sets: 3, reps: "15–20", rest: "60s", startW: "30 lb", w8: "60 lb", w16: "90 lb",
        form: [
          "Full range — all the way up, all the way below parallel.",
          "Pause 2 sec at full stretch at bottom to kill momentum.",
          "Squeeze 1 sec at top."
        ],
        mistakes: ["Bouncing rapidly", "Partial range"],
        tip: "Calves respond to time under tension, not just heavy weight.",
        advanced: "Week 9+: Add standing calf raises.",
        beginner: "Bodyweight on a step."
      }
    ],
    cardio: { type: "None (Recovery Focus)", duration: "0 min", intensity: "Rest", timing: "None", why: "Leg day is the highest systemic load of the week. Recovery is the priority here over extra cardio." },
    cooldown: ["Standing quad stretch 45s", "Seated hamstring reach 60s"],
  },
  {
    key: "FRI", label: "Upper Conditioning + HIIT", sub: "Chest Isolation · Arm Touch-Ups · Sprints",
    color: T.red, emoji: "⚡", sessionTime: "60–70 min", fatigueScore: 70,
    overview: "Finishing isolation work to round out weekly arm/chest/delt volume, paired with intense interval sprints to trigger a massive 24-hour fat-burning afterburn.",
    warmup: ["Scapular Push-Ups 2×12", "Dynamic Chest Openers 15 reps", "Light Jog 3 min"],
    exercises: [
      {
        name: "Cable Chest Fly", priority: "A", muscle: "Sternal Pectoralis Major",
        sets: 3, reps: "12–15", rest: "90s", startW: "15 lb/side", w8: "25 lb/side", w16: "35 lb/side",
        form: [
          "Set pulleys to shoulder height. Staggered stance.",
          "Bring hands together in a wide arc.",
          "Squeeze chest at center touch."
        ],
        mistakes: ["Pressing weights instead of flying", "Bending elbows excessively"],
        tip: "Visualize wrapping your arms around a massive tree trunk.",
        advanced: "Week 9+: 2-second hold at midline.",
        beginner: "Pec Deck machine."
      },
      {
        name: "Reverse Cable Fly", priority: "A", muscle: "Posterior Deltoid",
        sets: 3, reps: "15", rest: "60s", startW: "10 lb/side", w8: "15 lb/side", w16: "20 lb/side",
        form: [
          "Cross cables without handles. Grip raw wire lines.",
          "Pull arms straight out horizontally backward.",
          "Control the return path."
        ],
        mistakes: ["Using triceps to extend elbows", "Shrugging up with traps"],
        tip: "Keep a static minor bend inside the elbow joints throughout.",
        advanced: "Week 9+: Bent-over dumbbell flyes.",
        beginner: "Reverse fly machine."
      },
      {
        name: "Overhead Tricep Extension", priority: "B", muscle: "Triceps Long Head",
        sets: 3, reps: "12–15", rest: "60s", startW: "20 lb", w8: "35 lb", w16: "50 lb",
        form: [
          "Grip cable rope or single DB overhead.",
          "Lower load behind skull, getting a deep stretch.",
          "Press back to full lockout."
        ],
        mistakes: ["Elbows flaring horizontally", "Truncated range"],
        tip: "Direct arm isolation on Friday ensures complete weekly volume and prevents arms from lagging.",
        advanced: "Week 9+: Single-arm unilateral cable extension.",
        beginner: "Light DB to lock in elbow safety."
      },
      {
        name: "EZ Bar or Dumbbell Curl", priority: "B", muscle: "Biceps Brachii",
        sets: 3, reps: "10–12", rest: "60s", startW: "35 lb", w8: "55 lb", w16: "75 lb",
        form: [
          "Stand tall. Underhand grip.",
          "Keep elbows pinned to flanks; curl smoothly.",
          "Squeeze biceps hard at top."
        ],
        mistakes: ["Swinging hips", "Letting elbows drift forward"],
        tip: "Contract triceps consciously at the base of each rep to ensure a full bicep stretch.",
        advanced: "Week 9+: Mechanical drop set.",
        beginner: "Alternating DB curls."
      }
    ],
    cardio: { type: "HIIT Treadmill Sprints", duration: "15 min (8 Rounds)", intensity: "30s Max Sprint / 60s Walk", timing: "Post-lifting only", why: "HIIT at the END of lifting triggers EPOC (18-24hr afterburn) without draining glycogen needed for strength work." },
    cooldown: ["Cross-body shoulder stretch 45s", "Doorway chest stretch 30s"],
  },
  {
    key: "SAT", label: "Active Recovery", sub: "Mobility Flow · Blood Clearance",
    color: T.teal, emoji: "🧘", sessionTime: "30–45 min", fatigueScore: 20,
    overview: "Light non-fatiguing movement to improve range of motion, clear metabolic waste, and down-regulate the nervous system.",
    warmup: ["10-min light structural walk"],
    exercises: [
      {
        name: "Dynamic Mobility & Yoga Flow", priority: "A", muscle: "Full-Body Mobility",
        sets: 1, reps: "25 min continuous", rest: "—", startW: "Unweighted", w8: "Advanced positions", w16: "Sustainable baseline",
        form: [
          "Cycle smoothly through Child's Pose, Cobra, Downward Dog, and World's Greatest Stretch.",
          "Maintain deep nasal box breathing."
        ],
        mistakes: ["Forcing painful ranges", "Holding breath"],
        tip: "Shifts your body into a parasympathetic (rest-and-digest) state to maximize muscle repair.",
        advanced: "Week 9+: Deepen holding phases.",
        beginner: "Use yoga blocks to modify."
      },
      {
        name: "Optional Outdoor Walk", priority: "B", muscle: "Cardiovascular Clearing",
        sets: 1, reps: "20–30 min", rest: "—", startW: "2.0 mph", w8: "2.5 mph", w16: "2.5 mph",
        form: [
          "Relaxed, natural walking stride outdoors.",
          "Focus on clean posture."
        ],
        mistakes: ["Accelerating into a taxing aerobic pace"],
        tip: "Morning sunlight resets circadian rhythm, boosting Vitamin D and sleep quality.",
        advanced: "Week 9+: Add a light weighted vest.",
        beginner: "15-minute loop."
      }
    ],
    cardio: { type: "Outdoor Recovery Walk", duration: "20–30 min", intensity: "Conversational", timing: "Morning preferred", why: "Low-intensity movement promotes baseline systemic blood circulation, accelerating muscle tissue repair." },
    cooldown: ["Full-Body Static Stretching Sequence — 15 min"]
  },
  {
    key: "SUN", label: "Rest + Prep", sub: "Systemic Decompression · Nutritional Prep",
    color: T.textDim, emoji: "🍳", sessionTime: "0 min", fatigueScore: 0,
    overview: "Absolute physical rest. Muscle grows during recovery, not in the gym. Dedicate this time to nutritional logistics.",
    warmup: [],
    exercises: [
      {
        name: "Logistical Weekly Meal Prep", priority: "A+", muscle: "Nutritional Consistency",
        sets: 1, reps: "90 min", rest: "—", startW: "Kitchen", w8: "Optimized workflow", w16: "Automated habit",
        form: [
          "Batch-cook 1.0–1.2 kg of chicken/beef/tofu.",
          "Hard-boil 12 eggs; store unpeeled in fridge.",
          "Prepare a large batch of complex carbs (rice, lentils, quinoa).",
          "Portion snacks into travel-ready containers."
        ],
        mistakes: ["Omitting meal prep, inviting compliance breakdowns mid-week"],
        tip: "Consistency across the business week is secured or lost during this logistical preparation phase.",
        advanced: "Week 9+: Diversify spice profiles.",
        beginner: "Nail chicken, rice, and egg foundations first."
      }
    ],
    cardio: { type: "Passive Recovery", duration: "0 min", intensity: "Rest", timing: "All day", why: "Total rest lets the CNS recover, ensuring maximum power for Monday." },
    cooldown: ["Organize daily training logs", "Prioritize an 8-hour sleep window"]
  }
];

/* ─────────────────────────────────────────────────────────────
   NUTRITION DATA — 6 OPTIONS PER SLOT (MASSIVE EXPANSION)
   ───────────────────────────────────────────────────────────── */
const MEALS = [
  { id: "breakfast", label: "Breakfast", time: "5:30–6:30 AM", icon: "☀️", color: T.amber, note: "Your 2 daily chais with 2% milk are fully accounted for in these daily totals.", options: [
    { name: "Masala Scrambled Eggs + Jasmine Rice", tag: "🇵🇰 Desi Classic", cal: 390, pro: 24, time: "12 min", diff: "Easy", desc: "Spiced desi scrambled eggs over leftover jasmine rice.", ing: ["3 large eggs", "¾ cup cooked jasmine rice", "½ onion", "1 tomato", "1 green chili", "1 tsp oil"], steps: [{s:"Sauté",d:"Oil, cumin, onion, chili, tomato until soft."},{s:"Eggs",d:"Add eggs. Scramble on low heat until just set."}], notes: "Prep rice the night before from dinner leftovers.", swap: "No rice → 2 rice cakes or eggs alone." },
    { name: "Smoked Salmon + Egg Scramble", tag: "🐟 Omega Focus", cal: 355, pro: 38, time: "10 min", diff: "Easy", desc: "Smoked salmon is pre-cooked. 38g protein.", ing: ["2 eggs + 2 egg whites", "80g smoked salmon", "¾ cup jasmine rice", "1 tsp butter"], steps: [{s:"Scramble",d:"Whisk eggs and whites. Cook gently in butter."},{s:"Fold",d:"Fold in smoked salmon strips off heat."}], notes: "Smoked salmon vacuum packs last weeks unopened.", swap: "Canned tuna drained + lemon." },
    { name: "Greek Yogurt Power Bowl", tag: "🌍 Express", cal: 310, pro: 24, time: "3 min", diff: "Zero", desc: "Zero cooking. Highest protein-per-minute ratio.", ing: ["1 cup plain Greek yogurt", "1 banana", "20 almonds", "Honey"], steps: [{s:"Combine",d:"Layer yogurt, fruit, nuts, honey. Eat."}], notes: "PLAIN Greek yogurt only — flavored versions hide sugar.", swap: "Berries instead of banana." },
    { name: "Moong Dal Chilla (Lentil Pancakes)", tag: "🌱 Plant Base", cal: 320, pro: 22, time: "15 min", diff: "Med", desc: "Savory high-protein pancakes.", ing: ["1/2 cup moong dal batter", "50g low-fat paneer", "Spinach", "Spices"], steps: [{s:"Cook",d:"Pour batter on skillet. Flip."},{s:"Fill",d:"Stuff with paneer and spinach."}], notes: "Soak dal overnight for easy blending.", swap: "Besan (chickpea flour) instead of dal." },
    { name: "High-Protein Overnight Oats", tag: "🥣 Prep", cal: 340, pro: 32, time: "5 min", diff: "Zero", desc: "Prep night before. Grab and go.", ing: ["½ cup rolled oats", "1 scoop whey protein", "½ cup almond milk", "1 tbsp chia seeds"], steps: [{s:"Mix",d:"Combine in jar. Refrigerate overnight."}], notes: "Eat cold.", swap: "Greek yogurt instead of whey." },
    { name: "Desi Omelet + Ezekiel Toast", tag: "🍞 Fiber", cal: 290, pro: 26, time: "10 min", diff: "Easy", desc: "High fiber sprouted bread with egg whites.", ing: ["1 whole egg + 4 whites", "Onions, cilantro, spices", "2 slices Ezekiel/sprouted bread"], steps: [{s:"Omelet",d:"Whisk and fry."},{s:"Toast",d:"Toast bread, serve together."}], notes: "Sprouted bread has superior macros.", swap: "Whole wheat roti." }
  ]},
  { id: "lunch", label: "Lunch", time: "12:00–1:00 PM", icon: "🍱", color: T.green, note: "Pack from Sunday prep. High protein, rice-based. Reheats in 90 sec at work.", options: [
    { name: "Chicken Karahi (Batch)", tag: "🇵🇰 Batch Prep", cal: 460, pro: 48, time: "30 min batch", diff: "Easy", desc: "Cook Sunday. Eat Mon–Wed lunch.", ing: ["200g chicken thighs", "Tomatoes + Onion", "Cumin + Coriander + Chili", "¾ cup basmati"], steps: [{s:"Sear",d:"Brown chicken."},{s:"Bhunna",d:"Cook tomatoes & spices until oil separates."}], notes: "Thighs reheat much better than breasts.", swap: "Beef or paneer." },
    { name: "Teriyaki Salmon Bowl", tag: "🇯🇵 Japanese", cal: 520, pro: 46, time: "20 min", diff: "Easy", desc: "Teriyaki glaze takes 2 minutes.", ing: ["170g salmon fillet", "1 cup jasmine rice", "Soy sauce + Honey + Sesame"], steps: [{s:"Sear",d:"Skin down 4 min, flip 2 min."},{s:"Glaze",d:"Pour soy/honey mix, bubble 30s."}], notes: "Reheat MAX 60 sec in microwave.", swap: "Chicken or shrimp." },
    { name: "Keema Matar (Lean Beef)", tag: "🥩 Iron/Creatine", cal: 480, pro: 42, time: "25 min", diff: "Med", desc: "93% lean ground beef. Natural creatine.", ing: ["170g 93% lean beef", "½ cup peas", "Spices", "¾ cup basmati rice"], steps: [{s:"Brown",d:"Brown beef."},{s:"Simmer",d:"Add peas and spices, cook through."}], notes: "Drain excess fat if using 80/20.", swap: "Ground chicken." },
    { name: "Tandoori Chicken Wrap", tag: "🌯 Portable", cal: 380, pro: 45, time: "10 min", diff: "Easy", desc: "Low carb wrap, very high protein.", ing: ["150g grilled tandoori chicken", "1 low-carb wrap", "Mint yogurt", "Greens"], steps: [{s:"Assemble",d:"Layer ingredients in wrap and roll tight."}], notes: "Keep yogurt separate until eating.", swap: "Tuna." },
    { name: "Chickpea & Grilled Chicken Salad", tag: "🥗 Volume", cal: 410, pro: 43, time: "10 min", diff: "Easy", desc: "Massive volume, very filling.", ing: ["150g chicken breast", "½ cup boiled chana", "Cucumber/Tomato", "Lemon-olive oil"], steps: [{s:"Chop & Toss",d:"Mix everything in a large bowl."}], notes: "Great for days you feel very hungry.", swap: "Grilled Halloumi instead of chicken." },
    { name: "Haleem (High-Protein Stew)", tag: "🍲 Comfort", cal: 430, pro: 38, time: "Batch", diff: "Med", desc: "Lentil/meat stew batch cooked.", ing: ["1.5 cups homemade chicken/beef haleem", "Ginger", "Lemon"], steps: [{s:"Reheat",d:"Microwave 2 mins."},{s:"Garnish",d:"Top with fresh ginger and lemon."}], notes: "Extremely satiating due to viscous fiber.", swap: "Chicken corn soup." }
  ]},
  { id: "snack", label: "Snack", time: "3:30–4:00 PM", icon: "☕", color: T.amber, note: "Your second daily chai. Pair with protein to bridge the gap to dinner.", options: [
    { name: "Chai + Eggs + Roasted Chana", tag: "🇵🇰 Performance Fuel", cal: 285, pro: 22, time: "0 min", diff: "Zero", desc: "Existing afternoon habit optimized.", ing: ["2 boiled eggs", "30g roasted chana", "1 cup chai (½ cup 2% milk)"], steps: [{s:"Eat",d:"Peel pre-boiled eggs at desk. Snack on chana."}], notes: "Keep chana in desk drawer.", swap: "Almonds instead of chana." },
    { name: "Protein Shake + Almonds", tag: "⚡ Quick", cal: 265, pro: 30, time: "1 min", diff: "Zero", desc: "Fastest protein hit between meetings.", ing: ["1 scoop whey protein", "Water or milk", "15 almonds"], steps: [{s:"Shake",d:"Shake protein, eat nuts."}], notes: "Whey + water = faster absorption.", swap: "3 boiled eggs." },
    { name: "Greek Yogurt Tzatziki + Cucumber", tag: "🥒 Fresh", cal: 120, pro: 17, time: "3 min", diff: "Easy", desc: "Very low calorie, high protein dip.", ing: ["¾ cup plain Greek yogurt", "Cucumber slices", "Garlic, mint, salt"], steps: [{s:"Mix",d:"Stir spices into yogurt. Dip cucumber."}], notes: "Highly hydrating.", swap: "Carrot sticks." },
    { name: "Edamame Pods", tag: "🌱 Plant Pro", cal: 188, pro: 17, time: "2 min", diff: "Zero", desc: "Complete plant protein.", ing: ["1 cup steamed edamame", "Sea salt"], steps: [{s:"Microwave",d:"Steam in bag for 2 mins."}], notes: "Keep frozen bags at work.", swap: "Roasted makhana." },
    { name: "Cottage Cheese & Pineapple", tag: "🍍 Sweet/Savory", cal: 110, pro: 14, time: "1 min", diff: "Zero", desc: "Casein protein and digestive enzymes.", ing: ["½ cup low-fat cottage cheese", "¼ cup fresh pineapple"], steps: [{s:"Mix",d:"Combine in a bowl."}], notes: "Pineapple contains bromelain, aids protein digestion.", swap: "Peaches." },
    { name: "Beef Biltong / Jerky", tag: "🥩 On-the-Go", cal: 140, pro: 22, time: "0 min", diff: "Zero", desc: "Pure protein, zero prep.", ing: ["40g high-quality beef jerky"], steps: [{s:"Eat",d:"Open bag."}], notes: "Check labels to ensure <5g added sugar.", swap: "Protein bar." }
  ]},
  { id: "dinner", label: "Dinner", time: "6:30–7:30 PM", icon: "🍽️", color: T.red, note: "Eat within 60 min of finishing training. Eat vegetables at every dinner.", options: [
    { name: "Honey Garlic Salmon + Rice + Broccoli", tag: "🌍 Post-Workout", cal: 570, pro: 48, time: "22 min", diff: "Easy", desc: "Restaurant quality in 22 minutes post-workout.", ing: ["200g salmon", "1 cup jasmine rice", "Soy + Honey + Garlic + Butter", "2 cups broccoli"], steps: [{s:"Sear",d:"Sear salmon 4 min skin side, 2 min flesh side."},{s:"Glaze",d:"Add sauce, baste salmon."}], notes: "Skin-on salmon is cheaper and healthy.", swap: "Chicken breast (7 min/side)." },
    { name: "Prawn Masala + Basmati", tag: "🇵🇰 Savory High-Pro", cal: 490, pro: 45, time: "25 min", diff: "Medium", desc: "Classic Pakistani jhinga masala.", ing: ["250g shrimp", "1 cup basmati", "Onion + Tomato", "Spices"], steps: [{s:"Bhunna",d:"Cook masala until oil separates completely."},{s:"Shrimp",d:"Add shrimp 2 min per side."}], notes: "Never rush the oil separation step.", swap: "Chicken, beef, or paneer." },
    { name: "Chicken Tikka Skewers + Quinoa", tag: "🍢 Grilled", cal: 510, pro: 54, time: "20 min", diff: "Med", desc: "Massive protein hit. Lean and spiced.", ing: ["200g chicken breast", "Tikka spices + Yogurt", "¾ cup quinoa", "Side salad"], steps: [{s:"Grill",d:"Air fry or grill skewers."},{s:"Serve",d:"Serve over quinoa with salad."}], notes: "Marinate chicken overnight.", swap: "Tofu skewers." },
    { name: "Paneer Bhurji + 1 Roti", tag: "🧀 Veg Comfort", cal: 440, pro: 30, time: "15 min", diff: "Easy", desc: "Scrambled paneer. Rich in calcium and protein.", ing: ["150g low-fat paneer", "Bell peppers, onions", "1 whole wheat roti (120 cal)"], steps: [{s:"Scramble",d:"Crumble paneer and sauté with veggies and spices."}], notes: "Use low-fat paneer to hit calorie targets.", swap: "Egg bhurji." },
    { name: "Lean Beef Seekh Kebabs", tag: "🥩 Iron Rich", cal: 460, pro: 42, time: "25 min", diff: "Med", desc: "Baked lean kebabs with roasted veg.", ing: ["2 baked lean beef kebabs (93% lean)", "Mint chutney", "1 cup roasted cauliflower/zucchini"], steps: [{s:"Bake",d:"Bake kebabs at 400F for 15-20 mins."}], notes: "Form kebabs on Sunday.", swap: "Chicken kebabs." },
    { name: "Lemon Herb Baked Cod", tag: "🐟 Ultra Lean", cal: 390, pro: 48, time: "30 min", diff: "Easy", desc: "Lowest calorie, highest protein option.", ing: ["250g white fish (cod/tilapia)", "200g roasted sweet potatoes", "Asparagus"], steps: [{s:"Bake",d:"Bake everything on one sheet pan at 400F for 15-20 mins."}], notes: "One pan = easy cleanup.", swap: "Shrimp." }
  ]},
  { id: "closing", label: "Closing Window", time: "8:30–9:00 PM", icon: "🌙", color: T.blue, note: "Light, slow-digesting protein. Eating window CLOSES here.", options: [
    { name: "Dahi + Walnuts", tag: "🇵🇰 Overnight Recovery", cal: 210, pro: 12, time: "1 min", diff: "Zero", desc: "Classic closer. Casein protein digests slowly overnight.", ing: ["1 cup plain dahi", "15–20 walnuts", "Cinnamon"], steps: [{s:"Combine",d:"Dahi in bowl. Nuts on top. Eat slowly."}], notes: "Nothing after 9:30 PM.", swap: "2 boiled eggs." },
    { name: "Cottage Cheese & Almonds", tag: "🥛 Casein Source", cal: 220, pro: 25, time: "1 min", diff: "Zero", desc: "Absolute best pre-bed muscle food.", ing: ["3/4 cup cottage cheese", "10 almonds"], steps: [{s:"Mix",d:"Combine and eat."}], notes: "Feeds muscles for 6+ hours while sleeping.", swap: "Greek yogurt." },
    { name: "Casein Protein Pudding", tag: "🍮 Dessert", cal: 120, pro: 24, time: "2 min", diff: "Zero", desc: "Kills sweet tooth, pure protein.", ing: ["1 scoop casein protein powder", "Almond milk (splash)"], steps: [{s:"Mix",d:"Stir with just enough milk to make a thick pudding."}], notes: "Must be casein, whey won't thicken.", swap: "Dahi + cocoa powder." },
    { name: "Haldi Doodh (Turmeric Milk)", tag: "🌙 Sleep Aid", cal: 180, pro: 20, time: "5 min", diff: "Easy", desc: "Anti-inflammatory and promotes deep sleep.", ing: ["1 cup warm 2% milk", "Turmeric, black pepper", "½ scoop unflavored whey/casein"], steps: [{s:"Warm",d:"Warm milk, whisk in spices and protein."}], notes: "Black pepper is required to absorb turmeric.", swap: "Chamomile tea (if out of calories)." }
  ]},
];

interface Supplement {
  name: string;
  tier: string;
  tc: string;
  timing: string;
  dose: string;
  why: string;
  brand: string;
}

interface RuleGroups {
  training: string[];
  nutrition: string[];
  lifestyle: string[];
}

interface FAQItem {
  q: string;
  a: string;
}

const SUPPS: Supplement[] = [
  { name: "Whey Protein Isolate", tier: "Essential", tc: T.red, timing: "Within 60 min post-workout", dose: "1 scoop (25g protein)", why: "Fastest absorbing protein. Hits muscles during critical recovery window.", brand: "Optimum Nutrition Gold Standard." },
  { name: "Creatine Monohydrate", tier: "Essential", tc: T.red, timing: "Daily, any consistent time", dose: "5g daily", why: "Most researched supplement. Proven 5–15% strength increase.", brand: "Pure monohydrate, unflavored, micronized." },
  { name: "Omega-3 Fish Oil", tier: "High Priority", tc: T.amber, timing: "With any whole meal", dose: "2 caps daily", why: "Reduces exercise-induced inflammation, supports joint health.", brand: "Enteric-coated prevents fish burps." },
  { name: "Vitamin D3 + Zinc", tier: "High Priority", tc: T.amber, timing: "With dinner tracking", dose: "5000 IU / 15mg", why: "Critical for optimization, bone architecture and metabolic support.", brand: "Combined highly bioavailable formulas." },
];

const RULES: RuleGroups = {
  training: ["Never skip Tuesday Pull Day — builds the V-taper", "Progressive overload every session", "Log every lift in Notes app", "Form first, weight second — always", "Warm-up is not optional — 8 min prevents months of setback", "Face pulls at end of EVERY session", "Never train same muscle 2 consecutive days", "Deload every 8 weeks (−20% load)", "Last 2 reps of every set should be genuinely difficult", "Sleep is when muscle is built", "Cardio enhances fat loss but never replaces lifting", "Rest days are growth days"],
  nutrition: ["Hit 185g+ protein daily — non-negotiable", "Close eating window by 9:30 PM every night", "Drink 3–4L water daily", "Meal prep Sunday — 90 min prevents 5 days of poor decisions", "Rice portions: ¾–1 cup cooked at lunch, ¾ cup at dinner", "Your 2 daily chais with 2% milk are fully built in", "Eat vegetables at every dinner", "Healthy fat ≠ body fat. Eat avocado, walnuts, olive oil", "Never go more than 5 hours without protein", "Roti is fine occasionally — 1 roti = ~120 cal", "One social meal per week is completely fine"],
  lifestyle: ["7–8 hours sleep = GH peaks and fat burns", "10,000 steps daily. Burns 350–400 extra calories", "Chronic stress → high cortisol → belly fat", "Progress photos every 2 weeks", "Measure waist with tape weekly", "Scale fluctuates 2–5 lbs daily. Weigh weekly", "Morning sunlight within 30 min of waking", "Vitamin D from sunlight poorly synthesized in South Asian skin", "Alcohol impairs recovery. Limit to rare occasions", "Timeline: 2–3\" off waist by week 8. Dramatic by week 16–20"],
};

const FAQS: FAQItem[] = [
  { q: "Why am I not losing weight on the scale?", a: "Body weight fluctuates 2–5 lbs daily from water, sodium, digestion. Measure weekly — same day, same time. More importantly: measure your waist with a tape. You may be building muscle AND losing fat simultaneously." },
  { q: "My chest fat isn't moving — why?", a: "Chest and belly fat are the last to go for most men. Solution: consistent caloric deficit + building chest muscle underneath. By month 3–4 the visual change is dramatic." },
  { q: "Can I eat roti or paratha?", a: "Absolutely. 1 roti = ~120 cal, 4g protein. 1 paratha = 200–250 cal. On roti days, reduce rice at that meal. Once-a-week paratha is completely compatible." },
  { q: "What if I miss a workout?", a: "Continue from the next scheduled session. Do NOT double up. One missed session costs almost nothing over a 16-week plan." },
  { q: "How wide will my back get?", a: "Visible lat development begins week 6–8. By week 16 with proper progressive overload, the V-taper is unmistakable." },
  { q: "Is Pakistani food compatible with this plan?", a: "Exceptionally compatible. Daal, eggs, chicken karahi, dahi, desi vegetables — outstanding. Issues: too much oil (halve it), too many rotis (reduce), sugar in chai (reduce)." },
];

/* ─────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
   ───────────────────────────────────────────────────────────── */
const GlassCard = ({ 
  children, elevated = false, className = "", style = {},
  // ...rest 
}: GlassCardProps) => (
  <div
    className={className}
    style={{
      background: elevated ? "rgba(255,255,255,0.88)" : T.surface,
      backdropFilter: elevated ? "blur(32px) saturate(200%)" : "blur(24px) saturate(180%)",
      WebkitBackdropFilter: elevated ? "blur(32px) saturate(200%)" : "blur(24px) saturate(180%)",
      border: elevated ? "1px solid rgba(255,255,255,0.7)" : `1px solid ${T.border}`,
      borderRadius: "20px",
      boxShadow: elevated
        ? "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 12px rgba(15,23,42,0.06), 0 24px 48px -24px rgba(15,23,42,0.18)"
        : "0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)",
      ...style,
    }}
    // {...rest}
  >
    {children}
  </div>
);

const SectionLabel = ({ text, color = T.textDim }: { text: string; color?: string }) => (
  <div className="font-mono text-[10px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color }}>
    {text}
  </div>
);

const TagPill = ({ text, color }: { text: string; color: string }) => (
  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide whitespace-nowrap" style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}>
    {text}
  </span>
);

const StatTile = ({ value, label, color }: { value: ReactNode; label: string; color?: string }) => (
  <GlassCard className="p-3.5 text-center">
    <div className="font-mono text-base font-bold leading-tight" style={{ color }}>{value}</div>
    <div className="font-mono text-[9px] font-semibold uppercase tracking-wider mt-1" style={{ color: T.textDim }}>{label}</div>
  </GlassCard>
);

const formatInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold" style={{ color: T.text }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic" style={{ color: T.textMuted }}>{part.slice(1, -1)}</em>;
    return part;
  });
};

const formatAIResponse = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-sm md:text-base font-bold mt-4 mb-2" style={{ color: T.text }}>{formatInline(line.replace('### ', ''))}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-base md:text-lg font-extrabold mt-5 mb-2.5" style={{ color: T.text }}>{formatInline(line.replace('## ', ''))}</h2>;
    const listMatch = line.match(/^(\d+\.|-|\*)\s+/);
    if (listMatch) {
      const bullet = listMatch[0];
      const content = line.slice(bullet.length);
      return (
        <div key={i} className="flex gap-2.5 mb-2 pl-1">
          <span className="font-bold min-w-[20px]" style={{ color: T.blue }}>{bullet.trim()}</span>
          <span className="leading-relaxed text-sm" style={{ color: T.textMuted }}>{formatInline(content)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-2.5" />;
    return <div key={i} className="mb-2 leading-relaxed text-sm" style={{ color: T.textMuted }}>{formatInline(line)}</div>;
  });
};

/* ─────────────────────────────────────────────────────────────
   FATIGUE SCORE & RADAR CHART
   ───────────────────────────────────────────────────────────── */
const FatigueScore = ({ score, color }: { score: number; color: string }) => {
  const label = score < 30 ? "Low" : score < 60 ? "Moderate" : score < 80 ? "High" : "Peak";
  const barColor = score < 30 ? T.green : score < 60 ? T.amber : score < 80 ? color : T.red;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textDim }}>Session Fatigue</span>
        <span className="font-mono text-xs font-bold" style={{ color: barColor }}>{score}/100 · {label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.18)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
        />
      </div>
    </div>
  );
};

const MuscleRadarChart = ({ day, distribution }: { day: { key: string; color: string }; distribution: { name: string; count: number }[] }) => {
  const axes = ["Back", "Shoulders", "Chest", "Arms", "Core", "Legs"];
  const dataMap = axes.map(axis => {
    const match = distribution.find(d => d.name.toLowerCase().includes(axis.toLowerCase()));
    return match ? match.count : 0;
  });
  const center = 50, radius = 34;
  const maxCount = Math.max(...dataMap, 4);
  const getPoint = (v: number, i: number) => {
    const r = (v / maxCount) * radius;
    const rad = (i * 60 - 90) * (Math.PI / 180);
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };
  const pathData = dataMap.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getPoint(v, i).x},${getPoint(v, i).y}`).join(' ') + ' Z';
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: "280px", display: "block", margin: "0 auto", overflow: "visible" }}>
      <defs>
        <linearGradient id={`polyGrad-${day.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={day.color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={day.color} stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((s, i) => (
        <circle key={s} cx={center} cy={center} r={radius * s} fill="none" stroke={T.border} strokeWidth="0.3" strokeDasharray={i === 3 ? "none" : "1 1"} />
      ))}
      {axes.map((_, i) => (
        <line key={i} x1={center} y1={center} x2={getPoint(maxCount, i).x} y2={getPoint(maxCount, i).y} stroke={T.border} strokeWidth="0.4" />
      ))}
      <path d={pathData} fill={`url(#polyGrad-${day.key})`} stroke={day.color} strokeWidth="1.3" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const pt = getPoint(maxCount * 1.3, i);
        const active = dataMap[i] > 0;
        return <text key={i} x={pt.x} y={pt.y} fontSize="4" fontWeight={active ? "700" : "500"} fill={active ? T.text : T.textDim} textAnchor="middle" dominantBaseline="middle">{a}</text>;
      })}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function FitnessDashboard() {
  const [tab, setTab] = useState("training");
  const [wDay, setWDay] = useState("MON");
const [exOpen, setExOpen] = useState<string | null>(null);

  const [mSlot, setMSlot] = useState("breakfast");
const [mOpen, setMOpen] = useState<string | null>(null);

  const [rTab, setRTab] = useState<keyof RuleGroups>("training");
  const [sOpen, setSOpen] = useState<number | null>(null);
const [fOpen, setFOpen] = useState<number | null>(null);

  // AI & Chat State
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("user_gemini_api_key");
  });
  const [aiWorkoutInput, setAiWorkoutInput] = useState("");
const [aiWorkoutResult, setAiWorkoutResult] = useState<string | null>(null);
  const [aiWorkoutLoading, setAiWorkoutLoading] = useState(false);
  
  const [aiMealInput, setAiMealInput] = useState("");
const [aiMealResults, setAiMealResults] = useState<Record<string, string>>({});
  const [aiMealLoading, setAiMealLoading] = useState<Record<string, boolean>>({});
  
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", text: "Salam! Ask me about workouts, Desi food swaps, form setup, or IF timing. Grounded in your 16-week plan." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

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

  const handleWorkoutAdj = async () => {
    if (!aiWorkoutInput.trim()) return;
    setAiWorkoutLoading(true);
    const cur = WORKOUT_DAYS.find(d => d.key === wDay);
    if (!cur) {
      setAiWorkoutResult("Error: Invalid workout day.");
      setAiWorkoutLoading(false);
      return;
    }
    try {
      const r = await callGemini(`Adapt ${cur.label} day (${cur.sub}) for: "${aiWorkoutInput}". Keep structure, include sets/reps/form cues. Markdown.`, "Elite trainer. Concise. Markdown.");
      setAiWorkoutResult(r);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setAiWorkoutResult("Error: " + msg);
    }
    setAiWorkoutLoading(false);
  };

  const handleMealRemix = async (meal: { name: string; desc: string }) => {
    setAiMealLoading(p => ({ ...p, [meal.name]: true }));
    try {
      const r = await callGemini(`Remix ${meal.name} (${meal.desc}) for: "${aiMealInput || 'make it a diverse pakistani or healthy twist'}". Include macros, ingredients, steps.`, "Elite chef nutritionist. Markdown.");
      setAiMealResults(p => ({ ...p, [meal.name]: r }));
    } catch (e: unknown) { console.error(e); }
    setAiMealLoading(p => ({ ...p, [meal.name]: false }));
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    setChatMessages(p => [...p, { role: "user", text: chatInput }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const sys = "Elite transformation coach. 30yo male, 215lb. 16-week plan: Push/Pull/Cardio+Core/Legs/HIIT/Recovery/Rest. 2050 cal, 185g protein. Concise, scientific, formatted.";
      const r = await callGemini(`${chatMessages.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n')}\nuser: ${chatInput}`, sys);
      setChatMessages(p => [...p, { role: "assistant", text: r }]);
    } catch (e: unknown) { setChatMessages(p => [...p, { role: "assistant", text: "Connection issue. Check API key." }]); }
    setChatLoading(false);
  };

  const curDay = WORKOUT_DAYS.find(d => d.key === wDay);
  const curSlot = MEALS.find(s => s.id === mSlot);

  const muscleDist = useMemo(() => {
    if (!curDay) return [];
    const c: Record<string, number> = {}; let t = 0;
    curDay.exercises.forEach(ex => {
      const m = (ex.muscle || "").toLowerCase();
      const targets: string[] = [];
      if (m.includes("chest") || m.includes("pec")) targets.push("Chest");
      if (m.includes("shoulder") || m.includes("delt") || m.includes("ohp") || m.includes("lateral") || m.includes("arnold") || m.includes("shrug") || m.includes("face pull")) targets.push("Shoulders");
      if (m.includes("back") || m.includes("lat") || m.includes("row") || m.includes("deadlift") || m.includes("pull")) targets.push("Back");
      if (m.includes("bicep") || m.includes("tricep") || m.includes("arm") || m.includes("hammer") || m.includes("curl") || m.includes("dip") || m.includes("pushdown")) targets.push("Arms");
      if (m.includes("core") || m.includes("ab") || m.includes("plank") || m.includes("rollout") || m.includes("bug") || m.includes("crunch") || m.includes("raise")) targets.push("Core");
      if (m.includes("leg") || m.includes("quad") || m.includes("ham") || m.includes("glute") || m.includes("squat") || m.includes("calf") || m.includes("lunge") || m.includes("posterior")) targets.push("Legs");
      if (targets.length === 0) targets.push("Other");
      targets.forEach(tgt => { c[tgt] = (c[tgt] || 0) + 1; t++; });
    });
    return Object.entries(c).map(([n, v]) => ({ name: n, count: v, pct: Math.round((v / t) * 100) })).sort((a, b) => b.count - a.count);
  }, [curDay]);

  const TABS = [
    { id: "training", label: "Training", icon: "⬢" },
    { id: "nutrition", label: "Nutrition", icon: "⬣" },
    { id: "supps", label: "Supplements", icon: "◈" },
    { id: "rules", label: "Rules", icon: "◆" },
    { id: "faq", label: "FAQ", icon: "◌" },
    { id: "coach", label: "AI Coach", icon: "✨" },
  ];

  return (
    <div className="relative min-h-screen pb-20" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", letterSpacing: "-0.011em" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37,99,235,0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(147,51,234,0.06), transparent 60%), radial-gradient(ellipse 70% 60% at 50% 100%, rgba(13,148,136,0.05), transparent 60%)` }} />

      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(32px) saturate(200%)", WebkitBackdropFilter: "blur(32px) saturate(200%)", borderColor: T.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.green, animation: "pulse 2s ease-in-out infinite" }} />
                <span className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: T.green }}>Scientific Protocol · Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #0B1220 0%, #475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                The Daedalus Initiative
              </h1>
              <p className="text-xs mt-1" style={{ color: T.textMuted }}>Male · 30 · 215 lb · Back Width · Shoulder Mass · Fat Loss</p>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full lg:w-auto">
              <StatTile value="2,050" label="kcal" color={T.blue} />
              <StatTile value="185g" label="Protein" color={T.green} />
              <StatTile value="16:8" label="IF Window" color={T.purple} />
              <StatTile value="6 Days" label="Weekly Split" color={T.amber} />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "thin" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setExOpen(null); setMOpen(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all relative"
                style={{ background: tab === t.id ? `${T.blue}12` : "transparent", color: tab === t.id ? T.blue : T.textMuted }}
              >
                <span className="text-[10px]">{t.icon}</span>{t.label}
                {tab === t.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: T.blue }} />}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        <AnimatePresence mode="wait">
          {/* TRAINING TAB */}
          {tab === "training" && (
            <motion.div key="training" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                {WORKOUT_DAYS.map(d => (
                  <button
                    key={d.key}
                    onClick={() => { setWDay(d.key); setExOpen(null); setAiWorkoutResult(null); }}
                    className="flex-shrink-0 py-3 px-4 text-center min-w-[78px] rounded-2xl transition-all"
                    style={{ background: wDay === d.key ? `${d.color}15` : T.surface, backdropFilter: "blur(24px) saturate(180%)", border: `1px solid ${wDay === d.key ? d.color : T.border}`, boxShadow: wDay === d.key ? `0 4px 16px -4px ${d.color}40` : undefined }}
                  >
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="font-mono text-xs font-bold" style={{ color: wDay === d.key ? d.color : T.textMuted }}>{d.key}</div>
                    <div className="text-[9px] mt-0.5 font-medium" style={{ color: T.textDim }}>{d.label.split(" ")[0]}</div>
                  </button>
                ))}
              </div>

              {curDay && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    <GlassCard elevated className="p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: curDay.color, transform: "translate(30%, -30%)" }} />
                      <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-3">
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: curDay.color }}>
                            {curDay.emoji} {curDay.label}
                          </h2>
                          <span className="text-xs font-medium" style={{ color: T.textMuted }}>{curDay.sub}</span>
                          <span className="font-mono text-[10px] font-bold sm:ml-auto" style={{ color: T.textDim }}>⏱ {curDay.sessionTime}</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{curDay.overview}</p>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: T.border }}>
                          <FatigueScore score={curDay.fatigueScore} color={curDay.color} />
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <h3 className="text-sm font-bold">AI Workout Adjuster</h3>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
                        {["30 min only", "Shoulder pain", "DB only", "Home workout"].map(p => (
                          <button key={p} onClick={() => setAiWorkoutInput(p)} className="text-xs py-1.5 px-3 rounded-full font-medium whitespace-nowrap transition-all" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}` }}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={aiWorkoutInput} onChange={e => setAiWorkoutInput(e.target.value)} placeholder="e.g. Lower back tight, swap deadlifts..." className="flex-1 rounded-xl px-4 py-2.5 text-sm" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }} />
                        <button onClick={handleWorkoutAdj} disabled={aiWorkoutLoading || !aiWorkoutInput.trim()} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all" style={{ background: T.blue, opacity: (aiWorkoutLoading || !aiWorkoutInput.trim()) ? 0.5 : 1 }}>
                          {aiWorkoutLoading ? "..." : "Adapt"}
                        </button>
                      </div>
                      {aiWorkoutResult && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-4 text-xs overflow-hidden" style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}` }}>
                          {formatAIResponse(aiWorkoutResult)}
                        </motion.div>
                      )}
                    </GlassCard>

                    {curDay.warmup.length > 0 && (
                      <div>
                        <SectionLabel text="Warm-Up · 8 min" color={T.teal} />
                        <div className="flex flex-wrap gap-2">
                          {curDay.warmup.map((w, i) => (
                            <div key={i} className="rounded-xl py-2 px-3 text-xs font-medium flex items-center gap-1.5" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}` }}>
                              <span style={{ color: T.teal }}>→</span>{w}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <SectionLabel text={`Exercises · ${curDay.exercises.length} movements`} color={curDay.color} />
                      <div className="space-y-3">
                        {curDay.exercises.map((ex, i) => {
                          const key = `${wDay}-${i}`;
                          const isOpen = exOpen === key;
                          const exNumber = String(i + 1).padStart(2, "0");
                          return (
                            <motion.div
                              key={i} layout className="rounded-2xl overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(32px) saturate(200%)", border: `1px solid ${isOpen ? curDay.color : T.border}`, boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 12px rgba(15,23,42,0.06), 0 24px 48px -24px rgba(15,23,42,0.18)" }}
                            >
                              <button onClick={() => setExOpen(isOpen ? null : key)} className="w-full p-4 text-left flex items-start gap-3 transition-all hover:bg-white/40">
                                {/* NUMBER BADGE */}
                                <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-mono text-sm font-bold" style={{ background: `linear-gradient(135deg, ${curDay.color}18, ${curDay.color}08)`, border: `1px solid ${curDay.color}35`, color: curDay.color, boxShadow: `0 2px 8px -2px ${curDay.color}30` }}>
                                  {exNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <span className="text-sm sm:text-base font-bold" style={{ color: T.text }}>{ex.name}</span>
                                    {ex.priority === "A+" && <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}30` }}>A+</span>}
                                    {ex.priority === "A★" && <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${curDay.color}18`, color: curDay.color, border: `1px solid ${curDay.color}30` }}>★ KEY</span>}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: T.textMuted }}>
                                    <span className="font-mono font-semibold" style={{ color: curDay.color }}>{ex.sets}×{ex.reps}</span>
                                    <span style={{ color: T.border }}>·</span>
                                    <span>{ex.muscle}</span>
                                    <span className="hidden sm:inline" style={{ color: T.border }}>·</span>
                                    <span className="hidden sm:inline">{ex.rest}</span>
                                  </div>
                                </div>
                                <motion.div animate={{ rotate: isOpen ? 45 : 0 }} className="text-xl font-light flex-shrink-0 mt-2" style={{ color: T.textDim }}>+</motion.div>
                              </button>
                              
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                                    <div className="px-4 pb-4 space-y-4 border-t pt-4 ml-14" style={{ borderColor: T.border }}>
                                      
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[["Rest", ex.rest], ["Week 1", ex.startW], ["Week 8", ex.w8], ["Week 16", ex.w16]].map(([l, v], idx) => {
                                          const c = idx === 2 ? T.blue : idx === 3 ? T.green : T.textMuted;
                                          return (
                                            <div key={l} className="rounded-xl p-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                              <div className="font-mono text-[8px] font-bold uppercase tracking-wider" style={{ color: T.textDim }}>{l}</div>
                                              <div className="font-mono text-xs font-bold mt-1" style={{ color: c }}>{v}</div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div>
                                        <SectionLabel text="Execution Guidelines" color={curDay.color} />
                                        <div className="space-y-2">
                                          {ex.form.map((f, fi) => (
                                            <div key={fi} className="flex gap-3 items-start">
                                              <span className="flex-shrink-0 w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ background: `${curDay.color}18`, color: curDay.color, border: `1px solid ${curDay.color}30` }}>{fi + 1}</span>
                                              <span className="text-xs leading-relaxed pt-1" style={{ color: T.textMuted }}>{f}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div className="rounded-xl p-3" style={{ background: `${T.red}08`, border: `1px solid ${T.red}20` }}>
                                          <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.red }}>Common Mistakes</div>
                                          {ex.mistakes.map((m, mi) => <div key={mi} className="text-xs mb-1" style={{ color: T.textMuted }}>✗ {m}</div>)}
                                        </div>
                                        <div className="rounded-xl p-3" style={{ background: `${T.blue}08`, border: `1px solid ${T.blue}20` }}>
                                          <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.blue }}>Coach&apos;s Tip</div>
                                          <div className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{ex.tip}</div>
                                        </div>
                                        {ex.advanced && (
                                          <div className="rounded-xl p-3" style={{ background: `${T.purple}08`, border: `1px solid ${T.purple}20` }}>
                                            <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.purple }}>Advanced (Week 9+)</div>
                                            <div className="text-xs" style={{ color: T.textMuted }}>{ex.advanced}</div>
                                          </div>
                                        )}
                                        {ex.beginner && (
                                          <div className="rounded-xl p-3" style={{ background: `${T.teal}08`, border: `1px solid ${T.teal}20` }}>
                                            <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.teal }}>Beginner Focus</div>
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

                    {/* CARDIO GRID */}
                    <div>
                      <SectionLabel text="Cardio Focus" color={T.green} />
                      <GlassCard className="p-5 overflow-hidden relative" style={{ borderLeft: `4px solid ${T.green}` }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {[
                            ["Type", curDay.cardio.type, T.text],
                            ["Duration", curDay.cardio.duration, T.green],
                            ["Intensity", curDay.cardio.intensity, T.textMuted],
                            ["Timing", curDay.cardio.timing, T.textDim],
                          ].map(([l, v, c]) => (
                            <div key={l}>
                              <div className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: T.textDim }}>{l}</div>
                              <div className="text-xs sm:text-sm font-semibold leading-snug" style={{ color: c }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t" style={{ borderColor: T.border }}>
                          <div className="flex items-start gap-2">
                            <span className="text-sm">💡</span>
                            <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{curDay.cardio.why}</p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                    {/* COOLDOWN */}
                    <div>
                      <SectionLabel text="Cool-Down · 8 min" color={T.purple} />
                      <div className="flex flex-wrap gap-2">
                        {curDay.cooldown.map((c, ci) => (
                          <div key={ci} className="rounded-xl py-2 px-3 text-xs font-medium flex items-center gap-1.5" style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}` }}>
                            <span style={{ color: T.purple }}>•</span>{c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <GlassCard className="p-5">
                      <SectionLabel text="Session Biomechanics" color={curDay.color} />
                      <MuscleRadarChart day={curDay} distribution={muscleDist} />
                      <div className="mt-4 space-y-2">
                        {muscleDist.map(m => (
                          <div key={m.name}>
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-[11px] font-semibold" style={{ color: T.text }}>{m.name}</span>
                              <span className="font-mono text-[10px] font-bold" style={{ color: T.textDim }}>{m.pct}%</span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.18)" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${curDay.color}aa, ${curDay.color})` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                      <SectionLabel text="Today's Volume" color={T.blue} />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="font-mono text-xl font-bold" style={{ color: curDay.color }}>{curDay.exercises.reduce((s, e) => s + e.sets, 0)}</div>
                          <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: T.textDim }}>Total Sets</div>
                        </div>
                        <div>
                          <div className="font-mono text-xl font-bold" style={{ color: curDay.color }}>{curDay.exercises.length}</div>
                          <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: T.textDim }}>Exercises</div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* NUTRITION TAB */}
          {tab === "nutrition" && (
            <motion.div key="nutrition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile value="2,050" label="kcal Target" color={T.blue} />
                <StatTile value="185g+" label="Protein" color={T.green} />
                <StatTile value="9:30 PM" label="IF Closes" color={T.purple} />
                <StatTile value="2×" label="Daily Chai" color={T.amber} />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                {MEALS.map(s => (
                  <button key={s.id} onClick={() => { setMSlot(s.id); setMOpen(null); }} className="flex-shrink-0 rounded-2xl py-3 px-4 text-center min-w-[88px] transition-all" style={{ background: mSlot === s.id ? `${s.color}15` : T.surface, backdropFilter: "blur(24px) saturate(180%)", border: `1px solid ${mSlot === s.id ? s.color : T.border}` }}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-xs font-bold" style={{ color: mSlot === s.id ? s.color : T.textMuted }}>{s.label}</div>
                    <div className="font-mono text-[9px] font-semibold mt-0.5" style={{ color: T.textDim }}>{s.time}</div>
                  </button>
                ))}
              </div>

              {curSlot && (
                <div className="space-y-4">
                  <GlassCard className="p-4" style={{ borderLeft: `4px solid ${curSlot.color}` }}>
                    <p className="text-sm" style={{ color: T.textMuted }}>{curSlot.note}</p>
                  </GlassCard>

                  <GlassCard className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <h3 className="text-sm font-bold">AI Meal Remixer</h3>
                    </div>
                    <div className="flex gap-2">
                      <input value={aiMealInput} onChange={e => setAiMealInput(e.target.value)} placeholder="e.g. Make it vegetarian, double protein..." className="w-full flex-1 rounded-xl px-4 py-2.5 text-sm" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }} />
                      <button onClick={() => { if(curSlot.options[0]) handleMealRemix(curSlot.options[0]) }} disabled={aiMealLoading[curSlot.options[0]?.name] || !aiMealInput.trim()} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all" style={{ background: curSlot.color, opacity: (aiMealLoading[curSlot.options[0]?.name] || !aiMealInput.trim()) ? 0.5 : 1 }}>
                         {aiMealLoading[curSlot.options[0]?.name] ? "..." : "Remix"}
                      </button>
                    </div>
                    {aiMealResults[curSlot.options[0]?.name] && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-4 text-xs overflow-hidden" style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}` }}>
                          {formatAIResponse(aiMealResults[curSlot.options[0]?.name])}
                       </motion.div>
                    )}
                  </GlassCard>

                  <div className="space-y-3">
                    {curSlot.options.map((m, i) => {
                      const open = mOpen === m.name;
                      return (
                        <GlassCard key={i} elevated={open} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <div className="flex gap-1.5 flex-wrap">
                                <TagPill text={m.tag} color={curSlot.color} />
                                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: T.surfaceAlt, color: T.textDim, border: `1px solid ${T.border}` }}>{m.diff}</span>
                              </div>
                            </div>
                            <div onClick={() => setMOpen(open ? null : m.name)} className="cursor-pointer">
                              <div className="text-base font-bold mb-1" style={{ color: T.text }}>{m.name}</div>
                              <div className="text-xs mb-3" style={{ color: T.textMuted }}>{m.desc}</div>
                              <div className="flex gap-4 text-xs">
                                <div><span className="font-mono font-bold" style={{ color: T.blue }}>{m.cal}</span><span className="ml-1" style={{ color: T.textDim }}>cal</span></div>
                                <div><span className="font-mono font-bold" style={{ color: T.green }}>{m.pro}g</span><span className="ml-1" style={{ color: T.textDim }}>protein</span></div>
                                <div style={{ color: T.textDim }}>⏱ {m.time}</div>
                              </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {open && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-4 border-t pt-4" style={{ borderColor: T.border }}>
                                  
                                  <div>
                                    <SectionLabel text="Ingredients" color={curSlot.color} />
                                    <div className="flex flex-wrap gap-1.5">
                                      {m.ing.map((ig, ii) => <span key={ii} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMuted }}>{ig}</span>)}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <SectionLabel text="Steps" color={curSlot.color} />
                                    <div className="space-y-2">
                                      {m.steps.map((st, si) => (
                                        <div key={si} className="flex gap-2.5 items-start">
                                          <span className="flex-shrink-0 w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center" style={{ background: `${curSlot.color}18`, color: curSlot.color }}>{si + 1}</span>
                                          <div className="text-xs" style={{ color: T.textMuted }}><strong style={{ color: T.text }}>{st.s}:</strong> {st.d}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="rounded-xl p-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                      <div className="font-mono text-[9px] font-bold uppercase mb-1" style={{ color: T.textDim }}>Notes</div>
                                      <div className="text-xs" style={{ color: T.textMuted }}>{m.notes}</div>
                                    </div>
                                    <div className="rounded-xl p-3" style={{ background: `${curSlot.color}08`, border: `1px solid ${curSlot.color}20` }}>
                                      <div className="font-mono text-[9px] font-bold uppercase mb-1" style={{ color: curSlot.color }}>Swap</div>
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

          {/* SUPPS TAB */}
          {tab === "supps" && (
            <motion.div key="supps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <GlassCard className="p-5">
                <p className="text-sm" style={{ color: T.textMuted }}><strong style={{ color: T.blue }}>Supplements accelerate results on top of solid training and nutrition.</strong> Start with Essential tier.</p>
              </GlassCard>
              <div className="space-y-3">
                {SUPPS.map((s, i) => {
                  const open = sOpen === i;
                  return (
                    <GlassCard key={i} elevated={open} className="overflow-hidden">
                      <button onClick={() => setSOpen(open ? null : i)} className="w-full p-4 text-left flex justify-between items-center gap-3 transition-all hover:bg-white/40">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold" style={{ color: T.text }}>{s.name}</span>
                            <TagPill text={s.tier} color={s.tc} />
                          </div>
                          <div className="text-xs font-mono" style={{ color: T.textMuted }}>{s.dose} · {s.timing}</div>
                        </div>
                        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-lg" style={{ color: T.textDim }}>+</motion.span>
                      </button>
                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3 border-t pt-4" style={{ borderColor: T.border }}>
                              <p className="text-sm" style={{ color: T.textMuted }}>{s.why}</p>
                              <div className="text-xs font-mono pt-2 border-t" style={{ color: T.textDim, borderColor: T.border }}>🏷 {s.brand}</div>
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

          {/* RULES TAB */}
          {tab === "rules" && (
            <motion.div key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["training", "Training", T.blue],
                    ["nutrition", "Nutrition", T.green],
                    ["lifestyle", "Lifestyle", T.purple],
                  ] as const
                ).map(([k, l, c]) => (
                  <button key={k} onClick={() => setRTab(k)} className="rounded-xl py-2.5 px-3 text-sm font-bold capitalize transition-all" style={{ background: rTab === k ? `${c}12` : T.surface, backdropFilter: "blur(24px) saturate(180%)", border: `1px solid ${rTab === k ? c : T.border}`, color: rTab === k ? c : T.textMuted }}>
                    {l}
                  </button>
                ))}
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

          {/* FAQ TAB */}
          {tab === "faq" && (
            <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {FAQS.map((f, i) => {
                const open = fOpen === i;
                return (
                  <GlassCard key={i} elevated={open} className="overflow-hidden">
                    <button onClick={() => setFOpen(open ? null : i)} className="w-full p-4 text-left flex justify-between items-center gap-4 transition-all hover:bg-white/40">
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

          {/* AI COACH TAB */}
          {tab === "coach" && (
            <motion.div key="coach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <GlassCard className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔑</span>
                  <h3 className="text-sm font-bold">Gemini API Credentials</h3>
                </div>
                <p className="text-xs" style={{ color: T.textMuted }}>Paste your personal Gemini API Key. Saved in browser localStorage only.</p>
                <div className="flex gap-2">
                  <input type="password" value={geminiApiKey || ""} onChange={e => saveKey(e.target.value)} placeholder="AIzaSy..." className="flex-1 rounded-xl px-4 py-2.5 text-sm font-mono" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }} />
                  {geminiApiKey && <button onClick={() => saveKey("")} className="rounded-xl px-4 text-sm font-semibold transition-all" style={{ background: `${T.red}15`, color: T.red, border: `1px solid ${T.red}30` }}>Clear</button>}
                </div>
                {geminiApiKey && <div className="text-xs font-semibold flex items-center gap-1" style={{ color: T.green }}>✓ Key saved locally</div>}
              </GlassCard>

              <GlassCard elevated className="p-0 overflow-hidden">
                <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: T.border }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: T.green, animation: "pulse 2s ease-in-out infinite" }} />
                  <h3 className="text-sm font-bold">AI Transformation Coach</h3>
                </div>
                <div className="h-[420px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
                    {chatMessages.map((m, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[85%] p-3 text-xs leading-relaxed" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", marginLeft: m.role === "user" ? "auto" : 0, background: m.role === "user" ? T.blue : T.surfaceAlt, color: m.role === "user" ? "#FFF" : T.text, borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", border: m.role === "user" ? "none" : `1px solid ${T.border}` }}>
                        {m.role === "user" ? m.text : formatAIResponse(m.text)}
                      </motion.div>
                    ))}
                    {chatLoading && <div className="p-3 rounded-2xl text-xs" style={{ background: T.surfaceAlt, color: T.textDim, border: `1px solid ${T.border}` }}>Thinking...</div>}
                  </div>
                  <div className="p-3 border-t flex gap-2" style={{ borderColor: T.border }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChat()} placeholder="Ask your coach..." className="flex-1 rounded-xl px-4 py-2.5 text-sm" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text }} />
                    <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="rounded-xl px-5 text-sm font-semibold text-white transition-all" style={{ background: T.blue, opacity: (chatLoading || !chatInput.trim()) ? 0.5 : 1 }}>Send</button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative border-t py-6 text-center z-10" style={{ borderColor: T.border }}>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.textDim }}>
          Built for Consistency · Not Perfection · Every Session Forward
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}