// ==UserScript==
// @name         iMSteam
// @version      1.3
// @description  Add search links for games on Steam pages
// @author       iMAboud
// @match        https://store.steampowered.com/*
// ==/UserScript==

(function() {
    'use strict';

    function createButton(searchLink, buttonText, tooltipText, iconPath) {
        const gameNameElement = document.getElementById("appHubAppName");
        if (gameNameElement) {
            const linkButton = document.createElement("a");
            linkButton.href = searchLink;
            linkButton.setAttribute("target", "_blank");
            linkButton.title = tooltipText;
            linkButton.style.display = 'inline-block';
            linkButton.style.marginRight = '10px';
            linkButton.style.position = 'relative';

            const img = new Image();
            img.src = iconPath;
            img.alt = buttonText;
            img.style.width = '64px';
            img.style.height = '32px';
            img.style.objectFit = 'contain';
            img.style.transition = 'transform 0.3s ease-in-out';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
            img.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Slightly darker background

            linkButton.appendChild(img);
            gameNameElement.parentNode.appendChild(linkButton);
        }
    }

    const formattedGameName = document.getElementById("appHubAppName").textContent.trim().toLowerCase().replace(/'/g, '').replace(/_/g, ' ');

    const onlinefix = `https://online-fix.me/index.php?do=search&subaction=search&story=${formattedGameName}`;
    createButton(onlinefix, "Online Fix", "Search on Online Fix", "https://i.imgur.com/WAXRAUw.png");

    const skidrow = `https://www.skidrowreloaded.com/?s=${formattedGameName}&x=0&y=0`;
    createButton(skidrow, "Skidrow", "Search on Skidrow", "https://i.imgur.com/sfzB2DE.png");

    const fitgirl = `https://fitgirl-repacks.site/?s=${formattedGameName}`;
    createButton(fitgirl, "FitGirl", "Search on FitGirl", "https://i.imgur.com/GOFbweI.png");

    const steamrip = `https://steamrip.com/?s=${formattedGameName}`;
    createButton(steamrip, "SteamRIP", "Search on SteamRIP", "https://i.imgur.com/tmvOT86.png");

    const dodi = `https://dodi-repacks.site/?s=${formattedGameName}`;
    createButton(dodi, "Dodi", "Search on Dodi", "https://i.imgur.com/g71t1Ge.png");

    const gload = `https://gload.to/?s=${formattedGameName}`;
    createButton(gload, "Gload", "Search on Gload", "https://gload.to/logo.png");

    const gog = `https://www.gog-games.to/search/${formattedGameName}`;
    createButton(gog, "GOG", "Search on GOG", "https://i.imgur.com/wXfz72C.png");

    const crackstatus = `https://crackstatus.net/tracker.php?nm=${formattedGameName}`;
    createButton(crackstatus, "Crack Status", "Search on Crack Status", "https://crackstatus.net/styles/templates/default/images/Hot_icons/rel/PNL2.png");

    const rutracker= `https://rutracker.org/forum/tracker.php?nm=${formattedGameName}`;
    createButton(rutracker, "RuTracker", "Search on RuTracker", "https://i.imgur.com/FUojuvE.png");

    const x1337= `https://1337x.to/sort-category-search/${formattedGameName}/Games/seeders/desc/1/`;
    createButton(x1337, "1337x", "Search on 1337x", "https://i.imgur.com/sNwyKFm.png");

    GM_addStyle(`
        body {
            background-color: #222;
            font-family: Arial, sans-serif;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        a {
            display: inline-block;
            transition: transform 0.3s ease-in-out;
            margin-right: 10px;
            position: relative;
        }

        a img {
            width: 64px;
            height: 32px;
            object-fit: contain;
            transition: transform 0.3s ease-in-out;
            border-radius: 8px;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
            background-color: rgba(0, 0, 0, 0.2); /* Slightly darker background */
        }

        a:hover img {
            transform: scale(1.1);
        }
    `);
})();
