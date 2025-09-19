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
const workbenchbtn = document.getElementById('workbenchbtn');
const historybtn = document.getElementById('historybtn');
const devicebtn = document.getElementById('devicebtn');
const userbtn = document.getElementById('userbtn');
const KSRB = document.getElementById('KSRB');
const togithub = document.getElementById('togithub');
const tosource = document.getElementById('tosource');
const mathButtons=document.querySelectorAll('.math-btn');
const connectit = document.getElementById('connectit');

// 添加登录相关DOM元素引用
const loginContainer = document.getElementById('loginContainer');
const loginUsername = document.getElementById('loginUsername');
const loginEmail = document.getElementById('loginEmail');
const loginBtn = document.getElementById('loginBtn');
const usernameDisplay = document.getElementById('username');
const useremailDisplay = document.getElementById('useremail');
const logoutBtn = document.getElementById('logoutBtn'); // 添加退出登录按钮引用
const rememberMeCheckbox = document.getElementById('rememberMe');
const lastLoginTimeDisplay = document.getElementById('lastlogintime');

// 添加日志相关按钮引用
const clearLogBtn = document.getElementById('clearlog');
const exportLogBtn = document.getElementById('savelog');
const importLogBtn = document.getElementById('uploadlog');
const rememberLogBtn = document.getElementById('rememberlog');

let inputVoltageChartInstance = null;
let actualVoltageChartInstance = null;
let errorChartInstance = null;
let realinput=functionInput;

// 页面加载完成后初始化
window.addEventListener('load', init);

/**
 * 初始化函数，设置事件监听器
 */
function init() {
    checkUserLogin();

    // 登录按钮
    loginBtn.addEventListener('click', handleLogin);
    
    // 退出登录
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    loadSavedLogs();
    
    // 提交输入
    saveBtn.addEventListener('click', handlesaveBtnClick);
    // 在线预览
    generateBtn.addEventListener('click', handleGenerateBtnClick);
    // 重置程序
    resetBtn.addEventListener('click', handleResetBtnClick);
    // 循环按钮
    loopCheckbox.addEventListener('change', handleloopbtnclick);
    // 点输入按钮
    pointInputCheckbox.addEventListener('change', handlepointbtnclick);
    pointInputCheckbox.addEventListener('change', UpdateFunctionInputPlaceholder);
    // 选中菜单
    workbenchbtn.addEventListener('click', handleworkbenchclick);
    // devicebtn.addEventListener('click', handledeviceclick);
    historybtn.addEventListener('click', handlehistoryclick);
    userbtn.addEventListener('click', handleuserclick);
    KSRB.addEventListener('click', handleKSRBclick);
    // 连接设备按钮
    // connectit.addEventListener('click', handleconnectitclick);
    // 转到github
    togithub.addEventListener('click', ()=>{window.open('https://github.com/PurineAcO','_blank')});
    // 查看项目源码
    tosource.addEventListener('click', ()=>{window.open('https://github.com/PurineAcO/Model-Elec','_blank')});

    // 日志相关操作按钮
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', handleClearLog);
    }
    if (exportLogBtn) {
        exportLogBtn.addEventListener('click', handleExportLog);
    }
    if (importLogBtn) {
        importLogBtn.addEventListener('click', handleImportLog);
    }
    if (rememberLogBtn) {
        rememberLogBtn.addEventListener('click', loadSavedLogs);
    }

}

// 检查用户登录状态
function checkUserLogin() {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    
    if (username && email) {
        // 如果有用户信息，更新显示并隐藏登录界面
        updateUserInfo(username, email, lastLoginTime);
        loginContainer.style.display = 'none';
        document.querySelector('.main-container').style.display = 'grid';
        handleworkbenchclick();
    }
}

// 修改handleLogin函数
function handleLogin() {
    const username = loginUsername.value.trim();
    const email = loginEmail.value.trim();
    
    if (username && email) {
        // 获取上次登录时间（如果存在）
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        
        // 记录当前登录时间
        const currentLoginTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 保存用户信息到localStorage
        // 记住登录状态
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);
            localStorage.setItem('lastLoginTime', currentLoginTime);
        }
        
        // 更新用户信息显示
        updateUserInfo(username, email, lastLoginTime);
        
        // 隐藏登录界面，显示工作区
        loginContainer.style.display = 'none';
        document.querySelector('.main-container').style.display = 'grid';
        
        // 选中工作区
        handleworkbenchclick();
    } else {
        alert('请输入用户名和邮箱');
    }
}

