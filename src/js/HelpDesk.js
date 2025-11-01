class HelpDesk {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.ticketsContainer = document.getElementById("ticketsContainer");
    this.addTicketButton = document.getElementById("addTicket");
    this.addModal = document.getElementById("addModal");
    this.editModal = document.getElementById("editModal");
    this.deleteModal = document.getElementById("deleteModal");
    this.submitAddTicket = document.getElementById("submitAddTicket");
    this.cancelAddTicket = document.getElementById("cancelAddTicket");
    this.submitEditTicket = document.getElementById("submitEditTicket");
    this.cancelEditTicket = document.getElementById("cancelEditTicket");
    this.confirmDeleteTicket = document.getElementById("confirmDeleteTicket");
    this.cancelDeleteTicket = document.getElementById("cancelDeleteTicket");
    this.ticketNameInput = document.getElementById("ticketName");
    this.ticketDescriptionInput = document.getElementById("ticketDescription");
    this.editTicketNameInput = document.getElementById("editTicketName");
    this.editTicketDescriptionInput = document.getElementById(
      "editTicketDescription",
    );
    this.addModalError = document.getElementById("addModalError");
    this.editModalError = document.getElementById("editModalError");
    this.currentEditId = null;
    this.currentDeleteId = null;
    this.isLoading = false;
    this.initEventListeners();
    this.fetchTickets();
    this.closeModal(this.addModal);
    this.closeModal(this.editModal);
    this.closeModal(this.deleteModal);
  }

  initEventListeners() {
    // Сохраняем оригинальные тексты кнопок
    [this.submitAddTicket, this.submitEditTicket, this.confirmDeleteTicket].forEach(btn => {
      if (btn) btn.dataset.originalText = btn.textContent;
    });
    
    this.addTicketButton.addEventListener("click", () =>
      this.openModal(this.addModal)
    );
    this.cancelAddTicket.addEventListener("click", () =>
      this.closeModal(this.addModal)
    );
    this.cancelEditTicket.addEventListener("click", () =>
      this.closeModal(this.editModal)
    );
    this.cancelDeleteTicket.addEventListener("click", () =>
      this.closeModal(this.deleteModal)
    );
    this.submitAddTicket.addEventListener("click", () => this.addTicket());
    this.submitEditTicket.addEventListener("click", () => this.updateTicket());
    this.confirmDeleteTicket.addEventListener("click", () =>
      this.deleteTicket()
    );
  }

  openModal(modal) {
    modal.style.display = "block";
  }

  closeModal(modal) {
    modal.style.display = "none";
  }

  showError(element, message) {
    element.textContent = message;
    element.style.display = "block";
  }

  hideError(element) {
    element.textContent = "";
    element.style.display = "none";
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    const buttons = [this.submitAddTicket, this.submitEditTicket, this.confirmDeleteTicket];
    buttons.forEach(btn => {
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Загрузка...' : btn.dataset.originalText || btn.textContent;
      }
    });
  }

  fetchTickets() {
    this.setLoading(true);
    fetch(`${this.baseURL}?method=allTickets`)
      .then((response) => response.json())
      .then((tickets) => {
        this.ticketsContainer.innerHTML = "";
        tickets.forEach((ticket) => this.renderTicket(ticket));
      })
      .finally(() => this.setLoading(false));
  }

  renderTicket(ticket) {
    const ticketElement = document.createElement("div");
    ticketElement.className = "ticket";
    const description = ticket.description || "Описание отсутствует.";
    const formattedDate = new Date(ticket.created)
      .toLocaleString("ru-RU", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");
    ticketElement.innerHTML = `
      <div class="ticket-content">
        <input type="checkbox" ${ticket.status ? "checked" : ""}>
        <span>${ticket.name}</span>
        <span class="ticket-time">${formattedDate}</span>
        <button class="edit-btn"></button>
        <button class="delete-btn"></button>
      </div>
      <div class="ticket-details" style="display: none;">${description}</div>
    `;
    ticketElement
      .querySelector(".ticket-content")
      .addEventListener("click", (e) => {
        if (
          !e.target.classList.contains("edit-btn") &&
          !e.target.classList.contains("delete-btn")
        ) {
          this.toggleTicketDetails(ticketElement);
        }
      });
    ticketElement
      .querySelector("input")
      .addEventListener("click", (e) => this.toggleTicketStatus(ticket.id, e));
    ticketElement
      .querySelector(".edit-btn")
      .addEventListener("click", (e) => this.openEditModal(ticket.id, e));
    ticketElement
      .querySelector(".delete-btn")
      .addEventListener("click", (e) => this.openDeleteModal(ticket.id, e));
    this.ticketsContainer.appendChild(ticketElement);
  }

  toggleTicketDetails(ticketElement) {
    const details = ticketElement.querySelector(".ticket-details");
    details.style.display = details.style.display === "none" ? "block" : "none";
  }

  toggleTicketStatus(id, event) {
    event.stopPropagation();
    fetch(`${this.baseURL}?method=updateTicket&id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: event.target.checked }),
    }).then(() => this.fetchTickets());
  }

  addTicket() {
    if (this.isLoading) return;
    
    const name = this.ticketNameInput.value.trim();
    const description = this.ticketDescriptionInput.value.trim();
    
    // Сбрасываем предыдущие ошибки
    this.hideError(this.addModalError);
    
    if (!name || !name.length) {
      this.showError(
        this.addModalError,
        "Пожалуйста, укажите краткое описание.",
      );
      return;
    }
    
    if (!description || !description.length) {
      this.showError(
        this.addModalError,
        "Пожалуйста, укажите подробное описание.",
      );
      return;
    }
    
    this.setLoading(true);
    fetch(`${this.baseURL}?method=createTicket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
    .then(() => {
      this.closeModal(this.addModal);
      this.fetchTickets();
    })
    .finally(() => this.setLoading(false));
  }

  openEditModal(id, event) {
    event.stopPropagation();
    this.currentEditId = id;
    fetch(`${this.baseURL}?method=ticketById&id=${id}`)
      .then((response) => response.json())
      .then((ticket) => {
        this.editTicketNameInput.value = ticket.name;
        this.editTicketDescriptionInput.value = ticket.description;
        this.openModal(this.editModal);
      });
  }

  updateTicket() {
    if (this.isLoading) return;
    
    const name = this.editTicketNameInput.value.trim();
    const description = this.editTicketDescriptionInput.value.trim();
    
    // Сбрасываем предыдущие ошибки
    this.hideError(this.editModalError);
    
    if (!name || !name.length) {
      this.showError(
        this.editModalError,
        "Пожалуйста, укажите краткое описание.",
      );
      return;
    }
    
    if (!description || !description.length) {
      this.showError(
        this.editModalError,
        "Пожалуйста, укажите подробное описание.",
      );
      return;
    }
    
    this.setLoading(true);
    fetch(`${this.baseURL}?method=updateTicket&id=${this.currentEditId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
    .then(() => {
      this.closeModal(this.editModal);
      this.fetchTickets();
    })
    .finally(() => this.setLoading(false));
  }

  openDeleteModal(id, event) {
    event.stopPropagation();
    this.currentDeleteId = id;
    this.openModal(this.deleteModal);
  }

  deleteTicket() {
    if (this.isLoading) return;
    
    this.setLoading(true);
    fetch(
      `${this.baseURL}?method=deleteTicket&id=${this.currentDeleteId}`,
      { method: 'DELETE' }
    )
    .then(() => {
      this.closeModal(this.deleteModal);
      this.fetchTickets();
    })
    .finally(() => this.setLoading(false));
  }
}

export default HelpDesk;
