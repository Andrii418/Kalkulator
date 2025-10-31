// App.js (zamień cały plik)
import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import CalcButton from './src/components/CalcButton';
import { portraitRows, landscapeRows } from './src/data/buttons';
import SplashScreen from './src/screens/SplashScreen';

const MARGIN = 4;
const BTN_RADIUS = 6;
const LANDSCAPE_DISPLAY_HEIGHT = 90;

// funkcje pomocnicze
const toLocaleString = (numStr) => {
    if (numStr === 'Error' || typeof numStr !== 'string') return numStr;
    if (numStr === '') return '';
    return numStr.replace('.', ',');
};

const parseFloatWithComma = (numStr) => {
    if (typeof numStr === 'string') {
        if (numStr === '') return 0;
        return parseFloat(numStr.replace(',', '.'));
    }
    return parseFloat(numStr);
};

// logika Kalkulatora
const useCalculatorLogic = (isPortraitMode) => {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [justCalculated, setJustCalculated] = useState(false);
  const [lastOperation, setLastOperation] = useState('');
  const [isRad, setIsRad] = useState(true);
  const [mem, setMem] = useState(0);

  const clearAll = () => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setJustCalculated(false);
    setLastOperation('');
  };

  const memClear = () => setMem(0);
  const memPlus = () => setMem(prev => prev + parseFloatWithComma(current));
  const memMinus = () => setMem(prev => prev - parseFloatWithComma(current));
  const memRecall = () => {
    setCurrent(toLocaleString(String(mem)));
    setJustCalculated(true);
    setLastOperation('');
  };

  const inputDigit = useCallback((digit) => {
    if (justCalculated || current === 'Error') {
      setCurrent(String(digit));
      setJustCalculated(false);
      setLastOperation('');
      return;
    }

    if (current === '') {
        if (digit === '0') {
            setCurrent('0');
        } else {
            setCurrent(String(digit));
        }
        return;
    }

    if (current === '0' && digit === '0') return;
    if (current === '0' && digit !== ',') {
      setCurrent(String(digit));
      return;
    }

    setCurrent((prev) => prev.length < 15 ? prev + String(digit) : prev);

  }, [current, justCalculated]);

  const inputComma = useCallback(() => {
    if (justCalculated || current === 'Error') {
      setCurrent('0,');
      setJustCalculated(false);
      setLastOperation('');
      return;
    }

    if (current === '') {
        setCurrent('0,');
        return;
    }
    if (!current.includes(',')) {
      setCurrent(prev => prev + ',');
    }
  }, [current, justCalculated]);

  const toggleSign = useCallback(() => {
    if (current === '') return;
    const num = parseFloatWithComma(current);
    if (num === 0) return;
    setCurrent(toLocaleString(String(-num)));
    setLastOperation('');
  }, [current]);

  const percent = useCallback(() => {
    if (current === '') return;
    const num = parseFloatWithComma(current);
    setCurrent(toLocaleString(String(num / 100)));
    setJustCalculated(true);
    setLastOperation('');
  }, [current]);

  const computeResult = (aStr, bStr, op) => {
    const a = parseFloat(aStr.replace(',', '.'));
    const b = parseFloatWithComma(bStr);

    if (isNaN(a) || isNaN(b)) return isPortraitMode ? 0 : 'Error';
    let r = 0;

    const opMap = { '+': 'plus', '−': 'minus', '×': 'times', '÷': 'divide', '*': 'times', '/': 'divide', 'xʸ': 'pow', 'y√x': 'root' };
    const actualOp = opMap[op] || op;

    if (actualOp === 'plus') r = a + b;
    else if (actualOp === 'minus') r = a - b;
    else if (actualOp === 'times') r = a * b;
    else if (actualOp === 'divide') {
      if (b === 0) return 'Error';
      r = a / b;
    }
    else if (actualOp === 'pow') r = Math.pow(a, b);
    else if (actualOp === 'root') r = Math.pow(b, 1/a);

    if (typeof r === 'number' && !Number.isInteger(r)) {
      const resultString = parseFloat(r.toFixed(10)).toString();
      return isPortraitMode ? resultString.replace('.', ',') : resultString;
    }
    return String(r);
  };

  const handleOperator = useCallback((op) => {
    if (current === 'Error') return;

    const actualOp = isPortraitMode && op === '×' ? '*' : isPortraitMode && op === '÷' ? '/' : op;
    const nextCurrentValue = '';

    if (previous === null || justCalculated) {
      setPrevious(current === '' ? '0' : current);
      setOperator(actualOp);
      setCurrent(nextCurrentValue);
      setJustCalculated(false);
      setLastOperation('');
    } else {
      const result = computeResult(previous, current, operator);
      if (result === 'Error') {
        clearAll();
        setCurrent('Error');
        return;
      }
      setPrevious(result);
      setOperator(actualOp);
      setCurrent(nextCurrentValue);
      setJustCalculated(false);
      setLastOperation('');
    }
  }, [current, previous, operator, justCalculated]);

  const pressEqual = useCallback(() => {
    if (previous === null || operator === null || current === 'Error') return;

    const secondOperand = current === '' ? previous : current;

    const result = computeResult(previous, secondOperand, operator);

    if (result === 'Error') {
        clearAll();
        setCurrent('Error');
        return;
    }

    const fullOperationString = `${toLocaleString(String(previous))} ${operator} ${toLocaleString(String(secondOperand))} =`;
    setLastOperation(fullOperationString);

    setCurrent(String(result));
    setPrevious(null);
    setOperator(null);
    setJustCalculated(true);
  }, [current, previous, operator]);

  const handleScientificOp = useCallback((op) => {
    if (current === 'Error' || (current === '' && op !== 'π' && op !== 'e' && op !== 'Rand')) return;

    let num = parseFloatWithComma(current);
    let result = num;
    const angle = isRad ? num : num * (Math.PI / 180);

    switch (op) {
      case 'x²': result = num * num; break;
      case 'x³': result = num * num * num; break;
      case '1/x': result = 1 / num; break;
      case '√x': result = Math.sqrt(num); break;
      case '³√x': result = Math.cbrt(num); break;
      case 'eˣ': result = Math.exp(num); break;
      case '10ˣ': result = Math.pow(10, num); break;
      case 'ln': result = Math.log(num); break;
      case 'log₁₀': result = Math.log10(num); break;
      case 'sin': result = Math.sin(angle); break;
      case 'cos': result = Math.cos(angle); break;
      case 'tan': result = Math.tan(angle); break;
      case 'sinh': result = Math.sinh(num); break;
      case 'cosh': result = Math.cosh(num); break;
      case 'tanh': result = Math.tanh(num); break;
      case 'x!':
        if (num < 0 || num % 1 !== 0) { result = 'Error'; }
        else {
          let fact = 1;
          for(let i = 2; i <= num; i++) fact *= i;
          result = fact;
        }
        break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'Rand': result = Math.random(); break;
      default: return;
    }

    if (result === 'Error' || isNaN(result) || result === Infinity) {
      clearAll();
      setCurrent('Error');
      return;
    }

    setCurrent(toLocaleString(String(result)));
    setJustCalculated(true);
    setLastOperation('');
  }, [current, isRad, isPortraitMode]);

  const getOperationDisplay = () => {
    let operationDisplay = '';

    if (lastOperation !== '') {
        operationDisplay = lastOperation;
    } else if (previous !== null && operator !== null && !justCalculated) {
        operationDisplay = `${toLocaleString(String(previous))} ${operator}`;
    }
    return operationDisplay;
  };

  return {
    display: String(current),
    operationDisplay: getOperationDisplay(),
    previous,
    operator,
    lastOperation,
    justCalculated,
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

// Portrait view (mapujemy po portraitRows)
const PortraitView = ({ logic }) => {
    const { display, clearAll, inputDigit, inputComma, handleOperator, pressEqual, toggleSign, percent, operationDisplay } = logic;

    const displayedValue = toLocaleString(display);
    const renderCurrentValue = displayedValue === '' ? ' ' : displayedValue;

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
                    {operationDisplay}
                </Text>

                <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
                    {renderCurrentValue}
                </Text>
            </View>

            {/* mapujemy rzędy */}
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

// Landscape view (mapujemy po landscapeRows)
const LandscapeView = ({ logic }) => {
    const { display, operationDisplay, clearAll, inputDigit, inputComma, toggleSign, percent, handleOperator, pressEqual, handleScientificOp, handleScientificBinaryOp, isRad, setIsRad, memClear, memPlus, memMinus, memRecall } = logic;

    const renderedDisplay = toLocaleString(display) === '' ? ' ' : toLocaleString(display);
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

// App root
export default function App() {
  // --- WSZYSTKIE HOOKI NAJPIERW (MUSZĄ BYĆ ZAWSZE W TEJ SAMEJ KOLEJNOŚCI) ---
  const [orientation, setOrientation] = useState(Dimensions.get('window').width > Dimensions.get('window').height ? 'LANDSCAPE' : 'PORTRAIT');
  const [isLoading, setIsLoading] = useState(true);

  const isLandscape = orientation === 'LANDSCAPE';
  // !!! TO JEST KLUCZOWE: useCalculatorLogic musi być wywołane przed jakimkolwiek wczesnym return.
  const logic = useCalculatorLogic(!isLandscape);

  // Logika ukrywania Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Logika zmiany orientacji
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
    };

    const subscription = Dimensions.addEventListener('change', updateOrientation);
    updateOrientation();
    return () => subscription?.remove?.();
  }, []);

  // --- Wczesne wyjście (Early Return) dla Splash Screen ---
  if (isLoading) {
      return <SplashScreen />;
    }

  // --- Normalny render kalkulatora ---
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

  // style dla portrait
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

  // style landscape
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

  // kolory naukowych przyciskow
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