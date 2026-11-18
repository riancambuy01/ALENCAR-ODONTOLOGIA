
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const state = {
    calendarDate: new Date(),
    selectedDate: new Date(),
    appointments: [],
    authenticatedUser: null
  };

  const monthNames = [
    "janeiro", "fevereiro", "março", "abril",
    "maio", "junho", "julho", "agosto",
    "setembro", "outubro", "novembro", "dezembro"
  ];

  const statusLabels = {
    confirmado: "Confirmado",
    pendente: "Pendente",
    agendado: "Agendado",
    concluido: "Concluído",
    cancelado: "Cancelado"
  };

  function localISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatDate(value) {
    if (!value) return "—";

    const [y, m, d] = value.split("-").map(Number);

    return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
  }

  function normalizeStatus(status) {
    const s = String(status || "pendente")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (s === "concluido" || s === "concluida") return "concluido";
    if (s === "confirmado" || s === "confirmada") return "confirmado";
    if (s === "cancelado" || s === "cancelada") return "cancelado";
    if (s === "agendado") return "agendado";

    return "pendente";
  }

  function getTime(period) {
    const map = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite"
    };

    return map[String(period || "").toLowerCase()] || period || "—";
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  function setConnection(message, isError = false) {
    const el = $("#connectionMessage");

    el.textContent = message;
    el.style.color = isError ? "#b42332" : "#64748b";
  }

  function renderStats(items) {
    const total = items.length;

    const count = (status) =>
      items.filter(a => normalizeStatus(a.status) === status).length;

    const values = {
      total,
      confirmado: count("confirmado"),
      pendente: count("pendente"),
      cancelado: count("cancelado")
    };

    $("#totalCount").textContent = values.total;
    $("#confirmedCount").textContent = values.confirmado;
    $("#pendingCount").textContent = values.pendente;
    $("#cancelledCount").textContent = values.cancelado;

    const ratio = (n) =>
      total ? `${Math.max(5, n / total * 100)}%` : "0%";

    $("#totalBar").style.width = total ? "60%" : "0%";
    $("#confirmedBar").style.width = ratio(values.confirmado);
    $("#pendingBar").style.width = ratio(values.pendente);
    $("#cancelledBar").style.width = ratio(values.cancelado);
  }


