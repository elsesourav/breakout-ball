# 🎮 Cyber Breakout: Automated Level Tester & Difficulty Balancing Specification

> **Developer-Facing Architecture, Mathematical Formulations, and Empirical Telemetry Benchmark for Level Creators**  
> *Target System: Breakout-Ball Engine (HTML5 2D / WebGL / WebAssembly Hybrid)*  
> *Script Pipeline: `npm run test:levels` / `node scripts/levelTester.mjs`*

---

## 1. System Overview & Level Testing Goals

In modern brick-breaker game design, manual playtesting alone cannot reliably detect structural bottlenecks, soft-lock geometries, or balance discrepancies across a player's upgrade trajectory. A level that feels casual to a player with max-tier upgrades may be frustrating or mathematically impassable on stock gear.

This automated testing suite provides level designers with:
1. **Mathematical Layout Analysis (Static Pipeline)**: Inspects block density, effective HP pools, raycast shielding behind Titanium Walls, portal spatial disruption, and EMP cascade shockwaves.
2. **Headless Physics Simulation (Dynamic Pipeline)**: An omniscient AI paddle agent simulates thousands of fixed-step 60Hz physics ticks across three calibrated power profiles (**Lowest Power Baseline**, **Balanced Mid-Tier**, and **Maximum Overdrive Apex**).
3. **Calibrated Difficulty Metric ($D \in [0.00, 1.00]$)**: A normalized difficulty index that blends structural layout properties with empirical clear times.
4. **Time & Score Benchmarks**: Automated par times (Gold, Silver, Bronze) and dynamic star thresholds (1-Star, 2-Star, 3-Star) derived from real game engine scoring rules.
5. **Architectural Balancing Flags**: Automatic alerts for wasted EMP reactors, excessive shielding, choke points, and endurance exhaustion.

```mermaid
flowchart TD
    A["Level Data (Block Array: x, y, h)"] --> B["Static Layout Analyzer"]
    A --> C["Dynamic Headless Simulator"]

    subgraph Static Analysis
        B --> B1["Block Inventory & HP Pool"]
        B --> B2["EMP Shockwave Cascade (R = 2.2 * W)"]
        B --> B3["Raycast Shielding & Wall Enclosure"]
        B --> B4["Spatial Span & Entropy"]
        B1 & B2 & B3 & B4 --> S_Diff["Static Difficulty (D_static)"]
    end

    subgraph Headless Simulation (60Hz Ticks)
        C --> P1["Lowest Power (Stock Gear)"]
        C --> P2["Balanced Power (Mid Upgrades)"]
        C --> P3["Max Power (Overdrive Lvl 10)"]
        P1 & P2 & P3 --> P_Out["Clear Times, Scores & Combos"]
        P_Out --> D_Diff["Simulated Difficulty (D_sim)"]
    end

    S_Diff & D_Diff --> F["Composite Difficulty Index: D ∈ [0.00, 1.00]"]
    P_Out --> G["Gold / Silver / Bronze Par Times"]
    P_Out --> H["1-Star / 2-Star / 3-Star Score Thresholds"]
    B3 & P_Out --> I["Diagnostic Flags & Designer Warnings"]
```

---

## 2. Block Anatomy & Physics Interaction Ledger

The playfield is structured on a grid of **9 columns** (0 to 8, $W = 128\text{ px}$) by **11 rows** (0 to 10, $H = 96\text{ px}$), with paddle elevation at $Y = 1843.2\text{ px}$ and arena boundaries $1152 \times 2048\text{ px}$.

