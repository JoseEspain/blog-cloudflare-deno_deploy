import EngineeringCalculatorBase, { type CalculatorConfig } from "./EngineeringCalculatorBase";
import { calculateK1 } from "../utils/calculateK1En";

// ===========================================================================
// Pipe Jacking Earth Pressure Calculator - English Version Configuration
// ===========================================================================

// 1. Define calculation result type
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

// 2. Tool basic information configuration
const toolConfig = {
  exportFileName: 'Pipe_Jacking_Earth_Pressure_Calculation_Report.docx'
};

// 3. Soil type options configuration
const soilTypeOptions = [
  { value: 'Very Soft Clay', label: 'Very Soft Clay', group: 'Clay', friction: 0 },
  { value: 'Soft Clay', label: 'Soft Clay', group: 'Clay', friction: 0 },
  { value: 'Medium Stiff Clay', label: 'Medium Stiff Clay', group: 'Clay', friction: 0.067 },
  { value: 'Stiff Clay', label: 'Stiff Clay', group: 'Clay', friction: 0.207 },
  { value: 'Hard Clay', label: 'Hard Clay', group: 'Clay', friction: 0.431 },
  { value: 'Loose Gravel', label: 'Loose Gravel', group: 'Gravel', friction: 0 },
  { value: 'Slightly Dense Gravel', label: 'Slightly Dense Gravel', group: 'Gravel', friction: 0.124 },
  { value: 'Medium Dense Gravel', label: 'Medium Dense Gravel', group: 'Gravel', friction: 0.252 },
  { value: 'Dense Gravel', label: 'Dense Gravel', group: 'Gravel', friction: 0.647 },
  { value: 'Expansive Soil', label: 'Expansive Soil', group: 'Special Soil', friction: 0 },
  { value: 'No Geotechnical Data Available', label: 'No Geotechnical Data Available', group: 'Other', friction: 0.243 },
];

// 4. Form fields configuration
const formFieldsConfig = [
  {
    id: 'soilType',
    label: 'Soil Type Above Pipe Crown',
    type: 'select',
    defaultValue: 'Medium Stiff Clay',
    placeholder: 'Select soil type',
  },
  {
    id: 'frictionCoef',
    label: 'Soil Shear Surface Friction Coefficient',
    type: 'number',
    defaultValue: '0.067',
    min: 0,
    max: 1,
    placeholder: 'Enter friction coefficient',
  },
  {
    id: 'thickness',
    label: 'Soil Cover Thickness Above Pipe Crown',
    type: 'number',
    defaultValue: '5.0',
    min: 0.3,
    unit: 'm',
    placeholder: 'Enter cover thickness',
  },
  {
    id: 'density',
    label: 'Unit Weight of Soil Above Pipe Crown',
    type: 'number',
    defaultValue: '18',
    min: 0.01,
    max: 100,
    unit: 'kN/m³',
    placeholder: 'Enter soil unit weight',
  },
  {
    id: 'diameter',
    label: 'Outer Diameter of Jacking Pipe',
    type: 'number',
    defaultValue: '0.6',
    min: 0.2,
    max: 20,
    unit: 'm',
    placeholder: 'Enter pipe diameter',
  },
];

// 5. UI text configuration
const uiTexts = {
  exportButton: 'Save Report',
  calculating: 'Calculating...',
  exportAlert: 'Please complete a valid calculation before exporting.',
  exportError: 'Export failed, please try again',
  calculationError: 'Calculation failed, please check input parameters.'
};

// 6. Form layout configuration
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

// 7. Get current configuration
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

// 8. Generate soil friction mapping
const generateSoilFrictionMap = (soilOptions: typeof soilTypeOptions): Record<string, number> => {
  return soilOptions.reduce((map, option) => {
    map[option.value] = option.friction;
    return map;
  }, {} as Record<string, number>);
};

