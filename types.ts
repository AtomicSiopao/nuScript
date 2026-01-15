
export enum Framework {
  Cypress = 'Cypress',
  Playwright = 'Playwright',
  Selenium = 'Selenium',
}

export enum DesignPattern {
  Default = 'Default',
  Gherkin = 'Gherkin',
  POM = 'Page Object Model',
}

export enum Language {
  TypeScript = 'TypeScript',
  JavaScript = 'JavaScript',
}

export interface TestStep {
  id: string;
  action: string;
  expected: string;
}

export interface TestCaseData {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  testData: string;
  steps: TestStep[];
}

export interface GenerationRequest {
  testCase: TestCaseData;
  framework: Framework;
  pattern: DesignPattern;
  language: Language;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language?: string;
}
