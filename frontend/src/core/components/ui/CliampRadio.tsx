// src/core/components/ui/CliampRadio.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RadioIcon from '@mui/icons-material/Radio';
import TerminalIcon from '@mui/icons-material/Terminal';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

import { useCliampRadio } from '@global-hooks/useCliampRadio';
import { formatRadioTime } from '@utils-functions/radio.utils';
import { CLIAMP_ASCII_LOGO } from '@utils-constants/radio.constants';
import { CliampSpectrumCanvas } from '@components/ui/CliampSpectrumCanvas';
import type { CliampRadioProps, RadioStation } from '@components/ui/types/radio.types';

export const CliampRadio: React.FC<CliampRadioProps> = ({ defaultStationId }) => {
  const {
    currentStation,
    playbackState,
    volume,
    isMuted,
    elapsedSeconds,
    isCompact,
    isTuiOpen,
    stop,
    togglePlay,
    selectStation,
    nextStation,
    prevStation,
    setVolume,
    toggleMute,
    toggleCompact,
    toggleTui,
    stations,
  } = useCliampRadio(defaultStationId);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleStationClick = (station: RadioStation) => {
    selectStation(station);
    handleCloseMenu();
  };

  // Status color dot
  const getStatusDotColor = () => {
    switch (playbackState) {
      case 'playing':
        return '#00E676'; // Phosphor green
      case 'loading':
        return '#FFE600'; // Electric yellow
      case 'error':
        return '#FF3B30'; // Vermillion red
      case 'paused':
        return '#FFA726'; // Amber
      case 'idle':
      default:
        return '#777777'; // Gray
    }
  };

  return (
    <>
      {/* TOP DECK CONTAINER */}
      <Box
        component="section"
        aria-label="CLIAMP Terminal Radio"
        sx={{
          width: '100%',
          backgroundColor: 'background.paper',
          borderBottom: '2px solid',
          borderColor: 'divider',
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
      >
        {isCompact ? (
          /* COMPACT SLIM BAR MODE */
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingX: { xs: 1.5, sm: 2.5 },
              paddingY: 0.5,
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: getStatusDotColor(),
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  fontSize: '0.75rem',
                }}
              >
                CLIAMP//
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: playbackState === 'playing' ? 'text.primary' : 'text.secondary',
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                [{currentStation.name.toUpperCase()}]
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 60,
                  height: 16,
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'flex-end',
                }}
              >
                <CliampSpectrumCanvas isPlaying={playbackState === 'playing'} height={16} barCount={10} />
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                }}
              >
                {playbackState === 'loading' ? 'LOADING...' : formatRadioTime(elapsedSeconds)}
              </Typography>

              <IconButton
                size="small"
                onClick={togglePlay}
                aria-label={playbackState === 'playing' ? 'Pause radio' : 'Play radio'}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  padding: 0.25,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              >
                {playbackState === 'playing' ? (
                  <PauseIcon sx={{ fontSize: '0.9rem' }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: '0.9rem' }} />
                )}
              </IconButton>

              <Tooltip title="Expand CLIAMP Deck">
                <IconButton
                  size="small"
                  onClick={toggleCompact}
                  aria-label="Expand CLIAMP"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    padding: 0.25,
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          /* FULL CLIAMP RETRO TUI AUDIO DECK */
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              paddingX: { xs: 1.5, sm: 2.5 },
              paddingY: 0.75,
              gap: { xs: 1, md: 2 },
            }}
          >
            {/* LEFT: CLIAMP BRAND + TRANSPORT CONTROLS */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    backgroundColor: getStatusDotColor(),
                    flexShrink: 0,
                    animation: playbackState === 'playing' ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                  }}
                >
                  CLIAMP//
                </Typography>
              </Box>

              {/* TRANSPORT BUTTONS (BRUTALIST HARD KEYS) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title="Previous Station">
                  <IconButton
                    size="small"
                    onClick={prevStation}
                    aria-label="Previous station"
                    sx={{
                      border: '1.5px solid',
                      borderColor: 'divider',
                      padding: 0.5,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <SkipPreviousIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={playbackState === 'playing' ? 'Pause' : 'Play'}>
                  <IconButton
                    size="small"
                    onClick={togglePlay}
                    aria-label={playbackState === 'playing' ? 'Pause' : 'Play'}
                    sx={{
                      border: '1.5px solid',
                      borderColor: 'divider',
                      padding: 0.5,
                      backgroundColor: playbackState === 'playing' ? 'primary.main' : 'transparent',
                      color: playbackState === 'playing' ? 'primary.contrastText' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {playbackState === 'playing' ? (
                      <PauseIcon sx={{ fontSize: '1rem' }} />
                    ) : (
                      <PlayArrowIcon sx={{ fontSize: '1rem' }} />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Stop Audio">
                  <IconButton
                    size="small"
                    onClick={stop}
                    aria-label="Stop audio"
                    sx={{
                      border: '1.5px solid',
                      borderColor: 'divider',
                      padding: 0.5,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <StopIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Next Station">
                  <IconButton
                    size="small"
                    onClick={nextStation}
                    aria-label="Next station"
                    sx={{
                      border: '1.5px solid',
                      borderColor: 'divider',
                      padding: 0.5,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <SkipNextIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* CENTER: RETRO LCD / TUI DISPLAY SCREEN */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingX: 1.5,
                paddingY: 0.5,
                border: '1.5px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
                gap: 1.5,
                overflow: 'hidden',
              }}
            >
              {/* STATION INFO */}
              <Box sx={{ minWidth: { sm: 160, md: 220 }, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {currentStation.name.toUpperCase()}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: 'text.secondary',
                      display: { xs: 'none', lg: 'inline' },
                    }}
                  >
                    [{currentStation.bitrate}]
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color:
                        playbackState === 'playing'
                          ? '#00E676'
                          : playbackState === 'loading'
                          ? '#FFE600'
                          : 'text.secondary',
                    }}
                  >
                    // {playbackState.toUpperCase()} //
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      color: 'text.secondary',
                      display: { xs: 'none', sm: 'inline' },
                    }}
                  >
                    {currentStation.genre}
                  </Typography>
                </Box>
              </Box>

              {/* EQUALIZER VISUALIZER BARS (COVERS FULL AVAILABLE WIDTH WITH 0% CPU OVERHEAD) */}
              <Box
                sx={{
                  flex: 1,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'flex-end',
                  height: 26,
                  paddingX: { sm: 1, md: 2 },
                  minWidth: 80,
                  overflow: 'hidden',
                }}
              >
                <CliampSpectrumCanvas isPlaying={playbackState === 'playing'} height={26} />
              </Box>

              {/* LIVE TIME TICKER */}
              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    letterSpacing: '0.06em',
                    lineHeight: 1,
                    display: 'block',
                  }}
                >
                  {playbackState === 'loading' ? 'BUFF...' : formatRadioTime(elapsedSeconds)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    display: 'block',
                  }}
                >
                  TIME
                </Typography>
              </Box>
            </Box>

            {/* RIGHT: VOLUME + STATION MENU + TUI DRAWER BUTTON + MINIMIZE */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
                justifyContent: { xs: 'flex-end', md: 'flex-start' },
              }}
            >
              {/* STATION SELECTOR BUTTON */}
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenMenu}
                startIcon={<RadioIcon sx={{ fontSize: '0.9rem !important' }} />}
                sx={{
                  paddingX: 1,
                  paddingY: 0.3,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                }}
              >
                STATIONS
              </Button>

              <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
                sx={{
                  '& .MuiPaper-root': {
                    border: '1.5px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    boxShadow: 'none',
                    minWidth: 260,
                  },
                }}
              >
                {stations.map((st, index) => {
                  const isSelected = st.id === currentStation.id;
                  return (
                    <MenuItem
                      key={st.id}
                      onClick={() => handleStationClick(st)}
                      selected={isSelected}
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        paddingY: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        backgroundColor: isSelected ? 'primary.main !important' : 'transparent',
                        color: isSelected ? 'primary.contrastText !important' : 'text.primary',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main !important',
                          color: 'primary.contrastText !important',
                          '&:hover': {
                            backgroundColor: 'primary.main !important',
                            color: 'primary.contrastText !important',
                          },
                          '& .MuiTypography-root': {
                            color: 'primary.contrastText !important',
                          },
                        },
                        '&:hover': {
                          backgroundColor: isSelected ? 'primary.main !important' : 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: isSelected ? 'primary.contrastText !important' : 'text.primary',
                          }}
                        >
                          [{String(index + 1).padStart(2, '0')}] {st.name}
                        </Typography>
                        {isSelected && playbackState === 'playing' && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 900,
                              fontFamily: 'monospace',
                              color: '#FFE600 !important',
                            }}
                          >
                            // ON AIR
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          color: isSelected ? 'primary.contrastText !important' : 'text.secondary',
                          opacity: isSelected ? 0.9 : 1,
                          fontFamily: 'monospace',
                        }}
                      >
                        {st.genre} • {st.bitrate}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Menu>

              {/* VOLUME SLIDER & MUTE */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                  <IconButton
                    size="small"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    sx={{
                      border: '1.5px solid',
                      borderColor: 'divider',
                      padding: 0.5,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeOffIcon sx={{ fontSize: '0.95rem' }} />
                    ) : (
                      <VolumeUpIcon sx={{ fontSize: '0.95rem' }} />
                    )}
                  </IconButton>
                </Tooltip>

                <Box sx={{ width: { xs: 50, sm: 65 }, display: 'flex', alignItems: 'center' }}>
                  <Slider
                    size="small"
                    value={isMuted ? 0 : volume * 100}
                    onChange={(_, val) => setVolume((val as number) / 100)}
                    aria-label="Volume"
                    sx={{
                      color: 'primary.main',
                      height: 4,
                      '& .MuiSlider-thumb': {
                        width: 10,
                        height: 10,
                        borderRadius: 0,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* TUI EXPAND DECK */}
              <Tooltip title="Open CLIAMP Terminal Deck">
                <IconButton
                  size="small"
                  onClick={toggleTui}
                  aria-label="Open CLIAMP Deck"
                  sx={{
                    border: '1.5px solid',
                    borderColor: 'divider',
                    padding: 0.5,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  <TerminalIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>

              {/* MINIMIZE TO SLIM BAR */}
              <Tooltip title="Minimize to Slim Bar">
                <IconButton
                  size="small"
                  onClick={toggleCompact}
                  aria-label="Minimize CLIAMP"
                  sx={{
                    border: '1.5px solid',
                    borderColor: 'divider',
                    padding: 0.5,
                  }}
                >
                  <ExpandLessIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>

      {/* FULL CLIAMP TERMINAL DASHBOARD MODAL */}
      <Dialog
        open={isTuiOpen}
        onClose={toggleTui}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 0,
            border: '2px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            backgroundColor: 'background.paper',
            padding: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingX: 1,
            paddingY: 1,
            borderBottom: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon />
            <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.05em' }}>
              CLIAMP//AUDIO_DECK_TUI v2.4
            </Typography>
          </Box>

          <IconButton size="small" onClick={toggleTui} aria-label="Close Deck">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ paddingX: 1, paddingY: 2 }}>
          {/* ASCII BANNER */}
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: { xs: '0.45rem', sm: '0.65rem' },
              lineHeight: 1.1,
              fontWeight: 900,
              color: 'primary.main',
              margin: 0,
              padding: 1.5,
              border: '1.5px solid',
              borderColor: 'divider',
              backgroundColor: 'background.default',
              overflowX: 'auto',
            }}
          >
            {CLIAMP_ASCII_LOGO}
          </Box>

          {/* ACTIVE STATUS TELEMETRY */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
              gap: 1.5,
              marginTop: 2,
            }}
          >
            <Box sx={{ border: '1.5px solid', borderColor: 'divider', padding: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block' }}>
                // ENGINE_STATUS
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                {playbackState.toUpperCase()} [VOL: {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}]
              </Typography>
            </Box>

            <Box sx={{ border: '1.5px solid', borderColor: 'divider', padding: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block' }}>
                // STREAM_CODEC
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                {currentStation.format} // {currentStation.bitrate}
              </Typography>
            </Box>

            <Box sx={{ border: '1.5px solid', borderColor: 'divider', padding: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block' }}>
                // UPTIME_SESSION
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                {formatRadioTime(elapsedSeconds)} (BUFFER: ACTIVE)
              </Typography>
            </Box>
          </Box>

          {/* FULL EQUALIZER VISUALIZER GRAPH (GPU ACCELERATED CANVAS) */}
          <Box
            sx={{
              marginTop: 2,
              border: '1.5px solid',
              borderColor: 'divider',
              padding: 2,
              backgroundColor: 'background.default',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                // REALTIME_SPECTRUM_ANALYZER [32 BANDS]
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: playbackState === 'playing' ? '#00E676' : 'text.secondary',
                  fontWeight: 700,
                }}
              >
                {playbackState === 'playing' ? '// AUDIO_SYNC: LOCKED' : '// AUDIO_SYNC: IDLE'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 75, width: '100%' }}>
              <CliampSpectrumCanvas isPlaying={playbackState === 'playing'} height={75} />
            </Box>
          </Box>

          {/* FULL STATION DIRECTORY */}
          <Typography
            variant="overline"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              display: 'block',
              marginTop: 2.5,
              marginBottom: 1,
            }}
          >
            // RADIO CHANNELS DIRECTORY
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {stations.map((station, index) => {
              const isSelected = station.id === currentStation.id;
              return (
                <Box
                  key={station.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    padding: 1.5,
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    backgroundColor: isSelected ? 'primary.main !important' : 'transparent',
                    color: isSelected ? 'primary.contrastText !important' : 'text.primary',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: isSelected ? 'primary.contrastText !important' : 'text.primary',
                        }}
                      >
                        [CH {String(index + 1).padStart(2, '0')}] {station.name}
                      </Typography>
                      {isSelected && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 900,
                            color: '#FFE600 !important',
                          }}
                        >
                          // {playbackState.toUpperCase()}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: isSelected ? 'primary.contrastText !important' : 'text.secondary',
                        opacity: isSelected ? 0.9 : 1,
                        display: 'block',
                        marginTop: 0.25,
                      }}
                    >
                      {station.description}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (isSelected) {
                        togglePlay();
                      } else {
                        selectStation(station);
                      }
                    }}
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                      backgroundColor: isSelected ? 'background.paper' : 'transparent',
                      color: isSelected ? 'text.primary !important' : 'inherit',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'primary.contrastText' : 'divider',
                      '&:hover': {
                        backgroundColor: isSelected ? 'background.default' : 'primary.main',
                        color: isSelected ? 'text.primary !important' : 'primary.contrastText !important',
                      },
                    }}
                  >
                    {isSelected && playbackState === 'playing' ? 'PAUSE' : 'TUNE IN'}
                  </Button>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
