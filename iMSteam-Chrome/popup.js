let currentSites = [];
let editingSiteIndex = -1;
let faviconGlobal = false;
let originalSettings = null;
let saved = false;

function getDefaultSites() {
  return [
    {
      name: "Online Fix",
      enabled: true,
      url: "https://online-fix.me/",
      iconUrl: "icons/OnlineFix.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Skidrow",
      enabled: true,
      url: "https://www.skidrowreloaded.com/",
      iconUrl: "icons/Skidrow.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "FitGirl",
      enabled: true,
      url: "https://fitgirl-repacks.site/",
      iconUrl: "icons/FitGirl.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "SteamRIP",
      enabled: true,
      url: "https://steamrip.com/",
      iconUrl: "icons/SteamRIP.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Dodi",
      enabled: true,
      url: "https://dodi-repacks.site/",
      iconUrl: "icons/Dodi.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Gload",
      enabled: false,
      url: "https://gload.to/",
      iconUrl: "icons/Gload.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "GOG",
      enabled: true,
      url: "https://www.gog-games.to/?search=",
      iconUrl: "icons/GOG.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Crack Watcher",
      enabled: false,
      url: "https://crackwatcher.com/search/",
      iconUrl: "icons/CrackWatcher.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "RuTracker",
      enabled: false,
      url: "https://rutracker.org/",
      iconUrl: "icons/RuTracker.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "CS.RIN.RU",
      enabled: true,
      url: "https://cs.rin.ru/forum/search.php",
      iconUrl: "icons/Csrin.png",
      autoFavicon: false,
      useSymbols: true,
      isDefault: true
    },
    {
      name: "Nexus Mods",
      enabled: true,
      url: "https://www.nexusmods.com/games?keyword=",
      iconUrl: "icons/NexusMods.png",
      autoFavicon: false,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Youtube",
      enabled: false,
      url: "https://www.youtube.com/results?search_query=",
      iconUrl: "icons/Youtube.png",
      autoFavicon: true,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Twitch",
      enabled: false,
      url: "https://www.twitch.tv/search?term=",
      iconUrl: "icons/Twitch.png",
      autoFavicon: true,
      useSymbols: false,
      isDefault: true
    },
    {
      name: "Steamdb",
      enabled: false,
      url: "https://steamdb.info/search/?a=all&q=",
      iconUrl: "icons/Steamdb.png",
      autoFavicon: true,
      useSymbols: false,
      isDefault: true
    }
  ];
}

function getFaviconUrl(siteUrl) {
  try {
    let domain = new URL(siteUrl).hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch (e) {
    return '';
  }
}

function getLocalOrCustomUrl(url) {
  if (!url) return chrome.runtime.getURL('icons/icon48.png');
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url;
  }
  return chrome.runtime.getURL(url);
}

function getSiteIconUrl(site) {
  if (faviconGlobal || site.autoFavicon) {
    const fav = getFaviconUrl(site.url);
    return fav || getLocalOrCustomUrl(site.iconUrl);
  }
  return getLocalOrCustomUrl(site.iconUrl);
}

function retrieveSettings() {
  chrome.storage.local.get({
    sites: getDefaultSites(),
    faviconGlobal: false
  }, function(data) {
    currentSites = data.sites;
    faviconGlobal = data.faviconGlobal;
    renderSiteList(currentSites);
  });
}

function saveSettings(sites) {
  chrome.storage.local.set({ sites: sites }, function() {
    console.log('Settings saved');
  });
}

