import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client';
import { graphql } from '@/lib/graphql/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Numpad } from '@/components/ui/numpad';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';

const ADJUST_CREDITS_MUTATION = graphql(`
  mutation AdjustCredits($nfcCardId: String!, $amount: Int!) {
    adjustCredits(nfcCardId: $nfcCardId, amount: $amount) {
      _id
      name
      nfcCardId
      credits
    }
  }
`);

interface CreditAdjustmentProps {
  team: GetTeamsForStoreQuery['teams'][number];
  onBack: () => void;
  onSuccess: () => void;
}

export function CreditAdjustment({
  team,
  onBack,
  onSuccess,
}: CreditAdjustmentProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('0');
  const [isAddMode, setIsAddMode] = useState(false);

  const adjustCredits = useMutation({
    mutationFn: (adjustmentAmount: number) =>
      graphqlClient.request(ADJUST_CREDITS_MUTATION, {
        nfcCardId: team.nfcCardId,
        amount: adjustmentAmount,
      }),
    onSuccess: () => {
      const action = isAddMode ? 'added' : 'removed';
      toast.success(
        `Successfully ${action} ${parseInt(amount || '0', 10).toLocaleString()} credits`,
      );
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { errors?: Array<{ message?: string }> } })
          ?.response?.errors?.[0]?.message || 'Failed to adjust credits';
      toast.error(errorMessage);
    },
  });

  const currentCredits = team.credits;
  const adjustmentAmount = parseInt(amount || '0', 10);
  const newBalance = isAddMode
    ? currentCredits + adjustmentAmount
    : Math.max(0, currentCredits - adjustmentAmount);

  const handleApply = () => {
    if (adjustmentAmount === 0) {
      toast.error('Please enter an amount');
      return;
    }

    const finalAmount = isAddMode ? adjustmentAmount : -adjustmentAmount;
    adjustCredits.mutate(finalAmount);
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Credit Transaction
          </h2>
          <p className="text-sm text-muted-foreground">{team.name}</p>
        </div>
      </div>

      {/* Team Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Team Name
            </span>
            <span className="text-foreground font-semibold">{team.name}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">
              Current Credits
            </span>
            <Badge
              variant="default"
              className="text-lg font-semibold px-4 py-2"
            >
              {currentCredits.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Numpad and Transaction Type */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Numpad value={amount} onChange={setAmount} />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant={!isAddMode ? 'destructive' : 'outline'}
              size="lg"
              className="w-3/4"
              onClick={() => setIsAddMode(false)}
            >
              Spend
            </Button>
            <Button
              type="button"
              variant={isAddMode ? 'default' : 'outline'}
              size="lg"
              className="w-1/4"
              onClick={() => setIsAddMode(true)}
            >
              Refund
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview and Apply */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="text-foreground font-semibold">
                {currentCredits.toLocaleString()} credits
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isAddMode ? 'Adding' : 'Removing'}
              </span>
              <span
                className={`font-semibold ${
                  isAddMode
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isAddMode ? '+' : '-'}
                {adjustmentAmount.toLocaleString()} credits
              </span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-foreground font-semibold">New Balance</span>
              <Badge
                variant="default"
                className="text-lg font-semibold px-4 py-2"
              >
                {newBalance.toLocaleString()} credits
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleApply}
            disabled={adjustCredits.isPending || adjustmentAmount === 0}
            size="lg"
            className="w-full"
          >
            <Check className="w-5 h-5 mr-2" />
            {adjustCredits.isPending
              ? 'Processing...'
              : isAddMode
                ? 'Refund Credits'
                : 'Spend Credits'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
