import React, { useState } from 'react';
import {
  Lightbulb,
  Target,
  MessageCircle,
  Globe,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Circle
} from 'lucide-react';
import { ImprovementSuggestions, CulturalAnalysis } from '../../types/Feedback';
import { CulturalBackground } from '../../types/User';

interface ImprovementSuggestionsCardProps {
  suggestions: ImprovementSuggestions;
  culturalAnalysis: CulturalAnalysis;
  culturalBackground: CulturalBackground;
  compact?: boolean;
}

const ImprovementSuggestionsCard: React.FC<ImprovementSuggestionsCardProps> = ({
  suggestions,
  culturalAnalysis,
  culturalBackground,
  compact = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['strengths']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCulturalBackground = (bg: CulturalBackground): string => {
    return bg.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    count: number;
    sectionKey: string;
    color: string;
  }> = ({ icon, title, count, sectionKey, color }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
        expandedSections.has(sectionKey)
          ? `${color} border-opacity-50`
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
        {count > 0 && (
          <span className="px-2 py-1 text-xs bg-white bg-opacity-70 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections.has(sectionKey) ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      )}
    </button>
  );

  const ListSection: React.FC<{
    items: string[];
    sectionKey: string;
    emptyMessage: string;
  }> = ({ items, sectionKey, emptyMessage }) => {
    if (!expandedSections.has(sectionKey)) return null;

    return (
      <div className="mt-2 ml-6">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Circle className="h-2 w-2 text-gray-400 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Quick Feedback</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {formatCulturalBackground(culturalBackground)}
          </span>
        </div>
        
        <div className="space-y-2">
          {suggestions.strengths.length > 0 && (
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{suggestions.strengths[0]}</span>
            </div>
          )}
          
          {suggestions.improvements.length > 0 && (
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{suggestions.improvements[0]}</span>
            </div>
          )}
          
          {suggestions.culturalTips.length > 0 && (
            <div className="flex items-start space-x-2">
              <Globe className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{suggestions.culturalTips[0]}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            <Globe className="h-4 w-4" />
            <span>{formatCulturalBackground(culturalBackground)} Context</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Strengths */}
        <div>
          <SectionHeader
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            title="What You Did Well"
            count={suggestions.strengths.length}
            sectionKey="strengths"
            color="bg-green-50 border-green-200"
          />
          <ListSection
            items={suggestions.strengths}
            sectionKey="strengths"
            emptyMessage="No specific strengths identified"
          />
        </div>

        {/* Areas for Improvement */}
        <div>
          <SectionHeader
            icon={<Target className="h-5 w-5 text-blue-600" />}
            title="Areas for Improvement"
            count={suggestions.improvements.length}
            sectionKey="improvements"
            color="bg-blue-50 border-blue-200"
          />
          <ListSection
            items={suggestions.improvements}
            sectionKey="improvements"
            emptyMessage="No improvements suggested"
          />
        </div>

        {/* Cultural Tips */}
        <div>
          <SectionHeader
            icon={<Globe className="h-5 w-5 text-purple-600" />}
            title="Cultural Context Tips"
            count={suggestions.culturalTips.length}
            sectionKey="culturalTips"
            color="bg-purple-50 border-purple-200"
          />
          <ListSection
            items={suggestions.culturalTips}
            sectionKey="culturalTips"
            emptyMessage="No cultural tips provided"
          />
        </div>

        {/* Alternative Approaches */}
        <div>
          <SectionHeader
            icon={<BookOpen className="h-5 w-5 text-orange-600" />}
            title="Alternative Approaches"
            count={suggestions.alternativeApproaches.length}
            sectionKey="alternatives"
            color="bg-orange-50 border-orange-200"
          />
          <ListSection
            items={suggestions.alternativeApproaches}
            sectionKey="alternatives"
            emptyMessage="No alternative approaches suggested"
          />
        </div>

        {/* Better Questions */}
        <div>
          <SectionHeader
            icon={<MessageCircle className="h-5 w-5 text-teal-600" />}
            title="Better Questions to Ask"
            count={suggestions.questionsToAsk.length}
            sectionKey="questions"
            color="bg-teal-50 border-teal-200"
          />
          <ListSection
            items={suggestions.questionsToAsk}
            sectionKey="questions"
            emptyMessage="No specific questions suggested"
          />
        </div>

        {/* Cultural Analysis */}
        {(culturalAnalysis.assumptions.length > 0 || 
          culturalAnalysis.biases.length > 0 || 
          culturalAnalysis.culturalMisses.length > 0) && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Cultural Analysis</span>
            </h4>
            
            <div className="space-y-3">
              {culturalAnalysis.assumptions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-red-700 mb-1">Assumptions Detected:</h5>
                  <ul className="space-y-1">
                    {culturalAnalysis.assumptions.map((assumption, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {culturalAnalysis.biases.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-orange-700 mb-1">Potential Biases:</h5>
                  <ul className="space-y-1">
                    {culturalAnalysis.biases.map((bias, index) => (
                      <li key={index} className="text-sm text-orange-600 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{bias}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {culturalAnalysis.culturalMisses.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Cultural Opportunities Missed:</h5>
                  <ul className="space-y-1">
                    {culturalAnalysis.culturalMisses.map((miss, index) => (
                      <li key={index} className="text-sm text-blue-600 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{miss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {culturalAnalysis.appropriateReferences.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-1">Appropriate Cultural References:</h5>
                  <ul className="space-y-1">
                    {culturalAnalysis.appropriateReferences.map((ref, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-start space-x-2">
                        <span className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovementSuggestionsCard;