import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTransactionsMutations } from "@/hooks/use-transactions";
import { Transaction } from "@workspace/api-client-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be positive."),
  type: z.enum(["income", "expense"]),
  category: z.string().min(2, "Category is required."),
  date: z.date({
    required_error: "A date is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
}

export function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const { createTransaction, updateTransaction } = useTransactionsMutations();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (transaction) {
        form.reset({
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: new Date(transaction.date),
        });
      } else {
        form.reset({
          description: "",
          amount: 0,
          type: "expense",
          category: "",
          date: new Date(),
        });
      }
    }
  }, [open, transaction, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      date: values.date.toISOString(),
    };

    if (transaction) {
      updateTransaction.mutate(
        { id: transaction.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Transaction updated" });
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to update transaction", variant: "destructive" });
          }
        }
      );
    } else {
      createTransaction.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Transaction created" });
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Failed to create transaction", variant: "destructive" });
          }
        }
      );
    }
  };

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-primary uppercase tracking-wider">
            {transaction ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction ? "Update the details of this ledger entry." : "Enter the details for a new ledger entry."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" className="bg-background border-border font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2.5">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-background border-border hover:bg-secondary",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Grocery, Salary, etc." className="bg-background border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Food, Tech, Rent" className="bg-background border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full font-mono uppercase tracking-widest text-xs">
                {isPending ? "Processing..." : transaction ? "Update Ledger" : "Commit to Ledger"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
