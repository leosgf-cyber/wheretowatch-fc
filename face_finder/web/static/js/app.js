let currentJobId = null;
let currentScanId = null;

document.getElementById("personPhotos").addEventListener("change", function () {
  const count = this.files.length;
  const el = document.getElementById("selectedFiles");
  el.textContent = count > 0 ? count + " foto(s) selecionada(s)" : "";
});

loadPeople();
loadVideos();

// ========== TABS ==========

function switchTab(section, tab, btn) {
  var prefix = section === "people" ? "people-" : "videos-";
  var tabs = btn.parentElement.querySelectorAll(".tab");
  tabs.forEach(function (t) { t.classList.remove("active"); });
  btn.classList.add("active");

  var parent = btn.closest(".section");
  var contents = parent.querySelectorAll(".tab-content");
  contents.forEach(function (c) { c.classList.remove("active"); });

  var target = document.getElementById(prefix + tab);
  if (target) target.classList.add("active");
}

// ========== PEOPLE ==========

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

    let thumbHtml = '<div class="person-thumb-placeholder"></div>';
    if (p.thumb) {
      thumbHtml = '<img class="person-thumb" src="/api/people/' +
        encodeURIComponent(p.name) + '/photo/' + encodeURIComponent(p.thumb) +
        '" alt="' + escapeHtml(p.name) + '">';
    }

    card.innerHTML =
      thumbHtml +
      '<div class="person-info">' +
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

// ========== FOLDER SCAN ==========

async function scanFolderFiles(input) {
  if (input.files.length === 0) return;

  var folderName = input.files[0].webkitRelativePath.split("/")[0];
  document.getElementById("refFolderName").textContent = folderName + " (" + input.files.length + " arquivos)";
  document.getElementById("scanProgress").textContent = "Enviando e detectando rostos...";

  var formData = new FormData();
  var imageCount = 0;
  for (var i = 0; i < input.files.length; i++) {
    var ext = input.files[i].name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "bmp", "webp"].indexOf(ext) !== -1) {
      formData.append("photos", input.files[i]);
      imageCount++;
    }
  }

  if (imageCount === 0) {
    document.getElementById("scanProgress").textContent = "";
    alert("Nenhuma imagem encontrada na pasta.");
    return;
  }

  document.getElementById("scanProgress").textContent =
    "Enviando " + imageCount + " imagens e detectando rostos...";

  var res = await fetch("/api/scan-folder", { method: "POST", body: formData });
  var data = await res.json();

  if (data.error) {
    document.getElementById("scanProgress").textContent = "";
    alert(data.error);
    return;
  }

  currentScanId = data.scan_id;
  document.getElementById("scanProgress").textContent =
    data.faces.length + " pessoa(s) unica(s) detectada(s). Nomeie abaixo:";

  showClusters(data.scan_id, data.faces);
  input.value = "";
}

function showClusters(scanId, faces) {
  const section = document.getElementById("clusteringSection");
  const grid = document.getElementById("clusterGrid");
  section.style.display = "block";
  grid.innerHTML = "";

  faces.forEach(function (face) {
    const card = document.createElement("div");
    card.className = "cluster-card";
    card.innerHTML =
      '<img class="cluster-thumb" src="/api/scan-thumbs/' + scanId + '/' + face.thumb + '">' +
      '<div class="cluster-info">' +
      '<span class="count">' + face.photo_count + ' foto(s)</span>' +
      '<input type="text" class="cluster-name-input" data-id="' + face.id +
      '" placeholder="Nome desta pessoa">' +
      '</div>';
    grid.appendChild(card);
  });
}

async function confirmClusters() {
  if (!currentScanId) return;

  const inputs = document.querySelectorAll(".cluster-name-input");
  const assignments = [];

  inputs.forEach(function (input) {
    const name = input.value.trim();
    if (name) {
      assignments.push({ id: parseInt(input.dataset.id), name: name });
    }
  });

  if (assignments.length === 0) {
    alert("Nomeie pelo menos uma pessoa.");
    return;
  }

  const res = await fetch("/api/confirm-people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scan_id: currentScanId, assignments: assignments }),
  });
  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  document.getElementById("clusteringSection").style.display = "none";
  document.getElementById("scanProgress").textContent =
    data.saved + " foto(s) salva(s) como referência.";
  currentScanId = null;
  loadPeople();
}

// ========== VIDEOS ==========

