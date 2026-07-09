const defaultSites = [
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
    enabled: true,
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
    enabled: true,
    url: "https://crackwatcher.com/search/",
    iconUrl: "icons/CrackWatcher.png",
    autoFavicon: false,
    useSymbols: false,
    isDefault: true
  },
  {
    name: "RuTracker",
    enabled: true,
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
    useSymbols: false,
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
  }
];

const initializeDefaultSites = () => {
  chrome.storage.local.get(['sites', 'faviconGlobal', 'buttonAlignment', 'buttonStyle', 'labelStyle'], (data) => {
    let currentSites = data.sites || [];
    
    let updates = {};
    if (currentSites.length === 0) {
      currentSites = defaultSites;
      updates.sites = defaultSites;
    }
    if (data.faviconGlobal === undefined) {
      updates.faviconGlobal = false;
    }
    if (data.buttonAlignment === undefined) {
      updates.buttonAlignment = 'left';
    }
    if (data.buttonStyle === undefined) {
      updates.buttonStyle = 'pill';
    }
    if (data.labelStyle === undefined) {
      updates.labelStyle = 'hidden';
    }

    const rinSiteIndex = currentSites.findIndex(site => site.name === "CS.RIN.RU");
    if (rinSiteIndex === -1) {
      const rinSite = defaultSites.find(site => site.name === "CS.RIN.RU");
      const nexusIndex = currentSites.findIndex(site => site.name === "Nexus Mods");
      if (nexusIndex !== -1) {
        currentSites.splice(nexusIndex, 0, rinSite);
      } else {
        currentSites.push(rinSite);
      }
      updates.sites = currentSites;
    } else {
      if (currentSites[rinSiteIndex].iconUrl === "icons/icon48.png" || !currentSites[rinSiteIndex].iconUrl) {
        currentSites[rinSiteIndex].iconUrl = "icons/Csrin.png";
        updates.sites = currentSites;
      }
    }

    // Migrate old format (missing useSymbols or autoFavicon)
    let needsMigration = false;
    const migratedSites = currentSites.map(site => {
      let updated = false;
      let newSite = { ...site };
      if (newSite.useSymbols === undefined) {
        newSite.useSymbols = newSite.useSymbols ?? false;
        updated = true;
      }
      if (newSite.autoFavicon === undefined) {
        newSite.autoFavicon = newSite.isDefault ? false : true;
        updated = true;
      }
      if (updated) {
        needsMigration = true;
      }
      return newSite;
    });

    if (needsMigration) {
      updates.sites = migratedSites;
    }

    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates, () => {
        console.log('Seeded configuration schema updates: ', updates);
      });
    }
  });
};

chrome.runtime.onInstalled.addListener(initializeDefaultSites);
initializeDefaultSites();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openLink" && message.url) {
    chrome.tabs.create({ url: message.url });
  }
});