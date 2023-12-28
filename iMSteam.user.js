// ==UserScript==
// @name         Steam Game Search Links
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add search links for games on Steam pages
// @author       Your Name
// @match        https://store.steampowered.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    function createButton(searchLink, buttonText, tooltipText, iconPath) {
        const gameNameElement = document.getElementById("appHubAppName");
        if (gameNameElement) {
            const linkButton = document.createElement("a");
            linkButton.href = searchLink;
            linkButton.setAttribute("target", "_blank"); 

            const img = new Image();
            img.src = iconPath;
            img.alt = buttonText;
            img.style.width = '64px'; 
            img.style.height = '32px'; 
            img.style.objectFit = 'contain';

            linkButton.appendChild(img);
            linkButton.title = tooltipText;
            linkButton.style.marginRight = '10px'; 
            gameNameElement.parentNode.appendChild(linkButton);
        }
    }

    const formattedGameName = document.getElementById("appHubAppName").textContent.trim().toLowerCase().replace(/'/g, '').replace(/_/g, ' ');

    const steamDBSearchLink = `https://online-fix.me/index.php?do=search&subaction=search&story=${formattedGameName}`;
    createButton(steamDBSearchLink, "Online Fix", "Search on Online Fix", "https://i.imgur.com/WAXRAUw.png");

    const site1SearchLink = `https://www.skidrowreloaded.com/?s=${formattedGameName}&x=0&y=0`;
    createButton(site1SearchLink, "Skidrow", "Search on Skidrow", "https://i.imgur.com/sfzB2DE.png");

    const site2SearchLink = `https://fitgirl-repacks.site/?s=${formattedGameName}`;
    createButton(site2SearchLink, "FitGirl", "Search on FitGirl", "https://i.imgur.com/GOFbweI.png");

    const newSiteSearchLink = `https://steamrip.com/?s=${formattedGameName}`;
    createButton(newSiteSearchLink, "SteamRIP", "Search on SteamRIP", "https://i.imgur.com/tmvOT86.png");

    const new1SiteSearchLink = `https://dodi-repacks.site/?s=${formattedGameName}`;
    createButton(new1SiteSearchLink, "Dodi", "Search on Dodi", "https://i.imgur.com/g71t1Ge.png");

    const new2SiteSearchLink = `https://gload.to/?s=${formattedGameName}`;
    createButton(new2SiteSearchLink, "Gload", "Search on Gload", "https://gload.to/logo.png");
    
    const new3SiteSearchLink = `https://rutracker.org/forum/tracker.php?nm=${formattedGameName}`
    createButton(new3SiteSearchLink, "RuTracker", "https://rutracker.org/favicon-32x32.png");
})();
