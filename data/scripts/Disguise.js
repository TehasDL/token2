//Класс приложения для создания нового образа (маскировки).
class DisguiseApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(actor, token = null, sheet = null, options = {}) {
    super(options);
    this.actor = actor;
    this.token = token;
    this.sheet = sheet;
    this.isHybridOnly = options.isHybridOnly ?? false;
  }

  static get DEFAULT_OPTIONS() {
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: "disguise-app",
      window: {
        title: game.i18n.localize("Disguise.CreateNewDisguise"),
      },
      position: { width: 'auto', height: "auto" }
    });
  }

  static PARTS = {
    content: {
      template: "modules/pf2e-token-pack/data/templates/Disguise.hbs",
      classes: ["disguise-app-window"]
    },
  };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    return {
      ...ctx,
      isDisguiseApp: true,
      isPhaseManagerApp: false,
      isHybridOnly: this.isHybridOnly
    };
  }

  async _postRender(context, options) {
    await super._postRender?.(context, options);
    const root = this.element;
    const dropZone = root.querySelector(".drop-target");
    if (dropZone) {
      dropZone.addEventListener("dragover", ev => {
        ev.preventDefault();
        dropZone.style.boxShadow = "0 0 15px rgba(0,255,0,.7)";
      });
      dropZone.addEventListener("dragleave", () => dropZone.style.boxShadow = "");
      dropZone.addEventListener("drop", ev => {
        ev.preventDefault();
        dropZone.style.boxShadow = "";
        this._onDrop(ev);
      });
    }
  }

  async _onDrop(event) {
    let data;
    try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch { return; }
    if (!data?.type || !data?.uuid) return;

    let sourceActor, sourceData;
    if (data.type === "Actor") {
        sourceActor = await fromUuid(data.uuid);
        if (!sourceActor) return;
        sourceData = sourceActor.toObject();
        sourceData.prototypeToken = sourceActor.prototypeToken.toObject();
    } else if (data.type === "Token") {
        const tokenDoc = await fromUuid(data.uuid);
        if (!tokenDoc?.actor) return;
        sourceActor = tokenDoc.actor;
        sourceData = sourceActor.toObject();
        const tokenData = tokenDoc.toObject();
        
        delete tokenData.actorId;
        delete tokenData.x;
        delete tokenData.y;
        delete tokenData.elevation;
        
        sourceData.prototypeToken = tokenData;
        sourceData.img = tokenDoc.texture.src;
    } else {
        return ui.notifications.warn(game.i18n.localize("Disguise.DropWarningOnlyActor"));
    }

    const isFullCopy = !this.isHybridOnly && (this.element.querySelector('#save-mode-toggle')?.checked ?? false);
    const applySize = this.element.querySelector('#apply-size-toggle')?.checked ?? false;

    if (isFullCopy && sourceActor.type !== 'npc') {
        ui.notifications.warn(game.i18n.localize("Disguise.FullCopyNpcOnlyWarning"));
        this.close();
        return;
    }

    if (game.user.isGM) {
        this._promptToSaveDisguise(sourceActor, isFullCopy, sourceData, { applySize });
    } else {
        ui.notifications.warn(game.i18n.localize("Disguise.NoPermission"));
    }

    this.close();
  }

  async _promptToSaveDisguise(sourceActor, isFullCopy, dataForDisguise, options = { applySize: true }) {
    const dialogText = game.i18n.format(
        isFullCopy ? "Disguise.SaveFullCopyPrompt" : "Disguise.SaveHybridPrompt",
        { name: sourceActor.name }
    );

    const safeDefaultName = foundry.utils.escapeHTML(sourceActor.name);

    const content = `
    <div class="disguise-save-dialog">
        <p>${dialogText}</p>
        <div class="form-group">
        <label>${game.i18n.localize("Disguise.NameLabel")}</label>
        <input name="disguiseName" type="text" style="width:100%;" value="${safeDefaultName}"/>
        </div>
    </div>
    `;

    new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("Disguise.SaveNewPromptTitle") },
        content,
        buttons: [
            {
                action: "save",
                icon: "fas fa-save",
                label: game.i18n.localize("Disguise.SaveButtonLabel"),
                default: true,
                callback: async (event, button, dialog) => {
                    const name = button.form?.elements?.disguiseName?.value?.trim?.();
                    if (!name) {
                        ui.notifications.warn(game.i18n.localize("Disguise.NameRequiredWarning"));
                        return;
                    }

                    let dataToSave;
                    
                    if (isFullCopy) {
                        dataToSave = foundry.utils.deepClone(dataForDisguise);
                        const originalActor = this.actor;

                        const inventoryItemTypes = ['weapon', 'armor', 'shield', 'equipment', 'consumable', 'treasure', 'backpack'];

                        const originalInventory = originalActor.items.filter(i => inventoryItemTypes.includes(i.type)).map(i => i.toObject());
                        const originalNotes = {
                            public: originalActor.system.details.publicNotes,
                            private: originalActor.system.details.privateNotes
                        };

                        const donorMechanicalItems = dataToSave.items.filter(i => !inventoryItemTypes.includes(i.type));

                        dataToSave.items = [...donorMechanicalItems, ...originalInventory];

                        if (!dataToSave.system) dataToSave.system = {};
                        if (!dataToSave.system.details) dataToSave.system.details = {};
                        dataToSave.system.details.publicNotes = originalNotes.public;
                        dataToSave.system.details.privateNotes = originalNotes.private;

                    } else {
                        const originalPrototype = this.actor.prototypeToken;
                        const originalVisuals = this.actor.getFlag('pf2e-token-pack', 'data_original_visuals');
                        const donorPrototype = dataForDisguise.prototypeToken;
                        const newPrototype = foundry.utils.deepClone(donorPrototype);
                        
                        const nonAppearanceKeys = [
                            "bar1", "bar2", "detectionModes", "displayName", "disposition", "displayBars",
                            "light", "sight", "movementAction", "occludable", "turnMarker", "name"
                        ];
                        for (const key of nonAppearanceKeys) {
                            if (foundry.utils.hasProperty(originalPrototype, key)) {
                                newPrototype[key] = foundry.utils.deepClone(originalPrototype[key]);
                            }
                        }
                        
                        const visualDataToSave = {
                            name: dataForDisguise.name,
                            img: dataForDisguise.img,
                            prototypeToken: newPrototype,
                            system: {},
                            type: dataForDisguise.type
                        };

                        if (options.applySize) {
                            let sourceSizeValue;
                            if (dataForDisguise.system?.traits?.size?.value) {
                                sourceSizeValue = dataForDisguise.system.traits.size.value;
                            } else {
                                const ancestry = (dataForDisguise.items ?? []).find(i => i.type === 'ancestry');
                                if (ancestry?.system?.size) sourceSizeValue = ancestry.system.size;
                            }

                            if (sourceSizeValue) {
                                visualDataToSave.system.traits = { size: { value: sourceSizeValue } };
                                if (this.actor.type === 'character') {
                                    const sizeMap = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
                                    const dimension = sizeMap[sourceSizeValue] ?? 1;
                                    visualDataToSave.prototypeToken.width = dimension;
                                    visualDataToSave.prototypeToken.height = dimension;
                                    foundry.utils.setProperty(visualDataToSave.prototypeToken, "flags.pf2e.linkToActorSize", false);
                                }
                            }
                        } else {
                            if (originalVisuals?.prototypeToken) {
                                visualDataToSave.prototypeToken.width = originalVisuals.prototypeToken.width;
                                visualDataToSave.prototypeToken.height = originalVisuals.prototypeToken.height;
                                foundry.utils.setProperty(visualDataToSave.prototypeToken, "flags.pf2e.linkToActorSize", originalVisuals.prototypeToken.flags?.pf2e?.linkToActorSize ?? false);
                            }
                            
                            if (originalVisuals?.system?.traits?.size) {
                                visualDataToSave.system.traits = { size: originalVisuals.system.traits.size };
                            }
                        }

                        visualDataToSave.prototypeToken.texture.scaleX = donorPrototype.texture.scaleX;
                        visualDataToSave.prototypeToken.texture.scaleY = donorPrototype.texture.scaleY;
                        foundry.utils.setProperty(visualDataToSave.prototypeToken, "flags.pf2e.autoscale", donorPrototype.flags?.pf2e?.autoscale ?? false);
                        
                        dataToSave = visualDataToSave;
                    }

                    if (dataToSave.prototypeToken) {
                        dataToSave.prototypeToken.name = this.actor.prototypeToken.name;
                    }
                    dataToSave.name = name;
                    // ИСПРАВЛЕННАЯ СТРОКА: Правильный путь и извлечение ID
                    dataToSave.sourceUuid = sourceActor._stats?.compendiumSource?.split('.').pop() ?? null;

                    if (this.actor.type === 'character' && dataToSave.prototypeToken) {
                        dataToSave.prototypeToken.actorLink = true;
                    }

                    const masterList = this.actor.getFlag('pf2e-token-pack', 'disguises') || [];
                    const newId = foundry.utils.randomID();
                    const flagKey = `data_${newId}`;
                    
                    const newDisguiseEntry = { id: newId, name, type: isFullCopy ? 'full' : 'hybrid', shouldApplySize: options.applySize };
                    
                    masterList.push(newDisguiseEntry);

                    await this.actor.setFlag('pf2e-token-pack', flagKey, dataToSave);
                    await this.actor.setFlag('pf2e-token-pack', 'disguises', masterList);

                    await requestDisguiseChange({
                        actor: this.actor,
                        token: this.token,
                        sheet: this.sheet,
                        sourceType: 'flag',
                        sourceId: newId,
                        type: newDisguiseEntry.type,
                        options: { applySize: newDisguiseEntry.shouldApplySize }
                    });

                    ui.notifications.info(game.i18n.format("Disguise.SaveSuccess", { name }));
                    refreshDisguiseApps(this.actor);
                }
            },
            {
                action: "cancel",
                icon: "fas fa-times",
                label: game.i18n.localize("Disguise.DoNotSaveButtonLabel")
            }
        ],
    }).render(true);
  }
}

