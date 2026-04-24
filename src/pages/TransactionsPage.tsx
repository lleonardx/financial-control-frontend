import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import * as yup from 'yup';

import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import type { Account } from '../types/account';
import {
  TransactionStatus,
  TransactionType,
  transactionStatusLabels,
  transactionTypeLabels,
  type CreateTransactionPayload,
  type Transaction,
  type TransactionCategory
} from '../types/transaction';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const schema = yup.object({
  accountId: yup.string().required('Informe a conta'),
  categoryId: yup.string().required('Informe a categoria'),
  type: yup.mixed<TransactionType>().required('Informe o tipo'),
  description: yup.string().required('Informe a descrição'),
  amount: yup.number().positive('Informe um valor maior que zero').required('Informe o valor'),
  date: yup.string().required('Informe a data'),
  status: yup.mixed<TransactionStatus>().required('Informe o status'),
  paymentMethod: yup.string().optional(),
  notes: yup.string().optional()
});

function getAccountName(account: string | Account) {
  return typeof account === 'string' ? '-' : account.name;
}

function getCategoryName(category: string | TransactionCategory) {
  return typeof category === 'string' ? '-' : category.name;
}

function getDateBR(date: string) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  });
}

function getStatusColor(status: TransactionStatus) {
  if (status === TransactionStatus.PAID) return 'success';
  if (status === TransactionStatus.OVERDUE) return 'error';
  return 'warning';
}

