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
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import * as yup from 'yup';

import { useSnackbar } from '../components/feedback/SnackbarProvider';
import { categoryService } from '../services/categoryService';
import {
  CategoryType,
  categoryTypeLabels,
  type Category,
  type CreateCategoryPayload
} from '../types/category';

const schema = yup.object({
  name: yup.string().required('Informe o nome da categoria'),
  type: yup.mixed<CategoryType>().required('Informe o tipo'),
  color: yup.string().optional(),
  icon: yup.string().optional()
});

const colorOptions = [
  { label: 'Azul', value: '#1976d2' },
  { label: 'Verde', value: '#2e7d32' },
  { label: 'Vermelho', value: '#d32f2f' },
  { label: 'Laranja', value: '#ed6c02' },
  { label: 'Roxo', value: '#7b1fa2' },
  { label: 'Cinza', value: '#607d8b' }
];

const iconOptions = [
  { label: 'Categoria', value: 'Category' },
  { label: 'Trabalho', value: 'Work' },
  { label: 'Casa', value: 'Home' },
  { label: 'Alimentação', value: 'Restaurant' },
  { label: 'Transporte', value: 'DirectionsCar' },
  { label: 'Saúde', value: 'HealthAndSafety' },
  { label: 'Lazer', value: 'SportsEsports' },
  { label: 'Educação', value: 'School' },
  { label: 'Investimento', value: 'Savings' }
];

function getCategoryIcon(type: CategoryType) {
  if (type === CategoryType.INCOME) return <TrendingUpRoundedIcon />;
  if (type === CategoryType.EXPENSE) return <TrendingDownRoundedIcon />;
  return <CategoryRoundedIcon />;
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');

  const {
    data = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['categories', filterType],
    queryFn: () =>
      categoryService.findAll(filterType ? (filterType as CategoryType) : undefined)
  });

  const totals = useMemo(() => {
    return data.reduce(
      (acc, category) => {
        if (category.type === CategoryType.INCOME) acc.income += 1;
        if (category.type === CategoryType.EXPENSE) acc.expense += 1;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [data]);

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('Categoria criada com sucesso!', 'success');
      handleClose();
    },
    onError: () => {
      showSnackbar('Não foi possível salvar a categoria.', 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      categoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('Categoria atualizada com sucesso!', 'success');
      handleClose();
    },
    onError: () => {
      showSnackbar('Não foi possível atualizar a categoria.', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('Categoria removida com sucesso!', 'success');
      setDeleteId(null);
    },
    onError: () => {
      showSnackbar('Não foi possível remover a categoria.', 'error');
      setDeleteId(null);
    }
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
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
        Erro ao carregar categorias. Verifique a conexão com o servidor.
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
              Categorias
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Organize suas receitas e despesas por categorias.
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
            Nova categoria
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
            Total de categorias
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            {data.length}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Receitas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: 'success.main' }}>
            {totals.income}
          </Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Despesas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: 'error.main' }}>
            {totals.expense}
          </Typography>
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
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
            {Object.values(CategoryType).map((type) => (
              <MenuItem key={type} value={type}>
                {categoryTypeLabels[type]}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              onClick={() => setFilterType('')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Limpar filtros
            </Button>
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <Typography sx={{ color: 'text.secondary' }}>Carregando categorias...</Typography>
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
          <Typography sx={{ fontWeight: 800 }}>Nenhuma categoria cadastrada</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            Crie categorias para classificar suas receitas e despesas.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 2.5
          }}
        >
          {data.map((category) => {
            const isIncome = category.type === CategoryType.INCOME;

            return (
              <Paper
                key={category._id}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: category.color ? `${category.color}22` : isIncome ? 'rgba(46, 125, 50, 0.10)' : 'rgba(211, 47, 47, 0.10)',
                        color: category.color || (isIncome ? 'success.main' : 'error.main')
                      }}
                    >
                      {getCategoryIcon(category.type)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(category)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remover">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(category._id)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                      {category.name}
                    </Typography>

                    <Chip
                      label={categoryTypeLabels[category.type]}
                      size="small"
                      color={isIncome ? 'success' : 'error'}
                      sx={{ mt: 1, fontWeight: 700, borderRadius: 2 }}
                    />
                  </Box>

                  {(category.color || category.icon) && (
                    <Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>
                        Personalização
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>
                        {category.icon || 'Category'} • {category.color || '#1976d2'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingCategory ? 'Editar categoria' : 'Nova categoria'}
        </DialogTitle>

        <Formik
          enableReinitialize
          initialValues={{
            name: editingCategory?.name ?? '',
            type: editingCategory?.type ?? CategoryType.EXPENSE,
            color: editingCategory?.color ?? '#1976d2',
            icon: editingCategory?.icon ?? 'Category'
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            const payload: CreateCategoryPayload = {
              name: values.name,
              type: values.type,
              color: values.color,
              icon: values.icon
            };

            if (editingCategory) {
              updateMutation.mutate({
                id: editingCategory._id,
                payload
              });
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
                    label="Nome da categoria"
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
                    {Object.values(CategoryType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {categoryTypeLabels[type]}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Cor"
                    name="color"
                    value={values.color}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {colorOptions.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              bgcolor: color.value,
                              border: '1px solid rgba(0,0,0,0.12)'
                            }}
                          />
                          {color.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Ícone"
                    name="icon"
                    value={values.icon}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {iconOptions.map((icon) => (
                      <MenuItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </MenuItem>
                    ))}
                  </TextField>
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
                    : editingCategory
                      ? 'Salvar alterações'
                      : 'Criar categoria'}
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
            Deseja realmente remover esta categoria?
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