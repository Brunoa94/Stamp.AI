// Auth queries
export {
  authKeys,
  useUser,
  useSession,
  useIsAuthenticated,
  useLogin,
  useRegister,
  useLogout,
  usePasswordResetRequest,
  useUpdateProfile,
  useUpdatePassword,
  useResendEmailVerification,
} from "./authQueries";

// Cart queries
export {
  useCart,
  useCartById,
  useCartSummary,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "./cartQueries";

// Order queries
export {
  useOrder,
  useOrders,
  useOrderByNumber,
  useOrderItems,
  useCreateOrder,
  useUpdateOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateFulfillmentStatus,
  useDeleteOrder,
  useCreateOrderFromCart,
} from "./orderQueries";

// Product queries
export {
  useCustomProduct,
  useTshirtProducts,
  useBlueprintVariants,
  useCreateCustomProduct,
  type TshirtType,
} from "./productQueries";

// Image generation queries
export {
  useImageGeneration,
} from "./imageGenerationQueries";

// Coins queries
export {
  coinsKeys,
  useCoins,
} from "./coinsQueries";

export {
  useCreatePayPalOrder,
  useCapturePayPalOrder,
} from "./paypalQueries";

export {
  useCreateMolliePayment,
  useVerifyMolliePayment,
} from "./mollieQueries";
