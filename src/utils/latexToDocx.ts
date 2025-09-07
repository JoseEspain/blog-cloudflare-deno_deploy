import * as docx from "docx";
import { cmdMap } from "./latexCmdMap";
import { MathNormalText, extractTextFromMathChildren } from "./mathTextHelper";
import { MathMatrix, createMatrix } from "./mathMatrixHelper";

/**
 * Parses a simple LaTeX string into a docx.Math node.
 * @param latex The LaTeX string to parse.
 * @returns A docx.Math object.
 */
export function latexToDocxMath(latex: string): docx.Math {

  // Type definition for possible children of a math expression.
  type MathChild =
    | docx.MathRun
    | docx.MathFraction
    | docx.MathSuperScript
    | docx.MathSubScript
    | docx.MathSubSuperScript
    | docx.MathSum
    | docx.Math;

  const s = latex.trim();
  let i = 0; // The current position in the string.

  // Factory for creating a MathRun.
  const makeRun = (t: string) => new docx.MathRun(t);

  // Peek at the current character without consuming it.
  const peek = () => s[i];
  // Consume n characters from the string.
  const consume = (n = 1) => { i += n; };
  // Skips whitespace characters.
  const skipSpaces = () => { while (i < s.length && /\s/.test(s[i])) i++; };

  // Parses a LaTeX command name (e.g., \frac -> "frac").
  const parseCommand = (): string => {
    consume(1); // Skip the initial '\'
    let name = "";
    while (i < s.length && /[a-zA-Z]/.test(s[i])) {
      name += s[i++];
    }
    return name;
  };

  // Parses content inside a group delimited by { ... }.
  const parseGroup = (): MathChild[] => {
    if (peek() !== "{") return parseAtom(); // Fallback for single-char groups.
    consume(1); // Skip '{' 
    const content = parseExpr("}");
    if (peek() === "}") consume(1); // Skip '}'
    return content;
  };

  // Parses content inside a matrix environment
  const parseMatrixEnv = (envName: string): MathChild[] => {
    // Find the end of the environment
    const endMarker = `\\end{${envName}}`;
    const envEndIndex = s.indexOf(endMarker, i);
    if (envEndIndex === -1) return [];
    
    // Extract the matrix content
    const matrixContent = s.substring(i, envEndIndex);
    i = envEndIndex + endMarker.length;
    
    // Parse the matrix content into rows and elements
    const rows = matrixContent.split('\\\\').map(row => row.trim()).filter(row => row.length > 0);
    const matrixData: string[][] = [];
    
    // Process each row
    for (const row of rows) {
      // Split by & to get elements
      const elements = row.split('&').map(elem => elem.trim());
      matrixData.push(elements);
    }
    
    // Determine dimensions
    const rowsCount = matrixData.length;
    const colsCount = rowsCount > 0 ? Math.max(...matrixData.map(row => row.length)) : 0;
    
    // Create the matrix
    return [createMatrix(rowsCount, colsCount, matrixData)];
  };

  // Helper to parse optional subscript and superscript.
  const parseScripts = (): { subScript?: MathChild[], superScript?: MathChild[] } => {
    let subScript: MathChild[] | undefined;
    let superScript: MathChild[] | undefined;
    // Loop to catch both scripts in any order.
    while (peek() === '_' || peek() === '^') {
      if (peek() === '_') {
        if (subScript) break; // Already have a subscript
        consume(1);
        skipSpaces();
        subScript = (peek() === "{") ? parseGroup() : parseAtom();
        skipSpaces();
      }
      if (peek() === '^') {
        if (superScript) break; // Already have a superscript
        consume(1);
        skipSpaces();
        superScript = (peek() === "{") ? parseGroup() : parseAtom();
        skipSpaces();
      }
    }
    return { subScript, superScript };
  };

  // --- Command Handlers for named commands ---
  const commandHandlers: { [key: string]: () => MathChild[] } = {
    // Handles \frac{num}{den}
    frac: () => {
      const num = parseGroup();
      skipSpaces();
      const den = parseGroup();
      return [new docx.MathFraction({ numerator: num, denominator: den })];
    },
    // Handles \sqrt[degree]{content}
    sqrt: () => {
      let degree: MathChild[] | undefined;
      if (peek() === '[') {
        consume(1); // consume '['
        degree = parseExpr(']');
        if (peek() === ']') {
          consume(1); // consume ']'
        }
      }
      const content = parseGroup();
      return [new docx.MathRadical({
        children: content,
        ...(degree && { degree }),
      })];
    },
    // Handles \sum with optional scripts
    sum: () => {
      const { subScript, superScript } = parseScripts();
      const nextAtom = parseAtom();
      const options: docx.IMathSumOptions = {
        children: nextAtom.length > 0 ? nextAtom : [makeRun("∑")],
        ...(subScript && { subScript }),
        ...(superScript && { superScript })
      };
      return [new docx.MathSum(options)];
    },
    // Handles \int with optional scripts
    int: () => {
      const { subScript, superScript } = parseScripts();
      const nextAtom = parseAtom();
      const options: docx.IMathIntegralOptions = {
        children: nextAtom.length > 0 ? nextAtom : [makeRun("∫")],
        ...(subScript && { subScript }),
        ...(superScript && { superScript })
      };
      return [new docx.MathIntegral(options)];
    },
    // Handles \text{content} for upright/normal text in math mode
    text: () => {
      const content = parseGroup();
      // For \text{} command, we need to extract the actual text content
      // Since parseGroup returns MathChild[] which are already MathRun objects,
      // we need to extract the text from them directly
      let textContent = '';
      
      // Extract text from the parsed content
      for (const item of content) {
        if (item instanceof docx.MathRun) {
          // MathRun contains the text in its root array
          if (item.root && item.root.length > 0) {
            // The text is in the m:t element, which is the first element in root
            const mTElement = item.root[0];
            if (mTElement && mTElement.root && mTElement.root.length > 0) {
              // The actual text is in the first element of m:t
              textContent += String(mTElement.root[0]);
            }
          }
        } else if (typeof item === 'string') {
          textContent += item;
        }
      }
      
      // Return a MathNormalText element for upright text
      return [new MathNormalText(textContent)];
    }
  };

  // Parses a single mathematical atom (the smallest unit).
  const parseAtom = (): MathChild[] => {
    skipSpaces();

    // Configuration for \left... and \right... bracket pairs.
    const bracketPairs = [
      { left: "\\left(", right: "\\right)", constructor: docx.MathRoundBrackets },
      { left: "\\left[", right: "\\right]", constructor: docx.MathSquareBrackets },
      { left: "\\left\\{", right: "\\right\\}", constructor: docx.MathCurlyBrackets },
    ];

    // Handle bracket pairs
    for (const pair of bracketPairs) {
      if (s.startsWith(pair.left, i)) {
        i += pair.left.length;
        skipSpaces();
        const content = parseExpr(pair.right);
        if (s.startsWith(pair.right, i)) {
          i += pair.right.length;
          skipSpaces();
          // @ts-ignore - Using a dynamic constructor type
          return [new pair.constructor({ children: content })];
        }
        i -= pair.left.length - 1; // Error recovery
        return []; // Or handle error more gracefully
      }
    }

    // Handle matrix environments
    if (s.startsWith("\\begin{", i)) {
      const beginMatch = s.substring(i).match(/\\begin\{([^}]+)\}/);
      if (beginMatch) {
        const envName = beginMatch[1];
        i += beginMatch[0].length;
        skipSpaces();
        
        // Check if it's a matrix environment
        const matrixEnvs = ['bmatrix', 'pmatrix', 'Bmatrix'];
        if (matrixEnvs.includes(envName)) {
          const matrix = parseMatrixEnv(envName);
          
          // Wrap matrix with appropriate brackets based on environment type
          switch (envName) {
            case 'bmatrix':
              // Square brackets using \left[ and \right]
              return [
                new docx.MathSquareBrackets({
                  children: matrix
                })
              ];
            case 'pmatrix':
              // Round brackets using \left( and \right)
              return [
                new docx.MathRoundBrackets({
                  children: matrix
                })
              ];
            case 'Bmatrix':
              // Curly brackets using \left\{ and \right\}
              return [
                new docx.MathCurlyBrackets({
                  children: matrix
                })
              ];
            default:
              return matrix;
          }
        }
      }
    }

    // Handle named commands (e.g. \frac) and simple symbols (e.g. \gamma).
    if (peek() === "\\") {
      const name = parseCommand();
      const handler = commandHandlers[name];
      if (handler) {
        // If a specific handler exists, use it.
        return handler();
      }
      
      // Check if it's a mathematical function that should be displayed in upright text
      const mathFunctions = [
        'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
        'arcsin', 'arccos', 'arctan',
        'sinh', 'cosh', 'tanh', 'coth',
        'ln', 'log', 'exp',
        'max', 'min', 'det', 'dim', 'ker', 'deg',
        'gcd', 'Pr', 'arg', 'inf', 'lim', 'liminf', 'limsup', 'sup'
      ];
      
      if (mathFunctions.includes(name)) {
        // For mathematical functions, use upright text
        return [new MathNormalText(cmdMap[name] ?? name)];
      }
      
      // Otherwise, fall back to simple symbol mapping.
      const mapped = cmdMap[name] ?? name;
      return [makeRun(mapped)];
    }

    // Handle a nested group.
    if (peek() === "{") {
      const grp = parseGroup();
      if (grp.length === 1) return grp;
      return [new docx.Math({ children: grp })];
    }

    // Handle identifiers and numbers.
    if (/[A-Za-z0-9.+\-*/=()]/.test(peek() || "")) {
      let buf = "";
      while (i < s.length && /[A-Za-z0-9.+\-*/=()]/.test(s[i])) {
        buf += s[i++];
      }
      return [makeRun(buf)];
    }

    // Handle any other single character.
    if (i < s.length) {
      const ch = s[i++];
      return [makeRun(ch)];
    }

    return [];
  };

  // Attaches subscripts and superscripts to a base element.
  const attachScripts = (baseArr: MathChild[]): MathChild[] => {
    let base: MathChild = (baseArr.length === 1) ? baseArr[0] : new docx.Math({ children: baseArr });

    // Sums and integrals handle their own scripts.
    if (base instanceof docx.MathSum || base instanceof docx.MathIntegral) {
      return [base];
    }

    let superScript, subScript;

    // Loop to find scripts. We check for both in any order.
    while (peek() === '_' || peek() === '^') {
      skipSpaces();

      // If we see a subscript and haven't parsed one yet
      if (peek() === '_' && !subScript) {
        consume(1);
        skipSpaces();
        subScript = (peek() === "{") ? parseGroup() : parseAtom();
        continue; // Continue loop to check for a superscript
      }

      // If we see a superscript and haven't parsed one yet
      if (peek() === '^' && !superScript) {
        consume(1);
        skipSpaces();
        superScript = (peek() === "{") ? parseGroup() : parseAtom();
        continue; // Continue loop to check for a subscript
      }

      // If we see a script character but have already parsed that type, stop.
      break;
    }

    // Construct the appropriate script object.
    if (subScript && superScript) {
      base = new docx.MathSubSuperScript({ children: [base], subScript, superScript });
    } else if (subScript) {
      base = new docx.MathSubScript({ children: [base], subScript });
    } else if (superScript) {
      base = new docx.MathSuperScript({ children: [base], superScript });
    }

    return [base];
  };

  // Parses a sequence of atoms until a terminator is found.
  const parseExpr = (...terminators: string[]): MathChild[] => {
    const children: MathChild[] = [];
    while (i < s.length) {
      skipSpaces();
      if (terminators.some(t => t && s.startsWith(t, i))) break;
      const ch = peek();
      if (!ch) break;
      if (ch === "}") break;
      
      // Parse an atom and attach any scripts.
      const atom = parseAtom();
      if (atom.length === 0) break;
      
      let withScripts = atom;
      if (atom.length === 1 && !(atom[0] instanceof docx.MathSum)) {
        withScripts = attachScripts(atom);
      }
      
      // Flatten nested Math groups into the main children array.
      for (const node of withScripts) {
        if (node instanceof docx.Math) {
          // @ts-ignore access internal children property
          const childNodes = (node as any).children as MathChild[] | undefined;
          if (childNodes && childNodes.length) {
            childNodes.forEach(c => children.push(c));
          }
        } else {
          children.push(node);
        }
      }
    }
    return children;
  };

  // Start parsing the expression.
  const parsed = parseExpr();
  return new docx.Math({ children: parsed });
}