//Класс приложения для управления сохраненными образами.
class PhaseManagerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(actor, token, sheet, options = {}) {
        super(options);
        this.actor = actor;
        this.token = token;
        this.sheet = sheet;
    }

    get title() {
        return game.i18n.localize("Disguise.SavedDisguisesButton");
    }

    static DEFAULT_OPTIONS = {
        id: "phase-manager-app",
        window: { frame: true, resizable: false, minimizable: true },
        position: { width: 'auto', height: "auto" },
    };

    static PARTS = {
        content: {
            template: "modules/pf2e-token-pack/data/templates/Disguise.hbs",
            classes: ["disguise-app-window"]
        }
    };

    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        
        let masterList = this.actor.getFlag("pf2e-token-pack", "disguises") ?? [];
        const activeDisguiseId = this.actor.getFlag("pf2e-token-pack", "lastAppliedDisguiseId");
        const partition = masterList.reduce((acc, d) => {
            (d.type === "full" ? acc.fulls : acc.hybrids).push(d);
            return acc;
        }, { fulls: [], hybrids: [] });
        
        for (const disguise of [...partition.fulls, ...partition.hybrids]) {
          const flagKey = (disguise.id === 'original') ? 'data_original_visuals' : `data_${disguise.id}`;
          const data = this.actor.getFlag("pf2e-token-pack", flagKey);
          if (data) {
            disguise.img = data.img || CONST.DEFAULT_TOKEN;
            disguise.name = (disguise.id === 'original') 
                ? game.i18n.format("Disguise.OriginalActor", { name: data.name }) 
                : data.name;
            disguise.isActive = disguise.id === activeDisguiseId;
          }
        }
        return { ...ctx, ...partition, isManager: true, isPhaseManagerApp: true };
    }

    async _postRender(context, options) {
        await super._postRender(context, options);
        const html = this.element;
        html.querySelectorAll('.apply-phase').forEach(b => b.addEventListener('click', this._onApplyPhase.bind(this)));
        html.querySelectorAll('.rename-phase').forEach(b => b.addEventListener('click', this._onRenamePhase.bind(this)));
        html.querySelectorAll('.edit-phase').forEach(b => b.addEventListener('click', this._onEditPhase.bind(this)));
        html.querySelectorAll('.delete-phase').forEach(b => b.addEventListener('click', this._onDeletePhase.bind(this)));
    }
  
    async _onApplyPhase(event) {
        const target = event.currentTarget.closest('.phase-item');
        const id = target.dataset.id;
        const disguise = (this.actor.getFlag("pf2e-token-pack", "disguises") ?? []).find(d => d.id === id);
        if (disguise) await requestDisguiseChange({ actor: this.actor, token: this.token, sheet: this.sheet, sourceType: "flag", sourceId: id, type: disguise.type, options: { applySize: disguise.shouldApplySize }});
        this.close();
    }
    
    async _onEditPhase(event) {
    const id = event.currentTarget.closest('.phase-item').dataset.id;
    const flagKey = `data_${id}`;
    const savedData = this.actor.getFlag('pf2e-token-pack', flagKey);
    if (!savedData) return;

    const actorData = foundry.utils.deepClone(savedData);
    actorData.name = `[Temp] ${savedData.name}`;

    const tempActor = await Actor.create(actorData);
    if (!tempActor) {
      return ui.notifications.error(game.i18n.localize("Disguise.ActorCreationError"));
    }

    const tempSheet = tempActor.sheet;

    const originalClose = tempSheet.close.bind(tempSheet);
    tempSheet.close = async (options) => {
        const result = await originalClose(options);
        const updatedSource = tempActor.toObject();

        let masterList = this.actor.getFlag('pf2e-token-pack', 'disguises') || [];
        const disguiseToEdit = masterList.find(d => d.id === id);
        
        if (disguiseToEdit) {
            const newName = updatedSource.name.replace("[Temp]", "").trim();
            disguiseToEdit.name = newName;
            updatedSource.name = newName;
        }

        delete updatedSource.folder;
        delete updatedSource.sort;
        delete updatedSource.ownership;
        if (savedData._id) updatedSource._id = savedData._id;

        await this.actor.setFlag('pf2e-token-pack', flagKey, updatedSource);
        await this.actor.setFlag('pf2e-token-pack', 'disguises', masterList);

        ui.notifications.info(game.i18n.format("Disguise.UpdateSuccess", { name: updatedSource.name }));
        
        await tempActor.delete();
        
        const activeDisguiseId = this.actor.getFlag("pf2e-token-pack", "lastAppliedDisguiseId");
        if (id === activeDisguiseId) {
            ui.notifications.info(game.i18n.format("Disguise.ApplyingUpdates", { name: disguiseToEdit.name }));
            const token = this.actor.getActiveTokens()[0]?.document;
            await requestDisguiseChange({
                actor: this.actor,
                token: token,
                sheet: this.actor.sheet,
                sourceType: 'flag',
                sourceId: id,
                type: disguiseToEdit.type,
                options: { applySize: disguiseToEdit.shouldApplySize }
            });
        }

        this.render(true);
        return result;
    };

    tempSheet.render(true);
    this.close();
  }

    async _onRenamePhase(event) {
        const id = event.currentTarget.closest('.phase-item').dataset.id;
        const masterList = this.actor.getFlag("pf2e-token-pack", "disguises") || [];
        const disguiseInList = masterList.find(d => d.id === id);
        if (!disguiseInList) return;

        const flagKey = (id === 'original') ? 'data_original_visuals' : `data_${id}`;
        const data = this.actor.getFlag('pf2e-token-pack', flagKey);
        const currentName = data.name;

        const content = `<form autocomplete="off"><div class="form-group"><label>${game.i18n.localize("Disguise.NewNameLabel")}</label><div class="form-fields"><input type="text" name="newName" value="${foundry.utils.escapeHTML(currentName)}" autofocus/></div></div></form>`;

        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("Disguise.RenameSavedTitle") },
            content,
            buttons: [{
                action: "save",
                icon: "fas fa-save",
                label: game.i18n.localize("Disguise.SaveButtonLabel"),
                default: true,
                callback: (event, button) => button.form.elements.newName.value
            }],
            submit: async (newName) => {
                if (typeof newName === "string" && newName.trim()) {
                    const finalNewName = newName.trim();
                    data.name = finalNewName;
                    disguiseInList.name = finalNewName;
                    await this.actor.setFlag('pf2e-token-pack', flagKey, data);
                    await this.actor.setFlag('pf2e-token-pack', 'disguises', masterList);
                    this.render(true);
                }
            }
        }).render(true);
    }
  
    async _onDeletePhase(event) {
        const id = event.currentTarget.closest('.phase-item').dataset.id;
        let masterList = this.actor.getFlag('pf2e-token-pack', 'disguises') || [];
        masterList = masterList.filter(d => d.id !== id);
        
        const flagKey = (id === 'original') ? 'data_original_visuals' : `data_${id}`;
        
        await this.actor.setFlag('pf2e-token-pack', 'disguises', masterList);
        await this.actor.unsetFlag('pf2e-token-pack', flagKey);
        this.render(true);
    }
}