function renderSiteList(sites) {
  const siteListContainer = document.getElementById("siteList");
  siteListContainer.innerHTML = "";

  sites.forEach((site, index) => {
    const siteDiv = document.createElement("div");
    siteDiv.classList.add("site-item");
    siteDiv.setAttribute("draggable", "true");
    siteDiv.setAttribute("data-index", index);
    if (!site.enabled) {
      siteDiv.classList.add("disabled-site");
    }

    // Drag Handle
    const dragHandle = document.createElement("div");
    dragHandle.classList.add("drag-handle");
    dragHandle.innerHTML = "☰";
    siteDiv.appendChild(dragHandle);

    // Site Icon
    const siteIcon = document.createElement("img");
    siteIcon.classList.add("site-icon");
    siteIcon.src = getSiteIconUrl(site);
    siteIcon.alt = site.name;
    siteDiv.appendChild(siteIcon);

    // Site Name
    const siteName = document.createElement("span");
    siteName.classList.add("site-name");
    siteName.textContent = site.name;
    siteDiv.appendChild(siteName);

    // Actions Group
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("site-actions");

    // Edit Button (Modern White SVG Icon)
    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-icon");
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
    editButton.title = "Edit";
    editButton.onclick = (e) => {
      e.stopPropagation();
      openEditModal(index);
    };
    actionsDiv.appendChild(editButton);

    // Delete Button (Modern White SVG Icon)
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-icon");
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
    deleteButton.title = "Delete";
    deleteButton.onclick = (e) => {
      e.stopPropagation();
      deleteSite(index);
    };
    actionsDiv.appendChild(deleteButton);

    // Toggle Switch (Enabled/Disabled)
    const switchLabel = document.createElement("label");
    switchLabel.classList.add("switch");
    
    const switchInput = document.createElement("input");
    switchInput.type = "checkbox";
    switchInput.checked = site.enabled;
    switchInput.addEventListener("change", (e) => {
      site.enabled = e.target.checked;
      saveSettings(sites);
      if (site.enabled) {
        siteDiv.classList.remove("disabled-site");
      } else {
        siteDiv.classList.add("disabled-site");
      }
    });
    
    const sliderSpan = document.createElement("span");
    sliderSpan.classList.add("slider");
    
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(sliderSpan);
    actionsDiv.appendChild(switchLabel);

    siteDiv.appendChild(actionsDiv);

    setupDragEvents(siteDiv);

    siteListContainer.appendChild(siteDiv);
  });
}

let dragSrcEl = null;

function setupDragEvents(el) {
  el.addEventListener('dragstart', handleDragStart, false);
  el.addEventListener('dragover', handleDragOver, false);
  el.addEventListener('dragleave', handleDragLeave, false);
  el.addEventListener('drop', handleDrop, false);
  el.addEventListener('dragend', handleDragEnd, false);
}

function handleDragStart(e) {
  this.classList.add('dragging');
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  this.classList.add('drag-over');
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  
  if (dragSrcEl !== this) {
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = parseInt(this.getAttribute('data-index'));
    
    const movedItem = currentSites.splice(fromIndex, 1)[0];
    currentSites.splice(toIndex, 0, movedItem);
    
    saveSettings(currentSites);
    renderSiteList(currentSites);
  }
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  const items = document.querySelectorAll('.site-item');
  items.forEach(item => {
    item.classList.remove('drag-over');
  });
}

function openAddModal() {
  document.getElementById("addSiteModal").style.display = "block";
  document.getElementById("addSiteForm").reset();
  
  document.getElementById("addAutoFavicon").checked = true;
  document.getElementById("addManualIconSection").style.display = "none";
  document.getElementById("addIconPreview").src = "icons/icon48.png";
}

function closeAddModal() {
  document.getElementById("addSiteModal").style.display = "none";
}

function openEditModal(index) {
  editingSiteIndex = index;
  const site = currentSites[index];
  
  document.getElementById("editModal").style.display = "block";
  document.getElementById("editSiteName").value = site.name;
  document.getElementById("editSiteUrl").value = site.url;
  
  const autoCheckbox = document.getElementById("editAutoFavicon");
  autoCheckbox.checked = site.autoFavicon ?? false;
  
  const manualSection = document.getElementById("editManualIconSection");
  const iconUrlInput = document.getElementById("editIconUrl");
  
  if (autoCheckbox.checked) {
    manualSection.style.display = "none";
    iconUrlInput.value = "";
  } else {
    manualSection.style.display = "block";
    if (site.iconUrl && !site.iconUrl.startsWith('data:')) {
      iconUrlInput.value = site.iconUrl;
    } else {
      iconUrlInput.value = "";
    }
  }
  
  document.getElementById("editUseSymbols").checked = site.useSymbols ?? true;
  
  updateEditPreview();
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  editingSiteIndex = -1;
}

function setRadioVal(name, value) {
  const elements = document.getElementsByName(name);
  elements.forEach(el => {
    if (el.value === value) {
      el.checked = true;
    }
  });
}

function getRadioVal(name) {
  const elements = document.getElementsByName(name);
  for (const el of elements) {
    if (el.checked) {
      return el.value;
    }
  }
  return '';
}