| Block Type | ID ($h$) | Behavior | Durability / HP | Interaction Rules |
| :--- | :---: | :--- | :---: | :--- |
| **Standard Brick** | `1` to `5` | Regular breakable target | 1 to 5 Hits | Depleted by ball collisions ($-1$ stock, $-2.5$ max power) and plasma lasers ($-1$). Destroys at $0\text{ HP}$, awarding $100 \times (1 + \text{combo})$ points and triggering 32–35% power shard drop roll. |
| **Titanium Wall** | `6` | Indestructible Barrier | $\infty$ (Immune) | Cannot be destroyed by balls, mega fireballs, lasers, or EMP shockwaves. Reflects ball trajectories normally. Blocks direct line-of-sight from paddle to upper targets, creating fortified bunkers. |
| **Quantum Portal** | `7` | Paired Warp Gateway | $\infty$ (Immune) | Paired sequentially ($P_{2k} \leftrightarrow P_{2k+1}$). When the ball collides with portal $A$, it teleports instantaneously to portal $B$'s exit point with an 18-substep cooldown, preserving momentum direction. Used for spatial shortcuts or trap redirection. |
| **EMP Reactor** | `8` | Countdown Detonator | 3 Bounces / 1 Strike | Initiates with countdown counter $= 3$. Counter decrements on every paddle bounce. If counter reaches 0 or if the ball strikes the reactor directly, it detonates an EMP shockwave with radius $R = 2.2 \times \text{BLOCK\_WIDTH} = 281.6\text{ px}$, dealing 2 damage to all breakables in range and awarding $+500\text{ pts}$. |

### EMP Cascade Shockwave Formula
For an EMP reactor at center $(X_e, Y_e)$ and target block at $(X_t, Y_t)$:
$$d^2 = (X_t - X_e)^2 + (Y_t - Y_e)^2$$
$$\text{If } d \le 281.6\text{ px} \implies \text{Damage} = \min(2, \text{TargetHP}), \quad (\text{Wall } 6 \text{ and Portal } 7 \text{ immune})$$
$$\text{Effective Level HP: } HP_{\text{eff}} = \max\Big(1, \text{TotalRawHP} - 0.70 \times \sum \text{Damage}_{\text{EMP}}\Big)$$

---

## 3. Power Spectrum: Lowest Power vs. Maximum Power

The game's upgrade economy (Cyber Armory) directly modulates physics parameters and drop durations:

```
Lowest Power (Stock Baseline)                 Maximum Power (Overdrive Lvl 10)
[Damage: 1.0 HP]                              [Damage: 2.5 HP (Instant shatter 1-2 HP)]
[Speed: 15 px/substep (1.0x)]                 [Speed: 24 px/substep (1.6x Overdrive)]
[Paddle: 256 px (1.0x)]                       [Paddle: 358.4 px (Titan Paddle 1.4x)]
[Crit Blast: 0%]                              [Crit Blast: 25% (2.5x dmg + splash)]
[Active Buffs: None]                          [Active Buffs: 16s Laser, 15s Mega Core, Shields]
```

### Detailed Parameter Comparison Matrix

| Parameter / Modifier | Lowest Power (Level 1) | Mid-Tier (Level 5) | Maximum Power (Level 10) | Game Engine Effect |
| :--- | :---: | :---: | :---: | :--- |
| **Strike Power** | `1.0 HP` | `1.6 HP` | `2.5 HP` | Damage dealt per ball-brick impact. At 2.5 HP, 1-hit kills 1–2 HP bricks and 2-hit kills 5 HP bricks. |
| **Ball Velocity** | `15.0 px` ($5400\text{ px/s}$) | `18.75 px` ($6750\text{ px/s}$) | `24.0 px` ($8640\text{ px/s}$) | Traverses vertical playfield distance in roughly half the travel cycles. |
| **Paddle Strike Width** | `256.0 px` | `294.4 px` | `358.4 px` | Increases ball interception margin and reduces corner-bounce ball losses. |
| **Critical Blast Matrix** | `0%` | `10%` | `25%` | Chance to trigger 2.5x kinetic shockwave damage and shatter adjacent bricks. |
| **Plasma Cannon (Laser)** | Disabled (`0s`) | `9.0s Duration` | `16.0s Duration` | Dual turrets mounted on paddle fire 950 px/s bolts every 350ms, disintegrating vertical columns. |
| **Mega Core (Fireball)** | Disabled (`0s`) | `8.0s Duration` | `15.0s Duration` | Ball turns into a superheated projectile that pierces breakable bricks without reflecting. |
| **Multi-Ball Cluster** | Disabled (`1 Ball`) | `+2 Balls` | `+4 to +6 Balls` | Exponentially increases collision density across board. |
| **Forcefield Shield** | `0 Charges` | `1 Charge` | `3 Charges` | Laser safety barrier at bottom of screen that reflects falling balls without losing lives. |

