import { zodResolver } from "@hookform/resolvers/zod";
import { type Patient, patientCreateSchema } from "@lab/shared";
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
import { apiErrorMessage } from "@/lib/api-error";
import { useCreatePatient, useUpdatePatient } from "./usePatients";

/**
 * The shared create schema, with the optional fields as plain strings:
 * an empty input means "no value".
 */
const formSchema = patientCreateSchema.extend({
  dateOfBirth: z.iso.date({ error: "Enter a date of birth" }),
  phone: z.string().trim().max(30),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
});
type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The patient to edit. Leave out to add a new one. */
  patient?: Patient;
};

export function PatientForm({ open, onOpenChange, patient }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient ? "Edit patient" : "Add patient"}</DialogTitle>
          <DialogDescription>
            Name and date of birth are required.
          </DialogDescription>
        </DialogHeader>
        {/* key: a fresh form each time the dialog opens for a patient */}
        <PatientFormBody
          key={patient?.patientId ?? "new"}
          patient={patient}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function PatientFormBody({
  patient,
  onDone,
}: {
  patient?: Patient;
  onDone: () => void;
}) {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const saving = create.isPending || update.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      dateOfBirth: patient?.dateOfBirth ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    const input = {
      ...values,
      phone: values.phone || undefined,
      email: values.email || undefined,
    };
    try {
      if (patient) {
        await update.mutateAsync({ ...input, patientId: patient.patientId });
        toast.success("Patient saved");
      } else {
        await create.mutateAsync(input);
        toast.success("Patient added");
      }
      onDone();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="off" {...field} />
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
            {saving ? "Saving…" : patient ? "Save changes" : "Add patient"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
