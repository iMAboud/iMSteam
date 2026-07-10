// ==UserScript==
// @name         iMSteam
// @version      1.4.1
// @description  Add search links for games on Steam pages with a custom Settings UI
// @author       iMAboud
// @match        https://store.steampowered.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // ---- INJECT CSS ----
    GM_addStyle(`
        .imsteam-switch { position: relative; display: inline-block; width: 34px; height: 20px; }
        .imsteam-switch input { opacity: 0; width: 0; height: 0; }
        .imsteam-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
        .imsteam-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        .imsteam-switch input:checked + .imsteam-slider { background-color: #2196F3; }
        .imsteam-switch input:checked + .imsteam-slider:before { transform: translateX(14px); }
        
        .imsteam-btn-icon { background: transparent; border: none; color: #fff; cursor: pointer; opacity: 0.7; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; padding: 4px; }
        .imsteam-btn-icon:hover { opacity: 1; }
        .imsteam-btn-icon.edit-btn:hover { color: #4ade80; }
        .imsteam-btn-icon.del-btn:hover { color: #f87171; }

        .imsteam-drag-handle { cursor: grab; padding: 0 10px; color: #888; font-size: 16px; user-select: none; }
        .imsteam-site-row { display: flex; justify-content: space-between; align-items: center; background: #2a2a32; padding: 8px 12px 8px 0; border-radius: 8px; transition: background 0.2s; }
        .imsteam-site-row.dragging { opacity: 0.5; background: #3f3f4e; }
        .imsteam-site-row.drag-over { border-top: 2px solid #2196F3; }
        
        .imsteam-input { background: #1e1e24; color: #fff; border: 1px solid #444; padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box; }
        .imsteam-btn-primary { background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .imsteam-btn-secondary { background: #555; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        
        .imsteam-radio-group { display: flex; gap: 10px; }
        .imsteam-radio-label { cursor: pointer; background: #1e1e24; border: 1px solid #444; padding: 4px 10px; border-radius: 100px; font-size: 13px; transition: 0.2s; }
        .imsteam-radio-group input[type="radio"] { display: none; }
        .imsteam-radio-group input[type="radio"]:checked + .imsteam-radio-label { background: #2196F3; border-color: #2196F3; color: white; }
    `);

    // ---- DEFAULT SETTINGS & SITES ----
    function getDefaultSites() {
        return [
            { name: "Online Fix", enabled: true, url: "https://online-fix.me/", iconUrl: "https://i.imgur.com/WAXRAUw.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "Skidrow", enabled: true, url: "https://www.skidrowreloaded.com/", iconUrl: "https://i.imgur.com/BzsknGh.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "FitGirl", enabled: true, url: "https://fitgirl-repacks.site/", iconUrl: "https://i.imgur.com/GOFbweI.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "SteamRIP", enabled: true, url: "https://steamrip.com/", iconUrl: "https://i.imgur.com/tmvOT86.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "Dodi", enabled: true, url: "https://dodi-repacks.site/", iconUrl: "https://i.imgur.com/g71t1Ge.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "Gload", enabled: false, url: "https://gload.to/", iconUrl: "", autoFavicon: true, useSymbols: false, isDefault: true },
            { name: "GOG", enabled: true, url: "https://www.gog-games.to/?search=", iconUrl: "https://i.imgur.com/wXfz72C.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "Crack Watcher", enabled: false, url: "https://crackwatcher.com/search/", iconUrl: "", autoFavicon: true, useSymbols: false, isDefault: true },
            { name: "RuTracker", enabled: false, url: "https://rutracker.org/", iconUrl: "https://i.imgur.com/FUojuvE.png", autoFavicon: false, useSymbols: false, isDefault: true },
            { name: "CS.RIN.RU", enabled: true, url: "https://cs.rin.ru/forum/search.php", iconUrl: "https://i.imgur.com/17Rov4F.png", autoFavicon: false, useSymbols: true, isDefault: true },
            { name: "Nexus Mods", enabled: true, url: "https://www.nexusmods.com/games?keyword=", iconUrl: "", autoFavicon: true, useSymbols: false, isDefault: true },
            { name: "Youtube", enabled: false, url: "https://www.youtube.com/results?search_query=", iconUrl: "", autoFavicon: true, useSymbols: false, isDefault: true },
            { name: "Twitch", enabled: false, url: "https://www.twitch.tv/search?term=", iconUrl: "", autoFavicon: true, useSymbols: false, isDefault: true },
            { name: "Steamdb", enabled: false, url: "https://steamdb.info/search/?a=all&q=", iconUrl: "", autoFavicon: true, useSymbols: false, isDefault: true }
        ];
    }

    let currentSites = GM_getValue('sites', getDefaultSites());
    let faviconGlobal = GM_getValue('faviconGlobal', false);
    let buttonAlignment = GM_getValue('buttonAlignment', 'left');
    let buttonStyle = GM_getValue('buttonStyle', 'pill');
    let labelStyle = GM_getValue('labelStyle', 'hidden');

    function saveSettings() {
        GM_setValue('sites', currentSites);
        GM_setValue('faviconGlobal', faviconGlobal);
        GM_setValue('buttonAlignment', buttonAlignment);
        GM_setValue('buttonStyle', buttonStyle);
        GM_setValue('labelStyle', labelStyle);
    }

    // ---- ICONS & URLS ----
    function getFaviconUrl(siteUrl) {
        try {
            let domain = new URL(siteUrl).hostname;
            if (domain.startsWith('www.')) domain = domain.substring(4);
            return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
        } catch (e) {
            return '';
        }
    }

    function getSiteIconUrl(site) {
        if (faviconGlobal || site.autoFavicon) {
            const fav = getFaviconUrl(site.url);
            return fav || site.iconUrl || 'https://www.google.com/s2/favicons?domain=example.com';
        }
        return site.iconUrl || 'https://www.google.com/s2/favicons?domain=example.com';
    }

    // ---- RENDER BUTTONS ON PAGE ----
    function renderButtons() {
        const selectors = ['.apphub_AppName', '#appHubAppName', '.game_title_area .pageheader', '.game_description_header', '.breadcrumbs .blockbg:last-child a'];
        let gameNameElement = null;
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                gameNameElement = element;
                break;
            }
        }

        if (!gameNameElement) return;

        const gameName = gameNameElement.textContent.trim();
        const formattedNameWithSymbols = encodeURIComponent(gameName.trim());
        const formattedNameWithoutSymbols = encodeURIComponent(
            gameName.toLowerCase().replace(/['_™®©]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
        );

        let buttonContainer = document.querySelector('.imsteam-button-container');
        if (!buttonContainer) {
            buttonContainer = document.createElement("div");
            buttonContainer.className = 'imsteam-button-container';
            if (gameNameElement.parentNode) {
                gameNameElement.parentNode.insertBefore(buttonContainer, gameNameElement.nextSibling);
            }

            buttonContainer.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                openSettingsUI();
            });
        }

        let justify = 'center';
        if (buttonAlignment === 'left') justify = 'flex-start';
        else if (buttonAlignment === 'right') justify = 'flex-end';

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

        buttonContainer.title = "Right-click to open iMSteam Settings";
        buttonContainer.innerHTML = "";

        currentSites.forEach((site) => {
            if (site.enabled) {
                const formattedGameName = site.useSymbols ? formattedNameWithSymbols : formattedNameWithoutSymbols;
                searchGameOnPlatform(buttonContainer, site, formattedGameName);
            }
        });
    }

    function searchGameOnPlatform(container, site, formattedGameName) {
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
                case "Youtube": searchURL = `${site.url}${formattedGameName}`; break;
                case "Twitch": searchURL = `${site.url}${formattedGameName}`; break;
                case "Steamdb": searchURL = `${site.url}${formattedGameName}`; break;
                default: searchURL = `${site.url}?s=${formattedGameName}`;
            }
        } else {
            searchURL = site.url + formattedGameName;
        }

        const linkButton = document.createElement("a");
        linkButton.href = searchURL;
        linkButton.target = "_blank";
        linkButton.title = `Search on ${site.name}`;

        linkButton.style.cssText = `
            display: inline-flex;
            align-items: center;
            text-decoration: none;
            margin: 0 4px;
            cursor: pointer;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
            ${labelStyle === 'below' ? 'flex-direction: column; justify-content: center;' : 'flex-direction: row; justify-content: flex-start;'}
        `;

        const btnVisual = document.createElement("span");

        if (buttonStyle === 'pill') {
            btnVisual.style.cssText = `
                width: 72px; height: 36px; border-radius: 100px;
                background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.08);
                display: inline-flex; align-items: center; justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); overflow: hidden; flex-shrink: 0;
            `;
        } else if (buttonStyle === 'circle') {
            btnVisual.style.cssText = `
                width: 36px; height: 36px; border-radius: 50%;
                background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.08);
                display: inline-flex; align-items: center; justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); overflow: hidden; flex-shrink: 0;
            `;
        } else {
            btnVisual.style.cssText = `
                width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: transparent; border: none;
                box-shadow: none; overflow: visible; flex-shrink: 0;
            `;
        }

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

        const img = new Image();
        img.src = getSiteIconUrl(site);
        img.alt = site.name;

        if (buttonStyle === 'pill') {
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain; padding: 5px; flex-shrink: 0;";
        } else if (buttonStyle === 'circle') {
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain; padding: 4px; flex-shrink: 0;";
        } else {
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain; padding: 0; flex-shrink: 0; border-radius: 0px;";
        }

        btnVisual.appendChild(img);
        linkButton.appendChild(btnVisual);

        if (labelStyle !== 'hidden') {
            const span = document.createElement("span");
            span.textContent = site.name;
            if (labelStyle === 'below') {
                span.style.cssText = "color: #f8fafc; font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 500; margin-top: 5px; text-align: center; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.5); max-width: 80px; overflow: hidden; text-overflow: ellipsis;";
            } else {
                span.style.cssText = "color: #f8fafc; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; margin-left: 8px; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.5);";
            }
            linkButton.appendChild(span);
        }

        container.appendChild(linkButton);
    }

    // ---- SETTINGS UI INJECTION ----
    let settingsOverlay = null;
    let editingIndex = -1;
    let dragSrcEl = null;

    function createSettingsUI() {
        if (settingsOverlay) return;

        settingsOverlay = document.createElement('div');
        settingsOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 999999; display: none;
            justify-content: center; align-items: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        settingsOverlay.innerHTML = `
            <div style="background: #1e1e24; color: #fff; width: 500px; max-width: 90%; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column; max-height: 90vh;">
                
                <!-- MAIN SETTINGS VIEW -->
                <div id="imsteam-main-view" style="display: flex; flex-direction: column; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
                        <h2 style="margin: 0; font-size: 18px;">iMSteam Settings</h2>
                        <button id="imsteam-close-btn" style="background: transparent; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div style="flex-grow: 1; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <h3 style="font-size: 14px; margin-bottom: 8px; color: #aaa;">Appearance</h3>
                            <label style="display: flex; justify-content: space-between; align-items: center; background: #2a2a32; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                                <span>Force Global Favicons</span>
                                <label class="imsteam-switch">
                                    <input type="checkbox" id="imsteam-faviconGlobal" ${faviconGlobal ? 'checked' : ''}>
                                    <span class="imsteam-slider"></span>
                                </label>
                            </label>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #2a2a32; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                                <span>Alignment</span>
                                <div class="imsteam-radio-group">
                                    <label><input type="radio" name="alignment" value="left" ${buttonAlignment === 'left' ? 'checked' : ''}><span class="imsteam-radio-label">Left</span></label>
                                    <label><input type="radio" name="alignment" value="center" ${buttonAlignment === 'center' ? 'checked' : ''}><span class="imsteam-radio-label">Center</span></label>
                                    <label><input type="radio" name="alignment" value="right" ${buttonAlignment === 'right' ? 'checked' : ''}><span class="imsteam-radio-label">Right</span></label>
                                </div>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #2a2a32; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                                <span>Button Style</span>
                                <div class="imsteam-radio-group">
                                    <label><input type="radio" name="btnStyle" value="pill" ${buttonStyle === 'pill' ? 'checked' : ''}><span class="imsteam-radio-label">Pill</span></label>
                                    <label><input type="radio" name="btnStyle" value="circle" ${buttonStyle === 'circle' ? 'checked' : ''}><span class="imsteam-radio-label">Circle</span></label>
                                    <label><input type="radio" name="btnStyle" value="floating" ${buttonStyle === 'floating' ? 'checked' : ''}><span class="imsteam-radio-label">Floating</span></label>
                                </div>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #2a2a32; padding: 10px; border-radius: 8px;">
                                <span>Label Style</span>
                                <div class="imsteam-radio-group">
                                    <label><input type="radio" name="lblStyle" value="hidden" ${labelStyle === 'hidden' ? 'checked' : ''}><span class="imsteam-radio-label">Hidden</span></label>
                                    <label><input type="radio" name="lblStyle" value="next" ${labelStyle === 'next' ? 'checked' : ''}><span class="imsteam-radio-label">Next</span></label>
                                    <label><input type="radio" name="lblStyle" value="below" ${labelStyle === 'below' ? 'checked' : ''}><span class="imsteam-radio-label">Below</span></label>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <h3 style="font-size: 14px; margin: 0; color: #aaa;">Sites</h3>
                                <div>
                                    <button id="imsteam-reset-btn" style="background: transparent; color: #f87171; border: 1px solid #f87171; padding: 4px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 12px; transition: 0.2s;" onmouseover="this.style.background='#f87171'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#f87171';">Reset Default</button>
                                    <button id="imsteam-add-btn" class="imsteam-btn-primary" style="padding: 5px 12px; font-size: 12px;">+ Add Site</button>
                                </div>
                            </div>
                            <div id="imsteam-sites-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
                        </div>
                    </div>
                </div>

                <!-- ADD/EDIT VIEW -->
                <div id="imsteam-form-view" style="display: none; flex-direction: column; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
                        <h2 id="imsteam-form-title" style="margin: 0; font-size: 18px;">Add Site</h2>
                        <button id="imsteam-form-close" style="background: transparent; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">Site Name</label>
                            <input type="text" id="imsteam-form-name" class="imsteam-input" placeholder="e.g. My Custom Search">
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">Search URL Pattern</label>
                            <input type="text" id="imsteam-form-url" class="imsteam-input" placeholder="e.g. https://example.com/search?q=">
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #aaa; margin-bottom: 4px; display: block;">Icon URL (optional)</label>
                            <input type="text" id="imsteam-form-icon" class="imsteam-input" placeholder="e.g. https://example.com/icon.png">
                            <span style="font-size: 11px; color: #888;">Leave empty to auto-fetch favicon.</span>
                        </div>
                        <label style="display: flex; align-items: center; gap: 10px; margin-top: 5px; cursor: pointer;">
                            <input type="checkbox" id="imsteam-form-symbols" style="width: 16px; height: 16px;">
                            <span style="font-size: 14px;">Use Symbols (Don't format name strictly)</span>
                        </label>
                        
                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                            <button id="imsteam-form-cancel" class="imsteam-btn-secondary">Cancel</button>
                            <button id="imsteam-form-save" class="imsteam-btn-primary">Save</button>
                        </div>
                    </div>
                </div>

            </div>
        `;
        document.body.appendChild(settingsOverlay);

        // Listeners for UI toggles
        document.getElementById('imsteam-close-btn').addEventListener('click', closeSettingsUI);
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) closeSettingsUI();
        });

        const updateRender = () => {
            saveSettings();
            renderButtons();
        };

        document.getElementById('imsteam-faviconGlobal').addEventListener('change', (e) => { faviconGlobal = e.target.checked; updateRender(); });

        document.querySelectorAll('input[name="alignment"]').forEach(r => r.addEventListener('change', (e) => { buttonAlignment = e.target.value; updateRender(); }));
        document.querySelectorAll('input[name="btnStyle"]').forEach(r => r.addEventListener('change', (e) => { buttonStyle = e.target.value; updateRender(); }));
        document.querySelectorAll('input[name="lblStyle"]').forEach(r => r.addEventListener('change', (e) => { labelStyle = e.target.value; updateRender(); }));

        document.getElementById('imsteam-reset-btn').addEventListener('click', () => {
            if (confirm('Restore default sites? Custom sites will be kept.')) {
                const customSites = currentSites.filter(s => !s.isDefault);
                currentSites = [...getDefaultSites(), ...customSites];
                updateRender();
                populateSitesList();
            }
        });

        // Add/Edit Listeners
        document.getElementById('imsteam-add-btn').addEventListener('click', () => openFormView());
        document.getElementById('imsteam-form-close').addEventListener('click', closeFormView);
        document.getElementById('imsteam-form-cancel').addEventListener('click', closeFormView);

        document.getElementById('imsteam-form-save').addEventListener('click', () => {
            const name = document.getElementById('imsteam-form-name').value.trim();
            const url = document.getElementById('imsteam-form-url').value.trim();
            const iconUrl = document.getElementById('imsteam-form-icon').value.trim();
            const useSymbols = document.getElementById('imsteam-form-symbols').checked;

            if (!name || !url) { alert("Name and URL are required."); return; }

            if (editingIndex > -1) {
                currentSites[editingIndex] = { ...currentSites[editingIndex], name, url, iconUrl, autoFavicon: !iconUrl, useSymbols };
            } else {
                currentSites.push({ name, url, iconUrl, enabled: true, autoFavicon: !iconUrl, useSymbols, isDefault: false });
            }

            updateRender();
            populateSitesList();
            closeFormView();
        });
    }

    function openFormView(index = -1) {
        editingIndex = index;
        document.getElementById('imsteam-main-view').style.display = 'none';
        document.getElementById('imsteam-form-view').style.display = 'flex';

        if (index > -1) {
            document.getElementById('imsteam-form-title').innerText = "Edit Site";
            const site = currentSites[index];
            document.getElementById('imsteam-form-name').value = site.name || "";
            document.getElementById('imsteam-form-url').value = site.url || "";
            document.getElementById('imsteam-form-icon').value = site.iconUrl || "";
            document.getElementById('imsteam-form-symbols').checked = !!site.useSymbols;
        } else {
            document.getElementById('imsteam-form-title').innerText = "Add Site";
            document.getElementById('imsteam-form-name').value = "";
            document.getElementById('imsteam-form-url').value = "";
            document.getElementById('imsteam-form-icon').value = "";
            document.getElementById('imsteam-form-symbols').checked = false;
        }
    }

    function closeFormView() {
        document.getElementById('imsteam-form-view').style.display = 'none';
        document.getElementById('imsteam-main-view').style.display = 'flex';
        editingIndex = -1;
    }

    function populateSitesList() {
        const list = document.getElementById('imsteam-sites-list');
        list.innerHTML = '';
        currentSites.forEach((site, index) => {
            const row = document.createElement('div');
            row.className = 'imsteam-site-row';
            row.style.opacity = site.enabled ? '1' : '0.5';
            row.draggable = true;
            row.dataset.index = index;

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span class="imsteam-drag-handle" title="Drag to reorder">☰</span>
                    <img src="${getSiteIconUrl(site)}" style="width: 24px; height: 24px; border-radius: 4px; object-fit: contain;">
                    <span style="margin-left: 8px;">${site.name}</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="imsteam-btn-icon edit-btn" data-idx="${index}" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="imsteam-btn-icon del-btn" data-idx="${index}" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                    <label class="imsteam-switch" style="margin-left: 5px;">
                        <input type="checkbox" ${site.enabled ? 'checked' : ''} class="imsteam-toggle-site" data-idx="${index}">
                        <span class="imsteam-slider"></span>
                    </label>
                </div>
            `;

            // Drag and Drop Listeners
            row.addEventListener('dragstart', function (e) {
                this.classList.add('dragging');
                dragSrcEl = this;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', this.dataset.index);
            });

            row.addEventListener('dragover', function (e) {
                if (e.preventDefault) e.preventDefault();
                this.classList.add('drag-over');
                e.dataTransfer.dropEffect = 'move';
                return false;
            });

            row.addEventListener('dragleave', function (e) {
                this.classList.remove('drag-over');
            });

            row.addEventListener('drop', function (e) {
                e.stopPropagation();
                if (dragSrcEl !== this) {
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = parseInt(this.dataset.index);
                    const movedItem = currentSites.splice(fromIndex, 1)[0];
                    currentSites.splice(toIndex, 0, movedItem);
                    saveSettings();
                    renderButtons();
                    populateSitesList();
                }
                return false;
            });

            row.addEventListener('dragend', function (e) {
                this.classList.remove('dragging');
                list.querySelectorAll('.imsteam-site-row').forEach(item => item.classList.remove('drag-over'));
            });

            list.appendChild(row);
        });

        list.querySelectorAll('.imsteam-toggle-site').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = e.target.getAttribute('data-idx');
                currentSites[idx].enabled = e.target.checked;
                saveSettings();
                renderButtons();
                populateSitesList();
            });
        });

        list.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-idx');
                openFormView(idx);
            });
        });

        list.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this site?')) {
                    const idx = e.currentTarget.getAttribute('data-idx');
                    currentSites.splice(idx, 1);
                    saveSettings();
                    renderButtons();
                    populateSitesList();
                }
            });
        });
    }

    function openSettingsUI() {
        createSettingsUI();
        populateSitesList();
        closeFormView();
        settingsOverlay.style.display = 'flex';
    }

    function closeSettingsUI() {
        if (settingsOverlay) settingsOverlay.style.display = 'none';
    }

    // ---- INIT OBSERVER ----
    const startSteamLogic = () => {
        if (!document.body) {
            setTimeout(startSteamLogic, 100);
            return;
        }

        renderButtons();

        let lastUrl = location.href;
        const observer = new MutationObserver((mutations) => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                setTimeout(renderButtons, 500);
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
                setTimeout(renderButtons, 500);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(renderButtons, 1000);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSteamLogic);
    } else {
        startSteamLogic();
    }
})();