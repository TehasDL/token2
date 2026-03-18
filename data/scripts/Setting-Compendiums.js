//Класс для управления модулем токенов бестиария Pathfinder.
class PathfinderBestiaryTokenPack {
  static MASTER_FILE_PATH = "modules/pf2e-token-pack/data/_sources/bestiaries-master.json";
  static SOURCE_FOLDER_PATH = "modules/pf2e-token-pack/data/_sources";
  static USER_BESTIARY_PATH = "modules/pf2e-token-pack";

  static get KEYS() {
    return [
      { key: "pf2e.pathfinder-bestiary"                , name: game.i18n.localize("SettingCompendiums.Bestiary")                      , category: "bestiaries"    },
      { key: "pf2e.pathfinder-bestiary-2"              , name: game.i18n.localize("SettingCompendiums.Bestiary2")                     , category: "bestiaries"    },
      { key: "pf2e.pathfinder-bestiary-3"              , name: game.i18n.localize("SettingCompendiums.Bestiary3")                     , category: "bestiaries"    },
      { key: "pf2e.pathfinder-monster-core"            , name: game.i18n.localize("SettingCompendiums.MonsterCore")                   , category: "bestiaries"    },
      { key: "pf2e.pathfinder-npc-core"                , name: game.i18n.localize("SettingCompendiums.NPCCore")                       , category: "bestiaries"    },
      { key: "pf2e.abomination-vaults-bestiary"        , name: game.i18n.localize("SettingCompendiums.AbominationVaultsBestiary")     , category: "adventurePath" },
      { key: "pf2e.age-of-ashes-bestiary"              , name: game.i18n.localize("SettingCompendiums.AgeofAshesBestiary")            , category: "adventurePath" },
      { key: "pf2e.agents-of-edgewatch-bestiary"       , name: game.i18n.localize("SettingCompendiums.AgentsofEdgewatchBestiary")     , category: "adventurePath" },
      { key: "pf2e.blood-lords-bestiary"               , name: game.i18n.localize("SettingCompendiums.BloodLordsBestiary")            , category: "adventurePath" },
      { key: "pf2e.curtain-call-bestiary"              , name: game.i18n.localize("SettingCompendiums.CurtainCallBestiary")           , category: "adventurePath" },
      { key: "pf2e.extinction-curse-bestiary"          , name: game.i18n.localize("SettingCompendiums.ExtinctionCurseBestiary")       , category: "adventurePath" },
      { key: "pf2e.fists-of-the-ruby-phoenix-bestiary" , name: game.i18n.localize("SettingCompendiums.FistsoftheRubyPhoenixBestiary") , category: "adventurePath" },
      { key: "pf2e.gatewalkers-bestiary"               , name: game.i18n.localize("SettingCompendiums.GatewalkersBestiary")           , category: "adventurePath" },
      { key: "pf2e.outlaws-of-alkenstar-bestiary"      , name: game.i18n.localize("SettingCompendiums.OutlawsofAlkenstarBestiary")    , category: "adventurePath" },
      { key: "pf2e.kingmaker-bestiary"                 , name: game.i18n.localize("SettingCompendiums.KingmakerBestiary")             , category: "adventurePath" },
      { key: "pf2e.quest-for-the-frozen-flame-bestiary", name: game.i18n.localize("SettingCompendiums.QuestfortheFrozenFlameBestiary"), category: "adventurePath" },
      { key: "pf2e.season-of-ghosts-bestiary"          , name: game.i18n.localize("SettingCompendiums.SeasonofGhostsBestiary")        , category: "adventurePath" },
      { key: "pf2e.seven-dooms-for-sandpoint-bestiary" , name: game.i18n.localize("SettingCompendiums.SevenDoomsforSandpointBestiary"), category: "adventurePath" },
      { key: "pf2e.sky-kings-tomb-bestiary"            , name: game.i18n.localize("SettingCompendiums.SkyKingsTombBestiary")          , category: "adventurePath" },
      { key: "pf2e.spore-war-bestiary"                 , name: game.i18n.localize("SettingCompendiums.SporeWar")                      , category: "adventurePath" },
      { key: "pf2e.strength-of-thousands-bestiary"     , name: game.i18n.localize("SettingCompendiums.StrengthofThousandsBestiary")   , category: "adventurePath" },
      { key: "pf2e.triumph-of-the-tusk-bestiary"       , name: game.i18n.localize("SettingCompendiums.TriumphoftheTtusk")             , category: "adventurePath" },
      { key: "pf2e.shades-of-blood-bestiary"           , name: game.i18n.localize("SettingCompendiums.ShadesofBlood")                 , category: "adventurePath" },
      { key: "pf2e.stolen-fate-bestiary"               , name: game.i18n.localize("SettingCompendiums.StolenFateBestiary")            , category: "adventurePath" },
      { key: "pf2e.wardens-of-wildwood-bestiary"       , name: game.i18n.localize("SettingCompendiums.WardensofWildwoodBestiary")     , category: "adventurePath" },
      { key: "pf2e.book-of-the-dead-bestiary"          , name: game.i18n.localize("SettingCompendiums.BookoftheDeadBestiary")         , category: "rulebook"      },
      { key: "pf2e.blog-bestiary"                      , name: game.i18n.localize("SettingCompendiums.PaizoBlogBestiary")             , category: "rulebook"      },
      { key: "pf2e.howl-of-the-wild-bestiary"          , name: game.i18n.localize("SettingCompendiums.HowloftheWildBestiary")         , category: "rulebook"      },
      { key: "pf2e.lost-omens-bestiary"                , name: game.i18n.localize("SettingCompendiums.LostOmensBestiary")             , category: "rulebook"      },
      { key: "pf2e.npc-gallery"                        , name: game.i18n.localize("SettingCompendiums.NPCGallery")                    , category: "rulebook"      },
      { key: "pf2e.pathfinder-dark-archive"            , name: game.i18n.localize("SettingCompendiums.DarkArchive")                   , category: "rulebook"      },
      { key: "pf2e.rage-of-elements-bestiary"          , name: game.i18n.localize("SettingCompendiums.RageofElementsBestiary")        , category: "rulebook"      },
      { key: "pf2e.war-of-immortals-bestiary"          , name: game.i18n.localize("SettingCompendiums.WarofImmortalsBestiary")        , category: "rulebook"      },
      { key: "pf2e.claws-of-the-tyrant-bestiary"       , name: game.i18n.localize("SettingCompendiums.ClawsoftheTyrantBestiary")      , category: "standalone"    },
      { key: "pf2e.fall-of-plaguestone-bestiary"       , name: game.i18n.localize("SettingCompendiums.FallofPlaguestoneBestiary")     , category: "standalone"    },
      { key: "pf2e.malevolence-bestiary"               , name: game.i18n.localize("SettingCompendiums.MalevolenceBestiary")           , category: "standalone"    },
      { key: "pf2e.menace-under-otari-bestiary"        , name: game.i18n.localize("SettingCompendiums.MenaceUnderOtariBestiary")      , category: "standalone"    },
      { key: "pf2e.one-shot-bestiary"                  , name: game.i18n.localize("SettingCompendiums.OneShotBestiary")               , category: "standalone"    },
      { key: "pf2e.prey-for-death-bestiary"            , name: game.i18n.localize("SettingCompendiums.PreyforDeathBestiary")          , category: "standalone"    },
      { key: "pf2e.rusthenge-bestiary"                 , name: game.i18n.localize("SettingCompendiums.RusthengeBestiary")             , category: "standalone"    },
      { key: "pf2e.shadows-at-sundown-bestiary"        , name: game.i18n.localize("SettingCompendiums.ShadowsatSundownBestiary")      , category: "standalone"    },
      { key: "pf2e.the-enmity-cycle-bestiary"          , name: game.i18n.localize("SettingCompendiums.TheEnmityCycleBestiary")        , category: "standalone"    },
      { key: "pf2e.the-slithering-bestiary"            , name: game.i18n.localize("SettingCompendiums.TheSlitheringBestiary")         , category: "standalone"    },
      { key: "pf2e.troubles-in-otari-bestiary"         , name: game.i18n.localize("SettingCompendiums.TroublesinOtariBestiary")       , category: "standalone"    },
      { key: "pf2e.night-of-the-gray-death-bestiary"   , name: game.i18n.localize("SettingCompendiums.NightoftheGrayDeathBestiary")   , category: "standalone"    },
      { key: "pf2e.crown-of-the-kobold-king-bestiary"  , name: game.i18n.localize("SettingCompendiums.CrownoftheKoboldKingBestiary")  , category: "standalone"    },
      { key: "pf2e.pfs-introductions-bestiary"         , name: game.i18n.localize("SettingCompendiums.Intro")                         , category: "season"        },
      { key: "pf2e.pfs-season-1-bestiary"              , name: game.i18n.localize("SettingCompendiums.Season1")                       , category: "season"        },
      { key: "pf2e.paizo-pregens"                      , name: game.i18n.localize("SettingCompendiums.AdventurePregens")              , category: "pregens"       }
    ];
  }

