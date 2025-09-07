import EngineeringCalculatorBase, { type CalculatorConfig } from "./EngineeringCalculatorBase";
import { calculateK1 } from "../utils/calculateK1";

// ===========================================================================
// 顶管管顶竖向土压力计算器 - 中文版配置
// ===========================================================================

// 1. 定义计算结果的类型
interface CalculationResult {
  soilType: string;
  Kμ: number;
  H: number;
  γ: number;
  D: number;
  K1: number;
  K1CalcProcess: string;
  Fsv: number;
}

// 2. 工具基本信息配置
const toolConfig = {
  exportFileName: '顶管管顶竖向土压力计算书.docx'
};

// 3. 土壤类型配置
const soilTypeOptions = [
  { value: '流塑黏性土', label: '流塑黏性土', group: '黏性土', friction: 0 },
  { value: '软塑黏性土', label: '软塑黏性土', group: '黏性土', friction: 0 },
  { value: '可塑黏性土', label: '可塑黏性土', group: '黏性土', friction: 0.067 },
  { value: '硬塑黏性土', label: '硬塑黏性土', group: '黏性土', friction: 0.207 },
  { value: '坚硬黏性土', label: '坚硬黏性土', group: '黏性土', friction: 0.431 },
  { value: '松散碎石土', label: '松散碎石土', group: '碎石土', friction: 0 },
  { value: '稍密碎石土', label: '稍密碎石土', group: '碎石土', friction: 0.124 },
  { value: '中密碎石土', label: '中密碎石土', group: '碎石土', friction: 0.252 },
  { value: '密实碎石土', label: '密实碎石土', group: '碎石土', friction: 0.647 },
  { value: '膨胀土', label: '膨胀土', group: '特殊土', friction: 0 },
  { value: '没有地质资料', label: '没有地质资料', group: '其他', friction: 0.243 },
];

// 4. 表单字段配置
const formFieldsConfig = [
  {
    id: 'soilType',
    label: '管顶覆土土质',
    type: 'select',
    defaultValue: '可塑黏性土',
    placeholder: '请选择土质类型',
  },
  {
    id: 'frictionCoef',
    label: '土层剪切面摩阻系数',
    type: 'number',
    defaultValue: '0.067',
    min: 0,
    max: 1,
    placeholder: '请输入摩阻系数',
  },
  {
    id: 'thickness',
    label: '管顶覆土厚度',
    type: 'number',
    defaultValue: '5.0',
    min: 0.3,
    unit: 'm',
    placeholder: '请输入覆土厚度',
  },
  {
    id: 'density',
    label: '管顶覆土容重',
    type: 'number',
    defaultValue: '18',
    min: 0.01,
    max: 100,
    unit: 'kN/m³',
    placeholder: '请输入土体容重',
  },
  {
    id: 'diameter',
    label: '顶管管道外径',
    type: 'number',
    defaultValue: '0.6',
    min: 0.2,
    max: 20,
    unit: 'm',
    placeholder: '请输入管道外径',
  },
];

// 5. UI文本配置
const uiTexts = {
  exportButton: '保存计算书',
  calculating: '计算中...',
  exportAlert: '请先完成有效计算再导出。',
  exportError: '导出失败，请重试',
  calculationError: '计算失败，请检查输入参数。'
};

// 6. 表单布局配置
const formLayoutConfig = {
  columns: 2 as const,
  sections: [
    {
      fieldRange: [0, 3] as [number, number],
    },
    {
      fieldRange: [3, -1] as [number, number],
      includeExportButton: true,
    }
  ]
};

// 7. 获取当前配置
const getCurrentConfigs = () => {
  const currentOptions = soilTypeOptions;
  const currentFormFields = formFieldsConfig;
  const currentExportFileName = toolConfig.exportFileName;
  const currentUiTexts = uiTexts;

  return {
    currentOptions,
    currentFormFields,
    currentExportFileName,
    currentUiTexts
  };
};

// 8. 生成摩阻系数映射表
const generateSoilFrictionMap = (soilOptions: typeof soilTypeOptions): Record<string, number> => {
  return soilOptions.reduce((map, option) => {
    map[option.value] = option.friction;
    return map;
  }, {} as Record<string, number>);
};

