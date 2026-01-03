import { UButton } from "@/components/ui-elements/buttons/UButton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  sheetTrigger: React.ReactNode;
  title: string;
  description?: string;
  content: React.ReactNode;
  closeButton?: React.ReactNode;
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function SideSheet({
  sheetTrigger,
  title,
  description,
  content,
  open,
  setOpen,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          {title && <SheetTitle>{title}</SheetTitle>}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">{content}</div>
        <SheetFooter className="px-0">
          <SheetClose asChild>
            <UButton.WithVariant ariaLabel="Close" variant="outline">
              Close
            </UButton.WithVariant>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