  static registerSettings() {
    this.KEYS.forEach(({key, name, hint}) => {
      game.settings.register("pf2e-token-pack", `enableOverwrite${key}`, {
        name, hint, scope: "world", config: false, default: false, type: Boolean,
      });
    });
  }

  static async buildUserBestiary() {
    try {
        const masterResponse = await fetch(this.MASTER_FILE_PATH);
        if (!masterResponse.ok) {
            ui.notifications.warn(game.i18n.format("SettingCompendiums.WarnMasterNotFound", { path: this.MASTER_FILE_PATH }));
            return null;
        }
        const masterData = await masterResponse.json();
        const idealUserData = {};

        for (const [key, content] of Object.entries(masterData)) {
            const settingKey = `enableOverwrite${key}`;
            if (!game.settings.get("pf2e-token-pack", settingKey)) {
                idealUserData[key] = content;
            }
        }

        let currentUserData = null;
        try {
            const userResponse = await fetch(`${this.USER_BESTIARY_PATH}/bestiaries.json?${Date.now()}`);
            if (userResponse.ok) {
                currentUserData = await userResponse.json();
            }
        } catch (e) {
            console.log(`pf2e-token-pack | ${game.i18n.localize("SettingCompendiums.LogUserBestiaryNew")}`);
        }

        const idealDataString = JSON.stringify(idealUserData, null, 2);
        const currentDataString = JSON.stringify(currentUserData, null, 2);

        if (idealDataString === currentDataString) {
            console.log(`pf2e-token-pack | ${game.i18n.localize("SettingCompendiums.LogUserBestiaryUpToDate")}`);
            return null;
        }

        console.log(`pf2e-token-pack | ${game.i18n.localize("SettingCompendiums.LogUserBestiaryRebuilding")}`);
        const blob = new Blob([idealDataString], { type: "application/json" });
        const file = new File([blob], "bestiaries.json", { type: "application/json" });
        await foundry.applications.apps.FilePicker.implementation.upload("data", this.USER_BESTIARY_PATH, file, {notify: false});
        console.log(`pf2e-token-pack | ${game.i18n.localize("SettingCompendiums.LogUserBestiaryRebuilt")}`);
        
        const content = await foundry.applications.handlebars.renderTemplate("modules/pf2e-token-pack/data/templates/Setting-Compendiums.hbs", { isReloadDialog: true });

        const choice = await foundry.applications.api.DialogV2.prompt({
          window: {
            title: game.i18n.localize("SettingCompendiums.ReloadTitle"),
            classes: ["dialog", "reload-prompt"],
            resizable: false,
          },
          position: {
            width: 350,
            height: "auto"
          },
          content: content,
          buttons: [
            {
              action: "ok",
              label: game.i18n.localize("SettingCompendiums.ReloadButton"),
              default: true
            },
            {
              action: "cancel",
              label: game.i18n.localize("SettingCompendiums.CancelButton")
            }
          ]
        });

        if (choice === "ok") {
          location.reload();
        }
        
        return choice;
    } catch (error) {
        console.error(`pf2e-token-pack | ${game.i18n.localize("SettingCompendiums.BestiariesSyncError")}:`, error);
        ui.notifications.error(game.i18n.localize("SettingCompendiums.BestiariesSyncError"));
        return null;
    }
  }

