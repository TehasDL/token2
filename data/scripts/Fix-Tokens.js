// Класс приложения для отображения главного меню модуля.
class MainMenuForm extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static PARTS = {
        content: { template: "modules/pf2e-token-pack/data/templates/Fix-Tokens.hbs" }
    };

    static get DEFAULT_OPTIONS() {
        return {
            id: "fix-tokens-main-menu",
            window: { title: game.i18n.localize("FixTokens.MainMenuTitle") },
            classes: ["pf2e-token-pack"],
            width: "auto", 
            height: "auto"
        };
    }

    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        const menuItems = [
            { key: 'ExcludedTypes', action: 'manage-types' },
            { key: 'ExcludedActors', action: 'manage-actors' }
        ];
        return foundry.utils.mergeObject(ctx, { 
            isMainMenu: true, 
            menuItems: menuItems
        });
    }
    
    async _postRender(context, options) {
        await super._postRender?.(context, options);
        const html = $(this.element);
        html.find('button[data-action]').on('click', this._onButtonClick.bind(this));
    }

    async _onButtonClick(event) {
        event.preventDefault();
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case 'manage-types': new ExcludeTypesForm().render(true); break;
            case 'manage-actors': new ExcludeActorsForm().render(true); break;
            case 'run-fix': 
                await this.close(); 
                runMasterUpdateScript();
                break;
        }
    }
}

// Класс приложения для формы исключения актеров по их типу.
class ExcludeTypesForm extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.setting = 'fix-tokens-excluded-types';
    }

    static PARTS = {
        content: { template: "modules/pf2e-token-pack/data/templates/Fix-Tokens.hbs" }
    };

    static get DEFAULT_OPTIONS() {
        return {
            id: 'fix-tokens-types-form',
            window: { title: game.i18n.localize("FixTokens.ExcludeTypesTitle") },
            classes: ["pf2e-token-pack", "exclusion-form"],
            width: "auto", height: "auto"
        };
    }

    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        const saved = game.settings.get('pf2e-token-pack', this.setting);
        const allTypes = [...new Set(game.actors.map(a => a.type).filter(t => t && t !== 'party'))].sort();
        const getLocalizedType = (type) => game.i18n.localize(`FixTokens.ActorTypes.${type}`) ?? type;

        return foundry.utils.mergeObject(ctx, {
            isTypesForm: true,
            header: game.i18n.localize("FixTokens.ExcludeTypesHeader"),
            options: allTypes.map(type => ({ id: type, name: getLocalizedType(type), checked: saved.includes(type) }))
        });
    }

    async _postRender(context, options) {
        await super._postRender?.(context, options);
        const html = $(this.element);

        html.find('button.form-submit').on('click', async (event) => {
            event.preventDefault();
            const form = html.find('form')[0];
            if (form) {
                try {
                    const formData = new foundry.applications.ux.FormDataExtended(form).object;
                    const selectedIds = Object.keys(formData).filter(key => formData[key]);
                    await game.settings.set('pf2e-token-pack', this.setting, selectedIds);
                } catch (e) {
                    console.error(game.i18n.localize("FixTokens.ConsoleErrorSettingsSave"), e);
                    ui.notifications.error(game.i18n.localize("FixTokens.ErrorSaveChanges"));
                }
            }
            this.close();
        });
    }
}