function renderAppointments(items) {
  const body = $("#appointmentsBody");

  const sorted = [...items].sort((a, b) =>
    `${a.appointment_date}${a.period}`.localeCompare(
      `${b.appointment_date}${b.period}`
    )
  );

  const upcoming = sorted.slice(0, 5);

  if (!upcoming.length) {
    body.innerHTML =
      '<tr><td colspan="6" class="table-message">Nenhum agendamento encontrado.</td></tr>';
    return;
  }

  body.innerHTML = upcoming.map(a => {
    const status = normalizeStatus(a.status);
    const label = statusLabels[status] || "Pendente";

    return `
      <tr>
        <td>
          <div class="patient-cell">
            <span class="patient-avatar">●</span>
            ${escapeHTML(a.name || "Paciente")}
          </div>
        </td>

        <td>${escapeHTML(a.treatment || "—")}</td>
        <td>${formatDate(a.appointment_date)}</td>
        <td>${escapeHTML(getTime(a.period))}</td>

        <td>
          <span class="status-pill status-${status}">
            ${label}
          </span>
        </td>

        <td>
          <select
            class="appointment-status-select"
            data-appointment-id="${a.id}"
            aria-label="Alterar status do agendamento ${a.id}"
          >
            <option value="pendente" ${status === "pendente" ? "selected" : ""}>Pendente</option>
            <option value="confirmado" ${status === "confirmado" ? "selected" : ""}>Confirmado</option>
            <option value="concluido" ${status === "concluido" ? "selected" : ""}>Concluído</option>
            <option value="cancelado" ${status === "cancelado" ? "selected" : ""}>Cancelado</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");
}


async function updateAppointmentStatus(id, status, select) {
  const previousStatus = state.appointments.find(
    appointment => Number(appointment.id) === Number(id)
  )?.status;

  select.disabled = true;

  try {
    await api(`/api/admin/appointments/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    const appointment = state.appointments.find(
      item => Number(item.id) === Number(id)
    );

    if (appointment) {
      appointment.status = status;
    }

    renderStats(state.appointments);
    renderAppointments(state.appointments);
    renderCalendar();
    drawChart(
      state.appointments,
      Number($("#chartRange").value)
    );

    setConnection("Status do agendamento atualizado com sucesso.");

  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);

    select.value = previousStatus || "pendente";

    setConnection(error.message, true);

  } finally {
    select.disabled = false;
  }
}



  function renderCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();

    $("#calendarMonth").textContent =
      `${monthNames[month][0].toUpperCase() + monthNames[month].slice(1)} ${year}`;

    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const today = localISO(new Date());

    const appointmentDates = new Set(
      state.appointments.map(a => a.appointment_date)
    );

    let html = "";

    for (let i = 0; i < 42; i++) {
      let day;
      let date;
      let muted = false;

      if (i < startOffset) {
        day = prevDays - startOffset + i + 1;
        date = new Date(year, month - 1, day);
        muted = true;
      } else if (i >= startOffset + daysInMonth) {
        day = i - (startOffset + daysInMonth) + 1;
        date = new Date(year, month + 1, day);
        muted = true;
      } else {
        day = i - startOffset + 1;
        date = new Date(year, month, day);
      }

      const iso = localISO(date);

      const classes = [
        "calendar-day",
        muted ? "muted" : "",
        iso === today ? "today" : "",
        appointmentDates.has(iso) ? "has-appointment" : ""
      ].filter(Boolean).join(" ");

      html += `
        <button class="${classes}" type="button"
          data-date="${iso}" aria-label="${formatDate(iso)}">
          ${day}
        </button>
      `;
    }

    $("#calendarDays").innerHTML = html;
  }

  function drawChart(items, days = 30) {
    const canvas = $("#requestsChart");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.max(280, rect.width);
    const height = Math.max(150, rect.height);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const pad = { l: 34, r: 12, t: 12, b: 28 };
    const w = width - pad.l - pad.r;
    const h = height - pad.t - pad.b;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const labels = [];
    const values = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);

      const iso = localISO(day);

      labels.push(day);

      values.push(
        items.filter(a => a.appointment_date === iso).length
      );
    }

    const max = Math.max(5, ...values);
    const ceiling = Math.ceil(max / 5) * 5;

    ctx.font = "11px Inter, Arial";
    ctx.strokeStyle = "#dce5f3";
    ctx.fillStyle = "#102342";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 3; i++) {
      const y = pad.t + h - (h * i / 3);

      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(width - pad.r, y);
      ctx.stroke();

      ctx.fillText(String(Math.round(ceiling * i / 3)), 4, y + 4);
    }

    const pts = values.map((v, i) => ({
      x: pad.l + (days === 1 ? 0 : i * w / (days - 1)),
      y: pad.t + h - (v / ceiling) * h
    }));

    if (pts.length) {
      const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + h);

      grad.addColorStop(0, "rgba(16,183,190,.28)");
      grad.addColorStop(1, "rgba(16,183,190,.02)");

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pad.t + h);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, pad.t + h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      pts.forEach((p, i) =>
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)
      );

      ctx.strokeStyle = "#0798a9";
      ctx.lineWidth = 3;
      ctx.stroke();

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#0798a9";
        ctx.fill();
      });
    }

    [0, Math.floor((days - 1) / 2), days - 1].forEach(i => {
      const x = pad.l + (days === 1 ? 0 : i * w / (days - 1));

      ctx.fillStyle = "#102342";

      ctx.fillText(
        `${String(labels[i].getDate()).padStart(2, "0")}/${String(labels[i].getMonth() + 1).padStart(2, "0")}`,
        Math.max(0, Math.min(width - 42, x - 17)),
        height - 7
      );
    });
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        ...(options.headers || {})
      }
    });

    if (response.status === 401) {
      window.location.replace("/admin/login.html");
      throw new Error("Sessão não autenticada.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao consultar a API.");
    }

    return data;
  }

  async function authenticate() {
    const data = await api("/api/admin/me");

    state.authenticatedUser = data.user;

    const clinicName = data.clinic.name;
    const userName = data.user.name;

    document.title = `Painel Administrativo | ${clinicName}`;

    const heading = $(".welcome-row h1");
    if (heading) {
      heading.textContent = `Olá, ${userName.split(" ")[0]}!`;
    }

    const description = $(".welcome-row p");
    if (description) {
      description.textContent =
        `Aqui está o resumo dos agendamentos da ${clinicName}.`;
    }

    const profile = $(".profile-button strong");
    if (profile) {
      profile.textContent = userName;
    }

    return data;
  }