export function TransactionsPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState('');

  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const {
    data: accounts = [],
    isError: accountsError
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.findAll
  });

  const {
    data: transactions = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['transactions', filterType, filterStatus],
    queryFn: () =>
      transactionService.findAll({
        type: filterType ? (filterType as TransactionType) : undefined,
        status: filterStatus ? (filterStatus as TransactionStatus) : undefined
      })
  });

  /**
   * Temporário:
   * Como ainda não montamos a tela/service de categorias,
   * vamos deixar vazio por enquanto.
   * No próximo passo vamos criar categoryService e trocar esse array por API.
   */
  const categories: TransactionCategory[] = [];

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.status !== TransactionStatus.PAID) return acc;

        if (item.type === TransactionType.INCOME) {
          acc.income += Number(item.amount || 0);
        }

        if (item.type === TransactionType.EXPENSE) {
          acc.expense += Number(item.amount || 0);
        }

        return acc;
      },
      {
        income: 0,
        expense: 0
      }
    );
  }, [transactions]);

  const createMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
    },
    onError: () => {
      setError('Não foi possível salvar a transação.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTransactionPayload }) =>
      transactionService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
    },
    onError: () => {
      setError('Não foi possível atualizar a transação.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setError('');
    setOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTransaction(null);
    setError('');
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Deseja realmente remover esta transação?');

    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isError || accountsError) {
    return (
      <Alert severity="error">
        Erro ao carregar transações. Verifique a conexão com o servidor.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Transações
            </Typography>

            <Typography sx={{ color: 'text.secondary' }}>
              Cadastre receitas, despesas e acompanhe os lançamentos financeiros.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 800
            }}
          >
            Nova transação
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5
        }}
      >
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Receitas pagas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: 'success.main' }}>
            {money.format(totals.income)}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Despesas pagas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: 'error.main' }}>
            {money.format(totals.expense)}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Resultado
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            {money.format(totals.income - totals.expense)}
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px 220px 1fr' },
            gap: 2
          }}
        >
          <TextField
            select
            fullWidth
            label="Tipo"
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.values(TransactionType).map((type) => (
              <MenuItem key={type} value={type}>
                {transactionTypeLabels[type]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Status"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.values(TransactionStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {transactionStatusLabels[status]}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterType('');
                setFilterStatus('');
              }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Limpar filtros
            </Button>
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <Typography sx={{ color: 'text.secondary' }}>Carregando transações...</Typography>
      ) : transactions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>Nenhuma transação encontrada</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Crie sua primeira receita ou despesa para começar.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === TransactionType.INCOME;

            return (
              <Paper
                key={transaction._id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: '44px 1.4fr 1fr 1fr 140px 90px'
                    },
                    gap: 2,
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: isIncome ? 'rgba(46, 125, 50, 0.10)' : 'rgba(211, 47, 47, 0.10)',
                      color: isIncome ? 'success.main' : 'error.main'
                    }}
                  >
                    {isIncome ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>
                      {transaction.description}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {getAccountName(transaction.accountId)} • {getCategoryName(transaction.categoryId)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>
                      Tipo
                    </Typography>
                    <Chip
                      size="small"
                      label={transactionTypeLabels[transaction.type]}
                      color={isIncome ? 'success' : 'error'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>
                      Data
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {getDateBR(transaction.date)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>
                      Valor
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: isIncome ? 'success.main' : 'error.main'
                      }}
                    >
                      {isIncome ? '+' : '-'} {money.format(transaction.amount)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEdit(transaction)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Remover">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(transaction._id)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    icon={<PaidRoundedIcon />}
                    label={transactionStatusLabels[transaction.status]}
                    color={getStatusColor(transaction.status)}
                    sx={{ fontWeight: 700 }}
                  />

                  {transaction.paymentMethod && (
                    <Chip
                      size="small"
                      label={transaction.paymentMethod}
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingTransaction ? 'Editar transação' : 'Nova transação'}
        </DialogTitle>

        <Formik
          enableReinitialize
          initialValues={{
            accountId:
              typeof editingTransaction?.accountId === 'string'
                ? editingTransaction.accountId
                : editingTransaction?.accountId?._id ?? '',
            categoryId:
              typeof editingTransaction?.categoryId === 'string'
                ? editingTransaction.categoryId
                : editingTransaction?.categoryId?._id ?? '',
            type: editingTransaction?.type ?? TransactionType.EXPENSE,
            description: editingTransaction?.description ?? '',
            amount: editingTransaction?.amount ?? 0,
            date: editingTransaction?.date
              ? editingTransaction.date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            status: editingTransaction?.status ?? TransactionStatus.PAID,
            paymentMethod: editingTransaction?.paymentMethod ?? '',
            notes: editingTransaction?.notes ?? ''
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            const payload: CreateTransactionPayload = {
              accountId: values.accountId,
              categoryId: values.categoryId,
              type: values.type,
              description: values.description,
              amount: Number(values.amount || 0),
              date: values.date,
              status: values.status,
              paymentMethod: values.paymentMethod,
              notes: values.notes
            };

            if (editingTransaction) {
              updateMutation.mutate({
                id: editingTransaction._id,
                payload
              });
            } else {
              createMutation.mutate(payload);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                  {error && <Alert severity="error">{error}</Alert>}

                  <TextField
                    select
                    fullWidth
                    label="Tipo"
                    name="type"
                    value={values.type}
                    onChange={(event) => {
                      setFieldValue('type', event.target.value);
                      setFieldValue('categoryId', '');
                    }}
                    onBlur={handleBlur}
                    error={Boolean(touched.type && errors.type)}
                    helperText={touched.type && errors.type ? errors.type : ''}
                  >
                    {Object.values(TransactionType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {transactionTypeLabels[type]}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Conta"
                    name="accountId"
                    value={values.accountId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.accountId && errors.accountId)}
                    helperText={touched.accountId && errors.accountId ? errors.accountId : ''}
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account._id} value={account._id}>
                        {account.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Categoria"
                    name="categoryId"
                    value={values.categoryId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.categoryId && errors.categoryId)}
                    helperText={
                      categories.length === 0
                        ? 'Cadastre categorias antes de criar transações'
                        : touched.categoryId && errors.categoryId
                          ? errors.categoryId
                          : ''
                    }
                    disabled={categories.length === 0}
                  >
                    {categories
                      .filter((category) => category.type === values.type)
                      .map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description ? errors.description : ''}
                  />

                  <TextField
                    fullWidth
                    label="Valor"
                    name="amount"
                    type="number"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.amount && errors.amount)}
                    helperText={touched.amount && errors.amount ? errors.amount : ''}
                  />

                  <TextField
                    fullWidth
                    label="Data"
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.date && errors.date)}
                    helperText={touched.date && errors.date ? errors.date : ''}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.status && errors.status)}
                    helperText={touched.status && errors.status ? errors.status : ''}
                  >
                    {Object.values(TransactionStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {transactionStatusLabels[status]}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Forma de pagamento"
                    name="paymentMethod"
                    value={values.paymentMethod}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Observações"
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving || categories.length === 0}
                  sx={{ textTransform: 'none', fontWeight: 800 }}
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingTransaction
                      ? 'Salvar alterações'
                      : 'Criar transação'}
                </Button>
              </DialogActions>
            </Box>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}