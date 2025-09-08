import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import type { RiskToken } from '../types';

interface RiskTokensSectionProps {
  riskTokens: RiskToken[];
}

const RiskTokensSection: React.FC<RiskTokensSectionProps> = ({ riskTokens }) => {
  if (!riskTokens || riskTokens.length === 0) {
    return null;
  }

  const getRiskIcon = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Referential Ambiguity & Quantification':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'Context Sufficiency & Integrity':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Instruction Structure & Delimitation':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Verifiability & Factuality':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Reasoning & Uncertainty Handling':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          High Risk Tokens ({riskTokens.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskTokens.map((token) => (
          <div
            key={token.id}
            className="border border-border rounded-lg p-4 space-y-3 bg-background/50"
          >
            {/* Token Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                {getRiskIcon(token.risk_level)}
                <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                  {token.text}
                </code>
                {token.risk_level && (
                  <Badge variant={getRiskBadgeVariant(token.risk_level)}>
                    {token.risk_level}
                  </Badge>
                )}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(token.classification)}`}>
                {token.classification}
              </div>
            </div>

            {/* Reasoning */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Why this is risky:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {token.reasoning}
              </p>
            </div>

            {/* Mitigation */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">How to improve:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {token.mitigation}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RiskTokensSection;
