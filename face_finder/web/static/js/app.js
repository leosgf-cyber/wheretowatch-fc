let currentJobId = null;

document.getElementById("personPhotos").addEventListener("change", function () {
  const count = this.files.length;
  const el = document.getElementById("selectedFiles");
  el.textContent = count > 0 ? count + " foto(s) selecionada(s)" : "";
});

loadPeople();

async function loadPeople() {
  const res = await fetch("/api/people");
  const people = await res.json();
  const grid = document.getElementById("peopleGrid");
  const empty = document.getElementById("peopleEmpty");

  grid.innerHTML = "";

  if (people.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  people.forEach(function (p) {
    const card = document.createElement("div");
    card.className = "person-card";
    card.innerHTML =
      '<div>' +
      '<div class="name">' + escapeHtml(p.name) + '</div>' +
      '<div class="count">' + p.photo_count + ' foto(s)</div>' +
      '</div>' +
      '<button class="btn btn-danger" onclick="deletePerson(\'' +
      escapeHtml(p.name).replace(/'/g, "\\'") +
      '\')">Remover</button>';
    grid.appendChild(card);
  });
}

async function addPerson() {
  const nameInput = document.getElementById("personName");
  const photosInput = document.getElementById("personPhotos");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Digite o nome ou papel da pessoa.");
    return;
  }

  if (photosInput.files.length === 0) {
    alert("Selecione pelo menos uma foto.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  for (let i = 0; i < photosInput.files.length; i++) {
    formData.append("photos", photosInput.files[i]);
  }

  const btn = document.getElementById("addPersonBtn");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  const res = await fetch("/api/people", { method: "POST", body: formData });
  const data = await res.json();

  btn.disabled = false;
  btn.textContent = "Adicionar";

  if (data.error) {
    alert(data.error);
    return;
  }

  nameInput.value = "";
  photosInput.value = "";
  document.getElementById("selectedFiles").textContent = "";
  loadPeople();
}

async function deletePerson(name) {
  if (!confirm('Remover "' + name + '" e todas as suas fotos?')) return;
  await fetch("/api/people/" + encodeURIComponent(name), { method: "DELETE" });
  loadPeople();
}

function onVideoSelected(input) {
  const area = document.getElementById("videoArea");
  const label = document.getElementById("videoLabel");
  if (input.files.length > 0) {
    area.classList.add("has-file");
    label.innerHTML = '<span class="filename">' + escapeHtml(input.files[0].name) + "</span>";
  } else {
    area.classList.remove("has-file");
    label.textContent = "Clique para selecionar um vídeo";
  }
}

async function startProcessing() {
  const videoInput = document.getElementById("videoFile");
  if (videoInput.files.length === 0) {
    alert("Selecione um vídeo.");
    return;
  }

  const formData = new FormData();
  formData.append("video", videoInput.files[0]);
  formData.append("fps", document.getElementById("fpsInput").value);
  formData.append("tolerance", document.getElementById("toleranceInput").value);

  const start = document.getElementById("startInput").value.trim();
  const end = document.getElementById("endInput").value.trim();
  if (start) formData.append("start", start);
  if (end) formData.append("end", end);

  const btn = document.getElementById("processBtn");
  btn.disabled = true;
  btn.textContent = "Processando...";

  const progressBar = document.getElementById("progressBar");
  progressBar.classList.add("active");

  document.getElementById("resultsSection").classList.remove("visible");

  const res = await fetch("/api/process", { method: "POST", body: formData });
  const data = await res.json();

  if (data.error) {
    alert(data.error);
    btn.disabled = false;
    btn.textContent = "Processar Vídeo";
    progressBar.classList.remove("active");
    return;
  }

  currentJobId = data.job_id;
  pollJob(data.job_id);
}

function pollJob(jobId) {
  const interval = setInterval(async function () {
    const res = await fetch("/api/jobs/" + jobId);
    const job = await res.json();

    document.getElementById("progressText").textContent = job.progress;

    if (job.status === "done") {
      clearInterval(interval);
      showResults(job);
      resetProcessButton();
    } else if (job.status === "error") {
      clearInterval(interval);
      alert("Erro: " + job.progress);
      resetProcessButton();
    }
  }, 2000);
}

function resetProcessButton() {
  const btn = document.getElementById("processBtn");
  btn.disabled = false;
  btn.textContent = "Processar Vídeo";
  document.getElementById("progressBar").classList.remove("active");
}

function showResults(job) {
  const section = document.getElementById("resultsSection");
  const container = document.getElementById("resultsContainer");
  section.classList.add("visible");

  if (!job.results || Object.keys(job.results).length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma pessoa identificada nos frames do vídeo.</div>';
    return;
  }

  let html = "";
  const names = Object.keys(job.results).sort();

  names.forEach(function (name) {
    const data = job.results[name];
    const timestamps = data.timestamps || [];
    const shown = timestamps.slice(0, 30);

    html +=
      '<div class="result-person">' +
      '<div class="result-header">' +
      '<span class="result-name">' + escapeHtml(name) + "</span>" +
      '<span class="result-count">' + data.total_appearances + " aparicao(oes)</span>" +
      "</div>" +
      '<div class="result-confidence">Confianca media: ' + (data.avg_confidence * 100).toFixed(1) + "%</div>" +
      '<div class="timestamps-list">';

    shown.forEach(function (ts) {
      html += '<span class="timestamp-tag">' + ts + "</span>";
    });

    if (timestamps.length > 30) {
      html += '<span class="timestamp-tag">+' + (timestamps.length - 30) + " mais</span>";
    }

    html += "</div></div>";
  });

  container.innerHTML = html;
}

function downloadResults() {
  if (currentJobId) {
    window.location.href = "/api/jobs/" + currentJobId + "/download";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
