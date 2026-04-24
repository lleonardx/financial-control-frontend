import { Button, Container, Paper, Stack, Typography } from '@mui/material';

import { useAuth } from '../auth/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800}>
            Dashboard
          </Typography>

          <Typography color="text.secondary">
            Bem-vindo, {user?.name}.
          </Typography>

          <Button variant="outlined" color="error" onClick={logout} sx={{ width: 160 }}>
            Sair
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}