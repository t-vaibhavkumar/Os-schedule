let processes = [];
let processQueue = [];

function addProcess() {
    const processId = document.getElementById("processId").value;
    const burstTime = parseInt(document.getElementById("burstTime").value);
    const arrivalTime = parseInt(document.getElementById("arrivalTime").value);

    processes.push({ id: processId, burst: burstTime, arrival: arrivalTime, remaining: burstTime });
    document.getElementById("processForm").reset();
    alert(`Process ${processId} added.`);
}

async function runSimulation() {
    const timeQuantum = parseInt(document.getElementById("timeQuantum").value) || 1; // Default to 1 ms if not entered
    let time = 0;
    let executionOrder = [];
    let processTable = [];
    
    while (processes.length > 0 || processQueue.length > 0) {
        // Load processes into the queue based on arrival time
        processes = processes.filter(process => {
            if (process.arrival <= time) {
                processQueue.push(process);
                return false;
            }
            return true;
        });

        if (processQueue.length > 0) {
            // Dequeue the first process from the queue
            const currentProcess = processQueue.shift();
            const executionTime = Math.min(timeQuantum, currentProcess.remaining);

            // Add to execution order and show animation
            executionOrder.push({ id: currentProcess.id, start: time, end: time + executionTime });
            await displayExecutionStep(currentProcess.id, time, time + executionTime);

            time += executionTime;
            currentProcess.remaining -= executionTime;

            // If the process still has burst time left, re-add it to the queue
            if (currentProcess.remaining > 0) {
                processQueue.push(currentProcess);
            } else {
                // Calculate times for completed process
                const completionTime = time;
                const turnaroundTime = completionTime - currentProcess.arrival;
                const waitingTime = turnaroundTime - currentProcess.burst;
                processTable.push({ 
                    id: currentProcess.id, 
                    arrival: currentProcess.arrival, 
                    burst: currentProcess.burst, 
                    completion: completionTime, 
                    turnaround: turnaroundTime, 
                    waiting: waitingTime 
                });
            }
        } else {
            time++; // Increment time if no processes are ready
        }
    }

    displayResultTable(processTable);
    drawGanttChart(executionOrder);
}

// Display each step in the animation
function displayExecutionStep(id, start, end) {
    return new Promise(resolve => {
        const block = document.createElement("div");
        block.style.width = (end - start) * 20 + "px";
        block.style.height = "30px";
        block.style.backgroundColor = "#4CAF50";
        block.style.color = "#fff";
        block.style.display = "inline-block";
        block.style.textAlign = "center";
        block.style.lineHeight = "30px";
        block.style.marginRight = "5px";
        block.textContent = `${id} (${start}-${end})`;

        document.getElementById("ganttAnimation").appendChild(block);

        // Delay for animation
        setTimeout(() => resolve(), 500);
    });
}

function displayResultTable(tableData) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";
    tableData.forEach(data => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.id}</td>
            <td>${data.arrival}</td>
            <td>${data.burst}</td>
            <td>${data.completion}</td>
            <td>${data.turnaround}</td>
            <td>${data.waiting}</td>
        `;
        tbody.appendChild(row);
    });
}

// Draw the Gantt chart
function drawGanttChart(order) {
    const labels = order.map(e => `${e.id} (${e.start}-${e.end})`);
    const data = order.map(e => e.end - e.start);

    new Chart(document.getElementById("ganttChart"), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Execution Timeline',
                data: data,
                backgroundColor: '#4CAF50',
                borderColor: '#388E3C',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { title: { display: true, text: 'Process Execution' } }
            }
        }
    });
}
