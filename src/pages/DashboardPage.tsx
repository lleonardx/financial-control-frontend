import { Box, Paper, Typography, Alert, Chip } from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../auth/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { TransactionType, transactionTypeLabels } from '../types/transaction';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function getMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(getMonthValue())
  });

  if (isError) {
    return (
      <Alert severity="error">
        Erro ao carregar dashboard. Verifique a conexão com o servidor.
      </Alert>
    );
  }

  const cards = [
    {
      title: 'Saldo total',
      value: money.format(data?.cards.totalBalance ?? 0),
      icon: <AccountBalanceWalletRoundedIcon />,
      color: 'primary.main'
    },
    {
      title: 'Receitas do mês',
      value: money.format(data?.cards.income ?? 0),
      icon: <TrendingUpRoundedIcon />,
      color: 'success.main'
    },
    {
      title: 'Despesas do mês',
      value: money.format(data?.cards.expense ?? 0),
      icon: <TrendingDownRoundedIcon />,
      color: 'error.main'
    },
    {
      title: 'Resultado do mês',
      value: money.format(data?.cards.result ?? 0),
      icon: <SavingsRoundedIcon />,
      color: (data?.cards.result ?? 0) >= 0 ? 'success.main' : 'error.main'
    }
  ];

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
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2.5
        }}
      >
        {cards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {card.title}
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>
                  {isLoading ? 'Carregando...' : card.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(37, 99, 235, 0.08)',
                  color: card.color
                }}
              >
                {card.icon}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' },
          gap: 2.5
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
            Últimas transações
          </Typography>

          {data?.recentTransactions?.length ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.recentTransactions.map((transaction) => {
                const isIncome = transaction.type === TransactionType.INCOME;

                return (
                  <Box
                    key={transaction._id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        {transaction.description}
                      </Typography>
                      <Chip
                        size="small"
                        label={transactionTypeLabels[transaction.type]}
                        color={isIncome ? 'success' : 'error'}
                        sx={{ mt: 1, fontWeight: 700 }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: isIncome ? 'success.main' : 'error.main'
                      }}
                    >
                      {isIncome ? '+' : '-'} {money.format(transaction.amount)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography sx={{ color: 'text.secondary' }}>
              Nenhuma transação encontrada.
            </Typography>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
            Despesas por categoria
          </Typography>

          {data?.categoryExpenses?.length ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.categoryExpenses.map((item) => (
                <Box
                  key={item.categoryId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(15,23,42,0.03)'
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {item.categoryName}
                  </Typography>

                  <Typography sx={{ fontWeight: 900 }}>
                    {money.format(item.total)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: 'text.secondary' }}>
              Nenhuma despesa categorizada neste mês.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}