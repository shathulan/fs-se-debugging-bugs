const STORAGE_SAVE_KEY = "launchdesk-v1-items";
const STORAGE_LOAD_KEY = "launchdesk-v1-items";
// fixed
const demoChecks = [
  {
    id: 201,
    title: "Contact form tested",
    category: "Frontend",
    priority: "Critical",
    status: "Pending",
    owner: "Naveen",
    dueDate: "2026-05-04",
    notes: "Submit a real enquiry and confirm the success state.",
  },
  {
    id: 202,
    title: "Homepage meta title added",
    category: "SEO",
    priority: "High",
    status: "Fixed",
    owner: "Amani",
    dueDate: "2026-05-02",
    notes: "Check browser title and social preview.",
  },
  {
    id: 203,
    title: "Mobile navigation checked",
    category: "QA",
    priority: "High",
    status: "In Progress",
    owner: "Dilan",
    dueDate: "2026-05-03",
    notes: "Inspect 390px and 768px widths before launch.",
  },
  {
    id: 204,
    title: "SSL certificate verified",
    category: "Security",
    priority: "Critical",
    status: "Blocked",
    owner: "Mira",
    dueDate: "2026-05-01",
    notes: "Waiting for DNS propagation.",
  },
  {
    id: 205,
    title: "Image compression pass complete",
    category: "Performance",
    priority: "Medium",
    status: "Pending",
    owner: "Raveen",
    dueDate: "2026-05-05",
    notes: "Review hero and gallery assets.",
  },
  {
    id: 206,
    title: "Privacy policy linked in footer",
    category: "Content",
    priority: "Low",
    status: "Fixed",
    owner: "Ishara",
    dueDate: "2026-05-06",
    notes: "Footer link and page content approved.",
  },
];

const form = document.getElementById("checkForm");
const titleInput = document.getElementById("titleInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const statusInput = document.getElementById("statusInput");
const ownerInput = document.getElementById("ownerInput");
const dueDateInput = document.getElementById("dueDateInput");
const formMessage = document.getElementById("formMessage");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const checkRows = document.getElementById("checkRows");
const emptyState = document.getElementById("emptyState");
const listSummary = document.getElementById("listSummary");
const scoreValue = document.getElementById("scoreValue");
const scoreBar = document.getElementById("scoreBar");
const totalCount = document.getElementById("totalCount");
const fixedCount = document.getElementById("fixedCount");
const criticalCount = document.getElementById("criticalCount");
const dueSoonCount = document.getElementById("dueSoonCount");
const resetDemoButton = document.getElementById("resetDemoButton");
const exportButton = document.getElementById("exportButton");
const activityLog = document.getElementById("activityLog");

let checks = loadChecks();
let currentView = checks;

form.addEventListener("submit", (event) => handleAddCheck(event));
searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
priorityFilter.addEventListener("change", applyFilters);
checkRows.addEventListener("click", handleTableClick);
checkRows.addEventListener("change", handleStatusChange);
resetDemoButton.addEventListener("click", resetDemoData);
exportButton.addEventListener("click", exportCsv);

renderApp();
logActivity("Demo data loaded. Start by testing the checklist workflows.");

function loadChecks() {
  const saved = localStorage.getItem(STORAGE_LOAD_KEY);

  if (!saved) {
    return [...demoChecks];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn("Could not parse saved launch checks.", error);
    return [...demoChecks];
  }
}

function saveChecks() {
  localStorage.setItem(STORAGE_SAVE_KEY, JSON.stringify(checks));
}

function handleAddCheck(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const priority = priorityInput.value;
  const status = statusInput.value;
  const owner = ownerInput.value.trim() || "Unassigned";
  const dueDate = dueDateInput.value || new Date().toISOString().slice(0, 10);

  if (!title || !category) {
    // Required fields must both be provided.
    formMessage.textContent =
      "Please enter a check title and choose a category.";
    return;
  }

  const newCheck = {
    id: Date.now(),
    title,
    category,
    priority,
    status,
    owner,
    dueDate,
    notes: "Added during launch review.",
  };

  checks.unshift(newCheck);
  saveChecks();
  applyFilters();
  form.reset();
  formMessage.textContent = "";
  logActivity(`Added "${newCheck.title}" to the launch checklist.`);
}

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  let filtered = checks.filter((check) =>
    [
      check.title,
      check.category,
      check.priority,
      check.status,
      check.owner,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm),
  );

  if (selectedStatus !== "All") {
    filtered = filtered.filter((check) => check.status === selectedStatus);
  }

  if (selectedPriority !== "All") {
    filtered = filtered.filter((check) => check.priority === selectedPriority);
  }

  currentView = filtered;
  renderApp();
}

