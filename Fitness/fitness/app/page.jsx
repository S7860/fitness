"use client";

import { useState, useMemo, useEffect } from "react";

/* ============================================================
   DESIGN TOKENS (MODERN LIGHT THEME)
============================================================ */
const T = {
  bg: "#f8fafc",          // Slate 50
  surface: "#ffffff",     // White
  card: "#f1f5f9",        // Slate 100
  border: "#e2e8f0",      // Slate 200
  borderHover: "#cbd5e1", // Slate 300
  lime: "#4d7c0f",        // Lime 700
  green: "#15803d",       // Green 700
  red: "#b91c1c",         // Red 700
  blue: "#1d4ed8",        // Blue 700
  amber: "#b45309",       // Amber 700
  purple: "#7e22ce",      // Purple 700
  teal: "#0f766e",        // Teal 700
  text: "#0f172a",        // Slate 900
  textMuted: "#475569",   // Slate 600
  textDim: "#64748b",     // Slate 500
};

/* ============================================================
   GLOBAL REUSABLE UI HELPERS
============================================================ */
const SectionLabel = ({ text, color }) => (
  <div 
    className="font-mono text-[9px] md:text-[10px] tracking-[0.25em] uppercase mb-3 font-semibold"
    style={{ color: color || T.textDim }}
  >
    {text}
  </div>
);

const TagPill = ({ text, color }) => (
  <span 
    className="text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-semibold tracking-wide whitespace-nowrap"
    style={{ background: `${color}15`, border: `1px solid ${color}30`, color: color }}
  >
    {text}
  </span>
);

/* ============================================================
   MARKDOWN FORMATTER UTILITY
============================================================ */
const formatInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold" style={{color:T.text}}>{part.slice(2,-2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic" style={{color:T.textMuted}}>{part.slice(1,-1)}</em>;
    }
    return part;
  });
};

const formatAIResponse = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-sm md:text-base font-bold mt-4 mb-2" style={{color:T.text}}>{formatInline(line.replace('### ', ''))}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-base md:text-lg font-extrabold mt-5 mb-2.5" style={{color:T.text}}>{formatInline(line.replace('## ', ''))}</h2>;
    
    const listMatch = line.match(/^(\d+\.|-|\*)\s+/);
    if (listMatch) {
      const bullet = listMatch[0];
      const content = line.slice(bullet.length);
      return (
        <div key={i} className="flex gap-2.5 mb-2 pl-1">
          <span className="font-bold min-w-[20px]" style={{color:T.blue}}>{bullet.trim()}</span>
          <span className="leading-relaxed text-sm md:text-base" style={{color:T.textMuted}}>{formatInline(content)}</span>
        </div>
      );
    }
    
    if (line.trim() === '') return <div key={i} className="h-2.5" />;
    return <div key={i} className="mb-2 leading-relaxed text-sm md:text-base" style={{color:T.textMuted}}>{formatInline(line)}</div>;
  });
};

