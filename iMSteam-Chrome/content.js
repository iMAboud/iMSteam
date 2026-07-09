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

function getSiteIconUrl(site, faviconGlobal) {
  if (faviconGlobal || site.autoFavicon) {
    const fav = getFaviconUrl(site.url);
    return fav || getLocalOrCustomUrl(site.iconUrl);
  }
  return getLocalOrCustomUrl(site.iconUrl);
}

function searchGameOnPlatform(container, site, formattedGameName, faviconGlobal, buttonStyle, labelStyle) {
  let searchURL;
  if (site.isDefault) {
    switch (site.name) {
      case "Online Fix": searchURL = `${site.url}index.php?do=search&subaction=search&story=${formattedGameName}`; break;
      case "Skidrow": searchURL = `${site.url}?s=${formattedGameName}`; break;
      case "FitGirl": searchURL = `${site.url}?s=${formattedGameName}`; break;
      case "SteamRIP": searchURL = `${site.url}?s=${formattedGameName}`; break;
      case "Dodi": searchURL = `${site.url}?s=${formattedGameName}`; break;
      case "Gload": searchURL = `${site.url}?s=${formattedGameName}`; break;
      case "GOG": searchURL = `${site.url}${formattedGameName}`; break;
      case "Crack Watcher": searchURL = `${site.url}${formattedGameName}`; break;
      case "RuTracker": searchURL = `${site.url}forum/tracker.php?nm=${formattedGameName}`; break;
      case "CS.RIN.RU": searchURL = `${site.url}?keywords=${formattedGameName}&fid[]=10&sr=topics&sf=titleonly&submit=Search`; break;
      case "Nexus Mods": searchURL = `${site.url}${formattedGameName}`; break;
      default: searchURL = `${site.url}?s=${formattedGameName}`;
    }
  } else {
    searchURL = site.url + formattedGameName;
  }
  createButton(container, searchURL, site.name, `Search on ${site.name}`, site, faviconGlobal, buttonStyle, labelStyle);
}

function createButton(container, searchLink, buttonText, tooltipText, site, faviconGlobal, buttonStyle, labelStyle) {
  const linkButton = document.createElement("a");
  linkButton.href = searchLink;
  linkButton.target = "_blank";
  
  // Outer anchor element setup
  linkButton.style.cssText = `
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    margin: 0 4px;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  `;

  if (labelStyle === 'below') {
    linkButton.style.flexDirection = 'column';
    linkButton.style.justifyContent = 'center';
  } else {
    linkButton.style.flexDirection = 'row';
    linkButton.style.justifyContent = 'flex-start';
  }

  // Visual container span inside the anchor link
  const btnVisual = document.createElement("span");
  btnVisual.className = "imsteam-btn-container";
  
  // Set dimensions and visual properties of the container
  if (buttonStyle === 'pill') {
    btnVisual.style.cssText = `
      width: 72px;
      height: 36px;
      border-radius: 100px;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      flex-shrink: 0;
    `;
  } else if (buttonStyle === 'circle') {
    btnVisual.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      flex-shrink: 0;
    `;
  } else {
    // Floating: no background, no border-radius crop, overflow visible!
    btnVisual.style.cssText = `
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: transparent;
      border: none;
      box-shadow: none;
      overflow: visible;
      flex-shrink: 0;
    `;
  }

  // Hover transitions on the outer linkButton itself (smooth container animations)
  linkButton.addEventListener('mouseover', () => {
    linkButton.style.transform = 'translateY(-2px)';
    if (buttonStyle !== 'floating') {
      btnVisual.style.background = 'rgba(10, 15, 30, 0.75)';
      btnVisual.style.borderColor = 'rgba(139, 92, 246, 0.25)';
      btnVisual.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.65), 0 0 10px rgba(139, 92, 246, 0.15)';
    } else {
      btnVisual.style.transform = 'scale(1.1)';
      btnVisual.style.filter = 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.7))';
    }
  });

  linkButton.addEventListener('mouseout', () => {
    linkButton.style.transform = 'translateY(0)';
    if (buttonStyle !== 'floating') {
      btnVisual.style.background = 'rgba(15, 23, 42, 0.45)';
      btnVisual.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      btnVisual.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    } else {
      btnVisual.style.transform = 'scale(1)';
      btnVisual.style.filter = 'none';
    }
  });

  // Site Icon Sizing & Padding refinements: Let them fill the container beautifully!
  const img = new Image();
  img.src = getSiteIconUrl(site, faviconGlobal);
  img.alt = buttonText;
  img.classList.add("site-icon");
  
  if (buttonStyle === 'pill') {
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 5px;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    `;
  } else if (buttonStyle === 'circle') {
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 4px;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    `;
  } else {
    // Floating: fill completely with no padding so it's as large as possible
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0;
      transition: transform 0.3s ease;
      flex-shrink: 0;
      border-radius: 0px;
    `;
  }

  btnVisual.appendChild(img);
  linkButton.appendChild(btnVisual);
  linkButton.title = tooltipText;

  // Label configuration (sibling outside container)
  if (labelStyle !== 'hidden') {
    const span = document.createElement("span");
    span.textContent = site.name;
    
    if (labelStyle === 'below') {
      span.style.cssText = `
        color: #f8fafc;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 10px;
        font-weight: 500;
        margin-top: 5px;
        text-align: center;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
    } else {
      // labelStyle === 'next'
      span.style.cssText = `
        color: #f8fafc;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        margin-left: 8px;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      `;
    }
    linkButton.appendChild(span);
  }

  container.appendChild(linkButton);
}

