# Artistic Auras — Design System (from Stitch)

Source: Stitch project `15862468903779873735`, screens fetched 2026-07-19.
Originals in `stitch/{mint,landing,gallery,shader}/`.

## Color System (Material Design 3, dark theme)

### Floor & Surfaces
| Token | Value | Usage |
|---|---|---|
| `--floor` | `#0a0a0f` | Page background (Level 0) |
| `--surface` | `#131318` | Base surface / background |
| `--surface-dim` | `#131318` | Dimmed surface |
| `--surface-bright` | `#39383e` | Bright surface |
| `--surface-container-lowest` | `#0e0e13` | Lowest container |
| `--surface-container-low` | `#1b1b20` | Low container |
| `--surface-container` | `#1f1f25` | Default container |
| `--surface-container-high` | `#2a292f` | High container |
| `--surface-container-highest` | `#35343a` | Highest container |
| `--surface-variant` | `#35343a` | Variant surface |
| `--glass-panel` | `rgba(26, 26, 46, 0.7)` | Glassmorphism surface (Level 1) |

### Primary (Purple)
| Token | Value | Usage |
|---|---|---|
| `--primary` | `#d2bbff` | Primary text/accent (light purple) |
| `--primary-container` | `#7c3aed` | Buttons, active states (the brand purple) |
| `--on-primary` | `#3f008e` | Text on primary |
| `--on-primary-container` | `#ede0ff` | Text on primary-container |
| `--inverse-primary` | `#732ee4` | Inverse primary |

### Secondary (Pink)
| Token | Value | Usage |
|---|---|---|
| `--secondary` | `#ffb0cd` | Secondary accent |
| `--secondary-container` | `#aa0266` | Secondary container |
| `--on-secondary` | `#640039` | Text on secondary |
| `--on-secondary-container` | `#ffbad3` | Text on secondary-container |

### Tertiary (Amber/Gold)
| Token | Value | Usage |
|---|---|---|
| `--tertiary` | `#ffb95f` | Tertiary accent (rarity: Legendary) |
| `--tertiary-container` | `#905b00` | Tertiary container |
| `--on-tertiary` | `#472a00` | Text on tertiary |
| `--on-tertiary-container` | `#ffe1c0` | Text on tertiary-container |

### Outline & Text
| Token | Value | Usage |
|---|---|---|
| `--outline` | `#958da1` | Outlines, labels |
| `--outline-variant` | `#4a4455` | Subtle borders |
| `--on-surface` | `#e4e1e9` | Primary text |
| `--on-surface-variant` | `#ccc3d8` | Secondary text |
| `--on-background` | `#e4e1e9` | Text on background |

### Error
| Token | Value |
|---|---|
| `--error` | `#ffb4ab` |
| `--error-container` | `#93000a` |
| `--on-error` | `#690005` |
| `--on-error-container` | `#ffdad6` |

## Typography

| Role | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Display LG | Space Grotesk | 72px | 700 | 1.1 (letterSpacing -0.02em) |
| Headline LG | Space Grotesk | 48px | 700 | 1.2 |
| Headline MD | Space Grotesk | 32px | 600 | 1.3 |
| Headline LG Mobile | Space Grotesk | 32px | 700 | 1.2 |
| Body LG | Inter | 18px | 400 | 1.6 |
| Body MD | Inter | 16px | 400 | 1.6 |
| Label SM | JetBrains Mono | 12px | 500 | 1.0 (letterSpacing 0.05em) |

## Spacing

| Token | Value |
|---|---|
| `margin-desktop` | 64px |
| `margin-mobile` | 20px |
| `unit` | 8px |
| `gutter` | 24px |
| `container-max` | 1440px |

## Border Radius

| Token | Value |
|---|---|
| DEFAULT | 0.25rem |
| lg | 0.5rem |
| xl | 0.75rem |
| full | 9999px |

## Glassmorphism

### `.glass-panel`
```css
background: rgba(26, 26, 46, 0.7);
backdrop-filter: blur(20px);
border: 0.5px solid rgba(255, 255, 255, 0.1);
```

### `.glass-card-rounded` (with gradient border)
```css
background: rgba(26, 26, 46, 0.7);
backdrop-filter: blur(20px);
border-radius: 0.75rem;
/* gradient border via ::before mask */
```

### `.glass-panel-hover` / `.aura-hover`
```css
box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
border-color: rgba(255, 255, 255, 0.4);
```

## Buttons

### `.btn-primary`
```css
background-color: #7c3aed;
color: white;
/* hover: */ box-shadow: 0 0 15px rgba(124, 58, 237, 0.8); transform: translateY(-1px);
```

### Connect Wallet button
Rounded-full, `bg-primary-container`, `border border-white/20`, `hover:shadow-[0_0_15px_rgba(124,58,237,0.6)]`

## WebGL Aurora Shader

Fragment shader colors:
- `color1`: `vec3(0.04, 0.04, 0.06)` — Deep Purple/Black
- `color2`: `vec3(0.48, 0.22, 0.93)` — Primary Purple (#7c3aed)
- `color3`: `vec3(0.92, 0.28, 0.60)` — Pink (#ec4899)

Effect: flowing aurora via sin/cos noise, smoothstep mixing, vignette.
Used as `fixed inset-0 z-0 pointer-events-none opacity-60` on landing page.

## Layout Patterns

### TopNavBar
- `sticky top-0 z-50`
- `bg-surface/70 backdrop-blur-xl`
- `border-b border-white/20`
- `shadow-[0_0_20px_rgba(124,58,237,0.1)]`
- Container: `max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4`

### Footer
- `bg-surface-container-lowest`
- `border-t border-outline-variant/30`
- `py-12`

### Body background
```css
background-color: #0a0a0f;
background-image: radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.15), transparent 60%),
                  radial-gradient(circle at -20% 80%, rgba(255, 176, 205, 0.05), transparent 50%);
```

## Rarity Colors (Gallery)

| Rarity | Text | Border | BG |
|---|---|---|---|
| Common | `text-outline` | `border-outline/30` | `bg-surface-variant/30` |
| Rare | `text-secondary` | `border-secondary/30` | `bg-secondary-container/30` |
| Epic | `text-primary` | `border-primary/30` | `bg-primary-container/30` |
| Legendary | `text-tertiary` | `border-tertiary/30` | `bg-tertiary-container/30` |
