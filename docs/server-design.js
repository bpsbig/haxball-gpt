🎯 Proyecto Final – Servidor Haxball Competitivo Profesional 3v3

🔹 PRINCIPIO CENTRAL DEL SISTEMA
La cantidad de jugadores ACTIVOS define el modo.
Jugador activo = jugador conectado que:
No está en AFK manual.
No está en AFK automático.
Envió un mensaje de chat dentro de los últimos 15 segundos(no incluye espectadores).
Un jugador en partido que envia un mensaje de chat reinicia el contador de afk.
También tocar la pelota o generar un cambio detectable de posición en el campo reinicia el contador.
El sistema incrementa el contador de inactividad cada 1 segundo.
La detección de movimiento real se realiza mediante polling de posición cada 250 milisegundos, independiente del incremento del contador.
El contador de inactividad se suspende durante pausas oficiales del partido.

🔹 JERARQUÍA ABSOLUTA DE EVENTOS
Orden obligatorio ante eventos simultáneos:
Detección de finalización de partido (gol decisivo o tiempo cumplido).
Congelamiento de datos.
Cálculo y guardado de estadísticas.
Aplicación de penalizaciones por abandono si corresponde.
Recalculo de jugadores activos.
Transición estructural si corresponde.
Reconstrucción estructural por FIFO.
Este orden nunca puede alterarse.

🔹 REGLAS DE RECÁLCULO OBLIGATORIO
Después de cualquier evento:
Conexión
Desconexión
AFK automático
!afk manual
Finalización de partido
Reconexión
→ Se recalcula cantidad de activos inmediatamente.
Si la estructura no coincide con el modo actual:
🔴 TRANSICIÓN INMEDIATA
El partido se detiene llamando a room.stopGame().
La jugada actual se completa antes de detener.
No se espera fin de ronda.
No se respeta ventaja.
No se conserva marcador.
No se hereda resultado parcial.
El partido queda INVALIDADO estadísticamente si no había finalizado oficialmente.
Las transiciones estructurales tienen prioridad absoluta sobre el partido en curso (incluido overtime).
El sistema es determinístico:
Misma cantidad de activos + mismo orden FIFO → mismo resultado estructural.
Excepción: en 3v3 con exactamente 6 activos tras finalizar partido válido, la auto-mezcla es completamente aleatoria.

🔹 1. SISTEMA DE MODOS AUTOMÁTICOS
Training (1 jugador)
1v1 Classic
2v2 Classic
3v3 Big (modo principal)
Cambio automático de estadio según cantidad de jugadores activos.
Mapas cargados por archivos .hbs.
Toda transición entre estructuras distintas reinicia marcador a 0-0.
Si un 3v3 se interrumpe por quedar con menos de 6 activos:
No se guardan estadísticas.
No afecta ELO.
No se registra como partido finalizado.
Se inicia nuevo 2v2 desde cero.

🔹 2. SISTEMA DE COLA FIFO REAL
Prioridad por orden real de llegada.
La cola es la única fuente de verdad estructural.
Nunca se prioriza:
Equipo actual
Marcador
"Quién estaba jugando"
Toda reconstrucción estructural parte desde FIFO.
Perdedores siempre al final de la cola.
El capitán del equipo perdedor siempre al último en la cola de espectadores.
Ganadores permanecen en Red (salvo que haya transición estructural que obligue reconstrucción total).

🔹 AFK en cola
No puede ser capitán.
No puede ser pickeado.
No puede autocompletar.
Es ignorado mientras esté AFK.
Mantiene su posición FIFO mientras esté AFK.
Si vuelve de AFK manual → mantiene su posición FIFO.
Si permanece AFK 30 minutos → es expulsado del servidor.
Si se vuelve activo antes de cumplir los 30 minutos → no es expulsado.
Si un jugador quedó AFK automático durante un partido y fue movido a Spectator final de cola, mantiene su prioridad estructural original frente a jugadores que hayan ingresado posteriormente. Si utiliza !afk, conserva dicha prioridad.