// 修改handleLogout函数
function handleLogout() {
    // 清除localStorage中的用户信息
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem(`user_log_${username}`);

    loginUsername.value = '';
    loginEmail.value = '';
    rememberMeCheckbox.checked = false;
    
    // 更新用户信息显示
    updateUserInfo('', '', '');

    handleResetBtnClick();
    if (logOutput) {
                logOutput.textContent = '';
            }

    
    // 显示登录界面，隐藏主界面内容
    loginContainer.style.display = 'flex';
    document.querySelector('.main-container').style.display = 'none';
}

// 更新用户信息显示
function updateUserInfo(username, email, lastLoginTime) {
    // 更新用户信息页面的显示
    if (usernameDisplay) {
        // 直接在usernameDisplay元素后添加用户名内容
        // 先获取原始标签文本(用户名:)
        const originalText = '用户名:';
        usernameDisplay.textContent = originalText + ' ' + username;
    }
    if (useremailDisplay) {
        // 直接在useremailDisplay元素中更新邮箱内容
        const originalText = '用户邮箱:';
        useremailDisplay.textContent = originalText + ' ' + email;
    }
    if (lastLoginTimeDisplay) {
        // 更新上次登录时间显示
        const originalText = '上次登录时间:';
        if (lastLoginTime) {
            lastLoginTimeDisplay.textContent = originalText + ' ' + lastLoginTime;
        } else {
            lastLoginTimeDisplay.textContent = originalText + ' 首次登录';
        }
    }
}

// 选中工作区
function handleworkbenchclick(){
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    workbenchbtn.classList.add('active');
    document.getElementById('column2-1').style.display='block';
    document.getElementById('column2-3').style.display='none';
    document.getElementById('column2-4').style.display='none';
    document.getElementById('column2-5').style.display='none';
    document.getElementById('column3').style.display='block';
    document.getElementById('historyContainer').style.display='none';
}

// 选中用户信息
function handleuserclick(){
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    userbtn.classList.add('active');
    document.getElementById('column2-1').style.display='none';
    document.getElementById('column2-3').style.display='none';
    document.getElementById('column2-4').style.display='block';
    document.getElementById('column2-5').style.display='none';
    document.getElementById('column3').style.display='none';
    document.getElementById('historyContainer').style.display='block';
}

// 选中知春饭桶
function handleKSRBclick(){
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    KSRB.classList.add('active');
    document.getElementById('column2-1').style.display='none';
    document.getElementById('column2-3').style.display='none';
    document.getElementById('column2-4').style.display='none';
    document.getElementById('column2-5').style.display='block';
    document.getElementById('column3').style.display='none';
    document.getElementById('historyContainer').style.display='block';
}

// 选中历史记录
function handlehistoryclick(){
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    historybtn.classList.add('active');
    document.getElementById('column2-1').style.display='block';
    document.getElementById('column2-3').style.display='none';
    document.getElementById('column2-4').style.display='none';
    document.getElementById('column2-5').style.display='none';
    document.getElementById('column3').style.display='none';
    document.getElementById('historyContainer').style.display='block';
}

// 选中设备
function handledeviceclick(){
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    devicebtn.classList.add('active');
    document.getElementById('column2-1').style.display='none';
    document.getElementById('column2-3').style.display='block';
    document.getElementById('column2-4').style.display='none';
    document.getElementById('column2-5').style.display='none';
    document.getElementById('column3').style.display='none';
    document.getElementById('historyContainer').style.display='block';
}

// 选中循环次数
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


document.addEventListener('DOMContentLoaded', mathbtninit)
  
function mathbtninit() {
    const allInputs = [functionInput, startTimeInput, endTimeInput, stepInput,loopCountInput];
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('focus', () => {
                realinput = input;
            });
        }
    });

    mathButtons.forEach(button => {
        button.addEventListener('click', () => {
            realinput.focus();
            Knowhatbutton(button.id);
        });
        
    });
}
/**
 * 向函数输入框插入符号
 * @param {string} symbol - 要插入的符号
 * @param {HTMLInputElement} input - 目标输入框元素
 */
function insertSymbol(symbol,input) {
    if (!input) {console.log('input不存在');return;}
    const startPos=input.selectionStart;
    const endPos=input.selectionEnd;
    const current=input.value;

    input.value=current.substring(0,startPos)+symbol+current.substring(endPos);

    input.focus();
    input.selectionStart=startPos+symbol.length;
    input.selectionEnd=startPos+symbol.length;

    input.dispatchEvent(new Event('input', { bubbles: true }));

}


