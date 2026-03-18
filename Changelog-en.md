# Changelog
[![Changelog-en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/Metofay/pf2e-token-pack/blob/v13/Changelog-en.md)
[![Boosty](https://img.shields.io/badge/Boosty-Metofay?logo=boosty&color=%23FFFFFF)](https://boosty.to/metofay)

### Version 2.4.5

1.  Completed the full transition to support Foundry VTT v13 (ApplicationV2).
2.  Many changes and improvements have been made to the **"Disguise"** mechanic:
    1) **Automation:** Added automatic appearance change when a corresponding effect is triggered on an actor.
    2) **Reset Button:** A button has been added that restores the original actor's data and recreates the appearance prototype if it was deleted (using an internal backup). This function is also available to players.
    3) **Appearance Editing:** You can now edit the visual appearance through the standard token editing sheet. All tabs are synchronized; however, the "Appearance" tab for a saved appearance only updates after clicking the "Update Appearance" button. A field for changing the avatar has also been added there.
    4) **New Save Method:** The data saving mechanism has been reworked. **Important:** It is necessary to recreate actors with appearances to avoid future issues (Apologies for the inconvenience).
    5) **Interface:** Removed redundant notifications for changes that are already visually apparent.
    6) **HUD:** The method for opening the quick access window has been changed—it now opens with a **Right Mouse Button (RMB)** click.
    7) **Fix:** The "Do Not Save" button in the appearance name input window now works correctly and does not save the appearance.
    8) **Compatibility:** The Disguise mechanic is guaranteed to work only for "Player Character" and "NPC" actor types. Functionality with other types has not been tested.
    9) **Restrictions:** When attempting to create a full copy of an actor, selecting types other than "NPC" is now blocked.
    10) **Sizing:** The "Apply Size" option now works correctly and takes data from the original actor. A smooth size transition without jumps has been implemented.
    11) **Synchronization:** There is now full data synchronization between visual appearances.
    12) **Warning:** When editing a full copy of a spellcaster, a warning related to the spellbook will appear. This is a Foundry system error that could not be fixed at this time.