function openSettingsModal() {
  saved = false;
  chrome.storage.local.get({
    faviconGlobal: false,
    buttonAlignment: 'left',
    buttonStyle: 'pill',
    labelStyle: 'hidden'
  }, (data) => {
    originalSettings = { ...data };
    
    document.getElementById("settingFaviconGlobal").checked = data.faviconGlobal;
    document.getElementById("settingAlignment").value = data.buttonAlignment;
    
    setRadioVal("buttonStyle", data.buttonStyle);
    setRadioVal("labelStyle", data.labelStyle);
    
    document.getElementById("settingsModal").style.display = "block";
  });
}

function closeSettingsModal() {
  document.getElementById("settingsModal").style.display = "none";
}

function deleteSite(index) {
  if (confirm("Are you sure you want to delete this site?")) {
    currentSites.splice(index, 1);
    saveSettings(currentSites);
    renderSiteList(currentSites);
  }
}

function resetToDefault() {
  if (confirm("This will restore all default sites. Custom sites will remain unchanged. Continue?")) {
    const customSites = currentSites.filter(site => !site.isDefault);
    const defaultSites = getDefaultSites();
    currentSites = [...defaultSites, ...customSites];
    saveSettings(currentSites);
    
    const defaultGlobal = {
      faviconGlobal: false,
      buttonAlignment: 'left',
      buttonStyle: 'pill',
      labelStyle: 'hidden'
    };
    
    chrome.storage.local.set(defaultGlobal, () => {
      saved = true;
      retrieveSettings();
      closeSettingsModal();
    });
  }
}

function cleanIconPath(val) {
  if (!val) return "";
  val = val.trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.substring(1, val.length - 1).trim();
  }
  return val;
}

function updateAddPreview() {
  const isAuto = document.getElementById("addAutoFavicon").checked;
  const preview = document.getElementById("addIconPreview");
  
  if (isAuto) {
    const url = document.getElementById("siteUrl").value.trim();
    if (url) {
      const fav = getFaviconUrl(url);
      preview.src = fav || 'icons/icon48.png';
    } else {
      preview.src = 'icons/icon48.png';
    }
  } else {
    const iconUrl = cleanIconPath(document.getElementById("addIconUrl").value);
    if (iconUrl) {
      preview.src = getLocalOrCustomUrl(iconUrl);
    } else {
      preview.src = 'icons/icon48.png';
    }
  }
}

