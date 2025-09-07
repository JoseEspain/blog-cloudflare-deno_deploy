import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import * as docx from "docx";
import { generateDocxFromMarkdown } from "../utils/markdownToDocx";

// 导入自定义表单组件
import FormGrid from "./form/FormGrid";
import FormSection from "./form/FormSection";
import SelectInput from "./form/SelectInput";
import NumberInput from "./form/NumberInput";

// ===========================================================================
// 通用工程计算器基础组件
// ===========================================================================
// 
// 这是一个配置驱动的通用计算器组件，可以用于创建各种工程计算工具。
// 
// 设计理念：
// - 配置驱动：通过传入配置对象来定义计算器的行为
// - 高度复用：一个组件可以支持多种不同的计算工具
// - 国际化友好：支持多语言配置
// - 功能完整：包含表单、计算、渲染、导出等完整功能
//
// 主要功能：
// 1. 动态表单生成 - 根据配置生成输入表单
// 2. 实时计算 - 支持输入变化时的实时计算
// 3. Markdown渲染 - 支持数学公式的渲染显示
// 4. Word文档导出 - 生成专业的计算书文档
// 5. 错误处理 - 完善的错误提示和处理机制
//
// ===========================================================================

// 定义配置接口
export interface CalculatorConfig {
    // 工具基本信息配置
    toolConfig: {
        exportFileName: Record<string, string>;
    };

    // 选项配置（如土壤类型等）
    optionsConfig: Record<string, any[]>;

    // 表单字段配置
    formFieldsConfig: Record<string, any[]>;

    // UI文本配置
    uiTexts: Record<string, {
        exportButton: string;
        calculating: string;
        exportAlert: string;
        exportError: string;
        calculationError: string;
    }>;

    // 表单布局配置
    formLayoutConfig: {
        columns: 1 | 2 | 3 | 4;
        sections: Array<{
            fieldRange: [number, number];
            includeExportButton?: boolean;
        }>;
    };

    // 辅助函数
    getCurrentConfigs: () => {
        currentOptions: any[];
        currentFormFields: any[];
        currentExportFileName: string;
        currentUiTexts: any;
    };

    generateOptionsMap?: (options: any[]) => Record<string, any>;

    handleFieldChange: (
        fieldName: string,
        fieldValue: string,
        formState: Record<string, string>,
        optionsMap?: Record<string, any>
    ) => Record<string, string>;

    performCalculation: (formState: Record<string, string>) => any;

    generateMarkdownContent: (calculationResult: any) => string[];
}

// 组件属性接口
interface EngineeringCalculatorBaseProps {
    config: CalculatorConfig;
}

