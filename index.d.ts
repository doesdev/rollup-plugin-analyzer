import { Plugin } from "rollup";

declare const analyzer: (options?: AnalyzerOptions) => Plugin;
export default analyzer;

export interface Module {
  id: string;
  size: number;
  origSize: number;
  dependents: string[];
  percent: number;
  reduction: number;
  usedExports: string[];
  unusedExports: string[];
}

export interface AnalyzerOptions {
  stdout?: boolean;
  limit?: number;
  filter?: string | string[] | ((moduleObject: Module) => boolean);
  filterSummary?: boolean;
  root?: string;
  hideDeps?: boolean;
  showExports?: boolean;
  summaryOnly?: boolean;
  skipFormatted?: boolean;
  writeTo?: (analysisString: string) => void;
  transformModuleId?: (id: string) => string;
  onAnalysis?: (analysisObject: AnalysisObject) => void;
}

export interface AnalysisObject {
  bundleSize: number;
  bundleOrigSize: number;
  bundleReduction: number;
  moduleCount: number;
  modules: Module[];
}