---

## 4. Mathematical Testing & Difficulty Formulation

### 4.1. Difficulty Index ($D \in [0.00, 1.00]$)

Difficulty is calculated as a composite 50/50 blend between **Static Structural Geometry** and **Empirical Simulation Performance**:

$$D = \text{clamp}\Big( 0.50 \cdot D_{\text{static}} + 0.50 \cdot D_{\text{simulated}}, 0.05, 0.99 \Big)$$

#### Static Geometry Component ($D_{\text{static}}$):
$$D_{\text{static}} = 0.35 \cdot \widehat{HP}_{\text{eff}} + 0.25 \cdot E_{\text{shield}} + 0.15 \cdot O_{\text{wall}} + 0.10 \cdot P_{\text{portal}} + 0.15 \cdot S_{\text{span}}$$

Where:
*   $\widehat{HP}_{\text{eff}} = \min(1.0, HP_{\text{eff}} / 55)$: Normalized effective health pool.
*   $E_{\text{shield}} = \frac{1}{N_{\text{break}}} \sum_{i=1}^{N} \min(1.0, 0.45 \cdot W_{\text{below}, i})$: Raycast shielding ratio measuring how many breakables lie directly or diagonally behind Titanium Walls.
*   $O_{\text{wall}} = \frac{N_{\text{wall}}}{N_{\text{break}} + N_{\text{wall}}}$: Titanium wall obstacle density forcing defensive ricochets.
*   $P_{\text{portal}} = \min(1.0, \frac{N_{\text{portal}}}{2} \times 0.35)$: Spatial disorientation and trajectory chaos caused by portals.
*   $S_{\text{span}} = 0.6 \cdot \frac{\text{Col}_{\max} - \text{Col}_{\min} + 1}{9} + 0.4 \cdot \frac{\sigma_{\text{col}}}{4.0}$: Horizontal spread and standard deviation requiring wide paddle travel.

#### Dynamic Simulation Component ($D_{\text{simulated}}$):
$$D_{\text{simulated}} = 0.65 \cdot \min\left(1.0, \frac{T_{\text{lowest}}}{100}\right) + 0.35 \cdot \min\left(1.0, \frac{\text{Hits}_{\text{lowest}}}{50}\right)$$

---

### 4.2. Time Consumption & Speedup Formulation

*   **Lowest Power Clear Time ($T_{\text{lowest}}$)**: The simulated completion time on stock gear with no upgrades.
*   **Maximum Power Clear Time ($T_{\text{max}}$)**: The simulated completion time with Level 10 armory loadout.
*   **Power Acceleration Speedup ($\Delta_{\text{speedup}}$)**:
    $$\Delta_{\text{speedup}} = \frac{T_{\text{lowest}} - T_{\text{max}}}{T_{\text{lowest}}} \times 100\%$$
*   **Par Times**:
    *   **Gold Par**: $T_{\text{max}} \times 1.15$ (Flawless speedrun target)
    *   **Silver Par**: $T_{\text{balanced}} \times 1.10$ (Proficient player target)
    *   **Bronze Par**: $T_{\text{lowest}} \times 1.10$ (Standard baseline clear target)

---

### 4.3. Score Model & Star Benchmarks

Matches the game engine scoring algorithm in `GameEngine.ts`:
*   $\text{Damage Score}: \text{Score} += 50 \times \left(1 + \lfloor \text{combo} / 3 \rfloor\right)$
*   $\text{Destroy Score}: \text{Score} += 100 \times (1 + \text{combo})$
*   $\text{EMP Explosion}: \text{Score} += 500$
*   $\text{Victory Bonus}: \text{TimeBonus} = \max(0, 1000 - \text{Time} \times 25) + \text{LifeBonus} = \text{Lives} \times 250$

