import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  Stethoscope, 
  Scale, 
  Code,
  Info,
  Book,
  Zap,
  Target
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type Domain = 'general' | 'technical' | 'medical' | 'juridical' | 'historical';
export type AnalysisMode = 'simple' | 'comprehensive';

interface SettingsProps {
  domain: Domain;
  onDomainChange: (domain: Domain) => void;
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
}

const DOMAIN_CONFIG = {
  general: {
    label: 'General',
    icon: SettingsIcon,
    color: 'bg-gray-500',
    description: 'Standard analysis for general purpose prompts',
    context: ''
  },
  technical: {
    label: 'Technical',
    icon: Code,
    color: 'bg-blue-500',
    description: 'Enhanced analysis for technical documentation, code, and software',
    context: `DOMAIN CONTEXT: This is a TECHNICAL prompt that may involve:
- Software development, programming, or code-related content
- Technical documentation, specifications, or procedures
- Engineering concepts, algorithms, or system architectures
- API documentation, configuration, or technical instructions

Pay special attention to:
- Technical accuracy and precision in terminology
- Consistency in technical concepts and naming conventions
- Proper citation of technical standards, versions, or specifications
- Clear distinction between facts and opinions about technical approaches
- Potential ambiguity in technical requirements or implementation details`
  },
  medical: {
    label: 'Medical',
    icon: Stethoscope,
    color: 'bg-red-500',
    description: 'Specialized analysis for medical and healthcare content',
    context: `DOMAIN CONTEXT: This is a MEDICAL prompt that may involve:
- Medical information, diagnoses, treatments, or procedures
- Healthcare advice, patient care, or clinical guidelines
- Pharmaceutical information, drug interactions, or dosages
- Medical research, studies, or clinical trial data
- Health conditions, symptoms, or medical terminology

CRITICAL REQUIREMENTS for medical content:
- Extremely high accuracy standards - medical misinformation can be dangerous
- Always require proper medical disclaimers when giving health advice
- Flag any content that could be interpreted as medical diagnosis or treatment
- Emphasize the need for professional medical consultation
- Be extra cautious about drug information, dosages, and medical procedures
- Require citations for medical claims and statistics`
  },
  juridical: {
    label: 'Juridical',
    icon: Scale,
    color: 'bg-purple-500',
    description: 'Specialized analysis for legal and compliance content',
    context: `DOMAIN CONTEXT: This is a JURIDICAL/LEGAL prompt that may involve:
- Legal advice, interpretations, or legal document analysis
- Compliance requirements, regulations, or statutory information
- Court cases, legal precedents, or case law references
- Contracts, agreements, or legal document drafting
- Rights, obligations, or legal procedures
- Regulatory compliance or legal risk assessment

CRITICAL REQUIREMENTS for legal content:
- High precision in legal terminology and concepts
- Always require legal disclaimers for any legal advice or interpretation
- Flag content that could be interpreted as professional legal counsel
- Emphasize jurisdiction-specific nature of legal information
- Require proper citation of laws, regulations, and legal precedents
- Be cautious about statute of limitations, legal deadlines, and procedural requirements
- Note that legal information may change and require professional legal consultation`
  },
  historical: {
    label: 'Historical',
    icon: Book,
    color: 'bg-amber-500',
    description: 'Specialized analysis for historical and temporal content',
    context: `DOMAIN CONTEXT: This is a HISTORICAL prompt that may involve:
- Historical events, dates, timelines, or chronologies
- Historical figures, biographies, or biographical information
- Historical analysis, interpretations, or historiography
- Cultural, social, or political history topics
- Archaeological findings, historical artifacts, or primary sources
- Cause-and-effect relationships in historical contexts

CRITICAL REQUIREMENTS for historical content:
- Extremely high accuracy for dates, names, and historical facts
- Distinguish between historical consensus and disputed interpretations
- Flag anachronisms or temporal inconsistencies
- Require primary source citations for historical claims
- Be cautious about oversimplified historical narratives
- Note when historical events are complex with multiple perspectives
- Emphasize the importance of historical context and avoid presentism
- Flag potential bias in historical interpretations or selective evidence`
  }
};

const Settings: React.FC<SettingsProps> = ({ domain, onDomainChange, analysisMode, onAnalysisModeChange }) => {
  const selectedDomain = DOMAIN_CONFIG[domain];
  const IconComponent = selectedDomain.icon;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Domain Context Container */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Domain Context:
            </label>
          </div>
          
          <Select value={domain} onValueChange={(value: Domain) => onDomainChange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select domain context">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {selectedDomain.label}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOMAIN_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{config.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {domain !== 'general' && (
            <Badge className={`${selectedDomain.color} text-white flex items-center gap-1`}>
              <IconComponent className="w-3 h-3" />
              {selectedDomain.label} Active
            </Badge>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white">
              <p>LLM applies {selectedDomain.label.toLowerCase()} domain context during analysis</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Analysis Mode Container */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-2">
            {analysisMode === 'comprehensive' ? (
              <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analysis Mode:
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm ${analysisMode === 'simple' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              Simple
            </span>
            <Switch
              checked={analysisMode === 'comprehensive'}
              onCheckedChange={(checked) => onAnalysisModeChange(checked ? 'comprehensive' : 'simple')}
            />
            <span className={`text-sm ${analysisMode === 'comprehensive' ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              Comprehensive
            </span>
          </div>

          {analysisMode === 'comprehensive' && (
            <Badge className="bg-purple-500 text-white flex items-center gap-1">
              <Target className="w-3 h-3" />
              Full Analysis
            </Badge>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white max-w-xs">
              <p>
                {analysisMode === 'comprehensive' 
                  ? 'Includes risk assessment, high-risk tokens, and detailed highlighting'
                  : 'Basic highlighting only, no risk assessment or high-risk token analysis'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Settings;
export { DOMAIN_CONFIG };
