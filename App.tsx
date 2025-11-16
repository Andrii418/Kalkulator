import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import CalcButton from './src/components/CalcButton';
import { portraitRows, landscapeRows } from './src/data/buttons';
import SplashScreen from './src/screens/SplashScreen';

const MARGIN = 4;
const BTN_RADIUS = 6;
const LANDSCAPE_DISPLAY_HEIGHT = 90;

const toLocaleString = (numStr) => {
    if (numStr === 'Error' || typeof numStr !== 'string') return numStr;
    if (numStr === '') return '';
    return numStr.replace('.', ',');
};

const toJSToString = (numStr) => {
    if (numStr === 'Error' || typeof numStr !== 'string') return numStr;
    if (numStr === '') return '';
    return numStr.replace(',', '.');
};

const parseFloatWithComma = (numStr) => {
    if (typeof numStr === 'string') {
        if (numStr === '') return 0;
        return parseFloat(numStr.replace(',', '.'));
    }
    return parseFloat(numStr);
};

const useCalculatorLogic = (isPortraitMode) => {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [lastOperation, setLastOperation] = useState('');
  const [isRad, setIsRad] = useState(true);
  const [mem, setMem] = useState(0);

  const isLastCharOperator = (exp) => {
    if (exp.length === 0) return false;
    const lastChar = exp.slice(-1);
    return ['+', '-', '*', '/'].includes(lastChar);
  };

  const getLastNumber = (exp) => {
    const parts = exp.split(/([+\-*/])/).pop();
    return parts ? parts.trim() : '';
  };

  const clearAll = () => {
    setExpression('');
    setDisplay('0');
    setLastOperation('');
  };

  const memClear = () => setMem(0);
  const memPlus = () => setMem(prev => prev + parseFloatWithComma(display));
  const memMinus = () => setMem(prev => prev - parseFloatWithComma(display));
  const memRecall = () => {
    const memStr = toLocaleString(String(mem));
    setExpression(prev => {
        const lastNum = getLastNumber(prev);
        if (lastNum) {
            return prev.substring(0, prev.length - lastNum.length) + memStr;
        }
        return memStr;
    });
    setDisplay(memStr);
    setLastOperation('');
  };

  const inputDigit = useCallback((digit) => {
    setExpression(prev => {
        const lastNum = getLastNumber(prev);

        if (prev === '0' || prev === 'Error') {
            return String(digit);
        }

        if (isLastCharOperator(prev)) {
            return prev + String(digit);
        }

        if (lastNum.length >= 15 && !isPortraitMode) return prev;

        if (lastNum === '0' && digit === '0') return prev;
        if (lastNum === '0' && digit !== '0') {
            return prev.substring(0, prev.length - 1) + String(digit);
        }

        return prev + String(digit);
    });
  }, [isPortraitMode]);

  const inputComma = useCallback(() => {
    setExpression(prev => {
        if (prev === 'Error') return '0,';

        const lastNum = getLastNumber(prev);

        if (prev === '' || isLastCharOperator(prev)) {
            return prev + '0,';
        }

        if (!lastNum.includes(',')) {
            return prev + ',';
        }
        return prev;
    });
  }, []);

  const toggleSign = useCallback(() => {
    setExpression(prev => {
      if (prev === 'Error' || prev === '' || isLastCharOperator(prev)) return prev;

      const parts = prev.split(/([+\-*/])/);
      const lastPart = parts.pop().trim();

      if (lastPart) {
          const num = parseFloatWithComma(lastPart);
          if (num === 0) return prev;

          const newNum = toLocaleString(String(-num));

          return prev.substring(0, prev.length - lastPart.length) + newNum;
      }
      return prev;
    });
  }, []);

  const percent = useCallback(() => {
    setExpression(prev => {
      if (prev === 'Error' || prev === '' || isLastCharOperator(prev)) return prev;

      const lastPart = getLastNumber(prev);

      if (lastPart) {
          const num = parseFloatWithComma(lastPart);

          const newNum = toLocaleString(String(num / 100));

          return prev.substring(0, prev.length - lastPart.length) + newNum;
      }
      return prev;
    });
  }, []);

  const handleOperator = useCallback((op) => {
    setExpression(prev => {
      if (prev === 'Error') return '';

      const actualOp = op === '×' ? '*' : op === '÷' ? '/' : op;

      if (isLastCharOperator(prev)) {
        return prev.substring(0, prev.length - 1) + actualOp;
      }

      if (prev === '') {
        return '0' + actualOp;
      }

      return prev + actualOp;
    });
  }, []);

  const pressEqual = useCallback(() => {
      if (expression === '' || expression === 'Error') {
          setDisplay('0');
          setLastOperation('');
          return;
      }

      let finalExpression = expression;
      if (isLastCharOperator(finalExpression)) {
        finalExpression = finalExpression.substring(0, finalExpression.length - 1);
      }

      const expressionForEval = toJSToString(finalExpression)
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/,/g, '.');

      try {
          if (!/^[0-9+\-*/().,]+$/.test(expressionForEval)) {
              throw new Error('Niedozwolone znaki.');
          }

          let result = String(eval(expressionForEval));

          if (result === 'Infinity' || result === 'NaN') {
              throw new Error('Błąd dzielenia przez zero lub nieprawidłowe działanie.');
          }

          const formattedResult = toLocaleString(result);

          setLastOperation(`${toLocaleString(finalExpression)} =`);
          setDisplay(formattedResult);
          setExpression(formattedResult);

      } catch (e) {
          setDisplay('Error');
          setExpression('Error');
          setLastOperation(`${toLocaleString(finalExpression)} =`);
      }
  }, [expression]);


  const handleScientificOp = useCallback((op) => {
    if (expression === 'Error') return;

    let num = parseFloatWithComma(display);
    let result = num;
    const angle = isRad ? num : num * (Math.PI / 180);

    switch (op) {
      case 'x²': result = num * num; break;
      case '1/x': result = 1 / num; break;
      case '√x': result = Math.sqrt(num); break;
      case 'sin': result = Math.sin(angle); break;
      case 'cos': result = Math.cos(angle); break;
      case 'tan': result = Math.tan(angle); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'Rand': result = Math.random(); break;
      default: return;
    }

    if (isNaN(result) || result === Infinity) {
      clearAll();
      setDisplay('Error');
      setExpression('Error');
      return;
    }

    const formattedResult = toLocaleString(String(result));

    setExpression(prev => {
        const lastNum = getLastNumber(prev);
        if (lastNum) {
             return prev.substring(0, prev.length - lastNum.length) + formattedResult;
        }
        return formattedResult;
    });
    setDisplay(formattedResult);
    setLastOperation('');
  }, [display, isRad]);

  useEffect(() => {
    if (expression === '') {
        setDisplay('0');
        return;
    }
    if (expression === 'Error') {
        setDisplay('Error');
        return;
    }

    const lastNum = getLastNumber(expression);

    if (isLastCharOperator(expression)) {
        setDisplay(expression.slice(-1));
        return;
    }

    setDisplay(lastNum || '0');
  }, [expression]);


  return {
    display: display,
    operationDisplay: expression === 'Error' ? lastOperation : expression,
    clearAll,
    inputDigit,
    inputComma,
    toggleSign,
    percent,
    handleOperator,
    pressEqual,
    handleScientificOp,
    handleScientificBinaryOp: (op) => handleOperator(op),
    isRad,
    setIsRad,
    memClear,
    memPlus,
    memMinus,
    memRecall,
  };
};

