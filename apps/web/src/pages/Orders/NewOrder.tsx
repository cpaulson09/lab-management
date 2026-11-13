import { zodResolver } from "@hookform/resolvers/zod";
import { type OrderCreate, orderCreateSchema } from "@lab/shared";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiErrorMessage } from "@/lib/api-error";
import { formatOrderNumber } from "@/lib/format";
import { OrderSummary } from "./OrderSummary";
import { TestPicker } from "./TestPicker";
import {
  useCreateOrder,
  useLabTestOptions,
  usePatientOptions,
} from "./useOrders";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-picks this patient (the patient filter, when set). */
  defaultPatientId?: number;
  onCreated: (orderId: number) => void;
};

export function NewOrder({
  open,
  onOpenChange,
  defaultPatientId,
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>
            Pick a patient and the tests to run.
          </DialogDescription>
        </DialogHeader>
        <NewOrderBody
          defaultPatientId={defaultPatientId}
          onCancel={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      </DialogContent>
    </Dialog>
  );
}

/** The shared create schema, with a clear message when no patient is picked. */
const formSchema = orderCreateSchema.extend({
  patientId: z.number({ error: "Pick a patient" }).int().positive(),
});

function NewOrderBody({
  defaultPatientId,
  onCancel,
  onCreated,
}: {
  defaultPatientId?: number;
  onCancel: () => void;
  onCreated: (orderId: number) => void;
}) {
  const patients = usePatientOptions();
  const labTests = useLabTestOptions();
  const create = useCreateOrder();

  const form = useForm<z.input<typeof formSchema>, unknown, OrderCreate>({
    resolver: zodResolver(formSchema),
    // No patient is picked until the user picks one (or the filter has one).
    defaultValues: { patientId: defaultPatientId, labTestIds: [] },
  });
  const labTestIds = useWatch({ control: form.control, name: "labTestIds" });
  const picked = (labTests.data?.items ?? []).filter((test) =>
    labTestIds.includes(test.labTestId),
  );

  async function onSubmit(values: OrderCreate) {
    try {
      const order = await create.mutateAsync(values);
      toast.success(`Order ${formatOrderNumber(order.orderId)} placed`);
      onCreated(order.orderId);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-w-0 flex-col gap-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select
                value={field.value === undefined ? "" : String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={patients.isPending}
              >
                <FormControl>
                  <SelectTrigger
                    ref={field.ref}
                    className="h-10 w-full bg-card"
                  >
                    <SelectValue
                      placeholder={
                        patients.isPending
                          ? "Loading patients…"
                          : "Pick a patient"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {patients.data?.items.map((patient) => (
                    <SelectItem
                      key={patient.patientId}
                      value={String(patient.patientId)}
                    >
                      {patient.lastName}, {patient.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="labTestIds"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Tests</FormLabel>
              {labTests.isPending ? (
                <p className="rounded-lg border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
                  Loading tests…
                </p>
              ) : (
                <TestPicker
                  labTests={labTests.data?.items ?? []}
                  selectedIds={field.value}
                  onChange={field.onChange}
                  invalid={fieldState.invalid}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <OrderSummary tests={picked} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={labTestIds.length === 0 || create.isPending}
          >
            {create.isPending ? "Placing…" : "Place order"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