//Класс приложения для HUD, отображающего доступные образы для быстрого применения.
class DisguiseHudApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(actor, token, sheet, triggerElement) {
        super({ actor, token, sheet, triggerElement });
        this.actor = actor;
        this.token = token;
        this.sheet = sheet;
        this.triggerElement = triggerElement;
        this._closeTimeout = null;
    }

    static DEFAULT_OPTIONS = {
        id: "disguise-hud-app",
        window: {
            frame: false,
            resizable: false,
            minimizable: false,
            popOut: false
        },
        position: { width: "auto", height: "auto" }
    };

    static PARTS = {
        content: {
            template: "modules/pf2e-token-pack/data/templates/Disguise.hbs"
        }
    };
    
    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        const masterList = this.actor.getFlag('pf2e-token-pack', 'disguises') || [];
        const hasContent = masterList.length > 0;
        const activeDisguiseId = this.actor.getFlag("pf2e-token-pack", "lastAppliedDisguiseId");

        let original = null;
        const originalInList = masterList.find(d => d.id === 'original');

        if (originalInList) {
            const originalData = this.actor.getFlag('pf2e-token-pack', 'data_original_visuals');
            if (originalData) {
                original = {
                    id: 'original',
                    type: 'hybrid',
                    img: originalData.img || CONST.DEFAULT_TOKEN,
                    name: game.i18n.format("Disguise.OriginalActor", { name: originalData.name }),
                    isActive: "original" === activeDisguiseId
                };
            }
        }
        
        const hybrids = [];
        const fulls = [];
        for (const d of masterList.filter(d => d.id !== 'original')) {
            const data = this.actor.getFlag('pf2e-token-pack', `data_${d.id}`);
            if (!data) continue;
            const item = {
                ...d,
                name: data.name,
                img: data.img || CONST.DEFAULT_TOKEN,
                isActive: d.id === activeDisguiseId
            };
            if (this.actor.type === 'npc' && d.type === 'full') {
                fulls.push(item);
            } else {
                hybrids.push(item);
            }
        }

        hybrids.sort((a, b) => (a.name || "").localeCompare(b.name || "", game.i18n.lang));
        fulls.sort((a, b) => (a.name || "").localeCompare(b.name || "", game.i18n.lang));

        return { ...ctx, isHudApp: true, hasContent, original, hybrids, fulls };
    }
    
    async _postRender(context, options) {
        await super._postRender(context, options);
        const el = this.element;

        el.style.opacity = 0;
        el.style.transition = "opacity 0.1s ease-in-out";
        document.getElementById("ui-top")?.appendChild(el);
        
        setTimeout(() => {
            this._reposition();
            el.style.opacity = 1;
        }, 0);
        
        el.addEventListener("click", this._onApplyDisguise.bind(this));
        this._boundOnClickOutside = this._onClickOutside.bind(this);
        setTimeout(() => document.body.addEventListener("click", this._boundOnClickOutside), 0);
    }

    _reposition() {
        const el = this.element;
        const uiTop = document.getElementById("ui-top");
        if (!el || !this.triggerElement || !uiTop) return;
        const buttonRect = this.triggerElement.getBoundingClientRect();
        const parentRect = uiTop.getBoundingClientRect();
        const hudPosition = game.settings.get('pf2e-token-pack', 'hudPosition') || 'top-right';
        const [, horizontal] = hudPosition.split('-');
        el.style.position = "absolute";
        el.style.zIndex = 999;
        const top = buttonRect.top - parentRect.top;
        el.style.top = `${top}px`;
        if (horizontal === 'left') {
            const left = buttonRect.left - parentRect.left - el.offsetWidth - 5;
            el.style.left = `${left}px`;
        } else {
            const left = buttonRect.right - parentRect.left + 5;
            el.style.left = `${left}px`;
        }
    }

    _onClickOutside(event) {
        if (!this.element.contains(event.target)) {
            this.close();
        }
    }

    async close(options = {}) {
        if (!this.rendered) return;
        document.body.removeEventListener("click", this._boundOnClickOutside);
        if (this._closeTimeout) clearTimeout(this._closeTimeout);
        this.element.remove();
        return super.close(options);
    }
    
    async _onApplyDisguise(event) {
        if (this._closeTimeout) clearTimeout(this._closeTimeout);
        const target = event.target.closest('[data-action="apply"]');
        if (!target) return;

        this.close();
        if (canvas.hud.token?.rendered) canvas.hud.token.close();

        const id = target.dataset.id;
        const type = target.dataset.type;
        const disguise = (this.actor.getFlag('pf2e-token-pack', 'disguises') || []).find(d => d.id === id);
        
        const applySize = disguise?.shouldApplySize ?? true;

        requestDisguiseChange({
            actor: this.actor,
            token: this.token,
            sheet: this.sheet,
            sourceType: 'flag',
            sourceId: id,
            type: type,
            options: { applySize }
        });
        
        if (canvas.hud.token?.rendered) await canvas.hud.token.close();
        await this.close();
    }
}

//Класс приложения для настройки автоматического применения образов.
class DisguiseAutomationApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(actor, token, sheet, options = {}) {
    super(options);
    this.actor = actor;
    this.token = token;
    this.sheet = sheet;
  }

  static get DEFAULT_OPTIONS() {
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: "disguise-automation-app",
      window: {
        title: game.i18n.localize("Disguise.AutomationTitle"),
        resizable: false
      },
      position: { width: 'auto', height: 'auto' },
    });
  }

  static PARTS = {
    content: {
      template: "modules/pf2e-token-pack/data/templates/Disguise.hbs",
      classes: ["disguise-app-window"]
    }
  };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    let automations = this.actor.getFlag("pf2e-token-pack", "automations") || [];
    const masterDisguiseList = this.actor.getFlag("pf2e-token-pack", "disguises") || [];
    const enrichedDisguises = [];

    for (const disguise of masterDisguiseList) {
      if (!disguise.name && !disguise.isOriginal) continue;
      let disguiseData = disguise.isOriginal
        ? this.actor.getFlag("pf2e-token-pack", "data_original_visuals")
        : this.actor.getFlag("pf2e-token-pack", `data_${disguise.id}`);
      
      if (disguiseData) {
        let displayName = disguise.isOriginal 
          ? game.i18n.format("Disguise.OriginalActor", { name: disguiseData.name })
          : disguiseData.name;
        enrichedDisguises.push({ ...disguise, name: displayName, img: disguiseData.img || CONST.DEFAULT_TOKEN });
      }
    }

    const displayAutomations = [];
    for (const rule of automations) {
      const disguise = enrichedDisguises.find(d => d.id === rule.disguiseId);
      if (!disguise) continue;
      try {
        const effect = await fromUuid(rule.uuid);
        if (effect) {
          displayAutomations.push({
            effectUuid: rule.uuid,
            effectName: effect.name,
            effectImg: effect.img || CONST.DEFAULT_TOKEN,
            disguiseId: rule.disguiseId,
            disguiseName: disguise.name,
            disguiseImg: disguise.img
          });
        }
      } catch (e) {
        console.warn(game.i18n.format("Disguise.ConsoleWarnAutomationUUIDLoadFail", { uuid: rule.uuid }), e);
      }
    }

    return { ...ctx, isAutomationManager: true, automations: displayAutomations, disguises: enrichedDisguises };
  }

  async _postRender(context, options) {
    await super._postRender(context, options);
    const root = this.element;
    root.querySelectorAll(".save-automation").forEach(btn => btn.addEventListener("click", ev => this._onSaveAutomation(ev)));
    root.querySelectorAll(".delete-automation").forEach(btn => btn.addEventListener("click", ev => this._onDeleteAutomation(ev)));
    root.querySelectorAll(".selectable-item.disguise-item").forEach(item => item.addEventListener("click", ev => this._onSelectItem(ev)));
  }

  _onSelectItem(event) {
    const item = event.currentTarget;
    item.parentElement.querySelectorAll(".disguise-item").forEach(el => el.classList.remove("selected"));
    item.classList.add("selected");
  }

  async _onSaveAutomation(event) {
    event.preventDefault();
    const form = this.element.querySelector("form");
    const selected = form.querySelector(".disguise-item.selected");
    const disguiseId = selected?.dataset.id;
    const effectUuid = form.querySelector('[name="manualEffectUuid"]')?.value?.trim();

    if (!disguiseId || !effectUuid) {
      return ui.notifications.warn(game.i18n.localize("Disguise.AutomationSelectionWarning"));
    }

    try {
        const item = await fromUuid(effectUuid);
        if (!item) throw new Error("Not Found");
    } catch (e) {
        return ui.notifications.warn(game.i18n.localize("Disguise.AutomationInvalidUUIDWarning"));
    }

    let automations = this.actor.getFlag("pf2e-token-pack", "automations") || [];
    const existingRule = automations.find(r => r.uuid === effectUuid);
    if (existingRule) {
      existingRule.disguiseId = disguiseId;
    } else {
      automations.push({ uuid: effectUuid, disguiseId });
    }

    await this.actor.setFlag("pf2e-token-pack", "automations", automations);
    this.render(true);
  }

  async _onDeleteAutomation(event) {
    const effectUuidToDelete = event.currentTarget.dataset.effectUuid;
    let automations = this.actor.getFlag("pf2e-token-pack", "automations") || [];
    automations = automations.filter(r => r.uuid !== effectUuidToDelete);
    await this.actor.setFlag("pf2e-token-pack", "automations", automations);
    this.render(true);
  }
}