function initializeExtension() {
  const selectors = [
    '.apphub_AppName',
    '#appHubAppName',
    '.game_title_area .pageheader',
    '.game_description_header',
    '.breadcrumbs .blockbg:last-child a'
  ];

  let gameNameElement = null;
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      gameNameElement = element;
      break;
    }
  }

  if (gameNameElement) {
    const gameName = gameNameElement.textContent.trim();
    const formattedNameWithSymbols = encodeURIComponent(gameName.trim());
    const formattedNameWithoutSymbols = encodeURIComponent(
      gameName.toLowerCase()
        .replace(/['_™®©]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    );
    
    chrome.storage.local.get({
      sites: [],
      faviconGlobal: false,
      buttonAlignment: 'left',
      buttonStyle: 'pill',
      labelStyle: 'hidden'
    }, (data) => {
      const storedSites = data.sites;
      const faviconGlobal = data.faviconGlobal;
      const alignment = data.buttonAlignment;
      const buttonStyle = data.buttonStyle;
      const labelStyle = data.labelStyle;

      if (!storedSites || storedSites.length === 0) return;

      let buttonContainer = document.querySelector('.imsteam-button-container');
      if (!buttonContainer) {
        buttonContainer = document.createElement("div");
        buttonContainer.className = 'imsteam-button-container';
        if (gameNameElement.parentNode) {
          gameNameElement.parentNode.insertBefore(buttonContainer, gameNameElement.nextSibling);
        }
      }

      // Map alignment dropdown value to flex justify
      let justify = 'center';
      if (alignment === 'left') justify = 'flex-start';
      else if (alignment === 'right') justify = 'flex-end';

      buttonContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        justify-content: ${justify};
        align-items: center;
        margin-top: 10px;
        gap: 8px;
        padding: 5px;
        border-radius: 12px;
        width: 100%;
      `;

      buttonContainer.innerHTML = "";
      storedSites.forEach((site) => {
        if (site.enabled) {
          const formattedGameName = site.useSymbols ? formattedNameWithSymbols : formattedNameWithoutSymbols;
          searchGameOnPlatform(buttonContainer, site, formattedGameName, faviconGlobal, buttonStyle, labelStyle);
        }
      });
    });
  }
}

const startSteamLogic = () => {
  if (!document.body) {
    setTimeout(startSteamLogic, 100);
    return;
  }
  initializeExtension();
  
  let lastUrl = location.href;
  const observer = new MutationObserver((mutations) => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(initializeExtension, 500);
    }
    
    const shouldReinit = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return node.matches?.('.apphub_AppName, #appHubAppName, .game_title_area, .game_description_header') ||
                 node.querySelector?.('.apphub_AppName, #appHubAppName, .game_title_area, .game_description_header');
        }
        return false;
      });
    });
    
    if (shouldReinit) {
      setTimeout(initializeExtension, 500);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.sites || changes.faviconGlobal || changes.buttonAlignment || changes.buttonStyle || changes.labelStyle) {
      initializeExtension();
    }
  });
  
  setTimeout(initializeExtension, 1000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startSteamLogic);
} else {
  startSteamLogic();
}