  static init() {
    game.socket.on("module.pf2e-token-pack", async data => {
      if (data.action === "overwriteBestiary" && game.user.isGM) {
      }
    });
  }
}

//Класс для отрисовки меню настроек модуля.
class PathfinderBestiarySettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  
  static get DEFAULT_OPTIONS() {
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: "pf2e-token-pack-settings",
      window: {
        title: game.i18n.localize("SettingCompendiums.SettingsMenuTitle"),
        resizable: false
      },
      position: { width: 'auto', height: 'auto' }
    });
  }

  static PARTS = {
    content: {
      template: "modules/pf2e-token-pack/data/templates/Setting-Compendiums.hbs",
      classes: ["pf2e-token-pack-settings-form-content"]
    },
  };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const groups = {
      bestiaries: [], adventurePath: [], rulebook: [], standalone: [], season: [], pregens: []
    };

    for (const { key, name, hint, category = "bestiaries" } of PathfinderBestiaryTokenPack.KEYS) {
      const settingKey = `enableOverwrite${key}`;
      const value = game.settings.get("pf2e-token-pack", settingKey);
      const entry = { key, settingKey, name, hint, value };

      if (!groups[category]) groups[category] = [];
      groups[category].push(entry);
    }

    const rawMessage = game.i18n.localize("SettingCompendiums.SettingsMessage");
    const enrichedMessage = await foundry.applications.ux.TextEditor.implementation.enrichHTML(rawMessage, { async: true });

    return { ...ctx, groups, isSettingsForm: true, enrichedSettingsMessage: enrichedMessage };
  }

  async _onCheckCompendium(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const key = button.dataset.key;
    if (key) {
      const checker = new BestiaryIntegrityChecker(key);
      await checker.runCheck();
    }
  }
  
  async _postRender(context, options) {
    await super._postRender?.(context, options);
    const html = $(this.element);
    const toggle = html.find("#toggle-check-buttons");
    const form = html.find("form.settings-menu");

    const updateButtonVisibility = () => {
      form.toggleClass("show-check-buttons", toggle.prop("checked"));
    };
    toggle.on("change", updateButtonVisibility);
    updateButtonVisibility();

    html.find(".check-button").on("click", this._onCheckCompendium.bind(this));

    form.on("submit", (event) => this._onFormSubmit(event));
  }

  async _onFormSubmit(event) {
    event.preventDefault();
    const formData = new foundry.applications.ux.FormDataExtended(event.currentTarget).object;

    let changed = false;
    for (const [key, value] of Object.entries(formData)) {
      if (key.startsWith("enableOverwrite")) {
        const current = game.settings.get("pf2e-token-pack", key);
        if (current !== value) {
          changed = true;
          await game.settings.set("pf2e-token-pack", key, value);
        }
      }
    }

    if (!changed) {
      ui.notifications.info(game.i18n.localize("SettingCompendiums.NoSettingsChanged"));
      return this.close();
    }
    
    const dialogResult = await PathfinderBestiaryTokenPack.buildUserBestiary();
    
    if (dialogResult !== "ok") {
        await this.close();
    }
  }
}