//Класс приложения для главного меню выбора маскировки.
class DisguiseMainMenu extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(actor, token, sheet, options = {}) {
        super(options);
        this.actor = actor;
        this.token = token;
        this.sheet = sheet;
    }

    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            id: "disguise-main-menu",
            window: { title: game.i18n.localize("Disguise.MenuTitle") },
            position: { width: "auto", height: "auto" },
            classes: ["dialog", "mask-phase-dialog"]
        });
    }

    static PARTS = {
        content: { template: "modules/pf2e-token-pack/data/templates/Disguise.hbs" }
    };

    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        const highlightDisabled = this.actor.getFlag('pf2e-token-pack', 'highlightDisabled') ?? false;
        
        const btn_disguise = { action: 'disguise', icon: 'fas fa-user-plus', label: game.i18n.localize("Disguise.NewDisguiseButton") };
        const btn_phases = { action: 'phases', icon: 'fas fa-layer-group', label: game.i18n.localize("Disguise.SavedDisguisesButton") };
        const btn_automation = { action: 'automation', icon: 'fas fa-cogs', label: game.i18n.localize("Disguise.AutomationTitle") };
        const btn_reset = { action: 'reset', icon: 'fas fa-undo', label: game.i18n.localize("Disguise.ResetButtonLabel") };
        const btn_highlight = {
            action: 'highlight',
            icon: `fas fa-${highlightDisabled ? 'eye' : 'eye-slash'}`,
            label: highlightDisabled ? game.i18n.localize("Disguise.EnableHighlight") : game.i18n.localize("Disguise.DisableHighlight")
        };

        let buttonRows = [];
        if (game.user.isGM) {
            buttonRows = [
                [btn_disguise, btn_phases, btn_automation],
                [btn_reset, btn_highlight]
            ];
        } else {
            buttonRows = [
                [btn_phases, btn_reset]
            ];
        }
        
        return {
            ...ctx,
            isDisguiseMainMenu: true,
            buttonRows: buttonRows
        };
    }

    async _postRender(context, options) {
        await super._postRender?.(context, options);
        const html = $(this.element);
        html.find('button[data-action]').on('click', (event) => {
            const action = event.currentTarget.dataset.action;
            this._onButtonClick(action);
        });
    }

    async _onButtonClick(action) {
        await this.close();
        const { actor, token, sheet } = this;
        const highlightDisabled = actor.getFlag('pf2e-token-pack', 'highlightDisabled') ?? false;

        switch (action) {
            case 'disguise': new DisguiseApp(actor, token, sheet, { isHybridOnly: actor.type !== 'npc' }).render(true); break;
            case 'phases': new PhaseManagerApp(actor, token, sheet, { isHybridOnly: actor.type !== 'npc' }).render(true); break;
            case 'automation': new DisguiseAutomationApp(actor, token, sheet).render(true); break;
            case 'reset': await _performReset(actor); break;
            case 'highlight':
                await actor.setFlag('pf2e-token-pack', 'highlightDisabled', !highlightDisabled);
                canvas.tokens.placeables.filter(t => t.document.actorId === actor.id).forEach(t => t.draw());
                const messageKey = !highlightDisabled ? "Disguise.HighlightDisabledFor" : "Disguise.HighlightEnabledFor";
                ui.notifications.info(game.i18n.format(messageKey, { name: actor.name }));
                break;
        }
    }
}

//Синхронизирует механические данные актера-цели с данными источника.
async function _syncActorMechanics(targetActor, sourceData) {
    const mechanicalItemTypes = ['melee', 'spellcastingEntry', 'spell', 'action', 'feat', 'lore', 'skill'];

    const itemsToDelete = targetActor.items.filter(i => mechanicalItemTypes.includes(i.type)).map(i => i.id);
    if (itemsToDelete.length > 0) {
        await targetActor.deleteEmbeddedDocuments("Item", itemsToDelete);
    }

    const sourceMechanicalItems = (sourceData.items ?? []).filter(i => mechanicalItemTypes.includes(i.type));
    if (sourceMechanicalItems.length === 0) return;

    const allItemsData = sourceMechanicalItems.map(i => {
        const itemData = foundry.utils.deepClone(i);
        delete itemData._id;
        return itemData;
    });

    const spellsData = allItemsData.filter(i => i.type === 'spell');
    const otherItemsData = allItemsData.filter(i => i.type !== 'spell');

    const createdOtherItems = await targetActor.createEmbeddedDocuments("Item", otherItemsData);

    const entryIdMap = new Map();
    const sourceEntries = sourceMechanicalItems.filter(i => i.type === 'spellcastingEntry');
    const createdEntries = createdOtherItems.filter(i => i.type === 'spellcastingEntry');

    for (const sourceEntry of sourceEntries) {
        const newEntry = createdEntries.find(i => i.name === sourceEntry.name);
        if (newEntry) {
            entryIdMap.set(sourceEntry._id, newEntry.id);
        }
    }

    const updatedSpellsData = spellsData.map(spell => {
        const oldEntryId = spell.system.location.value;
        const newEntryId = entryIdMap.get(oldEntryId);
        if (newEntryId) {
            spell.system.location.value = newEntryId;
        }
        return spell;
    });

    const createdSpells = await targetActor.createEmbeddedDocuments("Item", updatedSpellsData);
    if (createdSpells.length === 0) return;

    const spellIdMap = new Map();
    const sourceSpells = sourceMechanicalItems.filter(i => i.type === 'spell');
    for (const sourceSpell of sourceSpells) {
        const newSpell = createdSpells.find(s => s.name === sourceSpell.name && s.system.location.value === entryIdMap.get(sourceSpell.system.location.value));
        if (newSpell) {
            spellIdMap.set(sourceSpell._id, newSpell.id);
        }
    }

    const updates = [];
    const preparedEntries = sourceEntries.filter(e => e.system.prepared?.value === 'prepared');

    for (const sourceEntry of preparedEntries) {
        const newEntryId = entryIdMap.get(sourceEntry._id);
        if (!newEntryId) continue;

        const newSlots = foundry.utils.deepClone(sourceEntry.system.slots);
        for (const slotKey in newSlots) {
            const slot = newSlots[slotKey];
            if (slot.prepared?.length > 0) {
                slot.prepared = slot.prepared
                    .map(prep => {
                        const newSpellId = spellIdMap.get(prep.id);
                        return newSpellId ? { id: newSpellId } : null;
                    })
                    .filter(p => p !== null);
            }
        }
        updates.push({ _id: newEntryId, 'system.slots': newSlots });
    }

    if (updates.length > 0) {
        await targetActor.updateEmbeddedDocuments("Item", updates);
    }
}

//Открывает главное меню управления маскировкой.
async function openDisguiseMenu(actor, token, sheet) {
    await saveOriginalState(actor, token);
    new DisguiseMainMenu(actor, token, sheet).render(true);
}

