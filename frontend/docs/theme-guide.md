# Digital Brutalist Theme Guide & Styling Rules

This guide documents the global **Contemporary Digital Brutalist** theme in **OpenRubberDocks**, its styling principles, the dynamic local color override system (`colors.ts`), component authoring rules, and practical use cases.

---

## 1. Design Philosophy & Visual Language

The design language combines **Contemporary Neo-Brutalism**, **Flat Technical Wireframes**, and **Swiss-Grotesk Typography** (inspired by cutting-edge digital design studios and technical specifications).

### Core Aesthetic Pillars:
1. **Strict 90° Geometry (`borderRadius: 0`)**: No rounded pills, no soft card corners. Every single component (buttons, inputs, cards, dialogs, badges, switches) is razor-sharp.
2. **Zero Drop Shadows (Pure Flat Wireframe)**: All gaussian blur and offset drop shadows are completely eliminated (`boxShadow: none !important`). Elevation is communicated strictly through wireframe borders and high-contrast plane fills.
3. **Solid Technical Borders**: Every boundary is marked with crisp, solid black lines (`1.5px` to `2px solid #000000`).
4. **High-Contrast Typography**:
   - **Space Grotesk**: Heavy uppercase headings (`h1` through `h5`), buttons, and navigation labels.
   - **Space Mono**: Technical tags, parameters (`//STATUS_`, `//THEME_`), table headers, input labels, and timestamps.
5. **High-Voltage Accent Highlights**: While the baseline remains pure black and white, bold accent blocks (e.g., Electric Yellow `#FFE600`, Vermillion Red `#FF3B30`, Safety Orange `#FF5522`) are used to punctuate critical actions and visual anchors.

---

## 2. Component Authoring Golden Rule: Layout Only

> [!IMPORTANT]
> **Components MUST NOT write inline borders, corner radii, or color styles.**
> 
> * **Prohibited in components**: `border: '1px solid black'`, `borderRadius: 4`, `backgroundColor: '#000'`, `boxShadow: '...'`.
> * **Allowed in components**: Dimensional and structural properties only: `display`, `flexDirection`, `gap`, `gridTemplateColumns`, `width`, `height`, `padding`, `margin`, `alignItems`, `justifyContent`.

All visual styling (borders, colors, hover transitions, typography, focus outlines) is **100% pre-configured inside the global MUI theme** (`src/core/theme/theme.ts`).

---

## 3. Dynamic Color System & Git-Ignored `colors.ts`

The platform includes a dynamic color resolution architecture that allows developers to customize theme colors locally without polluting Git commits.

### How it Works:

```
                  ┌───────────────────────────────┐
                  │ Does `colors.ts` exist?       │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
              YES │                               │ NO
                 ▼                               ▼
  ┌──────────────────────────────┐ ┌──────────────────────────────┐
  │ Merge `colors.ts` on top of   │ │ Use standard default colors  │
  │ defaultColors                │ │ (default-colors.ts)          │
  └──────────────┬───────────────┘ └──────────────┬───────────────┘
                 │                                │
                 └───────────────┬────────────────┘
                                 ▼
                  ┌───────────────────────────────┐
                  │ `activeColors` loaded in      │
                  │ `src/core/theme/theme.ts`     │
                  └───────────────────────────────┘
```

1. **`colors.ts` is in `.gitignore`**:
   - Local color modifications will never be committed to version control or break CI/CD pipelines.
2. **Safe Dynamic Loader (`colors.loader.ts`)**:
   - Uses Vite's `import.meta.glob('./colors.ts', { eager: true })`.
   - If `colors.ts` does **not** exist, Vite returns an empty object `{}` without throwing any compile-time or runtime module resolution error. The theme falls back smoothly to `defaultColors`.
   - If `colors.ts` is created, Vite automatically deep-merges your custom overrides on top of `defaultColors`.
3. **Template Provided (`colors.example.ts`)**:
   - A ready-to-use template file is tracked in git.

### Step-by-Step: Enabling Custom Colors Locally

To test or apply custom studio accents (e.g., Electric Yellow, Cyberpunk Neon, or Vermillion):

1. **Copy the example template**:
   ```bash
   cp src/core/theme/colors.example.ts src/core/theme/colors.ts
   ```
2. **Edit values in `src/core/theme/colors.ts`**:
   ```typescript
   import type { ThemeColors } from './colors.interface';

   export const colors: Partial<ThemeColors> = {
     secondary: {
       main: '#FFE600', // Electric yellow accent (e.g. for CTAs)
       contrastText: '#000000',
     },
     accents: {
       yellow: '#FFE600',
       orange: '#FF5522',
       red: '#FF3B30',
       blue: '#0066FF',
       green: '#00CC66',
     },
   };

   export default colors;
   ```
3. **Instant Hot Reload**: Vite will instantly reload the UI with your custom colors.

---

## 4. Theme Color Tokens Reference

The `ThemeColors` interface provides the following palette structure:

