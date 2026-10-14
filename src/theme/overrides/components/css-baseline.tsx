import { alpha, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function CssBaseline(theme: Theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          backgroundColor: theme.palette.background.default,
          // Veu da cor de fundo por cima do padrao: atenua-o para o texto que
          // assenta directamente no fundo manter contraste.
          backgroundImage: `linear-gradient(${alpha(
            theme.palette.background.default,
            0.55
          )}, ${alpha(theme.palette.background.default, 0.55)}), ${
            theme.palette.mode === 'light'
              ? 'url(/assets/backgrounds/financeiq-watermark.svg)'
              : 'url(/assets/backgrounds/financeiq-watermark-dark.svg)'
          }`,
          // Em telemovel as paginas sao densas e o padrao so tira legibilidade.
          [theme.breakpoints.down('sm')]: {
            backgroundImage: 'none',
          },
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        },
        '#root, #__next': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          maxWidth: '100%',
          display: 'inline-block',
          verticalAlign: 'bottom',
        },
        // Adicionar scroll suave e melhorias de acessibilidade
        '::-webkit-scrollbar': {
          width: 12,
          height: 12,
        },
        '::-webkit-scrollbar-track': {
          background: theme.palette.background.neutral,
        },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.grey[400],
          borderRadius: 6,
          '&:hover': {
            background: theme.palette.grey[500],
          },
        },
      },
    },
  };
}