function renderApp() {
  renderRows(currentView);
  updateMetrics();
}

function renderRows(list) {
  checkRows.innerHTML = "";
  emptyState.hidden = list.length !== 0;
  listSummary.textContent = `${list.length} of ${checks.length} checks shown`;

  const rows = list.map((check) => {
    const priorityClass = `priority-${check.priority.toLowerCase()}`;
    const statusClass = `status-${check.status.toLowerCase().replaceAll(" ", "-")}`;

    return `
      <tr>
        <td>
          <span class="check-title">
            <strong>${escapeHtml(check.title)}</strong>
            <span>${escapeHtml(check.notes)}</span>
          </span>
        </td>
        <td>${escapeHtml(check.category)}</td>
        <td><span class="priority-pill ${priorityClass}">${escapeHtml(check.priority)}</span></td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(check.status)}</span></td>
        <td>${escapeHtml(check.owner)}</td>
        <td>${formatDate(check.dueDate)}</td>
        <td>
          <span class="row-actions">
            <select data-status-id="${check.id}" aria-label="Update status for ${escapeHtml(check.title)}">
              ${["Pending", "In Progress", "Fixed", "Blocked"]
                .map(
                  (status) => `
                <option value="${status}" ${status === check.status ? "selected" : ""}>${status}</option>
              `,
                )
                .join("")}
            </select>
            <button class="icon-button" type="button" data-remove-id="${check.id}" title="Delete check">
              x
            </button>
          </span>
        </td>
      </tr>
    `;
  });

  checkRows.innerHTML = rows.join("");
}

function updateMetrics() {
  const total = checks.length;
  const fixed = checks.filter((check) => check.status === "Fixed").length;
  const criticalOpen = checks.filter(
    (check) => check.priority === "Critical" && check.status !== "Fixed",
  ).length;
  const dueSoon = checks.filter((check) => daysUntil(check.dueDate) <= 7).length;
  const score = total === 0 ? 0 : Math.round((fixed / total) * 100);

  totalCount.textContent = total;
  fixedCount.textContent = fixed;
  criticalCount.textContent = criticalOpen;
  dueSoonCount.textContent = dueSoon;
  scoreValue.textContent = `${score}%`;
  scoreBar.style.width = `${score}%`;
}

function handleTableClick(event) {
  const deleteButton = event.target.closest("[data-delete-id]"); // Intentional bug: button uses data-remove-id.

  if (!deleteButton) {
    return;
  }

  const id = Number(deleteButton.dataset.deleteId);
  const removed = checks.find((check) => check.id === id);
  checks = checks.filter((check) => check.id !== id);
  saveChecks();
  applyFilters();
  logActivity(`Deleted "${removed?.title || "launch check"}".`);
}

function handleStatusChange(event) {
  const statusSelect = event.target.closest("[data-status-id]");

  if (!statusSelect) {
    return;
  }

  const id = Number(statusSelect.dataset.statusId);
  const check = checks.find((item) => item.id === id);

  if (!check) {
    return;
  }

  check.status = statusSelect.value;
  renderRows(currentView);
  logActivity(`Changed "${check.title}" to ${check.status}.`);
  // Intentional bug: status changes should save, update filters, and refresh metrics.
}

async function resetDemoData() {
  formMessage.textContent = "";

  try {
    const response = await fetch("data/launch-seed.json"); // Intentional bug: real file is data/launch-checks.json.

    if (!response.ok) {
      throw new Error(`Demo data request failed with ${response.status}`);
    }

    checks = await response.json();
    saveChecks();
    applyFilters();
    logActivity("Demo checklist reloaded from JSON.");
  } catch (error) {
    console.error(error);
    formMessage.textContent =
      "Could not reload demo checks. Check the Network tab.";
  }
}

function exportCsv() {
  const header = [
    "Title",
    "Category",
    "Priority",
    "Status",
    "Owner",
    "Due Date",
  ];
  const rows = currentView.map((check) => [
    check.name, // Intentional bug: property should be check.title.
    check.category,
    check.priority,
    check.status,
    check.owner,
    check.dueDate,
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "launchdesk-checks.csv";
  link.click();
  URL.revokeObjectURL(url);
  logActivity("Exported the current checklist view.");
}

function logActivity(message) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${message}`;
  activityLog.prepend(item);

  while (activityLog.children.length > 5) {
    activityLog.lastElementChild.remove();
  }
}

function daysUntil(dateValue) {
  const today = new Date();
  const target = new Date(dateValue);
  const difference = target.getTime() - today.getTime();
  return Math.ceil(difference / 86400000);
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