| Token Category | Key | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **Primary** | `primary.main` | `#000000` | Dominant text, solid buttons, active states |
| **Primary Contrast**| `primary.contrastText` | `#FFFFFF` | Text on top of primary elements |
| **Secondary** | `secondary.main` | `#FFFFFF` | Inverse backgrounds or custom accent color |
| **Background** | `background.default` | `#FFFFFF` | Global body canvas |
| **Paper** | `background.paper` | `#FFFFFF` | Card and modal surfaces |
| **Subtle** | `background.subtle` | `#F5F5F3` | Table headers, secondary containers |
| **Border** | `border.main` | `#000000` | Wireframe dividing lines (1.5px - 2px) |
| **Accent Yellow**| `accents.yellow` | `#FFE600` | Studio highlight, high-priority badges |
| **Accent Red** | `accents.red` | `#FF3B30` | Bold numbered callouts, alert banners |
| **Accent Orange**| `accents.orange` | `#FF5522` | Secondary warning or warm highlight |

---

## 5. Practical Use Cases & Code Examples

### Use Case 1: Standard Wireframe Container (Zero Style Overrides)
Notice that the container only specifies layout and dimensions. All borders, fonts, and headers are automatically applied by the theme:

```tsx
import React from 'react';
import { Card, CardHeader, CardContent, Button, Box, Typography } from '@mui/material';

export const ProjectCard = () => {
  return (
    <Card sx={{ width: '100%', maxWidth: 600 }}>
      <CardHeader 
        title="PROJECT # 765" 
        subheader="// DIGITAL WIREFRAME // 2026"
        action={<Button variant="contained" size="small">OPEN</Button>}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1">
          This card automatically inherits a 1.5px solid black border, zero border-radius,
          and a structured header separator without writing a single border CSS rule.
        </Typography>
      </CardContent>
    </Card>
  );
};
```

---

### Use Case 2: Action Button with Accent Highlight (e.g. "START A PROJECT")
To achieve the bold studio accent button seen in the reference mockup:

```tsx
import React from 'react';
import { Button, useTheme } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

export const StartProjectButton = () => {
  const theme = useTheme();

  return (
    <Button
      variant="contained"
      endIcon={<ArrowOutwardIcon />}
      sx={{
        backgroundColor: theme.palette.accent.yellow,
        color: '#000000',
        '&:hover': {
          backgroundColor: '#000000',
          color: theme.palette.accent.yellow,
        },
      }}
    >
      START A PROJECT
    </Button>
  );
};
```

---

### Use Case 3: Brutalist Numbered Section / Step List
Replicating the iconic `01`, `02`, `03` numbered list from the "BRUT." reference image:

```tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface StepItemProps {
  number: string;
  title: string;
  category: string;
  highlight?: boolean;
}

export const StepItem: React.FC<StepItemProps> = ({ number, title, category, highlight }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '100px 1fr',
        borderBottom: `1.5px solid ${theme.palette.border.main}`,
        backgroundColor: highlight ? theme.palette.accent.red : 'transparent',
        color: highlight ? '#FFFFFF' : '#000000',
      }}
    >
      {/* Big Bold Monospace Number */}
      <Box
        sx={{
          borderRight: `1.5px solid ${theme.palette.border.main}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Typography variant="h2" sx={{ color: 'inherit' }}>
          {number}
        </Typography>
      </Box>

      {/* Description */}
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h5" sx={{ color: 'inherit' }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>
          {category}
        </Typography>
      </Box>
    </Box>
  );
};
```

---

### Use Case 4: Form Input with Technical Labels
Inputs automatically render with square outlines, monospace uppercase labels, and clean focus states:

```tsx
import React from 'react';
import { Box, TextField, Button } from '@mui/material';

export const NewsletterForm = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', maxWidth: 500 }}>
      <TextField
        label="// ENTER YOUR EMAIL_"
        placeholder="user@domain.com"
        fullWidth
        size="small"
      />
      <Button variant="contained" sx={{ height: 40, px: 3 }}>
        SUBSCRIBE
      </Button>
    </Box>
  );
};
```

---

## 6. Usage Rules: DOs and DON'Ts

### ✅ DOs
1. **Trust the Theme**: Rely on default MUI component variants (`contained`, `outlined`, `text`) for standard styling.
2. **Use Semantic Typography**: Use `<Typography variant="overline">` or `<Typography variant="caption">` for technical labels (`//CODE_`).
3. **Use the Theme Tokens**: When an accent is needed, reference `theme.palette.accent.yellow` or `theme.palette.border.main` rather than hardcoding arbitrary hex strings.
4. **Keep Local Overrides Local**: Put your custom palette experimentation in `src/core/theme/colors.ts`, knowing it will stay untracked in Git.

### ❌ DON'Ts
1. **Never Add Rounded Borders**: Never specify `borderRadius: 4`, `borderRadius: '8px'`, or `pill`.
2. **Never Add Drop Shadows**: Never write `boxShadow: '0 4px 6px rgba(0,0,0,0.1)'` or similar soft shadows.
3. **Never Hardcode Common Borders in Components**: Do not clutter component JSX with `sx={{ border: '1.5px solid black' }}` when `<Card>`, `<Paper>`, or `<Button>` already has it built-in.
4. **Never Commit `colors.ts`**: The file is listed in `.gitignore` on purpose to prevent developer-specific overrides from conflicting in the shared repository.
