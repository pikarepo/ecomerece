'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCreateMyProduct } from '@ecomerece/frontend/product';
import { CreateMyProductDtoSchema } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

type ImageDraft = { url: string; alt: string; default: boolean };
type DisclaimerDraft = { name: string; title: string };

export function ProductCreateDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [appearance, setAppearance] = useState<'public' | 'private'>('public');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageDraft[]>([{ url: '', alt: '', default: true }]);
  const [isIngredients, setIsIngredients] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [isDisclaimer, setIsDisclaimer] = useState(false);
  const [disclaimers, setDisclaimers] = useState<DisclaimerDraft[]>([{ name: '', title: '' }]);
  const [error, setError] = useState<string | null>(null);
  const createProduct = useCreateMyProduct();

  const updateImage = (index: number, patch: Partial<ImageDraft>) =>
    setImages((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const updateDisclaimer = (index: number, patch: Partial<DisclaimerDraft>) =>
    setDisclaimers((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const handleClose = () => {
    setTitle('');
    setCategoryId('');
    setAppearance('public');
    setDescription('');
    setImages([{ url: '', alt: '', default: true }]);
    setIsIngredients(false);
    setIngredients('');
    setIsDisclaimer(false);
    setDisclaimers([{ name: '', title: '' }]);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const parsed = CreateMyProductDtoSchema.safeParse({
      title: title.trim(),
      categoryId: categoryId.trim(),
      appearance,
      description: description.trim(),
      ingredient: {
        isIngredients,
        ingredients: ingredients
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      },
      disclaimer: {
        isDisclaimer,
        disclaimers: disclaimers
          .map((item) => ({ name: item.name.trim(), title: item.title.trim() }))
          .filter((item) => item.name || item.title),
      },
      image: {
        images: images
          .map((item) => ({ url: item.url.trim(), alt: item.alt.trim(), default: item.default }))
          .filter((item) => item.url || item.alt),
      },
    });

    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    try {
      await createProduct.mutateAsync(parsed.data);
      onSuccess?.();
      handleClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to create product.');
    }
  };

  return (
    <FormDialog
      title="Create product"
      open={open}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={createProduct.isPending}
      error={error}
      submitLabel="Create product"
      maxWidth="md"
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField
          label="Category ID"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <TextField
          select
          label="Visibility"
          value={appearance}
          onChange={(e) => setAppearance(e.target.value as 'public' | 'private')}
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </TextField>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Images
      </Typography>
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr auto' }, gap: 1 }}
        >
          <TextField
            size="small"
            label="Image URL"
            value={image.url}
            onChange={(e) => updateImage(index, { url: e.target.value })}
          />
          <TextField
            size="small"
            label="Alt text"
            value={image.alt}
            onChange={(e) => updateImage(index, { alt: e.target.value })}
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={image.default}
                  onChange={(e) => updateImage(index, { default: e.target.checked })}
                />
              }
              label="Default"
            />
            <IconButton
              size="small"
              onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
              disabled={images.length === 1}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => setImages((current) => [...current, { url: '', alt: '', default: false }])}
      >
        Add image
      </Button>

      <FormControlLabel
        control={
          <Switch checked={isIngredients} onChange={(e) => setIsIngredients(e.target.checked)} />
        }
        label="Has ingredients"
      />
      {isIngredients ? (
        <TextField
          label="Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      ) : null}

      <FormControlLabel
        control={
          <Switch checked={isDisclaimer} onChange={(e) => setIsDisclaimer(e.target.checked)} />
        }
        label="Has disclaimers"
      />
      {isDisclaimer
        ? disclaimers.map((item, index) => (
            <Box
              key={index}
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' }, gap: 1 }}
            >
              <TextField
                size="small"
                label="Disclaimer name"
                value={item.name}
                onChange={(e) => updateDisclaimer(index, { name: e.target.value })}
              />
              <TextField
                size="small"
                label="Disclaimer title"
                value={item.title}
                onChange={(e) => updateDisclaimer(index, { title: e.target.value })}
              />
              <IconButton
                size="small"
                onClick={() =>
                  setDisclaimers((current) => current.filter((_, i) => i !== index))
                }
                disabled={disclaimers.length === 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        : null}
      {isDisclaimer ? (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            setDisclaimers((current) => [...current, { name: '', title: '' }])
          }
        >
          Add disclaimer
        </Button>
      ) : null}
    </FormDialog>
  );
}