🔹 3. SISTEMA DE PICKS
2v2 con 1 Spectator
Primero en cola entra como Capitán.
Elige 1 compañero.
Tiempo por turno: 20 segundos.
A los 10 segundos → advertencia privada.
Si no elige:
→ Pasa a Spectator final de cola.
→ Siguiente jugador activo por FIFO toma rol de Capitán.
→ Nuevo capitán debe elegir 1 compañero desde cero.
→ Puede elegir al capitán anterior si está activo.
No hay autoselección por tiempo.

3v3
Primero en cola entra como Capitán.
Elige 2 compañeros.
Tiempo por turno: 20 segundos.
A los 10 segundos → advertencia privada.
Si no elige nada:
→ Pasa a Spectator final de cola.
→ Siguiente jugador activo por FIFO toma rol de Capitán.
→ Nuevo capitán debe elegir 2 compañeros desde cero.
→ Puede elegir al capitán anterior si está activo.
Si elige parcialmente (ejemplo: 1 de 2):
→ Pasa a Spectator con estado "AFK temporal".
→ El último jugador elegido pasa a ser nuevo Capitán.
→ Nuevo capitán debe completar el pick (elige los que faltan).
→ Si el ex-capitán sale de AFK temporal → puede ser elegido en el mismo pick.
Diferencia AFK temporal vs AFK final de cola:

AFK temporal (pick incompleto): puede volver durante el mismo pick si sale de AFK con !afk
AFK final de cola (no eligió nada): va al final, puede ser elegido si sale del estado AFK con !afk

🔹 Capitán abandona
Durante PICK:
→ El siguiente espectador activo por prioridad FIFO pasa automáticamente a ser Capitán.
→ El pick continúa.
Si durante el pick los activos bajan a 4:
→ Se cancela inmediatamente el pick.
→ Se pasa a 2v2 fijo.
→ Reconstrucción total por FIFO.

Durante MATCH 3v3:
Si el capitán abandona:
→ La capitanía pasa automáticamente al siguiente jugador del mismo equipo según orden interno actual del equipo (no FIFO global).
→ Si activos ≥ 6 → ese nuevo capitán elige reemplazo.
→ Si activos < 6 → transición inmediata a 2v2.

🔹 Pick con Cambio de Estructura
Si durante el pick entra o sale un jugador:
El pick NO se reinicia automáticamente.
Se actualiza lista de elegibles activos.
Si la nueva cantidad de activos cambia la estructura objetivo:
→ Se cancela el pick inmediatamente.
→ Se ejecuta transición estructural inmediata.
→ Se reconstruye modo desde FIFO.
→ Los jugadores ya elegidos NO se mantienen juntos.

Casos específicos:
Si durante pick 3v3 baja a 5 activos:
→ Pick cancelado.
→ Transición a 2v2.
→ El jugador que es movido a espectadores debe ser el último incorporado al equipo según orden FIFO interno del equipo que queda con 3 jugadores (el de abajo de los 3) y sera capitan el proximo partido.
→ En el proximo partido 2vs2, deberá elegir 1 compañero.
Si durante pick baja a 4 activos:
→ Pick cancelado inmediatamente.
→ Modo fijo 2v2 (sin pick, se mantienen los equipos como esten formados en ese momento y si es necesario armado por FIFO).
Si durante pick 2v2 sube a 6 activos o mas:
→ Pick cancelado.
→ Transición a 3v3.
Siempre manda la estructura final resultante de activos.

🔹 AUTOCOMPLETADO
→ Autocompletado por orden FIFO.
→ Nunca se selecciona jugador AFK.

🔹 4. SISTEMA AFK INTELIGENTE
AFK Automático
Contador de inactividad: 15 segundos.
Resetea el contador: (jugadores en partido)

