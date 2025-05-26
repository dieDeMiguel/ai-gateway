'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Force the API to regenerate benchmark data
      await fetch(`/api/benchmarks?refresh=${Date.now()}`);
      
      // Refresh the current route (this will trigger a revalidation of the data)
      router.refresh();
    } catch (error) {
      console.error('Error refreshing benchmarks:', error);
    } finally {
      // Set a timeout to make the loading state visible for at least a moment
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      size="sm"
      variant="outline"
      disabled={refreshing}
      className="gap-2"
    >
      <RefreshCw
        className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
      />
      {refreshing ? "Refreshing..." : "Refresh"}
    </Button>
  );
}

// Default export for dynamic import
const RefreshButtonExport = { RefreshButton };
export default RefreshButtonExport; 