async function loadVideos() {
  const res = await fetch("/api/videos");
  const videos = await res.json();
  const grid = document.getElementById("videosGrid");
  const empty = document.getElementById("videosEmpty");

  grid.innerHTML = "";

  if (videos.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  videos.forEach(function (v) {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML =
      '<div class="video-icon">&#9654;</div>' +
      '<div class="person-info">' +
      '<div class="name">' + escapeHtml(v.filename) + '</div>' +
      '<div class="count">' + v.size_mb + ' MB</div>' +
      '</div>' +
      '<button class="btn btn-danger" onclick="deleteVideo(\'' +
      escapeHtml(v.filename).replace(/'/g, "\\'") +
      '\')">Remover</button>';
    grid.appendChild(card);
  });
}

async function uploadVideos(input) {
  if (input.files.length === 0) return;

  const area = document.getElementById("videoArea");
  const label = document.getElementById("videoLabel");
  label.innerHTML = '<span class="filename">Enviando ' + input.files.length + ' video(s)...</span>';
  area.classList.add("has-file");

  const formData = new FormData();
  for (let i = 0; i < input.files.length; i++) {
    formData.append("videos", input.files[i]);
  }

  const res = await fetch("/api/videos", { method: "POST", body: formData });
  const data = await res.json();

  label.textContent = "Clique para selecionar vídeos (pode selecionar vários)";
  area.classList.remove("has-file");
  input.value = "";

  if (data.error) {
    alert(data.error);
    return;
  }

  loadVideos();
}

async function deleteVideo(filename) {
  if (!confirm("Remover este vídeo?")) return;
  await fetch("/api/videos/" + encodeURIComponent(filename), { method: "DELETE" });
  loadVideos();
}

async function loadVideoFolderFiles(input) {
  if (input.files.length === 0) return;

  var folderName = input.files[0].webkitRelativePath.split("/")[0];
  document.getElementById("videoFolderName").textContent = folderName;

  var formData = new FormData();
  var videoCount = 0;
  var videoExts = ["mp4", "mov", "avi", "mkv", "webm", "m4v"];

  for (var i = 0; i < input.files.length; i++) {
    var ext = input.files[i].name.split(".").pop().toLowerCase();
    if (videoExts.indexOf(ext) !== -1) {
      formData.append("videos", input.files[i]);
      videoCount++;
    }
  }

  if (videoCount === 0) {
    document.getElementById("videoFolderProgress").textContent = "";
    alert("Nenhum vídeo encontrado na pasta.");
    return;
  }

  document.getElementById("videoFolderProgress").textContent =
    "Enviando " + videoCount + " video(s)...";

  var res = await fetch("/api/load-videos-folder", { method: "POST", body: formData });
  var data = await res.json();

  if (data.error) {
    document.getElementById("videoFolderProgress").textContent = "";
    alert(data.error);
    return;
  }

  document.getElementById("videoFolderProgress").textContent =
    data.count + " video(s) carregado(s).";
  input.value = "";
  loadVideos();
}

// ========== PROCESSING ==========

async function startProcessing() {
  const res1 = await fetch("/api/videos");
  const videos = await res1.json();

  if (videos.length === 0) {
    alert("Suba pelo menos um vídeo antes de processar.");
    return;
  }

  const videoFilenames = videos.map(function (v) { return v.filename; });

  const payload = {
    videos: videoFilenames,
    fps: parseFloat(document.getElementById("fpsInput").value),
    tolerance: parseFloat(document.getElementById("toleranceInput").value),
    start: document.getElementById("startInput").value.trim() || null,
    end: document.getElementById("endInput").value.trim() || null,
  };

  const btn = document.getElementById("processBtn");
  btn.disabled = true;
  btn.textContent = "Processando...";

  const progressBar = document.getElementById("progressBar");
  progressBar.classList.add("active");

  document.getElementById("resultsSection").classList.remove("visible");

  const res = await fetch("/api/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (data.error) {
    alert(data.error);
    btn.disabled = false;
    btn.textContent = "Processar Vídeos";
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
      showResults(job, jobId);
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
  btn.textContent = "Processar Vídeos";
  document.getElementById("progressBar").classList.remove("active");
}

// ========== RESULTS ==========

function showResults(job, jobId) {
  const section = document.getElementById("resultsSection");
  const container = document.getElementById("resultsContainer");
  section.classList.add("visible");

  if (!job.results || Object.keys(job.results).length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma pessoa identificada nos frames.</div>';
    return;
  }

  let html = "";
  const names = Object.keys(job.results).sort();

  names.forEach(function (name) {
    const data = job.results[name];
    const bestMatches = data.best_matches || [];
    const videos = data.videos || [];

    html +=
      '<div class="result-person">' +
      '<div class="result-header">' +
      '<span class="result-name">' + escapeHtml(name) + "</span>" +
      '<span class="result-count">' + data.total_appearances + " aparicao(oes)</span>" +
      "</div>" +
      '<div class="result-confidence">Confianca media: ' +
      (data.avg_confidence * 100).toFixed(1) + "%";

    if (videos.length > 1) {
      html += " | Em " + videos.length + " videos";
    }

    html += "</div>";

    if (bestMatches.length > 0) {
      html += '<div class="match-grid">';
      bestMatches.forEach(function (m) {
        var imgSrc = m.match_image
          ? "/api/matches/" + jobId + "/" + m.match_image
          : "";

        html += '<div class="match-card">';
        if (imgSrc) {
          html += '<img class="match-img" src="' + imgSrc + '" alt="match">';
        }
        html +=
          '<div class="match-info">' +
          '<span class="match-ts">' + m.timestamp + "</span>" +
          '<span class="match-conf">' + (m.confidence * 100).toFixed(0) + "%</span>" +
          "</div>";
        if (m.video) {
          html += '<div class="match-video">' + escapeHtml(m.video) + "</div>";
        }
        html += "</div>";
      });
      html += "</div>";
    }

    var timestamps = data.timestamps || [];
    if (timestamps.length > 6) {
      html += '<div class="timestamps-list">';
      var remaining = timestamps.slice(6, 36);
      remaining.forEach(function (ts) {
        html += '<span class="timestamp-tag">' + ts + "</span>";
      });
      if (timestamps.length > 36) {
        html += '<span class="timestamp-tag">+' + (timestamps.length - 36) + " mais</span>";
      }
      html += "</div>";
    }

    html += "</div>";
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
