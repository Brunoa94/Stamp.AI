import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/queries/authQueries";
import { useTranslations } from "next-intl";
import { ShippingAddressSchema, type ShippingAddressT } from "@/schemas/checkout";
import { useErrorHandler } from "@/hooks/useErrorHandler";

function createEmptyAddress(email?: string): ShippingAddressT {
  return {
    first_name: "",
    last_name: "",
    email: email || "",
    phone: "",
    country: "",
    region: "",
    address1: "",
    address2: "",
    city: "",
    zip: "",
  };
}

export function useAddressForm() {
  const t = useTranslations("profile.toasts");
  const { data: user } = useUser();
  const updateProfileMutation = useUpdateProfile();
  const { handleError, handleSuccess } = useErrorHandler();
  
  const savedAddress = user?.user_metadata?.shipping_address as ShippingAddressT | undefined;
  const form = useForm<ShippingAddressT>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: savedAddress || createEmptyAddress(user?.email),
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (savedAddress) {
      form.reset(savedAddress);
    }
  }, [savedAddress, form]);

  const handleSave = useCallback(
    async (data: ShippingAddressT) => {
      try {
        await updateProfileMutation.mutateAsync({
          firstName: data.first_name,
          lastName: data.last_name || "",
          metadata: {
            shipping_address: data,
          },
        });
        setIsEditing(false);
        handleSuccess(t("addressUpdated"));
      } catch (error) {
        handleError(error);
      }
    },
    [updateProfileMutation, t]
  );

  const handleCancel = useCallback(() => {
    if (savedAddress) {
      form.reset(savedAddress);
    }
    setIsEditing(false);
  }, [savedAddress, form]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const hasAddress = Boolean(savedAddress?.address1);

  return {
    form,
    isEditing,
    hasAddress,
    savedAddress,
    isSaving: updateProfileMutation.isPending,
    handleSave,
    handleCancel,
    handleEdit,
  };
}
