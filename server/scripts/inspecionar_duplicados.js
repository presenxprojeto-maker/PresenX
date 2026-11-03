const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('presenx.db');

db.all("SELECT id, nome FROM disciplinas WHERE nome LIKE '%ioqui%' OR nome LIKE '%lgoritmo%' OR nome LIKE '%natomi%' OR nome LIKE '%iosseg%' OR nome LIKE '%Coleta%' ORDER BY nome", (err, rows) => {
  console.log('Disciplinas similares:');
  (rows || []).forEach(r => console.log('  [' + r.id + '] ' + r.nome));

  db.all("SELECT id, uid, nome FROM usuarios WHERE nome LIKE '%VANESSA%' OR nome LIKE '%JOSUE%' OR nome LIKE '%JOSUE%' OR nome LIKE '%WAGNER%' OR nome LIKE '%IVAN%' OR nome LIKE '%MARCIA%' OR nome LIKE '%PROFESSOR H%' ORDER BY nome", (err2, rows2) => {
    console.log('\nProfessores similares:');
    (rows2 || []).forEach(r => console.log('  [' + r.uid + '] ' + r.nome));
    db.close();
  });
});
