// DOM 元素引用
const functionInput = document.getElementById('functionInput');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const stepInput = document.getElementById('step');
const saveBtn = document.getElementById('saveBtn');
const generateBtn = document.getElementById('generateBtn');
const logOutput = document.getElementById('logOutput'); 
const resetBtn = document.getElementById('reset'); 
const loopCheckbox = document.getElementById('loopCheckbox');
const loopCountContainer=document.getElementById('loopCountContainer');
const loopCountInput = document.getElementById('loopCount');
const pointInputword = document.getElementById('pointInputword');
const pointInputCheckbox = document.getElementById('pointInputCheckbox');
const functionInputword = document.getElementById('functionInputword');


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
    // 提交输入
    saveBtn.addEventListener('click', handleSaveBtnClick);
    // 在线预览
    generateBtn.addEventListener('click', handleGenerateBtnClick);
    // 重置程序
    resetBtn.addEventListener('click', handleResetBtnClick);
    // 循环按钮
    loopCheckbox.addEventListener('change', handleloopbtnclick);
    // 点输入按钮
    pointInputCheckbox.addEventListener('change', handlepointbtnclick);
    pointInputCheckbox.addEventListener('change', UpdateFunctionInputPlaceholder);
}

function handleloopbtnclick(){
    loopCountContainer.style.display=loopCheckbox.checked ? 'block':'none';

}

function handlepointbtnclick(){
    pointInputword.style.display=pointInputCheckbox.checked ? 'block':'none';
    functionInputword.style.display=pointInputCheckbox.checked ? 'none':'block';
}

// 占位符输入啥
function UpdateFunctionInputPlaceholder(){
     if (pointInputCheckbox.checked) {
        functionInput.placeholder = "请输入时间-电压元组";
    } else {
        functionInput.placeholder = "请输入函数表达式";
    }
}

/**
 * 解析点输入字符串，返回数据点数组（支持时间和电压的算式计算）
 * @param {string} pointString - 点输入字符串
 * @returns {Array} - 数据点数组
 */
function parsePointInput(pointString) {
    const points = [];
    
    // 按分号分割点
    const pointPairs = pointString.split(';');
    
    for (const pair of pointPairs) {
        // 跳过空字符串
        if (!pair.trim()) continue;
        
        // 按逗号分割时间和电压
        const parts = pair.split(',');
        
        if (parts.length !== 2) {
            throw new Error(`无效的点格式: ${pair}。请使用 时间,电压 格式。`);
        }
        
        try {
            // 使用calculateFunctionValue计算时间表达式的值
            const timeExpression = parts[0].trim();
            const time = calculateFunctionValue(timeExpression, 0, 'startTime'); // 使用startTime的解析逻辑
            
            // 使用calculateFunctionValue计算电压表达式的值
            const voltageExpression = parts[1].trim();
            const voltage = calculateFunctionValue(voltageExpression, 0, 'startTime'); // 同样使用数值解析逻辑
            
            if (isNaN(time) || isNaN(voltage) || !isFinite(time) || !isFinite(voltage)) {
                throw new Error(`计算得到无效的数值: 时间=${timeExpression}, 电压=${voltageExpression}`);
            }
            
            points.push({ t: time, voltage: voltage });
        } catch (error) {
            throw new Error(`解析点 ${pair} 时出错: ${error.message}`);
        }
    }
    
    if (points.length < 2) {
        throw new Error('至少需要输入两个点才能进行线性连接。');
    }
    
    // 按时间排序
    points.sort((a, b) => a.t - b.t);
    
    // 检查时间重复
    for (let i = 1; i < points.length; i++) {
        if (points[i].t === points[i-1].t) {
            throw new Error(`时间点重复: ${points[i].t}`);
        }
    }
    
    return points;
}

/**
 * 根据已知点生成线性插值数据
 * @param {Array} points - 已知点数组
 * @param {number} startTime - 起始时间
 * @param {number} endTime - 结束时间
 * @param {number} step - 采样步长
 * @param {number} loopCount - 循环次数
 * @returns {Array} - 插值后的数据点数组
 */
