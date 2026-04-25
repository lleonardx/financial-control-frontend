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
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import * as yup from 'yup';

import { useSnackbar } from '../components/feedback/SnackbarProvider';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
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
  const { showSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: accounts = [], isError: accountsError } = useQuery({
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

  const { data: categories = [], isError: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll()
  });

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.status !== TransactionStatus.PAID) return acc;

        if (item.type === TransactionType.INCOME) acc.income += Number(item.amount || 0);
        if (item.type === TransactionType.EXPENSE) acc.expense += Number(item.amount || 0);

        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const createMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSnackbar('Transação criada com sucesso!', 'success');
      handleClose();
    },
    onError: () => showSnackbar('Não foi possível salvar a transação.', 'error')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTransactionPayload }) =>
      transactionService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSnackbar('Transação atualizada com sucesso!', 'success');
      handleClose();
    },
    onError: () => showSnackbar('Não foi possível atualizar a transação.', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSnackbar('Transação removida com sucesso!', 'success');
      setDeleteId(null);
    },
    onError: () => {
      showSnackbar('Não foi possível remover a transação.', 'error');
      setDeleteId(null);
    }
  });

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const result = totals.income - totals.expense;

  if (isError || accountsError || categoriesError) {
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
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            right: -70,
            top: -80
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}
        >
          <Box>
            <Typography sx={{ opacity: 0.78, fontWeight: 800 }}>
              FinancialControl
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
              Transações
            </Typography>

            <Typography sx={{ opacity: 0.78, mt: 1, maxWidth: 650 }}>
              Cadastre receitas, despesas e acompanhe os lançamentos financeiros em tempo real.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 900,
              bgcolor: '#fff',
              color: '#1e3a8a',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)'
              }
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
        {[
          {
            label: 'Receitas pagas',
            value: money.format(totals.income),
            icon: <TrendingUpRoundedIcon />,
            color: '#16a34a',
            bg: 'rgba(22,163,74,0.10)'
          },
          {
            label: 'Despesas pagas',
            value: money.format(totals.expense),
            icon: <TrendingDownRoundedIcon />,
            color: '#dc2626',
            bg: 'rgba(220,38,38,0.10)'
          },
          {
            label: 'Resultado',
            value: money.format(result),
            icon: <PaidRoundedIcon />,
            color: result >= 0 ? '#16a34a' : '#dc2626',
            bg: result >= 0 ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.10)'
          }
        ].map((card) => (
          <Paper
            key={card.label}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider',
              transition: '0.2s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 18px 42px rgba(15,23,42,0.10)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 13 }}>
                  {card.label}
                </Typography>

                <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
                  {card.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: card.bg,
                  color: card.color
                }}
              >
                {card.icon}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 5,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '44px 220px 220px 1fr' },
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
              bgcolor: 'rgba(37,99,235,0.10)',
              color: 'primary.main'
            }}
          >
            <FilterAltRoundedIcon />
          </Box>

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
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}
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
            borderRadius: 5,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'rgba(15,23,42,0.02)'
          }}
        >
          <ReceiptLongRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />

          <Typography sx={{ fontWeight: 900 }}>
            Nenhuma transação encontrada
          </Typography>

          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Crie sua primeira receita ou despesa para começar.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ mt: 3, textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}
          >
            Criar primeira transação
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === TransactionType.INCOME;
            const mainColor = isIncome ? '#16a34a' : '#dc2626';
            const mainBg = isIncome ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.10)';

            return (
              <Paper
                key={transaction._id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 14px 34px rgba(15,23,42,0.08)'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: '54px 1.5fr 1fr 1fr 1fr auto'
                    },
                    gap: 2,
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: mainBg,
                      color: mainColor
                    }}
                  >
                    {isIncome ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 950, fontSize: 16 }}>
                      {transaction.description}
                    </Typography>

                    <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.3 }}>
                      {getAccountName(transaction.accountId)} • {getCategoryName(transaction.categoryId)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 800 }}>
                      Tipo
                    </Typography>

                    <Chip
                      size="small"
                      label={transactionTypeLabels[transaction.type]}
                      sx={{
                        mt: 0.5,
                        fontWeight: 800,
                        bgcolor: mainBg,
                        color: mainColor
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 800 }}>
                      Data
                    </Typography>

                    <Typography sx={{ fontWeight: 900, mt: 0.5 }}>
                      {getDateBR(transaction.date)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 800 }}>
                      Valor
                    </Typography>

                    <Typography sx={{ fontWeight: 950, mt: 0.5, color: mainColor }}>
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
                    sx={{ fontWeight: 800 }}
                  />

                  {transaction.paymentMethod && (
                    <Chip
                      size="small"
                      label={transaction.paymentMethod}
                      sx={{ fontWeight: 800 }}
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

      <Dialog open={!!deleteId} onClose={handleCancelDelete} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Confirmar exclusão</DialogTitle>

        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>
            Deseja realmente remover esta transação?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCancelDelete} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}