async function loadDashboard() {
    try {
        const authData = await authenticate();

        const data = await api("/api/admin/appointments");

        // Guardar os agendamentos reais
        state.appointments = Array.isArray(data.appointments)
            ? data.appointments
            : [];

        // Atualizar indicadores
        renderStats(state.appointments);

        // Atualizar tabela
        renderAppointments(state.appointments);

        // Atualizar calendário
        renderCalendar();

        // Atualizar gráfico
        drawChart(
            state.appointments,
            Number($("#chartRange").value)
        );

        // Informar conexão
        setConnection(
            `Conectado com segurança à ${authData.clinic.name}. ` +
            `${state.appointments.length} agendamento(s) carregado(s).`
        );

    } catch (error) {
        if (error.message !== "Sessão não autenticada.") {
            console.error("Erro ao carregar painel:", error);
            setConnection(error.message, true);
        }
    }
}


  
  async function logout() {
    const button = $("#logoutButton");

    button.disabled = true;

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin"
      });
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    }

    window.location.replace("/admin/login.html");
  }

$("#appointmentsBody").addEventListener("change", event => {
  const select = event.target.closest(".appointment-status-select");

  if (!select) return;

  const id = select.dataset.appointmentId;
  const status = select.value;

  updateAppointmentStatus(id, status, select);
});


  $("#prevMonth").addEventListener("click", () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
    renderCalendar();
  });

  $("#nextMonth").addEventListener("click", () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
    renderCalendar();
  });

  $("#calendarDays").addEventListener("click", event => {
    const button = event.target.closest("[data-date]");

    if (!button) return;

    state.selectedDate = new Date(`${button.dataset.date}T12:00:00`);
    $("#dashboardDate").value = button.dataset.date;

    renderCalendar();
  });

  $("#dashboardDate").value = localISO(new Date());

  $("#dashboardDate").addEventListener("change", event => {
    if (!event.target.value) return;

    state.selectedDate = new Date(`${event.target.value}T12:00:00`);
  });

  $("#chartRange").addEventListener("change", () => {
    drawChart(state.appointments, Number($("#chartRange").value));
  });

  $("#menuToggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  $("#viewAllButton").addEventListener("click", () => {
    $("#agendamentos").scrollIntoView({ behavior: "smooth" });
  });

  $("#logoutButton").addEventListener("click", logout);

  document.querySelectorAll(
    ".nav-link[data-status], .nav-link[data-section]"
  ).forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      document.querySelectorAll(".nav-link").forEach(item => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      if (link.dataset.section === "inicio") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (link.dataset.section === "agendamentos") {
        $("#agendamentos").scrollIntoView({ behavior: "smooth" });
      }

      if (link.dataset.section === "configuracoes") {
        setConnection("As configurações da clínica serão implementadas na próxima etapa.");
      }

      if (link.dataset.status) {
        setConnection(
          `O filtro "${statusLabels[link.dataset.status]}" será conectado à API na próxima etapa.`
        );
      }

      if (window.innerWidth <= 700) {
        $("#sidebar").classList.remove("open");
      }
    });
  });

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      drawChart(state.appointments, Number($("#chartRange").value));
    }, 120);
  });

  // Verificar autenticação antes de carregar os dados.
  loadDashboard();
})();