//Применяет "полную" маскировку, заменяя механические данные актера.
async function applyFullDisguise(targetActor, sourceData, targetToken = null, sheet = null, options = { applySize: true }, disguiseId = null) {
    if (targetActor.type === 'character') {
        const canonicalActor = game.actors.get(targetActor.id);
        if (canonicalActor) targetActor = canonicalActor;
    }
    const activeMode = targetActor.getFlag('pf2e-token-pack', 'active_mode');

    if (activeMode !== 'full') {
        const stateToSave = targetActor.toObject();
        delete stateToSave.flags['pf2e-token-pack'];
        await targetActor.setFlag('pf2e-token-pack', 'last_hybrid_state', stateToSave);
    }

    const sourceClone = foundry.utils.deepClone(sourceData);
    const originalVisuals = targetActor.getFlag('pf2e-token-pack', 'data_original_visuals');

    if (!options.applySize) {
        if (originalVisuals?.system?.traits?.size && sourceClone.system?.traits) {
            sourceClone.system.traits.size = originalVisuals.system.traits.size;
        }
        if (originalVisuals?.prototypeToken) {
            sourceClone.prototypeToken.width = originalVisuals.prototypeToken.width;
            sourceClone.prototypeToken.height = originalVisuals.prototypeToken.height;
            foundry.utils.setProperty(sourceClone.prototypeToken, "flags.pf2e.linkToActorSize", originalVisuals.prototypeToken.flags?.pf2e?.linkToActorSize ?? false);
        }
    }

    const actorUpdate = {
        img: sourceClone.img,
        system: sourceClone.system,
        prototypeToken: sourceClone.prototypeToken
    };
    await targetActor.update(actorUpdate);

    if (sourceClone.system.attributes.hp) {
        await targetActor.update({ 'system.attributes.hp.value': sourceClone.system.attributes.hp.value });
    }

    await _syncActorMechanics(targetActor, sourceClone);

    if (targetToken) {
        const tokenUpdate = foundry.utils.deepClone(sourceData.prototypeToken);
        tokenUpdate.actorLink = false;

        if (options.applySize) {
            foundry.utils.setProperty(tokenUpdate, "flags.pf2e.linkToActorSize", false);
        } else {
            const originalVisualsToken = targetActor.getFlag('pf2e-token-pack', 'data_original_visuals')?.prototypeToken;
            if (originalVisualsToken) {
                tokenUpdate.width = originalVisualsToken.width;
                tokenUpdate.height = originalVisualsToken.height;
                foundry.utils.setProperty(tokenUpdate, "flags.pf2e.linkToActorSize", originalVisualsToken.flags?.pf2e?.linkToActorSize ?? false);
            }
        }

        if (tokenUpdate.ring?.enabled) tokenUpdate.texture.src = sourceData.img;
        await targetToken.update(foundry.utils.flattenObject(tokenUpdate));
        if (targetToken.object) await targetToken.object.refresh();
    }

    if (game.combat && targetToken && targetActor.isOwner) {
        const combatant = game.combat.combatants.find(c => c.tokenId === targetToken.id);
        if (combatant) await combatant.update({ img: targetActor.img, name: targetActor.name });
    }

    await targetActor.setFlag('pf2e-token-pack', 'active_mode', 'full');
    await targetActor.setFlag('pf2e-token-pack', 'lastAppliedDisguiseId', disguiseId);
    if (sheet?.rendered) setTimeout(() => sheet.render(true), 100);
    refreshDisguiseApps(targetActor);
}

//Применяет "визуальную" маскировку, изменяя только внешний вид актера и токена.
async function applyVisualDisguise(targetActor, visualData, targetToken = null, sheet = null, options = { applySize: true }, disguiseId = null) {
    if (targetActor.getFlag('pf2e-token-pack', 'active_mode') === 'full') {
        let lastHybridState = targetActor.getFlag('pf2e-token-pack', 'last_hybrid_state');
        if (lastHybridState) {
            const mechanicalItemTypes = ['melee', 'spellcastingEntry', 'spell', 'action', 'feat', 'lore', 'skill'];
            const inventoryItemTypes = ['weapon', 'armor', 'shield', 'equipment', 'consumable', 'treasure', 'backpack'];
            
            const currentInventoryItems = targetActor.items.filter(i => inventoryItemTypes.includes(i.type)).map(i => i.toObject());
            const currentNotes = { public: targetActor.system.details.publicNotes, private: targetActor.system.details.privateNotes };
            
            const originalMechanicalItems = lastHybridState.items.filter(i => mechanicalItemTypes.includes(i.type));
            
            const syncedHybridState = foundry.utils.deepClone(lastHybridState);
            syncedHybridState.items = [...originalMechanicalItems, ...currentInventoryItems];
            
            if (syncedHybridState.system?.details) {
                syncedHybridState.system.details.publicNotes = currentNotes.public;
                syncedHybridState.system.details.privateNotes = currentNotes.private;
            }
            
            await targetActor.setFlag('pf2e-token-pack', 'last_hybrid_state', syncedHybridState);

            const stateClone = foundry.utils.deepClone(syncedHybridState);
            if (stateClone.system?.traits?.size) delete stateClone.system.traits.size;
            
            await targetActor.update({ system: stateClone.system, name: stateClone.name });
            await _syncActorMechanics(targetActor, stateClone);
            
            if (stateClone.system.attributes.hp) {
                await targetActor.update({'system.attributes.hp.value': stateClone.system.attributes.hp.value});
            }
        }
    }

    const isPcToNpc = visualData.type === 'character' && targetActor.type === 'npc';
    const originalVisuals = targetActor.getFlag('pf2e-token-pack', 'data_original_visuals');

    if (isPcToNpc) {
        if (!originalVisuals) return ui.notifications.error(game.i18n.format("Disguise.ErrorOriginalVisualsMissing", { name: targetActor.name }));

        const newPrototype = foundry.utils.deepClone(originalVisuals.prototypeToken);
        const sourceProto = visualData.prototypeToken;
        newPrototype.texture = sourceProto.texture;
        newPrototype.ring = sourceProto.ring;

        const actorUpdate = { 'img': visualData.img, 'prototypeToken': newPrototype };
        const tokenUpdate = {};
        tokenUpdate['texture.src'] = sourceProto.texture.src;
        tokenUpdate['texture.scaleX'] = sourceProto.texture.scaleX;
        tokenUpdate['texture.scaleY'] = sourceProto.texture.scaleY;
        tokenUpdate.ring = sourceProto.ring;
        if (sourceProto.ring.enabled) tokenUpdate['texture.src'] = visualData.img;
        
        if (options.applySize && visualData.system?.traits?.size?.value) {
            const sourceSizeValue = visualData.system.traits.size.value;
            actorUpdate['system.traits.size'] = { value: sourceSizeValue };
            const sizeMap = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
            const dimension = sizeMap[sourceSizeValue] ?? 1;
            tokenUpdate.width = dimension;
            tokenUpdate.height = dimension;
            foundry.utils.setProperty(tokenUpdate, "flags.pf2e.linkToActorSize", false);
        } else if (originalVisuals.system?.traits?.size) {
            actorUpdate['system.traits.size'] = originalVisuals.system.traits.size;
        }

        await targetActor.update(actorUpdate);
        if (targetToken) await targetToken.update(foundry.utils.flattenObject(tokenUpdate));

    } else {
        const actorUpdate = { img: visualData.img, prototypeToken: visualData.prototypeToken };
        
        if (options.applySize) {
            if (targetActor.type === 'npc' && visualData.system?.traits?.size?.value) {
                actorUpdate['system.traits.size'] = { value: visualData.system.traits.size.value };
            }
        } else {
            if (originalVisuals?.prototypeToken) {
                visualData.prototypeToken.width = originalVisuals.prototypeToken.width;
                visualData.prototypeToken.height = originalVisuals.prototypeToken.height;
                foundry.utils.setProperty(visualData.prototypeToken, "flags.pf2e.linkToActorSize", originalVisuals.prototypeToken.flags?.pf2e?.linkToActorSize ?? false);
            }
            if (originalVisuals?.system?.traits?.size) {
                actorUpdate['system.traits.size'] = originalVisuals.system.traits.size;
            }
        }

        await targetActor.update(actorUpdate);

        if (targetToken) {
            let tokenUpdate = foundry.utils.deepClone(visualData.prototypeToken);
            if (tokenUpdate.ring?.enabled) tokenUpdate.texture.src = visualData.img;
            await targetToken.update(foundry.utils.flattenObject(tokenUpdate));
        }
    }

    if (targetToken?.object) targetToken.object.refresh();

    if (game.combat && targetToken && targetActor.isOwner) {
        const combatant = game.combat.combatants.find(c => c.tokenId === targetToken.id);
        if (combatant) {
            const combatantImg = visualData.prototypeToken.ring.enabled ? visualData.img : visualData.prototypeToken.texture.src;
            await combatant.update({ img: combatantImg, name: visualData.name });
        }
    }

    await targetActor.setFlag('pf2e-token-pack', 'lastAppliedDisguiseId', disguiseId);
    await targetActor.setFlag('pf2e-token-pack', 'active_mode', 'hybrid');
    if (sheet?.rendered) setTimeout(() => sheet.render(true), 100);
    refreshDisguiseApps(targetActor);
}

//Выполняет сброс актера к его первоначальному сохраненному состоянию.
async function _performReset(actor) {
    const hiddenBackup = actor.getFlag("pf2e-token-pack", "data_original");
    if (!hiddenBackup) {
        return ui.notifications.warn(game.i18n.localize("Disguise.ResetNoDataWarning"));
    }

    const protoTokenData = foundry.utils.deepClone(hiddenBackup.prototypeToken);
    const visualSystemData = {};
    if (hiddenBackup.system?.traits?.size) {
        visualSystemData.traits = { size: hiddenBackup.system.traits.size };
    }
    const restoredVisualOriginal = {
        name: hiddenBackup.name,
        img: hiddenBackup.img,
        prototypeToken: protoTokenData,
        system: visualSystemData,
        sourceUuid: hiddenBackup.sourceUuid ?? null
    };

    await actor.setFlag('pf2e-token-pack', 'data_original_visuals', restoredVisualOriginal);
    const masterList = actor.getFlag('pf2e-token-pack', 'disguises') || [];
    let originalInList = masterList.find(d => d.id === 'original');

    if (originalInList) {
        originalInList.name = restoredVisualOriginal.name;
        originalInList.sourceUuid = restoredVisualOriginal.sourceUuid;
    } else {
        masterList.unshift({
            id: 'original',
            name: restoredVisualOriginal.name,
            type: 'hybrid',
            shouldApplySize: true,
            sourceUuid: restoredVisualOriginal.sourceUuid,
        });
    }
    await actor.setFlag('pf2e-token-pack', 'disguises', masterList);

    const token = actor.getActiveTokens()[0]?.document;
    await requestDisguiseChange({
        actor: actor,
        token: token,
        sheet: actor.sheet,
        sourceType: 'flag',
        sourceId: 'original',
        type: 'hybrid',
        options: { applySize: true }
    });
    refreshDisguiseApps(actor);
}