#### Star Thresholds:
*   ★ **1-Star (Pass)**: $Score_{\text{lowest}} \times 0.85$ (Achieved by clearing the board before timing out)
*   ★★ **2-Star (Proficient)**: $Score_{\text{balanced}}$ (Achieved by maintaining steady combos with mid-tier gear)
*   ★★★ **3-Star (Mastery)**: $Score_{\text{max}} \times 1.05$ (Requires high combo chains and fast speedrun victory bonus)

---

## 5. Empirical 50-Level Telemetry Benchmark

*The table below contains real, verified data computed by executing `node scripts/levelTester.mjs` against all 50 sorted progressive levels in `src/constants/levels.ts`.*

| Lvl | Name | Diff | Eff HP | Walls | Portals | EMPs | Lowest Time | Max Time | Speedup | 1-Star | 2-Star | 3-Star |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **01** | EMP Sparks | 9% | 9 | 0 | 0 | 1 | 5.5s | 3.2s | +41.8% | 8,339 | 9,846 | 10,362 |
| **02** | Binary Orbit | 20% | 19 | 1 | 2 | 2 | 15.9s | 7.8s | +50.9% | 9,310 | 6,090 | 8,143 |
| **03** | Reactor Core Alpha | 23% | 22 | 1 | 2 | 1 | 19.6s | 10.3s | +47.4% | 4,939 | 5,450 | 5,208 |
| **04** | Chronos Vault | 28% | 10 | 6 | 2 | 2 | 37.6s | 26.8s | +28.7% | 4,257 | 4,255 | 5,171 |
| **05** | Diamond Core | 24% | 19 | 1 | 0 | 0 | 31.9s | 15.8s | +50.5% | 4,507 | 4,316 | 4,345 |
| **06** | Helix Accelerator | 23% | 26 | 1 | 0 | 2 | 24.3s | 13.9s | +42.8% | 11,299 | 4,836 | 4,500 |
| **07** | Cluster Detonator | 28% | 18 | 0 | 0 | 2 | 43.7s | 8.3s | +81% | 4,845 | 5,442 | 9,967 |
| **08** | Double Helix | 25% | 25 | 0 | 0 | 1 | 30.9s | 12.4s | +59.9% | 5,718 | 7,547 | 5,396 |
| **09** | Twin Pillars | 24% | 27 | 0 | 0 | 0 | 25.7s | 12.7s | +50.6% | 8,420 | 7,009 | 7,734 |
| **10** | Doomsday Matrix | 27% | 26 | 2 | 2 | 3 | 21.4s | 14.6s | +31.8% | 6,303 | 7,066 | 7,980 |
| **11** | Cyber Chevron | 33% | 17 | 0 | 0 | 0 | 57.3s | 10.4s | +81.8% | 3,528 | 4,242 | 5,835 |
| **12** | Neon Heart | 27% | 32 | 0 | 0 | 1 | 29.4s | 10.5s | +64.3% | 10,510 | 8,043 | 7,547 |
| **13** | Event Horizon | 32% | 21 | 5 | 2 | 2 | 40.2s | 33.2s | +17.4% | 5,695 | 5,335 | 4,469 |
| **14** | Prism Crown | 33% | 23 | 0 | 0 | 0 | 51.8s | 7.2s | +86.1% | 4,590 | 6,400 | 7,530 |
| **15** | Twin Reactor Nexus | 31% | 24 | 2 | 2 | 2 | 37.3s | 13.3s | +64.3% | 4,519 | 8,197 | 5,862 |
| **16** | EMP Labyrinth | 34% | 24 | 2 | 2 | 3 | 39s | 10.7s | +72.6% | 4,399 | 6,392 | 5,844 |
| **17** | Fortress Moat | 35% | 25 | 6 | 2 | 1 | 38.3s | 6.5s | +83% | 5,221 | 5,251 | 5,761 |
| **18** | Stargate Nexus | 38% | 20 | 2 | 2 | 1 | 56.9s | 8.4s | +85.2% | 3,868 | 7,786 | 6,009 |
| **19** | Quantum Cross | 41% | 19 | 0 | 2 | 1 | 65.7s | 11.1s | +83.1% | 3,060 | 5,224 | 5,045 |
| **20** | Genesis Arc | 40% | 20 | 0 | 0 | 0 | 72.8s | 8.2s | +88.7% | 3,910 | 10,723 | 8,831 |
| **21** | Quantum Gateway Alpha | 40% | 20 | 0 | 2 | 0 | 70.4s | 11.2s | +84.1% | 3,443 | 3,805 | 4,554 |
| **22** | Asteroid Shards | 36% | 27 | 0 | 2 | 2 | 49.3s | 19.9s | +59.6% | 5,667 | 5,803 | 9,259 |
| **23** | Quantum Apex Gate | 41% | 23 | 2 | 2 | 2 | 58.8s | 11.4s | +80.6% | 4,420 | 4,214 | 6,246 |
| **24** | Bastion Ramparts | 40% | 26 | 2 | 2 | 2 | 55.5s | 20.1s | +63.8% | 6,205 | 8,398 | 6,383 |
| **25** | Shielded Bunker | 43% | 23 | 9 | 0 | 1 | 64.9s | 60.7s | +6.5% | 3,528 | 4,315 | 3,762 |
| **26** | Shield Wall Delta | 41% | 27 | 4 | 0 | 1 | 64.6s | 12.8s | +80.2% | 4,633 | 6,650 | 5,685 |
| **27** | Orbital Ring | 44% | 24 | 0 | 0 | 0 | 81.4s | 11.1s | +86.4% | 4,293 | 4,990 | 6,429 |
| **28** | Quantum Cataclysm | 39% | 39 | 1 | 4 | 1 | 41s | 12.9s | +68.5% | 9,223 | 5,550 | 9,583 |
| **29** | Quantum Lattice | 42% | 34 | 2 | 2 | 2 | 53.4s | 8.8s | +83.5% | 6,163 | 11,361 | 9,903 |
| **30** | Dreadnought Bastion | 45% | 35 | 3 | 2 | 2 | 62.7s | 45.1s | +28.1% | 7,806 | 6,233 | 8,550 |
| **31** | Crossed Sabers | 48% | 27 | 0 | 0 | 1 | 81.3s | 9.4s | +88.4% | 4,250 | 6,103 | 5,878 |
| **32** | Chaos Lattice | 50% | 22 | 2 | 2 | 4 | 85.7s | 18.8s | +78.1% | 5,823 | 5,689 | 6,997 |
| **33** | Pulse Bastion | 52% | 20 | 2 | 2 | 2 | 92.4s | 98.3s | -6.4% | 5,525 | 7,742 | 9,574 |
| **34** | Hypercube Warp | 50% | 26 | 3 | 2 | 1 | 79.8s | 20.4s | +74.4% | 4,378 | 4,581 | 6,305 |
| **35** | Omega Bastion | 42% | 41 | 4 | 2 | 2 | 44.9s | 15.4s | +65.7% | 5,837 | 8,100 | 7,979 |
| **36** | Titanium Vault Gate | 51% | 28 | 7 | 0 | 1 | 80.6s | 52s | +35.5% | 4,378 | 7,250 | 3,080 |
| **37** | Solar Flare | 50% | 31 | 0 | 0 | 1 | 89s | 16.6s | +81.3% | 4,505 | 7,301 | 6,930 |
| **38** | Genesis Overdrive | 45% | 44 | 1 | 2 | 1 | 58.3s | 11.7s | +79.9% | 14,110 | 11,831 | 8,076 |
| **39** | Cyber Trident Core | 47% | 40 | 2 | 0 | 1 | 67.4s | 28s | +58.5% | 6,460 | 6,930 | 6,405 |
| **40** | Obsidian Monolith | 56% | 25 | 3 | 0 | 3 | 135s | 35.1s | +74% | 13,048 | 5,583 | 5,965 |
| **41** | Hourglass Matrix | 49% | 38 | 0 | 0 | 0 | 81.6s | 12.5s | +84.7% | 16,065 | 7,893 | 13,355 |
| **42** | Grand Apex Reactor | 49% | 42 | 2 | 2 | 2 | 67.8s | 13.6s | +79.9% | 9,818 | 9,733 | 7,641 |
| **43** | Singularity Overdrive | 59% | 30 | 1 | 2 | 2 | 140.2s | 13s | +90.7% | 11,773 | 6,933 | 8,042 |
| **44** | Space Invader | 52% | 41 | 2 | 0 | 1 | 74.9s | 33.2s | +55.7% | 7,013 | 8,878 | 7,406 |
| **45** | Laser Citadel | 58% | 35 | 3 | 2 | 1 | 92.9s | 13.7s | +85.3% | 5,058 | 7,568 | 8,566 |
| **46** | Fortress Citadel 2 | 60% | 32 | 4 | 0 | 1 | 110.5s | 46.8s | +57.6% | 4,760 | 4,601 | 5,115 |
| **47** | Titan Citadel Core | 61% | 33 | 3 | 2 | 2 | 128.6s | 33.3s | +74.1% | 11,135 | 7,417 | 4,774 |
| **48** | Cyber Skull | 61% | 40 | 2 | 0 | 1 | 132.5s | 17.1s | +87.1% | 11,603 | 9,106 | 6,708 |
| **49** | Plasma Supernova | 62% | 47 | 0 | 0 | 2 | 122.3s | 11.7s | +90.4% | 14,238 | 10,156 | 9,230 |
| **50** | Anvil Core | 63% | 44 | 2 | 0 | 1 | 144.5s | 18.4s | +87.3% | 11,178 | 7,467 | 11,713 |

