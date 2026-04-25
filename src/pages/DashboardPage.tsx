import {
  Alert,
  Box,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../auth/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { TransactionType, transactionTypeLabels } from '../types/transaction';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
  bg
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative',
        overflow: 'hidden',
        transition: '0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 42px rgba(15,23,42,0.10)'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -24,
          top: -24,
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: bg
        }}
      />

      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 13 }}>
            {title}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 950, mt: 1 }}>
            {value}
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.6 }}>
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: bg,
            color
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary', getCurrentMonth()],
    queryFn: () => dashboardService.getSummary(getCurrentMonth())
  });

  if (isError) {
    return <Alert severity="error">Erro ao carregar dashboard.</Alert>;
  }

  const income = data?.cards.income ?? 0;
  const expense = data?.cards.expense ?? 0;
  const result = data?.cards.result ?? 0;
  const totalBalance = data?.cards.totalBalance ?? 0;
  const accountsCount = data?.cards.accountsCount ?? 0;
  const transactionCount = data?.recentTransactions?.length ?? 0;

  const expensePercent = income > 0 ? Math.min((expense / income) * 100, 100) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e3a8a 52%, #2563eb 100%)',
          color: '#fff',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            right: -70,
            top: -90
          }}
        />

        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ opacity: 0.75, fontWeight: 700 }}>
            FinancialControl Analytics
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
            Olá, {user?.name}
          </Typography>

          <Typography sx={{ opacity: 0.78, mt: 1, maxWidth: 680 }}>
            Acompanhe sua saúde financeira, lançamentos recentes e despesas categorizadas do mês atual.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2.5 }}>
            <Chip
              label={`${accountsCount} contas ativas`}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.14)',
                fontWeight: 800
              }}
            />
            <Chip
              label={`${transactionCount} últimas transações`}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.14)',
                fontWeight: 800
              }}
            />
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
          gap: 2.5
        }}
      >
        <DashboardCard
          title="Saldo total"
          value={isLoading ? 'Carregando...' : money.format(totalBalance)}
          subtitle="Soma das contas ativas"
          icon={<AccountBalanceWalletRoundedIcon />}
          color="#2563eb"
          bg="rgba(37, 99, 235, 0.10)"
        />

        <DashboardCard
          title="Receitas do mês"
          value={isLoading ? 'Carregando...' : money.format(income)}
          subtitle="Entradas confirmadas"
          icon={<TrendingUpRoundedIcon />}
          color="#16a34a"
          bg="rgba(22, 163, 74, 0.10)"
        />

        <DashboardCard
          title="Despesas do mês"
          value={isLoading ? 'Carregando...' : money.format(expense)}
          subtitle={`${expensePercent.toFixed(0)}% das receitas`}
          icon={<TrendingDownRoundedIcon />}
          color="#dc2626"
          bg="rgba(220, 38, 38, 0.10)"
        />

        <DashboardCard
          title="Resultado mensal"
          value={isLoading ? 'Carregando...' : money.format(result)}
          subtitle={result >= 0 ? 'Resultado positivo' : 'Atenção ao orçamento'}
          icon={<SavingsRoundedIcon />}
          color={result >= 0 ? '#16a34a' : '#dc2626'}
          bg={result >= 0 ? 'rgba(22, 163, 74, 0.10)' : 'rgba(220, 38, 38, 0.10)'}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.9fr' },
          gap: 2.5
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 5,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(37,99,235,0.10)',
                color: 'primary.main'
              }}
            >
              <ReceiptLongRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950 }}>
                Últimas transações
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                Movimentações recentes registradas
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {data?.recentTransactions?.length ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
              {data.recentTransactions.map((transaction) => {
                const isIncome = transaction.type === TransactionType.INCOME;

                return (
                  <Box
                    key={transaction._id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(15,23,42,0.025)',
                      border: '1px solid rgba(15,23,42,0.05)',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                      gap: 1.5,
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>
                        {transaction.description}
                      </Typography>

                      <Chip
                        size="small"
                        label={transactionTypeLabels[transaction.type]}
                        color={isIncome ? 'success' : 'error'}
                        sx={{ mt: 1, fontWeight: 800 }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 950,
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(124,58,237,0.10)',
                  color: '#7c3aed'
                }}
              >
                <InsightsRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                  Uso da receita
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                  Percentual comprometido no mês
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 800 }}>Despesas / Receitas</Typography>
                <Typography sx={{ fontWeight: 950 }}>{expensePercent.toFixed(0)}%</Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={expensePercent}
                sx={{
                  height: 10,
                  borderRadius: 99,
                  bgcolor: 'rgba(15,23,42,0.08)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 99
                  }
                }}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(239,68,68,0.10)',
                  color: 'error.main'
                }}
              >
                <CategoryRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                  Despesas por categoria
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                  Categorias com maior gasto
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {data?.categoryExpenses?.length ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.categoryExpenses.map((item) => {
                  const percent = expense > 0 ? Math.min((item.total / expense) * 100, 100) : 0;

                  return (
                    <Box key={item.categoryId}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                          {item.categoryName}
                        </Typography>
                        <Typography sx={{ fontWeight: 950 }}>
                          {money.format(item.total)}
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          bgcolor: 'rgba(15,23,42,0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 99
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                Nenhuma despesa categorizada neste mês.
              </Typography>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(37,99,235,0.10)',
                  color: 'primary.main'
                }}
              >
                <PaymentsRoundedIcon />
              </Box>

              <Box>
                <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 800 }}>
                  Contas cadastradas
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 950 }}>
                  {accountsCount}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}