
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import TestCaseForm from './components/TestCaseForm';
import TestCasePreview from './components/TestCasePreview';
import CodeViewer from './components/CodeViewer';
import { Framework, DesignPattern, TestCaseData, GeneratedFile, Language } from './types';
import { generateAutomationScript } from './services/geminiService';

const App: React.FC = () => {
  const [testCase, setTestCase] = useState<TestCaseData>({
    id: '',
    title: '',
    description: '',
    preconditions: '',
    testData: '',
    steps: [{ id: Math.random().toString(36).substr(2, 9), action: '', expected: '' }],
  });

  const [framework, setFramework] = useState<Framework | ''>('');
  const [pattern, setPattern] = useState<DesignPattern | ''>('');
  const [language, setLanguage] = useState<Language>(Language.TypeScript);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);
  
  const [isDark, setIsDark] = useState(false);

  const codeViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleGenerate = async () => {
    if (!framework || !pattern) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedFiles([]); 

    try {
      const files = await generateAutomationScript({
        testCase,
        framework,
        pattern,
        language,
      });
      setGeneratedFiles(files);
      
      setTimeout(() => {
        codeViewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500 ${isSplitView ? 'max-w-7xl' : 'max-w-5xl'}`}>
        {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-col gap-8 pb-12">
          <div className={`grid grid-cols-1 transition-all duration-500 gap-6 ${isSplitView ? 'lg:grid-cols-2' : ''}`}>
            <div className="w-full">
              <TestCaseForm
                testCase={testCase}
                onTestCaseChange={setTestCase}
                selectedFramework={framework}
                onFrameworkChange={setFramework}
                selectedPattern={pattern}
                onPatternChange={setPattern}
                selectedLanguage={language}
                onLanguageChange={setLanguage}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                isSplitView={isSplitView}
                onToggleSplitView={() => setIsSplitView(!isSplitView)}
              />
            </div>
            {isSplitView && (
              <div className="w-full lg:sticky lg:top-24 h-[calc(100vh-12rem)] animate-fade-in">
                <TestCasePreview testCase={testCase} isSideBySide={true} />
              </div>
            )}
          </div>

          <div ref={codeViewerRef} className="w-full flex flex-col">
             <div className="mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                 <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                 Generated Output
             </div>
            <div className="h-[600px] shadow-2xl rounded-xl overflow-hidden">
                <CodeViewer files={generatedFiles} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