function Knowhatbutton(buttonid){
    const btntable={
        'yao':'1',
        'liang':'2',
        'san':'3',
        'si':'4',
        'wu':'5',
        'liu':'6',
        'guai':'7',
        'ba':'8',
        'jiu':'9',
        'dong':'0',
        'plus':'+',
        'minus':'-',
        'multiply':'*',
        'divide':'/',
        'dot':'.',
        'openBracket':'(',
        'closeBracket':')',
        'pi':'π',
        'exp':'e',
        'power':'^(',
        'sqrt':'sqrt(',
        'sin':'sin(',
        'cos':'cos(',
        't':'t',
        'abs':'abs(',
        'equal':'=',
        'comma':',',
        "fenhao":';',
        "clear":'C',
        "tan":'tan(',
    }

    if (buttonid=='clear'){
        realinput.value=''
    }

    else if (buttonid=='equal'){
        realinput.value=calculateFunctionValue(realinput.value,0,'startTime')
    }
    
    else if(realinput==functionInput){
        if(pointInputCheckbox.checked){
            if(buttonid!='t'){
                insertSymbol(btntable[buttonid].trim(),realinput);
            }
        }
        else{
            if(buttonid!='fenhao' && buttonid!='comma'){
                insertSymbol(btntable[buttonid].trim(),realinput);
            }
        }
    }

    else if (realinput==startTimeInput || realinput==endTimeInput || realinput==stepInput || realinput==loopCountInput){
        if(buttonid!='t' && buttonid!='comma' && buttonid!='fenhao'){
            insertSymbol(btntable[buttonid].trim(),realinput);
        }
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
                    borderColor: '#79b0b1ff',
                    // backgroundColor: 'rgba(201, 81, 107, 0.2)',
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

// 处理在线预览按钮点击事件
function handleGenerateBtnClick() {
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
        
        // 绘制图表
        drawInputVoltageChart(dataPoints);
        // await drawActualVoltageChart(dataPoints);
        // await drawErrorChart(dataPoints);
        
    } catch (error) {
        // 显示错误提示
        alert('错误: ' + error.message);
    }
}

// 处理提交按钮点击事件
async function handlesaveBtnClick() {
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
        
        // 读取实际电压数据
        const actualVoltageData = await readActualVoltageData();
        
        // 绘制图表
        drawActualVoltageChart(dataPoints);
        drawErrorChart(dataPoints);
        
        // 记录日志信息
        logSubmitAction(expression, startTime, endTime, step, loopCount, actualVoltageData);
        
    } catch (error) {
        // 显示错误提示
        alert('错误: ' + error.message);
    }
}

/**
 * 记录提交操作的日志信息
 * @param {string} expression - 电压函数表达式
 * @param {number} startTime - 起始时间
 * @param {number} endTime - 结束时间
 * @param {number} step - 采样步长
 * @param {number} loopCount - 循环次数
 * @param {Array} actualVoltageData - 实际电压数据数组
 */
function logSubmitAction(expression, startTime, endTime, step, loopCount, actualVoltageData) {
    try {
        // 获取当前登录的用户名
        const username = localStorage.getItem('username') || '未登录用户';
        
        // 获取当前时间
        const submitTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 格式化时间参数数组
        const timeParams = [
            `起始时间: ${startTime}s`,
            `结束时间: ${endTime}s`,
            `采样步长: ${step}s`,
            `循环次数: ${loopCount}`
        ];
        
        // 格式化实际电压数据
        const voltageDataString = actualVoltageData.map(point => 
            `(${point.time.toFixed(2)}, ${point.voltage.toFixed(2)})`
        ).join(', ');
        
        // 创建日志条目
        const logEntry = `
===== 提交记录 =====
` +
                        `用户名: ${username}
` +
                        `提交时间: ${submitTime}
` +
                        `输入电压函数: ${expression}
` +
                        `时间参数: [${timeParams.join(', ')}]
` +
                        `实际电压数据: [${voltageDataString}]
` +
                        `===================
`;
        
        // 添加到日志输出区域
        if (logOutput) {
            // 在现有日志前添加新日志，保持最新的在最上面
            logOutput.textContent = logEntry + logOutput.textContent;
        }

        saveLogToStorage(logEntry);
        
    } catch (error) {
        console.error('记录日志时出错:', error);
    }
}

/**
 * 将日志保存到localStorage
 * @param {string} logEntry - 日志条目
 */
function saveLogToStorage(logEntry) {
    try {
        const username = localStorage.getItem('username');
        if (!username) return; // 如果用户未登录，不保存日志
        
        // 使用用户名作为键，确保不同用户的日志分开存储
        const logKey = `user_log_${username}`;
        
        // 获取现有日志
        let logs = [];
        const existingLogs = localStorage.getItem(logKey);
        if (existingLogs) {
            logs = JSON.parse(existingLogs);
        }
        
        // 添加新日志（限制日志数量，例如最多保存50条）
        logs.unshift(logEntry); // 添加到数组开头
        if (logs.length > 50) {
            logs = logs.slice(0, 50); // 保留最新的50条
        }
        
        // 保存回localStorage
        localStorage.setItem(logKey, JSON.stringify(logs));
    } catch (error) {
        console.error('保存日志到localStorage时出错:', error);
    }
}

