"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/features/ui/button";
import { useAddressForm } from "@/features/profile/lib/hooks/useAddressForm";
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
    <section className="bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      {/* Section Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-anton uppercase tracking-tight text-ink leading-tight mb-1">
              SHIPPING ADDRESS
            </h2>
            <p className="text-slate-500 text-sm">
              {hasAddress ? "Your default shipping address" : "Add your shipping address"}
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            variant="brutalist-ghost"
            className="text-[10px]"
          >
            {hasAddress ? "EDIT ADDRESS" : "ADD ADDRESS"}
          </Button>
        )}
      </div>

      {/* Content */}
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
        <p className="text-sm text-slate-500 italic">
          No shipping address saved. Click "Add Address" to add one.
        </p>
      )}
    </section>
  );
}
