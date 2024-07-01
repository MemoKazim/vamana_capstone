const elems = document.querySelectorAll("[data-theme]");

const selected = (event) => {
  side_items = document.querySelectorAll(".side-item");
  side_items.forEach((item) => {
    item.classList.remove("selected");
  });
  event.classList.add("selected");
};

// Check whether dark mode was enabled on previous
const changeTheme = () => {
  if (themeStatus.checked) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
};

const enableDarkMode = () => {
  sun.classList.remove("hide");
  moon.classList.add("hide");
  elems.forEach((elem) => {
    elem.setAttribute("data-theme", "dark");
  });
  sessionStorage.setItem("darkMode", "enabled");
};

const disableDarkMode = () => {
  moon.classList.remove("hide");
  sun.classList.add("hide");
  elems.forEach((elem) => {
    elem.setAttribute("data-theme", "light");
  });
  sessionStorage.setItem("darkMode", null);
};

const moon = document.querySelector(".fa-moon");
const sun = document.querySelector(".fa-sun");
const themeStatus = document.querySelector("#changeTheme");
let darkMode = sessionStorage.getItem("darkMode");
if (darkMode === "enabled") {
  themeStatus.checked = true;
  changeTheme();
}

// Check whether sidebar was collapsed on previous
const resize = () => {
  if (sidebarStatus.checked) {
    collapseSidebar();
  } else {
    expandSidebar();
  }
};

const collapseSidebar = () => {
  item_names.forEach((item) => {
    item.style.display = "none";
  });
  sessionStorage.setItem("sidebarCollapse", "enabled");
};

const expandSidebar = () => {
  item_names.forEach((item) => {
    item.style.display = "block";
  });
  sessionStorage.setItem("sidebarCollapse", null);
};

const sidebarCollapse = sessionStorage.getItem("sidebarCollapse");
const sidebarStatus = document.querySelector("#resize");
const item_names = document.querySelectorAll(".item-name");
if (sidebarCollapse === "enabled") {
  sidebarStatus.checked = true;
  resize();
}