3.  Reworked the Compendium Settings and updated the visual component.
4.  Reworked the Actor Recovery settings and updated its interface. It is now possible to restore actors with their appearances already configured.
5.  **Manifest Links:**
    * Please use the manifest corresponding to your Foundry version:
    * **Manifest for v13:** [v13](https://raw.githubusercontent.com/Metofay/pf2e-token-pack/v13/module.json)
    * **Manifest for v12 (old version, no longer updated):** [v12](https://raw.githubusercontent.com/Metofay/pf2e-token-pack/v12/module.json)

## Version 2.4.3
1. Fixed masking display in the Combat Tracker.
2. Fixed the size of an NPC appearance created from a player character.
3. Fixed character display when its token is moved or deleted while using an appearance.
4. Updated the masking control code. Removed "Create New Appearance" and "Disable Highlight" buttons for players.
5. Added the original appearance to "Saved Appearances" with an option to recreate it.
6. The renaming feature has been moved to "Saved Appearances"; the "Alias for Original" button has been removed.
7. Removed the "Reset to Original" button (the action is available via the HUD and "Saved Appearances").
8. Optimized appearance saving: now only modified data is saved.
9. Fixed the "Full Copy" (phases) feature for prepared spellcasters.
10. Added synchronization of inventory, notes, and effects for the "Full Copy" feature.
11. Added a setting to select the outline type for token highlighting.

## Version 2.4.2
1. Added dynamic tokens for AP Outlaws of Alkenstar
2. Added dynamic tokens for AP Stolen Fate
3. Added dynamic tokens for AP Wardens of Wildwood
4. Added dynamic tokens for AP Strength of Thousands
5. Now the one who owns the actor can use a disguise change. And one more thing, it's enough to make an image once and it will be saved in this actor, if you used blanks, you can delete them. The "Create a new image" button has also been removed from the players

## Version 2.4.1
1. Added dynamic tokens for AP Agents of Edgewatch
2. Added dynamic tokens for AP Extinction Curse
3. Added dynamic tokens for AP Gatewalkers

## Version 2.4.0
1. The logic for disabling compendiums has been reworked. Now, each compendium has its own file, which is then assembled into a single bestiaries-master file. On module load, a bestiaries file is generated in the module root according to the compendium disable settings, copying data from bestiaries-master. For users, this is not a major change, but it is much more convenient for me.
2. Fixed the check logic: in some compendiums, actors could have folders assigned that did not actually exist, causing them to be lost in the results. For example, in the Rage of Elements compendium without art, there are 17 actors, but the check previously showed only 13. Now, the check correctly shows 17 missing, but 4 of them are considered "lost" — they have a folder assigned that no longer exists.
3. Updated the Triumph of the Tusk APP, the first and second books are filled out.

## Version 2.3.5
Disguise Improvements:
1. Quick access for changing.
2. Option to apply size when creating an appearance.
3. For both NPCs and other actor types (Visual only).
4. Token highlighting if it has appearances (visible only to GM), with a function to disable this highlighting for the token.
5. In the settings, you can now control the color of the token highlighting.
6. You can change the name of the original appearance.
7. Setting for the location of the HUD element on the token.
8. Fixed the Actor Restoration setting for actors on stage. It now restores tokens as they are in the compendium, even if dynamic rings were enabled/disabled. The line for ignoring the token's binding to the parent actor in the sidebar has been removed.

## Version 2.3.0
1. Added AP "Shades of Blood".
2. Added 2 art pieces to "Sky King's Tomb".
3. Fixed an issue with actor display in the "Combat" panel when changing disguise.
4. Character Gallery will be a standalone module, but with its settings integrated into the main one.

## Version 2.2.1
1. The module is divided into two parts: the main [**Pathfinder 2E: Token Pack**](https://github.com/Metofay/pf2e-token-pack) and an additional [**Pathfinder 2E: Token Pack (Character Gallery)**](https://github.com/Metofay/pf2e-token-pack-character-gallery). At the moment, Character Gallery can work both separately and together, but in the future, I plan to add compendium art to it, which will tie it to the main module.

## Version 2.2.0
1. Added NPC Actor Disguise, for them only. It allows changing art and token, or creating phases with different stats, like bosses in some games, and you can edit the character sheets of the phases to your liking. For now, without integration with Character Gallery, you will have to create an actor separately, apply it as a Visual, after which you can delete the created actor; the appearance will be saved in the manager.
2. A monstrous addition. I've added two modules and their mechanisms, and removed static tokens. These are Pathfinder Tokens: Character Gallery and Pathfinder Tokens: Myth and Magic. I tried to do a full localization, which required digging into the code. It seems to have worked, but I can't vouch for the translation, as I am a layman in English (heh-heh), so please report translation errors in an issue or on Discord.
3. The module now weighs nearly 1 GB and will only expand. I might split it into two different modules later: one purely for compendiums (the main one), and the second consisting of modules like Character Gallery and Myth and Magic. Some art may be repeated and different, as the modules also added to the compendium itself. I will clean it up later to avoid duplication; the code has already been edited, all that remains is to check it manually.

## Version 2.1.0
1. Added dynamic tokens for AP "Season of Ghosts". The only missing art is in v13; this actor is not in v12.
2. Added dynamic tokens for AP "Blood Lords".
3. Added dynamic tokens for AP "Abomination Vaults".
4. Added dynamic tokens for AP "Seven Dooms for Sandpoint".
5. Added dynamic tokens for AP "Sky King's Tomb".
6. Added dynamic tokens for AP "Curtain Call".

I'm taking a break from this marathon for now. Check out my [boosty](https://boosty.to/metofay), where I'll be posting more often about what I'm working on.

## Version 2.0.0
1. Dynamic tokens for AP "Kingmaker".
2. I forgot how I was versioning the module. Ideally, the first digit (1) is just a number, the second digit (9) is for adding and updating compendiums, and the third digit (7) is for minor fixes in files, nothing critical.
3. Don't forget to check out Boosty, where I can chat with you and you'll find out what's going on behind the scenes.
4. I hope you will write to me, at least on Boosty, about the errors you encounter. Also, write about the art; maybe I forgot to erase something extra somewhere and now it's in the way (I was working on a white background, I could have missed it). There's also a more detailed description and more information for you there.
5. I changed the "Restore Token" setting; now there are more options for you and it's nicely designed.

## Version 1.9.7
1. Added "Pathfinder Society Intro" and "Season 1".
2. Dynamic tokens for "Adventure Pregens" and added a couple of art pieces.
3. I now have a [boosty](https://boosty.to/metofay). I also started a poll there on which adventure we will make dynamic tokens for next.

## Version 1.9.5
1. Added AP "Spore War".
2. Added AP "Triumph of the Tusk" (there are issues with the number of art pieces).
3. Dynamic tokens for Rulebooks "Lost Omens Bestiary".
4. Changed the art for "Weathered Wail" in "Age of Ashes".
5. Dynamic tokens for AP "Quest for the Frozen Flame".
6. Dynamic tokens for AP "Fists of the Ruby Phoenix" (all art has been added, many thanks to Vamp1red for giving the go-ahead for his art).
7. Removed the setting for controlling the actor's ring on the scene.
8. Reworked the actor restoration setting. It now restores actors both on the scene and in the actors sidebar and takes control of the ring. It searches first by ID, and then by original name.

## Version 1.9.1
1. Work is underway on "Season", "Spore War", "Triumph of the Tusk", "Season 1: part 1-00, 1-01".
2. Added dynamic tokens for "Age of Ashes" at the request of the Fairytale Merchant.
3. The setting for checking the bestiary and compendium file has been completely redesigned. Improved visual display style and search and sorting logic.
4. Due to a different sorting type, book folders will appear in each folder to make searching easier. At the moment, I'm optimizing everything more for myself to make it convenient and easier to find everything.
5. Reduced module weight by compressing art and tokens.

## Version 1.9.0
1. Most importantly, the Bestiary compendiums now have dynamic tokens, but regular tokens have been removed to not increase the module's weight. I'll warn you in advance that all actors on the scene will break.
2. The settings for Disabling Compendiums and Checking Compendium Paths have been completely redesigned (this setting is more for me; I found a lot of errors).
3. Many unnecessary files have been removed and the paths and presence of actor images have been corrected. I've put all the files in order.
4. The setting for Restoring Actors on Scene has been redesigned and a setting for Enabling Dynamic Tokens has been added. The point of these two settings is that since I have two types of tokens in the module (dynamic and regular), I had to find a clever solution for the settings to work correctly without giving you a headache. The Enable Dynamic Tokens setting allows you to enable them for all actors on the scene who have them, according to the compendium list, so you don't have to enable each actor manually. The Restore Actors on Scene setting works as it did before, well, almost. Now, if an actor doesn't have dynamic tokens enabled, it won't force them on, but will do everything as usual. The same goes in reverse: if dynamic tokens were enabled, it will check and substitute everything, even substituting the actor's art instead of the standard image, as Foundry would have done it (some actors will just be renamed, as it wasn't done correctly, even the format was wrong).

As a result, to update the actors on the scene and also enable dynamic tokens for the actors from the Bestiaries, you need to do the following:
1) Open the module settings.
2) Select the Enable Dynamic Tokens setting.
3) You will see a window with two labels: "Enabled (number of actors who have it enabled) and an active checkbox" and "Disabled (number of actors who have it disabled) and an inactive checkbox". It may take time to process all actors on the scene.
4) The checkboxes mimic the dynamic ring function in the token settings.
5) If you want to turn them on, click the "Disabled" checkbox, and then update the token. If you want to turn them off, click "Enabled".
6) After that, the actors on your scene will be updated; again, it may take time to process.
7) Then click the Restore Actors on Scene button.
8) A message about the progress and the number of updated actors will appear at the top.

