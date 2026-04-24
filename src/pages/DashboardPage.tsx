import { Box, Paper, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Olá, {user?.name}
        </Typography>

        <Typography sx={{ color: 'text.secondary', mt: 1 }}>
          Bem-vindo ao seu painel do FinancialControl.
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5
        }}
      >
        {['Saldo total', 'Receitas do mês', 'Despesas do mês'].map((title) => (
          <Paper
            key={title}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {title}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
              R$ 0,00
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}