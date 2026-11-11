'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  useAddCategory,
  useAddFeature,
  useAddProductContainer,
  useAddPromo,
  useAddSlide,
  useRemoveCategory,
  useRemoveFeature,
  useRemoveProductContainer,
  useRemovePromo,
  useRemoveSlide,
  useUpdateCategory,
  useUpdateFeature,
  useUpdateProductContainer,
  useUpdatePromo,
  useUpdateSlide,
} from '@ecomerece/frontend/home';
import {
  createFeatureDtoSchema,
  createHomeCategoryDtoSchema,
  createProductContainerDtoSchema,
  createPromoDtoSchema,
  createSlideDtoSchema,
  type HomeCategoryResponse,
  type HomeContainerResponse,
  type HomeFeatureResponse,
  type HomePromoResponse,
  type HomeSlideResponse,
  updateFeatureDtoSchema,
  updateHomeCategoryDtoSchema,
  updateProductContainerDtoSchema,
  updatePromoDtoSchema,
  updateSlideDtoSchema,
} from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../components/form-dialog';

export type HomeItemKind = 'slide' | 'promo' | 'category' | 'feature' | 'container';
export type HomeItem =
  | HomeSlideResponse
  | HomePromoResponse
  | HomeCategoryResponse
  | HomeFeatureResponse
  | HomeContainerResponse;

type Mode = 'create' | 'edit' | 'delete';

const KIND_LABELS: Record<HomeItemKind, string> = {
  slide: 'slide',
  promo: 'promo',
  category: 'category',
  feature: 'feature',
  container: 'shelf',
};

function initialForm(kind: HomeItemKind, mode: Mode, item: HomeItem | null): Record<string, string> {
  if (mode === 'delete') return {};

  if (kind === 'slide') {
    const slide = item as HomeSlideResponse | null;
    return {
      tag: slide?.tag ?? '',
      title: slide?.title ?? '',
      subhead: slide?.subhead ?? '',
      subtitle: slide?.subtitle ?? '',
      cta: slide?.cta ?? '',
      image: slide?.image ?? '',
      accent: slide?.accent ?? '#3B82F6',
      displayOrder: String(slide?.displayOrder ?? 1),
    };
  }

  if (kind === 'promo') {
    const promo = item as HomePromoResponse | null;
    return {
      title: promo?.title ?? '',
      subtitle: promo?.subtitle ?? '',
      image: promo?.image ?? '',
      accent: promo?.accent ?? '#FB923C',
      link: promo?.link ?? 'https://example.com/client/home',
    };
  }

  if (kind === 'category') {
    const category = item as HomeCategoryResponse | null;
    return {
      name: category?.name ?? '',
      image: category?.image ?? '',
      accent: category?.accent ?? '#3B82F6',
      icon: category?.icon ?? 'Box',
    };
  }

  if (kind === 'feature') {
    const feature = item as HomeFeatureResponse | null;
    return {
      title: feature?.title ?? '',
      detail: feature?.detail ?? '',
      accent: feature?.accent ?? '#10B981',
      icon: feature?.icon ?? 'Sparkles',
    };
  }

  const container = item as HomeContainerResponse | null;
  return {
    heading: container?.heading ?? '',
    subTitle: container?.subTitle ?? '',
    filter: JSON.stringify(container?.query?.filter ?? {}, null, 2),
    sort: container?.query?.sort ? JSON.stringify(container.query.sort, null, 2) : '',
    limit: String(container?.query?.limit ?? 20),
    direction: container?.query?.direction ?? 'next',
    displayOrder: String(container?.displayOrder ?? 1),
  };
}

