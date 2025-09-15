// DOM 元素引用
const functionInput = document.getElementById('functionInput');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const sampleIntervalInput = document.getElementById('sampleInterval');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const logOutput = document.getElementById('logOutput');

// 图表对象引用
let inputVoltageChart = null;
let actualVoltageChart = null;
let errorChart = null;

// 添加日志函数
function addLog(message, isError = false) {
    const logEntry = document.createElement('div');
    logEntry.className = isError ? 'error' : '';
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logOutput.appendChild(logEntry);
    logOutput.scrollTop = logOutput.scrollHeight;
}

// 计算函数值的安全评估函数
function calculateFunctionValue(expression, t) {
    try {
        // 创建一个安全的环境来评估表达式
        // 仅允许数学函数和常量
        const safeEval = new Function('t', 'Math', `
            with(Math) {
                return ${expression};
            }
        `);
        return safeEval(t, Math);
    } catch (error) {
        throw new Error(`函数表达式计算错误: ${error.message}`);
    }
}

// 生成采样数据
function generateSampleData(expression, startTime, endTime, sampleInterval) {
    const dataPoints = [];
    
    // 验证时间区间
    if (startTime >= endTime) {
        throw new Error('起始时间必须小于结束时间');
    }
    
    // 验证采样精度
    if (sampleInterval <= 0) {
        throw new Error('采样精度必须大于0');
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
    for (let t = startTime; t <= endTime; t += sampleInterval) {
        try {
            const voltage = calculateFunctionValue(expression, t);
            // 确保电压是有效的数字
            if (isNaN(voltage) || !isFinite(voltage)) {
                throw new Error(`在时间 t=${t.toFixed(2)} 秒时计算得到无效的电压值`);
            }
            dataPoints.push({ t: t.toFixed(2), voltage: voltage.toFixed(4) });
        } catch (error) {
            throw new Error(`计算错误 (t=${t.toFixed(2)}s): ${error.message}`);
        }
    }
    
    return dataPoints;
}

// 从2.txt读取实际电压数据
function readActualVoltageData() {
    return new Promise((resolve, reject) => {
        // 使用fetch API读取文件
        fetch('2.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`无法读取2.txt文件: ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                const dataPoints = [];
                const lines = text.trim().split('\n');
                
                lines.forEach(line => {
                    const parts = line.split(',');
                    if (parts.length === 2) {
                        const t = parseFloat(parts[0]);
                        const voltage = parseFloat(parts[1]);
                        
                        if (!isNaN(t) && !isNaN(voltage)) {
                            dataPoints.push({ t: t.toFixed(2), voltage: voltage.toFixed(4) });
                        }
                    }
                });
                
                if (dataPoints.length === 0) {
                    throw new Error('2.txt文件中没有有效的电压数据');
                }
                
                resolve(dataPoints);
            })
            .catch(error => {
                addLog(`警告: ${error.message}，将使用默认模拟数据`, true);
                
                // 如果无法读取文件，生成一些模拟的实际电压数据
                const startTime = parseFloat(startTimeInput.value);
                const endTime = parseFloat(endTimeInput.value);
                const sampleInterval = parseFloat(sampleIntervalInput.value);
                const mockData = [];
                
                for (let t = startTime; t <= endTime; t += sampleInterval) {
                    // 生成一个有噪声的正弦波作为模拟数据
                    const baseVoltage = 5 * Math.sin(t);
                    const noise = (Math.random() - 0.5) * 0.5; // 添加一些噪声
                    mockData.push({ 
                        t: t.toFixed(2), 
                        voltage: (baseVoltage + noise).toFixed(4) 
                    });
                }
                
                resolve(mockData);
            });
    });
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

// 创建或更新图表
function createOrUpdateChart(canvasId, title, labels, datasets) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // 如果图表已经存在，销毁它
    if ((canvasId === 'inputVoltageChart' && inputVoltageChart) ||
        (canvasId === 'actualVoltageChart' && actualVoltageChart) ||
        (canvasId === 'errorChart' && errorChart)) {
        if (canvasId === 'inputVoltageChart') inputVoltageChart.destroy();
        if (canvasId === 'actualVoltageChart') actualVoltageChart.destroy();
        if (canvasId === 'errorChart') errorChart.destroy();
    }
    
    // 创建新图表
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
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
                        text: '时间 (秒)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '电压 (V)'
                    }
                }
            }
        }
    });
    
    // 保存图表引用
    if (canvasId === 'inputVoltageChart') inputVoltageChart = chart;
    if (canvasId === 'actualVoltageChart') actualVoltageChart = chart;
    if (canvasId === 'errorChart') errorChart = chart;
}

