export interface ThemeColorPalette {
  main: string;
  light?: string;
  dark?: string;
  contrastText: string;
}

export interface ThemeColors {
  primary: ThemeColorPalette;
  secondary: ThemeColorPalette;
  background: {
    default: string;
    paper: string;
    subtle: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: {
    main: string;
    light: string;
  };
  accents: {
    yellow: string;
    orange: string;
    red: string;
    blue: string;
    green: string;
  };
  status: {
    error: string;
    warning: string;
    info: string;
    success: string;
  };
}
