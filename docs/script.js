// DOM 元素引用
const functionInput = document.getElementById('functionInput');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const stepInput = document.getElementById('step');
const saveBtn = document.getElementById('saveBtn');
const generateBtn = document.getElementById('generateBtn'); // 添加generateBtn引用
const logOutput = document.getElementById('logOutput'); // 添加logOutput引用
const resetBtn = document.getElementById('reset'); // 添加reset按钮引用

// 图表实例变量
let inputVoltageChartInstance = null;
let actualVoltageChartInstance = null;
let errorChartInstance = null;

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
    // 为重置程序按钮添加点击事件
    resetBtn.addEventListener('click', handleResetBtnClick);
}

/**
 * 计算函数值的安全评估函数
 * @param {string} expression - 函数表达式
 * @param {number} t - 时间参数
 * @param {string} ider - 输入框ID，用于区分不同的输入框
 * @returns {*} - 计算结果
 */
function calculateFunctionValue(expression, t, ider) {
    if (ider == 'functionInput') {
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
    
    else if (ider == 'startTime' || ider == 'endTime' || ider == 'step') {
        try {
            let processedExpression = expression
                .replace(/π/g, 'Math.PI')  
                .replace(/e/g, 'Math.E')   
                .replace(/\^/g, '**');     
            
            const safeEval = new Function('Math', `
                with(Math) {
                    return ${processedExpression};
                }
            `);
            const result = safeEval(Math);
            
            // 确保结果是数字
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('表达式计算结果不是有效数字');
            }
            
            return result;
        } catch (error) {
            throw new Error(`表达式计算错误: ${error.message}`);
        }
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
        calculateFunctionValue(expression, startTime, 'functionInput');
    } catch (error) {
        throw error;
    }
    
    // 生成采样点
    for (let t = startTime; t <= endTime; t += step) {
        try {
            const voltage = calculateFunctionValue(expression, t, 'functionInput');
            // 确保电压是有效的数字
            if (isNaN(voltage) || !isFinite(voltage)) {
                throw new Error(`在时间 t=${t.toFixed(2)} 秒时计算得到无效的电压值`);
            }
            dataPoints.push({ t: t, voltage: voltage });
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
        fileContent += `${point.t.toFixed(4)},${point.voltage.toFixed(4)}
`;
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
        const startTime = calculateFunctionValue(startTimeInput.value.trim() || '0', 0, 'startTime');
        const endTime = calculateFunctionValue(endTimeInput.value.trim() || '10', 0, 'endTime');
        const step = calculateFunctionValue(stepInput.value.trim() || '0.1', 0, 'step');
        
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

/**
 * 读取2.txt文件中的实际电压数据
 * @returns {Promise<Array>} 包含{time, voltage}对象的数组
 */
async function readActualVoltageData() {
    try {
        // 读取2.txt文件内容
        const response = await fetch('2.txt');
        if (!response.ok) {
            throw new Error(`无法读取文件: ${response.statusText}`);
        }
        const text = await response.text();
        
        // 解析文件内容，格式为（时间，电压）
        const lines = text.trim().split('\n');
        const actualData = lines.map(line => {
            const [timeStr, voltageStr] = line.split(',').map(item => item.trim());
            return {
                time: parseFloat(timeStr),
                voltage: parseFloat(voltageStr)
            };
        }).filter(data => !isNaN(data.time) && !isNaN(data.voltage));
        
        return actualData;
    } catch (error) {
        console.error('读取实际电压数据时出错:', error);
        throw new Error(`读取2.txt文件失败: ${error.message}`);
    }
}

/**
 * 绘制实际电压图表
 * @param {Array} dataPoints - 输入电压数据点数组
 */
async function drawActualVoltageChart(dataPoints) {
    const ctx = document.getElementById('actualVoltageChart').getContext('2d');
    
    // 销毁已存在的图表实例
    if (actualVoltageChartInstance) {
        actualVoltageChartInstance.destroy();
    }
    
    try {
        // 读取实际电压数据
        const actualVoltageData = await readActualVoltageData();
        
        // 准备数据
        const labels = dataPoints.map(point => point.t.toFixed(2));
        
        // 使用2.txt中的数据，如果时间点匹配
        const data = dataPoints.map(point => {
            // 查找最接近的时间点
            const closestPoint = actualVoltageData.reduce((closest, current) => {
                const closestDiff = Math.abs(closest.time - point.t);
                const currentDiff = Math.abs(current.time - point.t);
                return currentDiff < closestDiff ? current : closest;
            }, actualVoltageData[0]);
            
            return closestPoint.voltage;
        });
        
        // 创建图表
        actualVoltageChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '实际电压 (V)',
                    data: data,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '实际电压随时间变化曲线'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '时间 (s)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '电压 (V)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('绘制实际电压图表时出错:', error);
        alert(`绘制实际电压图表失败: ${error.message}`);
    }
}

/**
 * 绘制电压误差图表
 * @param {Array} dataPoints - 输入电压数据点数组
 */
async function drawErrorChart(dataPoints) {
    const ctx = document.getElementById('errorChart').getContext('2d');
    
    // 销毁已存在的图表实例
    if (errorChartInstance) {
        errorChartInstance.destroy();
    }
    
    try {
        // 读取实际电压数据
        const actualVoltageData = await readActualVoltageData();
        
        // 准备数据
        const labels = dataPoints.map(point => point.t.toFixed(2));
        const inputData = dataPoints.map(point => point.voltage);
        
        // 使用2.txt中的数据计算实际电压
        const actualData = dataPoints.map(point => {
            // 查找最接近的时间点
            const closestPoint = actualVoltageData.reduce((closest, current) => {
                const closestDiff = Math.abs(closest.time - point.t);
                const currentDiff = Math.abs(current.time - point.t);
                return currentDiff < closestDiff ? current : closest;
            }, actualVoltageData[0]);
            
            return closestPoint.voltage;
        });
        
        // 计算误差
        const errorData = inputData.map((input, index) => input - actualData[index]);
        
        // 创建图表
        errorChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '电压误差 (V)',
                    data: errorData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '电压误差随时间变化曲线'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '时间 (s)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '电压误差 (V)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('绘制误差图表时出错:', error);
        alert(`绘制误差图表失败: ${error.message}`);
    }
}

// 处理在线预览按钮点击事件
async function handleGenerateBtnClick() {
    try {
        // 获取用户输入
        const expression = functionInput.value.trim();
        const startTime = calculateFunctionValue(startTimeInput.value.trim() || '0', 0, 'startTime');
        const endTime = calculateFunctionValue(endTimeInput.value.trim() || '10', 0, 'endTime');
        const step = calculateFunctionValue(stepInput.value.trim() || '0.1', 0, 'step');
        
        // 生成采样数据
        const dataPoints = generateSampleData(expression, startTime, endTime, step);
        
        // 绘制图表（由于现在是异步函数，需要await）
        drawInputVoltageChart(dataPoints);
        await drawActualVoltageChart(dataPoints);
        await drawErrorChart(dataPoints);
        
    } catch (error) {
        // 显示错误提示
        alert('错误: ' + error.message);
    }
}

/**
 * 绘制输入电压图表
 * @param {Array} dataPoints - 数据点数组
 */
function drawInputVoltageChart(dataPoints) {
    const ctx = document.getElementById('inputVoltageChart').getContext('2d');
    
    // 销毁已存在的图表实例
    if (inputVoltageChartInstance) {
        inputVoltageChartInstance.destroy();
    }
    
    // 准备数据
    const labels = dataPoints.map(point => point.t.toFixed(2));
    const data = dataPoints.map(point => point.voltage);
    
    // 创建图表
    inputVoltageChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '输入电压 (V)',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '输入电压随时间变化曲线'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '时间 (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '电压 (V)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * 处理重置程序按钮点击事件
 */
function handleResetBtnClick() {
    try {
        // 清除所有输入框内容
        functionInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
        stepInput.value = '';
        
        // 清除/销毁所有图表实例
        if (inputVoltageChartInstance) {
            inputVoltageChartInstance.destroy();
            inputVoltageChartInstance = null;
        }
        if (actualVoltageChartInstance) {
            actualVoltageChartInstance.destroy();
            actualVoltageChartInstance = null;
        }
        if (errorChartInstance) {
            errorChartInstance.destroy();
            errorChartInstance = null;
        }
        
        // 如果有日志输出框，也清除它
        if (logOutput) {
            logOutput.textContent = '';
        }
        
        // 可以添加一个重置成功的提示（可选）
        // alert('程序已重置');
        
    } catch (error) {
        console.error('重置程序时出错:', error);
        alert('重置程序失败: ' + error.message);
    }
}