// Отвечает за полную проверку целостности одного компендиума.
class BestiaryIntegrityChecker {
  constructor(key) {
    this.key = key;
    this.pack = game.packs.get(key);
    this.keys = PathfinderBestiaryTokenPack.KEYS;
    this.masterFilePath = PathfinderBestiaryTokenPack.MASTER_FILE_PATH;
    this.sourceFolderPath = PathfinderBestiaryTokenPack.SOURCE_FOLDER_PATH;
  }

  async runCheck() {
    try {
      const masterResponse = await fetch(this.masterFilePath);
      if (!masterResponse.ok) throw new Error(game.i18n.format("SettingCompendiums.ErrorLoadingMaster", { path: this.masterFilePath }));
      const masterData = await masterResponse.json();
      const bestiary = masterData[this.key];

      if (!bestiary) {
        ui.notifications.warn(game.i18n.format("SettingCompendiums.WarnNoDataForKey", { key: this.key }));
        return;
      }

      if (!this.pack) {
        ui.notifications.error(game.i18n.format("SettingCompendiums.ErrorCompendiumNotLoaded", { packName: this.key }));
        return;
      }

      const index = await this.pack.getIndex({ fields: ["name", "type", "folder", "sort"] });
      const naturalSort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });

      const processedIds = new Set();
      const sortedIndex = [];
      const folders = [...this.pack.folders].sort(naturalSort);
      