//Сохраняет исходное состояние актера и токена при первом открытии меню.
async function saveOriginalState(actor, token) {
    if (actor.getFlag('pf2e-token-pack', 'data_original')) return;

    const originalSource = actor.toObject();
    // ИСПРАВЛЕННАЯ СТРОКА: Правильный путь и извлечение ID
    const sourceUuid = actor._stats?.compendiumSource?.split('.').pop() ?? null;

    const protoTokenData = foundry.utils.deepClone(originalSource.prototypeToken);
    if (token) {
        protoTokenData.ring = token.ring;
        protoTokenData.texture.scaleX = token.texture.scaleX;
        protoTokenData.texture.scaleY = token.texture.scaleY;
        protoTokenData.texture.src = token.texture.src;
        protoTokenData.height = token.height;
        protoTokenData.width = token.width;
    }
    
    const visualSystemData = {};
    if (originalSource.system?.traits?.size) {
        visualSystemData.traits = { size: originalSource.system.traits.size };
    }

    const originalVisualData = {
        name: originalSource.name,
        img: originalSource.img,
        prototypeToken: protoTokenData,
        system: visualSystemData,
        sourceUuid: sourceUuid
    };
    
    await actor.setFlag('pf2e-token-pack', 'data_original', originalVisualData);
    await actor.setFlag('pf2e-token-pack', 'data_original_visuals', originalVisualData);

    let masterList = (actor.getFlag('pf2e-token-pack', 'disguises') || []).filter(d => d.id !== 'original');
    masterList.unshift({
        id: 'original',
        name: originalSource.name,
        type: 'hybrid',
        shouldApplySize: true
    });

    await actor.setFlag('pf2e-token-pack', 'disguises', masterList);
    await actor.setFlag('pf2e-token-pack', 'active_mode', 'hybrid');
}

//Синхронизирует не-визуальные свойства прототипа токена со всеми образами.
async function syncDisguiseProperties(actor, sourcePrototypeToken) {
    const masterList = actor.getFlag("pf2e-token-pack", "disguises") || [];
    const updates = {};
    let masterListChanged = false;

    const syncKeys = [
        "name", "displayName", "actorLink", "disposition", "displayBars", "bar1", "bar2",
        "light", "sight", "detectionModes", "occludable", "turnMarker", "movementAction"
    ];
    
    for (const disguise of masterList) {
        const flagKey = disguise.id === 'original' ? 'data_original_visuals' : `data_${disguise.id}`;
        const originalDisguiseData = actor.getFlag("pf2e-token-pack", flagKey);
        
        if (!originalDisguiseData?.prototypeToken) continue;

        const targetDisguiseData = foundry.utils.deepClone(originalDisguiseData);
        let dataChanged = false;
        const targetToken = targetDisguiseData.prototypeToken;

        for (const key of syncKeys) {
            if (foundry.utils.hasProperty(sourcePrototypeToken, key) && !foundry.utils.objectsEqual(targetToken[key], sourcePrototypeToken[key])) {
                targetToken[key] = foundry.utils.deepClone(sourcePrototypeToken[key]);
                dataChanged = true;
            }
        }

        if (dataChanged) {
            updates[`flags.pf2e-token-pack.${flagKey}`] = targetDisguiseData;
        }

        if (disguise.id === 'original' && disguise.name !== sourcePrototypeToken.name) {
            disguise.name = sourcePrototypeToken.name;
            masterListChanged = true;
        }
    }

    if (masterListChanged) {
        updates['flags.pf2e-token-pack.disguises'] = masterList;
    }
    
    if (Object.keys(updates).length > 0) {
        await actor.update(updates);
    }
}

//Обрабатывает запрос на смену образа, выполняя его напрямую для GM или отправляя через сокет для игрока.
async function requestDisguiseChange(request) {
    if (game.user.isGM) {
        const authoritativeActor = getAuthoritativeActor(request.actor?.id, request.token?.id);
        if (!authoritativeActor) {
            console.error(game.i18n.localize("Disguise.ConsoleErrorAuthActorNotFound"));
            return;
        }
        
        let sourceData;
        if (request.sourceType === 'actor') {
            const sourceActor = await fromUuid(request.sourceId);
            if (sourceActor) sourceData = sourceActor.toObject();
        } else if (request.sourceType === 'flag') {
            const flagKey = request.sourceId === 'original'
                ? (request.type === 'full' ? 'data_original' : 'data_original_visuals')
                : `data_${request.sourceId}`;
            sourceData = authoritativeActor.getFlag('pf2e-token-pack', flagKey);
        }

        if (!sourceData) {
             console.error(game.i18n.format("Disguise.ConsoleErrorSourceDataNotFound", { sourceId: request.sourceId, actorName: authoritativeActor.name }));
             return ui.notifications.error(game.i18n.localize("Disguise.SourceDataNotFound"));
        }

        if (request.type === 'full') {
            await applyFullDisguise(authoritativeActor, sourceData, request.token, authoritativeActor.sheet, request.options, request.sourceId);
        } else {
            await applyVisualDisguise(authoritativeActor, sourceData, request.token, authoritativeActor.sheet, request.options, request.sourceId);
        }
    } else {
        if (request.sourceType !== 'flag') {
            return ui.notifications.warn(game.i18n.localize("Disguise.PlayersCanOnlyApplySaved"));
        }
        ui.notifications.info(game.i18n.localize("Disguise.RequestSentToGM"));
        game.socket.emit('module.pf2e-token-pack', {
            actorId: request.actor.id,
            tokenId: request.token?.id,
            sourceId: request.sourceId,
            type: request.type,
            options: request.options
        });
    }
}

