import { OrderWithItemsT } from "@/types/order";
import { ExternalLink, Package } from "lucide-react";
import { componentThemes } from "@/theme";

interface Props {
  order: OrderWithItemsT;
  shippedDate: string | null;
  deliveredDate: string | null;
}

export function TrackingInfoSection({
  order,
  shippedDate,
  deliveredDate,
}: Props) {
  if (
    !order.tracking_number &&
    !order.tracking_url &&
    !shippedDate &&
    !deliveredDate
  ) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-slate-600" />
        <h3 className={componentThemes.text.subheading}>
          Tracking Information
        </h3>
      </div>

      <div className="bg-blue-50/50 rounded-lg p-4 space-y-3">
        {order.tracking_number && (
          <div>
            <p className="text-sm text-gray-600">Tracking Number</p>
            <p className="font-medium text-gray-800 break-all">
              {order.tracking_number}
            </p>
          </div>
        )}

        {order.tracking_url && (
          <div>
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Track Package
            </a>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          {shippedDate && (
            <div>
              <p className="text-sm text-gray-600">Shipped On</p>
              <p className="font-medium text-gray-800">{shippedDate}</p>
            </div>
          )}
          {deliveredDate && (
            <div>
              <p className="text-sm text-gray-600">Delivered On</p>
              <p className="font-medium text-gray-800">{deliveredDate}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