      const rootDocuments = index.filter(doc => !doc.folder);
      rootDocuments.sort(naturalSort);
      sortedIndex.push(...rootDocuments);
      rootDocuments.forEach(doc => processedIds.add(doc._id));

      for (const folder of folders) {
          const folderContents = index.filter(doc => doc.folder === folder.id);
          folderContents.sort(naturalSort);
          sortedIndex.push(...folderContents);
          folderContents.forEach(doc => processedIds.add(doc._id));
      }

      const orphanDocuments = index.filter(doc => !processedIds.has(doc._id));
      orphanDocuments.sort(naturalSort);
      sortedIndex.push(...orphanDocuments);
      
      const reorderedBestiary = {};
      const compendiumIds = new Set(index.map(e => e._id));

      const deadIdsData = Object.keys(bestiary).filter(id => !compendiumIds.has(id)).map(id => ({ id, name: bestiary[id]?.name || game.i18n.localize("SettingCompendiums.CheckNameNotFound") }));
      const deadIds = deadIdsData.map(d => d.id);
      const missingInModuleByFolder = {};
      const missingImagesByFolder = { art: {}, token: {}, ring: {} };
      const usedFiles = new Set();
      const relatedDirs = new Set();

      const collectPath = (p) => {
        if (p) {
          usedFiles.add(p);
          const dir = p.split("/").slice(0, -1).join("/");
          if (dir.startsWith("modules/pf2e-token-pack")) relatedDirs.add(dir);
        }
      };
      
      async function fileExists(path) {
        if (!path) return false;
        try {
          const dir = path.substring(0, path.lastIndexOf('/'));
          return (await foundry.applications.apps.FilePicker.implementation.browse("data", dir)).files.some(f => f === path);
        } catch { return false; }
      }

      const folderIdToNameMap = new Map(folders.map(f => [f.id, f.name]));
      const rootFolderName = game.i18n.localize("SettingCompendiums.CheckRootFolder");
      const orphanFolderName = game.i18n.localize("SettingCompendiums.CheckOrphanedFolder");
      
      for (const entry of sortedIndex) {
        const { _id: actorId, name: actorName, type, folder } = entry;
        if (type === "hazard") continue;

        const groupName = folder ? (folderIdToNameMap.get(folder) || orphanFolderName) : rootFolderName;
        const expected = bestiary[actorId];

        if (expected) {
          reorderedBestiary[actorId] = expected;
          collectPath(expected.actor);
          collectPath(expected.token?.texture?.src);
          collectPath(expected.token?.ring?.subject?.texture);
          
          const addMissingImage = (imgType, path) => {
            if (!missingImagesByFolder[imgType][groupName]) missingImagesByFolder[imgType][groupName] = [];
            missingImagesByFolder[imgType][groupName].push({ name: actorName, path });
          };

          if (expected.actor && !(await fileExists(expected.actor))) addMissingImage('art', expected.actor);
          if (expected.token?.texture?.src && !(await fileExists(expected.token.texture.src))) addMissingImage('token', expected.token.texture.src);
          if (expected.token?.ring?.subject?.texture && !(await fileExists(expected.token.ring.subject.texture))) addMissingImage('ring', expected.token.ring.subject.texture);
        } else {
          if (!missingInModuleByFolder[groupName]) missingInModuleByFolder[groupName] = [];
          missingInModuleByFolder[groupName].push({ id: actorId, name: actorName });
        }
      }
      
      let allModuleFiles = new Set();
      async function listAllFilesRecursive(dir) {
        const files = [];
        try {
          const result = await foundry.applications.apps.FilePicker.implementation.browse("data", dir);
          files.push(...result.files);
          for (const subdir of result.dirs) {
            files.push(...await listAllFilesRecursive(subdir));
          }
        } catch (err) {}
        return files;
      }
      for (const dir of relatedDirs) {
          const filesInDir = await listAllFilesRecursive(dir);
          filesInDir.forEach(f => allModuleFiles.add(f));
      }
      const unusedFiles = [...allModuleFiles].filter(f => !usedFiles.has(f));