Congratulations, everything is ready. Naturally, enabling and disabling dynamic tokens is only needed so that you don't have to do this manually and can just turn them on for the actors added to the module. If you turn them off, there will be art instead of a token, since I removed the usual tokens from the module, as I wrote above.

5. In principle, everything works the same with the module that adds rings, but there is a nuance. Depending on the choice in the Foundry Core Settings in the "Dynamic Token Rings Fit Modes" item, if you select Standard, the size of your tokens with other rings will decrease slightly and the rings themselves will not go beyond the edges of the creature's size. But if you use standard rings from Foundry (steel and bronze), then your tokens will be slightly smaller. For this, you need to enable the Grade mode so that the size is normal. In general, I hope you figure it out.

## Version 1.8.3
1. Restored the main function of disabling compendiums; I broke it before.
2. Slightly corrected the design of all windows.

Now everything should work as it should. I hope so, and I'm really looking forward to your feedback.

## Version 1.8.2
1. Restored "check arts and tokens on scene".
2. Visually formatted the output window after "check arts and tokens in compendiums".
3. Slightly corrected the output window after "check arts and tokens on scene".
4. Nicely formatted scripts.js.

## Version 1.8.1
1. Forgot about the section of code that adds a check for arts and tokens for actors on stage inside the compendium disable setting 🤣.