type HomeItemDialogProps = {
  open: boolean;
  kind: HomeItemKind;
  mode: Mode;
  item: HomeItem | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function HomeItemDialog(props: HomeItemDialogProps) {
  return (
    <HomeItemDialogContent
      key={`${props.open}-${props.kind}-${props.mode}-${props.item?.id ?? 'new'}`}
      {...props}
    />
  );
}

function HomeItemDialogContent({ open, kind, mode, item, onClose, onSuccess }: HomeItemDialogProps) {
  const [form, setForm] = useState<Record<string, string>>(() => initialForm(kind, mode, item));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addSlide = useAddSlide();
  const updateSlide = useUpdateSlide();
  const removeSlide = useRemoveSlide();
  const addPromo = useAddPromo();
  const updatePromo = useUpdatePromo();
  const removePromo = useRemovePromo();
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const removeCategory = useRemoveCategory();
  const addFeature = useAddFeature();
  const updateFeature = useUpdateFeature();
  const removeFeature = useRemoveFeature();
  const addContainer = useAddProductContainer();
  const updateContainer = useUpdateProductContainer();
  const removeContainer = useRemoveProductContainer();

  const mutations = [
    addSlide,
    updateSlide,
    removeSlide,
    addPromo,
    updatePromo,
    removePromo,
    addCategory,
    updateCategory,
    removeCategory,
    addFeature,
    updateFeature,
    removeFeature,
    addContainer,
    updateContainer,
    removeContainer,
  ];
  const isSubmitting = mutations.some((mutation) => mutation.isPending);

  const update = (field: string, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    try {
      let result;
      if (mode === 'delete' && item) {
        result =
          kind === 'slide'
            ? await removeSlide.mutateAsync({ id: item.id })
            : kind === 'promo'
              ? await removePromo.mutateAsync({ id: item.id })
              : kind === 'category'
                ? await removeCategory.mutateAsync({ id: item.id })
                : kind === 'feature'
                  ? await removeFeature.mutateAsync({ id: item.id })
                  : await removeContainer.mutateAsync({ id: item.id });
        setSuccess(result.message);
        onSuccess?.();
        onClose();
        return;
      }

      if (kind === 'slide') {
        const payload = {
          tag: form.tag?.trim(),
          title: form.title?.trim(),
          subhead: form.subhead?.trim(),
          subtitle: form.subtitle?.trim(),
          cta: form.cta?.trim(),
          image: form.image?.trim(),
          accent: form.accent?.trim(),
          displayOrder: Number(form.displayOrder),
        };
        if (mode === 'create') {
          const parsed = createSlideDtoSchema.safeParse(payload);
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await addSlide.mutateAsync(parsed.data);
        } else {
          const parsed = updateSlideDtoSchema.safeParse({ id: item?.id, ...payload });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await updateSlide.mutateAsync(parsed.data);
        }
      } else if (kind === 'promo') {
        const payload = {
          title: form.title?.trim(),
          subtitle: form.subtitle?.trim(),
          image: form.image?.trim(),
          accent: form.accent?.trim(),
          link: form.link?.trim(),
        };
        if (mode === 'create') {
          const parsed = createPromoDtoSchema.safeParse(payload);
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await addPromo.mutateAsync(parsed.data);
        } else {
          const parsed = updatePromoDtoSchema.safeParse({ id: item?.id, ...payload });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await updatePromo.mutateAsync(parsed.data);
        }
      } else if (kind === 'category') {
        const payload = {
          name: form.name?.trim(),
          image: form.image?.trim(),
          accent: form.accent?.trim(),
          icon: form.icon?.trim(),
        };
        if (mode === 'create') {
          const parsed = createHomeCategoryDtoSchema.safeParse(payload);
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await addCategory.mutateAsync(parsed.data);
        } else {
          const parsed = updateHomeCategoryDtoSchema.safeParse({ id: item?.id, ...payload });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await updateCategory.mutateAsync(parsed.data);
        }
      } else if (kind === 'feature') {
        const payload = {
          title: form.title?.trim(),
          detail: form.detail?.trim(),
          accent: form.accent?.trim(),
          icon: form.icon?.trim(),
        };
        if (mode === 'create') {
          const parsed = createFeatureDtoSchema.safeParse(payload);
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await addFeature.mutateAsync(parsed.data);
        } else {
          const parsed = updateFeatureDtoSchema.safeParse({ id: item?.id, ...payload });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await updateFeature.mutateAsync(parsed.data);
        }
      } else {
        const queryPayload = {
          filter: JSON.parse(form.filter || '{}'),
          sort: form.sort?.trim() ? JSON.parse(form.sort) : null,
          limit: Number(form.limit),
          direction: form.direction || 'next',
        };
        const payload = {
          heading: form.heading?.trim(),
          subTitle: form.subTitle?.trim(),
          query: queryPayload,
          displayOrder: Number(form.displayOrder),
        };
        if (mode === 'create') {
          const parsed = createProductContainerDtoSchema.safeParse(payload);
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await addContainer.mutateAsync(parsed.data);
        } else {
          const parsed = updateProductContainerDtoSchema.safeParse({ id: item?.id, ...payload });
          if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
          result = await updateContainer.mutateAsync(parsed.data);
        }
      }

      setSuccess(result.message);
      onSuccess?.();
      onClose();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : `Unable to ${mode} this ${KIND_LABELS[kind]}.`,
      );
    }
  };

  const title = `${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'Delete'} ${
    KIND_LABELS[kind]
  }`;

  return (
    <FormDialog
      title={title}
      open={open}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      submitLabel={mode === 'delete' ? 'Delete' : mode === 'create' ? 'Create' : 'Save'}
      maxWidth="md"
    >
      {mode === 'delete' ? (
        <TextField
          value={item?.id ?? ''}
          label="ID"
          slotProps={{ input: { readOnly: true } }}
          fullWidth
        />
      ) : null}

      {mode !== 'delete' && kind === 'slide' ? (
        <>
          <TextField label="Tag" value={form.tag ?? ''} onChange={(e) => update('tag', e.target.value)} />
          <TextField label="Title" value={form.title ?? ''} onChange={(e) => update('title', e.target.value)} />
          <TextField
            label="Subhead"
            value={form.subhead ?? ''}
            onChange={(e) => update('subhead', e.target.value)}
          />
          <TextField
            label="Subtitle"
            value={form.subtitle ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
          <TextField label="CTA" value={form.cta ?? ''} onChange={(e) => update('cta', e.target.value)} />
          <TextField label="Image" value={form.image ?? ''} onChange={(e) => update('image', e.target.value)} />
          <TextField label="Accent" value={form.accent ?? ''} onChange={(e) => update('accent', e.target.value)} />
          {mode === 'create' ? (
            <TextField
              label="Display order"
              type="number"
              value={form.displayOrder ?? ''}
              onChange={(e) => update('displayOrder', e.target.value)}
            />
          ) : null}
        </>
      ) : null}

      {mode !== 'delete' && kind === 'promo' ? (
        <>
          <TextField label="Title" value={form.title ?? ''} onChange={(e) => update('title', e.target.value)} />
          <TextField
            label="Subtitle"
            value={form.subtitle ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
          <TextField label="Image" value={form.image ?? ''} onChange={(e) => update('image', e.target.value)} />
          <TextField label="Accent" value={form.accent ?? ''} onChange={(e) => update('accent', e.target.value)} />
          <TextField label="Link" value={form.link ?? ''} onChange={(e) => update('link', e.target.value)} />
        </>
      ) : null}

      {mode !== 'delete' && kind === 'category' ? (
        <>
          <TextField label="Name" value={form.name ?? ''} onChange={(e) => update('name', e.target.value)} />
          <TextField label="Image" value={form.image ?? ''} onChange={(e) => update('image', e.target.value)} />
          <TextField label="Accent" value={form.accent ?? ''} onChange={(e) => update('accent', e.target.value)} />
          <TextField label="Icon" value={form.icon ?? ''} onChange={(e) => update('icon', e.target.value)} />
        </>
      ) : null}

      {mode !== 'delete' && kind === 'feature' ? (
        <>
          <TextField label="Title" value={form.title ?? ''} onChange={(e) => update('title', e.target.value)} />
          <TextField
            label="Detail"
            value={form.detail ?? ''}
            onChange={(e) => update('detail', e.target.value)}
            multiline
            minRows={2}
          />
          <TextField label="Accent" value={form.accent ?? ''} onChange={(e) => update('accent', e.target.value)} />
          <TextField label="Icon" value={form.icon ?? ''} onChange={(e) => update('icon', e.target.value)} />
        </>
      ) : null}

      {mode !== 'delete' && kind === 'container' ? (
        <>
          <TextField
            label="Heading"
            value={form.heading ?? ''}
            onChange={(e) => update('heading', e.target.value)}
          />
          <TextField
            label="Subtitle"
            value={form.subTitle ?? ''}
            onChange={(e) => update('subTitle', e.target.value)}
          />
          <TextField
            label="Filter JSON"
            value={form.filter ?? ''}
            onChange={(e) => update('filter', e.target.value)}
            multiline
            minRows={3}
          />
          <TextField
            label="Sort JSON (optional)"
            value={form.sort ?? ''}
            onChange={(e) => update('sort', e.target.value)}
            multiline
            minRows={2}
          />
          <TextField
            label="Limit"
            type="number"
            value={form.limit ?? ''}
            onChange={(e) => update('limit', e.target.value)}
          />
          <TextField
            select
            label="Direction"
            value={form.direction ?? 'next'}
            onChange={(e) => update('direction', e.target.value)}
          >
            <MenuItem value="next">next</MenuItem>
            <MenuItem value="prev">prev</MenuItem>
          </TextField>
          <TextField
            label="Display order"
            type="number"
            value={form.displayOrder ?? ''}
            onChange={(e) => update('displayOrder', e.target.value)}
          />
        </>
      ) : null}
    </FormDialog>
  );
}
