import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Formik } from 'formik';
import * as yup from 'yup';

import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../auth/AuthContext';
import { useSnackbar } from '../components/feedback/SnackbarProvider';

const schema = yup.object({
  email: yup.string().email('E-mail inválido').required('Informe o e-mail'),
  password: yup.string().min(6, 'Mínimo de 6 caracteres').required('Informe a senha')
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais para acessar seu painel financeiro."
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            await login(values);
            showSnackbar('Login realizado com sucesso!', 'success');
            navigate('/', { replace: true });
          } catch {
            showSnackbar('E-mail ou senha inválidos.', 'error');
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email ? errors.email : ''}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }
                }}
              />

              <TextField
                fullWidth
                label="Senha"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password ? errors.password : ''}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  py: 1.35,
                  borderRadius: 2.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)'
                }}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>

              <Divider />

              <Box sx={{ textAlign: 'center' }}>
                <Typography component="span" color="text.secondary">
                  Ainda não tem conta?{' '}
                </Typography>

                <Box
                  component={RouterLink}
                  to="/register"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Criar conta
                </Box>
              </Box>
            </Stack>
          </Box>
        )}
      </Formik>
    </AuthLayout>
  );
}