/* ============================================================
   WORKOUT DATA — COMPLETE EXERCISE LIBRARY
============================================================ */
const WORKOUT_DAYS = [
  {
    key:"MON", label:"Push Day", sub:"Chest · Shoulders · Triceps",
    color:T.blue, emoji:"💪", sessionTime:"65–75 min",
    overview:"Chest fat burns from a full-body deficit — not from chest exercises alone. Building muscle underneath tightens and lifts the chest dramatically. Priority: shoulder width via lateral raises.",
    warmup:[
      "Arm Circles — 30 sec forward, 30 sec backward",
      "Band Pull-Aparts — 2 × 15",
      "Incline Push-Ups — 2 × 12",
      "Light DB Lateral Raises — 2 × 15 @ 5 lb",
    ],
    exercises:[
      {
        name:"Incline Dumbbell Press", priority:"A", muscle:"Upper Chest, Anterior Delt, Triceps",
        sets:4, reps:"10", rest:"90s", startW:"25–30 lb DBs", w8:"40–45 lb", w16:"55–60 lb",
        form:[
          "Set bench to 30–35°. Higher = shifts to shoulders; lower = mid-chest.",
          "Grip DBs with thumbs wrapped. Lower to UPPER chest. Elbows at 45°, NOT flared 90°.",
          "Press up and slightly inward. Full lockout. Squeeze chest hard 1 second at top.",
          "2–3 sec controlled descent — the eccentric is where muscle is built.",
        ],
        mistakes:["Bouncing at the bottom (no momentum)","Elbows flared 90° outward — rotator cuff injury risk","Not reaching full stretch at bottom"],
        tip:"Before pressing, imagine trying to 'bend the dumbbell in half' — this fires the chest before you move and creates immediate mind-muscle connection.",
        advanced:"Week 9+: 3-sec eccentric. Drop set on final set — full weight × 8, drop 30%, × 8 more.",
        beginner:"Machine chest press for first 2 weeks if DBs feel unstable.",
      },
      {
        name:"Overhead Barbell Press (OHP)", priority:"A", muscle:"All 3 Deltoid Heads, Upper Chest, Triceps",
        sets:4, reps:"8", rest:"2 min", startW:"55–65 lb bar", w8:"85–95 lb", w16:"115–125 lb",
        form:[
          "Brace core HARD before every single rep. This protects your lower back under load.",
          "Press straight up — bar path arcs slightly back once it passes your nose.",
          "Full lockout at top — arms completely straight. Slight shrug at lockout seats the shoulder.",
          "Lower under control to collar-bone height. Elbows stay under the bar at all times.",
        ],
        mistakes:["Lower back arching excessively (brace harder or reduce weight)","Bar drifting forward on the way up","Incomplete lockout at top"],
        tip:"'Push the floor away with your feet' while pressing. This full-body tension cue makes you immediately stronger.",
        advanced:"Week 9+: Superset with Arnold Press immediately after final OHP set.",
        beginner:"Smith machine OHP or seated DB press for first 3 weeks.",
      },
      {
        name:"Arnold Press", priority:"B", muscle:"All 3 Deltoid Heads — Complete Shoulder",
        sets:3, reps:"12", rest:"75s", startW:"20–25 lb DBs", w8:"30–35 lb", w16:"45–50 lb",
        form:[
          "Sit 90° bench. DBs at chin height, palms facing YOU (post-curl position).",
          "Press and ROTATE — by full extension overhead, palms face AWAY from you.",
          "Return: reverse the rotation — palms face in at chin height.",
          "Full lockout overhead every rep.",
        ],
        mistakes:["Rotation completing too early or too late (should finish at midpoint of press)","Not reaching full overhead lockout"],
        tip:"The rotation is what makes Arnold Press superior to regular DB press — it hits all 3 delt heads through the full range. This builds the round, full shoulder look.",
        advanced:"Week 9+: Superset with cable lateral raises — Arnold × 10, immediately cable raises × 15.",
        beginner:"Seated DB press (without rotation) while learning the movement.",
      },
      {
        name:"Cable Lateral Raise (Single Arm)", priority:"A★", muscle:"Lateral Deltoid — PRIMARY WIDTH BUILDER",
        sets:4, reps:"15 each arm", rest:"60s between sides", startW:"10–12 lb/side", w8:"20–22 lb", w16:"28–32 lb",
        form:[
          "Stand sideways to cable. Cable at lowest position. Slight forward lean (15°).",
          "Raise arm to shoulder height. Lead with ELBOW, not hand — think 'pour water from a jug'.",
          "Cable crosses body on the way up = constant tension through FULL range (DBs have zero tension at bottom).",
          "3-sec controlled return. Feel the delt staying loaded the entire way down.",
        ],
        mistakes:["Swinging weight up with momentum — go lighter and control it","Raising above shoulder level (shifts to traps, not lateral delt)","Rushing the descent"],
        tip:"This single exercise is the primary driver of shoulder width. Cables are superior to dumbbells because of constant tension. Prioritize this above all other shoulder work.",
        advanced:"Week 9+: Drop set on final set — reduce 30%, continue to failure.",
        beginner:"DB lateral raises for first 4 weeks, then transition to cables.",
      },
      {
        name:"Dumbbell Lateral Raise (Drop Set Finisher)", priority:"B", muscle:"Lateral Deltoid — Additional Volume",
        sets:3, reps:"15 → 12 → 10 (descending weight)", rest:"No rest between drops", startW:"15–12–10 lb", w8:"22–18–15 lb", w16:"30–25–20 lb",
        form:[
          "Start with moderate weight × 15. Immediately drop 2–3 lbs × 12. Immediately drop again × 10.",
          "All three drops = 1 set. Rest 60 sec between sets.",
          "Same form as cable raises: elbow leads, slight lean, raise to parallel.",
        ],
        mistakes:["Using too heavy a starting weight (can't complete all drops with form)"],
        tip:"Triple drop sets on lateral raises are one of the most effective techniques for building lateral delt size quickly. High volume, high metabolic stress.",
        advanced:"Week 9+: Add a 4th drop.",
        beginner:"Single weight × 15 is fine for first 6 weeks.",
      },
      {
        name:"Cable Chest Fly (Low-to-High)", priority:"B", muscle:"Upper Chest, Anterior Delt",
        sets:3, reps:"12", rest:"60s", startW:"15–20 lb/side", w8:"25–30 lb", w16:"35–40 lb",
        form:[
          "Cables at lowest position. Stand center. Palms facing up/forward. Slight elbow bend — constant.",
          "Arc arms upward and inward — like hugging a large barrel above you.",
          "Hands meet at upper chest/eye level. Squeeze HARD for 2 seconds at top.",
          "3-sec controlled return. Let cables pull arms back with full tension.",
        ],
        mistakes:["Elbows bending too much (becomes a tricep movement)","Rushing — this is isolation work, slow is effective"],
        tip:"The 2-sec squeeze at peak contraction is worth 3 rushed reps. Feel the upper chest fibers fully contract.",
        advanced:"Week 9+: Superset with incline press — fly first (pre-exhaust), then press immediately.",
        beginner:"Pec Deck machine is identical and more stable.",
      },
      {
        name:"Tricep Rope Pushdown", priority:"B", muscle:"Triceps — Lateral Head (Outer Definition)",
        sets:3, reps:"12–15", rest:"60s", startW:"30–40 lb", w8:"50–60 lb", w16:"70–80 lb",
        form:[
          "Cable at highest position. Rope attachment. Slight forward lean.",
          "Elbows PINNED to sides — they are the axis and must NEVER move.",
          "Push rope down AND apart at bottom — split rope ends outward at full extension.",
          "Full extension = hold 1 sec squeeze. Let rope rise until forearms are parallel to floor.",
        ],
        mistakes:["Elbows drifting forward (turns it into a full-body press)","Not reaching full extension at bottom"],
        tip:"Consciously flex the tricep as hard as you can at the bottom of each rep. That contraction builds the defined lateral head that shows through clothing.",
        advanced:"Week 9+: Superset with overhead extension — pushdown × 12, immediately overhead × 12.",
        beginner:"Same exercise from day one. Just start light and learn the elbow position.",
      },
      {
        name:"Overhead DB Tricep Extension", priority:"B", muscle:"Triceps Long Head — Maximum Arm Thickness",
        sets:3, reps:"12", rest:"60s", startW:"25–35 lb single DB", w8:"45–50 lb", w16:"60–65 lb",
        form:[
          "Hold one DB with both hands, gripping the top weight plate. Sit or stand.",
          "Raise overhead. Elbows point straight UP — they stay there the ENTIRE set.",
          "Lower DB behind head by bending only at elbows. Feel the long head STRETCH deeply.",
          "Press back to full extension. Elbows remain forward-facing throughout.",
        ],
        mistakes:["Elbows flaring outward (they must point at ceiling)","Short range of motion — full stretch = full long head activation"],
        tip:"The tricep long head (inner portion that adds arm THICKNESS) is only fully stretched when arms are overhead. This exercise is non-negotiable for arm size.",
        advanced:"Week 9+: Single-arm cable overhead extension for independent arm development.",
        beginner:"Use lightest available DB. The stretch feels intense at first — build range slowly.",
      },
      {
        name:"Tricep Dips (Bodyweight or Weighted)", priority:"B", muscle:"All 3 Tricep Heads, Lower Chest, Anterior Delt",
        sets:3, reps:"10–12", rest:"75s", startW:"Bodyweight", w8:"BW + 10 lb plate", w16:"BW + 25 lb",
        form:[
          "Parallel bars or bench dips. Slight forward lean for more chest, upright for more tricep.",
          "Lower until upper arms are parallel to floor. Elbows track behind you.",
          "Drive back up to full lockout. Squeeze triceps at top.",
        ],
        mistakes:["Going too deep (shoulder impingement risk)","Elbows flaring too wide"],
        tip:"Dips are a compound tricep movement — they also hit chest and anterior delt. Heavy weighted dips build serious arm mass.",
        advanced:"Week 9+: Weighted dips with dip belt or holding a plate between legs.",
        beginner:"Bench dips with feet on floor if parallel bars too challenging.",
      },
    ],
    cardio:{type:"Incline Treadmill Walk", duration:"20–25 min", intensity:"3.0–3.5 mph / 8–12% incline",
      timing:"Post-lifting", why:"Zone 2 cardio after lifting burns fat from depleted glycogen stores. Optimal fat-burning window."},
    cooldown:["Chest doorframe stretch 30s each","Cross-body shoulder stretch 30s each","Overhead tricep stretch 30s each","Deep breathing 2 min"],
  },
  {
    key:"TUE", label:"Pull Day", sub:"Back Width · Thickness · Biceps · Rear Delts",
    color:T.red, emoji:"🏋️", sessionTime:"70–80 min",
    overview:"YOUR MOST IMPORTANT SESSION. Back development creates the V-taper that makes your waist look dramatically smaller — even before fat is gone. Width from lat work. Thickness from rows. Rear delts from face pulls. NEVER skip this day.",
    warmup:[
      "Dead Hangs — 3 × 20 sec",
      "Band Pull-Aparts / Face Pull — 2 × 20",
      "Light Lat Pulldown — 2 × 15 @ 50–55 lb",
      "Cat-Cow Spinal Mobility — 10 reps",
    ],
    exercises:[
      {
        name:"Deadlift (Conventional / Smith Machine)", priority:"A+", muscle:"Full Posterior Chain: Spinal Erectors, Glutes, Hamstrings, Traps",
        sets:4, reps:"5", rest:"3 min", startW:"165 lb", w8:"185–195 lb", w16:"225–245 lb",
        form:[
          "Bar over mid-foot (1 inch from shins). Grip shoulder-width. Arms vertical from front.",
          "SETUP: big breath → brace core like about to be punched → chest up → shoulders back. This 'sets your back.'",
          "Leg drive: push the floor away while bar STAYS in contact with your legs the entire lift.",
          "At lockout: hips fully extended, standing tall. Do NOT hyperextend lower back.",
          "Lower: hinge hips FIRST, then bend knees once bar passes the knees.",
        ],
        mistakes:["Rounding lower back — drop weight immediately, this is the injury","Bar drifting forward away from legs","Jerking the weight — pull slack out slowly before plates move","Hyperextending at lockout"],
        tip:"Think of the deadlift as a LEG PRESS — you're pushing the floor away, not pulling the bar up. This single cue fixes form for 90% of people.",
        advanced:"Week 9+: Add Romanian Deadlifts as second variation. Week 13+: Deficit deadlifts from 2-inch platform.",
        beginner:"Smith machine as you're currently doing is fine for weeks 1–4. Progress to free bar by week 5–6.",
      },
      {
        name:"Wide-Grip Lat Pulldown", priority:"A", muscle:"Latissimus Dorsi (Width), Teres Major, Rear Delt, Biceps",
        sets:4, reps:"10", rest:"90s", startW:"100 lb", w8:"115–120 lb", w16:"140–155 lb",
        form:[
          "Grip bar 6–8 inches outside each shoulder. Lean back 15–20° — this optimizes lat activation.",
          "Drive ELBOWS DOWN toward your hip pockets — not hands pulling down.",
          "At bottom: shoulder blades retracted AND depressed (back AND down). Hold 1 second here.",
          "Let bar rise all the way back up — full lat STRETCH at top. Feel the lat elongate completely.",
        ],
        mistakes:["Pulling to the back of neck — dangerous for cervical spine, zero lat activation","Using biceps instead of driving elbows down","Cutting the rep short at top (no full stretch)"],
        tip:"'Put my elbows in my back pockets.' That one cue completely changes the movement and builds the V-taper.",
        advanced:"Week 9+: Superset with straight-arm pulldown immediately after (cable at top, press down with straight arms to hips).",
        beginner:"Assisted pull-up machine or machine pulldown — identical movement pattern.",
      },
      {
        name:"Barbell Bent-Over Row", priority:"A", muscle:"Rhomboids, Mid-Traps, Lower Lats, Rear Delt",
        sets:4, reps:"10", rest:"90s", startW:"75 lb", w8:"100–110 lb", w16:"135–145 lb",
        form:[
          "Hinge forward 45–60° from vertical. Knees slightly bent. Core braced and RIGID throughout.",
          "Pull bar to LOWER ABDOMEN (belly button area) — this targets mid-back thickness.",
          "At top: elbows drive back, shoulder blades fully squeezed together. Hold 1 second.",
          "2-sec controlled descent — feel the mid-back stretch at the bottom.",
        ],
        mistakes:["Pulling to the chest (becomes an upright row — different exercise)","Torso rocking up and down for momentum","Rounded lower back under load"],
        tip:"Pull height matters: belly button = thickness. Lower ribs = width. Vary intentionally as you progress. You did 75 lbs last session — great starting point.",
        advanced:"Week 9+: Pendlay Row — bar starts on floor each rep, dead stop, explosive pull. Builds power.",
        beginner:"Single-arm DB row on bench if barbell balance is difficult.",
      },
      {
        name:"Seated Cable Row (V-Grip)", priority:"B", muscle:"Rhomboids, Middle Traps, Lower Lats",
        sets:3, reps:"12", rest:"75s", startW:"100 lb", w8:"115–120 lb", w16:"140–150 lb",
        form:[
          "Start sitting TALL — do NOT begin leaned back.",
          "Row handle to lower abdomen while torso pulls back slightly (10° lean). These happen together.",
          "At full row: chest up, shoulders back, squeeze mid-back HARD.",
          "Lean forward fully on return — shoulder blades spread apart. Feel the full mid-back stretch.",
        ],
        mistakes:["Leaning way back (lower back becomes the lever, back muscles don't work)","Not getting the forward lean stretch at the start","Elbows flaring out to sides"],
        tip:"On the return, try to touch your shoulder blades together IN FRONT of your chest. You can't — but trying activates every back muscle maximally.",
        advanced:"Week 9+: Single-arm cable row with slight rotation — adds anti-rotation core demand.",
        beginner:"Machine row is identical and more stable for learning.",
      },
      {
        name:"Single-Arm Dumbbell Row", priority:"B", muscle:"Lats, Mid-Back — Unilateral Strength",
        sets:3, reps:"12 each arm", rest:"60s between sides", startW:"35–40 lb", w8:"55–60 lb", w16:"70–80 lb",
        form:[
          "Knee and hand on bench. Back completely FLAT — parallel to floor.",
          "DB hangs straight down. Pull to lower ribs/hip area. Lead with elbow.",
          "At top: rotate slightly to fully retract shoulder blade — feel the lat fully contract.",
          "Full stretch at bottom — let shoulder blade protract forward.",
        ],
        mistakes:["Back not flat (rotates too much)","Pulling to shoulder instead of hip","Short range of motion"],
        tip:"Single-arm rows correct left-right strength imbalances that barbell rows can't. Both arms should eventually handle the same weight for equal back development.",
        advanced:"Week 9+: Meadows Row (barbell in landmine) — superior range of motion.",
        beginner:"This is suitable from day one — easier than barbell row to learn.",
      },
      {
        name:"Face Pull (Rope Cable)", priority:"A★", muscle:"Posterior Deltoid, External Rotators, Rotator Cuff",
        sets:3, reps:"15–20", rest:"60s", startW:"30 lb", w8:"40–45 lb", w16:"50–55 lb",
        form:[
          "Cable at head height or above. Rope attachment.",
          "Pull rope to FACE — aim for eye level. Elbows go HIGH and WIDE (goal post position).",
          "At full contraction: hands at ear level, elbows ABOVE shoulder level. Hold 2 seconds.",
          "Return slowly — full control throughout.",
        ],
        mistakes:["Pulling to neck or chest (wrong muscle entirely)","Elbows staying low (becomes a bicep curl)","Too much weight (ruins form completely)"],
        tip:"Do face pulls at the end of EVERY session — not just Tuesdays. This is your rotator cuff insurance policy AND builds the 3D rear delt look that's visible from the side and behind.",
        advanced:"Week 9+: Move face pulls to first exercise — shoulder health before everything.",
        beginner:"10–15 lbs. This is a health exercise, not a strength exercise.",
      },
      {
        name:"Incline Dumbbell Curl", priority:"A", muscle:"Biceps Long Head — Maximum Stretch for Maximum Growth",
        sets:3, reps:"12", rest:"75s", startW:"15–20 lb DBs", w8:"25–30 lb", w16:"32–38 lb",
        form:[
          "Bench at 45–60° incline. Sit back with arms hanging straight DOWN and BEHIND body.",
          "This pre-stretches the bicep before you start — critical for maximum growth.",
          "Curl up — elbows stay pinned BEHIND your torso throughout. Never drift forward.",
          "Squeeze at top. 3-sec eccentric all the way to full extension.",
        ],
        mistakes:["Elbows drifting forward (defeats the entire purpose of incline position)","Not reaching full extension at bottom (shortens range)","Body swinging to help lift"],
        tip:"Research consistently shows stretched-position training (incline curl) produces significantly more bicep growth than any other variation. This is the most valuable bicep exercise in the plan.",
        advanced:"Week 9+: Superset with hammer curls — incline × 10, immediately stand and hammer × 10, no rest.",
        beginner:"Seated DB curl on bench until form is mastered, then transition to incline.",
      },
      {
        name:"Hammer Curl", priority:"A", muscle:"Brachialis, Brachioradialis, Biceps — ARM THICKNESS",
        sets:3, reps:"12", rest:"75s", startW:"20–25 lb DBs", w8:"30–35 lb", w16:"40–45 lb",
        form:[
          "Stand or sit. Hold DBs with a NEUTRAL grip (palms facing each other — like hammers).",
          "Curl both arms simultaneously or alternate.",
          "Elbows stay fixed at sides — only forearms move.",
          "Full extension at bottom. Squeeze at top for 1 second.",
        ],
        mistakes:["Swinging body","Rotating wrist to supinate during movement (defeats hammer purpose)"],
        tip:"Hammer curls primarily target the BRACHIALIS — the muscle underneath the bicep that pushes the bicep UP and makes the arm look thicker and taller from the front. This is what most people miss.",
        advanced:"Week 9+: Cross-body hammer curls (curl across the body) — hits brachialis from slightly different angle.",
        beginner:"Same exercise from day one. Start light and focus on the neutral grip.",
      },
      {
        name:"Cable Curl (EZ Bar or Straight Bar)", priority:"B", muscle:"Biceps Short Head — Peak and Width",
        sets:2, reps:"15", rest:"60s", startW:"40–50 lb", w8:"60–70 lb", w16:"75–85 lb",
        form:[
          "Cable at lowest position. EZ bar or straight bar attachment.",
          "Stand close to machine. Curl bar to chin level. Elbows stay at sides.",
          "Lower with FULL control — 3-sec eccentric. Cable keeps tension at the bottom (unlike dumbbells).",
        ],
        mistakes:["Elbows drifting forward","Rushing the descent (the eccentric is where growth happens)"],
        tip:"Cable curls maintain tension at the stretched position (bottom of curl) unlike dumbbells. They complement incline curls perfectly: incline = long head stretched, cable = constant tension throughout.",
        advanced:"Week 9+: Single-arm cable curl with slight supination at top.",
        beginner:"Same exercise from day one.",
      },
      {
        name:"Concentration Curl", priority:"B", muscle:"Biceps Peak — Isolation",
        sets:2, reps:"12 each arm", rest:"45s between arms", startW:"15–20 lb", w8:"25–30 lb", w16:"35–40 lb",
        form:[
          "Sit on bench edge. Elbow braced against inner thigh. DB hangs.",
          "Curl up fully. Supinate wrist hard at top — pinky finger higher than thumb.",
          "3-sec descent. Full extension.",
        ],
        mistakes:["Not bracing the elbow against the thigh (defeats isolation)","Not supinating at the top"],
        tip:"Supinating hard at the top of every rep (rotating palm outward) targets the short head and builds the peak of the bicep — the shape visible when you flex.",
        advanced:"Week 9+: Add a 2-sec peak contraction hold.",
        beginner:"Same exercise from day one.",
      },
    ],
    cardio:{type:"Stationary Bike (Moderate)", duration:"15 min", intensity:"Level 6–8 / 75–80 RPM",
      timing:"Post-lifting only", why:"Tuesday is heavy. Flush lactic acid without adding stress. Low-impact recovery only."},
    cooldown:["Lat hang stretch 2 × 30 sec","Child's pose 60 sec","Bicep wall stretch 30s each","Upper back foam roll 2 min"],
  },
  {
    key:"WED", label:"Cardio + Core", sub:"Fat Burn · Active Recovery · Core",
    color:T.green, emoji:"🔥", sessionTime:"45–55 min",
    overview:"No heavy lifting. Monday and Tuesday muscles are rebuilding. This session maximizes fat burning through sustained cardio while strengthening the core that protects your spine under heavy compound lifts.",
    warmup:["5-min slow treadmill walk","Hip circles 10 each direction","Leg swings 10 each"],
    exercises:[
      {
        name:"Incline Treadmill Walk (Zone 2)", priority:"A", muscle:"Full-Body Fat Burn",
        sets:1, reps:"35–40 min", rest:"—", startW:"3.2 mph / 10% incline", w8:"3.5 mph / 12%", w16:"3.8 mph / 14%",
        form:[
          "You should be able to hold a sentence but feel your heart working. That's Zone 2.",
          "Do NOT hold the handrails — reduces calorie burn by 20–30%.",
          "Head up, shoulders back. Use this walk to practice good posture.",
        ],
        mistakes:["Holding rails at steep incline (defeats the purpose entirely)","Going too fast — this should be a walk, not a run"],
        tip:"Zone 2 cardio burns the highest PERCENTAGE of calories from fat vs any higher intensity. This is the scientifically optimal belly-fat burning zone — not HIIT.",
        advanced:"Week 9+: Add 10–15 lb weighted vest at same speed and incline.",
        beginner:"Start at 6% incline if 10% is too hard. Add 1–2% each week.",
      },
      {
        name:"Ab Wheel Rollout", priority:"A★", muscle:"Entire Core — Most Effective Core Exercise",
        sets:3, reps:"8–10", rest:"60s", startW:"From knees", w8:"12 reps or 6 standing", w16:"10 full standing rollouts",
        form:[
          "Kneel on floor. Grip wheel shoulder-width. Core braced before you move.",
          "Roll forward SLOWLY. Lower back must NEVER sag — this is the injury position.",
          "Go only as far as you can maintain a flat back — 45–60° forward initially.",
          "Pull back by CURLING your torso — think of bringing your abs to your hips, not pulling with arms.",
        ],
        mistakes:["Rolling too far too soon (lower back collapses — dangerous)","Moving too fast (momentum removes the benefit)","Not bracing core before starting"],
        tip:"Studies show ab wheel activates more abdominal muscle than any other movement. Build to it — it's genuinely hard. Standing rollouts from feet = elite difficulty, work toward this by week 12.",
        advanced:"Standing rollouts from feet — work toward by week 12.",
        beginner:"Roll only 12 inches for first 2 weeks. Build range slowly.",
      },
      {
        name:"Hanging Leg Raise", priority:"A", muscle:"Lower Abs, Hip Flexors, Core Stabilizers",
        sets:3, reps:"10–12", rest:"60s", startW:"Knees bent", w8:"15 reps controlled", w16:"Straight legs + ankle weights",
        form:[
          "Dead hang from pull-up bar. Engage core BEFORE legs move.",
          "Keep arms straight, raise legs without swinging, control descent.",
        ],
        mistakes:["Using momentum","Dropping legs fast"],
        tip:"Focus on the core doing the actual lift, not the hip flexors.",
        advanced:"Week 9+: Straight legs all sets.",
        beginner:"Knee tucks to chest.",
      },
      {
        name:"Plank Hold", priority:"A", muscle:"Transverse Abdominis, Full Core, Lower Back",
        sets:3, reps:"45–60 sec", rest:"45s", startW:"Bodyweight", w8:"75–90 sec", w16:"90–120 sec + weight plate",
        form:[
          "Elbows directly under shoulders. Body in a PERFECTLY straight line from head to heels.",
          "Squeeze glutes AND abs SIMULTANEOUSLY — both at full tension.",
          "Breathe steadily. Never hold breath.",
        ],
        mistakes:["Hips sagging (lower back strain)","Hips piking up (core disengages entirely)","Holding breath"],
        tip:"Think 'pull elbows toward toes and toes toward elbows simultaneously.' This full-body tension is what makes it effective rather than just endurance.",
        advanced:"Week 9+: Partner places 25 lb plate on back. Week 13+: Alternating arm extensions.",
        beginner:"Knees on ground for first 2 weeks.",
      },
      {
        name:"Cable Crunch", priority:"A", muscle:"Rectus Abdominis — Weighted Ab Work",
        sets:3, reps:"15–20", rest:"45s", startW:"30–40 lb", w8:"50–60 lb", w16:"70–80 lb",
        form:[
          "Kneel facing cable machine. Rope at top. Hold rope at sides of head.",
          "Crunch DOWN and forward — round your back. Elbows to knees.",
          "Hold 1 sec at bottom. Return slowly to starting position.",
        ],
        mistakes:["Pulling with arms (abs must do all the work)","Hinging at hips instead of crunching (becomes hip flexor work)"],
        tip:"Cable crunches are weighted ab work — the ONLY way to make abs grow like any other muscle. Bodyweight crunches have no progressive overload. This does.",
        advanced:"Week 9+: Add slow 3-sec eccentric. Week 13+: Increase weight and reduce reps (8–10 heavy).",
        beginner:"Bodyweight crunches first 4 weeks, then transition to cable.",
      },
      {
        name:"Bicycle Crunch", priority:"B", muscle:"Obliques, Rectus Abdominis",
        sets:3, reps:"20 each side", rest:"45s", startW:"Bodyweight", w8:"25 each / slower", w16:"30 each + ankle weight",
        form:[
          "Each rotation = 2 seconds. SLOW = effective. Fast = momentum, not muscle.",
          "Fully extend the straight leg every single rep.",
          "Twist COMPLETELY to feel the oblique fully contract each time.",
        ],
        mistakes:["Rushing (speed kills activation entirely)","Pulling neck forward (cervical strain)","Not extending the straight leg"],
        tip:"The twist attacks the obliques that sit directly over love handles. Twist completely and hold 1 sec at the contracted position.",
        advanced:"Week 9+: Weighted Russian twists replace this.",
        beginner:"Regular crunches if bicycle strains the neck.",
      },
      {
        name:"Dead Bug", priority:"B", muscle:"Deep Core Stabilizers, Anti-Extension Strength",
        sets:3, reps:"10 each side", rest:"45s", startW:"Bodyweight", w8:"4-sec tempo", w16:"Light DB in each hand",
        form:[
          "Lie on back. Runs straight up. Knees to 90° tabletop.",
          "Press lower back INTO the floor — stays in contact the ENTIRE set.",
          "SLOWLY lower opposite arm and leg toward floor — 4 seconds. Return before touching floor.",
        ],
        mistakes:["Lower back arching off floor (abs have lost control — stop and reset)","Moving too fast"],
        tip:"Trains anti-extension core stability — the functional strength that protects your lower back during every heavy compound lift. Non-negotiable for long-term training health.",
        advanced:"Week 9+: Add resistance band to legs.",
        beginner:"Suitable for all levels. Just go very slow.",
      },
    ],
    cardio:{type:"Outdoor Walk (Step Goal)", duration:"10,000 total steps today", intensity:"Brisk 15–17 min/mile",
      timing:"Lunch break if working", why:"Wednesday = maximum fat-burning day. Incline walk + daily steps = 600–800 extra calories burned with zero muscle loss."},
    cooldown:["Full-body static stretch 10 min","Pigeon pose 45s each (hip flexors)","Lying spinal twist 30s each"],
  },
  {
    key:"THU", label:"Legs + Core", sub:"Quads · Hamstrings · Glutes · Abs",
    color:T.purple, emoji:"🦵", sessionTime:"65–75 min",
    overview:"Legs are the largest muscle group in the body. Training them releases the most testosterone and growth hormone, burns the most calories, and accelerates fat loss across your ENTIRE body — including the belly. Skipping legs = skipping 60% of your total results.",
    warmup:["Bodyweight Squats 2 × 15","Glute Bridges 2 × 15","Leg Swings 10 each direction","Walking Lunges BW 10 each"],
    exercises:[
      {
        name:"Barbell Back Squat", priority:"A+", muscle:"Quadriceps, Glutes, Hamstrings, Core, Entire Back",
        sets:4, reps:"8", rest:"2 min", startW:"95–115 lb bar", w8:"145–165 lb", w16:"185–205 lb",
        form:[
          "High bar on upper traps. Feet shoulder-width or slightly wider. Toes out 15–30°.",
          "Big breath, brace core like your life depends on it. Spine must be rigid under load.",
          "Hinge HIPS first, then knees follow. Descend until thighs are parallel or BELOW.",
          "Drive knees OUT over toes throughout. Lead with chest UP on the ascent.",
        ],
        mistakes:["Knees caving inward (valgus collapse) — push out ACTIVELY, biggest injury risk","Heels rising off floor (tight Achilles — add heel plate or work ankle mobility)","Not hitting parallel depth"],
        tip:"Squats produce the largest anabolic hormone response of any exercise. More testosterone + GH = faster fat loss AND muscle gain across your entire body — including upper body.",
        advanced:"Week 9+: 2-sec pause at bottom (eliminates elastic energy, pure muscle strength). Week 13+: Bulgarian split squat superset.",
        beginner:"Goblet squat (single DB at chest) for first 3 weeks to learn the pattern safely.",
      },
      {
        name:"Romanian Deadlift (RDL)", priority:"A", muscle:"Hamstrings, Glutes, Lower Back",
        sets:3, reps:"10", rest:"90s", startW:"65–85 lb bar", w8:"105–125 lb", w16:"145–165 lb",
        form:[
          "Stand, bar at hip level. Feet hip-width. Slight knee bend — constant throughout.",
          "Hinge at hips — push them BACK behind you. Lower back stays flat (natural arch).",
          "Bar drags down thighs as you descend. Feel hamstrings loading like a rubber band.",
          "Go as deep as flexibility allows WITHOUT rounding the back — usually just below the knee.",
        ],
        mistakes:["Rounding lower back (common when going too heavy or too deep)","Bending knees too much (becomes a squat)","Bar drifting away from legs"],
        tip:"The hamstring stretch in RDL is where the muscle grows. Control the descent entirely. Slower = more effective. This is the most important hamstring exercise in the program.",
        advanced:"Week 9+: Single-leg RDL with DBs — extreme balance demand and unilateral hamstring isolation.",
        beginner:"DB Romanian deadlift — easier to control than barbell.",
      },
      {
        name:"Leg Press (Machine)", priority:"B", muscle:"Quadriceps, Glutes, Hamstrings",
        sets:3, reps:"12", rest:"90s", startW:"180–220 lb on machine", w8:"270–310 lb", w16:"360–400 lb",
        form:[
          "Feet shoulder-width on platform. Higher foot placement = more glute. Lower = more quad.",
          "Lower until knees reach 90°. Push through MID-FOOT and heels.",
          "Do NOT fully lock knees at extension. Lower back stays flat against pad.",
        ],
        mistakes:["Short range of motion (only halfway)","Lower back peeling off pad (disc injury risk)","Full knee lockout at extension"],
        tip:"Leg press adds volume on top of squats. More total leg volume = more testosterone release = more fat burning. Use it to pile on volume safely.",
        advanced:"Week 9+: 4-sec eccentric press. Week 13+: Drop set on final set.",
        beginner:"Machine stability makes this beginner-friendly immediately.",
      },
      {
        name:"Walking Dumbbell Lunge", priority:"B", muscle:"Glutes, Quadriceps, Hamstrings, Core Stability",
        sets:3, reps:"10 each leg", rest:"75s", startW:"20–25 lb DBs", w8:"35–40 lb", w16:"50–55 lb",
        form:[
          "Long step forward. Back knee toward (not touching) floor. Front shin stays vertical.",
          "Drive through FRONT HEEL to step into the next lunge.",
          "Torso upright throughout — do NOT lean forward over the knee.",
        ],
        mistakes:["Front knee caving inward","Short stride (reduces glute activation)","Torso leaning too far forward"],
        tip:"Walking lunges spike heart rate more than almost any other resistance exercise. That cardiovascular spike is fat burning happening in real time.",
        advanced:"Week 9+: Reverse lunges on elevated platform. Week 13+: Bulgarian split squat.",
        beginner:"Stationary alternating lunges until balance is established.",
      },
      {
        name:"Lying Leg Curl (Machine)", priority:"B", muscle:"Hamstrings — Shortened Position Isolation",
        sets:3, reps:"12", rest:"75s", startW:"50–70 lb", w8:"80–100 lb", w16:"110–130 lb",
        form:[
          "Lie face down. Pad just above heels (not on calves).",
          "Curl legs all the way up — heels toward glutes. Full range.",
          "Lower SLOWLY — 3-second eccentric. Never drop the weight.",
        ],
        mistakes:["Hips rising off pad (reduces hamstring isolation)","Short range of motion","Fast uncontrolled eccentric"],
        tip:"Hamstrings need training from BOTH stretched position (RDL = hip hinge) AND shortened position (leg curl = knee flexion). Both are needed for full development.",
        advanced:"Week 9+: Single-leg lying curl — corrects imbalances between legs.",
        beginner:"Full range, light weight to start.",
      },
      {
        name:"Standing Calf Raise", priority:"C", muscle:"Gastrocnemius, Soleus",
        sets:3, reps:"15–20", rest:"45s", startW:"BW or 30–40 lb", w8:"60–80 lb", w16:"100–120 lb",
        form:[
          "Stand on a step or calf raise machine. Full range — all the way up, all the way below parallel.",
          "Pause 1 sec at top squeeze. 1 sec at full stretch at bottom.",
          "Slow throughout — calves respond to time under tension, not just heavy weight.",
        ],
        mistakes:["Partial range (bouncing in the middle)","Too fast"],
        tip:"Calves have 2 heads: gastrocnemius (knee straight = standing) and soleus (knee bent = seated). Train both for complete lower leg development.",
        advanced:"Week 9+: Seated calf raises added to hit the soleus.",
        beginner:"Bodyweight on a step at home is fine.",
      },
      {
        name:"Ab Wheel Rollout (Core — High Frequency)", priority:"A", muscle:"Full Core — Second Session This Week",
        sets:3, reps:"8–10", rest:"60s", startW:"From knees", w8:"12 reps from knees", w16:"Standing rollouts",
        form:[
          "Same form as Wednesday. Core trained twice weekly = faster visible ab development.",
          "Never let lower back sag. Control. Slow. Every rep matters.",
        ],
        mistakes:["Rushing","Lower back sagging"],
        tip:"Core responds strongly to frequency. Two sessions per week (Wed + Thu) produces measurably faster core development than training it once. The ab wheel is the tool.",
        advanced:"Work toward standing rollouts by week 12.",
        beginner:"Same as Wednesday version.",
      },
    ],
    cardio:{type:"Bike or Elliptical (Low Impact)", duration:"15 min", intensity:"Level 5–7 / conversational",
      timing:"Post-lifting", why:"After heavy legs, low-impact cardio flushes lactic acid from muscles (reduces soreness) while maintaining fat burning. Running after leg day stresses joints unnecessarily."},
    cooldown:["Quad stretch standing 30s each","Seated hamstring reach 60s each","Pigeon pose 45s each","Foam roll quads and IT band 3–4 min"],
  },
  {
    key:"FRI", label:"HIIT + Shoulders", sub:"Fat Incineration · Shoulder Priority",
    color:T.amber, emoji:"⚡", sessionTime:"60–70 min",
    overview:"HIIT burns calories for 18–24 hours after the session ends (EPOC afterburn effect). Paired with shoulder isolation, this is your fastest visual-change session. Shoulders built here create the wide masculine frame that defines the transformation.",
    warmup:["5-min light jog or bike","High knees 30 sec","Arm swings + shoulder circles 1 min","Dynamic lateral lunges 10 each"],
    exercises:[
      {
        name:"HIIT Treadmill Sprints", priority:"A", muscle:"Full Body Cardiovascular — 18–24hr Afterburn",
        sets:10, reps:"30 sec sprint / 30 sec walk", rest:"Built-in", startW:"Sprint: 8.0–8.5 mph / Walk: 3.0", w8:"Sprint: 9.0–9.5 mph", w16:"Sprint: 10.0+ mph",
        form:[
          "10 rounds × 60 sec = exactly 10 minutes of HIIT. Do this FIRST when energy is highest.",
          "Land mid-foot to forefoot — never heel strike. Arms pump actively. Stay tall.",
          "Sprint intervals = 9/10 effort — genuinely hard. Walk intervals = genuine recovery.",
        ],
        mistakes:["Going too fast early and failing by round 4 — start conservative","Gripping rails during sprints","Skipping walk recovery (adaptation happens during recovery, not sprinting)"],
        tip:"The EPOC afterburn from HIIT burns fat for the next 18–24 hours — including while you sleep. 10 minutes of HIIT produces more fat burning than 45 minutes of steady-state cardio.",
        advanced:"Week 9+: 12 rounds. Week 13+: Add 5–6% incline during sprint intervals.",
        beginner:"Start at 7.0–7.5 mph for sprints. Or bike HIIT: 30s max resistance / 30s easy.",
      },
      {
        name:"Arnold Press (Seated DB)", priority:"A", muscle:"All 3 Deltoid Heads — Complete Shoulder Width + Fullness",
        sets:4, reps:"10", rest:"90s", startW:"20–25 lb DBs", w8:"32–37 lb", w16:"45–50 lb",
        form:[
          "Sit 90° bench. DBs at chin height, palms facing YOU (post-curl position).",
          "Press and rotate — by full extension overhead, palms face AWAY. Full lockout.",
          "Return: reverse rotation — palms face in at chin height.",
        ],
        mistakes:["Rotation completing too early or late","Not reaching full lockout overhead"],
        tip:"The rotation hits all 3 delt heads through the full range. Superior to regular DB press for building round, full shoulders. Prioritize this on Friday shoulder day.",
        advanced:"Week 9+: Superset with cable lateral raises.",
        beginner:"Seated DB press without rotation while learning.",
      },
      {
        name:"Cable Lateral Raise (Single Arm)", priority:"A★", muscle:"Lateral Deltoid — Shoulder Width",
        sets:4, reps:"15 each arm", rest:"60s between sides", startW:"10–12 lb", w8:"18–22 lb", w16:"28–32 lb",
        form:[
          "Stand sideways. Cable at lowest. Raise to shoulder height leading with elbow.",
          "3-sec controlled return. Full constant tension throughout.",
        ],
        mistakes:["Swinging","Raising above shoulder level","Rushing"],
        tip:"Alternative lateral raises are the primary width builder. Do them twice weekly (Mon + Fri) for maximum lateral delt development.",
        advanced:"Week 9+: Drop set on final set.",
        beginner:"DB raises first 4 weeks.",
      },
      {
        name:"Rear Delt Fly (Bent-Over DB)", priority:"A", muscle:"Posterior Deltoid — 3D Shoulder Look",
        sets:4, reps:"15", rest:"60s", startW:"12–15 lb DBs", w8:"20–25 lb", w16:"28–32 lb",
        form:[
          "Sit at bench end, lean torso to chest-on-thighs. DBs hanging.",
          "Raise both arms to sides — elbows slightly bent, constant. Lead with elbows going BACK.",
          "Shoulder blades fully squeeze at top. Hold 2 seconds.",
        ],
        mistakes:["Swinging with momentum","Not reaching full arm elevation","Elbows bending too much"],
        tip:"Rear delts are the most chronically undertrained muscle. Building them gives the 3D boulder shoulder look from behind and from the side. Train them twice weekly.",
        advanced:"Week 9+: Cable rear delt fly (face-down on incline bench, constant tension).",
        beginner:"8–10 lb DBs. Form is everything here.",
      },
      {
        name:"Upright Row (Cable or BB)", priority:"B", muscle:"Lateral Delts, Upper Traps, Rear Delts",
        sets:3, reps:"12", rest:"60s", startW:"40–50 lb", w8:"60–70 lb", w16:"80–90 lb",
        form:[
          "Grip bar/cable at shoulder-width or slightly narrower.",
          "Pull to chin height. Elbows go WIDE and high — above the wrists.",
          "Controlled descent.",
        ],
        mistakes:["Narrow grip pulling elbows close to body (impingement risk)","Pulling past chin level"],
        tip:"Wide-grip upright rows emphasize the lateral delt rather than traps. A strong complement to lateral raises for building shoulder width.",
        advanced:"Week 9+: Cable upright rows for constant tension.",
        beginner:"Start with cookies or DBs instead of barbell.",
      },
      {
        name:"Heavy DB Shrug", priority:"B", muscle:"Upper Trapezius — Powerful Frame",
        sets:3, reps:"12", rest:"75s", startW:"50–60 lb DBs", w8:"75–80 lb", w16:"90–100 lb",
        form:[
          "DBs at sides. Shrug shoulders straight UP toward ears — pure elevation, no rolling.",
          "Hold 1–2 seconds at top. Lower with full control.",
        ],
        mistakes:["Rolling shoulders forward or backward (injury risk, not effective)","Partial range"],
        tip:"Developed upper traps create the look of a thick, powerful neck and upper back. Combined with wide lats and round shoulders, this completes the dominant masculine frame.",
        advanced:"Week 9+: Behind-the-back barbell shrug for mid-trap.",
        beginner:"Moderate weight, perfect form before loading heavy.",
      },
      {
        name:"Face Pull (End of Every Session)", priority:"A★", muscle:"Rear Delts, Rotator Cuff — EVERY SESSION",
        sets:3, reps:"20", rest:"45s", startW:"20–25 lb", w8:"30–35 lb", w16:"40–50 lb",
        form:["Rope at face height. Pull to face, elbows HIGH and WIDE. Hold 2 sec.","Light weight, high reps, perfect form every rep."],
        mistakes:["Too heavy","Elbows staying low"],
        tip:"End every single session with face pulls. Monday through Friday. Every week. Forever. This is your shoulder health insurance policy.",
        advanced:"Always 20 reps — this is maintenance, not progressive loading.",
        beginner:"Start here regardless of experience.",
      },
    ],
    cardio:{type:"HIIT Built Into Session + Optional Cooldown Walk", duration:"10 min HIIT + 10 min incline walk (optional)",
      intensity:"Max effort during HIIT / Easy walk after", timing:"HIIT first",
      why:"Highest calorie-burn session of the week. Estimated 500–700 total calories. EPOC burns fat for 18–24 hours after."},
    cooldown:["Shoulder cross-body stretch 45s each","Doorframe chest stretch 30s","Neck side stretch 20s each","Lying thoracic rotation 30s each"],
  },
  {
    key:"SAT", label:"Active Recovery", sub:"Light Movement · Mobility",
    color:T.teal, emoji:"🧘", sessionTime:"30–45 min optional",
    overview:"If you trained hard Mon–Fri, your muscles are rebuilding. Light session OR genuine rest — both are correct. Do NOT train to failure today. This day ensures Monday you're full of energy.",
    warmup:["10-min light walk or stretch"],
    exercises:[
      {
        name:"Outdoor Walk (Priority — do even if skipping gym)", priority:"A", muscle:"Fat Burn · Vitamin D · Mental Health",
        sets:1, reps:"30–45 min", rest:"—", startW:"Comfortable pace", w8:"Same", w16:"Weighted vest optional",
        form:["Walk outside in sunlight. Not on treadmill if possible."],
        mistakes:["Skipping entirely — even if skipping gym, do the walk"],
        tip:"Morning sunlight resets your circadian rhythm, boosts Vitamin D (critically low in most South Asians), and triggers natural fat-burning hormones. This is recovery AND physiology management.",
        advanced:"Add a 10–15 lb weighted vest.",
        beginner:"15 min is enough.",
      },
      {
        name:"Light Full Body Circuit (Optional)", priority:"C", muscle:"Active Recovery — Blood Flow",
        sets:3, reps:"12 each exercise", rest:"60s", startW:"40–50% of normal training weight", w8:"Same", w16:"Same",
        form:["Goblet squats + DB rows + push-ups. Nothing to failure. Stop 2–3 reps short."],
        mistakes:["Going heavy (defeats the purpose of recovery)","Training to failure"],
        tip:"Light movement on rest days increases blood flow delivering nutrients and removing waste from worked muscles — it literally speeds up recovery for Monday.",
        advanced:"Same always on Saturdays.",
        beginner:"Bodyweight only is perfect.",
      },
    ],
    cardio:{type:"Outdoor Walk", duration:"30–45 min", intensity:"Comfortable and conversational",
      timing:"Morning preferred", why:"Morning sunlight → serotonin → better sleep → better fat burning and recovery. The Saturday walk is your mental reset for the week."},
    cooldown:["15 min full-body stretch — hold every position 45–60 sec"],
  },
  {
    key:"SUN", label:"Rest + Prep", sub:"Complete Rest · Meal Prep",
    color:T.textDim, emoji:"🍳", sessionTime:"0 min gym",
    overview:"Muscle is built on rest days, not training days. Sunday rest makes Monday the strongest session of the week. The 90-minute meal prep you do today determines 80% of your nutrition success Mon–Thu.",
    warmup:[],
    exercises:[
      {
        name:"Full Week Meal Prep", priority:"A+", muscle:"80% of Nutritional Success Happens Here",
        sets:1, reps:"90 min in kitchen", rest:"—", startW:"Your kitchen", w8:"Same", w16:"Same",
        form:[
          "Cook 1–1.2 kg chicken (batch) — karahi, grilled, or plain sear. Portion 5 containers.",
          "Boil 12 eggs. Refrigerate UNPEELED — peel daily. Lasts 7 days.",
          "Cook large pot of masoor daal. Portion 3–4 lunches.",
          "Cook jasmine/basmati rice in bulk — 3 cups dry yields ~9 cups cooked. Refrigerate.",
          "Portion 5 snack bags: 30g roasted chana or almonds each (for work desk).",
          "Write week's meals in your notes app tonight. Decide Sunday, not at 6 AM.",
        ],
        mistakes:["Skipping prep → poor eating Mon–Thu → slow/no progress","Forgetting to batch-cook rice (most people forget this)"],
        tip:"The fridge you set up tonight is your nutrition for the entire work week. This 90 minutes is worth more than any supplement.",
        advanced:"Same every week.",
        beginner:"Start with chicken + rice + eggs only. Add daal in week 3.",
      },
      {
        name:"20-min Gentle Walk", priority:"B", muscle:"Light Movement, Digestion",
        sets:1, reps:"20 min", rest:"—", startW:"Easy stroll", w8:"Same", w16:"Same",
        form:["Not a workout. Just prevents total sedentary day. Around the neighborhood."],
        mistakes:["Turning into a run — rest is rest"],
        tip:"Gentle Sunday movement keeps metabolism slightly elevated without any recovery cost.",
        advanced:"Same.", beginner:"Same.",
      },
    ],
    cardio:{type:"Rest Day", duration:"20 min walk max", intensity:"Easy stroll",
      timing:"Any time", why:"True rest. Prioritize 8+ hours sleep Sunday night — Monday is your first session."},
    cooldown:["Pack gym bag","Lay out work clothes","Set alarm 30 min earlier","Review meal prep is complete"],
  },
];

