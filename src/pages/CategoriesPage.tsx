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

  const { data = [], isLoading, isError } = useQuery({
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
    onError: () => showSnackbar('Não foi possível salvar a categoria.', 'error')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      categoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showSnackbar('Categoria atualizada com sucesso!', 'success');
      handleClose();
    },
    onError: () => showSnackbar('Não foi possível atualizar a categoria.', 'error')
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isError) {
    return <Alert severity="error">Erro ao carregar categorias.</Alert>;
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
        <Box sx={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', right: -70, top: -80 }} />

        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography sx={{ opacity: 0.78, fontWeight: 800 }}>FinancialControl</Typography>
            <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>Categorias</Typography>
            <Typography sx={{ opacity: 0.78, mt: 1, maxWidth: 620 }}>
              Organize receitas e despesas com categorias personalizadas, cores e ícones.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 900, bgcolor: '#fff', color: '#1e3a8a', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
          >
            Nova categoria
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        {[
          { label: 'Total de categorias', value: data.length, icon: <CategoryRoundedIcon />, color: '#2563eb', bg: 'rgba(37,99,235,0.10)' },
          { label: 'Receitas', value: totals.income, icon: <TrendingUpRoundedIcon />, color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
          { label: 'Despesas', value: totals.expense, icon: <TrendingDownRoundedIcon />, color: '#dc2626', bg: 'rgba(220,38,38,0.10)' }
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ color: 'text.secondary', fontWeight: 800, fontSize: 13 }}>{card.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 950, mt: 1 }}>{card.value}</Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: card.bg, color: card.color }}>
                {card.icon}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: 2 }}>
          <TextField select fullWidth label="Tipo" value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {Object.values(CategoryType).map((type) => (
              <MenuItem key={type} value={type}>{categoryTypeLabels[type]}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button variant="outlined" onClick={() => setFilterType('')} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}>
              Limpar filtros
            </Button>
          </Box>
        </Box>
      </Paper>

      {isLoading ? (
        <Typography sx={{ color: 'text.secondary' }}>Carregando categorias...</Typography>
      ) : data.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 5, border: '1px dashed', borderColor: 'divider', bgcolor: 'rgba(15,23,42,0.02)' }}>
          <CategoryRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
          <Typography sx={{ fontWeight: 900 }}>Nenhuma categoria cadastrada</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>Crie categorias para classificar receitas e despesas.</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate} sx={{ mt: 3, textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}>
            Criar primeira categoria
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {data.map((category) => {
            const isIncome = category.type === CategoryType.INCOME;
            const color = category.color || (isIncome ? '#16a34a' : '#dc2626');

            return (
              <Paper
                key={category._id}
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
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 18px 42px rgba(15,23,42,0.10)' }
                }}
              >
                <Box sx={{ position: 'absolute', right: -26, top: -26, width: 100, height: 100, borderRadius: '50%', bgcolor: `${color}18` }} />

                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ width: 50, height: 50, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: `${color}18`, color }}>
                      {getCategoryIcon(category.type)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(category)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover">
                        <IconButton size="small" color="error" disabled={deleteMutation.isPending} onClick={() => setDeleteId(category._id)}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 950, fontSize: 19 }}>{category.name}</Typography>
                    <Chip label={categoryTypeLabels[category.type]} size="small" sx={{ mt: 1, fontWeight: 800, borderRadius: 2, bgcolor: `${color}18`, color }} />
                  </Box>

                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 800 }}>Personalização</Typography>
                    <Typography sx={{ fontWeight: 900 }}>{category.icon || 'Category'} • {category.color || '#1976d2'}</Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>{editingCategory ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>

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
              updateMutation.mutate({ id: editingCategory._id, payload });
            } else {
              createMutation.mutate(payload);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                  <TextField fullWidth label="Nome da categoria" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.name && errors.name)} helperText={touched.name && errors.name ? errors.name : ''} />

                  <TextField select fullWidth label="Tipo" name="type" value={values.type} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.type && errors.type)} helperText={touched.type && errors.type ? errors.type : ''}>
                    {Object.values(CategoryType).map((type) => (
                      <MenuItem key={type} value={type}>{categoryTypeLabels[type]}</MenuItem>
                    ))}
                  </TextField>

                  <TextField select fullWidth label="Cor" name="color" value={values.color} onChange={handleChange} onBlur={handleBlur}>
                    {colorOptions.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: color.value, border: '1px solid rgba(0,0,0,0.12)' }} />
                          {color.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField select fullWidth label="Ícone" name="icon" value={values.icon} onChange={handleChange} onBlur={handleBlur}>
                    {iconOptions.map((icon) => (
                      <MenuItem key={icon.value} value={icon.value}>{icon.label}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSaving} sx={{ textTransform: 'none', fontWeight: 800 }}>
                  {isSaving ? 'Salvando...' : editingCategory ? 'Salvar alterações' : 'Criar categoria'}
                </Button>
              </DialogActions>
            </Box>
          )}
        </Formik>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>Deseja realmente remover esta categoria?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} sx={{ textTransform: 'none', fontWeight: 800 }}>
            {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}