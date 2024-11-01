document.getElementById('calculateButton').addEventListener('click', function() {
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

    // Validar y evaluar los límites de integración
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

    // Verificar que los límites sean números
    if (typeof limiteInferior !== 'number' || typeof limiteSuperior !== 'number' || isNaN(limiteInferior) || isNaN(limiteSuperior)) {
        resultText.textContent = 'Los límites de integración deben ser números reales.';
        $('#resultModal').modal('show');
        return;
    }

    // Validar que el límite superior sea mayor o igual al límite inferior
    if (limiteInferior > limiteSuperior) {
        resultText.textContent = 'El límite superior debe ser mayor o igual al límite inferior.';
        $('#resultModal').modal('show');
        return;
    }

    try {
        // Compilar la expresión ingresada por el usuario
        const expr = math.compile(funcionInput);

        // Crear una función que evalúa la expresión para un valor dado de x
        function funcToIntegrate(x) {
            // Verificar si x es un número finito
            if (!isFinite(x)) {
                return 0;
            }
            const scope = { x: x };
            const y = expr.evaluate(scope);

            // Verificar si y es un número válido
            if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
                throw new Error(`La función no es válida en x = ${x}`);
            }
            return y;
        }

        // Realizar la integración numérica usando la regla de Simpson
        const n = 10000; // Número de subdivisiones para mayor precisión
        const resultado = simpsonRule(funcToIntegrate, limiteInferior, limiteSuperior, n);

        resultText.textContent = `El valor de la integral definida es: ${resultado.toFixed(6)}`;

        // Generar los datos para la gráfica y mostrarla en el modal
        plotFunction(funcToIntegrate, limiteInferior, limiteSuperior);

        // Mostrar el modal
        $('#resultModal').modal('show');

    } catch (error) {
        resultText.textContent = 'Hubo un error al evaluar la función. Por favor, verifica la sintaxis y que la función sea válida en el intervalo dado.';
        console.error('Error al evaluar la función:', error);
        $('#resultModal').modal('show');
    }
});

// Función para realizar la integración numérica (Regla de Simpson)
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

// Función para graficar la función y el área bajo la curva
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
            // Si la función no es válida en x, omitimos el punto
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
            // Si la función no es válida en x, asumimos y = 0
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
