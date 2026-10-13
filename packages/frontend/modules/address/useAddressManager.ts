import {
  useCreateMyAddress,
  useDeleteMyAddress,
  useGetMyAddresses,
  useSetMyAddressAsDefault,
  useUpdateMyAddress,
} from '@ecomerece/frontend/address';
import {
  type AddressResponseReadModel,
  createMyAddressDto,
  type createMyAddressDtoType,
} from '@ecomerece/shared';
import { useState } from 'react';
import { z } from 'zod';

const INITIAL_ADDRESS_FORM: createMyAddressDtoType = {
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export function useAddressManager() {
  // 1. Data queries & mutations
  const { data: addresses = [], isLoading, error, isFetching, refetch } = useGetMyAddresses();
  const createMutation = useCreateMyAddress();
  const updateMutation = useUpdateMyAddress();
  const deleteMutation = useDeleteMyAddress();
  const setDefaultMutation = useSetMyAddressAsDefault();

  // 2. UI / Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // 3. Form States
  const [formData, setFormData] = useState<createMyAddressDtoType>(INITIAL_ADDRESS_FORM);
  const [formError, setFormError] = useState<string>('');

  // --- Actions ---

  const openCreateForm = () => {
    setEditId(null);
    setFormData(INITIAL_ADDRESS_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (address: AddressResponseReadModel) => {
    setEditId(address.id);
    setFormData({
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleInputChange = (field: keyof createMyAddressDtoType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (onSuccessOrEvent?: (() => void) | any) => {
    // Safely check if the first argument is actually a function (ignoring React synthetic events)
    const onSuccessCallback = typeof onSuccessOrEvent === 'function' ? onSuccessOrEvent : undefined;

    try {
      const parsedData = createMyAddressDto.parse(formData);
      setFormError('');

      const mutation = editId ? updateMutation : createMutation;
      const mutationPayload = editId ? { id: editId, data: parsedData } : parsedData;

      mutation.mutate(mutationPayload as any, {
        onSuccess: () => {
          setFormOpen(false);
          onSuccessCallback?.();
        },
        onError: (err: any) => {
          setFormError(err?.message || `Failed to ${editId ? 'update' : 'create'} address`);
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormError(error.issues.map((e) => e.message).join(', '));
      } else {
        setFormError('An unexpected error occurred');
      }
    }
  };

  const handleDelete = (id: string, onSuccessCallback?: () => void) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteId(null);
        onSuccessCallback?.();
      },
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  return {
    // Data & Statuses
    addresses,
    isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Modal Controls
    formOpen,
    setFormOpen,
    deleteId,
    setDeleteId,
    editId,

    // Form Fields & Errors
    formData,
    formError,
    setFormError,
    error,

    refetch,
    isFetching,
    // Handlers
    openCreateForm,
    openEditForm,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleSetDefault,
  };
}
