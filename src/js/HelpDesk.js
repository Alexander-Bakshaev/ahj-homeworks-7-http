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

    // Сбрасываем стили ошибок при вводе в поля формы
    this.ticketNameInput.addEventListener('input', () => {
      if (this.ticketNameInput.classList.contains('error')) {
        this.ticketNameInput.classList.remove('error');
        this.ticketNameInput.placeholder = "Введите краткое описание";
      }
    });

    this.ticketDescriptionInput.addEventListener('input', () => {
      if (this.ticketDescriptionInput.classList.contains('error')) {
        this.ticketDescriptionInput.classList.remove('error');
        this.ticketDescriptionInput.placeholder = "Введите подробное описание";
      }
    });

    this.editTicketNameInput.addEventListener('input', () => {
      if (this.editTicketNameInput.classList.contains('error')) {
        this.editTicketNameInput.classList.remove('error');
        this.editTicketNameInput.placeholder = "Введите краткое описание";
      }
    });

    this.editTicketDescriptionInput.addEventListener('input', () => {
      if (this.editTicketDescriptionInput.classList.contains('error')) {
        this.editTicketDescriptionInput.classList.remove('error');
        this.editTicketDescriptionInput.placeholder = "Введите подробное описание";
      }
    });
  }

  openModal(modal) {
    // Сбрасываем ошибки при открытии модального окна
    if (modal === this.addModal) {
      this.hideError(this.addModalError);
      this.ticketNameInput.classList.remove('error');
      this.ticketDescriptionInput.classList.remove('error');
      this.ticketNameInput.value = '';
      this.ticketDescriptionInput.value = '';
      this.ticketNameInput.placeholder = "Введите краткое описание";
      this.ticketDescriptionInput.placeholder = "Введите подробное описание";
    }
    modal.style.display = "block";
  }

  closeModal(modal) {
    modal.style.display = "none";
  }

  showError(element, message) {
    if (element) {
      element.textContent = message;
      element.style.display = "block";
    }
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
    this.ticketNameInput.placeholder = "Введите краткое описание";
    this.ticketDescriptionInput.placeholder = "Введите подробное описание";
    this.ticketNameInput.classList.remove('error');
    this.ticketDescriptionInput.classList.remove('error');
    
    let hasError = false;
    
    if (!name) {
      this.ticketNameInput.placeholder = "Пожалуйста, укажите краткое описание";
      this.ticketNameInput.classList.add('error');
      this.ticketNameInput.focus();
      hasError = true;
    }
    
    if (!description) {
      this.ticketDescriptionInput.placeholder = "Пожалуйста, укажите подробное описание";
      this.ticketDescriptionInput.classList.add('error');
      if (!hasError) this.ticketDescriptionInput.focus();
      hasError = true;
    }
    
    if (hasError) {
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
    // Сбрасываем ошибки перед загрузкой данных
    this.hideError(this.editModalError);
    this.editTicketNameInput.classList.remove('error');
    this.editTicketDescriptionInput.classList.remove('error');
    this.editTicketNameInput.placeholder = "Введите краткое описание";
    this.editTicketDescriptionInput.placeholder = "Введите подробное описание";

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
    this.editTicketNameInput.placeholder = "Введите краткое описание";
    this.editTicketDescriptionInput.placeholder = "Введите подробное описание";
    this.editTicketNameInput.classList.remove('error');
    this.editTicketDescriptionInput.classList.remove('error');
    
    let hasError = false;
    
    if (!name) {
      this.editTicketNameInput.placeholder = "Пожалуйста, укажите краткое описание";
      this.editTicketNameInput.classList.add('error');
      this.editTicketNameInput.focus();
      hasError = true;
    }
    
    if (!description) {
      this.editTicketDescriptionInput.placeholder = "Пожалуйста, укажите подробное описание";
      this.editTicketDescriptionInput.classList.add('error');
      if (!hasError) this.editTicketDescriptionInput.focus();
      hasError = true;
    }
    
    if (hasError) {
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

  async deleteTicket() {
    if (this.isLoading) return;
    
    this.setLoading(true);
    try {
      const response = await fetch(
        `${this.baseURL}?method=deleteTicket&id=${this.currentDeleteId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Ошибка удаления тикета');
      
      this.closeModal(this.deleteModal);
      this.fetchTickets();
    } catch (error) {
      console.error('Ошибка при удалении тикета:', error);
      // Показываем ошибку в контейнере тикетов
      this.showError(this.ticketsContainer, 'Не удалось удалить тикет');
    } finally {
      this.setLoading(false);
    }
  }
}

export default HelpDesk;