Escribir en el chat o tocar/patear la pelota.
Solo quedara afk estando en partido si no toca la pelota y no chatea durante 15 segundos.
La detección de movimiento para reiniciar el contador AFK no se basa en eventos de teclado, sino en verificación periódica de cambio real de posición del jugador (polling).

El sistema realiza una verificación cíclica cada 250 milisegundos para comparar la posición actual con la anterior.

Si hay cambio de posición real, el contador AFK se reinicia.

Si no hay cambio de posición, no se considera actividad.


Si el contador llega a 15 segundos:
→ Se detecta AFK automático.
→ Pasa a Spectator final de cola.
→ Se marca como "AFK automático" (distinto de AFK manual).
→ Recalcular activos inmediatamente.
→ Se aplica transición estructural si corresponde.

Para salir de AFK automático:
→ Se hace mediante comando !afk
→ El comando !afk tiene un cooldown obligatorio de 10 segundos por jugador.
→ Al sacarse AFK mantiene su lugar en la cola en el momento que use el comando !afk.

El contador no corre durante pausas oficiales.

AFK Manual
Comando: !afk
Cooldown: 10 segundos por jugador.
Como usarlo:
→ Un jugador en partido no puede ponerse afk manual con !afk
→ Solo los espectadores pueden ponerse !afk manual
→ Recalcular estructura inmediato.
Para volver:
Debe escribir nuevamente !afk respetando cooldown.
Al volver:
→ Mantiene el lugar que tenga en la cola al momento de usar el comando !afk.
→ Se recalcula estructura inmediatamente.
→ Puede provocar transición estructural.
→ Puede ser elegido en pick si está activo.

🔹 5. SISTEMA DE ESTADÍSTICAS
Solo cuentan partidos 3v3 completados oficialmente.
Partido válido 3v3:
Termina dentro de 3 minutos
O termina en Overtime con gol decisivo
Orden exacto al finalizar 3v3:
Detectar final.
Congelar datos.
Calcular estadísticas.
Determinar ganador.
Determinar MVP.
Calcular racha.
Anunciar en chat.
Recién después reorganizar estructura.
Si un partido no finaliza oficialmente y ocurre transición estructural:
→ El partido queda INVALIDADO.
→ No se suman estadísticas.
→ No se aplica ELO.

🔹 6. SISTEMA ELO
ELO individual.
Ajuste por victoria/derrota.
Ajuste por diferencia promedio.
Persistencia obligatoria.
Abandono en 3v3 activo:
→ Se considera derrota automática.
→ Se aplica penalización adicional de ELO.
Si el 3v3 se cancela por quedar con menos de 6 activos:
→ No se aplica ELO a ningún jugador.
Temporadas mensuales:
Reinicio manual.
Se reinician estadísticas de temporada.
Se conserva identidad única y nivel de cuenta.
Se conserva historial fuera de temporada actual.

🔹 7. SISTEMA DE RANGOS
Basados en ELO.
Colores visibles.
Temporadas mensuales con persistencia histórica.

🔹 8. ANTI-ABUSO
Bloqueo de cambio manual de equipo.
Anti multi-account básico (IP como indicador de sospecha).
Antispam.
Penalización abandono 3v3.

🔹 9. TRANSICIONES LIMPIAS
Si cambia estructura:
Se detiene partido con room.stopGame().
La jugada actual se completa antes de detener.
Se carga estadio correcto.
Se reinicia marcador a 0-0.
Se reorganiza completamente por FIFO.
⚠️ Nunca se conserva marcador entre estructuras distintas.

