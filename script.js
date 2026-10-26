/* ===== NAVEGACION ===== */
const enlaces = document.querySelectorAll(".enlace");
const secciones = document.querySelectorAll(".seccion");

enlaces.forEach(function (boton) {
  boton.addEventListener("click", function () {
    const destino = boton.dataset.target;

    enlaces.forEach(function (e) { e.classList.remove("activo"); });
    secciones.forEach(function (s) { s.classList.remove("visible"); });

    boton.classList.add("activo");
    document.getElementById(destino).classList.add("visible");
  });
});
/* ===== 1. CAMELLOS (CUALQUIER NUMERO) ===== */
const contenedorHerederos = document.getElementById("c-herederos");

function agregarHeredero(valor) {
  const etiqueta = document.createElement("label");
  etiqueta.textContent = "Heredero " + (contenedorHerederos.children.length + 1) + " (1/d)";
  const campo = document.createElement("input");
  campo.type = "text";
  campo.inputMode = "numeric";
  campo.value = valor;
  campo.required = true;
  etiqueta.appendChild(campo);
  contenedorHerederos.appendChild(etiqueta);
}

// Valores iniciales del libro: 1/2, 1/3 y 1/9
[2, 3, 9].forEach(agregarHeredero);

document.getElementById("c-agregar").addEventListener("click", function () {
  if (contenedorHerederos.children.length < 20) {
    agregarHeredero(10);
  }
});

document.getElementById("c-quitar").addEventListener("click", function () {
  if (contenedorHerederos.children.length > 1) {
    contenedorHerederos.removeChild(contenedorHerederos.lastElementChild);
  }
});