/* ============================================================
   MEAL DATA — EXTENSIVELY EXPANDED OPTIONS
============================================================ */
const MEALS = [
  {
    id:"breakfast", label:"Breakfast", time:"5:30–6:30 AM", icon:"☀️", color:T.amber,
    note:"Your daily egg + chai habit is the anchor. Both chais (2% milk) are fully accounted for in daily totals.",
    options:[
      { name:"Masala Scrambled Eggs + Jasmine Rice", tag:"🇵🇰 Pakistani", cal:390, pro:24, time:"12 min", diff:"Easy",
        desc:"Your daily egg habit elevated. Spiced desi scrambled eggs over leftover jasmine rice.",
        ing:["3 large eggs","¾ cup cooked jasmine rice","½ onion","1 tomato","1 green chili","1 tsp oil","Spices"],
        steps:[{s:"Sauté",d:"Oil, cumin, onion, chili, tomato until soft."},{s:"Eggs",d:"Add eggs. Scramble on low heat until just set."}],
        notes:"Prep rice the night before from dinner leftovers.", swap:"No rice → 2 rice cakes or eggs alone." },
      { name:"Smoked Salmon + Egg Scramble", tag:"🐟 Seafood", cal:355, pro:38, time:"10 min", diff:"Easy",
        desc:"Smoked salmon is pre-cooked — zero extra effort. 38g protein. Best on heavy training days.",
        ing:["2 eggs + 2 egg whites","80g smoked salmon","¾ cup jasmine rice","1 tsp butter","Lemon + Dill"],
        steps:[{s:"Scramble",d:"Whisk eggs and whites. Cook gently in butter."},{s:"Fold",d:"Fold in smoked salmon strips right at the end off heat."}],
        notes:"Smoked salmon vacuum packs last weeks unopened.", swap:"Canned tuna drained + lemon instead of salmon." },
      { name:"Protein Oatmeal (Proats)", tag:"🥣 Sweet", cal:340, pro:32, time:"5 min", diff:"Zero effort",
        desc:"For days you don't want eggs. Fast digesting carbs + high protein.",
        ing:["1/2 cup rolled oats","1 scoop vanilla whey","1/2 cup almond milk","1/2 cup berries","Cinnamon"],
        steps:[{s:"Cook",d:"Microwave oats + water/almond milk for 90 seconds."},{s:"Protein",d:"Stir in whey protein AFTER cooking (never cook whey). Top with berries."}],
        notes:"Add more liquid if protein makes it too thick.", swap:"Use Greek yogurt instead of whey if preferred." },
      { name:"Shrimp Egg Fried Rice", tag:"🌏 Asian", cal:420, pro:42, time:"12 min", diff:"Medium",
        desc:"Restaurant quality in 12 min. MUST use cold day-old rice.",
        ing:["150g shrimp","2 eggs","1 cup COLD jasmine rice","Soy sauce","Sesame oil"],
        steps:[{s:"Eggs",d:"Scramble eggs, set aside."},{s:"Shrimp",d:"Sear shrimp 1 min per side, set aside."},{s:"Rice",d:"Fry cold rice, add soy, add everything back."}],
        notes:"COLD rice only — hot rice = mushy.", swap:"Leftover chicken instead of shrimp." },
      { name:"Greek Yogurt Power Bowl", tag:"🌍 Med", cal:310, pro:24, time:"3 min", diff:"Zero effort",
        desc:"Zero cooking. Highest protein-per-minute ratio. No-time safety net.",
        ing:["1 cup plain Greek yogurt","1 banana","20 almonds","Honey","Cinnamon"],
        steps:[{s:"Combine",d:"Layer yogurt, fruit, nuts, honey. Eat."}],
        notes:"PLAIN Greek yogurt only — flavored versions hide sugar.", swap:"Berries instead of banana." },
      { name:"Breakfast Burrito", tag:"🌯 Mexican", cal:410, pro:30, time:"10 min", diff:"Easy",
        desc:"Wrapped and portable. High protein start to the day.",
        ing:["1 whole wheat tortilla","3 eggs","1/4 cup black beans","2 tbsp salsa","1 tbsp low-fat cheese"],
        steps:[{s:"Scramble",d:"Cook eggs with black beans."},{s:"Wrap",d:"Place in tortilla with cheese and salsa. Toast on pan for 1 min."}],
        notes:"Can be pre-made and frozen.", swap:"Add turkey bacon or leftover chicken." },
      { name:"Besan Chilla (Chickpea Crepe)", tag:"🇵🇰 Desi Veg", cal:320, pro:22, time:"15 min", diff:"Medium",
        desc:"A savory, high-protein vegetarian breakfast using chickpea flour.",
        ing:["1/2 cup besan (chickpea flour)","Water","Chopped onion + tomato + chili","50g paneer or tofu grated","Spices"],
        steps:[{s:"Batter",d:"Mix besan, veggies, and water into a thin batter."},{s:"Cook",d:"Pour onto hot oiled pan like a crepe. Flip when bubbles form."},{s:"Stuff",d:"Fill with grated paneer and fold."}],
        notes:"High in dietary fiber.", swap:"Eat with mint chutney instead of ketchup." },
      { name:"Shakshuka (Eggs in Tomato)", tag:"🌍 Mid-East", cal:370, pro:22, time:"18 min", diff:"Medium",
        desc:"Eggs poached in spiced tomato sauce. One pan.",
        ing:["3 eggs","Crushed tomatoes","Onion + Garlic + Bell pepper","Cumin + Paprika"],
        steps:[{s:"Sauce",d:"Sauté veg, add tomatoes & spices, simmer."},{s:"Poach",d:"Make wells, crack eggs in, cover and poach 5 mins."}],
        notes:"Great for weekends.", swap:"Masala scrambled eggs (faster)." },
      { name:"Korean-Style Egg Rice Bowl", tag:"🇰🇷 Korean", cal:380, pro:26, time:"10 min", diff:"Easy",
        desc:"Bibimbap-inspired bowl — fried egg over seasoned rice.",
        ing:["2 eggs","1 cup jasmine rice","Soy sauce + Sesame oil + Sriracha","Green onions"],
        steps:[{s:"Sauce",d:"Mix soy, sesame, sriracha."},{s:"Assemble",d:"Top warm rice with sunny-side up eggs, drizzle sauce."}],
        notes:"Gochujang is better than sriracha if you have it.", swap:"Scramble eggs instead of frying." },
      { name:"Cottage Cheese & Fruit", tag:"🥛 Dairy", cal:280, pro:28, time:"2 min", diff:"Zero effort",
        desc:"A powerhouse of casein protein, very quick and filling.",
        ing:["1 cup low-fat cottage cheese","1/2 cup pineapple or peaches","10 walnuts"],
        steps:[{s:"Mix",d:"Combine cottage cheese and fruit in a bowl. Top with walnuts."}],
        notes:"Cottage cheese is an acquired texture, but elite for macros.", swap:"Greek yogurt if you hate cottage cheese." },
      { name:"Protein Overnight Rice Pudding", tag:"⚡ Prep", cal:360, pro:28, time:"5 min prep", diff:"Zero effort",
        desc:"Prep in 5 min the night before. Morning: open and eat.",
        ing:["½ cup cooked rice","1 cup milk","1 scoop whey protein","Chia seeds","Banana"],
        steps:[{s:"Mix",d:"Combine all in a jar, refrigerate overnight."}],
        notes:"Eaten cold like pudding.", swap:"Oats instead of rice." },
      { name:"Desi Omelette + Jasmine Rice", tag:"🇵🇰 Pakistani", cal:360, pro:26, time:"10 min", diff:"Easy",
        desc:"Classic Pakistani omelette with rice instead of paratha.",
        ing:["3 eggs","Onion, tomato, chili, coriander","Cumin, salt, pepper","¾ cup jasmine rice"],
        steps:[{s:"Omelette",d:"Whisk eggs with veggies. Fry until golden."}],
        notes:"Keep tomatoes minimal so it flips easily.", swap:"Add leftover chicken to the eggs." }
    ]
  },
  {
    id:"lunch", label:"Lunch", time:"12:00–1:00 PM", icon:"🍱", color:T.green,
    note:"Pack from Sunday prep. High protein, rice-based. Reheats in 90 sec at work. Prep the night before.",
    options:[
      { name:"Garlic Butter Shrimp Bowl", tag:"🌍 Int'l", cal:500, pro:46, time:"18 min", diff:"Easy",
        desc:"Garlic butter sauce soaks into rice overnight — even better the next day.",
        ing:["200g shrimp","1 cup jasmine rice","Garlic + Butter + Lemon + Paprika"],
        steps:[{s:"Sear",d:"Sear shrimp 1 min per side in butter. Remove."},{s:"Sauce",d:"Garlic, lemon, butter in pan. Toss shrimp back in."}],
        notes:"Thaw shrimp overnight in fridge.", swap:"Salmon or chicken breast instead of shrimp." },
      { name:"Teriyaki Salmon Bowl", tag:"🇯🇵 Japanese", cal:520, pro:46, time:"20 min", diff:"Easy",
        desc:"Teriyaki glaze takes 2 minutes to make and transforms the meal.",
        ing:["170g salmon fillet","1 cup jasmine rice","Soy sauce + Honey + Sesame oil + Ginger"],
        steps:[{s:"Sear",d:"Skin down 4 min, flip 2 min."},{s:"Glaze",d:"Pour soy/honey mix into pan, bubble 30s."}],
        notes:"Reheat MAX 60 sec in microwave.", swap:"Chicken or shrimp." },
      { name:"Chicken Karahi (Batch)", tag:"🇵🇰 Pakistani", cal:460, pro:48, time:"30 min batch", diff:"Easy batch",
        desc:"Cook Sunday. Eat Mon–Wed lunch with zero weekday cooking.",
        ing:["1 kg chicken thighs","Tomatoes + Onion + Ginger/Garlic","Cumin + Coriander + Chili + Garam Masala"],
        steps:[{s:"Sear",d:"Brown chicken."},{s:"Bhunna",d:"Cook tomatoes & spices until oil separates completely."}],
        notes:"Thighs reheat much better than breasts.", swap:"Beef or paneer." },
      { name:"Chicken Tikka Wrap", tag:"🌯 Portable", cal:450, pro:40, time:"10 min", diff:"Easy",
        desc:"Great when you don't want to use a fork or sit down.",
        ing:["Leftover chicken breast/thighs","Whole wheat wrap/roti","Mint yogurt (dahi + mint)","Cucumber & Onion"],
        steps:[{s:"Assemble",d:"Spread mint yogurt on wrap. Add sliced chicken and veggies. Roll tight."}],
        notes:"Keep the sauce separate until eating to prevent sogginess.", swap:"Tuna instead of chicken." },
      { name:"Spicy Tuna Rice Bowl", tag:"⚡ Emergency", cal:380, pro:38, time:"5 min", diff:"Zero effort",
        desc:"The no-excuse desk lunch. Keep tuna cans at your desk permanently.",
        ing:["1 can tuna (drained)","1 cup pre-cooked rice","Sriracha + Mayo + Soy sauce + Cucumber"],
        steps:[{s:"Mix",d:"Mix tuna with sauces, place over rice and veggies."}],
        notes:"Zero refrigeration needed for ingredients.", swap:"Tuna + dahi + cumin for a desi twist." },
      { name:"Masoor Daal + Basmati", tag:"🇵🇰 Pakistani", cal:390, pro:22, time:"25 min batch", diff:"Easy batch",
        desc:"The original Pakistani muscle food. Add boiled eggs for +12g protein.",
        ing:["1 cup masoor daal","Onion + Tomato + Garlic","Cumin + Turmeric","Basmati rice"],
        steps:[{s:"Boil",d:"Boil daal until mushy."},{s:"Tarka",d:"Fry spices/veg and pour into daal."}],
        notes:"Add 2 boiled eggs alongside to hit protein targets.", swap:"Add canned chickpeas." },
      { name:"Quinoa Salad w/ Halloumi", tag:"🥗 Med", cal:440, pro:25, time:"15 min", diff:"Medium",
        desc:"Lighter lunch option packed with complete plant/dairy protein.",
        ing:["1 cup cooked quinoa","50g grilled halloumi cheese","Cucumber, cherry tomatoes, olives","Olive oil + Lemon"],
        steps:[{s:"Chop",d:"Dice veggies."},{s:"Grill",d:"Pan fry halloumi 2 min per side."},{s:"Mix",d:"Toss everything with oil and lemon."}],
        notes:"Quinoa is a complete protein.", swap:"Grilled chicken instead of halloumi." },
      { name:"Korean Beef Rice Bowl", tag:"🇰🇷 Korean", cal:510, pro:44, time:"20 min", diff:"Easy",
        desc:"Ground beef with Korean bulgogi-style marinade.",
        ing:["200g lean ground beef","Jasmine rice","Soy sauce + Honey + Sesame oil + Garlic"],
        steps:[{s:"Brown",d:"Cook beef."},{s:"Glaze",d:"Pour sauce over beef and simmer 2 min."}],
        notes:"Very fast to batch cook.", swap:"Ground turkey or chicken." },
      { name:"Thai Basil Shrimp Rice", tag:"🇹🇭 Thai", cal:460, pro:42, time:"15 min", diff:"Medium",
        desc:"Explosively good flavor with minimal ingredients.",
        ing:["200g shrimp","Jasmine rice","Oyster sauce + Soy sauce","Fresh basil + Garlic + Chili"],
        steps:[{s:"Stir Fry",d:"Cook garlic/chili, add shrimp. Add sauces. Stir in basil off heat."}],
        notes:"Basil must go in OFF heat or it burns.", swap:"Thinly sliced chicken breast." },
      { name:"Lentil & Vegetable Soup", tag:"🥣 Batch", cal:350, pro:24, time:"40 min batch", diff:"Easy batch",
        desc:"A thick, hearty, high-volume lunch that keeps you full for hours.",
        ing:["Brown lentils","Carrots, celery, onions","Bone broth or stock","Spinach stirred in at end"],
        steps:[{s:"Simmer",d:"Boil all ingredients together until lentils are tender (about 30 mins)."}],
        notes:"Very high volume (fills the stomach) for low calories.", swap:"Add shredded chicken." },
      { name:"Mediterranean Chicken Bowl", tag:"🌍 Med", cal:480, pro:46, time:"20 min", diff:"Easy",
        desc:"Vibrant flavors. Doesn't taste like diet food.",
        ing:["200g chicken breast","Jasmine rice","Chickpeas","Dahi + Garlic + Lemon sauce"],
        steps:[{s:"Sear",d:"Cook spiced chicken."},{s:"Bowl",d:"Layer rice, chicken, chickpeas, drizzle dahi sauce."}],
        notes:"Assemble fresh daily from prepped items.", swap:"Tuna instead of chicken." },
      { name:"Tuna Pasta Salad", tag:"🍝 Cold Prep", cal:460, pro:35, time:"15 min", diff:"Easy",
        desc:"Eat cold straight out of the fridge. Refreshing and filling.",
        ing:["2 oz protein pasta (Banza/Barilla)","1 can tuna","2 tbsp Greek yogurt (replaces mayo)","Celery, red onion, dill"],
        steps:[{s:"Boil",d:"Cook and chill pasta."},{s:"Mix",d:"Stir everything together with salt/pepper."}],
        notes:"Greek yogurt provides the creamy texture with massive protein.", swap:"Canned chicken." }
    ]
  },
  {
    id:"snack", label:"Snack", time:"3:30–4:00 PM", icon:"☕", color:T.amber,
    note:"Your second daily chai. Keep this habit. Pair with protein to bridge to dinner.",
    options:[
      { name:"Chai + Eggs + Roasted Chana", tag:"🇵🇰 Pakistani", cal:285, pro:22, time:"0 min", diff:"Zero effort",
        desc:"Your existing afternoon habit. Optimized.",
        ing:["2 boiled eggs","30g roasted chana","1 cup chai (½ cup 2% milk)"],
        steps:[{s:"Eat",d:"Peel pre-boiled eggs at desk. Snack on chana. Drink chai."}],
        notes:"Keep chana in desk drawer.", swap:"Almonds instead of chana." },
      { name:"Chai + Greek Yogurt + Almonds", tag:"🌍 Med", cal:270, pro:20, time:"1 min", diff:"Zero effort",
        desc:"Creamy, high casein protein = sustained release.",
        ing:["¾ cup plain Greek yogurt","20 almonds","Cinnamon"],
        steps:[{s:"Mix",d:"Combine and eat alongside chai."}],
        notes:"Plain only — flavored has 20g+ hidden sugar.", swap:"Dahi with nuts." },
      { name:"Apple & Peanut Butter", tag:"🍏 Classic", cal:250, pro:8, time:"1 min", diff:"Zero effort",
        desc:"The perfect pre-workout energy carb with healthy fats.",
        ing:["1 large crisp apple","1.5 tbsp natural peanut butter"],
        steps:[{s:"Slice",d:"Slice apple, dip in peanut butter."}],
        notes:"Use natural PB (just peanuts and salt).", swap:"Almond butter." },
      { name:"Spicy Tuna Rice Cakes", tag:"🌍 Int'l", cal:230, pro:28, time:"3 min", diff:"Zero effort",
        desc:"Light, high-protein. When not hungry but need protein.",
        ing:["½ can tuna","4 plain rice cakes","Mustard or hot sauce"],
        steps:[{s:"Stack",d:"Mix tuna with mustard, put on rice cakes."}],
        notes:"Keep rice cakes at desk.", swap:"Cottage cheese on rice cakes." },
      { name:"Roasted Makhana & Green Tea", tag:"🌏 Asian", cal:150, pro:5, time:"5 min", diff:"Easy",
        desc:"Extremely low calorie, high volume crunch.",
        ing:["2 cups Makhana (Fox nuts)","1 tsp ghee","Salt + Pepper","Green Tea"],
        steps:[{s:"Roast",d:"Roast makhana in ghee on low heat until crunchy."}],
        notes:"Great when you just want to snack but have low calories left.", swap:"Air popped popcorn." },
      { name:"Protein Shake + Almonds", tag:"⚡ Quick", cal:265, pro:30, time:"1 min", diff:"Zero effort",
        desc:"Fastest protein hit between meetings.",
        ing:["1 scoop whey protein","Water or milk","15 almonds"],
        steps:[{s:"Shake",d:"Shake protein, eat nuts."}],
        notes:"Whey + water = faster absorption.", swap:"3 boiled eggs." },
      { name:"Cottage Cheese & Cucumber", tag:"🥒 Fresh", cal:180, pro:25, time:"2 min", diff:"Zero effort",
        desc:"Savory, refreshing, massive protein hit.",
        ing:["1 cup low fat cottage cheese","1/2 sliced cucumber","Everything Bagel Seasoning or Black Pepper"],
        steps:[{s:"Dip",d:"Use cucumber slices to dip into cottage cheese."}],
        notes:"Very hydrating.", swap:"Carrot sticks." },
      { name:"Edamame + Boiled Eggs", tag:"🌏 Asian", cal:260, pro:24, time:"2 min", diff:"Zero effort",
        desc:"Edamame is one of the best plant proteins.",
        ing:["1 cup frozen shelled edamame","2 boiled eggs","Sea salt + lemon"],
        steps:[{s:"Microwave",d:"Microwave edamame 2 min. Eat with eggs."}],
        notes:"Keep a bag in the freezer at work.", swap:"Roasted chickpeas." },
      { name:"Protein Bar & Black Coffee", tag:"🍫 On-the-go", cal:200, pro:20, time:"0 min", diff:"Zero effort",
        desc:"For when you are literally walking between locations.",
        ing:["1 high quality protein bar (Quest, Barebells)","1 Black Coffee (Iced or Hot)"],
        steps:[{s:"Eat",d:"Unwrap and consume."}],
        notes:"Check labels to ensure <5g added sugar.", swap:"Beef jerky." },
      { name:"Avocado + Egg Rice Cake", tag:"🌍 Int'l", cal:310, pro:16, time:"3 min", diff:"Easy",
        desc:"Healthy fats support testosterone production.",
        ing:["½ avocado","2 boiled eggs","4 rice cakes","Chili flakes"],
        steps:[{s:"Mash",d:"Mash avocado, top with sliced egg on rice cakes."}],
        notes:"Best on rest days.", swap:"Eggs + hot sauce alone." },
      { name:"Hummus & Carrot Sticks", tag:"🥕 Vegan", cal:220, pro:6, time:"1 min", diff:"Zero effort",
        desc:"Fiber rich, good fats, satisfying crunch.",
        ing:["1/3 cup hummus","1 cup baby carrots or celery"],
        steps:[{s:"Dip",d:"Eat."}],
        notes:"Good source of pre-workout carbs.", swap:"Guacamole." }
    ]
  },
  {
    id:"dinner", label:"Dinner", time:"6:30–7:30 PM", icon:"🍽️", color:T.red,
    note:"Most important meal. Eat within 60 min of finishing training. Biggest protein meal.",
    options:[
      { name:"Honey Garlic Salmon + Rice + Broccoli", tag:"🌍 Int'l", cal:570, pro:48, time:"22 min", diff:"Easy",
        desc:"Restaurant quality in 22 minutes post-workout.",
        ing:["200g salmon","1 cup jasmine rice","Soy sauce + Honey + Garlic + Butter","2 cups broccoli"],
        steps:[{s:"Sear",d:"Sear salmon 4 min skin side, 2 min flesh side."},{s:"Glaze",d:"Add sauce, baste salmon. Serve over rice and broccoli."}],
        notes:"Skin-on salmon is cheaper and healthy.", swap:"Chicken breast (7 min/side)." },
      { name:"Prawn Masala + Basmati", tag:"🇵🇰 Pakistani", cal:490, pro:45, time:"25 min", diff:"Medium",
        desc:"Classic Pakistani jhinga masala. The bhunna step is key.",
        ing:["250g shrimp","1 cup basmati","Onion + Tomato + Garlic/Ginger","Spices"],
        steps:[{s:"Bhunna",d:"Cook masala until oil separates completely."},{s:"Shrimp",d:"Add shrimp 2 min per side."}],
        notes:"Never rush the oil separation step.", swap:"Chicken, beef, or paneer." },
      { name:"Palak Paneer (or Chicken)", tag:"🇵🇰 Desi", cal:520, pro:35, time:"30 min", diff:"Medium",
        desc:"High iron, creamy texture without the heavy cream.",
        ing:["2 cups spinach pureed","100g Paneer (or 200g Chicken)","Onion + Tomato + Spices","1 tbsp Greek Yogurt (instead of cream)"],
        steps:[{s:"Masala",d:"Fry spices, add spinach puree, simmer."},{s:"Protein",d:"Add grilled paneer/chicken. Stir in yogurt off heat."}],
        notes:"Using Greek yogurt at the end mimics heavy cream perfectly.", swap:"Tofu instead of Paneer." },
      { name:"Shrimp Stir-Fry + Rice", tag:"🌏 Asian", cal:450, pro:43, time:"18 min", diff:"Medium",
        desc:"Full color, fast cook. Best vegetable-heavy dinner.",
        ing:["200g shrimp","1 cup jasmine rice","Broccoli + Bell pepper + Snap peas","Oyster + Soy + Sesame oil"],
        steps:[{s:"MAX HEAT",d:"Stir fry veg 2 min. Add shrimp 2 min. Add sauce + cornstarch slurry."}],
        notes:"Eat immediately, doesn't store well.", swap:"Thinly sliced chicken." },
      { name:"Turkey Meatballs + Zucchini Noodles", tag:"🍝 Low Carb", cal:400, pro:45, time:"25 min", diff:"Easy",
        desc:"Massive volume for very low calories. Highly satiating.",
        ing:["200g lean ground turkey","1 jar Marinara sauce (no added sugar)","2 large zucchinis spiralized","Parmesan cheese"],
        steps:[{s:"Meatballs",d:"Form and pan-fry turkey meatballs."},{s:"Simmer",d:"Simmer in marinara. Toss raw zoodles in hot sauce for 1 min (don't overcook)."}],
        notes:"Zoodles get mushy if cooked longer than 60 seconds.", swap:"Normal pasta on heavy training days." },
      { name:"Beef Keema + Basmati", tag:"🇵🇰 Pakistani", cal:530, pro:47, time:"30 min", diff:"Easy",
        desc:"Lean ground beef with peas, desi-style. Natural creatine.",
        ing:["200g lean ground beef (90/10)","1 cup basmati","½ cup peas","Onion + Tomato + Spices"],
        steps:[{s:"Brown",d:"Brown beef."},{s:"Bhunna",d:"Add aromatics, tomatoes, spices. Cook until oil separates. Add peas."}],
        notes:"Lean 90/10 beef is best.", swap:"Ground chicken." },
      { name:"Chicken Fajita Skillet", tag:"🌯 Mexican", cal:450, pro:50, time:"20 min", diff:"Easy",
        desc:"Sizzling, colorful, and packed with lean protein.",
        ing:["200g chicken breast sliced","2 bell peppers sliced","1 onion sliced","Fajita seasoning (Cumin/Chili/Garlic)","1 Tortilla or Rice"],
        steps:[{s:"Sear",d:"Sear spiced chicken strips on high heat. Remove."},{s:"Veg",d:"Char peppers and onions. Combine."}],
        notes:"Very fast cleanup (one pan).", swap:"Steak strips." },
      { name:"Chipotle-Style Bowl", tag:"🌎 Tex-Mex", cal:520, pro:52, time:"20 min", diff:"Easy",
        desc:"Feels like eating out. Doesn't feel like diet food.",
        ing:["200g chicken breast","1 cup rice","Chickpeas","Dahi (as sour cream)","Salsa + Avocado"],
        steps:[{s:"Assemble",d:"Layer rice, spiced seared chicken, salsa, avocado, dahi."}],
        notes:"Cook double chicken for next day.", swap:"Shrimp or tuna." },
      { name:"Tofu & Broccoli Peanut Stir Fry", tag:"🥦 Vegan", cal:480, pro:25, time:"20 min", diff:"Medium",
        desc:"A plant-based break for your digestion.",
        ing:["200g extra firm tofu (pressed)","Broccoli florets","Peanut sauce (PB + Soy + Lime + Sriracha)","Rice"],
        steps:[{s:"Crisp Tofu",d:"Cube tofu, toss in cornstarch, pan fry until crispy."},{s:"Sauce",d:"Steam broccoli, mix everything with peanut sauce."}],
        notes:"Pressing tofu for 15 mins makes it much crispy.", swap:"Chicken breast instead of tofu." },
      { name:"Thai Shrimp Coconut Curry", tag:"🇹🇭 Thai", cal:480, pro:40, time:"25 min", diff:"Medium",
        desc:"Creamy, aromatic, deeply satisfying.",
        ing:["200g shrimp","1 cup rice","Light coconut milk","Thai curry paste","Bell pepper + Spinach"],
        steps:[{s:"Simmer",d:"Fry paste, add coconut milk, simmer veg."},{s:"Shrimp",d:"Add shrimp last 3 mins."}],
        notes:"Use light coconut milk.", swap:"Chicken breast." },
      { name:"Baked Cod/Tilapia & Sweet Potato", tag:"🐟 Classic Fit", cal:420, pro:40, time:"30 min", diff:"Easy",
        desc:"The classic bodybuilder meal, but seasoned well.",
        ing:["200g white fish (Cod/Tilapia/Halibut)","1 medium sweet potato","Asparagus","Lemon + Paprika + Garlic powder"],
        steps:[{s:"Bake",d:"Cube sweet potato, roast at 400F for 15 mins. Add seasoned fish and asparagus to pan, bake another 12-15 mins."}],
        notes:"Only one pan to wash.", swap:"Salmon (add 100 calories for healthy fats)." },
      { name:"Emergency Egg Fried Rice", tag:"⚡ 10 Min", cal:390, pro:26, time:"10 min", diff:"Easy",
        desc:"For exhausted nights. Eggs + cold rice = complete meal.",
        ing:["3 eggs","1 cup COLD rice","Soy sauce + Sesame oil","Green onions"],
        steps:[{s:"Fry",d:"Scramble eggs, fry cold rice, mix."}],
        notes:"COLD rice only.", swap:"Add any leftover meat." }
    ]
  },
  {
    id:"closing", label:"Closing", time:"8:30–9:00 PM", icon:"🌙", color:T.blue,
    note:"Light, protein-focused. Eating window CLOSES here. Water, black chai, or black coffee only after 9:30 PM.",
    options:[
      { name:"Dahi + Walnuts", tag:"🇵🇰 Pakistani", cal:210, pro:12, time:"1 min", diff:"Zero effort",
        desc:"Classic closer. Casein protein digests slowly overnight.",
        ing:["1 cup plain dahi","15–20 walnuts","Cinnamon or 1 tsp honey"],
        steps:[{s:"Combine",d:"Dahi in bowl. Nuts on top. Eat slowly."}],
        notes:"Nothing after 9:30 PM.", swap:"2 boiled eggs." },
      { name:"Whey Shake (2% Milk)", tag:"⚡ Quick", cal:235, pro:32, time:"1 min", diff:"Zero effort",
        desc:"If dinner was light, this fills the protein gap before bed.",
        ing:["1 scoop whey protein","250ml 2% milk"],
        steps:[{s:"Shake",d:"Milk first, then powder. Shake."}],
        notes:"Milk adds casein to the whey.", swap:"Water if out of calories." },
      { name:"Chamomile Tea & Magnesium", tag:"🍵 Sleep", cal:0, pro:0, time:"5 min", diff:"Zero effort",
        desc:"If you hit your protein target at dinner, optimize sleep.",
        ing:["1 Chamomile Tea bag","400mg Magnesium Glycinate supplement"],
        steps:[{s:"Brew",d:"Steep tea for 5 mins. Take magnesium."}],
        notes:"Magnesium Glycinate drastically improves deep sleep.", swap:"Peppermint tea." },
      { name:"Boiled Eggs + Light Chai", tag:"🇵🇰 Pakistani", cal:200, pro:18, time:"2 min", diff:"Zero effort",
        desc:"Your familiar evening ritual. UNSWEETENED chai.",
        ing:["2 pre-boiled eggs","1 cup chai (unsweetened)"],
        steps:[{s:"Eat",d:"Peel eggs, brew chai."}],
        notes:"Be in bed within 90 min of this.", swap:"Warm milk." },
      { name:"Cottage Cheese & Almonds", tag:"🥛 Casein", cal:220, pro:25, time:"1 min", diff:"Zero effort",
        desc:"The absolute best pre-bed muscle food.",
        ing:["3/4 cup cottage cheese","10 almonds"],
        steps:[{s:"Mix",d:"Combine and eat."}],
        notes:"Feeds muscles for 6+ hours while sleeping.", swap:"Greek yogurt." },
      { name:"Sugar-Free Jello & Greek Yogurt", tag:"🍮 Dessert", cal:120, pro:15, time:"2 min", diff:"Easy",
        desc:"Feels like dessert, effectively zero calories + protein.",
        ing:["1 cup sugar-free Jello (pre-made)","1/2 cup Greek yogurt"],
        steps:[{s:"Layer",d:"Put yogurt over jello."}],
        notes:"Kills a sweet tooth instantly.", swap:"Diet soda (though worse for sleep)." },
      { name:"Golden Milk (Haldi Doodh)", tag:"🇵🇰 Recovery", cal:130, pro:8, time:"5 min", diff:"Easy",
        desc:"Anti-inflammatory, improves sleep quality, soothes joints.",
        ing:["1 cup warm 2% milk","1/2 tsp Turmeric (Haldi)","Pinch black pepper (activates turmeric)","1/2 tsp honey"],
        steps:[{s:"Warm",d:"Warm milk on stove, whisk in spices and honey."}],
        notes:"Black pepper is required to absorb the curcumin in turmeric.", swap:"Skip honey to save calories." },
      { name:"Casein Yogurt Pudding", tag:"🍫 Treat", cal:220, pro:22, time:"2 min", diff:"Zero effort",
        desc:"Tastes like chocolate mousse, hits protein goals.",
        ing:["1 cup plain Greek yogurt","1 tsp cocoa powder","1 tsp honey"],
        steps:[{s:"Mix",d:"Stir until smooth and creamy."}],
        notes:"Use unsweetened cocoa powder.", swap:"Dahi + cocoa." }
    ]
  },
];