// Класс приложения для формы ручного исключения актеров.
class ExcludeActorsForm extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.setting = 'fix-tokens-manual-excluded-actors';
    }

    static PARTS = {
        content: { template: "modules/pf2e-token-pack/data/templates/Fix-Tokens.hbs" }
    };

    static get DEFAULT_OPTIONS() {
        return {
            id: 'fix-tokens-actors-form',
            window: { title: game.i18n.localize("FixTokens.ExcludeActorsTitle") },
            classes: ["pf2e-token-pack", "exclusion-form"],
            width: "auto", height: "auto"
        };
    }

    buildActorTree() {
        let saved = game.settings.get('pf2e-token-pack', this.setting);
        const defaultSet = game.settings.get('pf2e-token-pack', 'actor-default-set');
        const partyForDefault = game.actors.find(a => a.type === 'party');

        if (!defaultSet && partyForDefault) {
            const idsToDefault = [partyForDefault.id, ...partyForDefault.members.map(m => m.id)];
            saved = Array.from(new Set([...saved, ...idsToDefault]));
        }

        const nodeMap = new Map();
        const party = game.actors.find(a => a.type === 'party');
        const partyMemberIds = new Set(party ? party.members.map(m => m.id) : []);
        const folders = game.folders.filter(f => f.type === 'Actor');
        const actors = game.actors.filter(a => a.type !== "party" && !partyMemberIds.has(a.id));

        folders.forEach(f => nodeMap.set(f.id, { id: f.id, name: f.name, checked: saved.includes(f.id), children: [], isFolder: true, parentId: f.folder?.id || null, sort: f.sort }));
        actors.forEach(a => nodeMap.set(a.id, { id: a.id, name: a.name, checked: saved.includes(a.id), children: [], isActor: true, parentId: a.folder?.id || null, sort: a.sort }));
        
        if (party) {
            const partyNode = { id: party.id, name: party.name, checked: saved.includes(party.id), children: [], isFolder: true, parentId: null, sort: -1 };
            party.members.forEach(member => {
                const memberNode = { id: member.id, name: member.name, checked: saved.includes(member.id), children: [], isActor: true, parentId: party.id, sort: member.sort };
                partyNode.children.push(memberNode);
            });
            nodeMap.set(party.id, partyNode);
        }

        const tree = [];
        nodeMap.forEach(node => {
            const parent = node.parentId ? nodeMap.get(node.parentId) : null;
            if (parent) { parent.children.push(node); } else { tree.push(node); }
        });
        
        const sortRecursive = (nodes) => {
            nodes.sort((a, b) => (a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1) || a.sort - b.sort || a.name.localeCompare(b.name, "ru"));
            nodes.forEach(node => sortRecursive(node.children));
        };
        sortRecursive(tree);
        return tree;
    }

    async _prepareContext(options) {
        const ctx = await super._prepareContext(options);
        return foundry.utils.mergeObject(ctx, {
            isActorsForm: true,
            header: game.i18n.localize("FixTokens.ExcludeActorsHeader"),
            options: this.buildActorTree()
        });
    }

    async _postRender(context, options) {
        await super._postRender?.(context, options);
        const html = $(this.element);

        html.find('button.form-submit').on('click', async (event) => {
            event.preventDefault();
            const form = html.find('form')[0];
            if (form) {
                try {
                    const formData = new foundry.applications.ux.FormDataExtended(form).object;
                    const selectedIds = Object.keys(formData).filter(key => formData[key]);
                    await game.settings.set('pf2e-token-pack', this.setting, selectedIds);
                    if (!game.settings.get('pf2e-token-pack', 'actor-default-set')) {
                        await game.settings.set('pf2e-token-pack', 'actor-default-set', true);
                    }
                } catch (e) {
                    console.error(game.i18n.localize("FixTokens.ConsoleErrorExclusionsSave"), e);
                    ui.notifications.error(game.i18n.localize("FixTokens.ErrorSaveChanges"));
                }
            }
            this.close();
        });
        
        html.find('form').on("change", 'input[type="checkbox"]', (event) => {
            const checkbox = $(event.currentTarget);
            const details = checkbox.closest('details');
            if (details.length) {
                details.find('.tree-node input[type="checkbox"]').prop('checked', checkbox.prop('checked'));
            }
        });

        html.find('#actor-search').on('input', (event) => {
            const searchTerm = $(event.currentTarget).val().toLowerCase().trim();
            const allNodes = html.find('.tree-node');
            if (!searchTerm) {
                allNodes.show();
                return;
            }
            const visibleIds = new Set();
            allNodes.each((i, el) => {
                const node = $(el);
                const isLeaf = !node.find('.tree-node').length;
                const nodeName = String(node.data('name') || '').toLowerCase();
                if (isLeaf && nodeName.includes(searchTerm)) {
                    visibleIds.add(String(node.data('id')));
                    node.parents('.tree-node').each((j, parent) => {
                        visibleIds.add(String($(parent).data('id')));
                    });
                }
            });
            allNodes.each((i, el) => {
                const node = $(el);
                if (visibleIds.has(String(node.data('id')))) {
                    node.show();
                    node.parents('details').prop('open', true);
                } else {
                    node.hide();
                }
            });
        });
    }
}

