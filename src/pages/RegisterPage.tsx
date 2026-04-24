import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Formik } from 'formik';
import * as yup from 'yup';

import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../auth/AuthContext';

const schema = yup.object({
  name: yup.string().min(3, 'Informe pelo menos 3 caracteres').required('Informe seu nome'),
  email: yup.string().email('E-mail inválido').required('Informe o e-mail'),
  password: yup.string().min(6, 'Mínimo de 6 caracteres').required('Informe a senha'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não conferem')
    .required('Confirme sua senha')
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Cadastre-se para começar a controlar suas finanças."
    >
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            setError('');

            await register({
              name: values.name,
              email: values.email,
              password: values.password
            });

            navigate('/', { replace: true });
          } catch {
            setError('Não foi possível criar sua conta. Verifique os dados informados.');
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name ? errors.name : ''}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRoundedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }
                }}
              />

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

              <TextField
                fullWidth
                label="Confirmar senha"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                helperText={
                  touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''
                }
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
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Button>

              <Divider />

              <Box sx={{ textAlign: 'center' }}>
                <Typography component="span" color="text.secondary">
                  Já tem uma conta?{' '}
                </Typography>

                <Box
                  component={RouterLink}
                  to="/login"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Entrar
                </Box>
              </Box>
            </Stack>
          </Box>
        )}
      </Formik>
    </AuthLayout>
  );
}