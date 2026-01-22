import { SimpleParser } from '../core/parser';

describe('SimpleParser', () => {
  test('parses TypeScript symbols correctly', () => {
    const code = `
      import { Foo } from './foo';
      export class MyClass {
        myMethod() {}
      }
      export function myFunction() {}
      function internalFunc() {}
    `;
    const result = SimpleParser.parse('test.ts', code);

    expect(result.language).toBe('typescript');
    expect(result.imports).toContainEqual({ path: './foo' });

    // Check exports
    const exportedClass = result.symbols.find((s) => s.name === 'MyClass' && s.kind === 'class');
    expect(exportedClass).toBeDefined();
    expect(exportedClass?.exported).toBe(true);

    const exportedFunc = result.symbols.find(
      (s) => s.name === 'myFunction' && s.kind === 'function',
    );
    expect(exportedFunc).toBeDefined();
    expect(exportedFunc?.exported).toBe(true);

    // Check internal
    const internal = result.symbols.find((s) => s.name === 'internalFunc');
    expect(internal).toBeDefined();
    expect(internal?.exported).toBe(false);
  });

  test('parses Python symbols correctly', () => {
    const code = `
      from module import Something
      class MyPyClass:
          def method(self): pass
      def my_py_func(): pass
    `;
    const result = SimpleParser.parse('test.py', code);

    expect(result.language).toBe('python');
    expect(result.imports).toContainEqual({ path: 'module' });

    const cls = result.symbols.find((s) => s.name === 'MyPyClass');
    expect(cls).toBeDefined();

    const func = result.symbols.find((s) => s.name === 'my_py_func');
    expect(func).toBeDefined();
  });
});
