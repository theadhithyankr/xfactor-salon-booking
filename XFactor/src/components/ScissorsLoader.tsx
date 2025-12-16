import { Box, keyframes } from '@mui/material';

const cutAnimation = keyframes`
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(calc(100vw + 100px));
  }
`;

const snipAnimation = keyframes`
  0%, 100% {
    transform: translateX(-100px) rotate(0deg);
  }
  50% {
    transform: translateX(-100px) rotate(-15deg);
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export default function ScissorsLoader() {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                overflow: 'hidden'
            }}
        >
            {/* Dashed Line Container */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Left part of line (already cut) */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        height: '3px',
                        width: '50%',
                        borderTop: '3px dashed rgba(255, 0, 0, 0.3)',
                        animation: `${fadeOut} 1.2s ease-in-out infinite`,
                    }}
                />

                {/* Right part of line (to be cut) */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        height: '3px',
                        width: '50%',
                        borderTop: '3px dashed #FF0000',
                    }}
                />

                {/* Scissors SVG */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        animation: `${cutAnimation} 1.2s ease-in-out infinite`,
                    }}
                >
                    <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            animation: `${snipAnimation} 0.3s ease-in-out infinite`,
                            transformOrigin: 'center',
                        }}
                    >
                        {/* Scissors Icon */}
                        <path
                            d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"
                            fill="#FF0000"
                        />
                    </svg>
                </Box>
            </Box>

            {/* Optional: Brand name or tagline */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '30%',
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    opacity: 0.7
                }}
            >
                XFACTOR
            </Box>
        </Box>
    );
}
