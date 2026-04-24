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
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import * as yup from 'yup';

import { accountService } from '../services/accountService';
import {
  AccountType,
  accountTypeLabels,
  type Account,
  type CreateAccountPayload
} from '../types/account';

const schema = yup.object({
  name: yup.string().required('Informe o nome da conta'),
  type: yup.string().required('Informe o tipo da conta'),
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

export function AccountsPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [error, setError] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.findAll
  });

  const totalBalance = useMemo(() => {
    return data.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0);
  }, [data]);

  const createMutation = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
    },
    onError: () => {
      setError('Não foi possível salvar a conta.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAccountPayload }) =>
      accountService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
    },
    onError: () => {
      setError('Não foi possível atualizar a conta.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: accountService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setError('');
    setOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAccount(null);
    setError('');
  };

  return (
    <Stack spacing={3}>
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Contas
            </Typography>
            <Typography color="text.secondary">
              Gerencie suas contas, carteiras, cartões e investimentos.
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
            Nova conta
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography color="text.secondary" fontWeight={700}>
              Saldo total
            </Typography>
            <Typography variant="h4" fontWeight={900} mt={1}>
              {money.format(totalBalance)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography color="text.secondary" fontWeight={700}>
              Contas ativas
            </Typography>
            <Typography variant="h4" fontWeight={900} mt={1}>
              {data.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {isLoading ? (
        <Typography color="text.secondary">Carregando contas...</Typography>
      ) : data.length === 0 ? (
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
          <Typography fontWeight={800}>Nenhuma conta cadastrada</Typography>
          <Typography color="text.secondary" mt={1}>
            Crie sua primeira conta para começar a registrar transações.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {data.map((account) => (
            <Grid item xs={12} md={6} lg={4} key={account._id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 40px rgba(15,23,42,0.08)'
                  }
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'primary.lighter',
                        color: 'primary.main'
                      }}
                    >
                      {getAccountIcon(account.type)}
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(account)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remover">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteMutation.mutate(account._id)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Box>
                    <Typography fontWeight={900} fontSize={18}>
                      {account.name}
                    </Typography>

                    <Chip
                      label={accountTypeLabels[account.type]}
                      size="small"
                      sx={{
                        mt: 1,
                        fontWeight: 700,
                        borderRadius: 2
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography color="text.secondary" fontSize={13} fontWeight={700}>
                      Saldo atual
                    </Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {money.format(account.currentBalance)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={900}>
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
              updateMutation.mutate({
                id: editingAccount._id,
                payload
              });
            } else {
              createMutation.mutate(payload);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Stack spacing={2.5} mt={1}>
                  {error && <Alert severity="error">{error}</Alert>}

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
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                  sx={{ textTransform: 'none', fontWeight: 800 }}
                >
                  {editingAccount ? 'Salvar alterações' : 'Criar conta'}
                </Button>
              </DialogActions>
            </Box>
          )}
        </Formik>
      </Dialog>
    </Stack>
  );
}