import { createTheme, type Theme } from '@mui/material/styles';
import { activeColors } from './colors.loader';

declare module '@mui/material/styles' {
  interface Palette {
    accent: {
      yellow: string;
      orange: string;
      red: string;
      blue: string;
      green: string;
    };
    border: {
      main: string;
      light: string;
    };
  }
  interface PaletteOptions {
    accent?: {
      yellow?: string;
      orange?: string;
      red?: string;
      blue?: string;
      green?: string;
    };
    border?: {
      main?: string;
      light?: string;
    };
  }
}

/**
 * OpenRubberDocks Contemporary Digital Brutalist MUI Theme (Flat Wireframe Edition)
 * Inspired by high-contrast monochrome technical wireframes, Swiss-grotesk typography,
 * and razor-sharp flat borders without drop shadows.
 * 
 * CORE RULES APPLIED GLOBALLY:
 * - borderRadius: 0 everywhere (strict 90-degree corners, no rounded pills)
 * - Pure flat aesthetic: ZERO drop shadows (boxShadow: none across all components and elevations)
 * - Solid crisp borders (1.5px to 2px solid #000000 / activeColors.border.main)
 * - Inversion on hover (black <-> white) for tactile responsive feedback
 * - Dynamic color support via git-ignored `colors.ts` (falls back to defaultColors)
 * - Technical typography (Space Grotesk for headings/body, Space Mono for data/labels)
 */