---

## 6. Sector-by-Sector Analysis & Difficulty Progression (5 Sectors x 10 Levels)

### Sector 1: Neon Alley (Levels 1–10) — Foundations & First Shockwaves
* **Difficulty Range**: `9% – 28%` (Average: `22.7%`)
* **Aesthetic & Mechanics**: Clean geometric shapes, introductory curves, single-hit crystals, and early exposure to the Countdown EMP Reactor (=8$).
* **Key Levels**:
  - **Level 1 (EMP Sparks)**: Tutorial detonator level (9% difficulty, 5.5s clear time on stock gear).
  - **Level 5 (Diamond Core)**: Balanced gem formation requiring deliberate side-wall angle bank shots.
  - **Level 10 (Doomsday Matrix)**: Sector climax featuring triple EMP reactors with a 26 HP effective load.

### Sector 2: Pulse Grid (Levels 11–20) — Kinetic Chains & Velocity
* **Difficulty Range**: `27% – 41%` (Average: `34.8%`)
* **Aesthetic & Mechanics**: Rapid velocity challenges, dual EMP detonations, staggered corridors, and quantum portal pairings (=7$).
* **Key Levels**:
  - **Level 11 (Cyber Chevron)**: Pure speed test, scaling down from 57.3s on stock gear to 10.4s on Overdrive (+81.8% speedup).
  - **Level 17 (Fortress Moat)**: First major encounter with Titanium moat barriers guarding high-value crystals.
  - **Level 20 (Genesis Arc)**: Broad horizontal span requiring accurate long-range paddle sweeps.

