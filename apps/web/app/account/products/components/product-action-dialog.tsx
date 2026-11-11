'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import {
  useAddMyProductDisclaimers,
  useAddMyProductImages,
  useAddMyProductIngredients,
  useMakeMyProductPrivate,
  useMakeMyProductPublic,
  useRecoverMyProduct,
  useRemoveMyProductDisclaimers,
  useRemoveMyProductImages,
  useRemoveMyProductIngredients,
  useSetMyProductDefaultImage,
  useSoftDeleteMyProduct,
  useToggleMyProductDisclaimer,
  useToggleMyProductIngredients,
  useUpdateMyProductMeta,
} from '@ecomerece/frontend/product';
import {
  imageSchema,
  type ProductAdminResponseReadModel,
  updateProductMetaDto,
} from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

const ACTIONS = [
  { value: 'meta', label: 'Update title & description' },
  { value: 'visibility', label: 'Change visibility' },
  { value: 'delete', label: 'Soft delete' },
  { value: 'recover', label: 'Recover' },
  { value: 'addImage', label: 'Add image' },
  { value: 'removeImage', label: 'Remove image' },
  { value: 'defaultImage', label: 'Set default image index' },
  { value: 'toggleIngredients', label: 'Toggle ingredients section' },
  { value: 'addIngredients', label: 'Add ingredients' },
  { value: 'removeIngredients', label: 'Remove ingredients' },
  { value: 'toggleDisclaimer', label: 'Toggle disclaimers section' },
  { value: 'addDisclaimer', label: 'Add disclaimer' },
  { value: 'removeDisclaimer', label: 'Remove disclaimer' },
] as const;

type Action = (typeof ACTIONS)[number]['value'];