🔹 10. SISTEMA DESCONEXIÓN (3v3) – DEFINITIVO
Si alguien se desconecta en 3v3:
→ Partido se pausa inmediatamente.
→ Se recalculan activos.
Si activos ≥ 6:
→ Capitán elige reemplazo (20 segundos).
→ Continúa partido (incluido overtime).
Si activos < 6:
→ Transición automática a 2v2.
→ Reinicio obligatorio 0-0.
→ No cuentan estadísticas del 3v3.
→ Los equipo quedan formados como estaban en ese momento para el 2vs2, el tercer jugador (el último incorporado al equipo según orden FIFO interno del equipo, es decir el de abajo de los 3), se mueve a espectador.
No existe período de gracia para reconexión.

🔹 11. OVERTIME
Empate → Overtime.
Gol gana.
Si durante overtime:
Activos ≥ 6 → Capitán elige reemplazo y continúa overtime.
Activos < 6 → Transición inmediata según cantidad de activos.
Overtime 3v3 → baja a menos de 6 activos:
→ Transición inmediata a 2v2.
→ Reinicio obligatorio 0-0.
→ Partido 3v3 invalidado (no cuenta stats ni ELO).
Overtime 2v2 → baja a 3 activos:
→ Detener partido inmediatamente.
→ Transición a 1v1.
→ Reinicio obligatorio 0-0.
→ NO continúa overtime.
Overtime 2v2 → baja a 2 activos:
→ Transición a 1v1.
→ Reinicio 0-0.
Overtime 2v2 → baja a 1 activo:
→ Transición a Training.
Overtime 1v1 → baja a 1 activo:
→ Transición a Training.
No existen empates competitivos.

🔹 FLUJO DE 0 JUGADORES ACTIVOS
Sala vacía.
Modo espera.

🔹 FLUJO DE 1 JUGADOR
Entra → Spectator → final de cola.
Como único activo:
→ Pasa a Red.
→ Carga Training.
→ Sin límite.
Si entra segundo jugador:
→ Transición inmediata a 1v1.
→ Reinicio 0-0.

🔹 FLUJO DE 2 JUGADORES
Se carga Futsal x1.
Primero en cola → Red.
Segundo → Blue.
1v1.
Límite 3 minutos o 3 goles.
Empate → Overtime gol gana.
Al terminar:
Ganador → Red.
Perdedor → Spectator final de cola.
Si no hay Spectator:
Perdedor vuelve a Blue.
Siempre ganador RED en 1v1 (salvo excepciones especificas).
Si entra tercer jugador durante el partido:
→ Al finalizar partido actual se pasa a flujo de 3.
→ Nuevo partido 0-0.

🔹 FLUJO DE 3 JUGADORES
Se juega 1v1.
Tercero espera en Spectator.
Al terminar:
Ganador → Red.
Perdedor → Spectator final de cola.
Primero en cola → Blue.
Marcador siempre 0-0 nuevo.
Si durante el partido cambia la cantidad de activos → transición inmediata.

🔹 FLUJO DE 4 JUGADORES
Si entra cuarto durante 1v1:
Sin reiniciar:
Primero en cola → Red.
Cuarto → Blue.
Continúa 2v2.
No se reinicia marcador.
Si alguien queda AFK:
→ Pasa a Spectator.
→ Recalcular estructura inmediatamente(pasaria a 1vs1).

Al finalizar 2v2 con exactamente 4 activos:
Ganadores → Red.
Perdedores → Blue.
Reinicio obligatorio 0-0.
Nuevo partido inmediato.
Esta regla aplica SIEMPRE que:
Termina un 2v2.
Hay exactamente 4 activos.
No hubo transición estructural desde otro modo.

Si entra quinto:
Al finalizar:
Ganadores → Red.
Perdedores → Spectator final de cola.
Primero en cola → Blue Capitán.
Elige 1 compañero.
Nuevo 2v2 0-0.

