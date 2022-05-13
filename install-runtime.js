const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
await Promise.all(['「小件件」开发环境.js', 'ChinaTelecomPanel.js'].map(async js => {
    const REQ = new Request(`@@host@@/Scripts/${encodeURIComponent(js)}`);
// await Promise.all(['Weather-Lambdaexpression.js'].map(async js => {
//     const REQ = new Request(`@@host@@/Dist/${encodeURIComponent(js)}`);
    const RES = await REQ.load();
    FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), js), RES);
}));
FILE_MGR.remove(module.filename);
Safari.open("scriptable:///open?scriptName=" + encodeURIComponent('ChinaTelecomPanel'));


