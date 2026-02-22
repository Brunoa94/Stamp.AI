"use client";

import { useAddressForm } from "../hooks/useAddressForm";
import {
  AddressSectionHeader,
  AddressFormFields,
  AddressFormActions,
  AddressDisplay,
} from "./address";

export function AddressSection() {
  const {
    form,
    isEditing,
    hasAddress,
    savedAddress,
    isSaving,
    handleSave,
    handleCancel,
    handleEdit,
  } = useAddressForm();

  const onSubmit = form.handleSubmit(handleSave);

  return (
    <section className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6">
      <AddressSectionHeader
        hasAddress={hasAddress}
        isEditing={isEditing}
        onEdit={handleEdit}
      />

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <AddressFormFields form={form} />
          <AddressFormActions
            onSave={onSubmit}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </form>
      ) : hasAddress && savedAddress ? (
        <AddressDisplay address={savedAddress} />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No shipping address saved. Click "Add Address" to add one.
        </p>
      )}
    </section>
  );
}
