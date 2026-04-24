import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: Props) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f7fb',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, #f8fafc 45%, ${alpha(
          theme.palette.success.main,
          0.08
        )} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: 5,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            boxShadow: '0 30px 90px rgba(15, 23, 42, 0.12)'
          }}
        >
          <Grid container sx={{ minHeight: { xs: 'auto', md: 680 } }}>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                p: { xs: 4, md: 6 },
                color: '#fff',
                background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: 280,
                  height: 280,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  top: -80,
                  right: -80
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.06)',
                  bottom: -70,
                  left: -70
                }}
              />

              <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.24)'
                    }}
                  >
                    <AccountBalanceWalletRoundedIcon />
                  </Box>

                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      FinancialControl
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      Gestão financeira pessoal
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  <Chip
                    label="Organização • Controle • Clareza"
                    sx={{
                      width: 'fit-content',
                      color: '#fff',
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.20)'
                    }}
                  />

                  <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    Controle suas finanças com uma visão simples e inteligente.
                  </Typography>

                  <Typography sx={{ opacity: 0.78, maxWidth: 440 }}>
                    Acompanhe receitas, despesas, contas, metas e resultados mensais em um só lugar.
                  </Typography>
                </Stack>
              </Stack>

              <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                {[
                  { icon: <TrendingUpRoundedIcon />, text: 'Dashboard financeiro completo' },
                  { icon: <InsightsRoundedIcon />, text: 'Relatórios por categoria e período' },
                  { icon: <SecurityRoundedIcon />, text: 'Dados protegidos por autenticação JWT' }
                ].map((item) => (
                  <Stack
                    key={item.text}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.16)'
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontWeight: 600 }}>{item.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                p: { xs: 3, sm: 5, md: 7 },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Stack spacing={1} sx={{ mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {title}
                  </Typography>
                  <Typography color="text.secondary">{subtitle}</Typography>
                </Stack>

                {children}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}