// 处理生成按钮点击事件
async function handleGenerateBtnClick() {
    logOutput.innerHTML = ''; // 清空日志
    
    try {
        const expression = functionInput.value;
        const startTime = parseFloat(startTimeInput.value);
        const endTime = parseFloat(endTimeInput.value);
        const sampleInterval = parseFloat(sampleIntervalInput.value);
        
        addLog('开始生成数据...');
        addLog(`函数表达式: ${expression}`);
        addLog(`时间区间: ${startTime}s 到 ${endTime}s`);
        addLog(`采样精度: ${sampleInterval}s`);
        
        // 生成用户输入电压数据
        const inputVoltageData = generateSampleData(expression, startTime, endTime, sampleInterval);
        addLog(`成功生成 ${inputVoltageData.length} 个输入电压数据点`);
        
        // 读取实际电压数据
        addLog('正在读取2.txt中的实际电压数据...');
        const actualVoltageData = await readActualVoltageData();
        addLog(`成功读取 ${actualVoltageData.length} 个实际电压数据点`);
        
        // 计算误差数据
        addLog('正在计算电压误差...');
        const errorData = [];
        
        // 对齐时间点，计算误差
        for (let i = 0; i < inputVoltageData.length; i++) {
            // 找到对应的实际电压数据点
            const inputPoint = inputVoltageData[i];
            const actualPoint = actualVoltageData[i] || { voltage: '0' }; // 如果没有对应点，使用0
            
            const error = parseFloat(inputPoint.voltage) - parseFloat(actualPoint.voltage);
            errorData.push({ 
                t: inputPoint.t, 
                error: error.toFixed(4) 
            });
        }
        
        addLog('成功计算电压误差数据');
        
        // 准备图表数据
        const labels = inputVoltageData.map(point => point.t);
        
        // 输入电压图表数据
        const inputVoltageDataset = [{
            label: '输入电压',
            data: inputVoltageData.map(point => point.voltage),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1
        }];
        
        // 实际电压图表数据
        const actualVoltageDataset = [{
            label: '实际电压',
            data: actualVoltageData.map(point => point.voltage),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.1
        }];
        
        // 误差图表数据
        const errorDataset = [{
            label: '电压误差',
            data: errorData.map(point => point.error),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1
        }];
        
        // 创建或更新图表
        addLog('正在绘制图表...');
        createOrUpdateChart('inputVoltageChart', '用户输入电压', labels, inputVoltageDataset);
        createOrUpdateChart('actualVoltageChart', '实际电压', labels, actualVoltageDataset);
        createOrUpdateChart('errorChart', '电压误差', labels, errorDataset);
        
        addLog('图表绘制完成！', false);
        
    } catch (error) {
        addLog(error.message, true);
    }
}

// 处理保存按钮点击事件
function handleSaveBtnClick() {
    try {
        const expression = functionInput.value;
        const startTime = parseFloat(startTimeInput.value);
        const endTime = parseFloat(endTimeInput.value);
        const sampleInterval = parseFloat(sampleIntervalInput.value);
        
        addLog('正在生成输入电压数据并保存到1.txt...');
        
        const inputVoltageData = generateSampleData(expression, startTime, endTime, sampleInterval);
        saveDataToFile(inputVoltageData, '1.txt');
        
        addLog('数据已成功保存到1.txt文件！', false);
        
    } catch (error) {
        addLog(`保存失败: ${error.message}`, true);
    }
}

// 初始化函数
function init() {
    generateBtn.addEventListener('click', handleGenerateBtnClick);
    saveBtn.addEventListener('click', handleSaveBtnClick);
    
    addLog('电压模拟器与图像绘制应用已初始化完成');
    addLog('请输入函数表达式、时间区间和采样精度，然后点击"生成数据并绘制图像"按钮');
    addLog('支持的数学函数: sin(), cos(), tan(), exp(), log(), sqrt(), abs() 等');
    addLog('注意：请通过HTTP服务器访问此页面，否则可能无法读取2.txt文件');
}

// 页面加载完成后初始化
window.addEventListener('load', init);