import { useState, useEffect } from 'preact/hooks';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const sampleFormulas = {
  zh: {
    '顶管管顶竖向土压力公式': '\\begin{aligned} F_{sv,k} = K_1 \\gamma _s H_s \\\\ K_1 = \\frac{1-e^{-k_\\mu \\frac{H_s}{D_1} }}{K_\\mu \\frac{H_s}{D_1} }\\end{aligned}',
    '爱因斯坦场方程': 'G_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}',
    '麦克斯韦方程组': '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0} \\quad \\nabla \\cdot \\mathbf{B} = 0 \\quad \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\quad \\nabla \\times \\mathbf{B} = \\mu_0(\\mathbf{J} + \\epsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t})',
    '薛定谔方程': 'i\\hbar\\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)',
    '布莱克-舒尔斯方程': '\\frac{\\partial V}{\\partial t} + \\frac{1}{2} \\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0',
    '纳维-斯托克斯方程': '\\frac{\\partial \\vec{u}}{\\partial t} + (\\vec{u} \\cdot \\nabla) \\vec{u} = -\\frac{1}{\\rho} \\nabla p + \\nu \\nabla^2 \\vec{u} + \\vec{f}',
    '贝叶斯定理': 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
  },
  en: {
    'Pipe Jacking Earth Pressure Formula': '\\begin{aligned} F_{sv,k} = K_1 \\gamma _s H_s \\\\ K_1 = \\frac{1-e^{-k_\\mu \\frac{H_s}{D_1} }}{K_\\mu \\frac{H_s}{D_1} }\\end{aligned}',
    'Einstein Field Equation': 'G_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}',
    'Maxwell Equations': '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0} \\quad \\nabla \\cdot \\mathbf{B} = 0 \\quad \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\quad \\nabla \\times \\mathbf{B} = \\mu_0(\\mathbf{J} + \\epsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t})',
    'Schrödinger Equation': 'i\\hbar\\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)',
    'Black-Scholes Equation': '\\frac{\\partial V}{\\partial t} + \\frac{1}{2} \\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0',
    'Navier-Stokes Equation': '\\frac{\\partial \\vec{u}}{\\partial t} + (\\vec{u} \\cdot \\nabla) \\vec{u} = -\\frac{1}{\\rho} \\nabla p + \\nu \\nabla^2 \\vec{u} + \\vec{f}',
    'Bayes Theorem': 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
  }
};

export default function KatexRenderer({ lang = 'zh' }: { lang?: string }) {
  const currentFormulas = sampleFormulas[lang as keyof typeof sampleFormulas] || sampleFormulas.zh;
  const firstFormulaKey = Object.keys(currentFormulas)[0];
  const [input, setInput] = useState(currentFormulas[firstFormulaKey as keyof typeof currentFormulas]);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [mathml, setMathml] = useState('');
  const [error, setError] = useState('');
  const [copyText, setCopyText] = useState(lang === 'zh' ? '复制' : 'Copy');

  useEffect(() => {
    try {
      const renderedOutput = katex.renderToString(input, {
        throwOnError: true,
        displayMode: true,
      });

      setRenderedHtml(renderedOutput);

      const mathmlMatch = renderedOutput.match(/<math.*?<\/math>/s);
      let finalMathml = mathmlMatch ? mathmlMatch[0] : (lang === 'zh' ? '无法提取MathML。' : 'Unable to extract MathML.');

      // 移除 KaTeX 为了容纳 LaTeX 源码注解而添加的 <semantics> 和 <annotation> 标签
      const semanticsMatch = finalMathml.match(/<semantics>([\s\S]*)<\/semantics>/);
      if (semanticsMatch && semanticsMatch[1]) {
        const coreContent = semanticsMatch[1].replace(/<annotation.*?>.*?<\/annotation>/s, '');
        finalMathml = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${coreContent}</math>`;
      }

      finalMathml = finalMathml.replace(/<mtext> <\/mtext>/g, '<mtext>&#xA0;<\/mtext>');

      setMathml(finalMathml);
      setError('');
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        setRenderedHtml(`<p style="color: red;">${e.message}</p>`);
        setMathml(lang === 'zh' ? '生成MathML时出错。' : 'Error generating MathML.');
      }
    }
  }, [input]);

  const handleSelectChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setInput(currentFormulas[target.value as keyof typeof currentFormulas]);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mathml).then(() => {
        setCopyText(lang === 'zh' ? '已复制!' : 'Copied!');
        setTimeout(() => setCopyText(lang === 'zh' ? '复制' : 'Copy'), 2000);
      }, (err) => {
        setCopyText(lang === 'zh' ? '失败' : 'Failed');
        console.error(lang === 'zh' ? '无法复制文本: ' : 'Unable to copy text: ', err);
        setTimeout(() => setCopyText(lang === 'zh' ? '复制' : 'Copy'), 2000);
      });
    } else {
      setCopyText(lang === 'zh' ? '不支持复制' : 'Copy not supported');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white -mt-1 mb-4">
        {lang === 'zh' ? 'KaTeX 公式渲染器' : 'KaTeX Formula Renderer'}
      </h2>

      <div className="mb-4">
        <label htmlFor="formula-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'zh' ? '选择一个示例公式:' : 'Select a sample formula:'}
        </label>
        <select
          id="formula-select"
          onChange={handleSelectChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {Object.keys(currentFormulas).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="latex-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'zh' ? '或者输入你自己的 LaTeX 公式:' : 'Or enter your own LaTeX formula:'}
        </label>
        <textarea
          id="latex-input"
          value={input}
          onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
          className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
          placeholder="e.g., c = \\sqrt{a^2 + b^2}"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {lang === 'zh' ? '渲染结果:' : 'Rendered Result:'}
        </h3>
        <div
          className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-lg text-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {lang === 'zh' ? 'MathML 输出:' : 'MathML Output:'}
          </h3>
          <button
            onClick={handleCopy}
            className="px-6 py-2 text-lg font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
          >
            {copyText}
          </button>
        </div>
        <pre className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 overflow-x-auto">
          <code className="text-sm text-gray-700 dark:text-gray-300">{mathml}</code>
        </pre>
      </div>
    </div>
  );
}