function mcdBig(a, b) {
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function leerEntero(texto) {
  const limpio = texto.trim().replace(/[.,\s]/g, ""); // acepta 1.000.000 o 1 000 000
  return /^\d+$/.test(limpio) ? BigInt(limpio) : null;
}

document.getElementById("form-camellos").addEventListener("submit", function (e) {
  e.preventDefault();

  const salida = document.getElementById("salida-camellos");
  const n = leerEntero(document.getElementById("c-n").value);
  const D = Array.from(contenedorHerederos.querySelectorAll("input")).map(function (campo) {
    return leerEntero(campo.value);
  });

  if (n === null || n < 1n || D.some(function (d) { return d === null || d < 2n; })) {
    salida.innerHTML = '<span class="error">Escribe enteros positivos: n ≥ 1 y cada denominador ≥ 2.</span>';
    return;
  }

  // M.C.M. de los denominadores y suma de fracciones (S / L)
  let L = 1n;
  D.forEach(function (d) { L = (L / mcdBig(L, d)) * d; });
  const S = D.reduce(function (acc, d) { return acc + L / d; }, 0n);

  // Truco de Beremiz: menor T múltiplo de L con T >= n
  const m = (n + L - 1n) / L;
  const T = m * L;
  const prestados = T - n;
  const ganancia = n - m * S; // sobrantes - prestados

  let html = "<p>M.C.M. de los denominadores: <b>" + L + "</b></p>";

  if (ganancia >= 0n) {
    const partes = D.map(function (d) { return T / d; });
    const repartidos = partes.reduce(function (a, b) { return a + b; }, 0n);
    const sobrantes = T - repartidos;

    if (prestados === 0n) {
      html += "<p>El número de camellos ya se divide exacto: no hace falta prestar ninguno.</p>";
    } else {
      html += "<p>Camellos prestados: <b>" + prestados + "</b> → total a repartir: <b>" + T + "</b></p>";
    }
    html += "<table><tr><th>Heredero</th><th>Fracción</th><th>Camellos</th></tr>";
    for (let i = 0; i < D.length; i++) {
      html += "<tr><td>Heredero " + (i + 1) + "</td><td>1/" + D[i] + "</td><td>" + partes[i] + "</td></tr>";
    }
    html += "</table>";
    html += "<p>Camellos repartidos: " + repartidos + " | Sobrantes: " + sobrantes + "</p>";
    html += '<p class="ok">Se devuelven ' + prestados + " camello(s) prestado(s) y quedan " +
            ganancia + " camello(s) de ganancia.</p>";
  } else {
    // Con tan pocos camellos el préstamo no se puede devolver: se reparte la parte entera
    const partes = D.map(function (d) { return n / d; });
    const repartidos = partes.reduce(function (a, b) { return a + b; }, 0n);
    const sinRepartir = n - repartidos;

    html += "<p>Para que todas las partes fueran enteras habría que prestar <b>" + prestados +
            "</b> camello(s), pero después de repartir no sobrarían suficientes para devolverlos. " +
            "Por eso cada heredero recibe la parte entera de su fracción.</p>";
    html += "<table><tr><th>Heredero</th><th>Fracción</th><th>Camellos</th></tr>";
    for (let i = 0; i < D.length; i++) {
      html += "<tr><td>Heredero " + (i + 1) + "</td><td>1/" + D[i] + "</td><td>" + partes[i] + "</td></tr>";
    }
    html += "</table>";
    if (sinRepartir >= 0n) {
      html += '<p class="ok">Camellos repartidos: ' + repartidos + " | Quedan sin repartir: " + sinRepartir + ".</p>";
    } else {
      html += '<p class="error">Las fracciones suman más que la herencia completa, por eso se reparten ' +
              repartidos + " camellos teniendo solo " + n + ".</p>";
    }
  }

  salida.innerHTML = html;
});
/* ===== 2. PANES ===== */
function formatoMonedas(x) {
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
}

document.getElementById("form-panes").addEventListener("submit", function (e) {
  e.preventDefault();

  const a = parseInt(document.getElementById("p-a").value);
  const b = parseInt(document.getElementById("p-b").value);
  const m = parseInt(document.getElementById("p-m").value);
  const salida = document.getElementById("salida-panes");

  if (isNaN(a) || isNaN(b) || isNaN(m) || a < 1 || b < 1 || m < 1) {
    salida.innerHTML = '<span class="error">Ingresa enteros positivos.</span>';
    return;
  }

  // Cada pan se corta en 3 pedazos; los tres comen la misma cantidad
  const T = a + b;                 // pedazos que come cada persona
  const pedazosA = 3 * a - T;      // pedazos que dio el primero al jeque
  const pedazosB = 3 * b - T;      // pedazos que dio el segundo al jeque

  if (pedazosA < 0 || pedazosB < 0) {
    salida.innerHTML = '<span class="error">Con esos panes uno de los dos no alcanza a cubrir su parte. ' +
      "Cada uno debe llevar al menos un tercio del total de panes.</span>";
    return;
  }

  const simpleA = m * a / T;
  const simpleB = m * b / T;
  const ciertaA = m * pedazosA / T;
  const ciertaB = m * pedazosB / T;
  const perfecta = m / 2;

  let html = "<p>Total de panes: <b>" + T + "</b> → " + (3 * T) + " pedazos, cada uno come <b>" + T + "</b>.</p>";
  html += "<p>Pedazos dados al jeque: Beremiz <b>" + pedazosA + "</b>, bagdalí <b>" + pedazosB + "</b>.</p>";
  html += "<table><tr><th>División</th><th>Beremiz</th><th>Bagdalí</th></tr>";
  html += "<tr><td>Simple (por panes)</td><td>" + formatoMonedas(simpleA) + "</td><td>" + formatoMonedas(simpleB) + "</td></tr>";
  html += "<tr><td>Cierta (por lo aportado)</td><td>" + formatoMonedas(ciertaA) + "</td><td>" + formatoMonedas(ciertaB) + "</td></tr>";
  html += "<tr><td>Perfecta (mitad y mitad)</td><td>" + formatoMonedas(perfecta) + "</td><td>" + formatoMonedas(perfecta) + "</td></tr>";
  html += "</table>";
  html += '<p class="ok">Lo matemáticamente justo es ' + formatoMonedas(ciertaA) + " monedas para Beremiz y " +
          formatoMonedas(ciertaB) + " para el bagdalí.</p>";

  salida.innerHTML = html;
});

/* ===== 3. CUADRATICA (EJERCICIO 12) ===== */
document.getElementById("form-cuad").addEventListener("submit", function (e) {
  e.preventDefault();

  const a = parseFloat(document.getElementById("q-a").value);
  const b = parseFloat(document.getElementById("q-b").value);
  const c = parseFloat(document.getElementById("q-c").value);
  const salida = document.getElementById("salida-cuad");

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    salida.innerHTML = '<span class="error">Completa los tres valores.</span>';
    return;
  }
  if (a === 0) {
    salida.innerHTML = '<span class="error">Si a = 0 la ecuación no es cuadrática.</span>';
    return;
  }

  const D = b * b - 4 * a * c;
  let html = "<p>Discriminante D = " + D + "</p>";

  if (D > 0) {
    const x1 = (-b + Math.sqrt(D)) / (2 * a);
    const x2 = (-b - Math.sqrt(D)) / (2 * a);
    html += '<p class="ok">La ecuación tiene dos raíces</p>';
    html += "<p>x1 = " + x1.toFixed(4) + " &nbsp;&nbsp; x2 = " + x2.toFixed(4) + "</p>";
  } else if (D === 0) {
    const x = -b / (2 * a);
    html += '<p class="ok">La ecuación tiene una raíz</p>';
    html += "<p>x = " + x.toFixed(4) + "</p>";
  } else {
    html += '<p class="error">La ecuación no tiene raíces reales</p>';
  }

  salida.innerHTML = html;
});

