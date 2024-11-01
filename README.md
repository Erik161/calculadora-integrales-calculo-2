# Desarrollo de la Lógica del Código de la Calculadora de Integrales Definidas

![image](https://github.com/user-attachments/assets/6a366645-bb8b-4f62-af5c-326576b81c5c)


![image](https://github.com/user-attachments/assets/aae4cbe1-4e67-4056-872a-7e5050a359ce)


## Introducción
Esta documentación detalla el script desarrollado para la calculadora de integrales definidas, explicando la implementación de la lógica del código para lograr una funcionalidad correcta, incluyendo la integración de diferentes tecnologías y bibliotecas para cumplir con los objetivos del proyecto.

## Tecnologías y Herramientas Utilizadas

- **HTML5 y CSS3**: Para la estructura y estilos de la aplicación
- **JavaScript (ES6+)**: Para la lógica y funcionalidad interactiva
- **Bootstrap 4**: Para el diseño responsivo y estilizado de la interfaz
- **Math.js**: Biblioteca de JavaScript para operaciones matemáticas avanzadas
- **Plotly.js**: Biblioteca para generar gráficas interactivas
- **jQuery**: Para manipulación del DOM y manejo de eventos
- **Bootstrap Modal**: Para mostrar el resultado y la gráfica en una ventana emergente

## Estructura del Código

### Archivos Principales

El proyecto se compone de tres archivos principales:

1. **index.html**: Contiene la estructura HTML de la página
2. **styles.css**: Contiene los estilos CSS personalizados
3. **main.js**: Contiene la lógica en JavaScript de la aplicación

### 1. Archivo index.html

En el archivo index.html, la página está estructurada usando clases de Bootstrap para crear una interfaz limpia y responsiva. Los elementos principales incluyen:

- **Formulario de Entrada**: 
  ```html
  <div class="form-group">
    <input>
    <label>
  </div>
  ```
  Para los campos de función y límites de integración

- **Botón de Cálculo**: 
  ```html
  <button class="btn btn-primary btn-block">
  ```

- **Modal de Resultado**: 
  ```html
  <div class="modal">
  ```
  Contiene el resultado y la gráfica

Además, incluye referencias a bibliotecas externas vía CDN:
- Bootstrap
- jQuery
- Math.js
- Plotly.js

### 2. Archivo styles.css

En styles.css, se realizaron ajustes mínimos:
- La mayoría de los estilos son manejados por Bootstrap
- Personalización para correcta visualización de gráficas en el modal
- Ajustes para mantener coherencia en la interfaz

### 3. Archivo main.js

#### Captura de Eventos del Botón de Cálculo
```javascript
document.getElementById('calculateButton').addEventListener('click', function() {
    // Lógica a ejecutar cuando se hace clic en el botón
});
```

#### Obtención y Validación de Entradas del Usuario
```javascript
const funcionInput = document.getElementById('functionInput').value.trim();
const limiteInferiorInput = document.getElementById('lowerLimit').value.trim();
const limiteSuperiorInput = document.getElementById('upperLimit').value.trim();
const resultText = document.getElementById('resultText');
const graphDiv = document.getElementById('graph');

// Limpiar resultados anteriores
resultText.textContent = '';
graphDiv.innerHTML = '';

// Validación de entradas
if (!funcionInput || !limiteInferiorInput || !limiteSuperiorInput) {
    resultText.textContent = 'Por favor, completa todos los campos.';
    $('#resultModal').modal('show');
    return;
}
```

#### Evaluación y Validación de los Límites de Integración
```javascript
let limiteInferior, limiteSuperior;
try {
    limiteInferior = math.evaluate(limiteInferiorInput);
    limiteSuperior = math.evaluate(limiteSuperiorInput);
    if (!isFinite(limiteInferior) || !isFinite(limiteSuperior)) {
        throw new Error('Los límites de integración deben ser números finitos.');
    }
} catch (error) {
    resultText.textContent = 'Error en los límites de integración. Por favor, ingresa valores numéricos válidos.';
    $('#resultModal').modal('show');
    return;
}
```

#### Validación de la Relación entre los Límites
```javascript
if (limiteInferior > limiteSuperior) {
    resultText.textContent = 'El límite superior debe ser mayor o igual al límite inferior.';
    $('#resultModal').modal('show');
    return;
}
```

#### Compilación y Evaluación de la Función Ingresada
```javascript
try {
    // Compilar la expresión ingresada por el usuario
    const expr = math.compile(funcionInput);
    
    // Crear una función que evalúa la expresión para un valor dado de x
    function funcToIntegrate(x) {
        if (!isFinite(x)) {
            return 0;
        }
        const scope = { x: x };
        const y = expr.evaluate(scope);
        if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
            throw new Error(`La función no es válida en x = ${x}`);
        }
        return y;
    }
} catch (error) {
    resultText.textContent = 'Hubo un error al evaluar la función. Por favor, verifica la sintaxis y que la función sea válida en el intervalo dado.';
    $('#resultModal').modal('show');
    return;
}
```

#### Cálculo de la Integral Utilizando la Regla de Simpson
```javascript
// Realizar la integración numérica usando la regla de Simpson
const n = 10000; // Número de subdivisiones para mayor precisión
const resultado = simpsonRule(funcToIntegrate, limiteInferior, limiteSuperior, n);
resultText.textContent = `El valor de la integral definida es: ${resultado.toFixed(6)}`;

// Generar los datos para la gráfica y mostrarla en el modal
plotFunction(funcToIntegrate, limiteInferior, limiteSuperior);

// Mostrar el modal
$('#resultModal').modal('show');
```

#### Implementación de la Regla de Simpson
```javascript
function simpsonRule(f, a, b, n) {
    if (n % 2 !== 0) n++; // n debe ser par para la regla de Simpson
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    
    for (let i = 1; i < n; i++) {
        const x = a + h * i;
        sum += (i % 2 === 0 ? 2 : 4) * f(x);
    }
    
    return (h / 3) * sum;
}
```

#### Generación de la Gráfica con Plotly.js
```javascript
function plotFunction(f, a, b) {
    const xValues = [];
    const yValues = [];
    const xArea = [];
    const yArea = [];
    
    // Generar puntos para la gráfica
    const numPoints = 1000;
    const xMin = a - (b - a) * 0.5;
    const xMax = b + (b - a) * 0.5;
    const step = (xMax - xMin) / numPoints;
    
    for (let x = xMin; x <= xMax; x += step) {
        try {
            const y = f(x);
            xValues.push(x);
            yValues.push(y);
        } catch (error) {
            continue;
        }
    }
    
    // Datos para el área bajo la curva
    for (let x = a; x <= b; x += step) {
        try {
            const y = f(x);
            xArea.push(x);
            yArea.push(y);
        } catch (error) {
            xArea.push(x);
            yArea.push(0);
        }
    }
    
    // Trazado de la función
    const trace1 = {
        x: xValues,
        y: yValues,
        mode: 'lines',
        name: 'Función f(x)',
        line: { color: 'blue' }
    };
    
    // Trazado del área bajo la curva
    const trace2 = {
        x: xArea.concat([b, a]),
        y: yArea.concat([0, 0]),
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 123, 255, 0.5)',
        line: { color: 'transparent' },
        name: 'Área bajo la curva'
    };
    
    const layout = {
        title: 'Gráfica de la función y área bajo la curva',
        xaxis: { title: 'x' },
        yaxis: { title: 'f(x)' },
        autosize: true,
        responsive: true
    };
    
    Plotly.newPlot('graph', [trace1, trace2], layout, {responsive: true});
}
```

## Manejo de Errores y Mensajes al Usuario

A lo largo del código, se implementa un robusto sistema de manejo de errores mediante:
- Bloques try-catch
- Validaciones específicas
- Mensajes de error claros y descriptivos
- Retroalimentación visual mediante el modal

## Conclusión

La calculadora de integrales definidas desarrollada ofrece:

1. **Flexibilidad de Entrada**
   - Ingreso de funciones y límites de manera intuitiva
   - Soporte para expresiones matemáticas complejas

2. **Precisión en Cálculos**
   - Implementación de la Regla de Simpson
   - Alta precisión numérica

3. **Visualización Interactiva**
   - Gráfica de la función
   - Representación visual del área bajo la curva

4. **Interfaz Usuario**
   - Diseño responsivo
   - Experiencia de usuario intuitiva
   - Retroalimentación clara

Esta implementación proporciona una herramienta robusta y útil en el ámbito de la Ingeniería en Sistemas.
