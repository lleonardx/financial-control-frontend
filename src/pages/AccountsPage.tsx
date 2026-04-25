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
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import * as yup from 'yup';

import { accountService } from '../services/accountService';
import { useSnackbar } from '../components/feedback/SnackbarProvider';
import {
  AccountType,
  accountTypeLabels,
  type Account,
  type CreateAccountPayload
} from '../types/account';

const schema = yup.object({
  name: yup.string().required('Informe o nome da conta'),
  type: yup.mixed<AccountType>().required('Informe o tipo da conta'),
  initialBalance: yup.number().min(0, 'O saldo não pode ser negativo')
});

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function getAccountIcon(type: AccountType) {
  if (type === AccountType.CREDIT_CARD) return <CreditCardRoundedIcon />;
  if (type === AccountType.INVESTMENT) return <SavingsRoundedIcon />;
  if (type === AccountType.CASH) return <PaymentsRoundedIcon />;
  return <AccountBalanceWalletRoundedIcon />;
}

function getAccountColor(type: AccountType) {
  if (type === AccountType.CREDIT_CARD) {
    return {
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.10)'
    };
  }

  if (type === AccountType.INVESTMENT) {
    return {
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.10)'
    };
  }

  if (type === AccountType.CASH) {
    return {
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.10)'
    };
  }

  return {
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.10)'
  };
}

export function AccountsPage() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.findAll
  });

  const totalBalance = useMemo(() => {
    return data.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0);
  }, [data]);

  const investmentTotal = useMemo(() => {
    return data
      .filter((account) => account.type === AccountType.INVESTMENT)
      .reduce((sum, account) => sum + Number(account.currentBalance || 0), 0);
  }, [data]);

  const createMutation = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSnackbar('Conta criada com sucesso!', 'success');
      handleClose();
    },
    onError: () => {
      showSnackbar('Não foi possível salvar a conta.', 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAccountPayload }) =>
      accountService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSnackbar('Conta atualizada com sucesso!', 'success');
      handleClose();
    },
    onError: () => {
      showSnackbar('Não foi possível atualizar a conta.', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: accountService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSnackbar('Conta removida com sucesso!', 'success');
      setDeleteId(null);
    },
    onError: () => {
      showSnackbar('Não foi possível remover a conta.', 'error');
      setDeleteId(null);
    }
  });

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAccount(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isError) {
    return (
      <Alert severity="error">
        Erro ao carregar contas. Verifique a conexão com o servidor.
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
            gap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Box>
            <Typography sx={{ opacity: 0.78, fontWeight: 800 }}>
              FinancialControl
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
              Contas financeiras
            </Typography>

            <Typography sx={{ opacity: 0.78, mt: 1, maxWidth: 620 }}>
              Gerencie contas, carteiras, cartões e investimentos em uma visão centralizada.
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
            Nova conta
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
        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 13 }}>
                Saldo total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
                {money.format(totalBalance)}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(37, 99, 235, 0.10)',
                color: 'primary.main'
              }}
            >
              <AccountBalanceWalletRoundedIcon />
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 13 }}>
                Contas ativas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
                {data.length}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(124, 58, 237, 0.10)',
                color: '#7c3aed'
              }}
            >
              <AccountBalanceRoundedIcon />
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 13 }}>
                Investimentos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>
                {money.format(investmentTotal)}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(22, 163, 74, 0.10)',
                color: '#16a34a'
              }}
            >
              <SavingsRoundedIcon />
            </Box>
          </Box>
        </Paper>
      </Box>

      {isLoading ? (
        <Typography sx={{ color: 'text.secondary' }}>Carregando contas...</Typography>
      ) : data.length === 0 ? (
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
          <AccountBalanceWalletRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />

          <Typography sx={{ fontWeight: 900 }}>Nenhuma conta cadastrada</Typography>

          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Crie sua primeira conta para começar a registrar transações.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ mt: 3, textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}
          >
            Criar primeira conta
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              xl: 'repeat(3, 1fr)'
            },
            gap: 2.5
          }}
        >
          {data.map((account) => {
            const colors = getAccountColor(account.type);

            return (
              <Paper
                key={account._id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 5,
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
                    right: -26,
                    top: -26,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: colors.bg
                  }}
                />

                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: colors.bg,
                        color: colors.color
                      }}
                    >
                      {getAccountIcon(account.type)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(account)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remover">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(account._id)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 950, fontSize: 19 }}>
                      {account.name}
                    </Typography>

                    <Chip
                      label={accountTypeLabels[account.type]}
                      size="small"
                      sx={{
                        mt: 1,
                        fontWeight: 800,
                        borderRadius: 2,
                        bgcolor: colors.bg,
                        color: colors.color
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 800 }}>
                      Saldo atual
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 950 }}>
                      {money.format(account.currentBalance)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingAccount ? 'Editar conta' : 'Nova conta'}
        </DialogTitle>

        <Formik
          enableReinitialize
          initialValues={{
            name: editingAccount?.name ?? '',
            type: editingAccount?.type ?? AccountType.CHECKING,
            initialBalance: editingAccount?.initialBalance ?? 0
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            const payload: CreateAccountPayload = {
              name: values.name,
              type: values.type,
              initialBalance: Number(values.initialBalance || 0)
            };

            if (editingAccount) {
              updateMutation.mutate({ id: editingAccount._id, payload });
            } else {
              createMutation.mutate(payload);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Nome da conta"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name ? errors.name : ''}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Tipo"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.type && errors.type)}
                    helperText={touched.type && errors.type ? errors.type : ''}
                  >
                    {Object.values(AccountType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {accountTypeLabels[type]}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Saldo inicial"
                    name="initialBalance"
                    type="number"
                    value={values.initialBalance}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.initialBalance && errors.initialBalance)}
                    helperText={
                      touched.initialBalance && errors.initialBalance
                        ? errors.initialBalance
                        : ''
                    }
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
                  disabled={isSaving}
                  sx={{ textTransform: 'none', fontWeight: 800 }}
                >
                  {isSaving
                    ? 'Salvando...'
                    : editingAccount
                      ? 'Salvar alterações'
                      : 'Criar conta'}
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
            Deseja realmente remover esta conta?
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