const PortraitView = ({ logic }) => {
    const { display, clearAll, inputDigit, inputComma, handleOperator, pressEqual, toggleSign, percent, operationDisplay } = logic;

    const renderedExpression = operationDisplay;
    const renderCurrentValue = display === '' || display.length > 15 ? toLocaleString(display) : display;

    const handleAction = (action) => {
      if (!action) return () => {};
      switch (action.kind) {
        case 'digit': return () => inputDigit(action.value);
        case 'comma': return () => inputComma();
        case 'clear': return () => clearAll();
        case 'toggleSign': return () => toggleSign();
        case 'percent': return () => percent();
        case 'operator': return () => handleOperator(action.value);
        case 'equal': return () => pressEqual();
        default: return () => {};
      }
    };

    return (
        <View style={styles.calc}>
            <View style={styles.displayContainer}>
                <Text
                    style={styles.operationText}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                >
                    {renderedExpression}
                </Text>

                <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
                    {renderCurrentValue}
                </Text>
            </View>

            {portraitRows.map((row, rowIdx) => (
              <View style={styles.row} key={`prow-${rowIdx}`}>
                {row.map((btn, idx) => (
                  <CalcButton
                    key={`pbtn-${rowIdx}-${idx}`}
                    text={btn.text}
                    onPress={handleAction(btn.action)}
                    containerStyle={btn.style}
                  />
                ))}
              </View>
            ))}
        </View>
    );
};

