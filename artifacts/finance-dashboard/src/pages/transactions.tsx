import { useState, useMemo } from "react";
import { useListTransactions, Transaction } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Plus, Search, Filter, ArrowUpDown, Trash2, Edit2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/lib/role-context";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactionsMutations } from "@/hooks/use-transactions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useListTransactions();
  const { deleteTransaction } = useTransactionsMutations();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    let filtered = [...transactions];
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(lower) || 
        tx.category.toLowerCase().includes(lower)
      );
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter]);

  const handleEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTx(null);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (txToDelete) {
      deleteTransaction.mutate(
        { id: txToDelete.id },
        {
          onSuccess: () => {
            toast({ title: "Transaction deleted" });
            setTxToDelete(null);
          },
          onError: () => {
            toast({ title: "Failed to delete transaction", variant: "destructive" });
            setTxToDelete(null);
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-primary">LEDGER</h2>
          <p className="text-sm text-muted-foreground">Complete record of financial activities.</p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate} className="font-mono uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border focus-visible:ring-primary font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background border-border font-mono text-xs uppercase tracking-wider">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-mono text-xs uppercase">All Types</SelectItem>
                  <SelectItem value="income" className="font-mono text-xs uppercase text-chart-2">Income</SelectItem>
                  <SelectItem value="expense" className="font-mono text-xs uppercase text-destructive">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground w-[120px]">Date</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Description</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Category</TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground text-right">Amount</TableHead>
                  {isAdmin && <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground text-right w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      {isAdmin && <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>}
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-12 text-muted-foreground font-mono text-sm uppercase tracking-widest">
                      No records match the given criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border hover:bg-secondary/20 transition-colors group">
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {format(new Date(tx.date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${tx.type === 'income' ? 'bg-chart-2' : 'bg-destructive'}`} />
                          {tx.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider bg-secondary/50 text-foreground border-border">
                          {tx.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono font-medium ${tx.type === 'income' ? 'text-chart-2' : 'text-foreground'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleEdit(tx)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setTxToDelete(tx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TransactionForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        transaction={selectedTx} 
      />

      <AlertDialog open={!!txToDelete} onOpenChange={(open) => !open && setTxToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono uppercase tracking-widest text-destructive">Terminate Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              "{txToDelete?.description}" for ${txToDelete?.amount.toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs uppercase tracking-widest border-border hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-xs uppercase tracking-widest">
              {deleteTransaction.isPending ? "Deleting..." : "Confirm Deletion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
