
import { useState } from "react";
import { TransactionHistory } from "@/types/vault";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerHeader, 
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TxDrawerProps {
  tx: TransactionHistory | null;
  open: boolean;
  onClose: () => void;
}

export function TxDrawer({ tx, open, onClose }: TxDrawerProps) {
  const { toast } = useToast();
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  
  if (!tx) return null;
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Mock transaction hash
  const txHash = "0x7d83c975da6e3b5ff8259436d4f7da6d75da6e3b5ff825943";
  
  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    toast({
      title: "Hash copied to clipboard",
      duration: 2000
    });
  };
  
  // Mock transaction data
  const mockTxData = {
    blockNumber: 12345678,
    gasUsed: "0.000236 SUI",
    status: tx.status,
    network: "Sui Mainnet",
    from: "0x6e3b5ff825943675da6e3b5ff825943675da6e",
    to: "0x3675da6e3b5ff8259436d4f7da675da6e3b5ff8",
    nonce: 42,
    events: [
      {
        type: tx.type === "deposit" ? "DepositEvent" : "WithdrawEvent",
        vaultId: tx.vaultId,
        amount: tx.amount,
        timestamp: tx.timestamp
      }
    ]
  };
  
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-xl">
            {tx.type === 'deposit' ? 'Deposit to' : 'Withdrawal from'} {tx.vaultName}
          </DrawerTitle>
          <DrawerDescription className="opacity-60">
            {formatDate(tx.timestamp)}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-6">
          <div className="glass-card p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">Transaction Hash</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={handleCopyHash}
              >
                Copy
              </Button>
            </div>
            <p className="font-mono text-sm break-all">{txHash}</p>
            <a 
              href={`https://explorer.sui.io/txblock/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs flex items-center text-nova mt-2 hover:underline"
            >
              View on Sui Explorer
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
          
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium mb-3">Transaction Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Type</span>
                  <span className="text-sm font-medium">{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Amount</span>
                  <span className="text-sm font-mono font-medium">
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Status</span>
                  <span className={`text-sm font-medium ${
                    tx.status === 'completed' ? 'text-emerald' : 
                    tx.status === 'pending' ? 'text-orion' : 'text-red-500'
                  }`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Block Number</span>
                  <span className="text-sm font-mono">{mockTxData.blockNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Gas Used</span>
                  <span className="text-sm font-mono">{mockTxData.gasUsed}</span>
                </div>
              </div>
            </div>
            
            <Collapsible 
              open={isJsonOpen} 
              onOpenChange={setIsJsonOpen} 
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Raw Event Data</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isJsonOpen ? "transform rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2">
                <pre className="bg-black/30 p-3 rounded-md text-xs font-mono overflow-x-auto">
                  {JSON.stringify(mockTxData, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
