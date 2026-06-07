"use client";

import { useAddressForm } from "@/features/profile/lib/hooks/useAddressForm";
import { profileTheme } from "@/theme";
import { AddressSectionHeader } from "./address/AddressSectionHeader";
import { AddressFormFields } from "./address/AddressFormFields";
import { AddressFormActions } from "./address/AddressFormActions";
import { AddressDisplay } from "./address/AddressDisplay";

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
    <section className={profileTheme.section.card}>
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
        <p className={profileTheme.address.emptyText}>
          No shipping address saved. Click "Add Address" to add one.
        </p>
      )}
    </section>
  );
}