      const unusedFilesByFolder = {};
      for (const path of unusedFiles) {
        const fullDir = path.substring(0, path.lastIndexOf('/'));
        const shortDirName = fullDir.split('/').pop();
        if (!unusedFilesByFolder[shortDirName]) {
          unusedFilesByFolder[shortDirName] = [];
        }
        unusedFilesByFolder[shortDirName].push(path);
      }
      
      const totalMissingInModule = Object.values(missingInModuleByFolder).flat().length;
      const totalMissingArt = Object.values(missingImagesByFolder.art).flat().length;
      const totalMissingToken = Object.values(missingImagesByFolder.token).flat().length;
      const totalMissingRing = Object.values(missingImagesByFolder.ring).flat().length;
      const totalMissingImages = totalMissingArt + totalMissingToken + totalMissingRing;
      const noProblems = deadIds.length === 0 && totalMissingInModule === 0 && unusedFiles.length === 0 && totalMissingImages === 0;

      const originalValidKeys = Object.keys(bestiary).filter(id => compendiumIds.has(id));
      const isOrderDifferent = JSON.stringify(originalValidKeys) !== JSON.stringify(Object.keys(reorderedBestiary));
      
      if (noProblems) {
        const keyObj = this.keys.find(k => k.key === this.key);
        const title = game.i18n.format("SettingCompendiums.CheckTitle", { name: keyObj?.name ?? this.key });
        const content = await foundry.applications.handlebars.renderTemplate("modules/pf2e-token-pack/data/templates/Setting-Compendiums.hbs", { 
          isAllValidDialog: true, 
          isOrderDifferent: isOrderDifferent 
        });

        const choice = await foundry.applications.api.DialogV2.prompt({
          window: {
            title: title,
            resizable: false
          },
          position: { width: 400, height: "auto" },
          content: content,
          buttons: [
            { action: "ok", label: game.i18n.localize("SettingCompendiums.CheckOk"), icon: "fas fa-check", default: true },
            { action: "cancel", label: game.i18n.localize("SettingCompendiums.CancelButton"), icon: "fas fa-times" }
          ]
        });

        if (choice === "ok") {
            if (isOrderDifferent) {
              const finalCompendiumData = reorderedBestiary;

              masterData[this.key] = finalCompendiumData;
              const masterBlob = new Blob([JSON.stringify(masterData, null, 2)], { type: "application/json" });
              await foundry.applications.apps.FilePicker.implementation.upload("data", this.sourceFolderPath, new File([masterBlob], "bestiaries-master.json"), {});

              const keyInfo = this.keys.find(k => k.key === this.key);
              const category = keyInfo?.category;
              const categoryToFolderMap = {
                bestiaries: "bestiary",
                adventurePath: "adventure-patch",
                rulebook: "ruleboock",
                standalone: "standalone-adventures",
                season: "pathfinder-society",
                pregens: "pregenerated-pCs"
              };
              const subfolder = category ? categoryToFolderMap[category] : undefined;
              if (subfolder) {
                const sourceFileName = `${this.key}.json`;
                const sourceFileDirectory = `${this.sourceFolderPath}/${subfolder}`;
                const finalSourceData = { [this.key]: finalCompendiumData };
                const sourceBlob = new Blob([JSON.stringify(finalSourceData, null, 2)], { type: "application/json" });
                await foundry.applications.apps.FilePicker.implementation.upload("data", sourceFileDirectory, new File([sourceBlob], sourceFileName), {});
              }
              
              await PathfinderBestiaryTokenPack.buildUserBestiary();
            } else {
              ui.notifications.info(game.i18n.localize("SettingCompendiums.CheckNoChanges"));
            }
        }
      } else {
        const allFoundGroups = new Set([
            ...Object.keys(missingInModuleByFolder), 
            ...Object.keys(missingImagesByFolder.art),
            ...Object.keys(missingImagesByFolder.token),
            ...Object.keys(missingImagesByFolder.ring)
        ]);

        const sortedDisplayGroups = [];
        if (allFoundGroups.has(rootFolderName)) sortedDisplayGroups.push(rootFolderName);
        folders.forEach(folder => {
            if (allFoundGroups.has(folder.name)) sortedDisplayGroups.push(folder.name);
        });
        if (allFoundGroups.has(orphanFolderName)) sortedDisplayGroups.push(orphanFolderName);
        
        const createList = (items, type) => {
            if (items.length === 0) return `<li>${game.i18n.localize("SettingCompendiums.CheckNoIssues")}</li>`;
            return items.map(item => {
                let details = '';
                if (type === 'id') details = `<br><small>${item.id}</small>`;
                else if (type === 'path') details = `<br><small>${item.path || item}</small>`;
                return `<li><strong>${item.name || 'File'}</strong>${details}</li>`;
            }).join('');
        };
        
        const createFolderizedList = (dataByFolder, sortedGroups, type) => {
            if (Object.keys(dataByFolder).length === 0) return `<li>${game.i18n.localize("SettingCompendiums.CheckNoIssues")}</li>`;
            let html = '';
            for (const groupName of sortedGroups) {
                if (dataByFolder[groupName] && dataByFolder[groupName].length > 0) {
                    html += `<li class="folder-header"><h3>${Handlebars.escapeExpression(groupName)}</h3></li>`;
                    html += createList(dataByFolder[groupName], type);
                }
            }
            return html || `<li>${game.i18n.localize("SettingCompendiums.CheckNoIssues")}</li>`;
        };
    
        const createUnusedList = (filesByFolder) => {
          const sortedFolders = Object.keys(filesByFolder).sort();
          if (sortedFolders.length === 0) {
            return `<li>${game.i18n.localize("SettingCompendiums.CheckNoUnused")}</li>`;
          }
          let html = '';
          for (const folder of sortedFolders) {
            html += `<li class="folder-header"><h3>${Handlebars.escapeExpression(folder)}</h3></li>`;
            const files = filesByFolder[folder].sort();
            html += files.map(path => {
              const name = decodeURIComponent(path.split("/").pop());
              return `<li><strong>${name}</strong><br><small>${path}</small></li>`;
            }).join('');
          }
          return html;
        };
        
        const templateData = {
          isCheckResultsDialog: true,
          summaries: { dead: deadIds.length, missingModule: totalMissingInModule, missingImages: totalMissingImages, unused: unusedFiles.length },
          imageCounts: { art: totalMissingArt, token: totalMissingToken, ring: totalMissingRing },
          lists: {
            dead: createList(deadIdsData, 'id'),
            missingModule: createFolderizedList(missingInModuleByFolder, sortedDisplayGroups, 'id'),
            art: createFolderizedList(missingImagesByFolder.art, sortedDisplayGroups, 'path'),
            token: createFolderizedList(missingImagesByFolder.token, sortedDisplayGroups, 'path'),
            ring: createFolderizedList(missingImagesByFolder.ring, sortedDisplayGroups, 'path'),
            unused: createUnusedList(unusedFilesByFolder)
          }
        };

        const choice = await BestiaryCheckResultsDialog.prompt(this.key, templateData);

        if (choice === "ok") {
            const hasDeadIds = deadIds.length > 0;
            if (!hasDeadIds && !isOrderDifferent) {
                ui.notifications.info(game.i18n.localize("SettingCompendiums.CheckNoChanges"));
                return;
            }
            
            ui.notifications.info(game.i18n.localize("SettingCompendiums.CleaningStarted"));
            const finalCompendiumData = reorderedBestiary;
            
            masterData[this.key] = finalCompendiumData;
            const masterBlob = new Blob([JSON.stringify(masterData, null, 2)], { type: "application/json" });
            await foundry.applications.apps.FilePicker.implementation.upload("data", this.sourceFolderPath, new File([masterBlob], "bestiaries-master.json"), {});
            ui.notifications.info(game.i18n.format("SettingCompendiums.MasterCleaned", { file: "bestiaries-master.json" }));

            const keyInfo = this.keys.find(k => k.key === this.key);
            const category = keyInfo?.category;
            const categoryToFolderMap = {
                bestiaries: "bestiary",
                adventurePath: "adventure-patch",
                rulebook: "ruleboock",
                standalone: "standalone-adventures",
                season: "pathfinder-society",
                pregens: "pregenerated-pCs"
            };

            const subfolder = category ? categoryToFolderMap[category] : undefined;
            if (subfolder) {
                const sourceFileName = `${this.key}.json`;
                const sourceFileDirectory = `${this.sourceFolderPath}/${subfolder}`;
                const finalSourceData = { [this.key]: finalCompendiumData };
                const sourceBlob = new Blob([JSON.stringify(finalSourceData, null, 2)], { type: "application/json" });
                try {
                    await foundry.applications.apps.FilePicker.implementation.upload("data", sourceFileDirectory, new File([sourceBlob], sourceFileName), {});
                    ui.notifications.info(game.i18n.format("SettingCompendiums.SourceCleaned", { file: sourceFileName }));
                } catch (e) {
                    ui.notifications.error(game.i18n.format("SettingCompendiums.ErrorCleaningSource", { file: sourceFileName, message: e.message }));
                }
            } else {
                ui.notifications.warn(game.i18n.format("SettingCompendiums.WarnSourceFolderUndefined", {key: this.key}));
            }
            await PathfinderBestiaryTokenPack.buildUserBestiary();
        }
      }
    } catch (e) {
      console.error(e);
      ui.notifications.error(game.i18n.format("SettingCompendiums.ErrorCheckBestiaries", { message: e.message }));
    }
  }
}

