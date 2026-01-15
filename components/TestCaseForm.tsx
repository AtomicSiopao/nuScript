
import React, { KeyboardEvent, useState } from 'react';
import { Framework, DesignPattern, TestCaseData, Language, TestStep } from '../types';
import { suggestCompleteTestCase } from '../services/geminiService';
import TestCasePreview from './TestCasePreview';

interface TestCaseFormProps {
  testCase: TestCaseData;
  onTestCaseChange: (data: TestCaseData) => void;
  selectedFramework: Framework | '';
  onFrameworkChange: (f: Framework) => void;
  selectedPattern: DesignPattern | '';
  onPatternChange: (p: DesignPattern) => void;
  selectedLanguage: Language;
  onLanguageChange: (l: Language) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isSplitView: boolean;
  onToggleSplitView: () => void;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({
  testCase,
  onTestCaseChange,
  selectedFramework,
  onFrameworkChange,
  selectedPattern,
  onPatternChange,
  selectedLanguage,
  onLanguageChange,
  onGenerate,
  isGenerating,
  isSplitView,
  onToggleSplitView,
}) => {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const handleChange = (field: keyof TestCaseData, value: any) => {
    onTestCaseChange({ ...testCase, [field]: value });
  };

  const handleStepChange = (index: number, field: keyof TestStep, value: string) => {
    const newSteps = [...testCase.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    handleChange('steps', newSteps);
  };

  const addStep = (index?: number) => {
    const newStep: TestStep = {
      id: Math.random().toString(36).substr(2, 9),
      action: '',
      expected: '',
    };
    
    const newSteps = [...testCase.steps];
    if (typeof index === 'number') {
      newSteps.splice(index + 1, 0, newStep);
    } else {
      newSteps.push(newStep);
    }
    handleChange('steps', newSteps);
  };

  const removeStep = (index: number) => {
    if (testCase.steps.length <= 1) {
        handleStepChange(0, 'action', '');
        handleStepChange(0, 'expected', '');
        return;
    }
    const newSteps = testCase.steps.filter((_, i) => i !== index);
    handleChange('steps', newSteps);
  };

  const handleAutoFill = async () => {
    if (!testCase.title.trim()) return;
    
    setIsAutoFilling(true);
    try {
      const suggestions = await suggestCompleteTestCase(testCase.title);
      
      let formattedTestData = suggestions.testData || "";
      try {
        if (formattedTestData) {
          const parsed = JSON.parse(formattedTestData);
          formattedTestData = JSON.stringify(parsed, null, 2);
        }
      } catch (e) {}

      onTestCaseChange({
        ...testCase,
        description: suggestions.description || testCase.description,
        preconditions: suggestions.preconditions || testCase.preconditions,
        testData: formattedTestData || testCase.testData,
        steps: suggestions.steps || testCase.steps,
      });
    } catch (error) {
      console.error("Failed to auto-fill test case", error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleActionKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStep(index);
      setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('input[name="step-action"]');
          if (inputs[index + 1]) {
              inputs[index + 1].focus();
          }
      }, 0);
    }
  };

  const handleTestDataKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const spaces = "  ";
      
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      handleChange('testData', newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  const isFormValid =
    testCase.title.trim() !== '' &&
    selectedFramework !== '' &&
    selectedPattern !== '' &&
    testCase.steps.some(s => s.action.trim() !== '');

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-300">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 font-sans">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Test Definition
          </h2>
          <div className="flex items-center gap-2">
              <button
                  onClick={onToggleSplitView}
                  className={`p-2 rounded transition-colors ${isSplitView ? 'bg-primary/10 text-primary' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                  title={isSplitView ? "Close Split View" : "Toggle Split View"}
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
              </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-32">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">ID</label>
                <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="TC-001"
                    value={testCase.id}
                    onChange={(e) => handleChange('id', e.target.value)}
                />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Test Case Title</label>
                  {testCase.title.trim() && (
                    <button
                      onClick={handleAutoFill}
                      disabled={isAutoFilling}
                      className="text-xs font-medium text-primary hover:text-primaryHover flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAutoFilling ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      )}
                      Auto-fill Details
                    </button>
                  )}
              </div>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="e.g., Validate User Checkout Process"
                value={testCase.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Framework</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium transition-colors"
                  value={selectedFramework}
                  onChange={(e) => onFrameworkChange(e.target.value as Framework)}
                >
                  <option value="" disabled>Select Framework</option>
                  {Object.values(Framework).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className={`transition-opacity duration-300 ${selectedFramework ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Script Pattern</label>
              <div className="relative">
                  <select
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium transition-colors"
                  value={selectedPattern}
                  onChange={(e) => onPatternChange(e.target.value as DesignPattern)}
                  disabled={!selectedFramework}
                  >
                  <option value="" disabled>Select Pattern</option>
                  {Object.values(DesignPattern).map((p) => (
                      <option key={p} value={p}>{p}</option>
                  ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
              </div>
            </div>

            {selectedFramework === Framework.Cypress && (
               <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4 mt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Script Language</label>
                  <div className="flex gap-4">
                    {Object.values(Language).map((lang) => (
                      <label key={lang} className="flex items-center cursor-pointer group">
                        <input 
                          type="radio" 
                          name="language" 
                          value={lang} 
                          checked={selectedLanguage === lang}
                          onChange={() => onLanguageChange(lang)}
                          className="hidden"
                        />
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${selectedLanguage === lang ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600 group-hover:border-primary'}`}>
                          {selectedLanguage === lang && <span className="w-2 h-2 bg-white rounded-full"></span>}
                        </span>
                        <span className={`text-sm font-medium ${selectedLanguage === lang ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{lang}</span>
                      </label>
                    ))}
                  </div>
               </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none h-20"
              placeholder="High level summary..."
              value={testCase.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div>
               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preconditions</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-32 leading-relaxed"
                placeholder={'e.g.,\n1. User is logged in\n2. Dashboard is accessible'}
                value={testCase.preconditions}
                onChange={(e) => handleChange('preconditions', e.target.value)}
              />
          </div>

           <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Test Data</label>
              <div className="rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm">
                  <div className="bg-slate-800 px-4 py-1.5 flex items-center">
                      <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                          <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                          test_data.json
                      </span>
                  </div>
                  <textarea
                      className="w-full px-4 py-3 bg-slate-900 text-slate-100 placeholder-slate-600 focus:ring-0 border-0 outline-none resize-none h-40 font-mono text-sm"
                      placeholder={'{\n  "username": "talos_user",\n  "role": "admin"\n}'}
                      value={testCase.testData}
                      onChange={(e) => handleChange('testData', e.target.value)}
                      onKeyDown={handleTestDataKeyDown}
                  />
              </div>
           </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Test Steps & Expected Results</label>
                <button 
                    onClick={() => addStep()}
                    className="text-xs font-bold text-primary hover:text-primaryHover flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Step
                </button>
            </div>
            
            <div className="space-y-3">
              {testCase.steps.map((step, index) => (
                <div key={step.id} className="group relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 transition-all hover:border-primary/30 dark:hover:border-primary/30">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                        </div>
                        <input
                            name="step-action"
                            type="text"
                            className="flex-1 bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary outline-none transition-colors"
                            placeholder={`Step ${index + 1} action`}
                            value={step.action}
                            onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                            onKeyDown={(e) => handleActionKeyDown(e, index)}
                        />
                        <button 
                            onClick={() => removeStep(index)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="pl-9 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-800 py-1 text-xs text-slate-600 dark:text-slate-300 placeholder-slate-500 focus:border-primary outline-none transition-colors"
                            placeholder="Expected result..."
                            value={step.expected}
                            onChange={(e) => handleStepChange(index, 'expected', e.target.value)}
                        />
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onGenerate}
            disabled={!isFormValid || isGenerating}
            className={`w-full py-3.5 px-6 rounded-lg text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3 overflow-hidden relative
              ${!isFormValid || isGenerating 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primaryHover active:scale-[0.99] shadow-indigo-500/10 hover:shadow-indigo-500/20'}`}
          >
            {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite] -skew-x-12 transform"></div>
            )}
            
            {isGenerating ? (
              <>
                 <svg className="w-6 h-6 animate-forge mr-1 text-white/90" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 2.2l-2.7-2.7c-0.6-0.6-1.6-0.6-2.2 0l-2.6 2.6L19 10.1l2.6-2.6c0.6-0.6 0.6-1.6 0-2.2L18.5 2.2zM12.9 8.2L3.8 17.3c-0.4 0.4-0.4 1 0 1.4l1.4 1.4c0.4 0.4 1 0.4 1.4 0l9.1-9.1L12.9 8.2z"/>
                 </svg>
                <span className="relative z-10">Forging Script...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M18.5 2.2l-2.7-2.7c-0.6-0.6-1.6-0.6-2.2 0l-2.6 2.6L19 10.1l2.6-2.6c0.6-0.6 0.6-1.6 0-2.2L18.5 2.2zM12.9 8.2L3.8 17.3c-0.4 0.4-0.4 1 0 1.4l1.4 1.4c0.4 0.4 1 0.4 1.4 0l9.1-9.1L12.9 8.2z"/>
                </svg>
                Generate Script
              </>
            )}
          </button>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <TestCasePreview testCase={testCase} onClose={() => setShowPreviewModal(false)} />
        </div>
      )}
    </>
  );
};

export default TestCaseForm;