export const brutalistTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: activeColors.primary.main,
      light: activeColors.primary.light ?? '#222222',
      dark: activeColors.primary.dark ?? '#000000',
      contrastText: activeColors.primary.contrastText,
    },
    secondary: {
      main: activeColors.secondary.main,
      light: activeColors.secondary.light ?? '#FFFFFF',
      dark: activeColors.secondary.dark ?? '#F0F0F0',
      contrastText: activeColors.secondary.contrastText,
    },
    background: {
      default: activeColors.background.default,
      paper: activeColors.background.paper,
    },
    text: {
      primary: activeColors.text.primary,
      secondary: activeColors.text.secondary,
      disabled: activeColors.text.disabled,
    },
    divider: activeColors.border.main,
    border: {
      main: activeColors.border.main,
      light: activeColors.border.light,
    },
    accent: {
      yellow: activeColors.accents.yellow,
      orange: activeColors.accents.orange,
      red: activeColors.accents.red,
      blue: activeColors.accents.blue,
      green: activeColors.accents.green,
    },
    action: {
      active: activeColors.text.primary,
      hover: 'rgba(0, 0, 0, 0.05)',
      selected: activeColors.primary.main,
      disabled: activeColors.text.disabled,
      disabledBackground: '#E0E0E0',
    },
    error: {
      main: activeColors.status.error,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: activeColors.status.warning,
      contrastText: '#000000',
    },
    info: {
      main: activeColors.status.info,
      contrastText: '#FFFFFF',
    },
    success: {
      main: activeColors.status.success,
      contrastText: '#FFFFFF',
    },
  },

  shape: {
    borderRadius: 0,
  },

  // Disable all default MUI elevation shadows
  shadows: [
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],

  typography: {
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '-0.03em',
      fontSize: '2.5rem',
      lineHeight: 1.1,
      color: activeColors.text.primary,
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '-0.02em',
      fontSize: '2rem',
      lineHeight: 1.15,
      color: activeColors.text.primary,
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '-0.01em',
      fontSize: '1.5rem',
      lineHeight: 1.2,
      color: activeColors.text.primary,
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      fontSize: '1.25rem',
      lineHeight: 1.3,
      color: activeColors.text.primary,
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      fontSize: '1rem',
      lineHeight: 1.4,
      color: activeColors.text.primary,
    },
    h6: {
      fontFamily: '"Space Mono", monospace',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: activeColors.text.primary,
    },
    subtitle1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#222222',
    },
    subtitle2: {
      fontFamily: '"Space Mono", monospace',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: activeColors.text.secondary,
    },
    body1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: activeColors.text.primary,
    },
    body2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#333333',
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontSize: '0.875rem',
    },
    caption: {
      fontFamily: '"Space Mono", monospace',
      fontWeight: 400,
      fontSize: '0.75rem',
      letterSpacing: '0.04em',
      color: activeColors.text.secondary,
    },
    overline: {
      fontFamily: '"Space Mono", monospace',
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: activeColors.text.primary,
    },
  },

  components: {
    // 1. Global Baseline & Custom Flat Scrollbars
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
          borderRadius: '0px !important',
          boxShadow: 'none',
        },
        body: {
          backgroundColor: activeColors.background.default,
          color: activeColors.text.primary,
          fontFamily: '"Space Grotesk", sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::selection': {
          backgroundColor: activeColors.primary.main,
          color: activeColors.primary.contrastText,
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: activeColors.background.default,
          border: `1px solid ${activeColors.border.main}`,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: activeColors.border.main,
          borderRadius: 0,
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#333333',
        },
      },
    },

    // 2. Buttons (Flat high-contrast inversion)
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          border: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          transition: 'background-color 0.1s ease, color 0.1s ease, border-color 0.1s ease',
          padding: '8px 20px',
        },
        contained: {
          backgroundColor: activeColors.primary.main,
          color: activeColors.primary.contrastText,
          border: `1.5px solid ${activeColors.border.main}`,
          '&:hover': {
            backgroundColor: activeColors.secondary.main,
            color: activeColors.secondary.contrastText,
            borderColor: activeColors.border.main,
          },
          '&.Mui-disabled': {
            backgroundColor: '#E5E5E5',
            color: activeColors.text.disabled,
            borderColor: activeColors.text.disabled,
          },
        },
        outlined: {
          backgroundColor: activeColors.secondary.main,
          color: activeColors.secondary.contrastText,
          border: `1.5px solid ${activeColors.border.main}`,
          '&:hover': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
            borderColor: activeColors.border.main,
          },
          '&.Mui-disabled': {
            backgroundColor: activeColors.background.default,
            color: activeColors.text.disabled,
            borderColor: activeColors.text.disabled,
          },
        },
        text: {
          border: '1.5px solid transparent',
          '&:hover': {
            backgroundColor: activeColors.background.subtle,
            borderColor: activeColors.border.main,
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.75rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
      },
    },

    // 3. Icon Buttons (Flat square)
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          backgroundColor: activeColors.background.paper,
          color: activeColors.text.primary,
          padding: '8px',
          boxShadow: 'none !important',
          transition: 'background-color 0.1s ease, color 0.1s ease',
          '&:hover': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
          },
          '&.Mui-disabled': {
            borderColor: activeColors.text.disabled,
            color: activeColors.text.disabled,
          },
        },
      },
    },

    // 4. Button Group
    MuiButtonGroup: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none !important',
        },
        grouped: {
          borderRadius: 0,
          '&:not(:last-of-type)': {
            borderRight: `1.5px solid ${activeColors.border.main}`,
          },
        },
      },
    },

    // 5. Cards & Paper (Flat Wireframe boxes)
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          backgroundColor: activeColors.background.paper,
          overflow: 'visible',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          borderBottom: `1.5px solid ${activeColors.border.main}`,
          padding: '14px 20px',
          backgroundColor: '#FAFAFA',
        },
        title: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: '1.125rem',
        },
        subheader: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          borderTop: `1.5px solid ${activeColors.border.main}`,
          padding: '12px 20px',
          backgroundColor: '#FAFAFA',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          backgroundColor: activeColors.background.paper,
          backgroundImage: 'none',
          boxShadow: 'none !important',
        },
      },
    },

    // 6. Text Fields & Form Inputs
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: activeColors.background.paper,
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 500,
          boxShadow: 'none !important',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColors.border.main,
            borderWidth: '1.5px',
            borderRadius: 0,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColors.border.main,
            borderWidth: '1.5px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColors.border.main,
            borderWidth: '2px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColors.status.error,
            borderWidth: '1.5px',
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColors.text.disabled,
          },
        },
        input: {
          padding: '10px 14px',
          fontSize: '0.9375rem',
          color: activeColors.text.primary,
          '&::placeholder': {
            color: '#666666',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontWeight: 700,
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: activeColors.text.primary,
          '&.Mui-focused': {
            color: activeColors.text.primary,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
          marginTop: '4px',
          color: activeColors.text.secondary,
          '&.Mui-error': {
            color: activeColors.status.error,
            fontWeight: 700,
          },
        },
      },
    },

    // 7. Select & Menus (Flat popover)
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: activeColors.text.primary,
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          marginTop: '4px',
        },
        list: {
          padding: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: '10px 16px',
          borderBottom: `1px solid ${activeColors.border.light}`,
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
          },
          '&.Mui-selected': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
            fontWeight: 700,
            '&:hover': {
              backgroundColor: '#222222',
            },
          },
        },
      },
    },

    // 8. Checkbox & Radio
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: activeColors.border.main,
          borderRadius: 0,
          padding: '6px',
          '&.Mui-checked': {
            color: activeColors.border.main,
          },
          '& .MuiSvgIcon-root': {
            borderRadius: 0,
            fontSize: '1.25rem',
          },
        },
      },
    },
    MuiRadio: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: activeColors.border.main,
          padding: '6px',
          '&.Mui-checked': {
            color: activeColors.border.main,
          },
        },
      },
    },

    // 9. Switch (Flat rectangular industrial toggle)
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 24,
          padding: 0,
          display: 'flex',
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(22px)',
            color: activeColors.primary.main,
            '& + .MuiSwitch-track': {
              backgroundColor: activeColors.background.paper,
              opacity: 1,
              borderColor: activeColors.border.main,
            },
          },
        },
        thumb: {
          width: 18,
          height: 18,
          borderRadius: 0,
          backgroundColor: activeColors.primary.main,
          boxShadow: 'none !important',
        },
        track: {
          borderRadius: 0,
          opacity: 1,
          backgroundColor: '#E5E5E5',
          border: `1.5px solid ${activeColors.border.main}`,
          boxSizing: 'border-box',
        },
      },
    },

    // 10. Chips & Badges (Flat labels)
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          backgroundColor: activeColors.background.paper,
          color: activeColors.text.primary,
          fontFamily: '"Space Mono", monospace',
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          height: 26,
          boxShadow: 'none !important',
        },
        filled: {
          backgroundColor: activeColors.primary.main,
          color: activeColors.primary.contrastText,
        },
        outlined: {
          backgroundColor: activeColors.background.paper,
          color: activeColors.text.primary,
        },
        deleteIcon: {
          color: 'inherit',
          '&:hover': {
            color: activeColors.status.error,
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          borderRadius: 0,
          border: `1px solid ${activeColors.border.main}`,
          fontFamily: '"Space Mono", monospace',
          fontWeight: 700,
          fontSize: '0.6875rem',
          backgroundColor: activeColors.primary.main,
          color: activeColors.primary.contrastText,
          boxShadow: 'none !important',
        },
      },
    },

    // 11. Tables (Full Wireframe Grid as seen in mockup)
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'collapse',
          border: `1.5px solid ${activeColors.border.main}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: activeColors.background.subtle,
          borderBottom: `1.5px solid ${activeColors.border.main}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${activeColors.border.main}`,
          '&:hover': {
            backgroundColor: '#F7F7F5',
          },
          '&.Mui-selected': {
            backgroundColor: '#EBEBE8',
            '&:hover': {
              backgroundColor: '#E0E0DC',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${activeColors.border.main}`,
          borderRight: `1px solid ${activeColors.border.main}`,
          padding: '12px 16px',
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '0.875rem',
          color: activeColors.text.primary,
          '&:last-child': {
            borderRight: 'none',
          },
        },
        head: {
          fontFamily: '"Space Mono", monospace',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '0.8125rem',
          color: activeColors.text.primary,
        },
      },
    },

    // 12. Dialogs & Modals (Flat wireframe modal)
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `2px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          backgroundColor: activeColors.background.paper,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: `1.5px solid ${activeColors.border.main}`,
          padding: '16px 24px',
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: '1.25rem',
          backgroundColor: '#FAFAFA',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1.5px solid ${activeColors.border.main}`,
          padding: '16px 24px',
          backgroundColor: '#FAFAFA',
        },
      },
    },

    // 13. Drawer / Sidebar
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: `1.5px solid ${activeColors.border.main}`,
          borderLeft: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          backgroundColor: activeColors.background.paper,
        },
      },
    },

    // 14. Tabs
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1.5px solid ${activeColors.border.main}`,
          minHeight: 42,
        },
        indicator: {
          backgroundColor: activeColors.primary.main,
          height: 3,
          borderRadius: 0,
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.06em',
          fontSize: '0.875rem',
          minHeight: 42,
          padding: '8px 20px',
          color: activeColors.text.secondary,
          borderRight: `1px solid ${activeColors.border.light}`,
          '&:hover': {
            color: activeColors.text.primary,
            backgroundColor: '#F7F7F5',
          },
          '&.Mui-selected': {
            color: activeColors.text.primary,
            fontWeight: 700,
          },
        },
      },
    },

    // 15. Accordion (Flat wireframe panels)
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
        disableGutters: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '0 !important',
          border: `1.5px solid ${activeColors.border.main}`,
          marginBottom: '8px',
          boxShadow: 'none !important',
          '&::before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '0 0 8px 0',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          backgroundColor: '#FAFAFA',
          borderBottom: '1px solid transparent',
          '&.Mui-expanded': {
            borderBottomColor: activeColors.border.main,
          },
        },
        content: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px',
          backgroundColor: activeColors.background.paper,
        },
      },
    },

    // 16. Dividers
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: activeColors.border.main,
          borderWidth: '1px',
          opacity: 1,
        },
      },
    },

    // 17. Alerts (Flat notification box)
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 16px',
          color: activeColors.text.primary,
          '& .MuiAlert-icon': {
            color: activeColors.text.primary,
          },
          '&.MuiAlert-colorSuccess': {
            backgroundColor: '#E8F5E9',
          },
          '&.MuiAlert-colorError': {
            backgroundColor: '#FFEBEE',
          },
          '&.MuiAlert-colorWarning': {
            backgroundColor: '#FFF3E0',
          },
          '&.MuiAlert-colorInfo': {
            backgroundColor: '#E1F5FE',
          },
        },
      },
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
      },
    },

    // 18. Tooltip (Flat box)
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: activeColors.primary.main,
          color: activeColors.primary.contrastText,
          border: `1px solid ${activeColors.border.main}`,
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.75rem',
          padding: '6px 10px',
          boxShadow: 'none !important',
        },
        arrow: {
          color: activeColors.primary.main,
        },
      },
    },

    // 19. Linear & Circular Progress
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          height: 10,
          backgroundColor: activeColors.background.paper,
        },
        bar: {
          borderRadius: 0,
          backgroundColor: activeColors.primary.main,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: activeColors.primary.main,
        },
      },
    },

    // 20. Pagination (Flat square buttons)
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPagination-ul': {
            gap: '4px',
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1.5px solid ${activeColors.border.main}`,
          fontFamily: '"Space Mono", monospace',
          fontWeight: 700,
          margin: 0,
          boxShadow: 'none !important',
          '&:hover': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
          },
          '&.Mui-selected': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
            '&:hover': {
              backgroundColor: '#222222',
            },
          },
        },
      },
    },

    // 21. Slider (Flat technical slider)
    MuiSlider: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          height: 4,
          color: activeColors.primary.main,
        },
        track: {
          borderRadius: 0,
          backgroundColor: activeColors.primary.main,
          border: 'none',
        },
        rail: {
          borderRadius: 0,
          backgroundColor: '#E5E5E5',
          border: `1px solid ${activeColors.border.main}`,
          opacity: 1,
        },
        thumb: {
          borderRadius: 0,
          width: 14,
          height: 14,
          backgroundColor: activeColors.background.paper,
          border: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
          '&:hover, &.Mui-focusVisible, &.Mui-active': {
            backgroundColor: activeColors.primary.main,
            boxShadow: 'none !important',
          },
        },
      },
    },

    // 22. AppBar (Flat navigation bar)
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: activeColors.background.paper,
          color: activeColors.text.primary,
          borderBottom: `1.5px solid ${activeColors.border.main}`,
          boxShadow: 'none !important',
        },
      },
    },

    // 23. Breadcrumbs
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.8125rem',
          color: activeColors.text.secondary,
        },
        separator: {
          color: activeColors.border.main,
          fontWeight: 700,
        },
      },
    },

    // 24. List & ListItem
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          borderBottom: `1px solid ${activeColors.border.light}`,
          '&:hover': {
            backgroundColor: activeColors.background.subtle,
          },
          '&.Mui-selected': {
            backgroundColor: activeColors.primary.main,
            color: activeColors.primary.contrastText,
            '&:hover': {
              backgroundColor: '#1E1E1E',
            },
          },
        },
      },
    },

    // 25. Skeleton
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: '#EAEAEA',
        },
      },
    },
  },
});
