// DOM 元素
const connectionStatus = document.getElementById('connection-status');
const voltageInput = document.getElementById('voltage-input');
const connectBtn = document.getElementById('connect-btn');
const sendBtn = document.getElementById('send-btn');
const logOutput = document.getElementById('log-output');

// 蓝牙相关变量
let bluetoothDevice = null;
let gattServer = null;
let characteristic = null;

// 设备服务和特征UUID（这些需要根据您的实际设备修改）
const SERVICE_UUID = '00001800-0000-1000-8000-00805f9b34fb'; // 示例UUID，需要替换为实际服务UUID
const CHARACTERISTIC_UUID = '00002a00-0000-1000-8000-00805f9b34fb'; // 示例UUID，需要替换为实际特征UUID

// 添加日志
function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${timestamp}] ${message}`;
    logOutput.appendChild(logEntry);
    logOutput.scrollTop = logOutput.scrollHeight;
}

// 更新连接状态
function updateConnectionStatus(isConnected) {
    if (isConnected) {
        connectionStatus.textContent = '已连接';
        connectionStatus.className = 'status-connected';
        connectBtn.textContent = '断开连接';
        sendBtn.disabled = false;
    } else {
        connectionStatus.textContent = '未连接';
        connectionStatus.className = 'status-disconnected';
        connectBtn.textContent = '连接电源';
        sendBtn.disabled = true;
        bluetoothDevice = null;
        gattServer = null;
        characteristic = null;
    }
}

// 连接到蓝牙设备
async function connectToDevice() {
    try {
        addLog('开始搜索蓝牙设备...');
        
        // 请求用户选择蓝牙设备
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [
                { services: [SERVICE_UUID] }
            ],
            optionalServices: [SERVICE_UUID]
        });
        
        addLog(`已选择设备: ${bluetoothDevice.name || '未知设备'}`);
        
        // 添加设备断开连接的监听器
        bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
        
        // 连接到GATT服务器
        gattServer = await bluetoothDevice.gatt.connect();
        addLog('已连接到GATT服务器');
        
        // 获取服务
        const service = await gattServer.getPrimaryService(SERVICE_UUID);
        addLog('已获取服务');
        
        // 获取特征
        characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
        addLog('已获取特征');
        
        // 更新UI状态
        updateConnectionStatus(true);
        
    } catch (error) {
        addLog(`连接失败: ${error.message}`);
        console.error('蓝牙连接错误:', error);
        updateConnectionStatus(false);
    }
}

// 断开连接
async function disconnectFromDevice() {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
        await bluetoothDevice.gatt.disconnect();
        addLog('已断开连接');
    }
    updateConnectionStatus(false);
}

// 设备断开连接回调
function onDisconnected(event) {
    const device = event.target;
    addLog(`设备 ${device.name || '未知设备'} 已断开连接`);
    updateConnectionStatus(false);
}

// 发送电压值到设备
async function sendVoltage() {
    if (!characteristic) {
        addLog('请先连接设备');
        return;
    }
    
    try {
        const voltage = parseFloat(voltageInput.value);
        
        // 验证电压值
        if (isNaN(voltage) || voltage < 0 || voltage > 30) {
            addLog('请输入有效的电压值 (0-30V)');
            return;
        }
        
        addLog(`正在发送电压值: ${voltage}V`);
        
        // 将电压值转换为适合发送的数据格式
        // 这里的实现需要根据您的设备通信协议进行调整
        // 示例：将电压值乘以10并转换为一个字节 (假设设备使用0-300的整数表示0-30V)
        const voltageData = Math.round(voltage * 10);
        const data = new Uint8Array([voltageData]);
        
        // 写入数据到特征
        await characteristic.writeValue(data);
        addLog(`电压值 ${voltage}V 发送成功`);
        
    } catch (error) {
        addLog(`发送失败: ${error.message}`);
        console.error('发送数据错误:', error);
    }
}

// 事件监听器
connectBtn.addEventListener('click', () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
        disconnectFromDevice();
    } else {
        connectToDevice();
    }
});

sendBtn.addEventListener('click', sendVoltage);

// 初始化
function init() {
    addLog('控制器已初始化');
    
    // 检查浏览器是否支持Web Bluetooth API
    if (!navigator.bluetooth) {
        addLog('您的浏览器不支持Web Bluetooth API');
        connectBtn.disabled = true;
        alert('您的浏览器不支持Web Bluetooth API，请使用Chrome或Edge浏览器');
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);