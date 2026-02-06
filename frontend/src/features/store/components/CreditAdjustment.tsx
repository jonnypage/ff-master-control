import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BanknoteArrowDown, BanknoteArrowUp, Check, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Numpad } from '@/components/ui/numpad';
import type { GetTeamsForStoreQuery } from '@/lib/graphql/generated';
import { useAdjustCredits } from '@/lib/api/useApi';
import { TeamBanner } from '@/features/teams/components/TeamBanner';
import { getBannerIconById } from '@/features/teams/components/banner-icons';

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
  const [amount, setAmount] = useState('0');
  const [isAddMode, setIsAddMode] = useState(false);
  const adjustCredits = useAdjustCredits();

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
    adjustCredits.mutate(
      { teamId: team._id, amount: finalAmount },
      {
        onSuccess: () => {
          const action = isAddMode ? 'added' : 'removed';
          toast.success(
            `Successfully ${action} ${parseInt(amount || '0', 10).toLocaleString()} credits`,
          );
          onSuccess();
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { errors?: Array<{ message?: string }> } })
              ?.response?.errors?.[0]?.message || 'Failed to adjust credits';
          toast.error(errorMessage);
        },
      },
    );
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
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Team Name
                </span>
                <span className="text-foreground font-semibold truncate">
                  {team.name}
                </span>
              </div>
            </div>
            <TeamBanner
              color={team.bannerColor}
              icon={getBannerIconById(team.bannerIcon)}
              size="sm"
              className="w-12 shrink-0"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 shrink-0" />
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
              variant="outline"
              size="lg"
              className={`w-1/4 ${
                isAddMode
                  ? 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                  : ''
              }`}
              onClick={() => setIsAddMode(true)}
            >
              Refund
            </Button>
          </div>
          <Numpad value={amount} onChange={setAmount} />
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
              <span className="text-muted-foreground flex items-center gap-2">
                <Coins className="w-4 h-4 shrink-0" />
                Current Balance
              </span>
              <span className="text-foreground font-semibold">
                {currentCredits.toLocaleString()} credits
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground ">

                {isAddMode ? (
                  <span className="flex items-center gap-2">
                  <BanknoteArrowUp/> Refunding
                  </span>
                  ) : (
                  <span className="flex items-center gap-2">
                  <BanknoteArrowDown/> Spending
                  </span>
                  )}
              </span>
              <span
                className={`font-semibold ${
                  isAddMode
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >

                {adjustmentAmount.toLocaleString()} credits
              </span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-foreground font-semibold flex items-center gap-2">
                <Coins className="w-4 h-4 shrink-0" />
                New Balance
              </span>
              <Badge
                variant="default"
                className="text-lg font-semibold pl-4 pr-0 py-2"
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