### Sector 3: Quantum Void (Levels 21–30) — Spatial Wormholes & Precision
* **Difficulty Range**: `36% – 45%` (Average: `41.0%`)
* **Aesthetic & Mechanics**: Portal labyrinths with ricochet hazards and fortified bunkers where direct line-of-sight is obstructed.
* **Key Levels**:
  - **Level 21 (Quantum Gateway Alpha)**: Gateway puzzle where ball trajectories warp across opposite quadrant boundaries.
  - **Level 25 (Shielded Bunker)**: Heavily guarded titanium vault (9 walls) demanding bank shot mastery.
  - **Level 30 (Dreadnought Bastion)**: Heavy assault cruiser formation bridging into expert sectors.

### Sector 4: Cyber Bastion (Levels 31–40) — Fortresses & Heavy Titanium Armor
* **Difficulty Range**: `42% – 56%` (Average: `49.0%`)
* **Aesthetic & Mechanics**: Titanium battlements, multi-layer armor (HP 4–5 crystals), and tight choke corridors.
* **Key Levels**:
  - **Level 33 (Pulse Bastion)**: Symmetrical armored bastion with dual reactors.
  - **Level 36 (Titanium Vault Gate)**: 7 Titanium blocks locking down top row crystals; requires disciplined wall banking.
  - **Level 40 (Obsidian Monolith)**: Severe endurance test with a 135s stock clear time that collapses to 35.1s on Overdrive.

