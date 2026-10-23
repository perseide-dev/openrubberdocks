// src/core/utils/constants/radio.constants.ts
import type { RadioStation } from '@components/ui/types/radio.types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'darksynth',
    name: 'Nightride FM // Darksynth',
    genre: 'CYBERPUNK / DARKSYNTH',
    streamUrl: 'https://stream.nightride.fm/darksynth.mp3',
    bitrate: '320 KBPS',
    format: 'MP3',
    description: 'Aggressive cyberpunk, darkwave, industrial electronics, and retro dark synth.',
  },
  {
    id: 'nightwave-plaza',
    name: 'Nightwave Plaza',
    genre: 'VAPORWAVE / FUTURE FUNK',
    streamUrl: 'https://radio.plaza.one/mp3',
    bitrate: '128 KBPS',
    format: 'MP3',
    description: '24/7 internet radio broadcast playing vaporwave, future funk, synth, and retro aesthetic audio.',
  },
  {
    id: 'synthwave',
    name: 'Nightride FM // Synthwave',
    genre: 'RETROWAVE / OUTRUN',
    streamUrl: 'https://stream.nightride.fm/nightride.mp3',
    bitrate: '320 KBPS',
    format: 'MP3',
    description: 'High-octane neon retrowave, 80s inspired synth, and outrun electronic beats.',
  },
  {
    id: 'chillsynth',
    name: 'Nightride FM // Chillsynth',
    genre: 'LOFI / AMBIENT SYNTH',
    streamUrl: 'https://stream.nightride.fm/chillsynth.mp3',
    bitrate: '320 KBPS',
    format: 'MP3',
    description: 'Downtempo synth, calm ambient rhythms, and smooth melodic lofi textures for deep focus.',
  },
  {
    id: 'chiptune',
    name: 'Nightride FM // Chiptune',
    genre: '8-BIT / RETRO GAMING',
    streamUrl: 'https://stream.nightride.fm/chiptune.mp3',
    bitrate: '320 KBPS',
    format: 'MP3',
    description: 'Authentic 8-bit, tracker music, Gameboy audio synthesis, and demoscene classics.',
  },
  {
    id: 'flux-elektro',
    name: 'FluxFM // ElektroFlux',
    genre: 'TECHNO / ELECTRO',
    streamUrl: 'https://channels.fluxfm.de/elektro-flux/externalembedflxhp/stream.mp3',
    bitrate: '128 KBPS',
    format: 'MP3',
    description: 'Underground club beats, minimal techno, and pure electronic synthesis direct from Berlin.',
  },
  {
    id: 'flux-lounge',
    name: 'FluxFM // FluxLounge',
    genre: 'AMBIENT / DOWNTEMPO',
    streamUrl: 'https://channels.fluxfm.de/flux-lounge/externalembedflxhp/stream.mp3',
    bitrate: '128 KBPS',
    format: 'MP3',
    description: 'Relaxed ambient grooves, chilled electronic soundscapes, and atmospheric downtempo.',
  },
  {
    id: 'flux-main',
    name: 'FluxFM // Livestream',
    genre: 'INDIE / ALTERNATIVE',
    streamUrl: 'https://channels.fluxfm.de/FluxFM/externalembedflxhp/stream.mp3',
    bitrate: '128 KBPS',
    format: 'MP3',
    description: 'Curated alternative, indie rock, and modern urban electronic tracks.',
  },
];

export const CLIAMP_ASCII_LOGO = `
 ██████╗██╗     ██╗ █████╗ ███╗   ███╗██████╗ 
██╔════╝██║     ██║██╔══██╗████╗ ████║██╔══██╗
██║     ██║     ██║███████║██╔████╔██║██████╔╝
██║     ██║     ██║██╔══██║██║╚██╔╝██║██╔═══╝ 
╚██████╗███████╗██║██║  ██║██║ ╚═╝ ██║██║     
 ╚═════╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     
`;

export const DEFAULT_RADIO_VOLUME = 0.8;
export const EQUALIZER_BARS_COUNT = 32;
export const CLIAMP_STORAGE_KEY = 'openrubberdocks_cliamp_prefs';