/* ============================================================
   SUPPLEMENTS
============================================================ */
const SUPPS = [
  { name:"Whey Protein", tier:"Essential", tc:T.red, timing:"Within 60 min post-workout", dose:"1 scoop (25g protein)",
    why:"Fastest absorbing protein. Hits muscles during the critical recovery window. Replaceable with 3 eggs but far more convenient.", brand:"Optimum Nutrition Gold Standard. Any reputable brand works." },
  { name:"Creatine Monohydrate", tier:"Essential", tc:T.red, timing:"Daily, any time — consistency matters", dose:"5g/day (1 tsp)",
    why:"Most researched supplement in existence. Proven 5–15% strength increase. Increases muscle size by pulling water into cells. Effects accumulate over weeks — never skip days.", brand:"Pure monohydrate, unflavored, micronized. No loading phase needed." },
  { name:"Vitamin D3 + K2", tier:"High Priority", tc:T.amber, timing:"Morning with food (fat-soluble)", dose:"2,000–5,000 IU D3 + 100mcg K2",
    why:"Over 70% of South Asians are clinically deficient. Low D3 = low testosterone + low energy + impaired fat loss. K2 directs calcium to bones, not arteries.", brand:"Combined D3+K2 supplement. Any brand." },
  { name:"Fish Oil (Omega-3)", tier:"High Priority", tc:T.amber, timing:"With any meal", dose:"2–3g EPA+DHA daily (check label)",
    why:"Reduces exercise-induced inflammation, supports joint health, improves insulin sensitivity, and directly increases fat oxidation.", brand:"Enteric-coated prevents fish burps. Nordic Naturals or any pharmaceutical grade." },
  { name:"Magnesium Glycinate", tier:"Moderate", tc:T.textMuted, timing:"Before bed", dose:"200–400mg",
    why:"Critical for muscle relaxation and sleep quality. Most people are deficient. Improves deep sleep (when GH peaks), reduces cramps, speeds recovery.", brand:"Must be GLYCINATE specifically — other forms cause digestive issues." },
  { name:"Multivitamin", tier:"Moderate", tc:T.textMuted, timing:"Morning with food", dose:"1 tablet daily",
    why:"Training hard + caloric deficit = micronutrient depletion risk. Fills gaps. Not a food substitute.", brand:"Look for methylated B vitamins (methylfolate not folic acid) for South Asian genetics." },
  { name:"Zinc", tier:"Optional", tc:T.textDim, timing:"Night with food", dose:"15–25mg",
    why:"Directly involved in testosterone production. Athletes deplete zinc through sweat.", brand:"Zinc picolinate for best absorption." },
];