// Функция для проверки, исключен ли актер настройками типов.
function isActorExcludedBySettings(actor) {
    const excludedTypes = game.settings.get('pf2e-token-pack', 'fix-tokens-excluded-types');
    return excludedTypes.includes(actor.type);
}

// Вспомогательная функция для точного сравнения визуальных данных.
function getCleanVisuals(data, isOriginal = false, originalActor = null) {
    const pt = data.prototypeToken;
    const originalPT = isOriginal ? originalActor.prototypeToken.toObject() : null;

    return {
        name: data.name,
        img: data.img,
        width: pt.width,
        height: pt.height,
        scaleX: pt.texture.scaleX,
        scaleY: pt.texture.scaleY,
        ringEnabled: pt.ring?.enabled ?? false,
        ringSubjectScale: pt.ring?.subject?.scale ?? null,
        ringSubjectTexture: pt.ring?.subject?.texture ?? null,
        textureSrc: isOriginal ? (originalPT.ring?.enabled ? originalActor.img : originalPT.texture.src) : pt.texture.src
    };
}

// Главная функция, которая запускает все проверки последовательно.
async function runMasterUpdateScript() {
    const reportData = {
        standard: {
            actors: { success: [], failure: [] },
            tokens: { success: [], failure: [] }
        },
        disguise: {
            actors: { success: [], failure: [] },
            tokens: { success: [], failure: [] }
        }
    };

    await runUpdateScript(reportData);
    await runUpdateDisguisesForActors(reportData);
    await runUpdateDisguisesForTokens(reportData);

    generateReport(reportData);
}

