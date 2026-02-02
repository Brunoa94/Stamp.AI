import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/useAuth";
import { useUpdateProfile } from "./useUpdateProfile";
import { toast } from "sonner";
import { ShippingAddressSchema, type ShippingAddressT } from "@/schemas/checkout";

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
  const { data: user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  const savedAddress = user?.user_metadata?.shipping_address as ShippingAddressT | undefined;

  const form = useForm<ShippingAddressT>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: savedAddress || createEmptyAddress(user?.email),
  });

  useEffect(() => {
    if (savedAddress) {
      form.reset(savedAddress);
    }
  }, [savedAddress, form]);

  const handleSave = async (data: ShippingAddressT) => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: data.first_name,
        lastName: data.last_name || "",
        metadata: {
          shipping_address: data,
        },
      });
      setIsEditing(false);
      toast.success("Address updated successfully!");
    } catch (error) {
      toast.error("Failed to update address");
    }
  };

  const handleCancel = () => {
    if (savedAddress) {
      form.reset(savedAddress);
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

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