/* ============================================================
   RULES + FAQ
============================================================ */
const RULES = {
  training:[
    "Never skip Tuesday Pull Day — this single session builds the V-taper that changes your entire silhouette.",
    "Progressive overload every session — add weight, reps, or sets. Same thing as last week = zero adaptation.",
    "Log every lift. You cannot improve what you don't track. Notes app is enough.",
    "Form first, weight second — always. Lighter weight with perfect form builds more muscle.",
    "Warm-up is not optional — 8 minutes prevents months of injury setback.",
    "Face pulls at the end of EVERY session, every week, forever. Non-negotiable shoulder insurance.",
    "Never train the same muscle group on consecutive days without 48 hours recovery between.",
    "Deload every 8 weeks — reduce weight 20%, same sets and reps. Required for continued progress.",
    "The last 2 reps of every set should be genuinely difficult. If set 4 feels easy, add weight.",
    "Sleep is when muscle is built. Training is the stimulus. Without sleep, training produces diminishing returns.",
    "Cardio enhances fat loss but never replaces lifting. Muscle burns fat 24/7. Cardio only burns during activity.",
    "Rest days are growth days. Muscles build during recovery, not during training.",
  ],
  nutrition:[
    "Hit 180g+ protein daily — non-negotiable. Every other variable is secondary to this number.",
    "Close the eating window by 9:30 PM every night. IF works through consistency, not occasional effort.",
    "Drink 3–4 liters of water daily. Fat metabolism requires hydration. Urine = pale yellow.",
    "Meal prep Sunday — 90 minutes prevents 5 days of poor decisions under work stress.",
    "Rice portions: ¾–1 cup cooked at lunch, ¾ cup at dinner. This keeps carbs in the optimal range.",
    "Your 2 daily chais with 2% milk are fully built into the plan. Keep them. Habit = consistency.",
    "Eat vegetables at every dinner. Any sabzi, broccoli, cucumber, spinach. Volume + micronutrients.",
    "Healthy fat ≠ body fat. Avocado, walnuts, olive oil, salmon — eat them. They support testosterone.",
    "Never go more than 5 hours without protein during your eating window.",
    "Roti is fine occasionally — it is not the enemy. 1 roti = ~120 cal, 4g protein. Adjust rice accordingly.",
    "One social meal per week: relax, enjoy, return to plan the next meal. One meal never breaks progress.",
  ],
  lifestyle:[
    "7–8 hours sleep = when growth hormone peaks and fat burns. The transformation literally happens while sleeping.",
    "10,000 steps daily. Walk at lunch, take stairs. Burns 350–400 extra calories with zero gym time.",
    "Chronic stress → high cortisol → belly fat storage. Stress management is a fat-loss strategy.",
    "Progress photos every 2 weeks, same conditions. Mirror perception is unreliable day-to-day.",
    "Measure waist with tape weekly. More accurate than scale weight for fat loss progress.",
    "Scale fluctuates 2–5 lbs daily. Weigh weekly, same day, same time, post-bathroom.",
    "Morning sunlight within 30 min of waking resets circadian rhythm and improves sleep quality.",
    "Vitamin D from sunlight is poorly synthesized in South Asian skin — supplement D3 regardless.",
    "Alcohol impairs muscle recovery and fat loss significantly. Limit to rare occasions.",
    "Timeline: 2–3 inches off waist by week 8. Visible back + shoulder muscle by week 10–12. Dramatic change by week 16–20.",
  ],
};

