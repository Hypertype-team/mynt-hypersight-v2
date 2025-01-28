import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "@/types/ticket";

interface TicketData {
  tickets: Ticket[];
  totalCount: number;
}

export const useTicketData = () => {
  const { toast } = useToast();

  return useQuery<TicketData>({
    queryKey: ["tickets"],
    queryFn: async () => {
      console.log("Fetching all tickets...");

      const { data, error, count } = await supabase
        .from("ticket_analysis")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .limit(10000);

      if (error) {
        toast({
          title: "Error fetching tickets",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return { tickets: (data as Ticket[]) || [], totalCount: count || 0 };
    },
  });
};