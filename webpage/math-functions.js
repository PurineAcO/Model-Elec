const mathbtn=document.querySelectorAll('.math-btn');
const input = document.getElementById('functionInput');
const mathButtons=document.querySelectorAll('.math-btn');


document.addEventListener('DOMContentLoaded', mathbtninit)
  
function mathbtninit(){
    mathButtons.forEach(button=>{
        button.addEventListener('click', () => {
            Knowhatbutton(button.id);
        });
    })
}

/**
 * 向函数输入框插入符号
 * @param {string} symbol - 要插入的符号
 */
function insertSymbol(symbol) {
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
        'one':'1',
        'two':'2',
        'three':'3',
        'four':'4',
        'five':'5',
        'six':'6',
        'seven':'7',
        'eight':'8',
        'nine':'9',
        'zero':'0',
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
    }
    if(btntable[buttonid]){
        insertSymbol(btntable[buttonid].trim());
    }
}