const FAQS = [
  {q:"Why am I not losing weight on the scale?",a:"Body weight fluctuates 2–5 lbs daily from water, sodium, digestion, and muscle glycogen. Measure weekly — same day, same time. More importantly: measure your waist with a tape. You may be building muscle AND losing fat simultaneously (body recomposition) — the scale shows neither correctly. Trust the tape and progress photos over 4+ weeks of data."},
  {q:"My chest fat isn't moving — why?",a:"Chest and belly fat are the last to go for most men due to higher fat cell density and cortisol sensitivity in these regions. The solution: consistent caloric deficit (fat loss) + building chest muscle underneath (which lifts and tightens before fat is fully gone). By month 3–4 of consistent training, the visual change will be dramatic."},
  {q:"How do I know if I'm eating too little?",a:"Signs: extreme training fatigue beyond normal effort, significant strength loss week-over-week, poor sleep despite tiredness, brain fog, and irritability. If these appear, add 150–200 calories (one extra rice portion or protein shake). The accelerated plan (1,800 cal) should feel challenging — not destroying."},
  {q:"Can I eat roti or paratha?",a:"Absolutely. Roti is not the enemy — overconsumption is. 1 whole wheat roti = ~120 cal, 4g protein. 1 paratha = 200–250 cal. On days you eat roti, reduce rice at that meal accordingly. Once-a-week paratha on a weekend morning is completely compatible."},
  {q:"What if I miss a workout?",a:"Miss one → continue from the next scheduled session. Do NOT try to 'make it up' — doubling sessions leads to overtraining. One missed session costs almost nothing over a 16-week plan. Consistency over months matters. Perfection in any given week is irrelevant."},
  {q:"How wide will my back get?",a:"Visible lat development begins around week 6–8 with consistent pulldowns and rows. By week 16 with proper progressive overload, the V-taper is unmistakable in most body types. Your shoulder-to-waist ratio changes noticeably by month 3 even before significant fat loss."},
  {q:"Is Pakistani food compatible with this plan?",a:"Pakistani food is exceptionally compatible. Daal, eggs, chicken karahi, dahi, desi vegetables — among the best muscle-building and fat-loss foods in any cuisine. Issues to address: too much oil (halve it), too many rotis (reduce), excessive sugar in chai (reduce or remove), fried snacks (replace with eggs and nuts). The underlying ingredients are outstanding."},
  {q:"Standard vs Accelerated plan — which?",a:"Start Standard (2,050 cal) for weeks 1–4 while adapting to training and IF. From week 5, switch to Accelerated (1,800 cal) if lifts are progressing and energy is good. At 215 lbs with consistent training and 185g+ protein, an accelerated deficit is safe and produces results in 10–12 weeks vs 16–20."},
  {q:"What are the 3 most important things?",a:"1. Never skip Tuesday Pull Day — builds the V-taper that changes your entire silhouette. 2. Hit 185g protein EVERY DAY — prevents muscle loss while cutting fat. 3. Walk 10,000 steps daily — burns 350–400 extra calories daily, making fat loss dramatically faster."},
  {q:"When should I eat around training?",a:"Pre-workout: 1.5–2 hours before = full meal fine. Less than 1 hour = light only (yogurt, protein shape). Post-workout: eat within 60 min — muscles are most receptive to protein and carbohydrates then. On your Mon–Thu schedule, lunch at noon and training at 5:30 PM = perfect 5.5-hour pre-workout gap."},
];

