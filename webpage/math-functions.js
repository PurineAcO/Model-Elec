// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取函数输入框元素
  const functionInput = document.getElementById('function-input');
  
  // 如果找不到输入框，可以尝试使用querySelector或其他选择器
  if (!functionInput) {
    console.error('未找到函数输入框元素');
    return;
  }
  
  // 为所有数学函数按钮添加点击事件
  const mathButtons = document.querySelectorAll('.math-btn');
  mathButtons.forEach(button => {
    button.addEventListener('click', function() {
      insertMathSymbol(this.textContent.trim());
    });
  });
  
  // 为括号按钮添加特殊处理
  const bracketButton = document.querySelector('.math-btn[data-symbol="()"]');
  if (bracketButton) {
    bracketButton.addEventListener('click', insertBrackets);
  }
});

/**
 * 向函数输入框插入数学符号
 * @param {string} symbol - 要插入的数学符号
 */
function insertMathSymbol(symbol) {
  const input = document.getElementById('function-input');
  if (!input) return;
  
  // 获取当前光标位置
  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  const currentValue = input.value;
  
  // 插入符号到光标位置
  input.value = currentValue.substring(0, startPos) + symbol + currentValue.substring(endPos);
  
  // 重新聚焦并设置光标位置
  input.focus();
  input.selectionStart = input.selectionEnd = startPos + symbol.length;
  
  // 触发输入事件，确保相关逻辑被执行
  input.dispatchEvent(new Event('input'));
}

/**
 * 插入括号并将光标放在括号中间
 */
function insertBrackets() {
  const input = document.getElementById('function-input');
  if (!input) return;
  
  const startPos = input.selectionStart;
  const endPos = input.selectionEnd;
  const currentValue = input.value;
  
  // 插入括号
  input.value = currentValue.substring(0, startPos) + '()' + currentValue.substring(endPos);
  
  // 将光标放在括号中间
  input.focus();
  input.selectionStart = input.selectionEnd = startPos + 1;
  
  input.dispatchEvent(new Event('input'));
}