## Version 1.8.0
1. Updated to v13, everything works on v12 too.
2. Changed the logic of checking arts and tokens.
3. Removed iconics, since they already exist in the system.
4. Added a button in the settings to check the paths of arts/tokens of actors on the scene (both one and all scenes).
5. Removed the extra code that was used for the previous settings window.

## Version 1.7.0
1. Updated "Beginner Box".
2. Updated "Lost Omens".
3. Reduced the size of the "NPC Core" files (I forgot last time), also changed the case of the names.
4. Added Adventure "Claws of the Tyrant".
5. Deleted data of unnecessary actors in the library (compendium), a total of 354 actors were released (cleaning the module from excess, so to speak):
    1) Bestiary 1 = 292 actors
    2) Bestiary 2 = 42 actors
    3) Bestiary 3 = 18 actors
    4) Fist of the Ruby Phoenix = 1 actor
    5) Rage of Elements = 1 actor
    6) The Slithering = 1 actor
6. No one informed me that the art and token files have not been updated, so now it's a clean download and I advise you to download it from GitHub again.
7. Oh yes, I didn't write it, but okay, now there's a button to check the paths to the art and the token, as well as the presence of extra actors in the bestiary file, including even those who don't display. If there are extra ones, it suggests making a script) However, you need to run it manually.

## Version 1.6.0
1. Separated "NPC Core" and "NPC Gallery".
2. The spelling of the path to art/tokens was changed due to a conflict with the Carousel Combat Tracker, when there was no Art in the carousel at the initiative.
3. Fixed art in AP "Age of Ashes" for "Spiritbound Aluum".
4. Added art in AP "Agents of Edgewatch" for "Carvey".
5. Added army flags in AP "Kingmaker".
6. Added "NPC Core".
7. The name of the module folder has been changed.
8. Changed the spelling of art and tokens; instead of spaces in the name, there is now a hyphen -.

## Version 1.5.2
1. The 1.5.1 release was uploaded incorrectly. I did a full re-upload of the repository to match my local version. At the moment, everything is working normally.

## Version 1.5.1
1. The `bestiaries.json` file and the names of art/tokens have been brought to a common format, like `Child-Of-Belcorra.webp`. Something more or less like how monsters are named in Foundry itself. I hope for feedback on GitHub or Discord, because something might have broken in the process, not taking into account everything that is, etc.

## Version 1.5.0
1. Updated flags in "Kingmaker".
2. Updated SA "Rusthenge".
3. Added Rulebooks "War of Immortals".
4. I converted the `bestiaries.json` file so that the name of the art and tokens is capitalized with the first letter of each word. Kind of like for Linux systems, as I understand it.

## Version 1.4.3
1. Correction of the settings display.

## Version 1.4.2
1. Correction of the settings display.

## Version 1.4.1
1. The modified `bestiaries` file has been added (Thanks danielrab).

## Version 1.4.0
1. Added AP "Curtain Call".