const LandscapeView = ({ logic }) => {
    const { display, operationDisplay, clearAll, inputDigit, inputComma, toggleSign, percent, handleOperator, pressEqual, handleScientificOp, isRad, setIsRad, memClear, memPlus, memMinus, memRecall } = logic;

    const renderedDisplay = display === '' ? ' ' : display;
    const angleMode = isRad ? 'Rad' : 'Deg';

    const handleAction = (action) => {
      if (!action) return () => {};
      switch (action.kind) {
        case 'digit': return () => inputDigit(action.value);
        case 'comma': return () => inputComma();
        case 'clear': return () => clearAll();
        case 'toggleSign': return () => toggleSign();
        case 'percent': return () => percent();
        case 'operator': return () => handleOperator(action.value);
        case 'equal': return () => pressEqual();
        case 'sci': return () => handleScientificOp(action.value);
        case 'memClear': return () => memClear();
        case 'memPlus': return () => memPlus();
        case 'memMinus': return () => memMinus();
        case 'memRecall': return () => memRecall();
        case 'toggleRad': return () => setIsRad(prev => !prev);
        case 'noop': return () => {};
        default: return () => {};
      }
    };

    return (
        <View style={styles.landscapeCalc}>
            <View style={styles.displayContainerLandscape}>
                <Text
                    style={styles.operationTextLandscape}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                >
                    {operationDisplay}
                </Text>

                <Text style={styles.displayTextLandscape} numberOfLines={1} adjustsFontSizeToFit>
                    {renderedDisplay}
                </Text>
            </View>

            {landscapeRows.map((row, rIdx) => (
              <View style={styles.rowLandscape} key={`lrow-${rIdx}`}>
                {row.map((btn, i) => (
                  <CalcButton
                    key={`lbtn-${rIdx}-${i}`}
                    text={btn.text === 'Rad' ? angleMode : btn.text}
                    onPress={handleAction(btn.action)}
                    containerStyle={[btn.style, { height: 55 }]}
                    textStyle={styles.btnTextLandscape}
                  />
                ))}
              </View>
            ))}

        </View>
    );
};

export default function App() {
  const [orientation, setOrientation] = useState(Dimensions.get('window').width > Dimensions.get('window').height ? 'LANDSCAPE' : 'PORTRAIT');
  const [isLoading, setIsLoading] = useState(true);

  const isLandscape = orientation === 'LANDSCAPE';
  const logic = useCalculatorLogic(!isLandscape);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
    };

    const subscription = Dimensions.addEventListener('change', updateOrientation);
    updateOrientation();
    return () => subscription?.remove?.();
  }, []);

  if (isLoading) {
      return <SplashScreen />;
    }

  return (
    <SafeAreaView style={[styles.container, isLandscape ? styles.containerLandscape : null]}>
        <StatusBar barStyle="light-content" />
        {isLandscape ? <LandscapeView logic={logic} /> : <PortraitView logic={logic} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2b2b',
    justifyContent: 'center',
  },
  btnBase: {
    margin: MARGIN,
    borderRadius: BTN_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },

  calc: {
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3a3a3a',
  },
  displayContainer: {
    height: 160,
    backgroundColor: '#4a4a4a',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
    paddingTop: 5,
  },
  operationText: {
    color: '#bbbbbb',
    fontSize: 20,
    fontWeight: '300',
    marginBottom: 5,
    alignSelf: 'flex-end',
  },
  displayText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    height: 72,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#6b6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 28,
    color: '#fff',
  },
  btnGray: {
    backgroundColor: '#9b9b9b',
  },
  btnOrange: {
    backgroundColor: '#ff9f1c',
  },
  btnWide: {
    flex: 2.15,
    marginHorizontal: 6,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#6b6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  containerLandscape: {
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  landscapeCalc: {
    width: '100%',
    backgroundColor: '#2b2b2b',
  },
  displayContainerLandscape: {
    height: LANDSCAPE_DISPLAY_HEIGHT,
    backgroundColor: '#2b2b2b',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  operationTextLandscape: {
    color: '#bbbbbb',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 3,
    alignSelf: 'flex-end',
  },
  displayTextLandscape: {
    color: '#ffffff',
    fontSize: 50,
    fontWeight: '200',
  },
  btnTextLandscape: {
    fontSize: 16,
    color: '#fff',
  },
  rowLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  btnSci: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    height: 55,
  },

  btnNum: {
    flex: 1.15,
    backgroundColor: '#6b6b6b',
    height: 55,
  },

  btnLightGrayLandscape: {
    flex: 1.15,
    backgroundColor: '#3a3a3a',
  },
  btnOrangeLandscape: {
    flex: 1.15,
    backgroundColor: '#ff9f1c',
  },

  btnRadActive: {
    flex: 1,
    backgroundColor: '#3a3a3a',
  },
  btnZeroLandscape: {
    flex: 2,
    alignItems: 'flex-start',
    paddingLeft: 25,
    backgroundColor: '#6b6b6b',
  },
});