// 9. Field change handling logic
const handleFieldChange = (
  fieldName: string, 
  fieldValue: string, 
  formState: Record<string, string>, 
  soilFrictionMap?: Record<string, number>
): Record<string, string> => {
  // Handle soil type change special case
  if (fieldName === 'soilType' && soilFrictionMap && fieldValue in soilFrictionMap) {
    const newFrictionCoef = soilFrictionMap[fieldValue].toString();
    if (formState.frictionCoef !== newFrictionCoef) {
      return { ...formState, frictionCoef: newFrictionCoef };
    }
  }
  return formState;
};

// 10. Calculation function
const performCalculation = (formState: Record<string, string>): CalculationResult => {
  const { soilType, frictionCoef, thickness, density, diameter } = formState;
  const Kμ = parseFloat(frictionCoef);
  const H = parseFloat(thickness);
  const γ = parseFloat(density);
  const D = parseFloat(diameter);
  
  // Calculate
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

// 11. Generate Markdown content
const generateMarkdownContent = (calculationResult: CalculationResult): string[] => {
  const { soilType, Kμ, H, γ, D, K1, K1CalcProcess, Fsv } = calculationResult;

  return [
    `
# Calculation Report for Vertical Earth Pressure on Jacking Pipe Crown

## Ⅰ. Calculation Basis
According to **T/CECS 1113-2022** *Technical Specification for Prefabricated Pipe Jacking in Water Supply and Drainage Engineering*  **Section 6.3**, the vertical earth pressure on pipe crown is calculated by the following formulas:

$$
 F_{sv,k} = K_1 \\times \\gamma_s \\times H_s
$$

$$
 K_1 = \\frac{1-e^{-K_\\mu \\times \\frac{H_s}{D_1}}}{K_\\mu \\times \\frac{H_s}{D_1}}
$$

Where:

 $F_{sv,k}$ —— Standard value of vertical earth pressure on pipe crown ($\\text{kN/m²}$)

 $K_1$ —— Vertical earth pressure reduction coefficient

 $K_\\mu$ —— Friction coefficient of soil shear surface

 $\\gamma_s$ —— Unit weight of soil above pipe crown ($\\text{kN/m³}$)

 $H_s$ —— Thickness of soil cover above pipe crown ($\\text{m}$)

 $D_1$ —— Outer diameter of pipe ($\\text{m}$)

<center><img src="/pipe-pressure.png" alt="Calculation diagram for single-layer soil vertical earth pressure on pipe crown"  width="360" height="360" class="w-[65%] brightness-75 contrast-125 dark:invert" /></center>
<center><strong>Calculation diagram for single-layer soil vertical earth pressure on pipe crown</strong></center>
`,
    `
## Ⅱ. Calculation Parameters

1. Soil type above pipe crown: ${soilType}

2. Soil cover thickness above pipe crown: ${H.toFixed(2)}$\\text{m}$

3. Unit weight of soil above pipe crown: ${γ.toFixed(2)}$\\text{kN/m³}$

4. Outer diameter of jacking pipe: ${D.toFixed(2)}$\\text{m}$

5. Friction coefficient of soil shear surface: ${Kμ.toFixed(3)}
`,
    `
## Ⅲ. Calculation Process

**1. Calculate vertical earth pressure reduction coefficient:**

  ${K1CalcProcess}

**2. Calculate standard value of vertical earth pressure on pipe crown:**

   $F_{sv,k} = ${K1.toFixed(4)} \\times ${γ.toFixed(2)} \\times ${H.toFixed(2)} = ${Fsv.toFixed(2)} \\text{kN/m²}$
`
  ];
};

// ===========================================================================
// Configuration Object - Pass to Generic Component
// ===========================================================================

const calculatorConfig: CalculatorConfig = {
  toolConfig: { exportFileName: { en: toolConfig.exportFileName } },
  optionsConfig: { en: soilTypeOptions },
  formFieldsConfig: { en: formFieldsConfig },
  uiTexts: { en: uiTexts },
  formLayoutConfig,
  getCurrentConfigs,
  generateOptionsMap: generateSoilFrictionMap,
  handleFieldChange,
  performCalculation,
  generateMarkdownContent
};

// ===========================================================================
// Export Component
// ===========================================================================

export default function PipePressureCalculatorEn() {
  return <EngineeringCalculatorBase config={calculatorConfig} />;
}