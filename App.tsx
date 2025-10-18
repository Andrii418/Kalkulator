import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Btn = ({ children, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.btn, style]} onPress={onPress}>
    <Text style={[styles.btnText, textStyle]}>{children}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [justCalculated, setJustCalculated] = useState(false);

  const clearAll = () => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setJustCalculated(false);
  };

  const inputDigit = (digit) => {
    if (justCalculated) {
      setCurrent(String(digit));
      setJustCalculated(false);
      return;
    }
    if (current === '0' && digit === '0') return;
    if (current === '0' && digit !== ',' && digit !== '.') {
      setCurrent(String(digit));
      return;
    }
    setCurrent((prev) => prev + String(digit));
  };

  const inputComma = () => {
    if (justCalculated) {
      setCurrent('0,');
      setJustCalculated(false);
      return;
    }
    if (!current.includes(',')) {
      setCurrent(prev => prev + ',');
    }
  };

  const handleOperator = (op) => {
    if (previous === null) {
      setPrevious(current);
      setOperator(op);
      setCurrent('0');
    } else {
      const result = computeResult(previous, current, operator);
      setPrevious(String(result));
      setOperator(op);
      setCurrent('0');
    }
    setJustCalculated(false);
  };

  const computeResult = (aStr, bStr, op) => {
    const a = parseFloat(aStr.replace(',', '.'));
    const b = parseFloat(bStr.replace(',', '.'));
    if (isNaN(a) || isNaN(b)) return 0;
    let r = 0;
    if (op === '+') r = a + b;
    else if (op === '-') r = a - b;
    else if (op === '*') r = a * b;
    else if (op === '/') {
      if (b === 0) return 'Error';
      r = a / b;
    }
    if (typeof r === 'number' && !Number.isInteger(r)) {
      return parseFloat(r.toFixed(10)).toString().replace('.', ',');
    }
    return String(r);
  };

  const pressEqual = () => {
    if (previous === null || operator === null) return;
    const result = computeResult(previous, current, operator);
    setCurrent(String(result));
    setPrevious(null);
    setOperator(null);
    setJustCalculated(true);
  };

  const display = String(current);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.calc}>
        <View style={styles.displayContainer}>
          <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
            {display}
          </Text>
        </View>

        {/* Rząd 1 */}
        <View style={styles.row}>
          <Btn style={styles.btnGray} onPress={clearAll}>AC</Btn>
          <View style={[styles.btn, styles.doubleBtn]} /> {/* */}
          <Btn style={styles.btnOrange} onPress={() => handleOperator('/')}>÷</Btn>
        </View>

        {/* Rząd 2 */}
        <View style={styles.row}>
          <Btn onPress={() => inputDigit('7')}>7</Btn>
          <Btn onPress={() => inputDigit('8')}>8</Btn>
          <Btn onPress={() => inputDigit('9')}>9</Btn>
          <Btn style={styles.btnOrange} onPress={() => handleOperator('*')}>×</Btn>
        </View>

        {/* Rząd 3 */}
        <View style={styles.row}>
          <Btn onPress={() => inputDigit('4')}>4</Btn>
          <Btn onPress={() => inputDigit('5')}>5</Btn>
          <Btn onPress={() => inputDigit('6')}>6</Btn>
          <Btn style={styles.btnOrange} onPress={() => handleOperator('-')}>−</Btn>
        </View>

        {/* Rząd 4 */}
        <View style={styles.row}>
          <Btn onPress={() => inputDigit('1')}>1</Btn>
          <Btn onPress={() => inputDigit('2')}>2</Btn>
          <Btn onPress={() => inputDigit('3')}>3</Btn>
          <Btn style={styles.btnOrange} onPress={() => handleOperator('+')}>+</Btn>
        </View>

        {/* Rząd 5 */}
        <View style={styles.row}>
          <Btn style={styles.btnWide} onPress={() => inputDigit('0')}>0</Btn>
          <Btn onPress={inputComma}>,</Btn>
          <Btn style={styles.btnOrange} onPress={pressEqual}>=</Btn>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2b2b2b', justifyContent: 'center' },
  calc: {
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3a3a3a',
  },
  displayContainer: {
    height: 140,
    backgroundColor: '#4a4a4a',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
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
  doubleBtn: {
    flex: 2.15, // szeroki pusty blok w pierwszym rzędzie
  },
  btnWide: {
    flex: 2.15, // szeroki pusty blok w ostatnim rzędzie
    marginHorizontal: 6,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#6b6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },

});