document.querySelectorAll(".mini").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const valores = btn.dataset.abc.split(",");
    document.getElementById("q-a").value = valores[0];
    document.getElementById("q-b").value = valores[1];
    document.getElementById("q-c").value = valores[2];
    document.getElementById("form-cuad").requestSubmit();
  });
});
/* ===== 4. ESTIMACION DE PI (EJERCICIO 13) ===== */
const N_MAXIMO = 1000000;

function estimarPi(N) {
  let suma = 0;
  for (let n = 1; n <= N; n++) {
    suma += 1 / (n * n);
  }
  return Math.sqrt(6 * suma);
}

function filaPi(N) {
  const est = estimarPi(N);
  const error = Math.abs(Math.PI - est);
  return "<tr><td>" + N.toLocaleString("es") + "</td><td>" + est.toFixed(15) + "</td><td>" +
         Math.PI.toFixed(15) + "</td><td>" + error.toFixed(15) + "</td></tr>";
}

const cabeceraPi = "<table><tr><th>N</th><th>Estimación</th><th>π real</th><th>Error</th></tr>";
const salidaPi = document.getElementById("salida-pi");

function mostrarPi(lista) {
  let html = cabeceraPi;
  lista.forEach(function (N) { html += filaPi(N); });
  html += "</table>";
  if (lista.length > 1) {
    html += "<p>A mayor N, la estimación se acerca más a π.</p>";
  }
  salidaPi.innerHTML = html;
}

document.getElementById("form-pi").addEventListener("submit", function (e) {
  e.preventDefault();
  const N = parseInt(document.getElementById("pi-n").value);

  if (isNaN(N) || N < 1 || N > N_MAXIMO) {
    salidaPi.innerHTML = '<span class="error">Ingresa un entero entre 1 y 1.000.000.</span>';
    return;
  }
  mostrarPi([N]);
});

[["pi-100", 100], ["pi-10000", 10000], ["pi-millon", 1000000]].forEach(function (par) {
  document.getElementById(par[0]).addEventListener("click", function () {
    document.getElementById("pi-n").value = par[1];
    mostrarPi([par[1]]);
  });
});

document.getElementById("pi-todos").addEventListener("click", function () {
  mostrarPi([100, 10000, 1000000]);
});