🔹 FLUJO DE 5 JUGADORES
Se juega 2v2.
Quinto en Spectator.
Al finalizar:
Ganadores → Red.
Perdedores → Spectator final de cola.
Primero en cola → Blue Capitán.
Elige 1 compañero.
Nuevo 2v2 0-0.
Si durante el partido llega sexto jugador:
→ Se corta inmediatamente el 2v2.
→ Se descarta marcador actual.
→ Se carga 3v3.
→ Reconstrucción total por FIFO.
→ Nuevo 3v3 inicia 0-0.
Si baja de 5 a 4 activos:
→ Se aplica regla de 4 activos (2v2 fijo).
→ Reinicio 0-0.

🔹 FLUJO DE 6 JUGADORES
Se detiene cualquier 2v2 activo.
Se descarta marcador.
Se carga Futsal x3.
Reorganización FIFO pura.
Se inicia 3v3 0-0.
Si baja de 6 a 5:
→ Cambio inmediato a 2v2.
→ El jugador de menor prioridad estructural del equipo con 3 pasa a Spectator.
Menor prioridad estructural = último incorporado al equipo según orden FIFO interno del equipo.
→ Nuevo 2v2 0-0.
Si baja de 6 a 4:
→ Cambio directo a 2v2 fijo.
→ Reinicio obligatorio 0-0.
Cuando termina 3v3 válido:
Detectar final.
Congelar datos.
Calcular estadísticas.
Determinar ganador.
Determinar MVP.
Calcular racha.
Anunciar en chat.
Luego:
Si hay exactamente 6 activos:
→ NO hay pick.
→ Se realiza AUTO-MEZCLA COMPLETAMENTE ALEATORIA.
→ Se forman 2 equipos nuevos de 3.
→ Se valida cantidad de activos antes de iniciar.
→ Si activos siguen siendo 6 → nuevo 3v3 0-0 inmediato.
→ Si activos bajaron a menos de 6 → transición a 2v2.
Si hay más de 6 activos:
Ganadores → Red.
Perdedores → Spectator final de cola.
Primero en cola → Blue Capitán.
Elige 2 compañeros.
Nuevo 3v3 0-0.

🔹 FLUJO DE 7+ JUGADORES
Entra jugador #7 (o más) durante 3v3:
→ Pasa a Spectator.
→ Se agrega al final de la cola.
→ Espera turno.
→ El 3v3 continúa hasta terminar.
Si hay 3v3 activo con espectadores esperando:
→ El partido continúa normalmente hasta finalizar.
Si no hay partido activo con 7+ jugadores:
→ Se arma 3v3 por FIFO (primeros 6 de la cola).
→ Resto espera en Spectator.
Al finalizar 3v3 con 7+ activos:
→ Ganadores a Red.
→ Perdedores a Spectator (final de cola).
→ Primer Spectator en cola (#7) es Capitán Blue.
→ Elige 2 compañeros.
→ Nuevo 3v3 0-0.

🔹 REGLA POST-PARTIDO GLOBAL
Si un partido terminó oficialmente y luego alguien abandona:
→ Se recalcula activos inmediatamente.
→ Se reconstruye modo desde FIFO.
→ Se inicia partido nuevo acorde estructura actual.

🔹 LIMITACIONES TÉCNICAS DE LA API HAXBALL
Detección de actividad:

SÍ detecta: onPlayerChat (chatear).
SÍ detecta: onPlayerBallKick (tocar pelota).
NO detecta: movimiento sin acción directa.

Por esta limitación, el sistema implementa verificación adicional mediante polling de posición cada 250 milisegundos.

Actividad válida en partido que reinicia contador AFK:
→ Escribir en el chat.
→ Tocar o patear la pelota.
→ Generar un cambio real de posición detectable mediante comparación periódica de coordenadas.

Si no ocurre ninguna de estas acciones durante 15 segundos consecutivos, se detecta AFK automático.

Transiciones:

room.stopGame() completa la jugada actual antes de detener.
No existe "parada instantánea" en medio de una jugada.
Los eventos se procesan secuencialmente por la API.

Timing:

Los callbacks de eventos no son síncronos garantizados.
Siempre se verifica estado actual antes de ejecutar transición.