## Version 1.3.0
1. Added AP "Wardens of Wildwood".
2. Added Rulebooks "Howl of the Wild".
3. Added Rulebooks "Lost Omens Tian Xia World Guide".
4. Added code and folders for the "Curtain Call" AP.
5. Added Adventure "Prey for Death".

## Version 1.2.0
1. Added tokens for the "Strength of Thousands" AP, forgot to add them.
2. Updated "Monster Core" (from a new separate module).

## Version 1.1.0
1. Added "Dark Archive".
2. Added "One-Shots" (I had to cut out four leshies manually from group art. Decided not to color Meliosas-Leshy-Wisteria).
3. I intended to add "Vehicles", but there were only 15 art pieces, and I had issues with making tokens.
4. Added missing art in "Extinction Curse" (4 pieces), "Age of Ashes" (1 piece).
5. Added AP "Agents of Edgewatch".
6. Added AP "Fists of the Ruby Phoenix".
7. Added AP "Seven Dooms for Sandpoint".
8. Added AP "Strength of Thousands".
9. Updated "Menace Under Otari".
10. Added links to bug report and changelog.
11. Added settings to turn off parts of code in `bestiaries.json`. By default, you can turn off parts of the bestiary you already have modules and art for.
12. Added localization file for module, description and changelog (English and Russian).

<b>First 3 changes were already added in 1.0.6, but I forgot about it, because I was compressing the whole module.</b>

<b>Changed version release numeration for better understanding when you should update.</b>

## Version 1.0.6
Decreased module size by almost 2 times by compressing files to 100kb or less. Compressed art was saved. I'll restore them if the quality worsens too much.

## Version 1.0.5
While waiting for art for "Agents of Edgewatch" from another person, I made some progress:

1. Added "Pregenerated PCs".
2. Added "Paizo Blog" (some art was taken from the web).
3. Added missing monsters from "Book of the Dead".
4. Added "Lost Omens Impossible Lands".
5. Added "Lost Omens Travel Guide".
6. Added "Lost Omens Highhelm".
7. Finished "NPC Gallery".
8. Added "Rage of Elements".
9. Added some art from "Lost Omens Monsters of Myth".
10. Added a few art pieces from "Crown of the Kobold King".
11. Added one monster from "Malevolence".
12. Added two art pieces from "Menace Under Otari".
13. Added the last art piece from "Outlaws of Alkenstar".

<b>Additionally added code lines for "Fists of the Ruby Phoenix", "Seven Dooms for Sandpoint", "Strength of Thousands", and "Agents of Edgewatch".</b>

## Version 1.0.4
Added AP "Sky King's Tomb".

<b>Additionally re-uploaded all folders due to minor changes.</b>

## Version 1.0.3
Added AP "Gatewalkers".

## Version 1.0.2
Added AP "Extinction Curse" and "Stolen Fate".

<b>Additionally, I looked for missing art/tokens and added what I could. I have no idea where to find the remaining art.</b>

## Version 1.0.1
Added tokens and decreased the size of art for "Monster Core".

## Version 1.0.0
Pay attention that this is still a work in progress, and some APs are missing art/tokens. I intend to patch this in future updates if I can find the missing art. Additionally, "Monster Core" was added with the same issue.

<b>Bestiary:</b>
1. Bestiary 1
2. Bestiary 2
3. Bestiary 3
4. Monster core - Added only arts

<b>Adventure Paths:</b>
1. Abomination Vaults
2. Age of Ashes
3. Blood Lords
4. Gatewalkers
5. Outlaws of Alkenstar
6. Kingmaker
7. Quest for the Frozen
8. Season of Ghosts
9. Sky Kings Tomb
10. Stolen Fate

<b>Rulebooks:</b>
1. Book of the Dead
2. Lost Omens Mwangi Expanse
3. Lost Omens Monsters of Myth
4. Npc Gallery

<b>Standalone Adventures:</b>
1. Fall of Plaguestone
2. Malevolence
3. Menace Under Otari
4. Rusthenge
5. Shadows at Sundown
6. The Enmity Cycle
7. The Slithering
8. Troubles in Otari
9. Night of the Gray Death
10. Crown of the Kobold King