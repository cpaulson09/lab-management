import { zodResolver } from "@hookform/resolvers/zod";
import { type LabTest, labTestCreateSchema } from "@lab/shared";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiErrorCode, apiErrorMessage } from "@/lib/api-error";
import { useCreateLabTest, useUpdateLabTest } from "./useLabTests";

/** The shared create schema, with messages for empty number inputs. */
const formSchema = labTestCreateSchema.extend({
  price: z
    .number({ error: "Enter a price" })
    .nonnegative("Price cannot be negative")
    .finite(),
  turnaroundDays: z
    .number({ error: "Enter the turnaround" })
    .int("Use whole days")
    .min(1, "Turnaround is at least 1 business day"),
});
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The lab test to edit. Leave out to add a new one. */
  labTest?: LabTest;
};

export function LabTestForm({ open, onOpenChange, labTest }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {labTest ? "Edit lab test" : "Add lab test"}
          </DialogTitle>
          <DialogDescription>
            Price and turnaround changes apply to new orders only.
          </DialogDescription>
        </DialogHeader>
        <LabTestFormBody
          key={labTest?.labTestId ?? "new"}
          labTest={labTest}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Empty input → undefined, so Zod shows "Enter a …" instead of NaN. */
function toNumber(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

function LabTestFormBody({
  labTest,
  onDone,
}: {
  labTest?: LabTest;
  onDone: () => void;
}) {
  const create = useCreateLabTest();
  const update = useUpdateLabTest();
  const saving = create.isPending || update.isPending;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: labTest?.code ?? "",
      name: labTest?.name ?? "",
      price: labTest?.price,
      turnaroundDays: labTest?.turnaroundDays,
    },
  });

  async function onSubmit(values: FormOutput) {
    try {
      if (labTest) {
        await update.mutateAsync({ ...values, labTestId: labTest.labTestId });
        toast.success("Lab test saved");
      } else {
        await create.mutateAsync(values);
        toast.success("Lab test added");
      }
      onDone();
    } catch (error) {
      if (apiErrorCode(error) === "CONFLICT") {
        form.setError("code", { message: apiErrorMessage(error) });
        form.setFocus("code");
      } else {
        toast.error(apiErrorMessage(error));
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid items-start gap-4 sm:grid-cols-[8rem_1fr]">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    className="font-mono uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="turnaroundDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Turnaround
                  <span className="font-normal text-muted-foreground">
                    (business days)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : labTest ? "Save changes" : "Add lab test"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