function updateEditPreview() {
  const isAuto = document.getElementById("editAutoFavicon").checked;
  const preview = document.getElementById("editIconPreview");
  
  if (isAuto) {
    const url = document.getElementById("editSiteUrl").value.trim();
    if (url) {
      const fav = getFaviconUrl(url);
      preview.src = fav || 'icons/icon48.png';
    } else {
      preview.src = 'icons/icon48.png';
    }
  } else {
    const iconUrl = cleanIconPath(document.getElementById("editIconUrl").value);
    if (iconUrl) {
      preview.src = getLocalOrCustomUrl(iconUrl);
    } else {
      const site = currentSites[editingSiteIndex];
      if (site && site.iconUrl && !site.autoFavicon) {
        preview.src = getLocalOrCustomUrl(cleanIconPath(site.iconUrl));
      } else {
        preview.src = 'icons/icon48.png';
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  retrieveSettings();

  document.getElementById("addSiteBtn").addEventListener("click", openAddModal);
  document.getElementById("closeAddModal").addEventListener("click", closeAddModal);
  document.getElementById("cancelAdd").addEventListener("click", closeAddModal);

  document.getElementById("closeEditModal").addEventListener("click", closeEditModal);
  document.getElementById("cancelEdit").addEventListener("click", closeEditModal);
  
  document.getElementById("openSettingsBtn").addEventListener("click", openSettingsModal);

  const rollbackSettings = () => {
    if (!saved && originalSettings) {
      chrome.storage.local.set(originalSettings, () => {
        console.log("Rolled back preview settings.");
      });
    }
  };

  document.getElementById("settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saved = true;
    closeSettingsModal();
    retrieveSettings();
  });

  document.getElementById("cancelSettings").addEventListener("click", () => {
    rollbackSettings();
    closeSettingsModal();
    retrieveSettings();
  });

  document.getElementById("closeSettingsModal").addEventListener("click", () => {
    rollbackSettings();
    closeSettingsModal();
    retrieveSettings();
  });

  window.addEventListener("unload", () => {
    rollbackSettings();
  });

  // Settings Input Listeners for real-time preview updating
  const settingsInputs = [
    "settingFaviconGlobal",
    "settingAlignment"
  ];

  settingsInputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => {
      const previewSettings = {
        faviconGlobal: document.getElementById("settingFaviconGlobal").checked,
        buttonAlignment: document.getElementById("settingAlignment").value,
        buttonStyle: getRadioVal("buttonStyle"),
        labelStyle: getRadioVal("labelStyle")
      };

      chrome.storage.local.set(previewSettings, () => {
        faviconGlobal = previewSettings.faviconGlobal;
        renderSiteList(currentSites);
      });
    });
  });

  const radioNames = ["buttonStyle", "labelStyle"];
  radioNames.forEach(name => {
    const elements = document.getElementsByName(name);
    elements.forEach(el => {
      el.addEventListener("change", () => {
        const previewSettings = {
          faviconGlobal: document.getElementById("settingFaviconGlobal").checked,
          buttonAlignment: document.getElementById("settingAlignment").value,
          buttonStyle: getRadioVal("buttonStyle"),
          labelStyle: getRadioVal("labelStyle")
        };

        chrome.storage.local.set(previewSettings, () => {
          faviconGlobal = previewSettings.faviconGlobal;
          renderSiteList(currentSites);
        });
      });
    });
  });
  
  document.getElementById("siteUrl").addEventListener("input", updateAddPreview);
  document.getElementById("addAutoFavicon").addEventListener("change", (e) => {
    document.getElementById("addManualIconSection").style.display = e.target.checked ? "none" : "block";
    updateAddPreview();
  });
  document.getElementById("addIconUrl").addEventListener("input", updateAddPreview);

  document.getElementById("editSiteUrl").addEventListener("input", updateEditPreview);
  document.getElementById("editAutoFavicon").addEventListener("change", (e) => {
    document.getElementById("editManualIconSection").style.display = e.target.checked ? "none" : "block";
    updateEditPreview();
  });
  document.getElementById("editIconUrl").addEventListener("input", updateEditPreview);

  document.getElementById("addSiteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("siteName").value;
    const url = document.getElementById("siteUrl").value.trim();
    const autoFavicon = document.getElementById("addAutoFavicon").checked;
    const useSymbols = document.getElementById("addUseSymbols").checked;
    
    let iconUrl = "";
    if (!autoFavicon) {
      const pastedUrl = cleanIconPath(document.getElementById("addIconUrl").value);
      if (pastedUrl) {
        iconUrl = pastedUrl;
      } else {
        const preview = document.getElementById("addIconPreview").src;
        if (preview && preview.startsWith('data:')) {
          iconUrl = preview;
        }
      }
    }
    
    const newSite = {
      name,
      url,
      iconUrl,
      autoFavicon,
      enabled: true,
      useSymbols,
      isDefault: false
    };
    
    currentSites.push(newSite);
    saveSettings(currentSites);
    renderSiteList(currentSites);
    closeAddModal();
  });
  
  document.getElementById("editSiteForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (editingSiteIndex === -1) return;
    
    const site = currentSites[editingSiteIndex];
    site.name = document.getElementById("editSiteName").value;
    site.url = document.getElementById("editSiteUrl").value.trim();
    site.autoFavicon = document.getElementById("editAutoFavicon").checked;
    site.useSymbols = document.getElementById("editUseSymbols").checked;
    
    if (!site.autoFavicon) {
      const pastedUrl = cleanIconPath(document.getElementById("editIconUrl").value);
      if (pastedUrl) {
        site.iconUrl = pastedUrl;
      } else {
        const previewSrc = document.getElementById("editIconPreview").src;
        if (previewSrc && previewSrc.startsWith('data:')) {
          site.iconUrl = previewSrc;
        }
      }
    }
    // Do not clear site.iconUrl to preserve the fallback icon path if autoFavicon is turned off later.
    
    saveSettings(currentSites);
    renderSiteList(currentSites);
    closeEditModal();
  });
  
  document.getElementById("resetDefault").addEventListener("click", resetToDefault);

  // Drag and Drop support to convert image files directly to Base64 data URLs
  const setupDragAndDrop = (inputId, previewId) => {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      input.addEventListener(eventName, preventDefaults, false);
      preview.addEventListener(eventName, preventDefaults, false);
    });

    const handleDrop = (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            input.value = event.target.result;
            input.dispatchEvent(new Event('input'));
          };
          reader.readAsDataURL(file);
        }
      }
    };

    input.addEventListener('drop', handleDrop, false);
    preview.addEventListener('drop', handleDrop, false);
  };

  setupDragAndDrop("addIconUrl", "addIconPreview");
  setupDragAndDrop("editIconUrl", "editIconPreview");
});