export default function EngineeringCalculatorBase({
    config
}: EngineeringCalculatorBaseProps) {
    const resultChunks = useSignal<string[]>([]);
    // 存储用于导出的原始 Markdown 内容
    const markdownContentForExport = useSignal("");

    // 获取当前配置
    const {
        currentOptions,
        currentFormFields,
        currentExportFileName,
        currentUiTexts
    } = config.getCurrentConfigs();

    // 生成选项映射表（如果需要）
    const optionsMap = config.generateOptionsMap
        ? config.generateOptionsMap(currentOptions)
        : {};

    // 根据配置动态生成表单状态
    const formState = useSignal(
        currentFormFields.reduce((acc, field) => {
            acc[field.id] = field.defaultValue;
            return acc;
        }, {} as Record<string, string>)
    );

    // 初始化时计算一次
    useEffect(() => {
        calculate();
    }, []);

    // 通用的输入变化处理器
    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const { id, value } = target;
        const updatedFormState = config.handleFieldChange(id, value, formState.value, optionsMap);
        formState.value = { ...updatedFormState, [id]: value };
    };

    // 选择框变化处理器（立即计算）
    const handleSelectChange = (e: Event) => {
        handleInputChange(e);
        calculate(); // 选择框立即计算
    };

    // 通用的失焦处理器，负责触发计算
    const handleInputBlur = () => {
        calculate();
    };

    // 通用的键盘事件处理器
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputIds = currentFormFields.filter(f => f.type === 'number').map(f => f.id);
            const currentIndex = inputIds.indexOf((e.target as HTMLElement).id);
            const nextIndex = (currentIndex + 1) % inputIds.length;
            const nextInput = document.getElementById(inputIds[nextIndex]) as HTMLInputElement;
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    };

    // 辅助函数：处理单个 Markdown 片段
    const processMarkdownChunk = async (markdown: string): Promise<string> => {
        const { value } = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeKatex)
            .use(rehypeStringify, { allowDangerousHtml: true })
            .process(markdown);
        return String(value);
    };

    // 主计算函数
    const calculate = async () => {
        try {
            const calculationResult = config.performCalculation(formState.value);

            if (!calculationResult) {
                resultChunks.value = [];
                markdownContentForExport.value = "";
                return;
            }

            // 使用配置的 Markdown 生成函数
            const markdownChunks = config.generateMarkdownContent(calculationResult);

            // 保存完整的 Markdown 内容用于导出
            markdownContentForExport.value = markdownChunks.join(' ');

            // 逐个渲染并显示
            resultChunks.value = []; // 清空旧结果

            for (const chunk of markdownChunks) {
                const htmlChunk = await processMarkdownChunk(chunk);
                // 每处理完一个，就更新 signal，触发 UI 渲染
                resultChunks.value = [...resultChunks.value, htmlChunk];
                // 添加一个微小的延迟，确保浏览器有时间进行重绘
                await new Promise(resolve => setTimeout(resolve, 10));
            }

        } catch (error) {
            console.error('Calculation failed:', error);
            resultChunks.value = [`<p>${currentUiTexts.calculationError}</p>`];
            markdownContentForExport.value = "";
        }
    };

    const exportToWord = async () => {
        try {
            // 直接使用已生成的 Markdown 内容，避免重复计算
            if (!markdownContentForExport.value) {
                alert(currentUiTexts.exportAlert);
                return;
            }

            // 使用已生成的 Markdown 内容
            const doc = await generateDocxFromMarkdown(markdownContentForExport.value);

            // Pack and download
            const blob = await docx.Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = currentExportFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert(currentUiTexts.exportError);
        }
    };

    return (
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div class="space-y-6">
                <FormGrid columns={config.formLayoutConfig.columns}>
                    {config.formLayoutConfig.sections.map((section, sectionIndex) => {
                        const [startIndex, endIndex] = section.fieldRange;
                        const sectionFields = endIndex === -1
                            ? currentFormFields.slice(startIndex)
                            : currentFormFields.slice(startIndex, endIndex);

                        return (
                            <FormSection key={sectionIndex}>
                                {sectionFields.map(field => {
                                    const commonProps = {
                                        key: field.id,
                                        id: field.id,
                                        label: field.label,
                                        value: formState.value[field.id],
                                        placeholder: field.placeholder,
                                    };
                                    if (field.type === 'select') {
                                        return <SelectInput {...commonProps} options={currentOptions} onChange={handleSelectChange} />;
                                    }
                                    if (field.type === 'number') {
                                        return <NumberInput {...commonProps} {...field} onInput={handleInputChange} onBlur={handleInputBlur} onKeyDown={handleKeyDown} />;
                                    }
                                    return null;
                                })}

                                {section.includeExportButton && (
                                    <div>
                                        <label class="block text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">&nbsp;</label>
                                        <button onClick={exportToWord} disabled={!markdownContentForExport.value} class={`w-full px-4 py-2 text-base sm:text-lg rounded-lg shadow-sm transition-colors duration-300 flex items-center justify-center space-x-2 h-10 sm:h-11 ${markdownContentForExport.value
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            }`}>
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <span class="whitespace-nowrap">{currentUiTexts.exportButton}</span>
                                        </button>
                                    </div>
                                )}
                            </FormSection>
                        );
                    })}
                </FormGrid>

                {resultChunks.value.length > 0 && (
                    <div id="calculation-result" class="prose dark:prose-invert max-w-4xl mx-auto p-4">
                        {resultChunks.value.map((chunk, index) => (
                            <div key={index} dangerouslySetInnerHTML={{ __html: chunk }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}