// Основная функция, которая обновляет обычных актеров и их токены.
async function runUpdateScript(reportData) {
    const manualExcludedIds = game.settings.get('pf2e-token-pack', 'fix-tokens-manual-excluded-actors');

    for (const actor of game.actors.contents) {
        if (foundry.utils.hasProperty(actor.flags, 'pf2e-token-pack')) continue;
        if (isActorExcludedBySettings(actor) || manualExcludedIds.includes(actor.id) || actor.type === 'party') continue;
        
        let original = null;
        const source = actor._stats?.compendiumSource;
        if (source) { const doc = await fromUuid(source); if (doc?.pack) original = doc; }
        if (!original && source) { const match = source.match(/^Actor\.(\w{16})$/); if (match) { const actorId = match[1]; for (const pack of game.packs.filter(p => p.documentName === "Actor")) { if (pack.index.size === 0) await pack.getIndex({ fields: ["_id"] }); if (pack.index.has(actorId)) { original = await pack.getDocument(actorId); break; } } } }
        if (!original) { const babeleName = actor.flags?.babele?.originalName; if (babeleName) { for (const pack of game.packs.filter(p => p.documentName === "Actor")) { if (pack.index.size === 0) await pack.getIndex({ fields: ["name"] }); const entry = pack.index.find(i => i.name === babeleName); if (entry) { original = await pack.getDocument(entry._id); break; } } } }
        
        if (!original) {
            reportData.standard.actors.failure.push({ name: actor.name, reason: game.i18n.localize("FixTokens.SourceNotFound") });
            continue;
        }
        
        const currentPT = actor.prototypeToken.toObject();
        const originalPT = original.prototypeToken.toObject();
        const updatedPT = foundry.utils.deepClone(currentPT);
        let needsPrototypeUpdate = false;
        
        if (currentPT.texture.scaleX !== originalPT.texture.scaleX) { updatedPT.texture.scaleX = originalPT.texture.scaleX; needsPrototypeUpdate = true; }
        if (currentPT.texture.scaleY !== originalPT.texture.scaleY) { updatedPT.texture.scaleY = originalPT.texture.scaleY; needsPrototypeUpdate = true; }
        if (foundry.utils.getProperty(updatedPT, "flags.pf2e.autoscale") !== false) { foundry.utils.setProperty(updatedPT, "flags.pf2e.autoscale", false); needsPrototypeUpdate = true; }
        const originalRingEnabled = originalPT.ring?.enabled ?? false;
        if (originalRingEnabled) {
            if (updatedPT.texture.src !== original.img) { updatedPT.texture.src = original.img; needsPrototypeUpdate = true; }
            if (!updatedPT.ring?.enabled) { foundry.utils.setProperty(updatedPT, "ring.enabled", true); needsPrototypeUpdate = true; }
            if (originalPT.ring?.subject) {
                if (currentPT.ring?.subject?.scale !== originalPT.ring.subject.scale) { foundry.utils.setProperty(updatedPT, "ring.subject.scale", originalPT.ring.subject.scale); needsPrototypeUpdate = true; }
                if (currentPT.ring?.subject?.texture !== originalPT.ring.subject.texture) { foundry.utils.setProperty(updatedPT, "ring.subject.texture", originalPT.ring.subject.texture); needsPrototypeUpdate = true; }
            }
        } else {
            if (updatedPT.texture.src !== originalPT.texture.src) { updatedPT.texture.src = originalPT.texture.src; needsPrototypeUpdate = true; }
            if (updatedPT.ring?.enabled) { foundry.utils.setProperty(updatedPT, "ring.enabled", false); needsPrototypeUpdate = true; }
        }

        const actorUpdateData = {};
        if (actor.img !== original.img) { actorUpdateData.img = original.img; }
        if (needsPrototypeUpdate) { actorUpdateData.prototypeToken = updatedPT; }

        if (Object.keys(actorUpdateData).length > 0) {
            await actor.update(actorUpdateData);
            reportData.standard.actors.success.push(actor.name);
        }

        for (const scene of game.scenes) {
            for (const tokenDoc of scene.tokens.filter(t => t.actorId === actor.id)) {
                if (foundry.utils.hasProperty(tokenDoc.flags, 'pf2e-token-pack') || foundry.utils.hasProperty(tokenDoc.delta?.flags, 'pf2e-token-pack')) continue;
                
                const currentToken = tokenDoc.toObject();
                const tokenUpdateData = {};
                 if (currentToken.texture.scaleX !== originalPT.texture.scaleX) tokenUpdateData["texture.scaleX"] = originalPT.texture.scaleX;
                if (currentToken.texture.scaleY !== originalPT.texture.scaleY) tokenUpdateData["texture.scaleY"] = originalPT.texture.scaleY;
                if (foundry.utils.getProperty(currentToken, "flags.pf2e.autoscale") !== false) tokenUpdateData["flags.pf2e.autoscale"] = false;
                if (originalRingEnabled) {
                    if (currentToken.texture.src !== original.img) tokenUpdateData["texture.src"] = original.img;
                    if (!(currentToken.ring?.enabled)) tokenUpdateData["ring.enabled"] = true;
                    if (originalPT.ring?.subject) {
                        if (currentToken.ring?.subject?.scale !== originalPT.ring.subject.scale) tokenUpdateData["ring.subject.scale"] = originalPT.ring.subject.scale;
                        if (currentToken.ring?.subject?.texture !== originalPT.ring.subject.texture) tokenUpdateData["ring.subject.texture"] = originalPT.ring.subject.texture;
                    }
                } else {
                    if (currentToken.texture.src !== originalPT.texture.src) tokenUpdateData["texture.src"] = originalPT.texture.src;
                    if (currentToken.ring?.enabled) tokenUpdateData["ring.enabled"] = false;
                }
                if (!tokenDoc.actorLink && tokenDoc.actor.img !== original.img) {
                    tokenUpdateData["delta.img"] = original.img;
                }

                if (Object.keys(tokenUpdateData).length > 0) {
                    await tokenDoc.update(tokenUpdateData);
                    reportData.standard.tokens.success.push({ name: tokenDoc.name, sceneName: scene.name });
                }
            }
        }
    }
}

