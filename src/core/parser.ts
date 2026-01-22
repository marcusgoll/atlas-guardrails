import path from 'path';

export interface SymbolDef {
  kind: 'function' | 'class' | 'variable' | 'export';
  name: string;
  signature: string;
  start_line: number;
  end_line: number;
  exported: boolean;
}

export interface ImportDef {
  path: string;
}

export interface ParseResult {
  symbols: SymbolDef[];
  imports: ImportDef[];
  language: string;
}

export class SimpleParser {
  static parse(filePath: string, content: string): ParseResult {
    const ext = path.extname(filePath);
    if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
      return this.parseTS(content);
    } else if (['.py'].includes(ext)) {
      return this.parsePython(content);
    }
    return { symbols: [], imports: [], language: 'unknown' };
  }

  private static parseTS(content: string): ParseResult {
    const symbols: SymbolDef[] = [];
    const imports: ImportDef[] = [];
    const lines = content.split('\n');

    // Heuristic Regexes for MVP
    // NOTE: These are fragile and intended for MVP "best effort"
    const exportRegex = /export\s+(const|let|var|function|class|interface|type)\s+([a-zA-Z0-9_]+)/;
    const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/;
    const functionRegex = /function\s+([a-zA-Z0-9_]+)/;
    const classRegex = /class\s+([a-zA-Z0-9_]+)/;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      const impMatch = line.match(importRegex);
      if (impMatch) {
        imports.push({ path: impMatch[1] });
      }

      const expMatch = line.match(exportRegex);
      if (expMatch) {
        symbols.push({
          kind: 'export',
          name: expMatch[2],
          signature: line.trim(),
          start_line: lineNum,
          end_line: lineNum, // Single line approx for now
          exported: true,
        });
        // Also add as specific kind
        symbols.push({
          kind: expMatch[1] as any,
          name: expMatch[2],
          signature: line.trim(),
          start_line: lineNum,
          end_line: lineNum,
          exported: true,
        });
        return;
      }

      const funcMatch = line.match(functionRegex);
      if (funcMatch) {
        symbols.push({
          kind: 'function',
          name: funcMatch[1],
          signature: line.trim(),
          start_line: lineNum,
          end_line: lineNum,
          exported: false,
        });
      }

      const classMatch = line.match(classRegex);
      if (classMatch) {
        symbols.push({
          kind: 'class',
          name: classMatch[1],
          signature: line.trim(),
          start_line: lineNum,
          end_line: lineNum,
          exported: false,
        });
      }
    });

    return { symbols, imports, language: 'typescript' };
  }

  private static parsePython(content: string): ParseResult {
    const symbols: SymbolDef[] = [];
    const imports: ImportDef[] = [];
    const lines = content.split('\n');

    const defRegex = /def\s+([a-zA-Z0-9_]+)/;
    const classRegex = /class\s+([a-zA-Z0-9_]+)/;
    const importRegex = /^(?:from\s+([a-zA-Z0-9_.]+)\s+)?import/;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();

      // very naive python import detection
      const impMatch = trimmedLine.match(importRegex);
      if (impMatch) {
        // This captures 'from module' part, simplified
        imports.push({ path: impMatch[1] || 'module' });
      }

      const defMatch = trimmedLine.match(defRegex);
      if (defMatch) {
        symbols.push({
          kind: 'function',
          name: defMatch[1],
          signature: trimmedLine,
          start_line: lineNum,
          end_line: lineNum,
          exported: true, // Python everything is public by default effectively
        });
      }

      const classMatch = trimmedLine.match(classRegex);
      if (classMatch) {
        symbols.push({
          kind: 'class',
          name: classMatch[1],
          signature: trimmedLine,
          start_line: lineNum,
          end_line: lineNum,
          exported: true,
        });
      }
    });

    return { symbols, imports, language: 'python' };
  }
}