function generateLinearInterpolationData(points, startTime, endTime, step, loopCount) {
    const result = [];
    const cycleDuration = endTime - startTime;
    
    for (let cycle = 0; cycle < loopCount; cycle++) {
        const timeOffset = cycle * cycleDuration;
        
        // 对每个循环内的时间点进行插值
        for (let t = startTime; t <= endTime; t += step) {
            const actualTime = t + timeOffset;
            let voltage;
            
            // 找到t所在的区间
            let found = false;
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                
                // 处理循环，将实际时间映射到原始点的时间范围
                const normalizedTime = t >= p1.t && t <= p2.t;
                
                if (normalizedTime) {
                    // 线性插值
                    const ratio = (t - p1.t) / (p2.t - p1.t);
                    voltage = p1.voltage + ratio * (p2.voltage - p1.voltage);
                    found = true;
                    break;
                }
            }
            
            // 如果t不在任何已知点之间，使用最近的点
            if (!found) {
                if (t < points[0].t) {
                    voltage = points[0].voltage;
                } else {
                    voltage = points[points.length - 1].voltage;
                }
            }
            
            result.push({ t: actualTime, voltage: voltage });
        }
    }
    
    return result;
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
    
    else if (ider == 'startTime' || ider == 'endTime' || ider == 'step' || ider == 'loopCount') {
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

/**
 * 生成采样数据
 * @param {string} expression - 函数表达式
 * @param {number} startTime - 起始时间
 * @param {number} endTime - 结束时间
 * @param {number} step - 采样步长
 * @param {number} [loopCount=1] - 循环次数
 * @returns {Array} - 包含采样点的数组
 */
function generateSampleData(expression, startTime, endTime, step, loopCount = 1) {
    
    if (pointInputCheckbox.checked) {
        // 点输入模式
        const points = parsePointInput(functionInput.value);
        return generateLinearInterpolationData(points, startTime, endTime, step, loopCount);
    } 

    const dataPoints = [];
    // 验证时间区间
    if (startTime >= endTime) {
        throw new Error('起始时间必须小于结束时间');
    }
    
    // 验证采样步长
    if (step <= 0) {
        throw new Error('采样步长必须大于0');
    }
    
    // 验证循环次数
    if (loopCount < 1) {
        throw new Error('循环次数必须大于或等于1');
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
    
    // 计算单次循环的持续时间
    const cycleDuration = endTime - startTime;
    
    // 生成采样点
    for (let cycle = 0; cycle < loopCount; cycle++) {
        const timeOffset = cycle * cycleDuration;
        
        for (let t = startTime; t <= endTime; t += step) {
            try {
                const actualTime = t + timeOffset;
                const voltage = calculateFunctionValue(expression, t, 'functionInput');
                // 确保电压是有效的数字
                if (isNaN(voltage) || !isFinite(voltage)) {
                    throw new Error(`在时间 t=${actualTime.toFixed(2)} 秒时计算得到无效的电压值`);
                }
                dataPoints.push({ t: actualTime, voltage: voltage });
            } catch (error) {
                throw new Error(`计算错误 (循环 ${cycle+1}, t=${t.toFixed(2)}s): ${error.message}`);
            }
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
        const loopCount = loopCheckbox.checked ? 
            Math.floor(calculateFunctionValue(loopCountInput.value.trim() || '1', 0, 'loopCount')) : 1;
        

        // 生成采样数据
        const dataPoints = generateSampleData(expression, startTime, endTime, step, loopCount);
        
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
                    borderColor: '#85de85ff',
                    // backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: false,
                    pointRadius: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false,
                        text: '实际电压随时间变化曲线'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: false,
                            text: '时间 (s)'
                        }
                    },
                    y: {
                        title: {
                            display: false,
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
                    borderColor: 'rgba(233, 178, 164, 1)',
                    backgroundColor: 'rgba(233, 178, 164, 0.3)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true,
                    pointRadius: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false,
                        text: '电压误差随时间变化曲线'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: false,
                            text: '时间 (s)'
                        }
                    },
                    y: {
                        title: {
                            display: false,
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
        const loopCount = loopCheckbox.checked ? 
            Math.floor(calculateFunctionValue(loopCountInput.value.trim() || '1', 0, 'loopCount')) : 1;
        
        // 生成采样数据
        const dataPoints = generateSampleData(expression, startTime, endTime, step, loopCount);
        
        // 绘制图表（由于现在是异步函数，需要await）
        drawInputVoltageChart(dataPoints);
        // await drawActualVoltageChart(dataPoints);
        // await drawErrorChart(dataPoints);
        
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
                borderColor: '#79b0b1ff',
                borderWidth: 2,
                tension: 0.1,
                fill: false,
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: '输入电压随时间变化曲线'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    display: false
                },
            },
            scales: {
                x: {
                    title: {
                        display: false,
                        text: '时间 (s)'
                    }
                },
                y: {
                    title: {
                        display: false,
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
        loopCountInput.value = '';
        loopCheckbox.checked = false;
        loopCheckbox.style.display = 'none';
        pointInputCheckbox.checked = false;
        
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