### Sector 5: Hyper Core Overdrive (Levels 41–50) — Master Apex Gauntlets & Climax Bosses
* **Difficulty Range**: `49% – 63%` (Average: `56.7%`)
* **Aesthetic & Mechanics**: Full-spectrum cyber gauntlets featuring high-durability crystal lattices, dual warp portals, reactive countdown EMP reactors, and armored cores.
* **Key Levels**:
  - **Level 42 (Grand Apex Reactor)**: Multi-layer core reactor with 42 effective HP and double portals.
  - **Level 48 (Cyber Skull)**: Iconic boss skull layout with high spatial entropy and 40 effective HP.
  - **Level 49 (Plasma Supernova)**: Massive 47 HP crystal cluster delivering +90.4% speedup on Overdrive.
  - **Level 50 (Anvil Core)**: The ultimate campaign climax with 44 effective HP, fortified titanium anvil horns, and an intense 144.5s stock clear requirement.

---

## 7. Modular 10-File Architecture & Visual Grid Format

Rather than maintaining a massive monolithic 50-level file, the campaign is partitioned into **10 modular files of 5 levels each** under [`src/constants/levels/`](file:///Users/sourav/Developer/WEB/top-projects/breakout-ball/src/constants/levels):

```
src/constants/levels/
├── types.ts           # Visual grid parser & LevelTemplate factory
├── levels-01-05.ts    # Sector 1 Part 1 (Levels 01 - 05)
├── levels-06-10.ts    # Sector 1 Part 2 (Levels 06 - 10)
├── levels-11-15.ts    # Sector 2 Part 1 (Levels 11 - 15)
├── levels-16-20.ts    # Sector 2 Part 2 (Levels 16 - 20)
├── levels-21-25.ts    # Sector 3 Part 1 (Levels 21 - 25)
├── levels-26-30.ts    # Sector 3 Part 2 (Levels 26 - 30)
├── levels-31-35.ts    # Sector 4 Part 1 (Levels 31 - 35)
├── levels-36-40.ts    # Sector 4 Part 2 (Levels 36 - 40)
├── levels-41-45.ts    # Sector 5 Part 1 (Levels 41 - 45)
├── levels-46-50.ts    # Sector 5 Part 2 (Levels 46 - 50)
└── index.ts           # Unified barrel export (INITIAL_LOCAL_LEVELS: LevelData[])
```

### Visual 9-Column ASCII Grid Representation

Instead of verbose coordinate dictionaries (`{ x: 4, y: 2, h: 8 }`), levels are authored using intuitive **9-character ASCII strings** where each character maps to a grid column ($X \in [0, 8]$):

```typescript
import { LevelData } from '../../types/game';
import { createLevel } from './types';

export const level01: LevelData = createLevel({
  id: '1',
  name: 'Level 1: EMP Sparks',
  creator: 'sourav',
  playCount: 1500,
  startRow: 1, // First grid string maps to Row 1
  grid: [
    '  12321  ', // Row 1: Outer crystal shield
    '   282   ', // Row 2: Central EMP detonator
    '  11 11  ', // Row 3: Lower crystal wings
  ],
});
```

#### Character Mapping Legend:
* `'1'` to `'5'`: Destructible Crystals (Durability = 1 to 5 HP)
* `'6'` or `'W'`: Titanium Wall (Indestructible reflective obstacle)
* `'7'` or `'P'`: Quantum Portal (Paired warp gateway)
* `'8'` or `'E'`: Countdown EMP Detonator (3 bounces / 1 hit $\to$ 281.6px shockwave)
* `' '` or `'.'`: Empty space

---

## 8. Level Creation & Balancing Guidelines for Developers

When designing new levels in the Level Designer or adding stages to `src/constants/levels/`:

### 1. Managing Difficulty Rating ($D \in [0.00, 1.00]$)
*   **Casual / Introductory (Sector 1)**: Aim for $D = 0.15 - 0.35$. Keep breakable HP sum $\le 30$. Avoid placing Titanium walls directly beneath breakables.
*   **Intermediate (Sector 2–3)**: Aim for $D = 0.35 - 0.55$. Introduce 1–2 EMP reactors with at least 4 adjacent breakables. Wall density should stay under 20%.
*   **Challenging / Hard (Sector 4–5)**: Aim for $D = 0.55 - 0.85$. Use Tier 4–5 crystals, Titanium walls that require angled bank shots, and narrow portal gaps.

### 2. EMP Reactor ($h=8$) Best Practices
*   **The Blast Radius**: EMP shockwaves reach $281.6\text{ px}$ (2.2 blocks horizontal/vertical). Always place at least 3–5 breakable blocks within this perimeter.
*   **Avoid Wasted EMPs**: Never place an EMP isolated on a far corner where its shockwave hits only empty space or indestructible walls.
*   **Countdown Timing**: Since countdown ticks on paddle bounces (3 $\to$ 2 $\to$ 1 $\to$ 0), players can trigger detonations strategically by controlling paddle passes.

### 3. Titanium Wall ($h=6$) Best Practices
*   **Prevent Soft-Locks**: Never completely enclose breakable blocks in a sealed box of walls with no opening at least 1 block wide ($128\text{ px}$). The ball diameter is $\approx 56.3\text{ px}$ and needs a clearance of at least $64\text{ px}$ to pass.
*   **Top Pockets**: When placing a wall below a breakable brick, ensure there is an open side column so the ball can bank into the top row and hit the brick from behind.
*   **Wall Density Cap**: Keep wall density $\le 35\%$ of total blocks. Exceeding 40% turns the level into a pinball maze where players spend 80% of their time hitting indestructible metal instead of scoring.

### 4. Setting Target Scores and Star Thresholds
*   **1-Star (Pass)**: Set at $85\%$ of the Lowest Power baseline score. Any player who completes the level without losing all 3 lives earns 1 star.
*   **2-Star (Proficient)**: Set equal to the Balanced Power score. Requires maintaining 3x–5x combo multipliers.
*   **3-Star (Mastery)**: Set at $105\%$ of the Max Power score. Requires earning the fast completion time bonus ($\max(0, 1000 - \text{time} \times 25)$) and preserving all 3 lives.

---

## 9. CLI Developer Tool Reference

The automated level testing suite is fully integrated into the project:

### Run All 50 Built-In Levels
```bash
npm run test:levels
# or
node scripts/levelTester.mjs
```
*Executes static analysis and multi-tier headless physics simulation across all 50 levels in ~1 second, generating `./scripts/level-test-results.json`.*

### Test a Specific Level by ID or Name
```bash
node scripts/levelTester.mjs 7
node scripts/levelTester.mjs 50
node scripts/levelTester.mjs "Diamond Core"
node scripts/levelTester.mjs "Anvil Core"
```
*Outputs deep diagnostic telemetry, block breakdown, raycast shielding matrix, par times, star thresholds, and design balance flags for that specific level.*

### Custom Level Testing via Code
```javascript
import { testLevelComprehensive } from './scripts/levelTester.mjs';

const customLevel = {
  id: 'MY_LEVEL',
  name: 'Trial of Fire',
  blocks: [
    { x: 4, y: 2, h: 8 }, // EMP core
    { x: 3, y: 2, h: 3 }, { x: 5, y: 2, h: 3 },
    { x: 4, y: 1, h: 5 }
  ]
};

const telemetry = testLevelComprehensive(customLevel, 3);
console.log('Difficulty:', telemetry.difficulty);
console.log('Par Times:', telemetry.parTimes);
console.log('Star Scores:', telemetry.scores);
```