//Вспомогательная функция для добавления кнопок и логики в окна Token Config и Prototype Token Config.
async function enhanceTokenConfigWindow(app, html) {
    const actor = app.token?.actor || app.actor;
    if (!actor) return;

    const activeDisguiseId = actor.getFlag("pf2e-token-pack", "lastAppliedDisguiseId");
    if (!activeDisguiseId) return;

    const jQueryHtml = $(html);
    const appearanceTab = jQueryHtml.find('.tab[data-tab="appearance"]');
    if (appearanceTab.length) {
        let currentAvatar = "";
        const flagKey = activeDisguiseId === 'original' ? 'data_original_visuals' : `data_${activeDisguiseId}`;
        const disguiseData = actor.getFlag("pf2e-token-pack", flagKey);
        currentAvatar = disguiseData?.img || disguiseData?.prototypeToken?.texture?.src || "";
        
        const avatarPickerHTML = `
            <div class="form-group">
                <label>${game.i18n.localize("Disguise.AvatarImagePathLabel")}</label>
                <div class="form-fields">
                    <input class="image" type="text" name="img" value="${currentAvatar}" placeholder="path/to/asset.ext" data-dtype="String"/>
                    <button type="button" class="file-picker-button" data-target="img" tabindex="-1">
                        <i class="fas fa-file-import fa-fw"></i>
                    </button>
                </div>
            </div>`;
        appearanceTab.prepend(avatarPickerHTML);

        const avatarPickerButton = appearanceTab.find(".file-picker-button[data-target='img']");
        const avatarPickerInput = appearanceTab.find("input[name='img']");
        avatarPickerButton.on("click", () => {
            new foundry.applications.apps.FilePicker.implementation({
                type: "imagevideo",
                current: avatarPickerInput.val(),
                callback: (path) => avatarPickerInput.val(path),
            }).browse();
        });
    }

    const tokenData = app.token || app.actor.prototypeToken;
    const isLinked = foundry.utils.getProperty(tokenData?.flags, "pf2e.linkToActorSize");
    if (isLinked) {
        const sizeMap = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
        const dimension = sizeMap[actor.system.traits.size.value] ?? 1;
        jQueryHtml.find('input[name="width"]').val(dimension);
        jQueryHtml.find('input[name="height"]').val(dimension);
    }

    const footer = jQueryHtml.find("footer");
    if (footer.find(".update-disguise").length > 0) return;

    footer.prepend(`<button type="button" class="update-disguise"><i class="fas fa-image"></i> ${game.i18n.localize("Disguise.UpdateAppearanceButton")}</button>`);
    footer.find(".update-disguise").on("click", async (event) => {
        event.preventDefault();
        const flatData = new foundry.applications.ux.FormDataExtended(app.form).object;
        const newFormData = foundry.utils.expandObject(flatData);
        const flagKey = activeDisguiseId === 'original' ? 'data_original_visuals' : `data_${activeDisguiseId}`;
        const oldDisguiseData = foundry.utils.deepClone(actor.getFlag("pf2e-token-pack", flagKey));
        if (!oldDisguiseData) return ui.notifications.warn(game.i18n.localize("Disguise.ActiveDisguiseDataNotFound"));

        if (newFormData.hasOwnProperty("img")) oldDisguiseData.img = newFormData.img || null;

        const appearanceProperties = ['texture', 'width', 'height', 'alpha', 'lockRotation', 'ring', 'shape', 'mirrorX', 'mirrorY', 'scale'];
        const targetToken = oldDisguiseData.prototypeToken;
        for (const prop of appearanceProperties) {
            if (foundry.utils.hasProperty(newFormData, prop)) targetToken[prop] = newFormData[prop];
        }

        if (newFormData.flags?.pf2e) {
            foundry.utils.setProperty(targetToken, "flags.pf2e", newFormData.flags.pf2e);
        }

        if (foundry.utils.getProperty(targetToken, "flags.pf2e.linkToActorSize")) {
            const sizeMap = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
            const dimension = sizeMap[actor.system.traits.size.value] ?? 1;
            targetToken.width = dimension;
            targetToken.height = dimension;
        }

        if (foundry.utils.hasProperty(targetToken, "scale")) {
            targetToken.texture = targetToken.texture || {};
            const scale = targetToken.scale || 1;
            targetToken.texture.scaleX = scale * (targetToken.mirrorX ? -1 : 1);
            targetToken.texture.scaleY = scale * (targetToken.mirrorY ? -1 : 1);
            delete targetToken.scale;
            delete targetToken.mirrorX;
            delete targetToken.mirrorY;
        }

        await actor.setFlag("pf2e-token-pack", flagKey, oldDisguiseData);
        ui.notifications.info(game.i18n.format("Disguise.UpdateSuccess", { name: oldDisguiseData.name }));
        
        const disguiseToReapply = (actor.getFlag("pf2e-token-pack", "disguises") ?? []).find(d => d.id === activeDisguiseId);
        if (disguiseToReapply) {
            const tokenForRequest = app.token || actor.getActiveTokens()[0]?.document;
            await requestDisguiseChange({
                actor: actor, token: tokenForRequest, sheet: actor.sheet,
                sourceType: "flag", sourceId: activeDisguiseId, type: disguiseToReapply.type,
                options: { applySize: disguiseToReapply.shouldApplySize }
            });
        }
        refreshDisguiseApps(actor);
        app.close();
    });
}

//Обновляет все открытые окна управления и HUD для указанного актера.
function refreshDisguiseApps(actor) {
    if (!actor) return;
    for (const app of Object.values(ui.windows)) {
        if ((app instanceof PhaseManagerApp || app instanceof DisguiseHudApp) && app.actor.id === actor.id) {
            app.render(true);
        }
    }
}

//Определяет "авторитетного" актера для внесения изменений.
function getAuthoritativeActor(actorId, tokenId) {
    const baseActor = game.actors.get(actorId);
    if (!baseActor) return null;
    if (baseActor.type === 'character') return baseActor;
    if (tokenId) {
        const token = canvas.scene?.tokens.get(tokenId);
        if (token && !token.actorLink) return token.actor;
    }
    return baseActor;
}

//Добавляет кнопку маскировки на HUD токена.
Hooks.on("renderTokenHUD", (hud, html, data) => {
    const actor = hud.object?.actor;
    if (!actor || (!game.user.isGM && !actor.isOwner)) return;

    const hudPosition = game.settings.get('pf2e-token-pack', 'hudPosition') || 'top-right';
    const [vertical, horizontal] = hudPosition.split('-');
    const targetColumn = html.querySelector(horizontal === 'left' ? '.col.left' : '.col.right');
    if (!targetColumn) return;

    const buttonElement = document.createElement('div');
    buttonElement.classList.add('control-icon');
    buttonElement.title = game.i18n.localize("Disguise.MaskPhaseTitle");
    buttonElement.innerHTML = `<i class="fas fa-user-secret"></i>`;

    if (vertical === 'top') targetColumn.prepend(buttonElement);
    else targetColumn.append(buttonElement);

    buttonElement.addEventListener('click', (ev) => {
        ev.stopPropagation();
        document.getElementById("disguise-hud-app")?.remove();
        openDisguiseMenu(actor, hud.object.document, actor.sheet);
    });

    buttonElement.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        document.getElementById("disguise-hud-app")?.remove();
        if (!actor.getFlag('pf2e-token-pack', 'disguises')?.some(d => !d.isOriginal)) {
            return ui.notifications.warn(game.i18n.localize("Disguise.ManagerNoSavedDisguises"));
        }
        new DisguiseHudApp(actor, hud.object.document, actor.sheet, buttonElement).render(true);
    });
});

//Добавляет кнопку маскировки в заголовок окна листа актера.
Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  const actor = app.object;
  if (!actor || (!game.user.isGM && !actor.isOwner)) return;
  buttons.unshift({
    label: "", 
    title: game.i18n.localize("Disguise.MaskPhaseTitle"),
    class: "mask-phase", 
    icon: "fas fa-user-secret", 
    onclick: () => openDisguiseMenu(app.object, app.token, app)
  });
});

//Рисует рамку-маркер вокруг токенов, находящихся в образе.
Hooks.on("refreshToken", (token) => {
    const actor = token.document?.actor;
    const oldMarker = token.getChildByName("disguiseMarker");
    if (oldMarker) oldMarker.destroy();
    if (!actor || !game.user.isGM) return;

    const hasCustomDisguises = actor.getFlag('pf2e-token-pack', 'disguises')?.some(d => !d.isOriginal);
    const highlightDisabled = actor.getFlag('pf2e-token-pack', 'highlightDisabled') ?? false;

    if (hasCustomDisguises && !highlightDisabled) {
        const marker = new PIXI.Graphics();
        marker.name = "disguiseMarker";
        const colorSetting = game.settings.get('pf2e-token-pack', 'highlightColor') || "#9400D3";
        const borderColor = parseInt(colorSetting.replace("#", ""), 16);
        const borderWidth = 4;
        marker.lineStyle(borderWidth, borderColor, 1, 0);

        const style = game.settings.get('pf2e-token-pack', 'highlightStyle') || 'rounded-rect';
        const w = token.w, h = token.h, halfBorder = borderWidth / 2;

        switch (style) {
            case 'square': marker.drawRect(-halfBorder, -halfBorder, w + borderWidth, h + borderWidth); break;
            case 'circle': marker.drawEllipse(w / 2, h / 2, w / 2 + halfBorder, h / 2 + halfBorder); break;
            case 'corners':
                const cornerLength = Math.min(w, h) * 0.25;
                marker.moveTo(-halfBorder, cornerLength).lineTo(-halfBorder, -halfBorder).lineTo(cornerLength, -halfBorder);
                marker.moveTo(w + halfBorder - cornerLength, -halfBorder).lineTo(w + halfBorder, -halfBorder).lineTo(w + halfBorder, cornerLength);
                marker.moveTo(w + halfBorder, h + halfBorder - cornerLength).lineTo(w + halfBorder, h + halfBorder).lineTo(w + halfBorder - cornerLength, h + halfBorder);
                marker.moveTo(cornerLength, h + halfBorder).lineTo(-halfBorder, h + halfBorder).lineTo(-halfBorder, h + halfBorder - cornerLength);
                break;
            case 'ticks':
                const tickLength = Math.min(w, h) * 0.15;
                marker.moveTo(w / 2, 0 - halfBorder).lineTo(w / 2, 0 - halfBorder - tickLength);
                marker.moveTo(w / 2, h + halfBorder).lineTo(w / 2, h + halfBorder + tickLength);
                marker.moveTo(0 - halfBorder, h / 2).lineTo(0 - halfBorder - tickLength, h / 2);
                marker.moveTo(w + halfBorder, h / 2).lineTo(w + halfBorder + tickLength, h / 2);
                break;
            case 'corner-ticks':
                const cornerTickLength = Math.min(w, h) * 0.15, delta = cornerTickLength / Math.sqrt(2);
                marker.moveTo(0, 0).lineTo(-delta, -delta);
                marker.moveTo(w, 0).lineTo(w + delta, -delta);
                marker.moveTo(w, h).lineTo(w + delta, h + delta);
                marker.moveTo(0, h).lineTo(-delta, h + delta);
                break;
            default: marker.drawRoundedRect(-halfBorder, -halfBorder, w + borderWidth, h + borderWidth, 10); break;
        }
        marker.zIndex = 1000;
        token.addChild(marker);
    }
});