// Обновляет данные образов и внешний вид АКTЕРОВ в боковой панели.
async function runUpdateDisguisesForActors(reportData) {
    for (const actor of game.actors.contents) {
        const masterList = actor.getFlag('pf2e-token-pack', 'disguises');
        if (!masterList || masterList.length === 0) continue;

        let actorDataChanged = false;
        const updates = {};
        const updatedDisguiseIds = new Set(); 

        for (const disguise of masterList) {
            const flagKey = disguise.id === 'original' ? 'data_original_visuals' : `data_${disguise.id}`;
            const savedData = actor.getFlag('pf2e-token-pack', flagKey);
            if (!savedData?.sourceUuid) continue;

            const sourceId = savedData.sourceUuid;
            let original = null;
            for (const pack of game.packs.filter(p => p.documentName === "Actor")) {
                if (!pack.index.size) await pack.getIndex({ fields: ["_id"] });
                if (pack.index.has(sourceId)) {
                    original = await pack.getDocument(sourceId);
                    break;
                }
            }

            if (!original) {
                const name = game.i18n.format("FixTokens.ReportActorToDisguise", { actorName: actor.name, disguiseName: savedData.name });
                const reason = game.i18n.localize("FixTokens.SourceNotFound");
                reportData.disguise.actors.failure.push({ name, reason });
                continue;
            }

            const updatedDisguiseData = foundry.utils.deepClone(savedData);
            const originalPT = original.prototypeToken.toObject();
            let needsUpdate = false;
            
            if (updatedDisguiseData.name !== original.name) { updatedDisguiseData.name = original.name; disguise.name = original.name; needsUpdate = true; }
            if (updatedDisguiseData.img !== original.img) { updatedDisguiseData.img = original.img; needsUpdate = true; }
            const targetPT = updatedDisguiseData.prototypeToken;
            if (targetPT.texture.scaleX !== originalPT.texture.scaleX) { targetPT.texture.scaleX = originalPT.texture.scaleX; needsUpdate = true; }
            if (targetPT.texture.scaleY !== originalPT.texture.scaleY) { targetPT.texture.scaleY = originalPT.texture.scaleY; needsUpdate = true; }
            if (originalPT.ring?.subject) {
                if (!targetPT.ring) targetPT.ring = {};
                if (!targetPT.ring.subject) targetPT.ring.subject = {};
                if (targetPT.ring.subject.scale !== originalPT.ring.subject.scale) { targetPT.ring.subject.scale = originalPT.ring.subject.scale; needsUpdate = true; }
                if (targetPT.ring.subject.texture !== originalPT.ring.subject.texture) { targetPT.ring.subject.texture = originalPT.ring.subject.texture; needsUpdate = true; }
            }
            if ((targetPT.ring?.enabled ?? false) !== (originalPT.ring?.enabled ?? false)) {
                if (!targetPT.ring) targetPT.ring = {};
                targetPT.ring.enabled = originalPT.ring?.enabled ?? false;
                needsUpdate = true;
            }
            const originalRingEnabled = originalPT.ring?.enabled ?? false;
            if (originalRingEnabled) {
                if (targetPT.texture.src !== original.img) { targetPT.texture.src = original.img; needsUpdate = true; }
            } else {
                if (targetPT.texture.src !== originalPT.texture.src) { targetPT.texture.src = originalPT.texture.src; needsUpdate = true; }
            }
            
            if (needsUpdate) {
                updates[`flags.pf2e-token-pack.${flagKey}`] = updatedDisguiseData;
                actorDataChanged = true;
                updatedDisguiseIds.add(disguise.id);
                reportData.disguise.actors.success.push({ actorName: actor.name, disguiseName: updatedDisguiseData.name });
            }
        }
        
        if (actorDataChanged) {
            updates['flags.pf2e-token-pack.disguises'] = masterList;
            await actor.update(updates);

            const activeDisguiseId = actor.getFlag('pf2e-token-pack', 'lastAppliedDisguiseId');
            if (activeDisguiseId && updatedDisguiseIds.has(activeDisguiseId)) {
                const activeDisguise = (actor.getFlag('pf2e-token-pack', 'disguises') || []).find(d => d.id === activeDisguiseId);
                if (activeDisguise) {
                    const flagKey = activeDisguiseId === 'original' ? 'data_original_visuals' : `data_${activeDisguiseId}`;
                    const newVisualData = actor.getFlag('pf2e-token-pack', flagKey);
                    if (newVisualData) {
                        const actorUpdatePayload = { img: newVisualData.img, prototypeToken: newVisualData.prototypeToken };
                        if (activeDisguise.shouldApplySize && newVisualData.system?.traits?.size) {
                            actorUpdatePayload['system.traits.size'] = newVisualData.system.traits.size;
                        }
                        await actor.update(actorUpdatePayload);
                    }
                }
            }
        }
    }
}

