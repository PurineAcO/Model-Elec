// DOM 元素引用
const functionInput = document.getElementById('functionInput');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const stepInput = document.getElementById('step');
const saveBtn = document.getElementById('saveBtn');
const generateBtn = document.getElementById('generateBtn'); // 添加generateBtn引用
const logOutput = document.getElementById('logOutput'); // 添加logOutput引用

// 页面加载完成后初始化
window.addEventListener('load', init);

/**
 * 初始化函数，设置事件监听器
 */
function init() {
    // 为保存按钮添加点击事件
    saveBtn.addEventListener('click', handleSaveBtnClick);
    // 为在线预览按钮添加点击事件
    generateBtn.addEventListener('click', handleGenerateBtnClick);
}

// 计算函数值的安全评估函数
function calculateFunctionValue(expression, t) {
    try {
        let processedExpression = expression
            .replace(/π/g, 'Math.PI')  
            .replace(/e/g, 'Math.E')   
            .replace(/\^/g, '**');     
        
        const safeEval = new Function('t', 'Math', `
            with(Math) {
                return ${processedExpression};
            }
        `);
        return safeEval(t, Math);
    } catch (error) {
        throw new Error(`函数表达式计算错误: ${error.message}`);
    }
}

// 生成采样数据
function generateSampleData(expression, startTime, endTime, step) {
    const dataPoints = [];
    
    // 验证时间区间
    if (startTime >= endTime) {
        throw new Error('起始时间必须小于结束时间');
    }
    
    // 验证采样步长
    if (step <= 0) {
        throw new Error('采样步长必须大于0');
    }
    
    // 验证函数表达式
    if (!expression.trim()) {
        throw new Error('函数表达式不能为空');
    }
    
    // 尝试计算第一个点以验证表达式
    try {
        calculateFunctionValue(expression, startTime);
    } catch (error) {
        throw error;
    }
    
    // 生成采样点
    for (let t = startTime; t <= endTime; t += step) {
        try {
            const voltage = calculateFunctionValue(expression, t);
            // 确保电压是有效的数字
            if (isNaN(voltage) || !isFinite(voltage)) {
                throw new Error(`在时间 t=${t.toFixed(2)} 秒时计算得到无效的电压值`);
            }
            dataPoints.push({ t: t.toFixed(4), voltage: voltage.toFixed(4) });
        } catch (error) {
            throw new Error(`计算错误 (t=${t.toFixed(2)}s): ${error.message}`);
        }
    }
    
    return dataPoints;
}

// 将数据保存到文件
function saveDataToFile(dataPoints, filename = '1.txt') {
    // 格式化数据为CSV格式（时间,电压）
    let fileContent = '';
    dataPoints.forEach(point => {
        fileContent += `${point.t},${point.voltage}\n`;
    });
    
    // 创建Blob并下载文件
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

// 处理保存按钮点击事件
function handleSaveBtnClick() {
    try {
        const expression = functionInput.value.trim();
        const startTime = parseFloat(startTimeInput.value);
        const endTime = parseFloat(endTimeInput.value);
        const step = parseFloat(stepInput.value);
        
        // 验证输入参数
        if (isNaN(startTime) || isNaN(endTime) || isNaN(step)) {
            throw new Error('请输入有效的时间参数');
        }
        
        // 生成采样数据
        const dataPoints = generateSampleData(expression, startTime, endTime, step);
        
        // 保存数据到文件
        saveDataToFile(dataPoints, '1.txt');
        
        // 显示成功提示
        alert(`成功生成 ${dataPoints.length} 个数据点并保存到1.txt文件`);
        
    } catch (error) {
        // 显示错误提示
        alert('错误: ' + error.message);
    }
}