/**
 * 从localStorage加载保存的日志
 */
function loadSavedLogs() {
    try {
        const username = localStorage.getItem('username');
        if (!username || !logOutput) return;
        
        const logKey = `user_log_${username}`;
        const savedLogs = localStorage.getItem(logKey);
        
        if (savedLogs) {
            const logs = JSON.parse(savedLogs);
            // 将日志合并显示
            logOutput.textContent = logs.join('');
        }
    } catch (error) {
        console.error('加载保存的日志时出错:', error);
    }
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
        UpdateFunctionInputPlaceholder();
        handlepointbtnclick();
        
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
        
        // // 如果存在日志输出框，也清除它
        // if (logOutput) {
        //     logOutput.textContent = '';
        // }
        
        // 可以添加一个重置成功的提示（可选）
        // alert('程序已重置');
        
    } catch (error) {
        console.error('重置程序时出错:', error);
        alert('重置程序失败: ' + error.message);
    }
}

/**
 * 清空历史记录
 */
function handleClearLog() {
    try {

        const username = localStorage.getItem('username');
        if (username) {
            // 清除localStorage中的日志
            const logKey = `user_log_${username}`;
            localStorage.removeItem(logKey);
            
            
            // 清空界面上的日志显示
            if (logOutput) {
                logOutput.textContent = '';
            }
            
            alert('历史记录已清空');
        }
    } catch (error) {
        console.error('清空历史记录时出错:', error);
        alert('清空历史记录失败: ' + error.message);
    }
}

/**
 * 导出历史记录
 */
function handleExportLog() {
    try {
        // 直接获取日志显示区域的内容
        const logContent = logOutput ? logOutput.textContent : '';
        
        if (!logContent.trim()) {
            alert('没有可导出的历史记录');
            return;
        }
        
        // 创建一个Blob对象，使用文本类型
        const blob = new Blob([logContent], { type: 'text/plain' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // 设置文件名，包含用户名和导出时间
        const username = localStorage.getItem('username') || '用户';
        const exportTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/[\/:]/g, '-'); // 替换文件名中的非法字符
        
        a.href = url;
        a.download = `历史记录_${username}_${exportTime}.txt`;
        
        // 模拟点击下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('导出历史记录时出错:', error);
        alert('导出历史记录失败: ' + error.message);
    }
} 

/**
 * 导入历史记录
 */
function handleImportLog() {
    try {
        // 创建文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt'; // 修改为只接受TXT文件
        
        // 监听文件选择事件
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    // 直接读取文件文本内容，不解析JSON
                    const importedText = e.target.result;
                    
                    // 验证导入的内容不为空
                    if (!importedText.trim()) {
                        alert('导入失败：文件内容为空');
                        return;
                    }
                    
                    // 保存到localStorage，并追加到现有内容
                    const username = localStorage.getItem('username');
                    if (!username) {
                        alert('请先登录再导入历史记录');
                        return;
                    }
                    
                    const logKey = `user_log_${username}`;
                    
                    // 获取现有日志
                    let existingLogs = [];
                    const savedLogs = localStorage.getItem(logKey);
                    if (savedLogs) {
                        existingLogs = JSON.parse(savedLogs);
                    }
                    
                    // 创建新的日志条目，将导入的文本作为一条完整记录
                    const importTime = new Date().toLocaleString('zh-CN');
                    const newLogEntry = `
===== 导入记录 =====
导入时间: ${importTime}
导入内容:
${importedText}
===================
`;
                    
                    // 追加到现有日志数组末尾（而不是开头）
                    existingLogs.push(newLogEntry);
                    
                    // 限制日志数量，最多保存50条
                    if (existingLogs.length > 50) {
                        existingLogs = existingLogs.slice(existingLogs.length - 50);
                    }
                    
                    // 保存回localStorage
                    localStorage.setItem(logKey, JSON.stringify(existingLogs));
                    
                    // 重新加载日志显示
                    loadSavedLogs();
                    
                    alert('历史记录导入成功');
                } catch (error) {
                    console.error('导入历史记录时出错:', error);
                    alert('导入失败：文件处理错误');
                }
            };
            reader.readAsText(file);
        });
        
        // 模拟点击文件选择对话框
        fileInput.click();
        
    } catch (error) {
        console.error('导入历史记录时出错:', error);
        alert('导入历史记录失败: ' + error.message);
    }
}

