# iMSteam

![Image Description](https://i.imgur.com/Xgdg11U.png)

Adds pirated alternatives on Steam's website. 

## Update
Added Firefox support

Added settings to toggle on/off on sites to show or hide them.

Added Crack Status and GoG Games

Tampermonkey user-script updated to include RuTracker and 1337x (these are only in user-script at the moment).

## Features
Searches for the Steam game you're viewing on the web-page on a cracked game. 
Features 6 sites 
(Online-fix | FitGirl | Skidrowreloaded | SteamRIP | Dodi Repacks | Gload.to | Gog Games | Crack Status)

## Installation
### Chrome Extension
1. Download the extension here [iMSteam for Chrome](https://github.com/iMAboud/iMSteam/raw/main/iMSteam.V.1.3-Chrome.rar) 
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the folder containing the extension files.

### Firefox Extension
(The extension is under review in Mozilla add-on store)

For menual installation:
1. Download the .xpi for firefox here [iMSteam for Firefox](https://github.com/iMAboud/iMSteam/raw/main/iMSteam%20FireFox.xpi)
2. Open Firefox and go to extensions or `about:addons`.
3. Click on the gear icon at the top then select "install add-on from file"
4. Select the "iMSteam FireFox.xpi" file you just downloaded.
5. It will prompt you with confirmation press "Add" and "Okay".

## Installation via Tampermonkey (Thanks to '@Patraskon' for the script and suggestion)

To install this extension as a userscript using Tampermonkey:

1. Click on the userscript file (`iMSteam.user.js`) and copy the entire script.
2. Open Tampermonkey in your browser.
3. Click on the Tampermonkey icon and select "Create a new script."
4. Paste the contents of the userscript into the editor.
5. Save the script by pressing `Ctrl + S` or clicking the "File" menu and selecting "Save."


## Usage

Just browse Steam as normal, you'll find the sites right under the game's name, just click the site that suits you. 
Note: Online-Fix is a Co-Op/Multiplayer only games. You will not find singleplayers on it. Also they mostly support official servers. 

## Customization

### Tampermonkey Script
You can add or remove any site yourself following these simple steps:
- Edit the script and scroll down to see all sites listed as

      const x1337= `https://1337x.to/sort-category-search/${formattedGameName}/Games/seeders/desc/1/`;
      createButton(x1337, "1337x", "Search on 1337x", "https://i.imgur.com/sNwyKFm.png");
    

- Either remove this whole section for each site you wanted removed, or add a site yourself with this exact format

- Copy the search quarry e.g: go to 1337x, do a search, and notice the link includes the word you searched for e.g: https://1337x.to/sort-category-search/THE_WORD_YOU_SEARCHED_FOR/Games/seeders/desc/1/

- Place the link in the script between and move " ${formattedGameName} " to replace the word you searched for, to be something like this: `https://1337x.to/sort-category-search/${formattedGameName}/Games/seeders/desc/1/`

- Add the ID name in lower-case, and the name of the site in lower or upper case. And add a png url. 
 ( IDs must start with a letter, notice why I changed 1337x to "x1337").

- If the search quarry is at the end of the URL just add " ${formattedGameName} " at the end of it.
  
- Save script and refresh steam page. 