// Обновляет данные образов и принудительно обновляет вид ТОКЕНОВ на сценах.
async function runUpdateDisguisesForTokens(reportData) {
    for (const scene of game.scenes) {
        for (const tokenDoc of scene.tokens) {
            const tokenFlags = foundry.utils.getProperty(tokenDoc, "delta.flags.pf2e-token-pack");
            const masterList = tokenFlags?.disguises;
            if (!tokenFlags || !masterList) continue;

            let tokenDataChanged = false;
            const tokenUpdatePayload = {};
            const updatedMasterList = foundry.utils.deepClone(masterList);
            const updatedDisguiseIds = new Set();

            for (const disguise of updatedMasterList) {
                const flagKey = disguise.id === 'original' ? 'data_original_visuals' : `data_${disguise.id}`;
                const savedData = tokenFlags[flagKey];
                if (!savedData?.sourceUuid) continue;

                const sourceId = savedData.sourceUuid;
                let original = null;
                for (const pack of game.packs.filter(p => p.documentName === "Actor")) {
                    if (!pack.index.size) await pack.getIndex({ fields: ["_id"] });
                    if (pack.index.has(sourceId)) {
                        original = await pack.getDocument(sourceId);
                        break;
                    }
                }

                if (!original) {
                    reportData.disguise.tokens.failure.push({ 
                        tokenName: tokenDoc.name, 
                        sceneName: scene.name, 
                        disguiseName: savedData.name, 
                        reason: game.i18n.localize("FixTokens.SourceNotFound")
                    });
                    continue;
                }
                
                const updatedDisguiseData = foundry.utils.deepClone(savedData);
                const originalPT = original.prototypeToken.toObject();
                let needsUpdate = false;
                
                if (updatedDisguiseData.name !== original.name) { updatedDisguiseData.name = original.name; disguise.name = original.name; needsUpdate = true; }
                if (updatedDisguiseData.img !== original.img) { updatedDisguiseData.img = original.img; needsUpdate = true; }
                const targetPT = updatedDisguiseData.prototypeToken;
                if (targetPT.texture.scaleX !== originalPT.texture.scaleX) { targetPT.texture.scaleX = originalPT.texture.scaleX; needsUpdate = true; }
                if (targetPT.texture.scaleY !== originalPT.texture.scaleY) { targetPT.texture.scaleY = originalPT.texture.scaleY; needsUpdate = true; }
                if (originalPT.ring?.subject) {
                    if (!targetPT.ring) targetPT.ring = {};
                    if (!targetPT.ring.subject) targetPT.ring.subject = {};
                    if (targetPT.ring.subject.scale !== originalPT.ring.subject.scale) { targetPT.ring.subject.scale = originalPT.ring.subject.scale; needsUpdate = true; }
                    if (targetPT.ring.subject.texture !== originalPT.ring.subject.texture) { targetPT.ring.subject.texture = originalPT.ring.subject.texture; needsUpdate = true; }
                }
                if ((targetPT.ring?.enabled ?? false) !== (originalPT.ring?.enabled ?? false)) {
                    if (!targetPT.ring) targetPT.ring = {};
                    targetPT.ring.enabled = originalPT.ring?.enabled ?? false;
                    needsUpdate = true;
                }
                const originalRingEnabled = originalPT.ring?.enabled ?? false;
                if (originalRingEnabled) {
                    if (targetPT.texture.src !== original.img) { targetPT.texture.src = original.img; needsUpdate = true; }
                } else {
                    if (targetPT.texture.src !== originalPT.texture.src) { targetPT.texture.src = originalPT.texture.src; needsUpdate = true; }
                }
                
                if (needsUpdate) {
                    tokenUpdatePayload[`delta.flags.pf2e-token-pack.${flagKey}`] = updatedDisguiseData;
                    tokenDataChanged = true;
                    updatedDisguiseIds.add(disguise.id);
                    reportData.disguise.tokens.success.push({ tokenName: tokenDoc.name, sceneName: scene.name, disguiseName: updatedDisguiseData.name });
                }
            }
            
            if (tokenDataChanged) {
                tokenUpdatePayload['delta.flags.pf2e-token-pack.disguises'] = updatedMasterList;
                await tokenDoc.update(tokenUpdatePayload);

                const tokenActiveDisguiseId = tokenDoc.actor?.getFlag('pf2e-token-pack', 'lastAppliedDisguiseId');
                if (tokenActiveDisguiseId && updatedDisguiseIds.has(tokenActiveDisguiseId)) {
                    const activeDisguise = updatedMasterList.find(d => d.id === tokenActiveDisguiseId);
                    if (activeDisguise) {
                        const flagKey = tokenActiveDisguiseId === 'original' ? 'data_original_visuals' : `data_${tokenActiveDisguiseId}`;
                        const newVisualData = tokenDoc.actor.getFlag('pf2e-token-pack', flagKey);

                        if (newVisualData) {
                            const visualUpdatePayload = {
                                'texture.src': newVisualData.prototypeToken.texture.src,
                                'texture.scaleX': newVisualData.prototypeToken.texture.scaleX,
                                'texture.scaleY': newVisualData.prototypeToken.texture.scaleY,
                                'ring': newVisualData.prototypeToken.ring,
                                'delta.img': newVisualData.img
                            };
                            if (activeDisguise.shouldApplySize) {
                                visualUpdatePayload.width = newVisualData.prototypeToken.width;
                                visualUpdatePayload.height = newVisualData.prototypeToken.height;
                            }
                            await tokenDoc.update(visualUpdatePayload);
                        }
                    }
                }
            }
        }
    }
}

