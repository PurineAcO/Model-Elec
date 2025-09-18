const mathButtons=document.querySelectorAll('.math-btn');

let realinput=functionInput;

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
        "tan":'tan',
    }
    // if(btntable[buttonid] && realinput==functionInput){
    //     insertSymbol(btntable[buttonid].trim(),realinput);
    // }
    // else if (btntable[buttonid] && buttonid!='t' && realinput==startTimeInput){
    //     insertSymbol(btntable[buttonid].trim(),realinput);
    // }
    // else if (btntable[buttonid] && buttonid!='t' && realinput==endTimeInput){
    //     insertSymbol(btntable[buttonid].trim(),realinput);
    // }
    // else if (btntable[buttonid] && buttonid!='t' && realinput==stepInput){
    //     insertSymbol(btntable[buttonid].trim(),realinput);
    // }
    // else if (btntable[buttonid] && buttonid!='t' && realinput==loopCountInput){
    //     insertSymbol(btntable[buttonid].trim(),realinput);
    // }

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