/* ============================================================
   ELITE BIOMECHANICAL RADAR CHART COMPONENT
============================================================ */
const MuscleRadarChart = ({ day, distribution }) => {
  const axes = ["Back", "Shoulders", "Chest", "Arms", "Core", "Legs"];
  
  // Calculate relative volume mapped to 0-100% per axis
  const dataMap = axes.map(axis => {
    const match = distribution.find(d => d.name.includes(axis));
    return match ? match.count : 0;
  });

  const maxData = Math.max(...dataMap, 1);
  const center = 50;
  const radius = 32;
  const maxCount = Math.max(maxData, 4);

  const getPoint = (value, i) => {
    const r = (value / maxCount) * radius;
    const rad = (i * 60 - 90) * (Math.PI / 180);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad)
    };
  };

  // Generate path string for the polygon
  const pathData = dataMap.map((val, i) => {
    const pt = getPoint(val, i);
    return `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: "300px", display: "block", margin: "0 auto", overflow: "visible" }}>
      <defs>
        {/* Glow effect for the data polygon */}
        <filter id="polyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Gradient fill */}
        <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={day.color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={day.color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Concentric Grid Rings */}
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <circle 
          key={scale} cx={center} cy={center} r={radius * scale} 
          fill="none" stroke={T.borderHover} strokeWidth="0.3" 
          strokeDasharray={i === 3 ? "none" : "1 1"} 
        />
      ))}

      {/* Axis Spoke Lines */}
      {axes.map((_, i) => {
        const pt = getPoint(maxCount, i);
        return <line key={i} x1={center} y1={center} x2={pt.x} y2={pt.y} stroke={T.border} strokeWidth="0.4" />;
      })}

      {/* Data Polygon with Glow and Gradient */}
      <path 
        d={pathData} 
        fill="url(#polyGrad)" 
        stroke={day.color} 
        strokeWidth="1.2" 
        strokeLinejoin="round"
        filter="url(#polyGlow)"
        style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />

      {/* Data Vertices (Dots) */}
      {dataMap.map((val, i) => {
        const pt = getPoint(val, i);
        return (
          <circle 
            key={`dot-${i}`} cx={pt.x} cy={pt.y} r="1.5" 
            fill={T.surface} stroke={day.color} strokeWidth="0.8" 
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        );
      })}

      {/* Axis Typography */}
      {axes.map((axis, i) => {
         const lblPt = getPoint(maxCount * 1.25, i);
         const isActive = dataMap[i] > 0;
         return (
           <text 
             key={i} x={lblPt.x} y={lblPt.y} 
             fontSize="4.2" 
             fontWeight={isActive ? "700" : "500"} 
             fill={isActive ? T.text : T.textDim} 
             textAnchor="middle" dominantBaseline="middle"
             style={{ transition: "all 0.3s", fontFamily: T.mono, textTransform: "uppercase", letterSpacing: "0.5px" }}
           >
             {axis}
           </text>
         );
      })}
    </svg>
  );
};

/* ============================================================
   RENDER
============================================================ */
export default function DaedalusInitiative() {
  const [tab, setTab] = useState("training"); 
  const [wDay, setWDay] = useState("TUE");
  const [exOpen, setExOpen] = useState(null);
  const [mSlot, setMSlot] = useState("breakfast");
  const [mOpen, setMOpen] = useState(null);
  const [sOpen, setSOpen] = useState(null);
  const [fOpen, setFOpen] = useState(null);
  const [rTab, setRTab] = useState("training");

  // Local state storage for user's own Gemini API key
  const [geminiApiKey, setGeminiApiKey] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = window.localStorage.getItem("user_gemini_api_key");
      if (storedKey) setGeminiApiKey(storedKey);
    }
  }, []);

  const saveApiKey = (key) => {
    setGeminiApiKey(key);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("user_gemini_api_key", key);
    }
  };

  // AI Feature States
  const [aiWorkoutInput, setAiWorkoutInput] = useState("");
  const [aiWorkoutResult, setAiWorkoutResult] = useState(null);
  const [aiWorkoutLoading, setAiWorkoutLoading] = useState(false);
  const [aiWorkoutError, setAiWorkoutError] = useState("");

  const [aiMealInput, setAiMealInput] = useState("");
  const [aiMealResults, setAiMealResults] = useState({}); // Stores remixed meals by meal name
  const [aiMealLoading, setAiMealLoading] = useState({});
  const [aiMealError, setAiMealError] = useState("");

  // AI Chat Coach States
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Salam! I am your personal AI Transformation Coach. Ask me anything about your current workout program, South Asian food substitutions, Intermittent Fasting, or gym form setup!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const TABS = [
    {id:"training",label:"Training",icon:"⬢"},
    {id:"nutrition",label:"Nutrition",icon:"⬣"},
    {id:"supplements",label:"Supplements",icon:"◈"},
    {id:"rules",label:"Rules",icon:"◆"},
    {id:"faq",label:"FAQ",icon:"◌"},
    {id:"coach",label:"AI Coach & Keys",icon:"✨"},
  ];

  const curDay = WORKOUT_DAYS.find(d => d.key === wDay);
  const curSlot = MEALS.find(s => s.id === mSlot);

  /* ============================================================
     LOCAL GEMINI WRAPPER (INJECTS USER API KEY PREFERENTIALLY)
  ============================================================ */
  const localCallGemini = async (prompt, systemInstruction = "") => {
    const activeKey = geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!activeKey) {
      throw new Error("No API key supplied. Please go to the 'AI Coach & Keys' tab and paste your Gemini API key.");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${activeKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("Empty response returned from Gemini API");
      } catch (err) {
        if (i === 4) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      }
    }
  };

  /* ============================================================
     GEMINI API CALL HANDLERS
  ============================================================ */
  const handleWorkoutAdaptation = async () => {
    if (!aiWorkoutInput.trim()) return;
    setAiWorkoutLoading(true);
    setAiWorkoutError("");
    setAiWorkoutResult(null);

    const prompt = `Adjust this specific workout day:
    - Day: ${curDay.label} (${curDay.sub})
    - Focus/Overview: ${curDay.overview}
    - Exercises: ${JSON.stringify(curDay.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, target: e.muscle })))}
    
    User Constraint or Need: "${aiWorkoutInput}"
    
    Provide an adapted version of this workout list tailored beautifully to this constraint. Maintain the exact same premium structure:
    Include adjusted exercise selections, modified sets/reps, and coach's tips for execution with safety first. Format cleanly so it reads perfectly in a simple paragraph or clean lines. Make extensive use of bullet points and bold headers.`;

    const systemInstruction = "You are an elite sports science kinesiologist and personal trainer. You specialize in modifying complex athletic training schedules on-the-fly for physical therapy adjustments, limited equipment setups (hotel gyms), and time efficiency, while preserving hypertrophy stimuli. Always respond with clear, formatted markdown (use **bolding**, line breaks, and - bullet points) and encouraging instructions.";

    try {
      const result = await localCallGemini(prompt, systemInstruction);
      setAiWorkoutResult(result);
    } catch (err) {
      setAiWorkoutError(err.message || "Could not adapt workout. Please verify your API Key and network connection.");
    } finally {
      setAiWorkoutLoading(false);
    }
  };

  const handleMealRemix = async (meal) => {
    const customPrompt = aiMealInput.trim() || "Make it high-protein and optimize spices";
    setAiMealLoading(prev => ({ ...prev, [meal.name]: true }));
    setAiMealError("");

    const prompt = `Take this specific recipe:
    - Meal Name: ${meal.name}
    - Description: ${meal.desc}
    - Original Ingredients: ${JSON.stringify(meal.ing)}
    - Original Steps: ${JSON.stringify(meal.steps)}
    
    Remix it with this request: "${customPrompt}"
    
    Return a structured remixed recipe. Break it down into clear markdown sections:
    ### ✨ REMIXED TITLE
    **Macros**: (Estimated Calories & Protein)
    
    ### Ingredients:
    - Item 1
    - Item 2
    
    ### Adjusted Instructions:
    1. Step 1
    2. Step 2`;

    const systemInstruction = "You are a professional Michelin-star culinary nutritionist specializing in healthy South Asian, Mediterranean, and fusion macro-friendly diets. You excel at maintaining exact target proteins while catering to allergies, quick prep adjustments, vegetarian swaps, or flavor improvements. Format your output strictly in clean markdown.";

    try {
      const result = await localCallGemini(prompt, systemInstruction);
      setAiMealResults(prev => ({ ...prev, [meal.name]: result }));
    } catch (err) {
      setAiMealError(err.message || "Failed to remix recipe. Verify your API Key and try again.");
    } finally {
      setAiMealLoading(prev => ({ ...prev, [meal.name]: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    const systemInstruction = `You are the elite "Daedalus Initiative Coach". You are coaching a 30-year-old male, 215 lbs, whose primary focuses are Back Width, Shoulder Mass, and general belly Fat Loss under a 16-week structured plan.
    You must ground your guidance strictly in the following principles:
    - Standard caloric intake is ~2,050 Cal (Phase 1). Accelerated is 1,800 Cal. High protein target is 185g+ daily.
    - Intermittent Fasting window closes strictly at 9:30 PM.
    - Monday Push, Tuesday Pull, Wednesday Cardio + Core, Thursday Legs + Core, Friday HIIT + Shoulders, Saturday Active Recovery, Sunday Meal Prep.
    - Tuesday Pull Day is the absolute priority of the program to construct the V-taper.
    - Respect South Asian habits like unsweetened/low-sugar Chai (2% milk) which is already budgeted into their daily diet.
    Always be concise, encouraging, scientific, and highly professional. Avoid generic answers. Speak directly to South Asian body recomposition dynamics if applicable. 
    FORMATTING: Always format your answers cleanly using markdown bullet points, numbered lists, and **bold text** for emphasis. Never output raw text walls.`;

    const chatHistoryContext = chatMessages.map(m => `${m.role === "user" ? "Client" : "Coach"}: ${m.text}`).join("\n");
    const fullPrompt = `${chatHistoryContext}\nClient: ${userText}\nCoach:`;

    try {
      const reply = await localCallGemini(fullPrompt, systemInstruction);
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", text: err.message || "Forgive me, my server connection fluctuated. Let's try that question again! Make sure your network is stable." }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ============================================================
     DYNAMIC MUSCLE VOLUMETRICS CHART DATA
  ============================================================ */
  const muscleDistribution = useMemo(() => {
    if (!curDay || !curDay.exercises) return [];
    
    const counts = {};
    let totalScore = 0;

    curDay.exercises.forEach(ex => {
      const nameLower = ex.name.toLowerCase();
      const muscleLower = ex.muscle.toLowerCase();
      
      let targets = [];
      
      // Categorize exercises into key program zones
      if (muscleLower.includes("chest") || nameLower.includes("press") || nameLower.includes("fly")) {
        if (!nameLower.includes("overhead") && !nameLower.includes("arnold") && !nameLower.includes("shoulder")) {
          targets.push("Chest");
        }
      }
      if (muscleLower.includes("shoulder") || muscleLower.includes("delt") || nameLower.includes("lateral") || nameLower.includes("arnold") || nameLower.includes("ohp") || nameLower.includes("shrug") || nameLower.includes("face pull")) {
        targets.push("Shoulders");
      }
      if (muscleLower.includes("tricep") || nameLower.includes("dip") || nameLower.includes("pushdown")) {
        targets.push("Triceps");
      }
      if (muscleLower.includes("bicep") || nameLower.includes("curl") || muscleLower.includes("brachial")) {
        targets.push("Biceps");
      }
      if (muscleLower.includes("lat") || nameLower.includes("pulldown") || nameLower.includes("pull-up") || nameLower.includes("dead hang")) {
        targets.push("Lats (Width)");
      }
      if (muscleLower.includes("row") || muscleLower.includes("rhomboid") || muscleLower.includes("mid-back") || muscleLower.includes("trapezius") || nameLower.includes("row") || nameLower.includes("deadlift")) {
        targets.push("Mid/Upper Back");
      }
      if (muscleLower.includes("quad") || nameLower.includes("squat") || nameLower.includes("leg press") || nameLower.includes("lunge")) {
        targets.push("Quads & Legs");
      }
      if (muscleLower.includes("hamstring") || muscleLower.includes("glute") || nameLower.includes("rdl") || nameLower.includes("deadlift") || nameLower.includes("leg curl")) {
        targets.push("Glutes & Hamstrings");
      }
      if (muscleLower.includes("core") || muscleLower.includes("ab") || nameLower.includes("rollout") || nameLower.includes("plank") || nameLower.includes("raise") || nameLower.includes("crunch") || nameLower.includes("bug")) {
        targets.push("Core & Abs");
      }
      if (nameLower.includes("sprint") || nameLower.includes("bike") || nameLower.includes("walk") || nameLower.includes("cardio") || nameLower.includes("spin")) {
        targets.push("Cardio");
      }

      if (targets.length === 0) {
        targets.push("Other");
      }

      targets.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
        totalScore++;
      });
    });

    return Object.entries(counts).map(([name, count]) => {
      const percentage = Math.round((count / totalScore) * 100);
      return { name, count, percentage };
    }).sort((a, b) => b.count - a.count);

  }, [curDay]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 overflow-x-hidden min-h-screen pb-20" style={{ background: T.bg, color: T.text, fontFamily: T.sans }}>
      
      {/* ── HEADER ── */}
      <div className="py-8 border-b border-slate-200" style={{ background: T.surface }}>
        <div className="font-mono text-[9px] font-semibold tracking-widest text-emerald-700 uppercase mb-2">Personal Transformation System</div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight" style={{ color: T.text }}>
              The Daedalus<br />Initiative
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Male · 30 · 215 lb · Back Width · Shoulder Mass · Fat Loss</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto md:max-w-md">
            {[["~2,050", "Cal", T.blue], ["185g+", "Protein", T.green], ["16:8", "IF", T.purple], ["5–6×", "Sessions", T.amber]].map(([v, l, c]) => (
              <div key={l} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-center shadow-sm">
                <div className="font-mono text-base sm:text-lg font-bold" style={{ color: c }}>{v}</div>
                <div className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <div className="bg-white border-b border-slate-200 flex overflow-x-auto sticky top-0 z-50 shadow-sm custom-scroll">
        {TABS.map(t => (
          <button 
            key={t.id} 
            className="btn-press flex items-center gap-2 py-4 px-5 text-xs sm:text-sm whitespace-nowrap transition-colors font-medium border-b-2" 
            onClick={() => { setTab(t.id); setExOpen(null); setMOpen(null); }} 
            style={{
              borderColor: tab === t.id ? T.blue : "transparent",
              color: tab === t.id ? T.blue : T.textDim,
              fontWeight: tab === t.id ? 600 : 500,
              minHeight: "48px"
            }}
          >
            <span className="text-xs">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="py-6 fade">

        {/* ══════════ TRAINING ══════════ */}
        {tab === "training" && (
          <div className="w-full">
            {/* Day selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scroll">
              {WORKOUT_DAYS.map(d => (
                <button 
                  key={d.key} 
                  className="btn-press flex-shrink-0 rounded-2xl py-3 px-4 text-center min-w-[76px] transition-all border shadow-sm" 
                  onClick={() => { setWDay(d.key); setExOpen(null); setAiWorkoutResult(null); }} 
                  style={{
                    background: wDay === d.key ? `${d.color}10` : T.surface,
                    borderColor: wDay === d.key ? d.color : T.border,
                    minHeight: "64px"
                  }}
                >
                  <div className="text-xl mb-1">{d.emoji}</div>
                  <div className="font-mono text-xs font-bold" style={{ color: wDay === d.key ? d.color : T.textMuted }}>{d.key}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 font-medium">{d.label.split(" ")[0]}</div>
                </button>
              ))}
            </div>

            {curDay && (
              <div className="fade space-y-6 mt-4">
                {/* Day header */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: curDay.color }}>{curDay.emoji} {curDay.label}</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-500">{curDay.sub}</span>
                    {curDay.sessionTime && <span className="font-mono text-xs font-semibold text-slate-400 sm:ml-auto">⏱ {curDay.sessionTime}</span>}
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200/60 border-l-4 rounded-r-xl p-4 shadow-sm" style={{ borderLeftColor: curDay.color }}>
                    {curDay.overview}
                  </div>
                </div>

                {/* ── ✨ INTERACTIVE WORKOUT ADJUSTER ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <h3 className="text-sm sm:text-base font-bold" style={{ color: T.text }}>AI Workout Adjuster</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Modify today's training program live using Gemini intelligence. Ideal for injuries, tight schedules, or limited hotel gym equipment.
                  </p>
                  <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 custom-scroll">
                    {[
                      "I only have 30 minutes",
                      "I have shoulder pain",
                      "Dumbbells only version",
                      "Make it a home workout"
                    ].map(preset => (
                      <button 
                        key={preset} 
                        onClick={() => setAiWorkoutInput(preset)} 
                        className="btn-press bg-slate-50 border border-slate-200 text-slate-600 text-xs py-1.5 px-3 rounded-full font-medium transition-colors"
                        style={{ minHeight: "36px" }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="e.g. Lower back feels tight, swap deadlifts out..."
                      value={aiWorkoutInput}
                      onChange={(e) => setAiWorkoutInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{ minHeight: "44px" }}
                    />
                    <button 
                      onClick={handleWorkoutAdaptation}
                      disabled={aiWorkoutLoading || !aiWorkoutInput.trim()}
                      className="btn-press bg-blue-700 text-white rounded-xl px-5 py-2 text-sm font-semibold flex items-center justify-center gap-2 flex-shrink-0"
                      style={{ minHeight: "44px", opacity: (aiWorkoutLoading || !aiWorkoutInput.trim()) ? 0.6 : 1 }}
                    >
                      {aiWorkoutLoading ? "Customizing..." : "✨ Adjust Workout"}
                    </button>
                  </div>

                  {aiWorkoutError && (
                    <div className="text-sm font-semibold text-red-700 mt-2">
                      {aiWorkoutError}
                    </div>
                  )}

                  {aiWorkoutResult && (
                    <div className="fade mt-4 p-4 bg-slate-50 border-l-4 border-blue-700 rounded-r-xl">
                      <div className="font-mono text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                        Your Modified AI Routine
                      </div>
                      <div className="text-sm text-slate-800 leading-relaxed">
                        {formatAIResponse(aiWorkoutResult)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Warm-up */}
                {curDay.warmup.length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel text="Warm-Up — 8 min" color={T.teal} />
                    <div className="flex flex-wrap gap-2">
                      {curDay.warmup.map((w, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-xs sm:text-sm font-medium text-slate-600 shadow-sm">
                          <span className="text-teal-700 mr-2">→</span>{w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises list - Stacks beautifully on mobile */}
                {curDay.exercises.length > 0 && (
                  <div className="space-y-4">
                    <SectionLabel text="Exercises" color={curDay.color} />
                    
                    {/* Header Columns: Hidden on Mobile */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                      <div className="col-span-6">Exercise</div>
                      <div className="col-span-2">Sets</div>
                      <div className="col-span-2">Reps</div>
                      <div className="col-span-2">Start Weight</div>
                    </div>
                    
                    <div className="space-y-3">
                      {curDay.exercises.map((ex, i) => {
                        const key = `${wDay}-${i}`;
                        const open = exOpen === key;
                        return (
                          <div key={i} className="fade">
                            {/* Card trigger */}
                            <div 
                              onClick={() => setExOpen(open ? null : key)}
                              className="flex flex-col sm:grid sm:grid-cols-12 gap-3 p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm cursor-pointer transition-all"
                            >
                              {/* Exercise Main Info */}
                              <div className="col-span-6 flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm sm:text-base font-bold text-slate-900">{ex.name}</span>
                                    {ex.priority === "A+" && <span className="font-mono text-[9px] font-bold bg-red-100 text-red-800 border border-red-200 rounded px-1.5 py-0.5">A+</span>}
                                    {ex.priority === "A★" && <span className="font-mono text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5">★ KEY</span>}
                                  </div>
                                  <div className="text-xs font-semibold text-slate-400">{ex.muscle}</div>
                                </div>
                                <span className="sm:hidden text-lg font-bold text-slate-400">{open ? "−" : "+"}</span>
                              </div>

                              {/* Desktop Values */}
                              <div className="hidden sm:block col-span-2 font-mono text-base font-bold" style={{ color: curDay.color }}>{ex.sets}×</div>
                              <div className="hidden sm:block col-span-2 font-mono text-xs font-semibold text-slate-600">{ex.reps}</div>
                              <div className="hidden sm:block col-span-2 font-mono text-xs font-semibold text-slate-500">{ex.startW}</div>

                              {/* Mobile Values: Stacked Grid */}
                              <div className="flex sm:hidden gap-2 pt-3 border-t border-slate-100 border-dashed w-full">
                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Sets: {ex.sets}×</span>
                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Reps: {ex.reps}</span>
                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Start: {ex.startW}</span>
                              </div>
                            </div>

                            {/* Dropdown Card Detail */}
                            {open && (
                              <div className="fade bg-white border-x border-b border-slate-200 rounded-b-2xl p-5 -mt-3 shadow-md space-y-5">
                                {/* Target metrics */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
                                  {[["Rest", ex.rest || "90s", T.textMuted], ["Week 1", ex.startW, T.textMuted], ["Week 8", ex.w8, T.blue], ["Week 16", ex.w16, T.green]].map(([l, v, c]) => (
                                    <div key={l}>
                                      <div className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wide">{l}</div>
                                      <div className="font-mono text-xs sm:text-sm font-bold mt-1" style={{ color: c }}>{v}</div>
                                    </div>
                                  ))}
                                </div>
                                {/* Form Steps */}
                                <div className="space-y-2">
                                  <SectionLabel text="Execution Guidelines" color={curDay.color} />
                                  {ex.form?.map((f, fi) => (
                                    <div key={fi} className="flex gap-3 items-start">
                                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center mt-0.5" style={{ background: `${curDay.color}15`, color: curDay.color }}>{fi + 1}</span>
                                      <span className="text-sm text-slate-600 leading-relaxed">{f}</span>
                                    </div>
                                  ))}
                                </div>
                                {/* Mistake and tip blocks */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
                                    <div className="font-mono text-[9px] font-bold text-red-800 uppercase tracking-wider">Common Mistakes</div>
                                    {ex.mistakes?.map((m, mi) => <div key={mi} className="text-xs text-red-700 leading-relaxed">✗ {m}</div>)}
                                  </div>
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                                    <div className="font-mono text-[9px] font-bold text-slate-600 uppercase tracking-wider">Coach's Tip</div>
                                    <div className="text-xs text-slate-600 leading-relaxed">{ex.tip}</div>
                                  </div>
                                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
                                    <div className="font-mono text-[9px] font-bold text-purple-800 uppercase tracking-wider">Advanced Progression</div>
                                    <div className="text-xs text-purple-700 leading-relaxed">{ex.advanced}</div>
                                  </div>
                                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-2">
                                    <div className="font-mono text-[9px] font-bold text-teal-800 uppercase tracking-wider">Beginner Modification</div>
                                    <div className="text-xs text-teal-700 leading-relaxed">{ex.beginner}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cardio */}
                <div className="space-y-3">
                  <SectionLabel text="Cardio Focus" color={T.green} />
                  <div className="bg-white border border-slate-200 border-l-4 rounded-r-2xl p-5 shadow-sm space-y-4" style={{ borderLeftColor: T.green }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[["Type", curDay.cardio.type, T.text], ["Duration", curDay.cardio.duration, T.green], ["Intensity", curDay.cardio.intensity, T.textMuted], ["Timing", curDay.cardio.timing, T.textDim]].map(([l, v, c]) => (
                        <div key={l}>
                          <div className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider">{l}</div>
                          <div className="text-xs sm:text-sm font-semibold mt-1" style={{ color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-slate-500 leading-relaxed">{curDay.cardio.why}</div>
                  </div>
                </div>

                {/* Cooldown */}
                <div className="space-y-3">
                  <SectionLabel text="Cool-Down — 8 min" />
                  <div className="flex flex-wrap gap-2">
                    {curDay.cooldown.map((c, ci) => (
                      <div key={ci} className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-xs sm:text-sm font-medium text-slate-600 shadow-sm">{c}</div>
                    ))}
                  </div>
                </div>

                {/* ── ✨ ELITE BIOMECHANICAL DISTRIBUTION RADAR ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg space-y-6">
                  <SectionLabel text="Active Session Biomechanics" color={curDay.color} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Visual Radar */}
                    <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <MuscleRadarChart day={curDay} distribution={muscleDistribution} />
                    </div>

                    {/* Precision Readout */}
                    <div className="space-y-4">
                      <h3 className="text-sm sm:text-base font-bold" style={{ color: T.text }}>Workload Telemetry</h3>
                      <div className="space-y-3">
                        {muscleDistribution.map((muscle) => (
                          <div key={muscle.name}>
                            <div className="flex justify-between items-baseline mb-1 text-xs">
                              <span className="font-semibold" style={{ color: T.text }}>{muscle.name}</span>
                              <span className="font-mono font-semibold" style={{ color: T.textDim }}>{muscle.percentage}%</span>
                            </div>
                            {/* Sleek precision bar */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-1000" 
                                style={{
                                  width: `${muscle.percentage}%`,
                                  background: `linear-gradient(90deg, ${curDay.color}dd, ${curDay.color})`
                                }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ══════════ NUTRITION ══════════ */}
        {tab === "nutrition" && (
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[["~2,050", "Calories", T.blue], ["185g+", "Protein", T.green], ["9:30 PM", "IF Closes", T.purple], ["2× Daily", "Chai (2%)", T.amber]].map(([v, l, c]) => (
                <div key={l} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                  <div className="font-mono text-base sm:text-lg font-bold" style={{ color: c }}>{v}</div>
                  <div className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-1">{l}</div>
                </div>
              ))}
            </div>

            {/* Chai note */}
            <div className="bg-white border border-slate-200 border-l-4 rounded-r-2xl p-4 shadow-sm text-sm text-slate-600 leading-relaxed" style={{ borderLeftColor: T.amber }}>
              ☕ <strong style={{ color: T.amber }}>Your 2 daily chais (2% milk) = ~130 cal + 8g protein.</strong> Built into every day's totals. Keep them. Unsweetened or ½ tsp max.
            </div>

            {/* Meal slot tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scroll">
              {MEALS.map(slot => (
                <button 
                  key={slot.id} 
                  className="btn-press flex-shrink-0 rounded-2xl py-3 px-4 text-center min-w-[85px] transition-all border shadow-sm" 
                  onClick={() => { setMSlot(slot.id); setMOpen(null); }} 
                  style={{
                    background: mSlot === slot.id ? `${slot.color}10` : T.surface,
                    borderColor: mSlot === slot.id ? slot.color : T.border,
                    minHeight: "56px"
                  }}
                >
                  <div className="text-xl mb-1">{slot.icon}</div>
                  <div className="text-xs font-bold" style={{ color: mSlot === slot.id ? slot.color : T.textMuted }}>{slot.label}</div>
                  <div className="font-mono text-[9px] font-semibold text-slate-400 mt-1">{slot.time}</div>
                </button>
              ))}
            </div>

            {curSlot && (
              <div className="fade space-y-4">
                <div className="bg-white border border-slate-200 border-l-4 rounded-r-2xl p-4 shadow-sm text-sm text-slate-600 leading-relaxed animate-pulse" style={{ borderLeftColor: curSlot.color }}>
                  {curSlot.note}
                </div>
                
                {/* ── ✨ INSTANT RECIPE REMIXER CONTROLS ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <h4 className="text-sm sm:text-base font-bold" style={{ color: T.text }}>AI Meal Remixer</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Input requests like "Make it vegan" or "Double the protein", then tap a meal card's ✨ button to transform it.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter modifier (e.g. Vegetarian swap, Desi spices upgrade...)" 
                      value={aiMealInput}
                      onChange={(e) => setAiMealInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{ minHeight: "44px" }}
                    />
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-400 px-1">Select any option to expand recipe ({curSlot.options.length} options)</div>
                
                <div className="space-y-4">
                  {curSlot.options.map((meal, mi) => {
                    const open = mOpen === meal.name;
                    const remixedResult = aiMealResults[meal.name];
                    const loadingRemix = aiMealLoading[meal.name];

                    return (
                      <div key={mi} className="fade">
                        <div 
                          className="p-5 bg-white border hover:border-slate-300 rounded-2xl shadow-sm transition-all"
                          style={{ borderColor: open ? curSlot.color : T.border }}
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-2 cursor-pointer" onClick={() => setMOpen(open ? null : meal.name)}>
                              <div className="flex gap-2 flex-wrap items-center">
                                <TagPill text={meal.tag} color={curSlot.color} />
                                <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">{meal.diff}</span>
                                <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">⏱ {meal.time}</span>
                              </div>
                              <h4 className="text-base font-bold text-slate-900 leading-tight">{meal.name}</h4>
                              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{meal.desc}</p>
                            </div>
                            
                            <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 border-dashed">
                              <div className="flex gap-4">
                                <div className="text-center">
                                  <div className="font-mono text-base font-bold" style={{ color: T.blue }}>{meal.cal}</div>
                                  <div className="font-mono text-[9px] font-semibold text-slate-400 uppercase tracking-wider">cal</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-mono text-base font-bold" style={{ color: T.green }}>{meal.pro}g</div>
                                  <div className="font-mono text-[9px] font-semibold text-slate-400 uppercase tracking-wider">protein</div>
                                </div>
                              </div>
                              <div className="flex gap-2 items-center">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleMealRemix(meal); }}
                                  disabled={loadingRemix}
                                  className="btn-press bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1"
                                  style={{ color: curSlot.color, minHeight: "36px" }}
                                >
                                  {loadingRemix ? "Wait..." : "✨ Remix"}
                                </button>
                                <span className="text-lg font-bold text-slate-400 min-w-[24px] text-center cursor-pointer" onClick={() => setMOpen(open ? null : meal.name)}>{open ? "−" : "+"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Nested expanded content directly inside card container */}
                          {open && (
                            <div className="fade border-t border-slate-100 border-dashed mt-5 pt-5 space-y-6">
                              {/* AI Remix Output */}
                              {remixedResult && (
                                <div className="fade rounded-xl p-4 border border-dashed" style={{ background: `${curSlot.color}05`, borderColor: curSlot.color }}>
                                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: curSlot.color }}>
                                      ✨ Live AI Recipe Transformation
                                    </div>
                                    <button 
                                      onClick={() => setAiMealResults(prev => { const n = { ...prev }; delete n[meal.name]; return n; })}
                                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 min-h-[32px]"
                                    >
                                      Reset to Default
                                    </button>
                                  </div>
                                  <div className="text-sm text-slate-800 leading-relaxed">
                                    {formatAIResponse(remixedResult)}
                                  </div>
                                </div>
                              )}

                              {/* Ingredients */}
                              <div className="space-y-2">
                                <SectionLabel text="Ingredients" color={curSlot.color} />
                                <div className="flex flex-wrap gap-2">
                                  {meal.ing.map((ing, ii) => (
                                    <span key={ii} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">{ing}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Recipe Steps */}
                              <div className="space-y-3">
                                <SectionLabel text="Recipe / Steps" color={curSlot.color} />
                                {meal.steps.map((step, si) => (
                                  <div key={si} className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center mt-0.5" style={{ background: `${curSlot.color}15`, color: curSlot.color }}>{si + 1}</span>
                                    <div>
                                      <div className="text-sm font-bold text-slate-800 mb-0.5">{step.s}</div>
                                      <div className="text-sm text-slate-500 leading-relaxed">{step.d}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Notes + Swap */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                                  <SectionLabel text="Cook's Notes" />
                                  <div className="text-xs text-slate-500 leading-relaxed">{meal.notes || "No special notes."}</div>
                                </div>
                                <div className="border rounded-xl p-4 space-y-1" style={{ background: `${curSlot.color}05`, borderColor: `${curSlot.color}25` }}>
                                  <SectionLabel text="Alternative / Swap" color={curSlot.color} />
                                  <div className="text-xs text-slate-500 leading-relaxed">{meal.swap}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SUPPLEMENTS ══════════ */}
        {tab === "supplements" && (
          <div className="space-y-4">
            <div className="text-sm sm:text-base text-slate-600 leading-relaxed p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <strong style={{ color: T.blue }}>Supplements accelerate results on top of solid training and nutrition.</strong> Not substitutes for either. Start with Essential tier. Add others progressively over weeks.
            </div>
            <div className="space-y-3">
              {SUPPS.map((supp, i) => {
                const open = sOpen === i;
                const tc = tierCol(supp.tier);
                return (
                  <div key={i} className="fade">
                    <div 
                      onClick={() => setSOpen(open ? null : i)}
                      className="flex justify-between items-center gap-4 p-4 bg-white border hover:border-slate-300 rounded-2xl shadow-sm cursor-pointer transition-all"
                      style={{ borderColor: open ? tc : T.border }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-slate-800">{supp.name}</span>
                          <TagPill text={supp.tier} color={tc} />
                        </div>
                        <div className="text-xs font-semibold text-slate-400">{supp.timing} · <span className="font-mono font-bold">{supp.dose}</span></div>
                      </div>
                      <div className="text-lg font-bold text-slate-400">{open ? "−" : "+"}</div>
                    </div>
                    {open && (
                      <div className="fade bg-white border-x border-b border-slate-200 rounded-b-2xl p-5 -mt-3 shadow-md space-y-4">
                        <div className="text-sm text-slate-600 leading-relaxed">{supp.why}</div>
                        <div className="text-xs font-semibold text-slate-400 border-t border-slate-100 pt-3">🏷 {supp.brand}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ RULES ══════════ */}
        {tab === "rules" && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              {[["training", "Training", T.blue], ["nutrition", "Nutrition", T.green], ["lifestyle", "Lifestyle", T.purple]].map(([k, l, c]) => (
                <button 
                  key={k} 
                  onClick={() => setRTab(k)} 
                  className="btn-press flex-1 rounded-xl py-2.5 px-3 text-sm font-bold border transition-all"
                  style={{
                    background: rTab === k ? `${c}10` : T.surface,
                    borderColor: rTab === k ? c : T.border,
                    color: rTab === k ? c : T.textMuted,
                    minHeight: "44px"
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="fade space-y-3">
              {RULES[rTab].map((rule, i) => (
                <div key={i} className="flex gap-4 items-start p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="font-mono text-sm font-bold text-slate-400 mt-0.5">{String(i + 1).padStart(2, "0")}</div>
                  <div className="text-sm sm:text-base text-slate-600 leading-relaxed">{rule}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ FAQ ══════════ */}
        {tab === "faq" && (
          <div className="space-y-4">
            <div className="text-sm sm:text-base text-slate-400 font-semibold px-1">Every question you'll have at any point in the program.</div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => {
                const open = fOpen === i;
                return (
                  <div key={i} className="fade">
                    <div 
                      onClick={() => setFOpen(open ? null : i)}
                      className="flex justify-between items-center gap-4 p-4 bg-white border hover:border-slate-300 rounded-2xl shadow-sm cursor-pointer transition-all"
                      style={{ borderColor: open ? T.blue : T.border, minHeight: "48px" }}
                    >
                      <div className="text-sm sm:text-base font-bold text-slate-800 leading-tight">{faq.q}</div>
                      <div className="text-lg font-bold text-slate-400 flex-shrink-0">{open ? "−" : "+"}</div>
                    </div>
                    {open && (
                      <div className="fade bg-white border-x border-b border-slate-200 rounded-b-2xl p-5 -mt-3 shadow-md">
                        <div className="text-sm sm:text-base text-slate-600 leading-relaxed">{faq.a}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ ✨ AI PERSONAL COACH CHAT & KEY CONFIG ══════════ */}
        {tab === "coach" && (
          <div className="fade space-y-6">
            
            {/* ── ✨ SECURE LOCAL API KEY MANAGER ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h3 className="text-sm sm:text-base font-bold" style={{ color: T.text }}>Gemini API Credentials</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                To run the AI Workout, AI Meal, and Coach features in your local copy of the app, paste your personal Gemini API Key below. This key will be saved securely inside your browser's private storage.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="password" 
                  placeholder="Paste Gemini API Key (begins with AIzaSy...)" 
                  value={geminiApiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "44px" }}
                />
                {geminiApiKey && (
                  <button 
                    onClick={() => saveApiKey("")}
                    className="btn-press bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 text-sm font-semibold transition-colors flex items-center justify-center"
                    style={{ minHeight: "44px" }}
                  >
                    Clear Key
                  </button>
                )}
              </div>
              {geminiApiKey && (
                <div className="text-xs sm:text-sm font-semibold text-green-700 flex items-center gap-1 mt-1">
                  <span>✓</span> Key saved locally! Your AI features are ready.
                </div>
              )}
            </div>

            <div className="text-sm sm:text-base text-slate-600 leading-relaxed p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <strong style={{ color: T.purple }}>Have a unique question?</strong> Discuss customized meal choices, complex exercise form setups, or active recovery suggestions grounded in the science of the program.
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 h-[550px] flex flex-col justify-between shadow-sm">
              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto pr-1 mb-4 flex flex-col gap-3 custom-scroll">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className="fade p-4 rounded-2xl"
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: msg.role === "user" ? "85%" : "95%",
                      background: msg.role === "user" ? T.blue : T.card,
                      color: msg.role === "user" ? "#ffffff" : T.text,
                      borderRadius: msg.role === "user" ? "14px 14px 0 14px" : "14px 14px 14px 0"
                    }}
                  >
                    {msg.role === "user" ? (
                      <div className="text-sm leading-relaxed">{msg.text}</div>
                    ) : (
                      <div className="text-sm leading-relaxed">{formatAIResponse(msg.text)}</div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="align-self-start bg-slate-100 text-slate-500 p-3 rounded-2xl text-sm italic rounded-bl-none">
                    Thinking...
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <input 
                  type="text" 
                  placeholder="Ask your coach..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "44px" }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="btn-press bg-blue-700 text-white rounded-xl px-5 py-2 text-sm font-semibold flex items-center justify-center"
                  style={{ minHeight: "44px", opacity: (chatLoading || !chatInput.trim()) ? 0.6 : 1 }}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-slate-200 mt-6" style={{ background: T.surface }}>
        <div className="font-mono text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
          Built for Consistency · Not Perfection · Every Session Forward
        </div>
      </div>
    </div>
  );
}