export function ProductActionDialog(props: {
  product: ProductAdminResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return <ProductActionDialogContent key={props.product?.id ?? 'closed'} {...props} />;
}

function ProductActionDialogContent({
  product,
  onClose,
  onSuccess,
}: {
  product: ProductAdminResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<Action>('meta');
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [appearance, setAppearance] = useState<'public' | 'private'>(
    product?.appearance ?? 'public',
  );
  const [reason, setReason] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageDefault, setImageDefault] = useState(false);
  const [imageIndex, setImageIndex] = useState('0');
  const [ingredientsEnabled, setIngredientsEnabled] = useState(
    product?.ingredient.isIngredients ?? false,
  );
  const [ingredients, setIngredients] = useState('');
  const [disclaimerEnabled, setDisclaimerEnabled] = useState(
    product?.disclaimer.isDisclaimer ?? false,
  );
  const [disclaimerName, setDisclaimerName] = useState('');
  const [disclaimerTitle, setDisclaimerTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateMeta = useUpdateMyProductMeta();
  const makePublic = useMakeMyProductPublic();
  const makePrivate = useMakeMyProductPrivate();
  const deleteProduct = useSoftDeleteMyProduct();
  const recoverProduct = useRecoverMyProduct();
  const addImages = useAddMyProductImages();
  const removeImages = useRemoveMyProductImages();
  const setDefaultImage = useSetMyProductDefaultImage();
  const toggleIngredients = useToggleMyProductIngredients();
  const addIngredients = useAddMyProductIngredients();
  const removeIngredients = useRemoveMyProductIngredients();
  const toggleDisclaimer = useToggleMyProductDisclaimer();
  const addDisclaimers = useAddMyProductDisclaimers();
  const removeDisclaimers = useRemoveMyProductDisclaimers();

  const mutations = [
    updateMeta,
    makePublic,
    makePrivate,
    deleteProduct,
    recoverProduct,
    addImages,
    removeImages,
    setDefaultImage,
    toggleIngredients,
    addIngredients,
    removeIngredients,
    toggleDisclaimer,
    addDisclaimers,
    removeDisclaimers,
  ];
  const isSubmitting = mutations.some((mutation) => mutation.isPending);

  const handleSubmit = async () => {
    if (!product) return;
    setError(null);
    setSuccess(null);

    try {
      let result;
      switch (action) {
        case 'meta': {
          const parsed = updateProductMetaDto.safeParse({
            productId: product.id,
            title: title.trim(),
            description: description.trim(),
          });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await updateMeta.mutateAsync(parsed.data);
          break;
        }
        case 'visibility':
          result =
            appearance === 'public'
              ? await makePublic.mutateAsync({ productId: product.id })
              : await makePrivate.mutateAsync({ productId: product.id });
          break;
        case 'delete':
          if (reason.trim().length < 10) throw new Error('Reason must be at least 10 characters.');
          result = await deleteProduct.mutateAsync({
            productId: product.id,
            reason: reason.trim(),
          });
          break;
        case 'recover':
          result = await recoverProduct.mutateAsync({ productId: product.id });
          break;
        case 'addImage': {
          const parsed = imageSchema.safeParse({
            url: imageUrl.trim(),
            alt: imageAlt.trim(),
            isDefault: imageDefault,
          });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await addImages.mutateAsync({ productId: product.id, images: [parsed.data] });
          break;
        }
        case 'removeImage': {
          const parsed = imageSchema.safeParse({
            url: imageUrl.trim(),
            alt: imageAlt.trim(),
            isDefault: imageDefault,
          });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await removeImages.mutateAsync({ productId: product.id, images: [parsed.data] });
          break;
        }
        case 'defaultImage':
          result = await setDefaultImage.mutateAsync({
            productId: product.id,
            index: Number(imageIndex),
          });
          break;
        case 'toggleIngredients':
          result = await toggleIngredients.mutateAsync({
            productId: product.id,
            enable: ingredientsEnabled,
          });
          break;
        case 'addIngredients': {
          const items = ingredients
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
          if (items.length === 0) throw new Error('Enter at least one ingredient.');
          result = await addIngredients.mutateAsync({ productId: product.id, items });
          break;
        }
        case 'removeIngredients': {
          const items = ingredients
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
          if (items.length === 0) throw new Error('Enter at least one ingredient.');
          result = await removeIngredients.mutateAsync({ productId: product.id, items });
          break;
        }
        case 'toggleDisclaimer':
          result = await toggleDisclaimer.mutateAsync({
            productId: product.id,
            enable: disclaimerEnabled,
          });
          break;
        case 'addDisclaimer': {
          if (!disclaimerName.trim() || !disclaimerTitle.trim()) {
            throw new Error('Disclaimer name and title are required.');
          }
          result = await addDisclaimers.mutateAsync({
            productId: product.id,
            items: [{ name: disclaimerName.trim(), title: disclaimerTitle.trim() }],
          });
          break;
        }
        case 'removeDisclaimer': {
          if (!disclaimerName.trim() || !disclaimerTitle.trim()) {
            throw new Error('Disclaimer name and title are required.');
          }
          result = await removeDisclaimers.mutateAsync({
            productId: product.id,
            items: [{ name: disclaimerName.trim(), title: disclaimerTitle.trim() }],
          });
          break;
        }
      }
      setSuccess(result.message);
      onSuccess?.();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to update this product.',
      );
    }
  };

  return (
    <FormDialog
      title={product ? `Manage ${product.title}` : 'Manage product'}
      open={Boolean(product)}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      submitLabel="Apply"
      maxWidth="md"
    >
      <TextField
        select
        label="Action"
        value={action}
        onChange={(event) => {
          setAction(event.target.value as Action);
          setSuccess(null);
        }}
        fullWidth
      >
        {ACTIONS.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>

      {action === 'meta' ? (
        <>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </>
      ) : null}

      {action === 'visibility' ? (
        <TextField
          select
          label="Visibility"
          value={appearance}
          onChange={(e) => setAppearance(e.target.value as 'public' | 'private')}
          fullWidth
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </TextField>
      ) : null}

      {action === 'delete' ? (
        <TextField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          helperText="At least 10 characters."
          multiline
          minRows={2}
          fullWidth
        />
      ) : null}

      {action === 'addImage' || action === 'removeImage' ? (
        <>
          <TextField
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />
          <TextField
            label="Alt text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={imageDefault}
                onChange={(e) => setImageDefault(e.target.checked)}
              />
            }
            label="Default image"
          />
        </>
      ) : null}

      {action === 'defaultImage' ? (
        <TextField
          label="Image index (0-3)"
          type="number"
          value={imageIndex}
          onChange={(e) => setImageIndex(e.target.value)}
          slotProps={{ htmlInput: { min: 0, max: 3 } }}
          fullWidth
        />
      ) : null}

      {action === 'toggleIngredients' ? (
        <FormControlLabel
          control={
            <Switch
              checked={ingredientsEnabled}
              onChange={(e) => setIngredientsEnabled(e.target.checked)}
            />
          }
          label="Show ingredients section"
        />
      ) : null}

      {action === 'addIngredients' || action === 'removeIngredients' ? (
        <TextField
          label="Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      ) : null}

      {action === 'toggleDisclaimer' ? (
        <FormControlLabel
          control={
            <Switch
              checked={disclaimerEnabled}
              onChange={(e) => setDisclaimerEnabled(e.target.checked)}
            />
          }
          label="Show disclaimers section"
        />
      ) : null}

      {action === 'addDisclaimer' || action === 'removeDisclaimer' ? (
        <>
          <TextField
            label="Disclaimer name"
            value={disclaimerName}
            onChange={(e) => setDisclaimerName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Disclaimer title"
            value={disclaimerTitle}
            onChange={(e) => setDisclaimerTitle(e.target.value)}
            fullWidth
          />
        </>
      ) : null}
    </FormDialog>
  );
}