//Улучшает отображение меню настроек, превращая поле ввода цвета в color picker.
Hooks.on("renderSettingsConfig", (app, html) => {
    const colorInput = html.querySelector('[name="pf2e-token-pack.highlightColor"]');
    if (!colorInput) return;
    colorInput.type = 'color';
    colorInput.addEventListener('input', () => {
        if (canvas?.ready) canvas.tokens.placeables.forEach(token => token.draw());
    });
});

//Автоматически применяет образ при добавлении связанного эффекта на актера.
Hooks.on("createItem", async (item, options, userId) => {
    if (game.userId !== userId || item.type !== 'effect' || !item.actor) return;
    const actor = item.actor;
    const effectUuid = item.sourceId;
    if (!effectUuid) return;

    const automations = actor.getFlag('pf2e-token-pack', 'automations') || [];
    const rule = automations.find(r => r.uuid === effectUuid);
    if (!rule) return;

    ui.notifications.info(game.i18n.format("Disguise.AutomationRuleFound", { name: item.name }));
    const revertDisguiseId = actor.getFlag('pf2e-token-pack', 'lastAppliedDisguiseId') || 'original';
    await item.setFlag('pf2e-token-pack', 'revertDisguiseId', revertDisguiseId);
    
    const disguiseToApply = (actor.getFlag('pf2e-token-pack', 'disguises') || []).find(d => d.id === rule.disguiseId);
    if (!disguiseToApply) return;

    const controlled = canvas.tokens.controlled;
    let targetToken = (controlled.length === 1 && controlled[0].actor === actor)
        ? controlled[0].document
        : actor.getActiveTokens()[0]?.document;

    await requestDisguiseChange({
        actor: actor, token: targetToken, sheet: actor.sheet,
        sourceType: 'flag', sourceId: rule.disguiseId, type: disguiseToApply.type,
        options: { applySize: disguiseToApply.shouldApplySize }
    });
});

//Автоматически возвращает предыдущий образ при удалении связанного эффекта.
Hooks.on("deleteItem", async (item, options, userId) => {
    if (game.userId !== userId || item.type !== 'effect' || !item.actor) return;
    const revertDisguiseId = item.getFlag('pf2e-token-pack', 'revertDisguiseId');
    if (!revertDisguiseId) return;

    const actor = item.actor;
    const disguiseToRevert = (actor.getFlag('pf2e-token-pack', 'disguises') || []).find(d => d.id === revertDisguiseId);
    if (!disguiseToRevert) return;
    
    ui.notifications.info(game.i18n.format("Disguise.AutomationRevertingTo", { name: disguiseToRevert.name }));

    const controlled = canvas.tokens.controlled;
    let targetToken = (controlled.length === 1 && controlled[0].actor === actor)
        ? controlled[0].document
        : actor.getActiveTokens()[0]?.document;

    await requestDisguiseChange({
        actor: actor, token: targetToken, sheet: actor.sheet,
        sourceType: 'flag', sourceId: revertDisguiseId, type: disguiseToRevert.type,
        options: { applySize: disguiseToRevert.shouldApplySize }
    });
});

//Регистрирует настройки модуля и сокеты при инициализации мира.
Hooks.on('init', () => {
    game.settings.register('pf2e-token-pack', 'highlightColor', {
        name: game.i18n.localize("Disguise.HighlightColorName"),
        hint: game.i18n.localize("Disguise.HighlightColorHint"),
        scope: 'world', config: true, type: String, default: "#9400D3",
        onChange: () => { if (canvas?.ready) canvas.tokens.placeables.forEach(t => t.draw()); }
    });

    game.settings.register('pf2e-token-pack', 'highlightStyle', {
        name: game.i18n.localize("Disguise.HighlightStyleName"),
        hint: game.i18n.localize("Disguise.HighlightStyleHint"),
        scope: 'world', config: true, type: String, default: "rounded-rect",
        choices: {
            "rounded-rect": game.i18n.localize("Disguise.HighlightStyleRoundedRect"),
            "square": game.i18n.localize("Disguise.HighlightStyleSquare"),
            "circle": game.i18n.localize("Disguise.HighlightStyleCircle"),
            "corners": game.i18n.localize("Disguise.HighlightStyleCorners"),
            "ticks": game.i18n.localize("Disguise.HighlightStyleTicks"),
            "corner-ticks": game.i18n.localize("Disguise.HighlightStyleCornerTicks")
        },
        onChange: () => { if (canvas?.ready) canvas.tokens.placeables.forEach(t => t.draw()); }
    });

    game.settings.register('pf2e-token-pack', 'hudPosition', {
        name: game.i18n.localize("Disguise.HUDPositionName"),
        hint: game.i18n.localize("Disguise.HUDPositionHint"),
        scope: 'world', config: true, type: String, default: "top-right",
        choices: {
            "top-right": game.i18n.localize("Disguise.TopRight"),
            "bottom-right": game.i18n.localize("Disguise.BottomRight"),
            "top-left": game.i18n.localize("Disguise.TopLeft"),
            "bottom-left": game.i18n.localize("Disguise.BottomLeft")
        }
    });

    game.socket.on('module.pf2e-token-pack', async (data) => {
        if (!game.user.isGM) return;
        const targetActor = getAuthoritativeActor(data.actorId, data.tokenId);
        if (!targetActor) {
            console.error(game.i18n.format("Disguise.ConsoleErrorActorForSocketNotFound", data));
            return;
        }
        const targetToken = data.tokenId ? canvas.scene?.tokens.get(data.tokenId) : null;
        const flagKey = data.sourceId === 'original'
            ? (data.type === 'full' ? 'data_original' : 'data_original_visuals')
            : `data_${data.sourceId}`;
        const sourceData = targetActor.getFlag('pf2e-token-pack', flagKey);

        if (!sourceData) {
            console.error(game.i18n.format("Disguise.ConsoleErrorSourceDataNotFound", { sourceId: data.sourceId, actorName: targetActor.name }));
            return;
        }
        if (data.type === 'full') {
            await applyFullDisguise(targetActor, sourceData, targetToken, targetActor.sheet, data.options, data.sourceId);
        } else {
            await applyVisualDisguise(targetActor, sourceData, targetToken, targetActor.sheet, data.options, data.sourceId);
        }
    });
});

//Синхронизирует изменения с токена на сцене на прототип актера.
Hooks.on("updateToken", async (tokenDoc, changes, options, userId) => {
    if (game.userId !== userId) return;
    const actor = tokenDoc.actor;
    if (!actor || actor.type !== 'character' || !tokenDoc.actorLink) {
        const authoritativeActor = getAuthoritativeActor(tokenDoc.actorId, tokenDoc.id);
        if (authoritativeActor?.isOwner && (authoritativeActor.getFlag("pf2e-token-pack", "disguises") || []).length > 0) {
            await syncDisguiseProperties(authoritativeActor, tokenDoc.toObject());
        }
        return;
    }
    
    if (options.syncFromActor) return;

    const prototypeChanges = {};
    const nonPrototypeKeys = ["x", "y", "elevation", "rotation", "hidden", "locked"];
    for (const key in changes) {
        if (!nonPrototypeKeys.includes(key.split('.')[0])) {
            prototypeChanges[key] = changes[key];
        }
    }

    if (!foundry.utils.isEmpty(prototypeChanges)) {
        await actor.update({ "prototypeToken": prototypeChanges });
    }
});

//Синхронизирует изменения прототипа актера с образами и связанными токенами на сцене.
Hooks.on("updateActor", async (actor, changes, options, userId) => {
    if (game.userId !== userId || !actor.isOwner || !foundry.utils.hasProperty(changes, "prototypeToken")) return;

    if ((actor.getFlag("pf2e-token-pack", "disguises") || []).length > 0) {
        await syncDisguiseProperties(actor, actor.prototypeToken.toObject());
    }

    if (actor.type === 'character') {
        const linkedTokens = actor.getActiveTokens().filter(t => t.document.actorLink);
        if (linkedTokens.length > 0) {
            const expandedChanges = foundry.utils.expandObject(changes.prototypeToken);
            const updates = linkedTokens.map(t => ({ _id: t.id, ...expandedChanges }));
            await canvas.scene.updateEmbeddedDocuments("Token", updates, { syncFromActor: true });
        }
    }
});

//Добавляет кнопку "Обновить внешность" в окно настроек токена.
Hooks.on("renderTokenConfig", (app, html, data) => {
    enhanceTokenConfigWindow(app, html);
});

//Добавляет кнопку "Обновить внешность" в окно настроек прототипа токена.
Hooks.on("renderPrototypeTokenConfig", (app, html) => {
    enhanceTokenConfigWindow(app, html);
});