// 9. 字段处理逻辑
const handleFieldChange = (
  fieldName: string,
  fieldValue: string,
  formState: Record<string, string>,
  soilFrictionMap?: Record<string, number>
): Record<string, string> => {
  // 处理土壤类型变化的特殊情况
  if (fieldName === 'soilType' && soilFrictionMap && fieldValue in soilFrictionMap) {
    const newFrictionCoef = soilFrictionMap[fieldValue].toString();
    if (formState.frictionCoef !== newFrictionCoef) {
      return { ...formState, frictionCoef: newFrictionCoef };
    }
  }
  return formState;
};

// 10. 计算函数
const performCalculation = (formState: Record<string, string>): CalculationResult => {
  const { soilType, frictionCoef, thickness, density, diameter } = formState;
  const Kμ = parseFloat(frictionCoef);
  const H = parseFloat(thickness);
  const γ = parseFloat(density);
  const D = parseFloat(diameter);

  // 计算
  const { K1, description: K1CalcProcess } = calculateK1(Kμ, H, D, soilType);
  const Fsv = K1 * γ * H;

  return {
    soilType,
    Kμ,
    H,
    γ,
    D,
    K1,
    K1CalcProcess,
    Fsv
  };
};

// 11. 生成 Markdown 内容
const generateMarkdownContent = (calculationResult: CalculationResult): string[] => {
  const { soilType, Kμ, H, γ, D, K1, K1CalcProcess, Fsv } = calculationResult;

  return [
    `
# 顶管管顶竖向土压力计算书

## 一、计算依据
根据 **T/CECS 1113-2022**《**给水排水工程预制顶管技术规程**》第 6.3 节，管顶竖向土压力按下列公式计算：

$$
 F_{sv,k} = K_1 \\times \\gamma_s \\times H_s
$$

$$
 K_1 = \\frac{1-e^{-K_\\mu \\times \\frac{H_s}{D_1}}}{K_\\mu \\times \\frac{H_s}{D_1}}
$$

其中：

 $F_{sv,k}$ —— 顶管管顶竖向土压力标准值 ($\\text{kN/m²}$)

 $K_1$ —— 竖向土压力折减系数

 $K_\\mu$ —— 土层剪切面摩阻系数

 $\\gamma_s$ —— 管顶覆土容重 ($\\text{kN/m³}$)

 $H_s$ —— 管顶覆土层厚度 ($\\text{m}$)

 $D_1$ —— 管道外径 ($\\text{m}$)

<center><img src="/pipe-pressure.png" alt="单层土管顶竖向土压力计算简图"  width="360" height="360" class="w-[65%] brightness-75 contrast-125 dark:invert" /></center>
<center><strong>单层土管顶竖向土压力计算简图</strong></center>
`,
    `
## 二、计算参数

1、管顶覆土土质：${soilType}

2、管顶覆土厚度：${H.toFixed(2)}$\\text{m}$

3、管顶覆土容重：${γ.toFixed(2)}$\\text{kN/m³}$

4、顶管管道外径：${D.toFixed(2)}$\\text{m}$

5、土层剪切面摩阻系数：${Kμ.toFixed(3)}
`,
    `
## 三、计算过程

**1、计算竖向土压力折减系数：**

  ${K1CalcProcess}

**2、计算顶管管顶竖向土压力标准值：**

   $F_{sv,k} = ${K1.toFixed(4)} \\times ${γ.toFixed(2)} \\times ${H.toFixed(2)} = ${Fsv.toFixed(2)} \\text{kN/m²}$
`
  ];
};

// ===========================================================================
// 配置对象 - 传递给通用组件
// ===========================================================================

const calculatorConfig: CalculatorConfig = {
  toolConfig: { exportFileName: { zh: toolConfig.exportFileName } },
  optionsConfig: { zh: soilTypeOptions },
  formFieldsConfig: { zh: formFieldsConfig },
  uiTexts: { zh: uiTexts },
  formLayoutConfig,
  getCurrentConfigs,
  generateOptionsMap: generateSoilFrictionMap,
  handleFieldChange,
  performCalculation,
  generateMarkdownContent
};

// ===========================================================================
// 导出组件
// ===========================================================================

export default function PipePressureCalculator() {
  return <EngineeringCalculatorBase config={calculatorConfig} />;
}