// Генерирует единый, структурированный и "умный" отчет в консоли.
function generateReport(reportData) {
    const { standard, disguise } = reportData;

    const hasSuccess = standard.actors.success.length > 0 || standard.tokens.success.length > 0 || disguise.actors.success.length > 0 || disguise.tokens.success.length > 0;
    const hasFailure = standard.actors.failure.length > 0 || disguise.actors.failure.length > 0 || disguise.tokens.failure.length > 0;

    if (!hasSuccess && !hasFailure) {
        ui.notifications.info(game.i18n.localize("FixTokens.ReportAllOk"));
        return;
    }

    const title = game.i18n.localize("FixTokens.ReportConsoleTitle");
    console.groupCollapsed(`%c${title}`, "color: #4CAF50; font-weight: bold; font-size: 14px;");

    const hasStandardUpdates = standard.actors.success.length > 0 || standard.actors.failure.length > 0 || standard.tokens.success.length > 0;
    if (hasStandardUpdates) {
        console.groupCollapsed(game.i18n.localize("FixTokens.ReportStandardEntities"));
        if (standard.actors.success.length > 0 || standard.actors.failure.length > 0) {
            console.groupCollapsed(game.i18n.localize("FixTokens.ReportSidebarActors"));
            if (standard.actors.success.length > 0) {
                console.groupCollapsed(game.i18n.format("FixTokens.ReportSuccess", {count: standard.actors.success.length}));
                standard.actors.success.forEach(name => console.log(name));
                console.groupEnd();
            }
            if (standard.actors.failure.length > 0) {
                console.groupCollapsed(game.i18n.format("FixTokens.ReportFailure", {count: standard.actors.failure.length}));
                standard.actors.failure.forEach(({ name, reason }) => console.log(`${name}: ${reason}`));
                console.groupEnd();
            }
            console.groupEnd();
        }
        if (standard.tokens.success.length > 0) {
            console.groupCollapsed(game.i18n.localize("FixTokens.ReportSceneTokens"));
            console.groupCollapsed(game.i18n.format("FixTokens.ReportSuccess", {count: standard.tokens.success.length}));
            const groupedByScene = standard.tokens.success.reduce((acc, { name, sceneName }) => {
                if (!acc[sceneName]) acc[sceneName] = [];
                acc[sceneName].push(name);
                return acc;
            }, {});
            for (const sceneName in groupedByScene) {
                console.log(game.i18n.format("FixTokens.ReportOnScene", { sceneName: sceneName, tokenNames: groupedByScene[sceneName].join(', ') }));
            }
            console.groupEnd();
            console.groupEnd();
        }
        console.groupEnd();
    }

    const hasDisguiseUpdates = disguise.actors.success.length > 0 || disguise.actors.failure.length > 0 || disguise.tokens.success.length > 0 || disguise.tokens.failure.length > 0;
    if (hasDisguiseUpdates) {
        console.groupCollapsed(game.i18n.localize("FixTokens.ReportDisguisedEntities"));
        if (disguise.actors.success.length > 0 || disguise.actors.failure.length > 0) {
            console.groupCollapsed(game.i18n.localize("FixTokens.ReportSidebarActors"));
            if (disguise.actors.success.length > 0) {
                console.groupCollapsed(game.i18n.format("FixTokens.ReportSuccessDisguisesUpdated", {count: disguise.actors.success.length}));
                const groupedByActor = disguise.actors.success.reduce((acc, { actorName, disguiseName }) => {
                    if (!acc[actorName]) acc[actorName] = [];
                    acc[actorName].push(disguiseName);
                    return acc;
                }, {});
                for (const actorName in groupedByActor) {
                    console.log(`› ${actorName}: [${groupedByActor[actorName].join(', ')}]`);
                }
                console.groupEnd();
            }
            if (disguise.actors.failure.length > 0) {
                console.groupCollapsed(game.i18n.format("FixTokens.ReportFailure", {count: disguise.actors.failure.length}));
                disguise.actors.failure.forEach(({ name, reason }) => console.log(name + ": " + reason));
                console.groupEnd();
            }
            console.groupEnd();
        }
        if (disguise.tokens.success.length > 0 || disguise.tokens.failure.length > 0) {
            console.groupCollapsed(game.i18n.localize("FixTokens.ReportSceneTokens"));
            if (disguise.tokens.success.length > 0) {
                console.groupCollapsed(game.i18n.format("FixTokens.ReportSuccessDisguisesUpdated", {count: disguise.tokens.success.length}));
                const groupedByToken = disguise.tokens.success.reduce((acc, { tokenName, sceneName, disguiseName }) => {
                    const key = game.i18n.format("FixTokens.ReportTokenOnScene", { tokenName, sceneName });
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(disguiseName);
                    return acc;
                }, {});
                for (const key in groupedByToken) {
                    console.log(`› ${key}: [${groupedByToken[key].join(', ')}]`);
                }
                console.groupEnd();
            }
            if (disguise.tokens.failure.length > 0) {
                console.groupCollapsed(game.i18n.format("FixTokens.ReportFailure", {count: disguise.tokens.failure.length}));
                disguise.tokens.failure.forEach(({ tokenName, sceneName, disguiseName, reason }) => {
                    console.log(game.i18n.format("FixTokens.ReportTokenDisguiseFailure", { tokenName, sceneName, disguiseName, reason }));
                });
                console.groupEnd();
            }
            console.groupEnd();
        }
        console.groupEnd();
    }
    
    console.groupEnd();
    ui.notifications.info(game.i18n.localize("FixTokens.ReportComplete"));
}

// Хук для регистрации настроек и меню модуля при инициализации мира.
Hooks.once("init", () => {
    game.settings.register("pf2e-token-pack", "fix-tokens-excluded-types", { 
        scope: "world", 
        config: false, 
        type: Array, 
        default: ["character", "hazard", "loot", "familiar", "vehicle"] 
    });

    game.settings.register("pf2e-token-pack", "fix-tokens-manual-excluded-actors", { 
        scope: "world", 
        config: false, 
        type: Array, 
        default: [] 
    });
    
    game.settings.register("pf2e-token-pack", "actor-default-set", { 
        scope: "world", 
        config: false, 
        type: Boolean, 
        default: false 
    });

    game.settings.registerMenu("pf2e-token-pack", "myScriptMenu", { 
        name: game.i18n.localize("FixTokens.MenuName"), 
        label: game.i18n.localize("FixTokens.MenuLabel"), 
        hint: game.i18n.localize("FixTokens.MenuHint"), 
        icon: "fas fa-cogs", 
        type: MainMenuForm, 
        restricted: true 
    });
});
