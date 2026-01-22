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

    const exportRegex = /export\s+(const|let|var|function|class|interface|type)\s+([a-zA-Z0-9_]+)/;
    const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/;
    const functionRegex = /function\s+([a-zA-Z0-9_]+)/;
    const classRegex = /class\s+([a-zA-Z0-9_]+)/;
    const methodRegex = /^\s+(?:async\s+)?([a-zA-Z0-9_]+)\s*\(.*\)\s*[:{]/;

    let currentClass: string | null = null;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      const impMatch = line.match(importRegex);
      if (impMatch) {
        imports.push({ path: impMatch[1] });
      }

      const expMatch = line.match(exportRegex);
      if (expMatch) {
        const name = expMatch[2];
        const kind = expMatch[1];
        symbols.push({ kind: 'export', name, signature: trimmed, start_line: lineNum, end_line: lineNum, exported: true });
        symbols.push({ kind: kind as any, name, signature: trimmed, start_line: lineNum, end_line: lineNum, exported: true });
        if (kind === 'class') currentClass = name;
        return;
      }

      const classMatch = line.match(classRegex);
      if (classMatch) {
        currentClass = classMatch[1];
        symbols.push({ kind: 'class', name: currentClass, signature: trimmed, start_line: lineNum, end_line: lineNum, exported: false });
        return;
      }

      const methodMatch = line.match(methodRegex);
      if (methodMatch && currentClass) {
        symbols.push({ 
          kind: 'function', 
          name: `${currentClass}.${methodMatch[1]}`, 
          signature: trimmed, 
          start_line: lineNum, 
          end_line: lineNum, 
          exported: false 
        });
        return;
      }

      const funcMatch = line.match(functionRegex);
      if (funcMatch) {
        symbols.push({ kind: 'function', name: funcMatch[1], signature: trimmed, start_line: lineNum, end_line: lineNum, exported: false });
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

    let currentClass: string | null = null;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      const impMatch = trimmedLine.match(importRegex);
      if (impMatch) {
        imports.push({ path: impMatch[1] || 'module' });
      }

      const classMatch = trimmedLine.match(classRegex);
      if (classMatch) {
        currentClass = classMatch[1];
        symbols.push({ kind: 'class', name: currentClass, signature: trimmedLine, start_line: lineNum, end_line: lineNum, exported: true });
        return;
      }

      const defMatch = trimmedLine.match(defRegex);
      if (defMatch) {
        const name = currentClass ? `${currentClass}.${defMatch[1]}` : defMatch[1];
        symbols.push({ kind: 'function', name, signature: trimmedLine, start_line: lineNum, end_line: lineNum, exported: true });
      }
    });

    return { symbols, imports, language: 'python' };
  }
}
