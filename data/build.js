// cd C:\Users\Metof\AppData\Local\FoundryVTT\Data\modules\pf2e-token-pack\data
// node build.js

const fs = require('fs');
const path = require('path');

// Путь к вашему основному скрипту с настройками
// Убедитесь, что этот путь верен
const settingsScriptPath = path.resolve(__dirname, 'scripts', 'Setting-Compendiums.js');
const sourceFolder = path.join(__dirname, '_sources');
const outputFile = path.join(__dirname, '_sources', 'bestiaries-master.json');

console.log('Начинаю сборку эталонного файла bestiaries-master.json...');

// --- ИЗМЕНЕНИЕ: Новая рекурсивная функция для поиска ВСЕХ файлов ---
const findAllJsonFiles = (dir, allFiles = []) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            // Если это папка, запускаем поиск внутри нее
            findAllJsonFiles(filePath, allFiles);
        } else {
            // Если это файл и он является JSON, добавляем его в список
            if (path.extname(file).toLowerCase() === '.json') {
                allFiles.push(filePath);
            }
        }
    });

    return allFiles;
};
// --- КОНЕЦ ИЗМЕНЕНИЯ ---


try {
    // Читаем порядок ключей из скрипта настроек
    console.log(`Читаю порядок из: ${settingsScriptPath}`);
    const settingsScriptContent = fs.readFileSync(settingsScriptPath, 'utf8');
    
    // ✅✅✅ ВОТ ИЗМЕНЕНИЕ ✅✅✅
    // Старая строка: const keysBlockMatch = settingsScriptContent.match(/this\.keys\s*=\s*\[([\s\S]*?)\];/);
    const keysBlockMatch = settingsScriptContent.match(/static get KEYS\(\)\s*{\s*return\s*\[([\s\S]*?)\];/);
    // ✅✅✅ КОНЕЦ ИЗМЕНЕНИЯ ✅✅✅

    if (!keysBlockMatch) throw new Error('Не удалось найти блок `static get KEYS()` в файле настроек.');
    
    const keysBlock = keysBlockMatch[1];
    const keyRegex = /key:\s*"([^"]+)"/g;
    const orderedKeys = [];
    let match;
    while ((match = keyRegex.exec(keysBlock)) !== null) {
        orderedKeys.push(match[1]);
    }
    
    if (orderedKeys.length === 0) throw new Error('Не удалось извлечь ключи из блока `static get KEYS()`.');
    console.log(`Найдено ${orderedKeys.length} ключей для соблюдения порядка.`);

    // --- ИЗМЕНЕНИЕ: Используем новую функцию для поиска файлов ---
    // Она вернет полный путь к каждому найденному JSON файлу
    const allJsonFilePaths = findAllJsonFiles(sourceFolder).filter(filePath => 
        path.basename(filePath) !== 'bestiaries-master.json'
    );
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    if (allJsonFilePaths.length === 0) {
        console.warn(`В папке ${sourceFolder} и ее подпапках не найдено исходных JSON файлов.`);
        return;
    }

    const allData = {};
    allJsonFilePaths.forEach(filePath => {
        console.log(`- Читаю ${path.relative(__dirname, filePath)}...`); // Показываем относительный путь для краткости
        const fileContent = fs.readFileSync(filePath, 'utf8');
        Object.assign(allData, JSON.parse(fileContent));
    });

    const mergedData = {};
    console.log('\nФормирую итоговый файл в заданном порядке...');
    orderedKeys.forEach(key => {
        if (allData.hasOwnProperty(key)) {
            mergedData[key] = allData[key];
        } else {
            console.warn(`! Внимание: ключ "${key}" из списка порядка не найден в исходных файлах.`);
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2));
    console.log(`\nСборка успешно завершена! Файл сохранен в:\n${outputFile}`);

} catch (error) {
    console.error('Произошла ошибка во время сборки:', error);
}