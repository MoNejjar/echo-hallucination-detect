import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  MapPin,
  AlertTriangle,
  FileWarning,
  Radical,
  UserRound,
  CircleHelp,
  Zap,
  BrickWall,
  Sparkles,
  LayoutDashboard,
  ChartNoAxesCombined,
  ScrollText,
  Atom,
  FileText,
  Shield,
  Info,
  Palette,
  X,
} from 'lucide-react';
import {
  HALLUCINATION_GUIDELINES,
  type HallucinationClass,
  type Pillar,
  type Rule,
  type RiskClass,
  getSeverityBadgeColor,
  getHallucinationTypeColor,
  getPillarById,
  getRuleById,
} from '../lib/library-data';

type ViewState =
  | { type: 'intro' }
  | { type: 'class-selection' }
  | { type: 'pillar-grid'; classId: RiskClass }
  | { type: 'rule-detail'; pillarId: string; ruleId: string };

interface LibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pillarIcons: Record<string, React.ReactNode> = {
  A: <MapPin className="w-6 h-6" />,
  B: <AlertTriangle className="w-6 h-6" />,
  C: <BrickWall className="w-6 h-6" />,
  D: <FileWarning className="w-6 h-6" />,
  E: <Radical className="w-6 h-6" />,
  F: <FileText className="w-6 h-6" />,
  G: <Sparkles className="w-6 h-6" />,
  H: <UserRound className="w-6 h-6" />,
  I: <CircleHelp className="w-6 h-6" />,
  J: <LayoutDashboard className="w-6 h-6" />,
  K: <ChartNoAxesCombined className="w-6 h-6" />,
  L: <Zap className="w-6 h-6" />,
};