//Класс для отрисовки окна с результатами проверки целостности компендиума.
class BestiaryCheckResultsDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(data, options = {}) {
    super(options);
    this.data = data;
  }

  static get DEFAULT_OPTIONS() {
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: "pf2e-token-pack-check-results",
      window: {
        title: game.i18n.localize("SettingCompendiums.CheckTitleDefault"),
        resizable: false,
        classes: ["dialog", "check-results-dialog"]
      },
      position: { width: 'auto', height: 'auto' },
    });
  }

  static PARTS = {
    content: {
      template: "modules/pf2e-token-pack/data/templates/Setting-Compendiums.hbs"
    }
  };

  async _prepareContext(options) {
    return this.data;
  }
  
  async _postRender(context, options) {
    await super._postRender?.(context, options);
    const footer = this.element.querySelector(".form-footer");
    if (!footer) return;
    
    footer.innerHTML = '';
    const buttons = [
      { action: "ok", label: game.i18n.localize("SettingCompendiums.FixAndDeleteButton"), icon: "fas fa-trash-alt", default: true },
      { action: "cancel", label: game.i18n.localize("SettingCompendiums.CancelButton"), icon: "fas fa-times" }
    ];

    for (const buttonData of buttons) {
      const button = document.createElement("button");
      button.type = "button";
      if (buttonData.default) button.classList.add("default");
      
      const icon = document.createElement("i");
      icon.className = buttonData.icon;
      
      button.append(icon, ` ${buttonData.label}`);
      button.addEventListener("click", () => this.close(buttonData.action));
      footer.append(button);
    }
  }

  static async prompt(key, templateData) {
    const keyObj = PathfinderBestiaryTokenPack.KEYS.find(k => k.key === key);
    const title = game.i18n.format("SettingCompendiums.CheckTitle", { name: keyObj?.name ?? key });
    const app = new this(templateData, { window: { title } });
    return app.render(true);
  }
}

// --- HOOKS ---
Hooks.once('init', () => {
  PathfinderBestiaryTokenPack.init();
  PathfinderBestiaryTokenPack.registerSettings();

  game.settings.registerMenu("pf2e-token-pack", "tokenPackSettings", {
    name: game.i18n.localize("SettingCompendiums.TokenSettingsLabel"),
    label: game.i18n.localize("SettingCompendiums.TokenSettingsButton"),
    hint: game.i18n.localize("SettingCompendiums.TokenSettingsHint"),
    icon: "fas fa-dungeon",
    type: PathfinderBestiarySettingsMenu,
    restricted: true
  });
});

Hooks.once('ready', () => {
  PathfinderBestiaryTokenPack.buildUserBestiary();
});