export function LibraryDialog({ open, onOpenChange }: LibraryDialogProps) {
  const [viewState, setViewState] = useState<ViewState>({ type: 'intro' });
  const [navigationHistory, setNavigationHistory] = useState<ViewState[]>([]);
  const [showColorGuide, setShowColorGuide] = useState(false);

  const navigateTo = (newState: ViewState) => {
    setNavigationHistory([...navigationHistory, viewState]);
    setViewState(newState);
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(navigationHistory.slice(0, -1));
      setViewState(previous);
    }
  };

  const resetNavigation = () => {
    setViewState({ type: 'intro' });
    setNavigationHistory([]);
  };

  React.useEffect(() => {
    if (!open) {
      resetNavigation();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 [&>button]:hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {navigationHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateBack}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <BookOpen className="w-6 h-6 text-primary flex-shrink-0" />
              <DialogTitle className="text-2xl font-bold truncate">
                Detection Guidelines Library
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorGuide(true)}
                className="gap-2 flex-shrink-0"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Color Guide</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] p-6">
          <AnimatePresence mode="wait">
            {viewState.type === 'intro' && (
              <IntroView key="intro" onNext={() => setViewState({ type: 'class-selection' })} />
            )}
            {viewState.type === 'class-selection' && (
              <ClassSelectionView
                key="class-selection"
                onSelectClass={(classId) =>
                  navigateTo({ type: 'pillar-grid', classId })
                }
              />
            )}
            {viewState.type === 'pillar-grid' && (
              <PillarGridView
                key={`pillar-grid-${viewState.classId}`}
                classId={viewState.classId}
                onSelectPillar={(pillarId) =>
                  navigateTo({
                    type: 'rule-detail',
                    pillarId,
                    ruleId: getPillarById(pillarId)?.rules[0]?.id || '',
                  })
                }
              />
            )}
            {viewState.type === 'rule-detail' && (
              <RuleDetailView
                key={`rule-${viewState.ruleId}`}
                pillarId={viewState.pillarId}
                ruleId={viewState.ruleId}
                onSelectRule={(newRuleId) =>
                  setViewState({ ...viewState, ruleId: newRuleId })
                }
              />
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>

      {/* Color Guide Dialog */}
      <Dialog open={showColorGuide} onOpenChange={setShowColorGuide}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Color Guide
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-100px)] pr-4">
          <div className="space-y-8 py-4">
            {/* Risk Intensity - Horizontal Circles */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">Risk Intensity</h3>
              <div className="flex justify-center items-center gap-8 py-4">
                {/* Low - Green */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 dark:bg-green-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low</span>
                </motion.div>

                {/* Medium - Yellow */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-full bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-600 dark:bg-yellow-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium</span>
                </motion.div>

                {/* High - Orange */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-orange-600 dark:bg-orange-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High</span>
                </motion.div>

                {/* Critical - Red */}
                <motion.div
                  className="flex flex-col items-center gap-3"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 dark:bg-red-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical</span>
                </motion.div>
              </div>
            </div>

            {/* Hallucination Taxonomy - Nested Boxes */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">Hallucination Taxonomy</h3>
              
              {/* Root Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Hallucinations</span>
                </div>

                {/* Classes Container */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Prompt-Related Box */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border-2 border-rose-300 dark:border-rose-700"
                  >
                    <div className="font-semibold text-sm text-rose-900 dark:text-rose-100 mb-3 text-center">
                      Prompt-Related
                    </div>

                    {/* Nested Types */}
                    <div className="space-y-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-orange-100 dark:bg-orange-950/40 rounded-md border border-orange-300 dark:border-orange-700"
                      >
                        <span className="text-xs font-medium text-orange-900 dark:text-orange-100">Faithfulness</span>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-green-100 dark:bg-green-950/40 rounded-md border border-green-300 dark:border-green-700"
                      >
                        <span className="text-xs font-medium text-green-900 dark:text-green-100">Factuality</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Meta-Related Box */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-lg border-2 border-teal-300 dark:border-teal-700"
                  >
                    <div className="font-semibold text-sm text-teal-900 dark:text-teal-100 mb-3 text-center">
                      Meta-Related
                    </div>

                    {/* Nested Types */}
                    <div className="space-y-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-orange-100 dark:bg-orange-950/40 rounded-md border border-orange-300 dark:border-orange-700"
                      >
                        <span className="text-xs font-medium text-orange-900 dark:text-orange-100">Faithfulness</span>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-green-100 dark:bg-green-950/40 rounded-md border border-green-300 dark:border-green-700"
                      >
                        <span className="text-xs font-medium text-green-900 dark:text-green-100">Factuality</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function IntroView({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary"
        >
          <BookOpen className="w-10 h-10" />
        </motion.div>
        <h2 className="text-3xl font-bold">Research-Backed Detection System</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Both the highlighter model and conversational assistant have been built upon{' '}
          <span className="font-semibold text-foreground">
            thorough literature research
          </span>{' '}
          on the causes of faithfulness hallucinations in Large Language Models.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Taxonomy Overview
        </h3>
        <p className="text-muted-foreground">
          In this thesis, faithfulness hallucination has been systematically divided into two
          fundamental classes:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-background rounded-lg p-4 border-2 border-rose-200 dark:border-rose-800">
            <h4 className="font-semibold text-rose-600 dark:text-rose-400 mb-2">
              Prompt-Related Causes
            </h4>
            <p className="text-sm text-muted-foreground">
              Token-level risks that are localizable and highlightable within the prompt text
              itself.
            </p>
          </div>
          <div className="bg-background rounded-lg p-4 border-2 border-teal-200 dark:border-teal-800">
            <h4 className="font-semibold text-teal-600 dark:text-teal-400 mb-2">
              Meta-Related Causes
            </h4>
            <p className="text-sm text-muted-foreground">
              Structural and contextual risks that affect the entire prompt but are not
              localizable to specific tokens.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onNext} size="lg" className="gap-2">
          Explore the Guidelines
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function ClassSelectionView({
  onSelectClass,
}: {
  onSelectClass: (classId: RiskClass) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select Hallucination Class</h2>
        <p className="text-muted-foreground">
          Choose a category to explore its detection pillars and rules
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {HALLUCINATION_GUIDELINES.map((hallucinationClass, index) => (
          <motion.button
            key={hallucinationClass.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectClass(hallucinationClass.id)}
            className={`group relative overflow-hidden rounded-xl p-8 text-left transition-all border-2 ${
              hallucinationClass.id === 'prompt'
                ? 'border-rose-200 hover:border-rose-400 dark:border-rose-800 dark:hover:border-rose-600 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900'
                : 'border-teal-200 hover:border-teal-400 dark:border-teal-800 dark:hover:border-teal-600 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900'
            }`}
          >
            <div className="relative z-10">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-lg mb-4 ${
                  hallucinationClass.id === 'prompt'
                    ? 'bg-rose-500 text-white'
                    : 'bg-teal-500 text-white'
                }`}
              >
                {hallucinationClass.id === 'prompt' ? (
                  <ScrollText className="w-7 h-7" />
                ) : (
                  <Atom className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2">{hallucinationClass.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hallucinationClass.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span
                  className={
                    hallucinationClass.id === 'prompt'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-teal-600 dark:text-teal-400'
                  }
                >
                  {hallucinationClass.pillars.length} Pillars
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                    hallucinationClass.id === 'prompt'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-teal-600 dark:text-teal-400'
                  }`}
                />
              </div>
            </div>
            <motion.div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                hallucinationClass.id === 'prompt'
                  ? 'bg-gradient-to-br from-rose-400/20 to-transparent'
                  : 'bg-gradient-to-br from-teal-400/20 to-transparent'
              }`}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function PillarGridView({
  classId,
  onSelectPillar,
}: {
  classId: RiskClass;
  onSelectPillar: (pillarId: string) => void;
}) {
  const hallucinationClass = HALLUCINATION_GUIDELINES.find((c) => c.id === classId);
  if (!hallucinationClass) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Badge
          variant="secondary"
          className={
            classId === 'prompt'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
              : 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
          }
        >
          {hallucinationClass.name}
        </Badge>
        <h2 className="text-2xl font-bold">Detection Pillars</h2>
        <p className="text-muted-foreground">{hallucinationClass.description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hallucinationClass.pillars.map((pillar, index) => {
          // Determine the dominant hallucination type for this pillar
          const hallucinationTypes = pillar.rules
            .map(r => r.hallucinationType)
            .filter((t): t is NonNullable<typeof t> => t !== undefined);
          
          // If all rules have the same type, use that; otherwise default to undefined (gray)
          const dominantType = hallucinationTypes.length > 0 && 
            hallucinationTypes.every(t => t === hallucinationTypes[0])
            ? hallucinationTypes[0]
            : undefined;
          
          const colors = getHallucinationTypeColor(dominantType);
          
          return (
            <motion.button
              key={pillar.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectPillar(pillar.id)}
              className={`group text-left p-5 rounded-lg border-2 ${colors.border} hover:border-primary/50 ${colors.bg} hover:bg-accent/50 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {pillarIcons[pillar.id] || <BookOpen className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {pillar.id}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {pillar.rules.length} rules
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {pillar.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {pillar.description}
                  </p>
                  {/* Rule type indicators */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {pillar.rules.map((rule) => {
                      const ruleColors = getHallucinationTypeColor(rule.hallucinationType);
                      const dotColor = rule.hallucinationType === 'faithfulness' 
                        ? 'bg-orange-500' 
                        : rule.hallucinationType === 'factuality'
                        ? 'bg-green-500'
                        : 'bg-gray-500';
                      
                      return (
                        <div
                          key={rule.id}
                          className={`w-2 h-2 rounded-full ${dotColor}`}
                          title={`${rule.id}: ${rule.hallucinationType || 'both'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function RuleDetailView({
  pillarId,
  ruleId,
  onSelectRule,
}: {
  pillarId: string;
  ruleId: string;
  onSelectRule: (ruleId: string) => void;
}) {
  const pillar = getPillarById(pillarId);
  const result = getRuleById(ruleId);

  if (!pillar || !result) return null;

  const { rule } = result;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      {/* Rule Navigation */}
      {pillar.rules.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {pillar.rules.map((r) => (
            <Button
              key={r.id}
              variant={r.id === ruleId ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectRule(r.id)}
              className="font-mono text-xs"
            >
              {r.id}
            </Button>
          ))}
        </div>
      )}

      {/* Rule Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {pillarIcons[pillar.id] || <BookOpen className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="font-mono">
                {pillar.id}
              </Badge>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <Badge variant="outline" className="font-mono">
                {rule.id}
              </Badge>
              {/* Hallucination Type Indicator */}
              {rule.hallucinationType && (
                <Badge 
                  className={
                    rule.hallucinationType === 'faithfulness'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700'
                      : rule.hallucinationType === 'factuality'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                  }
                >
                  {rule.hallucinationType === 'faithfulness' ? '🎯 Faithfulness' : 
                   rule.hallucinationType === 'factuality' ? '✓ Factuality' : 
                   '⚡ Both'}
                </Badge>
              )}
              {rule.faithfulnessSeverity && (
                <div className={`px-3 py-1 rounded-md text-xs font-semibold ${getSeverityBadgeColor(rule.faithfulnessSeverity)}`}>
                  Faithfulness: {rule.faithfulnessSeverity} risk
                </div>
              )}
              {rule.factualitySeverity && (
                <div className={`px-3 py-1 rounded-md text-xs font-semibold ${getSeverityBadgeColor(rule.factualitySeverity)}`}>
                  Factuality: {rule.factualitySeverity} risk
                </div>
              )}
              {!rule.faithfulnessSeverity && !rule.factualitySeverity && (
                <Badge className={getSeverityBadgeColor(rule.severity)}>
                  {rule.severity} risk
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold">{rule.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{pillar.name}</p>
          </div>
        </div>
      </div>

      {/* Detection Patterns */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Detection Patterns
        </h3>
        <div className="space-y-2">
          {rule.patterns.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>
              <p className="text-sm flex-1">{pattern.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Examples
        </h3>
        <div className="space-y-3">
          {rule.examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border bg-card space-y-2"
            >
              <code className="text-sm block font-mono bg-muted p-3 rounded">
                {example.text}
              </code>
              {example.note && (
                <p className="text-xs text-muted-foreground italic">💡 {example.note}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mitigation Strategy */}
      {rule.mitigation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 space-y-2"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-300">
            <Shield className="w-5 h-5" />
            Mitigation Strategy
          </h3>
          <p className="text-sm text-green-900 dark:text-green-100">{rule.mitigation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
